# T13 — page load performance

**Measured 2026-09-13 against the dev project `xnrjfrxzahmfdrqfsnnq` (Supabase free plan).**

The ticket asked to measure before changing anything, and the measurement
contradicted three of the four causes it listed as usual suspects. That is
recorded here so the next person does not re-propose them.

## What the measurement said

`pg_stat_user_tables`, `public` schema, ordered by rows read sequentially:

| table        | live rows | seq scans | rows read | idx scans |
| ------------ | --------: | --------: | --------: | --------: |
| `profiles`   |        20 |   912,884 | 8,651,885 |    16,006 |
| `user_roles` |        28 |   183,207 | 3,340,725 |   305,567 |
| `employees`  |        19 |   149,904 |   901,358 |    67,332 |
| `tenants`    |         5 |    85,645 |   301,326 |   376,284 |

Twenty rows and nine hundred thousand scans.

## What that rules out

- **Missing indexes.** No index helps a twenty-row table — a sequential scan of
  twenty rows is cheaper than descending an index. `pg_stat_user_indexes`
  confirms the indexes that matter are present and used (`employees_pkey`:
  44,317 scans); several others sit at zero because nothing should be using
  them at this size. Adding tenant-id indexes here would add write cost and
  buy nothing. (An earlier pass reached the same conclusion and declined to
  add 69 of them; this re-measurement agrees.)
- **Unpaginated list endpoints.** Real, but not the cause at this scale: the
  largest table in the product has nineteen rows. It will matter at customer
  scale and is listed under "still open" below.
- **Payload size and bundle size.** Not what nine hundred thousand scans of a
  twenty-row table is a symptom of.

## What it actually is

A **call-count** problem, not a query-plan one.

Nearly every server fn opens by resolving the caller's tenant and roles before
it touches real data, several resolve them more than once, and each resolution
is a separate HTTP round trip to PostgREST. Add `requireActiveUser`'s
per-request suspension check and a single server fn costs three sequential
round trips before doing anything. A page calling six server fns therefore
pays around eighteen sequential round trips, and on the free plan the round
trip — not the query — is the latency.

This is why onboarding felt slow specifically: those pages fan out across
several server fns, each with the same preamble.

## What was changed

1. **`src/lib/request-cache.ts` — resolve once per request.** `requestMemo`
   keyed on the per-request Supabase client. `getTenantId`, `getActingTenantId`,
   `getMyEmployeeId` and the new `getMyRoles` all route through it.

   The cache is keyed on the client *object*, which `auth-middleware.ts` builds
   fresh per request from that request's own bearer token. That gives the two
   properties that make a cache over authorization data safe: it lives exactly
   as long as the request, and two requests can never share an entry. A cache
   keyed on user id in module scope would be a cross-request authorization bug;
   this one cannot be, by construction. A rejection is not cached, so one flaky
   read cannot become a request-long outage.

   **It is not a cache across requests.** Suspension and roles are re-read on
   every request exactly as before; a role revoked a second ago is honoured on
   the next call. Only duplicate reads *inside* one request are removed.

2. **`getTenantAndRoles` — in parallel.** Thirteen modules ran
   `await assertAdmin(...)` then `await getTenant(...)`: two independent round
   trips taken one after the other. `templates.functions.ts` is converted
   (13 call sites); the rest keep their own guards and can follow individually.

3. **`src/hooks/use-countries.ts` — fetch the country list once.** Twenty-one
   pages each ran their own `from("countries")` inside a `useEffect`, refetched
   on every mount. Now one shared entry with `staleTime: Infinity`. The
   onboarding-path callers are converted. It also stops the dropdown rendering
   empty and filling in afterwards, which reads as broken rather than slow.
   The old call sites discarded the error, so a failed read and an empty list
   looked identical; the hook surfaces it.

## Targets

Per the ticket, stated so they are checkable:

- list pages under **2s**, detail pages under **1.5s**, on a seeded org of
  realistic size;
- no page issuing more than **6** sequential server-fn round trips before
  first meaningful paint.

These are not yet automatically enforced. Measuring them needs a seeded org of
realistic size, which the demo seed (19 employees) is not.

## Still open, in priority order

1. **The other ~90 hand-rolled `profiles.tenant_id` lookups.** Each module has
   its own helper with a slightly different shape (different client variable,
   different follow-up logic), so a blanket rewrite is riskier than the win.
   Convert them as each module is next touched; `getTenantId` is memoised and
   ready.
2. **Pagination on list endpoints.** 1,239 list reads, 142 with a `.limit()`.
   Not yet a problem at nineteen employees; it is the first thing that breaks
   at a thousand.
3. **`staleTime` on the remaining React Query sites** — 33 of 214 declare one,
   so most refetch on every mount.
4. **Loop-with-query sites**, 17 remaining after the earlier `.in()` fix in
   `generateSuperContributionsForRun`.
