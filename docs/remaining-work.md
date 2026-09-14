# Remaining work — what is left to call this platform finished

**Written 2026-09-03**, after Wave 5 and audit A1. **Updated 2026-09-07**, after Wave 7.

Waves 1–5 made the product *correct* and *reachable*: no dead links, no orphan server functions,
no unauthenticated endpoint outside the declared thirteen. Wave 6 built the LMS and closed X-07,
the last drift axis; Wave 7 built the guided setup, the policy library and Phase 3 provisioning.
What is left is genuinely unbuilt, plus two pieces of debt with names.

Each item below carries the same four things, so it can be picked up cold: **what**, **why it
matters**, **what to build**, and **how you know it is done**.

---

## Done in Wave 6 (2026-09-06) — X-07 and the LMS

Both former Priority 1 and Priority 3. Kept here only as a pointer: the full record, including two
defects found underneath X-07 that were larger than X-07, is in `docs/plan-waves.md` § Wave 6.

- **X-07 closed.** The description that used to sit here was already stale — `hr` had held manage
  policies on `training_courses` and `training_enrollments` since `20260613140528`. What was
  missing was `training_quiz_questions` and `certifications`, where hr had no policy at all.
  Widened for hr; `branch_admin` stays read-only behind a second key, `org.trainingManage`.
- **The LMS shipped**: lessons, per-lesson progress, a private content bucket, a course builder at
  `/admin/training/$courseId`, a player at `/me/training/$enrollmentId`, and roster progress.
- **Two silent failures fixed**: the quiz view had been flipped to `security_invoker = on` by a
  linter-driven migration, which meant no learner could read a single quiz question and therefore
  no employee could complete any course; and seven tables embedded `employees(...)` through a
  foreign key that did not exist, leaving four training surfaces and the leave half of both
  requests inboxes permanently, silently empty.

---

## Priority 1 — Acting-tenant coverage: code half DONE (2026-09-14), RLS half open

**The code half is complete.** 92 direct `profiles.tenant_id` reads across 52 server modules
now resolve through `requireTenantId()` / `getTenantId()`. **65 of 104 `*.functions.ts` modules
import `tenant-scope`** (was 14 of 97); the rest legitimately need no tenant.
`tests/acting-tenant-coverage.test.ts` is the test this section asked for, and it fails with the
offending file and line.

Four reads remain and are allow-listed **with reasons**, per the Wave 5 rule:

- `tenant-scope.ts` — the helper itself.
- `profile.functions.ts` — returns the profile row *as data*; `tenant_id` is a field of the thing
  being fetched, not a scope being resolved.
- `org-signup.functions.ts` (×2) — needs the **raw** home tenant to answer "do you already belong
  to an org?". An acting tenant must not answer yes, or a platform admin acting as Acme could
  never create a second org.

Reads of **another user's** profile are explicitly out of scope and the test says so:
`account-suspension` and `role-management` need the tenant of the user being acted *on*, and an
acting-tenant fallback there would be a bug, not a fix.

Three things the conversion exposed that were not in the original write-up:

1. **Eight sites could write `tenant_id: null`.** `getTenantId` returns `string | null`, and
   TypeScript did not catch the null reaching a Supabase payload because these are spread-built
   objects on loosely-typed `.insert()` calls. They now use `requireTenantId`, and the test has a
   second check that fails on any new one.
2. **Two modules had their own `getTenantId` wrapper** — `csv-export-jobs`'s was `requireTenantId`
   spelled out by hand. Both deleted.
3. **`account-status.server.ts` selected `tenant_id` and never used it.** Dropped.

**Still open: the routes.** Thirteen `*.tsx` route files resolve the tenant themselves. That is
the same defect but it is also §4c's "two-query tenant waterfall", so it is tracked there —
`useMyTenantId()` fixes both at once and `tests/tenant-loading-state.test.ts` already lists them.

