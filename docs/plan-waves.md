# Tenant isolation, seed data, module completion & IA rework

## Status

| Wave | State |
| --- | --- |
| W1 · Correctness & data | **Done** |
| W2 · Platform hygiene & QA harness | **Done** |
| W2.5 · CodeQL fix + attendance overhaul | **Done**, migration applied and verified live |
| W3.0 · Tenant switcher | **Done** |
| W3.2 · Leave & holidays | **Done** |
| W3.1 · KPI/KRA distribution | **Done** |
| W3.3 · WFH + geofence exception | **Done** |
| W4 · Information architecture | **Done** |
| W5 · Reachability (P0–P5) | **Done**, merged 2026-09-03 · closed out 2026-09-03 (qa-sweep) |
| A1 · Security & performance audit | **Done**, migration applied and verified live |
| W6 · Learning (LMS) | **Done**, 5 migrations applied and verified live · closes X-07 |
| W7 · Guided onboarding routes | **Done**, 2 migrations applied and verified live |

## Working agreement

- **Feature branches, merged, kept.** Work lands on a named branch, is merged
  into `main` with `--no-ff`, and the branch is *not* deleted. Nothing is
  committed directly to `main`.
- **No more repo-wide audits.** W1 and W2 each opened with a sweeping audit;
  those were worth doing once. From here the work is scoped to what was asked
  for.
- **Migrations go through `scripts/apply-migration.mjs`**, reading
  `SUPABASE_ACCESS_TOKEN` from `.env` (gitignored). Always follow an apply with
  `--types`. Verify RLS changes under a real JWT — `--sql` runs as `postgres`,
  which bypasses RLS entirely and will happily tell you a broken policy works.

## Context

Two things prompted this. First, a concrete bug: clicking **Initiate** on `/admin/offboarding`
fails with `new row violates row-level security policy for table "offboarding_cases"`, and the
employee dropdown on that page lists every employee in every tenant, including the user
themselves. Second, a broader observation that the app has grown to 101 navigation items across
159 routes, several modules are half-wired, and the demo tenant has empty dropdowns because the
seed never populated its lookup tables.

Three parallel audits (RLS/seed, product modules, UI/network) were run against the code and their
findings verified against the live database. The result is below. **The audits changed the shape
of the problem**: the offboarding failure and the dropdown leak are not two bugs, they are one,
and the same pattern repeats across roughly 25 more query sites.

### Decisions taken with the user

| Question | Answer |
|---|---|
| First wave | **Correctness & data first.** Everything else planned but queued. |
| KPI/KRA model | HR assigns to a cycle; **employee self-assesses, manager reviews**; due dates, mandatory, reminders. |
| WFH + geofence | Approved WFH lets the clock-in **succeed outside the fence**, flagged for priority review by manager/HR. |
| UI rework | **Nav IA + role dashboards, design doc first**, then code. |

### One decision still open (flagged, not blocking)

`ADMIN_LAYOUT_ROLES` lets `hr`, `finance`, `branch_admin` and `regional_admin` onto
`/admin/offboarding`, but the RLS policy admits only `org_admin | super_admin | manager`. So HR
reaches the page and the database rejects them. **Recommendation: widen the policy to include
`hr`** — offboarding is an HR function — and narrow the route gate to match the policy exactly.
W1.1 assumes this; it is a one-line change to reverse.

---

## What the audit established

**The offboarding failure and the dropdown leak are the same bug.**

`listEmployeesForAdmin` (`src/lib/timeline.functions.ts:133-143`) selects from `employees` with
no `.eq("tenant_id", …)` at all — it relies entirely on RLS. That works for `org_admin`/`hr`/
`manager`, and fails open for `super_admin`, whose policy `"super admin all employees"`
(`20260603213444:100-103`) carries **no tenant predicate**.

Verified live: `sam.platform@demo.hrppl.test` is `super_admin` + `org_admin` with
`profiles.tenant_id = Demo ORG` (1 employee — himself). The dropdown shows all **15** employees
across all **3** tenants. `createOffboarding` (`src/lib/offboarding.functions.ts:38-51`) copies
`tenant_id` from *the selected employee*, so picking any of the other 14 builds a row whose
`tenant_id` ≠ `user_tenant_id(auth.uid())` and `WITH CHECK` rejects it
(`20260606100321:181-185`, read verbatim).

The only employee Sam can successfully offboard is himself. `rita.platform` (`regional_admin`)
has `profiles.tenant_id = NULL`, so `user_tenant_id()` returns NULL and **every** insert fails.

**Seed gaps — verified by row count, not by reading the script:**

| Empty (0 rows) | Populated |
|---|---|
| `expense_categories` ← the screenshot | `leave_types` 9 |
| `public_holidays` | `onboarding_checklists` 10 (trigger) |
| `payroll_components`, `training_courses` | `offboarding_checklist_templates` 6 (trigger) |
| `award_types`, `feedback_question_templates` | `review_templates` 2 (applied by hand) |
| `document_templates`, `recruitment_stages` | `employees` 15, `tenants` 3 |
| `review_cycles` 0, `review_instances` 0 | |

`review_cycles = 0` and `review_instances = 0` is the direct answer to *"I don't see a way to push
those KRA/KPI forms"* — templates exist, but nothing has ever been distributed.

**Three unconnected review systems exist**, not one: `performance_reviews` (cycle fan-out),
`review_instances` (schedule-based scorecards), and `duty_review_scores` (duty-based KPI). They
share the `review_templates` table but never reconcile. `reviewReviewInstance`
(`src/lib/review-instances.functions.ts:226`) — the approve/reject server fn — **has zero
callers**. The templates page tells users to go to "Performance → Cycles", a page that does not
exist under that name.

**21 pages render no `AppShell`**, not 13. `admin.tsx:8` is a bare `<Outlet/>` (deliberate,
pinned by a test) — but `org.tsx:56` is **also** a bare `<Outlet/>` on the path every real user
takes, which CLAUDE.md:217-219 gets wrong. So `/org/employees`, `/org/payroll`, `/org/leave`,
`/org/reports` and 4 more are chrome-less too. `/admin/kpi-kra` (the screenshot) is one of the 13.

**The loading bar has three unbalanced paths.** `emitRouteRevalidating` has exactly two call
sites, both in `AuthRouteGate.tsx` (`:185` true, `:265` false). The stop is double-guarded by
`if (!cancelled)` *and* `if (fullyCached)`. When the effect is cancelled mid-flight the `true` is
never retracted, and if the successor run has `fullyCached === false` it emits neither value — the
bar sticks on, animating `infinite` (`RouteLoadingBar.tsx:44`) with no visual decay.

**`listNotifications` fires on every navigation.** `NotificationsBell` (`AppShell.tsx:1246`) uses a
raw `useEffect` + `setInterval(60_000)` with no cache. Because `AppShell` is rendered *per route*
rather than once at the root, every navigation unmounts and remounts the whole header cluster,
re-firing the fetch and restarting the timer. `getMyGateStatus` and `getMyOrgStatus` also overlap,
returning the same roles/tenant from two non-interoperating caches.

