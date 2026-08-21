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
  try { u = new URL(url); } catch { throw new Error("Evidence URL is not a valid URL."); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Evidence URL must use http(s).");
  const path = u.pathname.toLowerCase();
  const looksLikeFile = /\.[a-z0-9]{2,5}$/.test(path);
  if (looksLikeFile) {
    const ok = EVIDENCE_ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
    if (!ok) throw new Error(`Evidence file type not allowed. Allowed: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}`);
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