**The RLS half is also DONE** (2026-09-14), in one function rather than 262 policy rewrites.
`user_tenant_id(uid)` now returns `COALESCE(profiles.tenant_id, <the tenant selected in the
switcher>)`, so all 262 policies across 148 tables inherit the fix — see
`20260914090000_user_tenant_id_acting_tenant.sql` for the full argument.

Blast radius is exactly platform admins, and provably: the fallback fires **only** when
`profiles.tenant_id IS NULL`, so COALESCE never reaches it for a tenant member; and RLS on
`platform_acting_tenant` means only a `super_admin` or a country-scoped `regional_admin` can ever
have a row. No policy in the schema uses `user_tenant_id` negatively (no `IS NULL`, no `<>`, no
`NOT` — checked against `pg_policies`), so the change can only widen, never narrow.

Measured live as `sam.platform` acting as Globex Nepal, before → after:

| Table | Before | After | Globex actually has |
| --- | --- | --- | --- |
| `training_courses` | **0** | **7** | 7 |
| `expense_categories` | **0** | **12** | 12 |

Every Acme role's counts were identical either side of the migration, and no tenant member can
see more than one tenant.

**What this does NOT fix, and must not be mistaken for it.** The same measurement showed the
*other* wrong answer: `departments` returned **22** rows — every tenant's — both before and after,
because `super_admin`'s policy there is `FOR ALL USING has_role(...)` with **no tenant predicate
at all**. That is the CLAUDE.md "RLS is the boundary, not the scope" rule, and the fix for it is
the query filtering `tenant_id` itself, which the server layer now does everywhere after the code
half. A platform admin reading through a module that forgets the filter still sees every tenant.

The original write-up follows.

### The original entry



**What.** `TenantSwitcher`, `ActingTenantBanner` and `platform_acting_tenant` all exist and work.
Only the modules calling `requireTenantId()` / `getTenantId()` honour them; the rest read
`profiles.tenant_id` directly, which is `NULL` for a platform account. Wave 6 converted
`training.functions.ts` and wrote `training-lessons.functions.ts` on `requireTenantId` from the
start, taking the count from 13 to 14 — 83 to go.

**Why it matters.** As `sam.platform` acting as Acme, `/org/payroll` works and `/org/analytics`
says "No tenant". Same switcher, same account, two different answers page by page. It is the
largest architectural inconsistency left, and it makes the platform roles undemonstrable on any
surface that has not been converted.

It is **not** a leak — the direct read is still tenant-bound. It is a correctness and UX gap.

**What to build.** Mechanical, and worth doing in batches by domain rather than all at once:

1. Replace `const { data: prof } = await supabase.from("profiles").select("tenant_id")…` with
   `const tenantId = await requireTenantId(supabase, userId)`.
2. Use `getTenantId` where "no tenant" is a legitimate answer the page should explain, and
   `requireTenantId` where it is an error.
3. Carry a `noTenantScope` flag to the UI rather than rendering an unexplained empty page — an
   empty `<Select>` reads as broken.

**Done when.** A test asserts no `*.functions.ts` module reads `profiles.tenant_id` outside
`tenant-scope.ts`. Write that test first and let it fail with the list — it is the work plan.

**A second half nobody had named until W7.** Converting a module to `requireTenantId` fixes the
*scoping* but not the *reading*: several tables carry RLS keyed on `user_tenant_id(auth.uid())`,
which is NULL for a platform account, so a correctly-converted module still returns nothing.
Measured on the setup guide: a super_admin acting as Acme reads **0 of its 7 `training_courses`**,
so the guide showed 57% for them and 71% for Acme's own admin — same tenant, same day. The
conversion is a code change; this half is a migration widening those policies to admit an acting
platform admin. Both are needed, and the second is the larger of the two.

---

## Done in Wave 7 (2026-09-07) — guided setup and the policy library

Former Priority 2. Full record in `docs/plan-waves.md` § Wave 7.

