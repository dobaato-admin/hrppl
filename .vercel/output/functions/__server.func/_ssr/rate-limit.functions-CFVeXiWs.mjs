const EVIDENCE_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
const CSV_MAX_ROWS = 5e4;
function validateEvidenceUrl(url) {
  if (!url) return;
  if (url.length > 1e3) throw new Error("Evidence URL too long (max 1000 chars).");
  let u;
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
    if (!ok) throw new Error(`Evidence file type not allowed. Allowed: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}`);
  }
}
async function enforceRateLimit(supabase, bucket, maxRequests, windowSeconds) {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    _bucket: bucket,
    _max_requests: maxRequests,
    _window_seconds: windowSeconds
  });
  if (error) {
    console.warn("[rate-limit] check failed", error.message);
    return;
  }
  if (data === false) {
    throw new Error(`Rate limit exceeded for ${bucket}. Try again in a few minutes.`);
  }
}
export {
  CSV_MAX_ROWS as C,
  enforceRateLimit as e,
  validateEvidenceUrl as v
};
