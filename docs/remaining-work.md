# Remaining work — what is left to call this platform finished

**Written 2026-09-03**, after Wave 5 and audit A1. **Updated 2026-09-07**, after Wave 7.
**Struck through 2026-09-15**: everything with a line through it is done. What is *not* struck is
still open. The four genuinely open items are listed in "What is actually left" immediately below.

Waves 1–5 made the product *correct* and *reachable*: no dead links, no orphan server functions,
no unauthenticated endpoint outside the declared thirteen. Wave 6 built the LMS and closed X-07,
the last drift axis; Wave 7 built the guided setup, the policy library and Phase 3 provisioning.
~~What is left is genuinely unbuilt, plus two pieces of debt with names.~~ As of 2026-09-15 what
is left is one product decision, one modelling question, some uncached reads, and the parked items.

Each item below carries the same four things, so it can be picked up cold: **what**, **why it
matters**, **what to build**, and **how you know it is done**.

---

## What is actually left (2026-09-15)

Anything struck through below is done. The rest of the document is either a record of work
already completed or one of these four, which are the only things still genuinely open:

1. **A `manager` still cannot approve a payroll run** — needs the `/approvals` queue (option 2 in
   the last section). `org_admin` and `finance` can, so this is no longer an outage.
2. **Whether the three review systems should converge at all**, and the assignment table that
   would presume they should. Their keys are fixed; the modelling question is untouched.
3. **The remaining effect-based loaders** — single uncached reads, no waterfalls left. Caching
   work, not correctness work, and worth measuring before doing.
4. **The parked items**, each waiting on something external: SCORM, the cross-tenant course
   library (D-8), split pay across accounts, the KPI library, ABN Lookup / address autocomplete,
   T25 (deferred by the client) and T27 (needs scoping).

Also unverified rather than unbuilt, and deliberately so:

- **The QA sweep has not been re-run**, so `docs/qa-sweep-report.md` is still the pre-W5 one and
  says so itself. It was offered on 2026-09-15 and declined — not an oversight, and not to be read
  as "swept clean". It remains **the outstanding verification step**: it is the only check that
  exercises all eight roles in a real browser, and the only thing that would confirm the
  `/settings/billing` and `/me/signatures` console errors really were artefacts of the sweep's own
  navigation rather than defects. Everything this session changed was verified by tests, by
  typecheck, and by live SQL under real JWTs — but not by a person or a browser walking the app.
- **The payroll Approve button has not been clicked in a browser** — every seeded Globex run is
  already `approved` and Acme has none, so there was no `pending_approval` run to press it on.

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

## Priority 1 — Acting-tenant coverage: code half DONE (2026-09-14), ~~RLS half open~~ **RLS half DONE (2026-09-14)**

**The code half is complete.** 92 direct `profiles.tenant_id` reads across 52 server modules
now resolve through `requireTenantId()` / `getTenantId()`. **65 of 104 `*.functions.ts` modules
import `tenant-scope`** (was 14 of 97); the rest legitimately need no tenant.
`tests/acting-tenant-coverage.test.ts` is the test this section asked for, and it fails with the
offending file and line.

A hole in this work, found and closed the same day: **`billing.functions.ts` is written with
single quotes**, so a `.from("profiles")` scanner reported it clean while it held **eight** of
exactly the reads this test exists to find. The scanner now accepts both quote styles — the Wave 5
lesson (*a check comparing two things reports nothing when one of them is absent*) turning up
inside the check itself.

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

**The routes are done too** (2026-09-14). All thirteen `*.tsx` files now use `useMyTenantId()` /
`useMyTenant()` / `useMyTenantCountry()`, so `HANDROLLED_TENANT_LOOKUP` in
`tests/tenant-loading-state.test.ts` is **empty**. This closed three separate items at once: the
route half of Priority 1, §4c's two-query waterfall, and §4d's latent `null`-as-an-answer.

