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

## Priority 1 — Acting-tenant coverage: 14 of 97 modules

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

## Priority 2 — Performance, in the order it will bite

Measured 2026-09-03, not guessed. Neither item bites at demo scale; both are real at tenant scale.

**4a. 36 loop-with-query sites.** `payroll.functions.ts` has 8 — the hottest path in the product.
The pattern is a per-row lookup inside a `for` loop where one `.in()` would do. The fix is
mechanical and was already applied to the sharpest instance
(`generateSuperContributionsForRun`: 500 sequential round trips on a 500-employee run, now one
query). Work through `payroll.functions.ts` first.

**4b. 194 `useQuery` sites, 19 with `staleTime`.** The default is `0`, so most refetch on every
mount and every window focus. The shell re-renders on every navigation, which is how the
`listNotifications` storm happened before. Add `staleTime` per query class: seconds for a live
queue, minutes for reference data, `Infinity` for a tenant's own country.

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

A green test run reads **0 failed / 990 passed / 5 skipped**.

**This changed in Wave 7.** The baseline used to read "4 failed", and those four were stale
fixtures in `tests/onboarding-readiness.test.ts` describing a table shape that no longer exists —
not a product bug. A suite that is normally red cannot tell you when something breaks, which is the
only reason to have one, so treat any red as yours.

`tests/rbac.test.ts` and `tests/audit-overtime.test.ts` still cannot *collect* without live
service-role credentials. That is a missing credential, not a failure.