---

## Wave 1 — Correctness & data (approved to go first)

### W1.1 · Offboarding: fix the leak, and the insert fixes itself

- **`src/lib/timeline.functions.ts:133`** — `listEmployeesForAdmin` takes the caller's tenant from
  `profiles` and scopes the query: `.eq("tenant_id", tenantId).eq("status","active")`, plus an
  `excludeSelf` option (default on) resolved via the existing `my_employee_id()` SECURITY DEFINER
  helper (`20260613134746`). This one change fixes the leak on all three consumers —
  `admin.offboarding.tsx:53`, `admin.assets.tsx:43`, `admin.medical.tsx:51`.
- **`src/lib/offboarding.functions.ts:38-51`** — stop trusting the selected employee's tenant.
  Resolve the caller's tenant, and assert `emp.tenant_id === callerTenant` before inserting, with
  a clear error rather than a raw Postgres RLS message.
- **Platform admins**: `super_admin`/`regional_admin` with no tenant (or acting outside it) get an
  explicit empty state — "select a tenant on /platform/tenants first" — not a silent cross-tenant
  list. No tenant-switching feature this pass; that is a separate build.
- **New migration** — add `hr` to the `offb tenant admin` policy (per the open decision above),
  and narrow `admin.offboarding.tsx:29` from `ADMIN_LAYOUT_ROLES` to a named set in `rbac.ts`
  matching the policy exactly. `tests/admin-gate-role-sets.test.ts` pins the change.
- **`src/routes/admin.offboarding.tsx:31`** — fix the one genuine lint error in the module
  (`react-hooks/rules-of-hooks`: `useRouter()` inside the lowercase `errorComponent`). The other
  59 findings are all `no-explicit-any`; type the offboarding row and form payload so
  `form as any` at `:70` and `(emp as any).tenant_id` at `:41` stop hiding this class of bug.

### W1.2 · The same pattern, everywhere else

~25 list-style reads assume RLS will narrow them. Rather than patch each, add the missing
primitive and then apply it:

- **New `src/lib/tenant-scope.ts`** — `requireTenantId(supabase, userId)` returning the caller's
  tenant and throwing a typed error when absent. Every `list*` server fn uses it.
- Apply to the confirmed-leaky sites, highest-risk first: `teams.functions.ts:55`,
  `mcp/tools/list-employees.ts:39`, `admin.discipline.tsx:86`, `admin.expenses.tsx:249`,
  `recognition.tsx:70`/`:168`, `hr.variations.tsx:100`, `org.pay-rates.tsx:58`,
  `org.promotions.tsx:56`, `org.training.tsx:52`, `org.documents.index.tsx:56`,
  `admin.review-analytics.tsx:47`, `admin.biometric.tsx:52`. Same pattern for the tenant-owned
  lookup lists: `expenses.functions.ts:20`, `templates.functions.ts:85`,
  `offboarding.functions.ts:179`/`:188`, `admin.review-templates.tsx:117`.
- **Self-exclusion** where selecting yourself is a correctness bug: offboarding, discipline,
  expense-approver, recognition (×2).
- **New `tests/tenant-scoping.test.ts`** — the durable guard, in the style of
  `tests/route-parent-outlet.test.ts`: scan every `list*` server fn for a tenant predicate or an
  explicit, commented opt-out. This is what stops the pattern coming back; the individual patches
  are just today's instances.

### W1.3 · Seed the empty tables

Extend `scripts/demo-seed.ts`. Presets already exist in the repo and must be reused, not
reinvented — `EXPENSE_CATEGORY_PRESETS` (`org.expenses.tsx:175-200`), `src/lib/review-presets.ts`,
`src/lib/document-template-presets.ts`.

Seed per tenant: `expense_categories`, `payroll_components`, `training_courses`, `award_types`,
`feedback_question_templates`, `document_templates`, `recruitment_stages`, `expense_approval_rules`,
`leave_approval_routes`, `public_holiday_categories`, `toil_settings`, `tenant_payroll_settings`,
`review_templates` (from the presets, so the KPI module has something to distribute in W3.1).

`public_holidays` is **country-keyed, not tenant-keyed** — seed AU + NP calendars for the current
and next year via a migration, so both demo tenants have working holiday pay. `syncAuHolidays`
(`src/lib/au-holidays-sync.functions.ts:41`) already covers AU from data.gov.au; NP needs a static
list.

Also fix the seed's own manifest (`scripts/demo-seed.ts:526-530`), which understates what it
skips, and stop giving `org_admin`/`super_admin` accounts employee records — that is what pushes
Sam into `/onboarding/profile` on every dashboard visit.

### W1.4 · Two live column bugs found in passing

- `src/lib/dashboard.functions.ts:54-58` queries `public_holidays.date`; the column is
  `holiday_date`. The "next holiday" dashboard tile is a guaranteed PostgREST error.
- `src/lib/payroll-setup.functions.ts:222` filters `public_holidays` by `tenant_id`; the table has
  no such column. The payroll setup wizard's holiday list always errors.

---

## Wave 2 — Platform hygiene & the QA harness

### W2.1 · The always-on loading bar
Balance the emit in `AuthRouteGate.tsx`: track whether *this run* emitted `true` in a ref, and
retract it in `finally` regardless of `cancelled` or `fullyCached`. Add a safety timeout in
`RouteLoadingBar.tsx` so a stuck bar self-clears. Suppress the bar entirely when the gate resolves
from cache in under ~150 ms — today it flashes on every click even with zero network work.

### W2.2 · The network storm
- **`NotificationsBell.tsx:37-41`** → TanStack Query with a `staleTime`, keyed by user id, so it
  survives the shell remount and dedupes with `/notifications` (which polls the same fn at 30 s
  under a different key).
- **Hoist the shell.** The root cause of both this and W2.3: `AppShell` renders per-route, so the
  entire header cluster is destroyed and rebuilt on every navigation. Rendering it once at the
  layout level fixes the remount storm and the missing chrome together.
- Collapse `getMyGateStatus` / `getMyOrgStatus` onto one cache. Move `AuthRouteGate`'s two
  hand-rolled `Map` caches (`:17-18`) onto the QueryClient already provided at `__root.tsx:184`.
- `dashboard.tsx:107-138` — 6 uncached Supabase round-trips per mount → one cached query.
  Its `["my-org-status"]` key has **no user id**, so it serves stale data across account switches.

### W2.3 · Restore the missing chrome (21 pages)
Give `org.tsx` a real `AppShell` around its `<Outlet/>` (`org.tsx:56`) — that fixes 8 pages at
once. `admin.tsx` must stay a bare `<Outlet/>` (`tests/admin-routes-block.test.ts` pins it), so
the 13 admin pages each get their own `AppShell`, deleting the hand-rolled `<main>/<header>` block
they currently substitute. `AppShell` is nesting-aware, so this is always safe.