Five of the thirteen were the *same* two-query country lookup (`profiles` → `tenants.country_code`)
copied into five admin pages; that is `useMyTenantCountry()`, cached on the shared tenant id.

One real defect surfaced on the way. `admin.onboarding-packs` read
`.select("tenant_id").maybeSingle()` on `profiles` with **no id filter at all** — whichever row RLS
happened to return. It worked by accident for an `org_admin`, who can read exactly one profile:
their own. But `org.onboardingPacks` admits `super_admin`, who reads all 20 (measured), and
PostgREST answers `.maybeSingle()` over 20 rows with an error — so `tenantName` never left its
`"hrppl"` default and the generated pack was branded **hrppl for precisely the platform account**,
and correct for everybody else. A read that depends on how few rows you can see is not a read.

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

### ~~The original entry~~ — every line below is now done; kept for the diagnosis



~~**What.** `TenantSwitcher`, `ActingTenantBanner` and `platform_acting_tenant` all exist and work.
Only the modules calling `requireTenantId()` / `getTenantId()` honour them; the rest read
`profiles.tenant_id` directly, which is `NULL` for a platform account. Wave 6 converted
`training.functions.ts` and wrote `training-lessons.functions.ts` on `requireTenantId` from the
start, taking the count from 13 to 14 — 83 to go.~~

~~**Why it matters.** As `sam.platform` acting as Acme, `/org/payroll` works and `/org/analytics`
says "No tenant". Same switcher, same account, two different answers page by page. It is the
largest architectural inconsistency left, and it makes the platform roles undemonstrable on any
surface that has not been converted.~~

It is **not** a leak — the direct read is still tenant-bound. It is a correctness and UX gap.

~~**What to build.** Mechanical, and worth doing in batches by domain rather than all at once:~~

1. ~~Replace `const { data: prof } = await supabase.from("profiles").select("tenant_id")…` with
   `const tenantId = await requireTenantId(supabase, userId)`.~~
2. ~~Use `getTenantId` where "no tenant" is a legitimate answer the page should explain, and
   `requireTenantId` where it is an error.~~
3. ~~Carry a `noTenantScope` flag to the UI rather than rendering an unexplained empty page — an
   empty `<Select>` reads as broken.~~

~~**Done when.** A test asserts no `*.functions.ts` module reads `profiles.tenant_id` outside
`tenant-scope.ts`. Write that test first and let it fail with the list — it is the work plan.~~

~~**A second half nobody had named until W7.** Converting a module to `requireTenantId` fixes the
*scoping* but not the *reading*: several tables carry RLS keyed on `user_tenant_id(auth.uid())`,
which is NULL for a platform account, so a correctly-converted module still returns nothing.
Measured on the setup guide: a super_admin acting as Acme reads **0 of its 7 `training_courses`**,
so the guide showed 57% for them and 71% for Acme's own admin — same tenant, same day. The
conversion is a code change; this half is a migration widening those policies to admit an acting
platform admin. Both are needed, and the second is the larger of the two.~~

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

~~**What to build.** Decide the direction first — they are not equivalent, and the X-07 write-up sat
in this document with the direction wrong for months, so check the code before believing either:~~
*(Direction chosen: widen the guard AND admit branch_admin — both were done.)*

- ~~*Widen the guard* if HR and managers should administer documents. Replace `getOrgAdminTenant`
  with a guard mirroring the RLS write policies on `document_templates` / `document_envelopes`,
  the way `training-guard.ts` mirrors training's — and confirm those policies actually admit the
  wider set, or the failure just moves from `"Not authorized"` to a Postgres policy error.~~
- ~~*Narrow the keys* if they should not. `org.documents` and `org.documentTemplates` drop to
  `super_admin` + `org_admin`, and four roles stop being offered a page that never worked for them.~~

~~The comment beside `org.documentTemplates` in `rbac.ts` currently reads "Matches org.documents —
same domain, same admins", which is true of the two keys and false of the module they gate.~~