- `/org/setup-guide` walks seven segments, **computing completion from the
  tenant's data rather than storing a flag** — so a segment reopens when its
  rows are deleted, and the Setup Lock extends `checkPayrollReadiness` instead
  of inventing a second notion of readiness.
- The policy document library (§9 item 4) with versioned acknowledgements, which
  Segment 7 and Phase 3 step 4 both depended on.
- Phase 3 provisioning: mandatory training and policy sign-offs, dated in the
  tenant's zone. Asset allocation is left to a person on purpose; KPI assignment
  reports itself **blocked** rather than becoming a fourth review pathway.
- Two defects found on the way: `tenants` had **no UPDATE policy for org_admin**
  (every profile write went through the service-role client, and a zero-row
  UPDATE returned `ok`), and the four long-standing test failures were **stale
  fixtures**, not a product bug. The suite is now green.

**The blocked items stay blocked, and for the same reasons:** split pay across
multiple accounts is still gated on reconciling three bank-detail shapes and two
TFN columns; the KPI library is still gated on the three review systems; ABN
Lookup and address autocomplete are external APIs needing a key.

---

## Done 2026-09-13 — Priority 1b, X-07's twin in the documents module

**Fixed.** `src/lib/documents-guard.ts` replaces `getOrgAdminTenant` with four named
guards mirroring the RLS; `20260913100000_documents_read_access.sql` adds the
`branch_admin` policies that never existed and defines envelope read visibility once, in
`can_read_document_envelope`, so `document_signers` and `document_events` follow the
envelope instead of stopping at org_admin. Without that last part finance and manager
would have read an envelope with **no signatories and a blank audit trail** — the same
defect one table deeper, and the version that looks like a finished answer.

`/org/documents/expiring` now carries its own key, `org.documentVerification`. It reads
`employee_documents` — passports, visas, certificates — and **no policy there admits
`finance`**. Reusing `org.documents` meant either an unexplained empty table or widening
finance into personal identity documents, which is a privacy decision, not a gating fix.

Two writes now read the row back: `branch_admin`'s `employee_documents` policy is
branch-scoped, so widening the guard made the W7 zero-row-UPDATE defect newly reachable.

**The demo seed created no documents at all**, which is why "No envelopes yet." looked
identical for a refused manager and a truthful org admin. Both tenants now have a
published template and a draft, envelopes for a manager's own report and for someone
outside that line, signers, events and expiring records — shaped so the read scoping is
observable rather than vacuously true.

Verified live under real JWTs (not as `postgres`), Acme, templates / envelopes / signers
/ events / employee-docs: `org_admin` 2/2/2/3/2 · `hr` 2/2/2/3/2 · `finance` 2/2/2/3/**0**
· `manager` **1**/**1**/1/1/**1** · `branch_admin` **1**/2/2/3/2 · `employee` 0/0/0/0/0.
The manager sees the published template but not the draft, her own direct report's
envelope but not the one reporting elsewhere, and the manager-visibility certificate but
not the passport.

`tests/documents-access.test.ts` pins the **server-fn axis** — the axis with no coverage,
and the one that would have caught both this and X-07 before a person did.

The original write-up follows, because the diagnosis is the reusable part:

**What.** `/org/documents` is offered by nav and route to six roles —
`super_admin`, `org_admin`, `branch_admin`, `hr`, `finance`, `manager`. Fourteen of the twenty-one
server functions in `documents.functions.ts` go through `getOrgAdminTenant`, which admits
**`org_admin` and `super_admin` only** and throws `"Not authorized"` for everyone else.

**Why it matters.** It renders as emptiness, not as an error — the same shape as every other defect
found in the last three waves. Verified live as `mia.acme` (manager): both `listEnvelopes` and
`listTemplates` returned `"Not authorized"`, and the page drew a table saying
**"No envelopes yet."** with a "Send document" button beside it. A manager reasonably concludes the
organisation has no documents. Four of the six admitted roles are affected.

