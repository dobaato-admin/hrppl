# Security model — trust boundaries and where each one is enforced

**Audited 2026-09-03** against `main` @ `4da3ead`. 591 server functions, 207 tables, 20 public
hook endpoints, 166 routes.

This document exists because the two real findings in that audit were both **invisible from
inside the product**. The pages were gated correctly; the holes were one layer below, where
nobody looks. If you are adding an endpoint, read §2 and §6.

---

## 1. The five trust boundaries

Everything in this product crosses one of these. Getting the layer right matters more than
getting any single check right, because a check at the wrong layer is a check that can be
bypassed by going around it.

| # | Boundary | Enforced by | Fails how |
| --- | --- | --- | --- |
| 1 | Is this caller signed in? | `requireActiveUser` middleware (`src/lib/auth-guard.ts`) | No middleware ⇒ **anonymous access**, silently |
| 2 | Is this account still active? | the same middleware, re-checked **every request** | Suspended user keeps working |
| 3 | May this role do this? | server-fn role assert **and** RLS policy | UI-only check ⇒ bypassed by calling the endpoint directly |
| 4 | Is this row in the caller's tenant? | the **query's own** `.eq("tenant_id", …)` | RLS does not narrow for `super_admin` ⇒ cross-tenant read |
| 5 | Is this content safe to render? | sanitise at write **and** at render | Stored XSS |

`can(feature, roles)` from `src/lib/rbac.ts` is **not** on this list. It decides what to *show*.
It is never a security boundary, and a page that relies on it alone is unprotected.

---

## 2. A server function is a public HTTP endpoint

This is the single most important sentence in this document.

`createServerFn` compiles to a route under `/_serverFn/…`. It does not inherit anything from the
page that calls it. A gated page calling an ungated function is an ungated function.

**This shipped.** `countOpenHighSeverityFindings` had no `.middleware()` at all and read through
the service-role client, so any unauthenticated caller could read back a live count of the
platform's open critical security findings. Every sibling in its module gated on
`assertSuperAdmin`; this one was missed, and `/admin/security` being gated is exactly why nobody
noticed.

**The rule:** every server function declares `.middleware([requireSupabaseAuth])` unless it is
listed in `PUBLIC` in `tests/public-endpoint-security.test.ts` with a written reason. That test
fails on any new endpoint that is not.

### The 13 endpoints that are deliberately public

| Kind | Functions | Why it is safe |
| --- | --- | --- |
| Public content | `listCategories`, `listPublishedPosts`, `getPublishedPost`, `listPublicJobs`, `getPublicJob`, `getCareersByTenantSlug`, `getJobBySlug` | Published marketing content; nothing tenant-private |
| Public writes | `applyToJob`, `createResumeUploadUrl`, `submitLead`, `trackCareersEvent` | A candidate has no account; **all rate limited** (§3) |
| Capability URL | `getCertificate`, `getInvitationByToken` | The token *is* the credential — long, random, single-purpose |

A capability URL is only as good as its token. Both check a minimum length, return one specific
record, and reveal nothing on a miss.

---

## 3. Rate limiting — two limiters, and why

There are two, because one could not do both jobs.

| | `enforceRateLimit` | `enforcePublicRateLimit` |
| --- | --- | --- |
| Keyed on | `auth.uid()` | salted hash of the client IP |
| Table | `rate_limit_buckets` (FK to `auth.users`) | `public_rate_limit_buckets` |
| Anonymous callers | **waved through** (`IF v_user IS NULL THEN RETURN true`) | limited |
| Use for | authenticated abuse (exports, attestations) | anything with no `.middleware()` |

The authenticated limiter is not a fallback for the public one. Its RPC returns `true` for
anonymous callers by design and its table cannot store a non-user key, so calling it from a public
endpoint compiles, runs, and does nothing.

**Both fail open.** No request scope, no forwarded-for header, RPC missing, RPC erroring — all
return rather than throw. A limiter that fails closed on a careers page takes the page offline for
real applicants, and a spam wave is the smaller problem. That is a deliberate trade, not an
oversight.

**The IP is never stored.** `check_public_rate_limit` hashes it with a server-side salt before it
touches a row. A list of every IP that viewed a careers page is personal data with no reason to
exist, and the counter table is service-role readable.