~~**Done when.** As `mia.acme` (manager) and `hana.acme` (hr), `/org/documents` either lists
envelopes or is not offered. No third outcome — and in particular, not an empty table.~~

~~**Worth doing at the same time:** a test asserting that every server fn reachable from a page is
callable by every role that page's feature key admits. That is the axis with no coverage, and it
is what would have caught both this and X-07 before a human did.~~

**DONE 2026-09-14** — `tests/server-fn-role-parity.test.ts`. It resolves each page's feature key,
finds the server fns that page calls **as it loads** (inside `useQuery` / `useEffect` / a
`queryFn`), recovers each fn's guard role set, and fails when the fn refuses a role the page
admits.

**It only checks on-mount reads, and that is the point.** A page may legitimately admit six roles
to read and three to write — `/org/documents/templates` does exactly that, deliberately. Checking
every call site produces **143 findings**, almost all correct by design, which is how a check stops
being read. A write behind a button that refuses gives an error toast: visible and actionable. A
read that refuses gives an empty table: neither. Filtering to on-mount reads takes it from 143 to
**24**, and the ones hand-checked are all real.

~~**19 of the 24 are now closed (2026-09-14/15); five remain and are one question.**~~ — superseded: all 24 closed, see below.

| Group | What | Outcome |
| --- | --- | --- |
| A | white-label, payroll setup, org reports — guard behind its key | Widened, with `20260914100000` for the two tables whose policies also refused |
| B | seven pages admit `hr`, every one refused it | Widened, with `20260914110000` for the five tables that had no hr policy |
| C | performance audit trail, departments picker | Widened — RLS already served those roles, no migration needed |
| D | access-audit panel, reminder-schedule preview | **Panel gated, permission unmoved** — see below |

**Group D is the interesting one**, because both the options the doc named were
wrong. `/admin/employees/$id` offered an "Access audit" tab to all six roles
`org.employees` admits, while the fn answers to org_admin and super_admin.
Widening would let a manager see which colleagues had viewed an employee's
confidential records — weakening the deterrent the log exists to be. Narrowing
`org.employees` would remove five roles from employee records, which they have
legitimate reasons to open. So the **panel** carries the narrower answer and the
**page** keeps the broader one. Same shape on `/org/performance`'s reminder
preview.

**All twenty-four are now closed (2026-09-15), and `KNOWN_GAPS` is empty.**

The last five were the interesting ones, because they were **not oversights**.
`timeline.functions.ts` and `teams.functions.ts` both stated, beside their
guards, that finance and branch_admin were deliberately excluded — *"finance
holds read-only access to employees and branch_admin is scoped to a branch,
neither of which matches what these endpoints do"*. Both halves of that were
true, and `org.teams`, `org.idRequests`, `org.assets` and `org.employees`
admitted both roles to the pages regardless.

So the endpoints were changed to fit the roles rather than the guards widened to
ignore the objection:

- **`branch_admin` is admitted with the rows narrowed** to the branches they
  administer, via `resolveBranchScope` / `branchFilter` in `tenant-scope.ts` — a
  server-side mirror of `has_branch_access`. The objection was that these
  endpoints are tenant-wide; they are no longer tenant-wide for that role.
- **`finance` is admitted tenant-wide**, because "read-only" was never an
  argument against a *read*. Everything behind that guard is a read.

**The rule that decides whether this fixes a page or empties it:** an untagged
row stays visible. `has_branch_access` returns true for `branch_id IS NULL`
("row not yet branch-tagged; defer to the tenant check"), and in this database
*nothing* is tagged — all 19 seeded employees have `branch_id = NULL`. A plain
`.in("branch_id", ids)` matches no NULL in Postgres, so it would have hidden
every employee from every branch admin and turned a scoping fix into exactly the
empty page this whole exercise exists to stop. `tests/branch-scope.test.ts`
pins it.