**Corroborated across the whole role matrix.** The 2026-09-07 sweep walked all eight roles over
122 routes each. The three `/org/documents*` pages report console errors for **manager, hr, finance
and branch_admin — and for no one else.** That is precisely the set `org.documents` admits minus
the set `getOrgAdminTenant` admits, which makes the diagnosis certain rather than likely.

This is X-07 exactly: the nav and the route agree with each other, and the *server function*
disagrees with both. Wave 5 converged the first three gate axes and Wave 6 closed the RLS axis for
training; nothing systematically checks the server-fn axis, which is why this survived.

**What to build.** Decide the direction first — they are not equivalent, and the X-07 write-up sat
in this document with the direction wrong for months, so check the code before believing either:

- *Widen the guard* if HR and managers should administer documents. Replace `getOrgAdminTenant`
  with a guard mirroring the RLS write policies on `document_templates` / `document_envelopes`,
  the way `training-guard.ts` mirrors training's — and confirm those policies actually admit the
  wider set, or the failure just moves from `"Not authorized"` to a Postgres policy error.
- *Narrow the keys* if they should not. `org.documents` and `org.documentTemplates` drop to
  `super_admin` + `org_admin`, and four roles stop being offered a page that never worked for them.

The comment beside `org.documentTemplates` in `rbac.ts` currently reads "Matches org.documents —
same domain, same admins", which is true of the two keys and false of the module they gate.

**Done when.** As `mia.acme` (manager) and `hana.acme` (hr), `/org/documents` either lists
envelopes or is not offered. No third outcome — and in particular, not an empty table.

**Two more open observations from the same sweep — STILL OPEN, neither chased:**

- `/settings/billing` reports console errors for **every one of the eight roles**, usually two.
  Something on that page fails for everybody, including super_admin, which rules out a permission
  gate. Cheapest of the three to diagnose and the only one that affects all users.
- `/me/signatures` reports 3 console errors for `hr` and `branch_admin` and none for `employee`,
  `manager` or `super_admin` — verified clean by hand as a manager. Two roles at the same count is
  a pattern rather than noise, and it is *not* the guard above: the page's only server fn
  (`myPendingEnvelopes`) does not use `getOrgAdminTenant`.

**Worth doing at the same time:** a test asserting that every server fn reachable from a page is
callable by every role that page's feature key admits. That is the axis with no coverage, and it
is what would have caught both this and X-07 before a human did.

---

## Priority 2 — Performance, in the order it will bite

Measured 2026-09-03, not guessed. Neither item bites at demo scale; both are real at tenant scale.

**4a. 36 loop-with-query sites.** `payroll.functions.ts` has 8 — the hottest path in the product.
The pattern is a per-row lookup inside a `for` loop where one `.in()` would do. The fix is
mechanical and was already applied to the sharpest instance
(`generateSuperContributionsForRun`: 500 sequential round trips on a 500-employee run, now one
query). Work through `payroll.functions.ts` first.

**4b. ~~194 `useQuery` sites, 19 with `staleTime`~~ — this was wrong.** `src/router.tsx` sets a
**60-second `staleTime` and `refetchOnWindowFocus: false` as the client default**, so the queries
without an explicit `staleTime` were never refetching on every mount. Corrected 2026-09-08.

**4c. What the 2026-09-08 scan actually found**, in descending order of measured impact:

- **RLS re-deciding per row — fixed.** 606 of 690 policies called `auth.uid()` unwrapped, so each
  row re-parsed the JWT and re-ran `has_role` / `user_tenant_id` (SECURITY DEFINER functions with
  their own subqueries). `select count(*)` on a **54-row** table took **49ms**. Cumulative stats
  told the same story: 873,534 sequential scans of the 20-row `profiles` table, 8.36M rows read.
  Hoisting into scalar subqueries took that query to ~21ms and `tests/rbac.test.ts` from 28.46s to
  14.15s. See `20260908090000_rls_hoist_auth_uid.sql`.