Current ceilings — tuned to real use, not to a round number:

| Bucket | Limit | Reasoning |
| --- | --- | --- |
| `public_resume_upload` | 10/hr | Mints a storage upload credential. The tightest on purpose. |
| `public_job_apply` | 10/hr | A person applies to a handful of roles, not a hundred |
| `public_lead` | 5/hr | A real prospect submits once |
| `public_invite_lookup` | 30/hr | What makes token enumeration impractical |
| `public_careers_event` | 240/hr | Fires per page view; only stops a flood |

---

## 4. Three Supabase clients, three trust levels

| Client | Key | RLS | Use for |
| --- | --- | --- | --- |
| `integrations/supabase/client.ts` | anon | **applies** | Browser. Always scope by `tenant_id` yourself. |
| `context.supabase` (in a server fn) | caller's JWT | **applies** | The default. Role checks run on this. |
| `integrations/supabase/client.server.ts` | service role | **bypassed entirely** | Only where RLS would wrongly narrow |

**Run authorization on the caller's client, then do the work on whichever fits.** A role check
made with the service-role client answers a question about the service role, not about the user.

Service-role use is legitimate in ~40 modules, but each instance should answer "what would RLS
wrongly hide here?" The good examples: `getCompanyDirectory` (no policy lets an employee read a
colleague, so the caller's client returns one row — themselves), cross-employee payroll
aggregation, and audit writes the subject must not be able to suppress.

`client.server.ts` **throws on construction** when `SUPABASE_SERVICE_ROLE_KEY` is absent. Never
put it on a path every request touches — wrap it in `try/catch` where the feature must survive
without it. The geofence audit trail does exactly this: it must never be the reason nobody can
clock in.

---

## 5. Tenant scoping is the query's job, not RLS's

RLS is the **security** boundary. It is not a **scoping** one, because several policies do not
narrow by tenant at all — `super_admin`'s policy on `employees` is `FOR ALL USING has_role(…)`
with no tenant predicate.

A query that omits `.eq("tenant_id", …)` and trusts RLS returns **every tenant's rows** to that
caller. This has shipped before, and it did more than leak: the offboarding picker listed all 15
employees across 3 tenants, and `createOffboarding` then copied `tenant_id` from the selected
employee, so picking any of them produced a row `WITH CHECK` rejected. The leak and the failure
were one bug.

- Server: `requireTenantId()` / `getTenantId()` — `src/lib/tenant-scope.ts`
- Client: `useMyTenantId()` — `src/hooks/use-tenant.ts`
- Pinned by `tests/tenant-scoping.test.ts`

**Open gap:** only 13 of 97 function modules use these helpers. The rest read `profiles.tenant_id`
directly, which is `NULL` for a platform account and ignores the acting tenant. That is a
correctness and UX gap rather than a leak — the direct read is still tenant-bound — but it means a
`super_admin` acting as a tenant gets a working page from one module and "No tenant" from the next.

---

## 6. HTML: sanitise at write **and** at render

`src/lib/doc-html-sanitize.ts` states the convention and it is defence in depth, not belt and
braces: the write-time pass protects the stored value, the render-time pass protects against
anything that reached the row another way — a migration, a direct insert, an older code path.

Every sink now does both. The document-template preview did only the first and was the exception.

`renderMarkdown` (`src/lib/markdown.ts`) is safe by construction: it escapes HTML *before*
converting, and allow-lists link schemes to `http(s)`, `mailto` and relative. It is not a general
HTML renderer — do not feed it stored HTML.

---

## 7. Public hook endpoints must not echo caught errors

`/api/public/hooks/*` authenticate with a bearer secret rather than a session, so anything in a
response body is internet-reachable. Returning `e.message` there ships Postgres messages naming
tables, columns, constraints and policies.

Use `hookFailure()` / `hookErrorRef()` from `src/lib/hook-response.server.ts`: the full error goes
to the log, the caller gets a generic message and a correlation ref. All 20 handlers comply;
`tests/hook-error-exposure.test.ts` enforces it.

---

## 8. `SECURITY DEFINER`: `current_user` is the owner, not the caller

Inside a `SECURITY DEFINER` function, `current_user` is the function owner (`postgres`) and
`session_user` is the connection's role, which never follows `SET ROLE`. **Neither identifies the
caller.** A trigger that tried to exempt trusted paths with `current_user IN ('postgres', …)`
matched on every call and disabled the entire state machine below it.