Verified against the live database: `bruce.acme` (branch_admin) has no
`role_scope` row and every employee is untagged, so he sees all nine of his
tenant's — no regression. With two branches tagged and Bruce scoped to Sydney,
he sees **6 of 9** and Melbourne's three are hidden.

The analysis is deliberately conservative — a gate it cannot resolve is **skipped, not passed** —
and it asserts how much it *can* resolve (36 on-mount call sites) so that a refactor which blinds
it fails loudly rather than turning the file green. Verified non-vacuous in both directions:
widening one guard makes the shrink-check name the exact entry to delete.

**Two more open observations from the same sweep — CHASED 2026-09-14, and both look like
artefacts of the sweep itself.**

Neither reproduces. Probed with Playwright against the live dev server, signed in as real seeded
accounts, both with a clean navigation and with the sweep's own back-to-back `page.goto()`
pattern: **zero console errors** on `/settings/billing` (org_admin, hr) and on `/me/signatures`
(hr, branch_admin, manager, employee), and both pages render correctly.

**The likely cause, now fixed.** `AuthRouteGate`'s status check runs on *every* route and is
cancelled by any navigation — `pathname` is one of its dependencies. The browser reports a
cancelled request as `TypeError: Failed to fetch`, indistinguishable by type from a server that is
genuinely down, and the gate logged it at `console.error`. Because the sweep navigates with a full
page load per route, one page's cancellation was recorded against the page being *navigated to*.
That explains both shapes: every role hitting it on one page, two roles on another. The gate now
stays silent for a cancelled or aborted check and still logs real failures.

I saw exactly one such error while probing — `[AuthRouteGate] org status check failed TypeError:
Failed to fetch` on `/settings/billing` as `hr` — and it did not recur. That is the fingerprint.

**Not proof.** The sweep report is from 2026-09-07 and the code has moved a lot since. If these
reappear in the next sweep they are real, and the gate is no longer the explanation.

**Two genuine defects were found underneath them anyway**, both of the recurring shape:

- `/settings/billing` never handled `isError`. A failed read fell through to the normal render and
  drew a plan card with every field blank and an empty payment history — a failure that looks like
  an answer, on the page where somebody acts on the answer.
- `/me/signatures` called `list().then(...)` with **no `.catch` and no loading state**, so a failed
  read raised an unhandled promise rejection *and* left the page saying "All caught up." A contract
  nobody signs because they were told there was nothing to sign is the expensive version of this
  defect.

---

## Priority 2 — Performance, in the order it will bite

Measured 2026-09-03, not guessed. Neither item bites at demo scale; both are real at tenant scale.

**4a. ~~36 loop-with-query sites, 8 in `payroll.functions.ts`~~ — the payroll half is already
done.** Re-measured 2026-09-14: `payroll.functions.ts` contains **zero** queries inside a loop.
`computePayrollRun` batch-fetches holidays, attendance, timesheets, penalties, leave, rates and
components up front and then loops over arrays in memory, which is the shape this item was asking
for. The detector is not broken — it finds **16 such loops across 13 other modules**, the largest
being `payroll-emails` (2), `leave-accruals` (2) and `billing-admin` (2).

So this item's stated "done when" — *no query inside a loop in `payroll.functions.ts`* — is
**satisfied**. The remaining 16 are outside the hot path; none has been measured as a problem, and
the honest next step is to measure before converting rather than to convert on principle.

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
- **The two-query tenant waterfall — DONE (2026-09-14), 16 of 16 pages.** Every page reading
  `profiles.tenant_id` then `tenants` paid two round trips *in series before its own query*,
  uncached, on every mount. All of them now use `useMyTenantId()` / `useMyTenant()` /
  `useMyTenantCountry()`, which hold those values with `staleTime: Infinity`.
  `HANDROLLED_TENANT_LOOKUP` in `tests/tenant-loading-state.test.ts` is empty, and that test's
  scanner now strips comments before matching — a comment explaining what a page *used* to do has
  to quote the code it replaced, and the checker failed on its own documentation otherwise.
