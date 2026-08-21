// Shared authorization for /api/public/hooks/* cron endpoints.
//
// Requires a dedicated CRON_SECRET so the Supabase service-role key is never
// shipped in Authorization headers (proxies and edge logs routinely capture
// them). Sending the service-role key to 18 public endpoints means a single
// log leak is a full RLS bypass, so the fallback that previously accepted it is
// now OFF by default.
//
// Deployments still mid-rollout can re-enable it for one cycle with
// CRON_ALLOW_SERVICE_ROLE_FALLBACK=1. That is a conscious, logged decision —
// configure CRON_SECRET, drop the flag, then rotate the service-role key.

let warnedAboutFallback = false;

export function isAuthorizedCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  if (!token) return false;

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret.length > 0) {
    return timingSafeEqual(token, cronSecret);
  }

  // No CRON_SECRET configured — fail closed unless explicitly overridden.
  if (process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK !== "1") return false;

  if (!warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn(
      "[cron-auth] CRON_SECRET is not set and the service-role fallback is " +
        "enabled. The service-role key is being accepted as a bearer token on " +
        "public hook endpoints. Set CRON_SECRET, remove " +
        "CRON_ALLOW_SERVICE_ROLE_FALLBACK, then rotate the service-role key.",
    );
  }
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!svc && timingSafeEqual(token, svc);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/** Exposed for tests — resets the once-per-process warning latch. */
export function __resetCronAuthWarning() {
  warnedAboutFallback = false;
}
