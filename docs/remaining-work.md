# Remaining work — what is left to call this platform finished

**Written 2026-09-03**, after Wave 5 and audit A1. **Updated 2026-09-06**, after Wave 6.

Waves 1–5 made the product *correct* and *reachable*: no dead links, no orphan server functions,
no unauthenticated endpoint outside the declared thirteen. Wave 6 built the LMS and closed X-07,
the last drift axis. What is left is genuinely unbuilt, plus two pieces of debt with names.

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

## Priority 2 — Guided onboarding routes *(W6 is done, so this is next)*

**What.** Three guided flows the product owner specified on 2026-09-03: an org admin configuring a
tenant through seven setup segments, an employee completing their own record (TFN declaration,
bank, super, documents), and the automatic provisioning that fires when their record goes Active.

**Why it matters.** The platform has the data and the pages; it has no *sequence* over them. An
admin setting up a new tenant today has to find fourteen separate surfaces and know the order to
visit them in. Nothing tells them what is still missing, and nothing stops them inviting staff
into a half-configured org.

**What to build.** Read `docs/onboarding-guided-routes.md` — it carries the workflow verbatim plus
a coverage map against the live schema. The short version: **most of Phase 1 is sequencing, not
new subsystems.** Ten things are genuinely missing, of which the guided shell itself (stepper,
progress sidebar, auto-save, resume) is the real work.

Three things to settle before writing code:

- **Bank details already exist in three tables** (`employee_payroll_details`,
  `staff_onboarding_profiles`, `employees`) and TFN in two. The spec's "split pay across multiple
  accounts" would be a fourth shape. Reconcile the owner first — a fourth representation of an
  employee's bank account in a payroll product is a defect waiting to happen, and a TFN in two
  places is a privacy problem as much as a modelling one.
- **`checkPayrollReadiness` / `checkOvertimeReadiness` already are** the "mandatory items
  complete" concept the spec's Setup Lock needs. Extend them; do not invent a parallel notion of
  readiness.
- **Phase 3 step 1 auto-assigns KPIs**, which lands on the three unreconciled review systems in §5
  below. Resolve those or this adds a fourth review pathway.

**Why it waited for W6.** Segment 4 (LMS module authoring, quizzes, compliance flagging) and Phase 3
step 2 (mandatory module enrolment with due dates) are both W6 deliverables. Building the guided
route first would mean stepping through a segment that configures nothing.

**Done when.** A new org admin can go from an empty tenant to "Finalize & Activate" without
leaving the flow or being told to go find a page, and a new employee can complete every section of
their own record from one link.

---

## Priority 3 — Performance, in the order it will bite

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

## Priority 4 — Named debt, safe to defer

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

## How to not undo Waves 5 and 6

W5 closed three of the four ways a page's permission could disagree with itself; W6 closed the
fourth. Every one was found by a person, not by the suite, and each is now held by a test that
fails loudly. Before changing gating, run:

```sh
bun run test tests/nav-route-gate-parity.test.ts tests/nav-render-filter.test.ts \
             tests/nav-integrity.test.ts tests/public-endpoint-security.test.ts \
             tests/no-orphan-server-fns.test.ts tests/au-guard-coverage.test.ts \
             tests/training-access.test.ts
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

---

## Baseline

A green test run reads **4 failed / 948 passed / 5 skipped**. The 4 are pre-existing failures in
`tests/onboarding-readiness.test.ts`; `tests/rbac.test.ts` and `tests/audit-overtime.test.ts`
cannot collect without live service-role credentials. Any *other* failure is yours.