- **The two-query tenant waterfall — 2 of 16 pages fixed.** Every page reading `profiles.tenant_id`
  then `tenants` pays two round trips *in series before its own query*, uncached, on every mount.
  `useMyTenantId()` / `useMyTenant()` already hold that value with `staleTime: Infinity`.
  `tests/tenant-loading-state.test.ts` lists the 14 remaining, and the list may only shrink.
- **39 `useEffect` blocks issue 77 direct Supabase queries**, 15 of them sequential waterfalls of
  2–6 queries (`admin.holiday-calendar`, `admin.holidays`, `admin.overtime-rates`,
  `admin.payroll-settings` are 6 each). These bypass React Query entirely: no caching, no
  `isLoading`, refetched on every mount. Converting them is the single largest remaining
  client-side win, and it fixes correctness as well as speed — see below.
- **Indexes are NOT the current bottleneck.** 69 tenant-scoped tables lack a leading `tenant_id`
  index, but every one is small enough that Postgres correctly prefers a sequential scan, and the
  RLS hot path (`profiles`, `user_roles`, `role_scope`, `platform_acting_tenant`) is already
  properly indexed. Revisit when a tenant's transactional tables reach thousands of rows; adding
  them now would cost writes for no measurable read gain.

**4d. `null` rendered as an answer — the "it fixes itself on refresh" class.** A page holding
`useState(null)` filled by an effect cannot distinguish "still loading" from "there is none", and
several rendered the second while in the first. `/org` told a signed-in org admin *"Your account
isn't linked to an organization yet"* for 400ms on every visit. Fixed on `/org`, `/org/employees`,
`/org/danger` and `/org/branches`; pinned by `tests/tenant-loading-state.test.ts`. The same shape
is latent in every one of the 39 effect-based loaders above.

**Done when.** No query inside a loop in `payroll.functions.ts`, and a documented default
`staleTime` on the query client with per-query overrides where they matter.

---

## Priority 3 — Named debt, safe to defer

- **Three unconnected review systems.** `performance_reviews`, `review_instances` and
  `duty_review_scores` share `review_templates` and never reconcile; there is no assignment table.
  Both previously-orphaned functions now have callers and targeting works, so this is a *modelling*
  gap, not a dead feature. Reconciling them is a wave of its own.
- **Attendance leftovers.** `clockOut` records position but does not validate it; WFH decisions
  notify in-app only; the 24h reconciliation cron does not know the newer WFH mismatch types;
  there is no tenant-level "remote work allowed" switch.
- **Four deliberately-uncalled server functions**, each waiting on a specific surface:
  `upsertAward` / `upsertAwardClassification` / `upsertAwardRate` need a platform-level catalogue
  editor (parked with D-8); `previewAuPeriod` wants a preview panel on `/org/payroll`. Recorded in
  `tests/no-orphan-server-fns.test.ts`.
- **`docs/schema-audit.md` is a proposal, not committed state.** Check the code before assuming
  anything in it was executed.

---

## How to not undo Waves 5, 6 and 7

W5 closed three of the four ways a page's permission could disagree with itself; W6 closed the
fourth; W7 added two more shapes of silent success to watch for. Every one was found by a person, not by the suite, and each is now held by a test that
fails loudly. Before changing gating, run:

```sh
bun run test tests/nav-route-gate-parity.test.ts tests/nav-render-filter.test.ts \
             tests/nav-integrity.test.ts tests/public-endpoint-security.test.ts \
             tests/no-orphan-server-fns.test.ts tests/au-guard-coverage.test.ts \
             tests/training-access.test.ts tests/postgrest-embeds.test.ts \
             tests/setup-guide.test.ts tests/policies-and-provisioning.test.ts
```

Three rules those tests encode, worth stating in prose because the next person will meet them:

1. **One feature key per page**, quoted by the nav row, the route gate and any inline check. If you
   are writing a role list by hand, you are creating the next dead link.
2. **A skip is a failure unless it is written down.** Every `continue` in those tests is now an
   allow-list entry with a reason. That is the whole lesson of the wave: a check that compares two
   things reports nothing when one of them is absent.