- ~~**39 `useEffect` blocks issue 77 direct Supabase queries**, 15 of them sequential waterfalls of
  2–6 queries (`admin.holiday-calendar`, `admin.holidays`, `admin.overtime-rates`,
  `admin.payroll-settings` are 6 each). These bypass React Query entirely: no caching, no
  `isLoading`, refetched on every mount. Converting them is the single largest remaining
  client-side win, and it fixes correctness as well as speed — see below.~~ **Partly done** —
  counts were pre-waterfall; the four admin pages are now 4 each, the two real waterfalls are
  converted, and the correctness half (§4d) is closed on the five pages that mattered. What is
  left is single uncached reads. See "Progress on the `useEffect` blocks" below.
- **Indexes are NOT the current bottleneck.** 69 tenant-scoped tables lack a leading `tenant_id`
  index, but every one is small enough that Postgres correctly prefers a sequential scan, and the
  RLS hot path (`profiles`, `user_roles`, `role_scope`, `platform_acting_tenant`) is already
  properly indexed. Revisit when a tenant's transactional tables reach thousands of rows; adding
  them now would cost writes for no measurable read gain.

**4d. `null` rendered as an answer — the "it fixes itself on refresh" class.** A page holding
`useState(null)` filled by an effect cannot distinguish "still loading" from "there is none", and
several rendered the second while in the first. `/org` told a signed-in org admin *"Your account
isn't linked to an organization yet"* for 400ms on every visit. Fixed on `/org`, `/org/employees`,
`/org/danger` and `/org/branches`; pinned by `tests/tenant-loading-state.test.ts`. ~~The same shape
is latent in every one of the 39 effect-based loaders above.~~ **Closed 2026-09-15 on the five
employee-facing pages where it mattered** (`/leave`, `/attendance`, `/performance`, `/team`,
`/my-payslips`); a repo-wide scan found 29 such strings, of which only those five were defects.

**Done when.** ~~No query inside a loop in `payroll.functions.ts`~~ — satisfied, see 4a — and a
documented default `staleTime` on the query client with per-query overrides where they matter,
which `src/router.tsx` has had since before 4b was corrected.

**Progress on the `useEffect` blocks (2026-09-14).** The doc's "39 blocks / 77 queries, four
admin pages at 6 each" was measured before the tenant-waterfall work. Re-measured after it, those
four admin pages are at **4 each** — exactly the `profiles` → `tenants` pair removed — which
corroborates both counts.

Converted since, the two with real sequential waterfalls:

- **`/my-payslips`** ran four queries strictly in series (employees → tenants → payslips → runs).
  Only two of those steps genuinely depend on each other; the tenant read depended on nothing but
  the tenant id and is now the shared cached record, so it is gone rather than reordered.
- **`/org/payroll`** held the tenant id **twice** — `useMyTenantId` *and* a `useState` the effect
  mirrored it into — and could render with the two disagreeing for a tick. Its three reads
  (`tenants`, `tenant_payroll_settings`, `tenant_subscriptions`) ran in series although none
  depended on another. One is now cached and the other two run together.

**§4d is closed on the five pages where it mattered most.** `/leave`, `/attendance`,
`/performance`, `/team` and `/my-payslips` each stated an empty result while still loading — "No
goals yet." to somebody who has goals, "No approved payslips yet." to somebody who has been paid.
`/leave` also conflated "this organisation has no leave types" with "your account has no employee
record"; those are now different sentences. Pinned by a new describe block in
`tests/tenant-loading-state.test.ts`, verified non-vacuous.

Two things worth knowing for whoever continues:

