# Tenant isolation, seed data, module completion & IA rework

## Status

| Wave | State |
| --- | --- |
| W1 · Correctness & data | **Done** |
| W2 · Platform hygiene & QA harness | **Done** |
| W2.5 · CodeQL fix + attendance overhaul | **Done**, migration applied and verified live |
| W3.0 · Tenant switcher | Next |
| W3.1 · KPI/KRA distribution | Queued |
| W3.2 · Leave & holidays | Queued |
| W3.3 · WFH + geofence exception | **Largely delivered in W2.5** — reduced remainder below |
| W4 · Information architecture | Queued (design doc first) |

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

### W3.0 · Tenant switcher for platform admins — *pulled forward, blocks demoing*

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


### W3.1 · KPI/KRA: build the missing distribution link
Per the approved model — HR assigns, employee self-assesses, manager reviews.

The plumbing mostly exists and is unwired. `generateReviewInstances`
(`src/lib/review-instances.functions.ts:68`) **already accepts `employeeIds`**, but its only
caller (`admin.review-templates.tsx:244`) never passes it, so every Schedule click targets the
whole tenant. Build:

- An **assignment UI** on the templates page: pick cycle, department/employees, due date — feeding
  the parameter that already exists.
- Wire up **`reviewReviewInstance`** (`review-instances.functions.ts:226`), currently dead code
  with zero callers. That is the manager-review step; approvers are already notified and sent to
  `/admin/review-analytics`, which has no action buttons.
- **Notify on assign and on submit.** Both are cron-only today
  (`api/public/hooks/review-instance-reminders.ts`), so an assignment is invisible for up to a day.
- Enforce `required: true` on template items (declared in `review-presets.ts:31`, never checked)
  and make due dates mean something.
- Fix the dead pointer at `admin.review-templates.tsx:309` → `/org/performance`.
- Close the **RLS gap**: the role branches on `review_instances` (`20260618042929:71-73`, `:81-83`)
  have no `tenant_id` predicate — the same class of bug as W1.1.
- An **org-wide rollup** answering "N indicators sent, M completed" — `reviewDashboardSummary`
  covers only the scorecard system today.

**Recommend consolidating to two systems, not three** (scorecards + duty KPI), retiring the
`performance_reviews` fan-out. Flagging rather than assuming — it deletes a working code path.

### W3.2 · Leave & holidays
Ordered by severity, and the first two are security-relevant:

1. **`days` is client-computed and server-trusted** (`leave.functions.ts:77`) — a crafted request
   can claim any day count up to 366 regardless of the date range. Recompute server-side.
2. **No balance check on submit** — negative-balance leave is accepted.
3. **No weekend/holiday exclusion** (`leave.tsx:31-40` counts raw calendar days).
4. **No in-app notification on any leave event** — email only, silently invisible if
   `employees.email` is null.
5. **`leave_approval_routes` is authored but never consumed** — multi-level approval is configured
   and not enforced; any tenant manager can approve anything.
6. **Holidays**: `/admin/holiday-calendar` (461 lines, recurring + AU sync) is strictly better than
   the nav'd `/admin/holidays` and is unreachable. Keep the orphan, retire the weaker one.
   `/admin/employee-holidays` is mis-gated under `org.reviewTemplates` (`AppShell.tsx:895-901`).

### W3.3 · Work-from-home + geofence exception — *mostly delivered in W2.5*

Delivered: the `wfh_requests` table and RLS, the employee request route
(`/me/wfh`) and the approver route (`/admin/wfh`), the `clockIn` short-circuit
via `has_approved_wfh()`, the `work_location` column, the new `mismatch_type`
members, writes to `geofence_reconciliation` at punch time, and a trace for
refused punches.

**What remains:**

- `clockOut` records position but still does not validate it. The asymmetry is
  now visible on the row rather than invisible, which was the first step, but a
  policy decision is still owed — trapping someone on site to end a shift is
  worse than the gap, so this probably wants a flag rather than a block.
- No email on a WFH decision; in-app only. The same gap leave has.
- The 24h `geofence-reconciliation` cron does not know the new WFH mismatch
  types, so those rows are only ever written at punch time.
- A tenant-level "remote work allowed" setting, so tenants that never permit it
  can hide the request route entirely.

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

**Deliverable 1 — a published design document.** No code until it is approved.

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
