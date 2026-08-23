/**
 * Shared response helpers for `/api/public/hooks/*`.
 *
 * These endpoints are internet-reachable — they authenticate with a bearer
 * secret rather than a session, so anything they put in a response body is one
 * leaked or brute-forced secret away from being public. Several of them were
 * echoing the caught error straight back:
 *
 *     catch (e) { return Response.json({ error: e.message }, { status: 500 }) }
 *
 * which CodeQL flags as "Information exposure through a stack trace", and
 * rightly so. The messages these handlers produce are Postgres and PostgREST
 * errors, so the body could carry table names, column names, constraint names,
 * RLS policy names, or a fragment of the failing SQL — a schema map handed to
 * whoever is probing the endpoint.
 *
 * The fix is not to swallow the detail. `hookFailure` writes the *full* error,
 * stack included, to the server log and returns only a generic message plus a
 * short correlation `ref`. The operator greps the log for the ref; the caller
 * learns nothing but "it failed".
 *
 * Use `hookErrorRef` for the same effect inside a per-item result array, where
 * a whole Response is the wrong shape.
 */

/** Short, non-guessable id that ties a response back to a log line. */
function newRef(): string {
  return Math.random().toString(36).slice(2, 10);
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Log the real error, return a redacted one.
 *
 * @param scope  Log prefix identifying the hook, e.g. "leave-accrual".
 * @param e      The caught value, of any shape.
 * @param status HTTP status, default 500.
 */
export function hookFailure(scope: string, e: unknown, status = 500): Response {
  const ref = newRef();
  // Full detail — stack and all — stays server-side.
  console.error(`[${scope}] failed (ref ${ref})`, e);
  return new Response(JSON.stringify({ ok: false, error: "Internal error", ref }), {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * Log the real error and return only the correlation ref, for handlers that
 * accumulate per-tenant or per-item outcomes into an array they return.
 */
export function hookErrorRef(scope: string, e: unknown): string {
  const ref = newRef();
  console.error(`[${scope}] item failed (ref ${ref})`, e);
  return ref;
}

/** Uniform 401 for a missing or wrong bearer secret. */
export function hookUnauthorized(): Response {
  return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
    status: 401,
    headers: JSON_HEADERS,
  });
}
