/**
 * Shared rate-limit helper for server functions.
 * Backed by the public.check_rate_limit RPC + rate_limit_buckets table.
 *
 * NOTE: Lovable Cloud has no first-class rate-limit primitive; this is an
 * ad-hoc token bucket per (user, bucket). Callers should wrap their handler
 * with `await enforceRateLimit(supabase, bucket, max, windowSec)`.
 */
export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const EVIDENCE_ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const EVIDENCE_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
export const CSV_MAX_ROWS = 50_000;

export function validateEvidenceUrl(url: string | null | undefined): void {
  if (!url) return;
  if (url.length > 1000) throw new Error("Evidence URL too long (max 1000 chars).");
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("Evidence URL is not a valid URL.");
  }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Evidence URL must use http(s).");
  const path = u.pathname.toLowerCase();
  const looksLikeFile = /\.[a-z0-9]{2,5}$/.test(path);
  if (looksLikeFile) {
    const ok = EVIDENCE_ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
    if (!ok)
      throw new Error(
        `Evidence file type not allowed. Allowed: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}`,
      );
  }
}

export async function enforceRateLimit(
  supabase: any,
  bucket: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<void> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    _bucket: bucket,
    _max_requests: maxRequests,
    _window_seconds: windowSeconds,
  });
  if (error) {
    // Don't hard-fail on rate-limit infra outage.
    console.warn("[rate-limit] check failed", error.message);
    return;
  }
  if (data === false) {
    throw new Error(`Rate limit exceeded for ${bucket}. Try again in a few minutes.`);
  }
}

/**
 * Rate limit an UNAUTHENTICATED caller, keyed by IP.
 *
 * ---------------------------------------------------------------------------
 * Why `enforceRateLimit` above cannot do this
 * ---------------------------------------------------------------------------
 *
 * `check_rate_limit` opens with `IF v_user IS NULL THEN RETURN true`, and
 * `rate_limit_buckets.user_id` is `REFERENCES auth.users(id)`. Both are
 * deliberate for a per-user limiter and both make it useless for a public
 * endpoint: an anonymous caller is waved through, and there is no column that
 * could hold anything but a real user id.
 *
 * The 2026-09-03 audit found five server functions with no `.middleware()` at
 * all, four of which write, and none of them limited. `createResumeUploadUrl`
 * is the one that matters most — it is an unauthenticated mint of a signed
 * upload credential for the `candidate-resumes` bucket, so a loop against it
 * fills storage and, on a metered plan, the bill.
 *
 * ---------------------------------------------------------------------------
 * Two deliberate choices
 * ---------------------------------------------------------------------------
 *
 * **It fails open.** Every failure path — no request scope, no forwarded-for
 * header, the RPC missing, the RPC erroring — returns rather than throwing.
 * A rate limiter that fails closed on a public careers page takes the page
 * offline for real applicants, and a spam wave is a smaller problem than that.
 * The same reasoning as `enforceRateLimit`, which already swallows RPC errors.
 *
 * **It runs on the service-role client.** The counter table has no policy for
 * `anon` on purpose, so a caller cannot read it to see who else is calling, or
 * write to it to reset their own count. If the service-role key is absent the
 * call degrades to a warning and the request proceeds, because
 * `client.server.ts` throws on construction without it and an unavailable
 * limiter must never be the reason a candidate cannot apply for a job.
 *
 * Until `20260903120000_public_rate_limit.sql` is applied the RPC does not
 * exist, this warns once per call and passes through — correct but inert.
 */

/**
 * The best available identity for an anonymous caller.
 *
 * `getRequestIP({ xForwardedFor: true })` alone is not enough. On a local dev
 * server there is no proxy header and no meaningful socket address, so it
 * returns null and the limiter silently does nothing — which is correct
 * behaviour but makes the whole path untestable outside production, and
 * "untestable outside production" is how a decorative security control ships.
 *
 * So: the forwarded-for chain first (Vercel, and every other reverse proxy),
 * then the vendor headers, then the raw socket address. Returns null only when
 * genuinely nothing is available, which is the documented fail-open case.
 *
 * Takes the FIRST entry of x-forwarded-for — the original client. The last
 * entry is the nearest proxy and would bucket every visitor together.
 */
async function resolveClientKey(): Promise<string | null> {
  try {
    const { getRequestIP, getRequestHeader } = await import("@tanstack/react-start/server");
    const forwarded = getRequestHeader("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    for (const h of ["cf-connecting-ip", "x-real-ip", "true-client-ip"]) {
      const v = getRequestHeader(h);
      if (v) return v.trim();
    }
    return getRequestIP() ?? null;
  } catch {
    return null; // not in a request scope (tests, SSR prerender)
  }
}

export async function enforcePublicRateLimit(
  bucket: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<void> {
  const clientKey = await resolveClientKey();
  if (!clientKey) return; // nothing to key on — see "fails open" above

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("check_public_rate_limit", {
      _client_key: clientKey,
      _bucket: bucket,
      _max_requests: maxRequests,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.warn("[public-rate-limit] check failed", error.message);
      return;
    }
    if (data === false) {
      throw new Error("Too many requests. Please wait a few minutes and try again.");
    }
  } catch (e: any) {
    // Re-throw only our own refusal; anything else (missing service-role key,
    // RPC not yet migrated) degrades to a pass.
    if (e?.message?.startsWith("Too many requests")) throw e;
    console.warn("[public-rate-limit] unavailable", e?.message);
  }
}