3. **A server function is a public HTTP endpoint.** A gated page calling an ungated function is an
   ungated function.
4. **W6's addition: an empty list is an answer, and it must be the true one.** Three separate
   defects in the training domain each rendered as an empty table or a "nothing configured yet"
   message. None threw. None was noticed. If a query can fail, the surface has to be able to say
   so — `requests-inbox` already does this correctly, and it is the reason the leave outage was
   diagnosable in one page load once the inbox was looked at. Run
   `tests/postgrest-embeds.test.ts` before adding a `.select()` embed.
5. **W7's addition: a write that changes nothing is not a success.** PostgREST answers an UPDATE
   matching zero rows with 200 and no error, so `if (error) throw` passes and the caller reports
   "saved". Add `.select()` and check a row came back — that is what turned an invisible RLS gap on
   `tenants` into a legible error.

---

## Baseline

A green test run reads **0 failed / 1,360 passed / 6 skipped**.

**This changed in Wave 7.** The baseline used to read "4 failed", and those four were stale
fixtures in `tests/onboarding-readiness.test.ts` describing a table shape that no longer exists —
not a product bug. A suite that is normally red cannot tell you when something breaks, which is the
only reason to have one, so treat any red as yours.

`tests/rbac.test.ts` and `tests/audit-overtime.test.ts` still cannot *collect* without live
service-role credentials. That is a missing credential, not a failure.


---

## T13–T27 (hrpplissues2.md) — what was built, and what was not

Worked through 2026-09-11 to 2026-09-13. Built and merged: **T13, T14, T16, T18, T19, T20,
T21, T22, T23, T24, T26**, plus the shippable half of **T15/T17**. Each has its own commit
explaining the defect; the two below are the ones deliberately *not* built, recorded here so
they are not mistaken for oversights.

### T25 — contextual help panel during setup (deferred by the client)

A right-hand info box explaining each field as the admin moves through setup.

**The client marked this "for a later stage, not now".** Logged so it is not lost. Note that
`src/components/setup/StepNote.tsx` already carries per-step explanatory copy inline, which
covers part of the intent — a panel would be a richer version of the same idea rather than a
new capability, so whoever picks this up should start there rather than from scratch.

### T27 — activate the advertisement and career page (needs scoping first)

The ticket says the client wants these live but does not say what "these" are. There are at
least three separable products in that sentence:

1. a public-facing careers page listing open roles;
2. job ad creation and publishing from inside the platform;
3. applications flowing back in, into the recruitment module.

**Estimating this without that answer would be guessing.** What already exists is worth knowing
before the conversation: `src/lib/careers.functions.ts`, `careers-analytics.functions.ts`,
`/org/recruitment` and its candidate pages, and `createResumeUploadUrl` — which is an
*unauthenticated* mint of a storage upload credential, rate-limited by
`enforcePublicRateLimit` since the 2026-09-03 audit. So (1) and part of (3) have foundations
already; (2) is the one with the least behind it.

**Recommended next step:** a short scoping call covering which of the three are in scope, who
publishes an ad and who approves it, and whether ads go anywhere external (Seek, LinkedIn) —
the last changes the answer substantially.

### T15 / T17 — address lookup, partially shipped

See **`docs/address-lookup.md`**. The provider interface and Australia's postcode→state rule
ship complete. Free-text autocomplete needs a provider decision and an API key; postcode→suburb
needs a ~16,000-row dataset. Nepal was verified as T17 asked and gets the province dropdown plus
manual entry — its postal data is district-level and addresses are written by ward and landmark,
so a postcode→suburb flow would match neither the data nor the habit.


---

## Payroll approval is unreachable through the UI (found 2026-09-13)

**Priority 1.** A payroll run can be created, computed and submitted, and then
nobody can approve it from the product. Three roles, three different reasons,
none of them visible from inside the app:

