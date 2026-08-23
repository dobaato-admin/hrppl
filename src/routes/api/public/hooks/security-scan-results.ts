import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { hookFailure } from "@/lib/hook-response.server";
import { ingestFindingsAndAlert } from "@/lib/security-alerts.server";

/**
 * Public ingest endpoint for scheduled security scan runners (e.g. weekly GitHub
 * Actions job). Authenticated via HMAC-SHA256 over the raw body using
 * SECURITY_SCAN_WEBHOOK_SECRET. On success: upserts findings into
 * security_findings_log and fans out email + webhook alerts for any NEW
 * ERROR-level finding.
 *
 * Contract: POST JSON `{ scanned_at?: iso, findings: ScanFindingInput[] }`
 * with header `x-scan-signature: hex(HMAC_SHA256(secret, body))`.
 */
const Body = z.object({
  scanned_at: z.string().optional(),
  findings: z.array(z.object({
    scanner_name: z.string().min(1).max(80),
    internal_id: z.string().min(1).max(200),
    title: z.string().min(1).max(255),
    severity: z.enum(["error", "warn", "info"]),
    status: z.enum(["open", "fixed", "ignored", "accepted_risk"]).optional(),
    description: z.string().max(8000).optional(),
    remediation: z.string().max(8000).optional(),
  })).min(0).max(500),
});

function verifySig(secret: string, signatureHex: string | null, body: string): boolean {
  if (!signatureHex) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(signatureHex, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}

export const Route = createFileRoute("/api/public/hooks/security-scan-results")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SECURITY_SCAN_WEBHOOK_SECRET;
        if (!secret) return new Response("Server not configured", { status: 503 });
        const raw = await request.text();
        if (!verifySig(secret, request.headers.get("x-scan-signature"), raw)) {
          return new Response("Invalid signature", { status: 401 });
        }
        let payload: z.infer<typeof Body>;
        try {
          payload = Body.parse(JSON.parse(raw));
        } catch (e: unknown) {
          // A schema violation is the caller's own payload described back to
          // them, so the field paths are safe and genuinely useful to an
          // integrator. Anything else — a JSON syntax error, a thrown
          // internal — is redacted, since only the first case is about them.
          if (e instanceof z.ZodError) {
            return Response.json(
              { ok: false, error: "Invalid payload", issues: e.issues },
              { status: 400 },
            );
          }
          return hookFailure("security-scan-results", e, 400);
        }

        const scanned_at = payload.scanned_at ?? new Date().toISOString();
        const result = await ingestFindingsAndAlert(
          payload.findings.map((f) => ({ ...f, scanned_at })),
        );
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
