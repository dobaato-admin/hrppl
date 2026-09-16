// =============================================================================
// Resend transport
// =============================================================================
//
// The email pipeline in this repo is already complete and correct: templates
// render to HTML, `sendInternalEmail` checks suppression and per-user
// preferences, mints an unsubscribe token and enqueues onto pgmq, and
// `/lovable/email/queue/process` drains with TTLs, a retry budget, a
// duplicate-send guard, 429 backoff and a dead-letter queue.
//
// The ONLY thing that was missing is a transport that actually delivers.
// `sendLovableEmail` needs LOVABLE_API_KEY, which has been the literal string
// `REPLACE-ME` in every environment, so every email the product has ever
// queued is still sitting in `transactional_emails`. This module replaces that
// one step and touches nothing else.
//
// -----------------------------------------------------------------------------
// Why raw fetch instead of the `resend` npm package
// -----------------------------------------------------------------------------
//
// One POST to one endpoint. The SDK would add a dependency subject to
// bunfig.toml's 24-hour `minimumReleaseAge` supply-chain delay (which would
// need an explicit exclusion and the user's confirmation), and it wraps errors
// in its own shape — which is the thing that matters here, see below.
//
// -----------------------------------------------------------------------------
// The error contract is the point
// -----------------------------------------------------------------------------
//
// process.ts already classifies failures by reading `.status` and
// `.retryAfterSeconds` off the thrown error:
//
//   429 -> park the whole queue until `retry_after_until`, leave messages
//          un-deleted so they retry when the visibility timeout expires
//   403 -> permanent (unverified domain, revoked key). Straight to the DLQ,
//          because retrying 5 times cannot fix a DNS record.
//   else -> log a failed attempt, let the visibility timeout retry it
//
// `ResendError` carries both fields so that logic keeps working unchanged. Get
// this wrong and an unverified sending domain looks like a transient failure:
// five silent retries per message, then a DLQ entry blaming "max retries"
// rather than naming the actual cause.

export interface ResendMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Overrides EMAIL_FROM. Expects `Name <addr@domain>` or a bare address. */
  from?: string;
  /** Resend dedupes on this for 24h, so a double-drain cannot double-send. */
  idempotencyKey?: string;
  /** Adds a one-click List-Unsubscribe header when the queue minted a token. */
  unsubscribeUrl?: string;
  replyTo?: string;
}

export class ResendError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | null;
  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message);
    this.name = "ResendError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** True when Resend is configured. Checked before the Lovable fallback. */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * The From: address. Resend rejects any domain not verified on the account, so
 * this must match a domain added under Resend -> Domains.
 *
 * Deliberately NOT defaulted to a hard-coded address. A wrong-but-plausible
 * default would be accepted by every type check and rejected only by Resend,
 * at send time, as a 403 the queue reports as "forbidden" — traceable, but
 * hours after the deploy. An unset variable fails on the first send with a
 * message naming the variable.
 */
export function resolveFrom(explicit?: string): string {
  const from = explicit || process.env.EMAIL_FROM;
  if (!from) {
    throw new ResendError(
      "EMAIL_FROM is not set. Expected something like " +
        '`hrppl <noreply@hrppl.io>`, on a domain verified in Resend.',
      500,
      null,
    );
  }
  return from;
}

export async function sendViaResend(msg: ResendMessage): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new ResendError("RESEND_API_KEY is not set", 500, null);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  // Resend honours this for 24 hours. The queue's own duplicate guard covers
  // the common race; this covers the one it cannot see — a message delivered
  // by Resend whose `email_send_log` write failed afterwards.
  if (msg.idempotencyKey) headers["Idempotency-Key"] = msg.idempotencyKey;

  const body: Record<string, unknown> = {
    from: resolveFrom(msg.from),
    to: [msg.to],
    subject: msg.subject,
    html: msg.html,
  };
  if (msg.text) body.text = msg.text;
  if (msg.replyTo) body.reply_to = msg.replyTo;
  if (msg.unsubscribeUrl) {
    body.headers = {
      "List-Unsubscribe": `<${msg.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  let res: Response;
  try {
    res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure. Status 0 is deliberately neither 429 nor 403, so
    // process.ts treats it as retryable — which a DNS blip or a dropped socket
    // is.
    throw new ResendError(
      `Resend request failed: ${err instanceof Error ? err.message : String(err)}`,
      0,
      null,
    );
  }

  if (!res.ok) {
    // Resend returns `{ name, message, statusCode }`. Read the body as text
    // first: an upstream 502 is HTML, and JSON-parsing it would throw a
    // "Unexpected token <" that replaces the real status in the DLQ entry.
    const raw = await res.text().catch(() => "");
    let detail = raw.slice(0, 500);
    try {
      const parsed = JSON.parse(raw) as { message?: string; name?: string };
      if (parsed?.message) detail = parsed.name ? `${parsed.name}: ${parsed.message}` : parsed.message;
    } catch {
      /* keep the raw text */
    }

    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : null;

    throw new ResendError(
      `Resend ${res.status}: ${detail || res.statusText}`,
      res.status,
      Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
    );
  }

  const json = (await res.json().catch(() => ({}))) as { id?: string };
  return { id: json.id ?? "" };
}