Use the request context:

```sql
jwt_role := auth.role();
IF jwt_role IS NULL              -- migration, seed, psql: no JWT at all
   OR jwt_role = 'service_role'  -- the backend acting deliberately
THEN RETURN NEW; END IF;         -- everything else is a person: enforce
```

Two consequences worth knowing:

- **Verify RLS under a real JWT**, never as `postgres`, which bypasses it entirely and will
  happily tell you a broken policy works.
- **Schema-qualify extension calls.** A `SECURITY DEFINER` function with `SET search_path = public`
  cannot see `extensions.digest`. Widening the search_path of a definer function to reach it is
  the wrong fix; qualify the one call. (This bit during the audit — the first apply of
  `check_public_rate_limit` produced a function that threw `42883` on every invocation.)

---

## 8b. A SECURITY DEFINER view can be the *only* correct answer

Added 2026-09-06, after Wave 6 found the failure this describes.

`training_quiz_questions_public` is a definer view (`security_invoker = off`) **on purpose**.
Learners are denied on `training_quiz_questions` deliberately, so that nobody sitting a quiz can
read `correct_index`; the view projects the safe columns and carries the tenant and enrollment
predicates itself. It is their only read path. `security_findings_log` records it as
`SECURITY_DEFINER_VIEW_quiz_public … accepted_risk`, with the reasoning.

`20260613143222`, titled "Fix Security Definer view", set it to `security_invoker = on` to clear
the Supabase linter warning — the one that had already been triaged and accepted. Under `invoker`
the view has no privileges of its own: the caller's RLS on the base table decides, and the caller
is denied there. Every learner read **0 rows**, silently, and since a course completes only by
passing its quiz, **no employee could complete any course**. Nothing threw; the screen said the
course had no quiz.

Two rules come out of it:

- **A linter finding that has been accepted in writing is not an open finding.** Check
  `security_findings_log` before "fixing" one. If the acceptance is wrong, argue with the
  acceptance, not with the ALTER.
- **`security_invoker = on` is the right default and the wrong setting for a view that exists
  because the base table denies its readers.** If flipping a view to invoker would empty it, the
  view *is* the access-control mechanism, and that has to be stated where it can be found.
  `tests/training-access.test.ts` fails if this one is flipped back.

---

## 9. Verified clean in the 2026-09-03 pass

- RLS enabled on **all 207 tables**.
- No `employees` list read without a tenant filter (4 candidates, all transitively scoped).
- No secret behind a `VITE_` prefix — anything `VITE_*` is compiled into the client bundle.
- All 20 public hooks use `hookFailure()`.
- No unauthenticated endpoint outside the declared 13.

## 9b. Added by the Wave 6 pass (2026-09-06)

- `hr` gained manage policies on `training_quiz_questions` and `certifications`; `branch_admin`
  gained branch-scoped SELECT on `certifications` and on quiz attempts. This *widens* access, and
  it does so to match a decision `20260613140528` had already made for the rest of the domain.
- Seven tables gained a foreign key to `employees` (`20260906092000`, `20260906093000`) and
  `leave_requests` / `leave_balances` gained keys to `leave_types` (`20260906094000`). These are
  integrity fixes, not access changes: without them a request or certificate could outlive the
  employee it belonged to. Two are `NOT VALID` because two real rows already had.
- The `training-content` bucket is private, with a mime allow-list that admits no executable type —
  no `text/html`, no archives. Learners never receive a bucket path; the server checks enrollment
  on the caller's own client and then signs for ten minutes.

## 10. What is not covered

Honest limits of this audit, so nobody reads it as more than it is:

- **No penetration testing.** This is source analysis plus targeted live verification.
- **No dependency CVE scan.** `bunfig.toml` enforces a 24h `minimumReleaseAge` against
  supply-chain attacks, but nothing here audits transitive dependencies.
- **No load or DoS testing.** The rate limits are reasoned, not measured.
- **Storage bucket policies not re-audited** beyond the resume-upload path.
- **Auth configuration** (password policy, session length, OAuth redirect allow-list) is Supabase
  dashboard state, not in this repo, and was not reviewed.