- A repo-wide scan finds **29 "No …" strings across 13 effect-loaded pages**, of which five were
  defects. The rest are honest labels ("No limit", "No scopes", "No reset token found in that
  link"). That is why the test lists its claims explicitly rather than detecting them — a checker
  that cannot tell a claim from a label produces noise, and noisy checks stop being read.
- `auAddon` on `/org/payroll` was the same bug in a different costume: the AU upsell banner keys
  on `auAddon === false`, so defaulting it to `false` flashed "you do not have the add-on" at
  tenants that have it. It stays `null` until the answer arrives.

**Still left:** the remaining effect-based loaders, none of which is a multi-query waterfall any
more — they are single uncached reads. Converting them is caching work, not correctness work, and
should be measured before it is done.

---

## Priority 3 — Named debt, safe to defer

- **Three unconnected review systems — mapped 2026-09-15, and the framing was wrong.** They are
  not one system split three ways. They assess three different **units**, and that may well be
  correct:

  | System | Assesses | Granularity | Cycle | Rows |
  | --- | --- | --- | --- | --- |
  | `performance_reviews` | the **person** | one per employee per cycle | `review_cycles` table | **9** |
  | `review_instances` | a **competency** | one per employee × competency × scheduled period | none — `period_label` string | 0 |
  | `duty_review_scores` | a **duty** | one per employee × duty × cycle | none — `cycle_label` **free text** | 0 |

  **"They share `review_templates`" was not true structurally.** Six tables carried a
  `template_id` with **no foreign key on any of them**. Nothing embeds them yet, so it was latent
  rather than broken — but it is the PGRST200 shape that silently emptied four training surfaces.
  Fixed in `20260915090000`, with each target **verified against real rows first**: two of them
  point at `feedback_question_templates`, not `review_templates`, and an FK to the obvious-looking
  table would have broken every 360-feedback insert.

  **A live defect was underneath.** `duty_review_scores.cycle_label` was free text supplied by the
  caller while `kpi_review_cycles` has both an `id` and a `label` — and `upsertCycle` lets an admin
  **rename** a cycle. Every score filed under the old label then stopped resolving to it: the
  scores still existed and nothing pointed at them. `/admin/duty-reviews` made it worse by building
  its default from the clock (`2026-Q3`) while its picker held each cycle's `id` and used
  `value={c.label}` — so a score could be filed against a label no cycle had ever had.

  Scores are now keyed on `cycle_id`, with the label still written as the record of what the cycle
  was called at the time. Verified live: after renaming a cycle the score still resolves to it.
  All three tables were empty, which made this the cheapest possible moment to fix it.

  **Still open, and still a wave:** whether these three should converge at all, and the assignment
  table that would presume they should. The evidence above makes that less obvious than the
  original one-line summary assumed — start from the table, not from "reconcile them".
- **~~Attendance leftovers~~ — three of the four were already done; the fourth is now closed.**
  Checked item by item on 2026-09-15 rather than taken on trust, and the entry was stale:
  - *"`clockOut` records position but does not validate it"* — it does.
    `classifyClockOutGeofence` has been flagging out-of-fence clock-outs and writing
    `geofence_reconciliation` rows for some time, with a comment explaining why the punch is
    recorded and flagged rather than refused (you should not be trapped on site to end a shift).
  - *"WFH decisions notify in-app only"* — they send email too, reusing `notify_leave_decision`.
    The code still carries the "In-app only until now" comment from when that was fixed.
  - *"the 24h reconciliation cron does not know the newer WFH mismatch types"* — it does, and
    carries a comment describing the exact defect (every WFH punch was re-flagged a second time
    as an unexplained `no_geofence_for_punch`, mislabelling a sanctioned remote day).
  - *"there is no tenant-level remote work switch"* — `tenants.wfh_enabled` exists,
    `createWfhRequest` enforces it, and `/admin/wfh` can toggle it.

  **But the switch only closed the front door.** `decideWfhRequest` never checked it, so requests
  filed *before* it was turned off stayed in the queue and could still be **approved** — and an
  approved window authorises remote clock-in. An organisation that had just said "no remote work"
  went on permitting it, through a queue nobody thought of as a second entrance. Approving now
  refuses while the switch is off; **rejecting deliberately still works**, because an approver must
  be able to clear a queue they can no longer say yes to.

  Switching off still does **not** revoke already-approved windows — somebody was told they may
  work from home that day, and attendance is the input to pay, which is the same good-faith rule
  `20260823060000`'s lifecycle trigger applies to a request with a punch under it. Instead the
  count of windows still in force comes back and `/admin/wfh` says so, because a consequence
  nobody is told about is one nobody accounts for. `tests/wfh-switch.test.ts` pins both halves.
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

Seven more were added 2026-09-14/15 and belong in that list — the command above predates them:

```sh
bun run test tests/server-fn-role-parity.test.ts tests/documents-access.test.ts \
             tests/acting-tenant-coverage.test.ts tests/branch-scope.test.ts \
             tests/payroll-approver.test.ts tests/wfh-switch.test.ts \
             tests/review-systems-keys.test.ts
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

~~A green test run reads **0 failed / 1,360 passed / 6 skipped**.~~ As of 2026-09-15 a green run
reads **0 failed / 1,451 passed / 6 skipped** — the difference is this session's new tests.

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

## ~~Payroll approval is unreachable through the UI~~ (found 2026-09-13, **REACHABLE since 2026-09-13**)

~~**Priority 1.** A payroll run can be created, computed and submitted, and then
nobody can approve it from the product.~~ Two of the three rows below are fixed;
row 1 stands deliberately. Three roles, three different reasons,
none of them visible from inside the app:

| Role | Sees `/org/payroll`? | `assertApproverForTenant` allows? | Result |
| --- | --- | --- | --- |
| `manager` | **No** — `can("org.payroll")` admits super_admin, org_admin, branch_admin, finance | **Yes** — it requires `manager` | Cannot open the page |
| ~~`org_admin`, `finance`, `branch_admin`~~ | ~~Yes~~ | ~~**No** — "Forbidden: manager role required"~~ | ~~Approve button is not rendered for them~~ **FIXED** |
| ~~`super_admin`~~ | ~~Yes~~ | ~~Yes~~ | ~~Page shows "No runs yet"~~ **FIXED** |

~~The `super_admin` case was gap 1 in CLAUDE.md made concrete: `org.payroll.tsx`
resolved its tenant with a direct `profiles.tenant_id` read, which is NULL for
a platform account, so acting as a tenant through the TenantSwitcher did not
scope the page — the runs table was empty while the database held three runs
for that tenant.~~

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
reach. ~~**It is a deliberate open finding, not something to fix in passing** —
each of the three repairs is a different product decision:~~
**Decision taken 2026-09-14: option 3 (widen to org_admin and finance).**

1. ~~**Add `manager` to `org.payroll`.** Simplest, but the page shows every
   payslip for every employee, so this hands the whole salary list to every
   manager. Almost certainly wrong.~~ Rejected, for the stated reason.
2. **Approve from `/approvals` instead.** The approvals queue already exists
   (T1–T5) and is the right shape: a manager sees only what they may decide.
   This is the recommended direction. **← STILL OPEN.** It is the only way a
   `manager` ever approves, and row 1 of the table above waits on it.
3. ~~**Let org_admin approve.** Removes the separation of duties that stops the
   person who submitted a run approving it. Needs the client's view on whether
   that separation is a requirement for them.~~ **CHOSEN and done** — and the
   separation survives, because it was never the role enforcing it:
   `approvePayrollRun` refuses the submitter by user id.

~~Alongside (2), `org.payroll.tsx` should move to `requireTenantId()` /
`useMyTenantId()` so acting-tenant works there at all.~~ Done.

The seeded Globex runs are now **approved**, via the fixed super_admin path —
which is also what gave the new trend charts real data to render.

> **Net position:** approval is reachable today by `org_admin` and `finance`.
> The one open item in this section is giving a **`manager`** a way to approve —
> option 2, the `/approvals` queue.