| Role | Sees `/org/payroll`? | `assertApproverForTenant` allows? | Result |
| --- | --- | --- | --- |
| `manager` | **No** — `can("org.payroll")` admits super_admin, org_admin, branch_admin, finance | **Yes** — it requires `manager` | Cannot open the page |
| `org_admin`, `finance`, `branch_admin` | Yes | **No** — "Forbidden: manager role required" | Approve button is not rendered for them |
| `super_admin` | Yes | Yes | Page shows "No runs yet" — see below |

The `super_admin` case was gap 1 in CLAUDE.md made concrete: `org.payroll.tsx`
resolved its tenant with a direct `profiles.tenant_id` read, which is NULL for
a platform account, so acting as a tenant through the TenantSwitcher did not
scope the page — the runs table was empty while the database held three runs
for that tenant.

**That third row is now FIXED** (2026-09-13). The page uses `useMyTenantId()`,
which falls back to the acting tenant, and re-runs when it changes. A
super_admin acting as a tenant can now see and approve that tenant's runs, and
`tests/tenant-loading-state.test.ts` lost an entry from its hand-rolled list.
That was a bug, not a permissions question, so it did not need the decision
below.

**Row 2 is now FIXED** (2026-09-13). `assertApproverForTenant` required the
`manager` role, which `org.payroll` does not admit — the page gate and the
server guard were near-complements, so the Approve button was hidden from
everyone who could reach the page. Both halves now read one exported set,
`PAYROLL_APPROVER_ROLES` in `rbac.ts`: **super_admin, org_admin, finance,
manager**. `org_admin` and `finance` can both open `/org/payroll` and approve,
so approval is reachable in a tenant with no platform account — which was the
actual outage.

Separation of duties is unchanged and is enforced **by person, not by role**:
`approvePayrollRun` still refuses when `submitted_by === userId`, so a second
org admin has to approve what the first submitted. Note this guard writes
through the **service-role** client, so there is no RLS behind it — it is the
only gate on the transition, not a legibility layer in front of one.

Both payroll guards also moved off their direct `profiles.tenant_id` read, so
they honour the acting tenant (gap 1, in the guard rather than the page).

`branch_admin` deliberately stays out: it can open the page, but a payroll run
is tenant-wide and spans every branch, so approving one is not a branch-scoped
act.

**Row 1 still stands, deliberately.** A `manager` keeps the right it has always
had and still cannot open `/org/payroll` — and should not, because that page
renders every payslip for every employee in the tenant. The proper home for a
manager's approval is **option 2, the `/approvals` queue**, which shows only
what the caller may decide. That remains open work, and
`tests/payroll-approver.test.ts` records `manager` as the known exception so it
is not mistaken for an oversight or silently "fixed" by widening
`org.payroll`.

**Not walked end to end in a browser:** every seeded Globex run is already
`approved` and Acme has none, so there was no `pending_approval` run to press
the button on. The change is pinned by unit tests and the reasoning is closed
(service-role write, pure-TypeScript guard, role and tenant reads verified
under a real JWT), but nobody has clicked Approve as `fred.acme`.

This is the W5 "nav row vs RLS policy" drift axis, in the one place W5 did not
reach. **It is a deliberate open finding, not something to fix in passing** —
each of the three repairs is a different product decision:

1. **Add `manager` to `org.payroll`.** Simplest, but the page shows every
   payslip for every employee, so this hands the whole salary list to every
   manager. Almost certainly wrong.
2. **Approve from `/approvals` instead.** The approvals queue already exists
   (T1–T5) and is the right shape: a manager sees only what they may decide.
   This is the recommended direction.
3. **Let org_admin approve.** Removes the separation of duties that stops the
   person who submitted a run approving it. Needs the client's view on whether
   that separation is a requirement for them.

Alongside (2), `org.payroll.tsx` should move to `requireTenantId()` /
`useMyTenantId()` so acting-tenant works there at all.

The seeded Globex runs are now **approved**, via the fixed super_admin path —
which is also what gave the new trend charts real data to render.
