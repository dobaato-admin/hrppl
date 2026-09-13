/**
 * T13 · Resolve the same thing once per request instead of once per caller.
 *
 * ## What the measurement said
 *
 * `pg_stat_user_tables` on the dev project, against a database of demo size:
 *
 *     relname      n_live_tup   seq_scan   seq_tup_read
 *     profiles             20    912,884      8,651,885
 *     user_roles           28    183,207      3,340,725
 *     employees            19    149,904        901,358
 *
 * Twenty rows and nine hundred thousand scans. That is not a query-plan
 * problem and no index fixes it — a seq scan of twenty rows is faster than
 * reading an index. It is a *call count* problem: almost every server fn
 * opens by resolving the caller's tenant and roles, several do it more than
 * once, and each of those is a separate HTTP round trip to PostgREST.
 *
 * On a page that calls six server fns, each doing an account-status check
 * plus a profile read plus a roles read before it touches real data, that is
 * eighteen sequential round trips before anything useful happens. On the
 * Supabase free plan the round trip, not the query, is the cost.
 *
 * ## Why keyed on the client object
 *
 * `auth-middleware.ts` builds a fresh Supabase client per request, from that
 * request's own bearer token. Using it as the cache key therefore gives, for
 * free, the only two properties that matter here:
 *
 * - **Scope.** The cache lives exactly as long as the request does.
 * - **Safety.** Two requests never share an entry, so one user's tenant or
 *   roles can never be served to another. A cache keyed on user id in module
 *   scope would be a cross-request authorization bug waiting for a
 *   long-running process to expose it; this one cannot be, by construction.
 *
 * A `WeakMap` means the entry is collected with the client, so nothing has to
 * remember to clear it.
 *
 * ## What this is not
 *
 * Not a cache across requests. Roles and suspension are re-read on every
 * request exactly as before — `requireActiveUser` still runs per request, and
 * a role revoked a second ago is still honoured on the next call. This only
 * removes the *duplicate* reads inside one request.
 */

type Memo = Map<string, Promise<unknown>>;

const perRequest = new WeakMap<object, Memo>();

/**
 * Run `fn` once for this request, and return the same promise to every later
 * caller with the same key.
 *
 * The promise is cached, not the value, so two callers racing at the top of a
 * handler share one round trip rather than making two.
 *
 * A rejection is **not** cached: the entry is dropped so a retry can happen.
 * Caching a failure would turn one flaky read into a request-long outage, and
 * these are all reads a handler is entitled to retry.
 */
export function requestMemo<T>(
  client: unknown,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  // A non-object client (a test double that is a bare function, say) cannot
  // key a WeakMap. Fall through uncached rather than throwing — this is an
  // optimisation and must never be the reason a request fails.
  if (!client || (typeof client !== "object" && typeof client !== "function")) {
    return fn();
  }
  let memo = perRequest.get(client as object);
  if (!memo) {
    memo = new Map();
    perRequest.set(client as object, memo);
  }
  const existing = memo.get(key);
  if (existing) return existing as Promise<T>;

  const started = fn().catch((e) => {
    memo!.delete(key);
    throw e;
  });
  memo.set(key, started);
  return started as Promise<T>;
}

/** Exposed for tests: how many entries this request has memoised. */
export function __memoSize(client: object): number {
  return perRequest.get(client)?.size ?? 0;
}