Extend `tests/route-parent-outlet.test.ts` (added last session) with an assertion that every
authenticated route resolves to a chrome provider — the durable guard.

### W2.4 · The QA harness the request asks for
A repeatable audit rather than a one-off: a Playwright pass that signs in as each of the 8 seeded
roles, walks every nav destination, and records per-route HTTP status, console errors, duplicate
server-fn calls, and whether chrome rendered. Output a report. This is what turns "audit for QA
flaws" into something that runs again next month.

---

## Wave 2.5 — CodeQL finding + the attendance overhaul *(done)*

Unplanned. Pulled in ahead of Wave 3 because clocking in is the first thing
anyone does each day, and three of its four defects produced wrong pay.

### W2.5.1 · Information exposure through a stack trace — `fix/hook-error-exposure`

CodeQL flagged `src/routes/api/public/hooks/leave-accrual.ts` for returning
`e.message` in its 500 body. The pattern was systematic: **15 of the 20**
handlers under `/api/public/hooks/` echoed the caught error to the caller.
Those endpoints authenticate with a bearer secret rather than a session, so the
body was a schema map — Postgres messages naming tables, columns, constraints
and RLS policies — for anyone probing them.

`hookFailure()` in `src/lib/hook-response.server.ts` logs the full error and
returns a generic message plus a short correlation ref. `hookErrorRef()` does
the same inside the per-item result array `geofence-reconciliation` returns in a
200 body.

Two deliberate exceptions, both documented in the code: `security-scan-results`
still returns Zod issues on a 400 (they describe the caller's own payload), and
`monthly-billing-cycle` / `stripe-webhook` still write `e.message` into
`billing_admin_alerts`, which is an internal table.

`tests/hook-error-exposure.test.ts` is the durable guard. It resolves variables
assigned from a caught error rather than matching only the literal `.message`
shape — the flagged file built its message two lines above the response and
passed the variable in, so a shape-only scan reported it **clean**. Five
fixtures pin the cases the detector must catch, including that one.

### W2.5.2 · Attendance: time, place, and a floating clock — `feat/clock-in-widget`

**The date was computed in UTC** — `new Date().toISOString().slice(0,10)`, in
both `clockIn` and `attendance.tsx`. In `Asia/Kathmandu` (UTC+05:45) a shift
starting before 05:45 filed against yesterday; in `America/New_York` anything
after 19:00 filed against tomorrow. The reported symptom — entries a day out —
came from the week grid, which built each column from a local-midnight `Date`
and ran it through the same conversion, so every column queried the day *before*
its own label. `src/lib/work-date.ts` replaces the expression everywhere. Zones
are IANA names resolved per instant through `Intl`, so **DST comes from the tz
database** rather than from hard-coded offsets.

**The timestamp was taken when the response was built** — after auth, the
employee lookup, the geofence query, and up to 8s of geolocation. Every punch
was late, always in the employer's favour. The client now captures the moment
the button is pressed; the server believes it within a five-minute tolerance,
otherwise substitutes server time, records the skew, and queues the punch for
review. Both instants are stored.

**Geofencing discarded GPS accuracy.** `coords.accuracy` was read and thrown
away, and `sign_geofences.min_accuracy_meters` — a column that has existed since
20260619132140 — had never been read by anything. `evaluateGeofence` now returns
inside / inside_low_confidence / uncertain / outside, and is deliberately
generous at the boundary: a false refusal stops someone working and is visible
instantly, a false acceptance is recorded and reviewable. Refused punches, which
previously left **no trace anywhere**, now write `geofence_audit_log` and
`geofence_reconciliation` through the service-role client, inside try/catch so
the audit trail can never itself be the reason a workforce cannot clock in.

**Work-from-home now exists** — `wfh_requests`, `/me/wfh`, `/admin/wfh`,
`has_approved_wfh()` — which is what makes the perimeter workable at all.

**The floating widget** (`src/components/ClockWidget.tsx`) renders once inside
`ShellInner`, so nested `AppShell`s cannot duplicate it, and hides itself for
accounts with no employee record. It names the zone a punch will be filed in
whenever that differs from the device's, and only requests location when the
tenant actually has fences.

**Applied**, along with a regenerated `types.ts`, and verified live: the
`has_approved_wfh` gate returns false for a *pending* request and true once
approved; `wfh_requests` RLS holds under real JWTs (employee sees 1, Acme
manager sees 2, Globex admin sees 0 Acme rows); and Postgres reproduces the date
bug exactly as the unit tests assert it — 23:15Z on the 22nd is the **23rd** in
Kathmandu, and 00:00Z on the 23rd is the **22nd** in New York.

Removing the `PendingSchema` casts once the real types were in surfaced a bug
they had been hiding: `listWfhForApproval` built its `.select()` with string
concatenation, and TypeScript types `"a" + "b"` as plain `string` rather than
`"ab"`. supabase-js parses that argument at the type level, so the embed
degraded to `GenericStringError` and every field of the result was silently
untyped. It is one string literal now.

### W2.5.3 · Platform accounts without an organisation

`super_admin` / `regional_admin` are tenantless by design, and
`NoTenantScopeError` was surfacing to them as the raw string *"Your account is
not attached to an organization."* — the "organizational issue" reported against
sam. `PlatformAccountNotice` explains it instead, and `listWfhForApproval`
reports `noTenantScope` rather than throwing.

That is a presentation fix, not the real one. Platform accounts still cannot
*use* tenant features, which is exactly what W3.0 exists to solve, and is why
seeding sam into a tenant would be the wrong answer — before scoping, these
accounts saw every tenant's rows merged, and that was the leak.

The seed now writes one geofence and two WFH requests per tenant, so the module
is demoable rather than empty on a fresh seed.

## Wave 3 — Module completion

### W3.0 · Tenant switcher for platform admins — **Done**

Landed as `feat/tenant-switcher`: `platform_acting_tenant` (20260824090000), the
`getTenantId`/`getActingTenantId` fallback in `tenant-scope.ts`, `platform-tenant.functions.ts`
(`listActingTenantOptions`/`setActingTenant`), and `TenantSwitcher`/`ActingTenantBanner` in
`AppShell`. The plan below is kept as the design record.

`super_admin` and `regional_admin` have `profiles.tenant_id = NULL` by design, so
after Wave 1 scoped every query by tenant, **every tenant-owned surface is
correctly empty for them** — expense categories, employee pickers, review
templates, holidays, the lot. This surfaced as "the category dropdown still
doesn't work"; it is not a seed problem, it is the absence of an acting-tenant
concept.

Before Wave 1 these accounts saw *every* tenant's rows merged together, which was
the cross-tenant leak. So the options are an acting-tenant, or platform admins
who cannot use tenant features at all. Wave 1 shipped explanatory empty states as
a stopgap; this replaces them with the real mechanism.

- **Acting tenant, server-resolved.** A `platform_acting_tenant` row (user_id →
  tenant_id) plus `getTenantId()` in `src/lib/tenant-scope.ts` falling back to it
  when `profiles.tenant_id` is null and the caller holds `super_admin` /
  `regional_admin`. Resolving it server-side is the whole point — a client-supplied
  tenant id would be forgeable and would undo Wave 1.
- **Scope check on write.** `regional_admin` may only act within their
  `role_scope` countries; `super_admin` anywhere. Read paths already funnel
  through `has_role()`, so the RLS story is unchanged.
- **A switcher in `AppShell`**, visible only to those two roles, with a
  persistent banner while acting — acting inside a customer tenant must never be
  ambiguous.
- **Audit every switch** to `audit_log`; this is an impersonation-adjacent
  capability.
- Replace the Wave 1 empty states with "pick a tenant" once this lands, and drop
  the `noTenantScope` copy where the switcher makes it unreachable.

**Test:** `getTenantId` returns null for a platform account with nothing selected
(never a fallback to unscoped); a `regional_admin` cannot select a tenant outside
their country scope; the acting tenant cannot be set from request input; e2e —
sign in as sam, select Acme, see Acme's 12 categories and *not* Globex's.


### W3.1 · KPI/KRA: build the missing distribution link — **Done**

Per the approved model — HR assigns, employee self-assesses, manager reviews. Landed as
`feat/kpi-kra-distribution`.

- **RLS gap closed first**, before anything else: `review_instances`' SELECT/UPDATE policies and
  `review_instance_versions`' SELECT policy (`20260618042929`, `20260618043914`) admitted any
  org_admin/manager/super_admin from **any tenant** — no tenant predicate at all, the same class of
  bug as the offboarding leak in W1.1, except here it exposed scores, evidence links, and reviewer
  comments rather than just employee names. Fixed in `20260824110000`, narrowing org_admin/manager
  to their own tenant while keeping super_admin's existing unconditional access (the established
  convention — RLS isn't the scope for platform accounts, the query layer is). Verified under real
  JWTs: two temporary cross-tenant rows inserted, `alice.acme` (Acme org_admin) and `gina.globex`
  (Globex org_admin) each confirmed to see only their own tenant's row, then cleaned up.
- **`generateReviewInstances` tenant-scoped**: it uses the service-role admin client, so a
  caller-supplied `templateId` or `employeeIds` from another tenant was trusted outright. Now
  asserts the template belongs to the caller's tenant and every supplied employee id does too,
  same pattern as `createOffboarding`.
- **Assignment UI** on `admin.review-templates.tsx`: an "Assign" dialog (replacing the old
  confirm()-only "Schedule" button) — whole tenant / a department / specific employees (searchable
  checklist), due-offset-days and horizon-days, feeding `employeeIds` into
  `generateReviewInstances`, which already accepted it.
- **`reviewReviewInstance` wired up** — was dead code with zero callers. `admin.review-analytics.tsx`
  gained an "Awaiting your review" queue (submitted scorecards in the selected range) with
  Approve/Send-back actions. That page also had no route gate at all (`AdminGate` imported, never
  used) — fixed with `ORG_ADMIN_OR_MANAGER`, matching `requireAdmin`'s own role check, and pinned in
  `tests/admin-gate-role-sets.test.ts`.
- **Notify on assign and on submit**, in-app (`in_app_notifications`), same pattern as
  `wfh.functions.ts`/`leave.functions.ts` — both were cron-only before
  (`api/public/hooks/review-instance-reminders.ts`), invisible for up to a day.
- **`required: true` enforced** — declared on every template competency since presets existed,
  shown as a badge in the preview, never checked. `performSubmit` now rejects a required item
  submitted with no score (`isScoreMissing` — `0` and `false` are real answers, not missing ones).
- **Due dates surfaced in the rollup**: `reviewDashboardSummary` gained `overdueCount` (pending
  past due) — due dates already drove the reminder cron and the employee page's own overdue flag,
  but the admin rollup couldn't distinguish a healthy pending item from a three-week-late one.
- Fixed the dead pointer — "Attach a template to a cycle in Performance → Cycles" now links to
  `/org/performance`, which is where `review_cycles` are actually managed.
- **Org-wide rollup**: already existed (`reviewDashboardSummary`, surfaced on
  `admin.review-analytics.tsx`) — confirmed it answers "N sent, M completed" and extended it with
  the overdue count above, rather than rebuilding it.

**Not done, flagged rather than assumed**: the three unconnected review systems
(`performance_reviews`, `review_instances`, `duty_review_scores`) are still three. Consolidating to
two (scorecards + duty KPI, retiring the `performance_reviews` fan-out) remains a recommendation
that needs a product decision — it deletes a working code path — not something this pass took on.

### W3.2 · Leave & holidays — **Done**

All six items landed across three commits (`feat/leave-server-computed-days`,
`feat/leave-holiday-cleanup`, and the approval-routes commit).

1. **`days` is client-computed and server-trusted** (`leave.functions.ts:77`) — a crafted request
   could claim any day count up to 366 regardless of the date range. **Fixed**: `submitLeaveRequest`
   now recomputes `days` itself from the request's own dates (`countWorkingDays`); the client's
   `days` field is accepted but ignored.
2. **No balance check on submit** — negative-balance leave was accepted. **Fixed**: `submitLeaveRequest`
   rejects a request that exceeds `availableLeaveBalance`, skipped for leave types with neither a
   quota nor an accrual rate (e.g. Unpaid Leave — `hasLeaveQuota`).
3. **No weekend/holiday exclusion** (`leave.tsx:31-40` counted raw calendar days). **Fixed**:
   `countWorkingDays` excludes weekends and the tenant's country's `public_holidays`; the client
   preview uses the same function so it matches what's actually charged.
4. **No in-app notification on any leave event** — email only, silently invisible if
   `employees.email` is null. **Fixed**: submit/cancel/approve/reject all write to
   `in_app_notifications` alongside the existing emails, mirroring the `notify()` pattern in
   `wfh.functions.ts`.
5. **`leave_approval_routes` is authored but never consumed** — multi-level approval was configured
   and not enforced; any tenant manager could approve anything, including their own request (no
   self-decision check existed at all — the WFH lifecycle had one, leave didn't). **Fixed**:
   `assertApproverForRequest` enforces the tenant's configured tier chain when one exists (a new
   `leave_requests.current_tier` column tracks progress — `20260824100000`), falls back to the old
   "any manager/org_admin" behaviour untouched for tenants that never configured routing, and
   blocks self-decision unconditionally either way.
6. **Holidays**: `/admin/holiday-calendar` (461 lines, recurring + AU sync) was strictly better than
   the nav'd `/admin/holidays` and was unreachable. **Fixed**: nav repointed at the calendar view
   (which still links back to the flat list as "List view" — nothing deleted).
   `/admin/employee-holidays` was mis-gated under `org.reviewTemplates` (`AppShell.tsx:895-901`,
   a different role set than the route's own `ORG_ADMIN_OR_MANAGER`). **Fixed**: moved into Leave &
   time under a new `org.employeeHolidays` feature key matching the route exactly.

**Not done, flagged rather than assumed**: `leave_approval_routes.escalate_after_hours` is still
unconsumed — enforcing the tier chain closed the security gap, but auto-escalation on a timeout
needs a cron and a product decision (escalate to whom, does it notify, does it auto-approve) this
pass didn't make.

### W3.3 · Work-from-home + geofence exception — **Done**

Delivered in W2.5: the `wfh_requests` table and RLS, the employee request route
(`/me/wfh`) and the approver route (`/admin/wfh`), the `clockIn` short-circuit
via `has_approved_wfh()`, the `work_location` column, the new `mismatch_type`
members, writes to `geofence_reconciliation` at punch time, and a trace for
refused punches.

Before touching the remainder, the whole feature was re-verified live rather
than trusted from these docs: `has_approved_wfh` still exists and returns
correctly, the `geofence_reconciliation` mismatch-type constraint still
carries the WFH members, RLS still holds under a real JWT (an employee sees
only their own row), and the `clockIn` code path is unchanged. One real finding
from that recheck: the demo WFH dates had gone stale relative to "today" (the
seed writes `day(0)`/`day(5)` relative to whenever it last ran), so
`has_approved_wfh` was silently returning false for everyone — not a code
regression, but a live demo right now would have looked broken. Refreshed in
place.

**The remainder, landed as `feat/wfh-remainder`:**

- **`clockOut` now flags what it records.** It already wrote distance/fence
  columns for every outcome but never set `needs_review` or queued anything to
  `geofence_reconciliation` regardless of the result — an out-of-fence
  clock-out was recorded and then invisible, exactly the gap the audit trail
  had already closed for clock-in refusals. `classifyClockOutGeofence`
  (`src/lib/geofence.ts`) gives it the same treatment `clockIn` gives the
  equivalent outcome: still never blocked (someone who already started a shift
  should not be trapped on site to end it — the flag-not-block call made
  above), reusing `wfh_outside_fence` when an approved WFH day covers it and a
  new `clock_out_outside_fence` mismatch type otherwise (`20260824120000`),
  since none of the existing types describe an unapproved, unblocked, *closing*
  punch outside every fence.
- **WFH decisions now send email**, not just in-app. `wfh-approved`/
  `wfh-rejected` templates, mirroring `leave-approved`/`leave-rejected`
  exactly. Reuses the `notify_leave_decision` preference column rather than
  adding a dedicated one — both are "a decision was made on your time-off-
  adjacent request," and a second toggle nobody has asked for felt like more
  schema than the ask warranted.
- **The 24h reconciliation cron now knows about WFH.** `doReconcile`
  correlates every punch against background geofence captures and flags
  `no_geofence_for_punch` when none is found nearby — a remote (approved-WFH)
  punch is exactly the class least likely to have one, so every WFH punch this
  cron ever saw was re-flagged a second time on top of the correct
  classification already written at punch time. Punches with
  `work_location = 'remote'` are now skipped entirely in that check.
- **A tenant-level "remote work allowed" switch** — `tenants.wfh_enabled`
  (`20260824130000`, default `true`, so no existing tenant's behaviour
  changes). Enforced server-side in `requestWfh`, not just hidden client-side;
  `/me/wfh` shows an explanatory notice instead of the request form when off
  (existing requests stay visible); `/admin/wfh` gets the toggle, org_admin/
  super_admin only.

Verified: 8 new unit tests (`classifyClockOutGeofence`, `doReconcile`'s WFH
skip against a fake Supabase client, `isWfhEnabled`'s default-true behaviour);
full baseline held; tsc --noEmit at 0; both migrations applied live.

The original plan for this section, kept for reference:

- New `wfh_requests` table + RLS, modelled on `leave_requests`.
- Employee request route and approver route, copying the request→approval→notify pattern in
  `leave.functions.ts:70-313`.
- **The exception hook**: `clockIn` (`src/lib/attendance.functions.ts:62-86`) currently goes
  straight from "tenant has fences" to a hard throw. Insert an approved-WFH lookup for `work_date`
  that short-circuits before the throw at `:81-86`.
- A `work_location`/`is_remote` column on `attendance_entries` so remote punches stay
  distinguishable downstream in payroll and timesheets.
- **The priority review queue**: `geofence_reconciliation` is the natural host and already has a
  resolve UI (`admin.geofences.tsx:544`), but its `mismatch_type` CHECK constraint
  (`20260619134034:12-14`) has no WFH member and nothing writes to it at punch time — only a 24 h
  cron. Add the enum value and write from `clockIn`.

Worth fixing alongside: out-of-fence attempts currently leave **no trace at all** — not in
`geofence_audit_log`, not anywhere — so HR cannot see who was blocked. And `clockOut` performs no
geofence validation, which is asymmetric.

---

## Wave 4 — Information architecture (design doc first, then code)

**Both deliverables done — see `docs/w4-information-architecture-design.md`.** All 5 open
decisions resolved (§6): the payroll wizards turned out to be two different live flows, not
duplicates, just renamed for clarity ("Payroll configuration wizard" / "Pre-invite payroll
checklist"); `hr.variations.tsx` kept, narrowed to its 5 non-redundant change types. Deliverable 2
(`feat/w4-information-architecture`) applied the regroup directly in `AppShell.tsx`: Organization's
6 uneven sections (one 17 items long) become 9, none over 9; 5 new nav entries for pages that had
none (2 of which — `admin.billing.tsx`/`admin.billing-ops.tsx` — turned out to have **no
route-level gate at all**, `AdminGate` imported but never wired up, found only while adding their
nav links); the dashboard's quick-access picker extended to `finance` (the only role that
genuinely had nothing — `hr`/`branch_admin` already had it, contrary to the design doc's first
guess). Not done, explicitly deferred: extracting nav data into a shared module consumed by
`GlobalSearch` too (existing `tests/nav-integrity.test.ts` already covers uniqueness/resolution
without it); the two dead-orphan redirects (`me.dashboard.tsx`, `admin.security-findings.tsx`); the
`<title>`/nav-label naming pass beyond the renames already done.

The raw material, all measured: **101 sidebar items** across 8 groups, of which *Organization*
alone is 51 (half the nav) with an 18-item "Operations" accordion. 104 clickable destinations
across 102 unique paths. **20 in-app pages have no nav entry at all**, including 4 setup wizards
and a duplicate security-findings page. `GlobalSearch.tsx:28-70` is a **second, independent nav
registry** of 36 entries with its own gates, not derived from the sidebar.

The document will cover:
- The regrouped menu tree, every one of the 101 items placed, with role gates.
- Duplicate resolution + a redirect map so bookmarks survive. Confirmed duplicate sets: the
  3-way `/dashboard` ÷ `/me` ÷ `/me/dashboard`; **4** payroll-setup routes (2 differing only in
  capitalisation); 5 template routes; 5 holiday routes; 7 onboarding routes; 2 near-identical
  security-findings pages; 3 expenses; 3 billing.
- **Per-role dashboards.** Today `employee`, `manager`, `hr` and `finance` see *the same* 5 KPI
  tiles and 3 board cards — only a quick-access strip differs, and `finance`/`regional_admin` get
  nothing at all. Two board rows have hardcoded non-reactive statuses (`dashboard.tsx:294`,
  `:308`), and one card renders a **raw URL as its description** (`:476`).
- Where inline hints/docs go, reusing the existing `HelpMenu` + `knowledge_articles`.
- One name per page: the dashboard is currently "Home" in the nav, "hrppl Dashboard" in
  `<title>`, and "Home" in `AppShell`.

**Deliverable 2** — implementation, once approved: nav restructure, redirects, per-role
dashboards, and `tests/nav-uniqueness.test.ts` asserting no two entries share a `to` and every
`to` resolves in `routeTree.gen.ts`.

---

## Wave 5 — Reachability *(done, merged 2026-09-03)*

The wave that asked: **can a user actually get to what we built?** Two answers were wrong in
opposite directions — pages offered and then refused, and features built and never offered.

### The four places a page's permission could live

W4 left the nav as markup inside `AppShell.tsx` and the gates inside each route. Nothing tied
them together, so a page's answer to "who may be here?" could be written in four places that were
free to disagree — and only the first pair had a test:

| # | Where | Looks like | Had a test? |
| --- | --- | --- | --- |
| 1 | Nav row | `feature: "org.payroll"` | yes |
| 2 | Route gate | `<AdminGate allow={…}>` | yes |
| 3 | **Inline, in the page body** | `const canAccess = roles.includes(…)` | **no** |
| 4 | **RLS policy** | `USING has_role(…)` | **no** |

Each pass closed one axis and exposed the next:

- **P0–P1 (1 vs 2)** — 36 dead links. `<AdminGate>`'s permissive default deleted; omitting the key
  is now a **type error**. Nav data extracted from `AppShell.tsx` (1,466 lines) into
  `src/lib/nav-tree.ts`, which the sidebar, GlobalSearch and the tests all read.
- **P1.5 (1 vs 3) — unplanned.** A tester reported `finance` refused at `/org/payroll`. Eleven
  pages wrote their permission inline, which the parity check could not see, including
  `/org/white-label` locking `org_admin` out of its own branding page. Found by a person, not the
  suite.
- **P1.75 (no gate at all) — unplanned.** 23 nav destinations had *no* client gate and rendered
  for any signed-in user — `/admin/discipline`, `/org/danger`, every `/platform` page. RLS held,
  so it was a UI hole rather than a leak, but "page renders, then the database refuses" is the
  offboarding failure mode.
- **P2–P3** — 7 orphan pages resolved (5 given nav homes, 2 retired to redirects *after* porting
  the capabilities they alone had); 14 orphan server fns wired, 4 deleted as superseded. The
  role-primary **"Your work"** group added, because fixing the gate on `/org/payroll` made it
  *reachable* without making it *findable* — it was three levels down for the role whose job it is.
- **P4 — the Australian compliance domain.** 26 server functions with schema, RLS and unit tests,
  and no user interface at all. Five pages, no migrations. **Five feature keys, not one**: the
  database does not treat the domain uniformly (finance runs Payday Super and does not lodge with
  the ATO; HR remediates underpayment and does not assign awards), so a single key would have been
  wrong in both directions at once. First consumer of `NavItem.country` — the subgroup is *absent*
  for a Nepali tenant, not empty.
- **P5 — the last loose ends.** Ticket conversations, employment-variation drafts, timeline event
  links, and one product name (three spellings shipped at once, including in a staff invitation
  email and the public OpenAPI document).

### What the wave is worth remembering for

**Every check that compares two things reports nothing when one is absent.** That single shape
produced P1.5 (no route gate to compare), P1.75 (no gate at all), and the sidebar bug below. Each
new escape hatch is now an explicit allow-list with a written reason, never a silent `continue`.

**A defect can pass every test and still be visible in one glance at the browser.** The sidebar
flyout computed `visibleItems`/`visibleSections` through `can()` and then rendered the *raw*
props — so every row was offered to every role, and the route gate refused the click. Every test
read the nav *data* and the route *gates*, which agreed perfectly. Found by opening the flyout as
a seeded user and counting rows.

**Orphan server functions: 48 → 0**, held by `tests/no-orphan-server-fns.test.ts`. Four are
recorded as deliberately uncalled, each naming the surface it waits on.

### Closing out — the tool the wave broke

Extracting the nav into `src/lib/nav-tree.ts` silently broke `scripts/qa-sweep.mjs`, which parsed
its destination list out of `AppShell.tsx`. Afterwards it found **one** destination — `/auth`, from
a redirect — swept it, and wrote a clean report.

Nothing failed. That is the wave's own lesson landing on the wave's own tooling: a check that reads
two things reports nothing when one of them moves. The script now reads `nav-tree.ts` and **exits
non-zero if it parses fewer than 80 destinations**, because a sweep covering a handful of routes is
a broken sweep, not a clean bill of health. `tests/nav-integrity.test.ts` pins the source and the
floor, since an hour-long manual script is exactly the kind nobody runs often enough to notice.

`docs/qa-sweep-report.md` carries a staleness banner until it is regenerated.

## Audit A1 — security & performance *(done, 2026-09-03)*

A full pass over 591 server functions, 208 migrations and 20 public hook endpoints. Both real
findings were invisible from inside the app, because the *pages* were gated correctly.

1. **`countOpenHighSeverityFindings` authenticated nobody.** No `.middleware()` at all, reading
   through the service-role client. A server fn is a public HTTP endpoint, so anyone could read a
   live count of the platform's open critical security findings. Now gated like its siblings and
   reading through the caller's client so RLS applies as a second layer.
2. **No public endpoint could be rate limited, by construction.** `check_rate_limit` opens with
   `IF v_user IS NULL THEN RETURN true` and `rate_limit_buckets.user_id` has an FK to
   `auth.users`. Five server fns take no session; four write; `createResumeUploadUrl` is an
   unauthenticated mint of a storage upload credential. Fixed by
   `20260903120000_public_rate_limit.sql` + `enforcePublicRateLimit()`, keyed on a salted hash of
   the IP and **failing open** on every error path.

Verified clean: RLS on all 207 tables; no unscoped `employees` read; no secret behind `VITE_`; all
20 hooks use `hookFailure()`; `renderMarkdown` escapes before converting.

**Performance, measured:** 36 loop-with-query sites (`payroll.functions.ts` has 8), and 194
`useQuery` sites of which only 19 declare `staleTime`. Fixed the sharpest — a per-payslip fund
lookup in `generateSuperContributionsForRun`, 500 sequential round trips on a 500-employee run,
now one `.in()`. The rest is recorded, not urgent at demo scale.

## Wave 6 — Learning (LMS) *(done, 2026-09-06)*

Training was upload-a-certificate: `external_url` was the only content field on a course, so every
course sent the learner somewhere else and an enrollment jumped straight from `assigned` to
`completed`. The content layer now exists.

**Shipped:**

- `training_lessons` and `training_lesson_progress` (`20260906091000`), four content types
  (`rich_text | video | document | external_link`), a private `training-content` bucket with a
  mime allow-list that admits no executable type, and `content_mode` on `training_courses`
  defaulting to `'external'` — so **no course already assigned to anyone changed underneath them**.
- **Course builder** at `/admin/training/$courseId` — Lessons (ordered, per-type editor, direct-to-
  storage upload through a signed URL), Quiz (the 400-line question bank moved out of a modal on
  the catalogue and put beside the lessons it tests), Settings (content mode, the lesson gate, pass
  score, attempts, validity).
- **Course player** at `/me/training/$enrollmentId` — lesson list, markdown/video/document panes,
  mark-complete, resume-where-you-left-off, and the quiz locked until the required lessons are
  done, with the reason on screen.
- **Roster progress** on `/org/training` — per-learner lesson completion, one query for the whole
  page rather than one per enrollment.
- `admin.training.tsx` and `me.training.tsx` became pure `<Outlet />` layouts with `.index.tsx`
  siblings, the split `admin`, `me`, `org.documents` and `org.recruitment` already use.

**Verified end to end against the dev project**, which is the only way to check RLS: `hana.acme`
(hr) authored a lesson and a quiz question and switched the course to hosted content; `evan.acme`
(employee) read the lesson, was refused the quiz until he completed it, passed, and the enrollment
completed and issued a certificate.

### X-07 — closed, and it was not what the doc said

The finding recorded in W5 was that HR clicks Assign and Postgres rejects the insert. That was
**already stale**: `20260613140528` had given `hr` manage policies on `training_courses` and
`training_enrollments` and given `branch_admin` read. What it never revisited was
`training_quiz_questions` and `certifications`, where hr had **no policy at all** — so HR could
assign a course and not author its quiz, and opened an "Expiring certs" tab that was empty by
construction for the role that chases renewals.

Direction taken: **widen for hr, keep branch_admin read-only.** HR administering training was an
explicit earlier decision; the quiz and certificate halves were an oversight. Every branch_admin
policy in this domain is a `FOR SELECT`, so that is what the client now offers them — which needed
a second feature key, `org.trainingManage`, because one key cannot express "may read the roster,
may not assign". `src/lib/training-guard.ts` asserts the same set server-side, so the refusal is a
sentence instead of a Postgres policy error.

### The two defects found underneath it

Both were invisible for the same reason: **they render as emptiness, not as errors.**

**1. No learner could see a quiz question.** `20260609033335` deliberately built
`training_quiz_questions_public` as a SECURITY DEFINER view — the learner's SELECT policy on the
base table had just been dropped so nobody sitting a quiz could read `correct_index`, and the view
was to be their only read path, enforcing enrollment scope in its own WHERE. `20260609120840`
logged it in `security_findings_log` as an accepted risk. Four days later `20260613143222` — "Fix
Security Definer view" — set `security_invoker = on` to clear the linter warning **that had already
been accepted**, handing enforcement back to the base table's deny. Verified with a real JWT: an
enrolled employee read 0 rows. The dialog said "No quiz questions have been set for this course
yet" and, because `/me/training` completes a course only via the quiz, **no employee could finish
any course.** No demo tenant had a quiz question, so nothing ever contradicted it.

**2. Four surfaces have been empty since the day they shipped.** PostgREST resolves
`.select("*, employees(...)")` from the foreign-key graph, and `training_enrollments.employee_id`
was declared a bare `uuid NOT NULL` in `20260606063457` — no key, ever. Every such call answered
`PGRST200`; every caller renders `rows ?? []`. Auditing the rest of the codebase found **six more
tables** in the same state. The sharpest was `leave_requests`: the requests inbox normalises six
tables into one list and four carried the key, so `/me/requests` and `/admin/requests` worked while
silently dropping leave — the highest-volume request type in the product. Fixed in
`20260906092000`, `20260906093000` and `20260906094000`; two constraints are `NOT VALID` because
two real rows (a pending leave request and a submitted timesheet) point at a deleted employee, and
deleting a record of someone's absence to satisfy a constraint is not a fix.

`tests/postgrest-embeds.test.ts` now fails if a table embeds `employees` with no key to it.

### Also fixed in passing

- `listEnrollments` never selected `pass_score` or `max_attempts`, so the learner's quiz dialog
  always displayed 70% regardless of the course and never showed the attempt limit.
- The overdue-training sweep and the certificate-expiry horizon both derived "today" from
  `toISOString()`, i.e. UTC — the exact pattern `src/lib/work-date.ts` exists to prevent.
- The quiz dialog printed "No quiz questions have been set" *while still loading*. That sentence is
  what made a total RLS failure look like a configuration choice, so it now distinguishes the two.
- `tests/storage-buckets.test.ts` read buckets from one named migration and failed for a bucket
  that *was* in a migration; it now scans them all.
- `tests/route-parent-outlet.test.ts` grew a pure-layout detector instead of a list of exempt
  filenames.

### Deferred out of this wave

**SCORM.** It is a runtime, not a content type: an iframe player exposing the SCORM JS API, a
`cmi.*` model persisted per learner per attempt, manifest parsing, and hosting arbitrary
third-party JavaScript — a content-security decision this platform has otherwise avoided by
sanitising every HTML sink. See `docs/onboarding-guided-routes.md` §10.

**The cross-tenant course library** (nullable `tenant_id`, `owner_scope`, country scoping) remains
**parked with D-8**. Nothing shipped here depends on it.

## Wave 7 — Guided onboarding routes *(done, 2026-09-07)*

`docs/onboarding-guided-routes.md` §9 predicted this correctly: **most of Phase 1
was sequencing, not new subsystems.** The wave is a guided layer over surfaces
that already existed, plus the two things that genuinely did not.

### The design decision that shapes everything else

**Segment completion is computed from the tenant's data. It is never stored.**

There is no per-segment "done" flag anywhere. Every check in `buildSetupGuide`
reads the actual rows — is there a leave type, is there a pay period, has a
policy been published. A stored flag records that somebody clicked a button; it
goes stale the moment the rows it was vouching for are deleted, and it cannot
tell an admin returning after a month what is genuinely missing. CLAUDE.md
already asked that the Setup Lock **extend `checkPayrollReadiness`** rather than
invent a parallel notion of readiness, and this does.

`tenant_setup_state` therefore holds exactly two facts a query cannot derive:
which optional segments were deferred on purpose, and when the tenant went live.

The consequence, which the page states out loud rather than hiding: **a segment
can reopen.** Delete every leave type and payroll goes back to incomplete. That
is the honest answer, and `tests/setup-guide.test.ts` pins it.

**Skipping cannot open the activation gate.** Required segments refuse to be
skipped server-side, and `finalizeSetup` re-derives readiness from the database
rather than believing whatever the browser last rendered — the client's copy can
be minutes old and this is the one call where that would matter.

### What shipped

| Piece | Where |
| --- | --- |
| Guided setup, 7 segments, resume, skip, activate | `/org/setup-guide` · `setup-guide.functions.ts` |
| Segment 1 editable **in place** | no company-profile page existed; bouncing an admin into the create-an-org wizard to change an address is the "go and find the page" this flow removes |
| Policy library + acknowledgements | `/admin/policies`, `/me/policies` · `policies.functions.ts` |
| Phase 3 provisioning | `ProvisionButton` on `/org/onboarding/tracker` · `provisioning.functions.ts` |

**The policy library** (§9 item 4) is the one genuinely new subsystem. Three
properties carry its evidentiary weight: an acknowledgement is of a **version**,
so revising the wording asks again instead of inheriting consent given to
different words; **only the person may sign**, enforced by RLS independently of
the server fn; and a signed policy is **retired, never deleted**, because the
acknowledgements cascade and destroying the record that someone accepted the
code of conduct is not something a Delete button should do.

**Phase 3** enrols mandatory training (7 days) and assigns policy sign-offs
(3 days), both dated in the tenant's own zone. It deliberately does **not**
fabricate an asset assignment — issuing a laptop is a physical act, and a false
row in a register that exists to be authoritative is worse than a gap. And it
reports KPI assignment as **blocked**, naming the three unreconciled review
systems, rather than picking one and quietly becoming a fourth pathway.

### Two defects found while walking the flow

Both the same shape as the ones under X-07: a write or a check that reports
success while doing nothing.

**1. An org admin could not edit their own organisation, and the save said it
worked.** `tenants` had no UPDATE policy for `org_admin` at all — only
`super_admin` (ALL) and `regional_admin` (country-scoped). The product hid it
because `updateOrganizationProfile` writes through the **service-role client**,
so the app's main write path to that table had never exercised RLS at all. And
PostgREST answers an UPDATE matching zero rows with **200 and no error**, so the
company-profile form saved nothing, toasted "saved", and left the segment at
2/6.

Fixed on both sides, because either alone would leave the trap: an UPDATE policy
scoped to the caller's own tenant, with a trigger blocking `plan`, `status`,
`slug` and `country_code` — otherwise a settings form becomes a way to set your
own billing plan or lift your own suspension — and `.select()` on the update so
a write that changes nothing raises instead of returning `ok`. Verified under a
real JWT: tagline succeeds, plan/status/country are refused by name, another
tenant matches no rows.

**2. The four "pre-existing" test failures were stale fixtures, not a bug.**
`overtime_penalty_rates` carries a `country_code` and **no `tenant_id`** — the
rates are shared reference data, like `public_holidays`. Every fixture in
`tests/onboarding-readiness.test.ts` filed them under a tenant and left
`country_code` off the tenant, describing a table shape that does not exist.
Four tests had failed continuously, and CLAUDE.md recorded the redness as the
expected baseline — which is exactly the state in which a real regression goes
unnoticed. One of the four that *passed* was passing vacuously, asserting the
right answer for the wrong reason.

**The suite is now fully green: 990 passed, 0 failed.** `rbac.test.ts` and
`audit-overtime.test.ts` still cannot collect without live service-role
credentials; that is a missing credential, not a failure.

### Still not built, and why

| # | Item | Why not |
| --- | --- | --- |
| 3 | Pay calendars as first-class rows | Its own feature; the guide sequences to `/admin/payroll-setup-wizard`, which covers pay frequency today |
| 5 | KPI library | Blocked behind the three unreconciled review systems, same as Phase 3 step 1 |
| 6 | Rating scales as config | Implicit in review templates; the guide checks a template exists |
| 7 | Split pay across accounts | **Blocked by design** — bank details already exist in three tables and TFN in two. A fourth shape in a payroll product is a defect waiting to happen. Reconcile the owner first |
| 8 | ABN Lookup, address autocomplete | External APIs needing a key and a failure mode; neither exists in this repo |
| 9 | SCORM | Deferred, §10 of the spec |

---

## CLAUDE.md update

Corrections the audit proved necessary:

- **Line 217-219 is wrong**: `org.tsx` does *not* wrap its `<Outlet/>` in an `AppShell` on the
  normal path. Only `me.tsx`, `org.documents.tsx` and `org.recruitment.tsx` do.
- **Line 288**: "13 of 50 admin routes" is correct but incomplete — the real orphan count is 21
  once `/org/*` is included.
- **Line 289-290**: "roughly 9 pages render their own `<header>`" — 5 are genuinely redundant; the
  rest are orphans for which it is the only header.
- **Add**: the route-parent `<Outlet/>` rule from last session, and the tenant-scoping rule from
  W1.2 — both now have enforcing tests.
- **Add**: the three-review-systems map, which is the single most confusing thing in the codebase.
- **Update** Current status.

---

## Verification

**Per item**, holding the documented baseline of 667 passed / 4 failed
(`tests/onboarding-readiness.test.ts` is pre-existing; `rbac.test.ts` and `audit-overtime.test.ts`
cannot collect without live credentials):

```sh
node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit          # must stay at 0
node node_modules/eslint/bin/eslint.js <changed files>  # scope to changed; ~33k pre-existing
```

**W1 is proven against the live database, not by unit test alone** — that is the only way to
verify RLS:

- Sign in as `sam.platform` (super_admin, Demo ORG) → the offboarding dropdown shows **1**
  employee, not 15, and does not list Sam himself.
- Sign in as `alice.acme` (org_admin) → shows exactly Acme's 9, excluding Alice; Initiate
  succeeds and writes a row.
- Sign in as an `hr` account → the page is reachable and Initiate succeeds (per the open decision).
- Direct PostgREST read with each token confirms no cross-tenant rows — the middleware is not the
  boundary, RLS is.
- After reseeding: the expense-claim Category dropdown is populated, and the holiday tile on the
  dashboard resolves instead of erroring.

**W2**: the Playwright harness from W2.4 is itself the verification — per-role, per-route status,
console errors, duplicate server-fn counts, chrome present. Specifically assert
`listNotifications` fires **once** across a 10-route walk, not once per route.

**W3/W4**: e2e specs per module (`e2e/kpi-distribution.spec.ts`, `e2e/wfh-geofence.spec.ts`) and
`tests/nav-uniqueness.test.ts`.

The dev server is running on `:8080` with `VITE_DEV_BYPASS_MFA=1`. Only **one** should ever run —
two concurrent instances corrupted `routeTree.gen.ts` last session.
