# Remaining work — what is left to call this platform finished

**Written 2026-09-03**, after Wave 5 and audit A1. `main` @ `4da3ead`.

Waves 1–5 made the product *correct* and *reachable*: no dead links, no orphan server functions,
no unauthenticated endpoint outside the declared thirteen. What is left is genuinely unbuilt, plus
one open drift axis and two pieces of debt with names.

Each item below carries the same four things, so it can be picked up cold: **what**, **why it
matters**, **what to build**, and **how you know it is done**.

---

## Priority 1 — X-07: the nav disagrees with RLS on training

**What.** `/org/training`'s nav row and route gate admit `hr` and `branch_admin`. Every RLS policy
on `training_courses`, `training_enrollments` and `certifications` admits only `org_admin`,
`super_admin` and `manager`. `assignCourse` carries no server-side role check of its own, so it
relies entirely on those policies.

**Why it matters.** HR opens the training page, selects employees, clicks Assign, and Postgres
rejects the insert. The page loads and the database refuses — the exact failure that shipped on
offboarding. It is the **last of the four gate-drift axes** still open; the other three were closed
in Wave 5 and are held by tests.

**What to build.** Decide the direction first, because they are not equivalent:

- *Widen the policy* (a migration) if HR and branch_admin should administer training. Add them to
  the three policies, and add `assertHrOrAdmin` to `assignCourse` so the server refuses before
  Postgres does.
- *Narrow the key* (one line in `rbac.ts`) if they should not. Cheaper, and it moves the nav row
  and the route together.

Do not do both halves in different changes.

**Done when.** As `hana.acme` (hr) and `bruce.acme` (branch_admin), `/org/training` either assigns
successfully or is not offered at all. No third outcome.

---

## Priority 2 — Acting-tenant coverage: 13 of 97 modules

**What.** `TenantSwitcher`, `ActingTenantBanner` and `platform_acting_tenant` all exist and work.
Only the 13 modules calling `requireTenantId()` / `getTenantId()` honour them. The other 84 read
`profiles.tenant_id` directly, which is `NULL` for a platform account.

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

## Priority 3 — Wave 6: Learning (LMS)

**What.** Training today is upload-a-certificate. `external_url` is the only content field on a
course, so every course sends the learner somewhere else to actually learn. No lessons, no
ordering, no hosting, no progress *inside* a course — enrollment jumps straight from `assigned` to
`completed` when the quiz passes.

**Scope, decided:** tenant-scoped. Authoring sits with `org_admin` / `hr`; **managers and
employees are the audience**. The cross-tenant/regional course library (nullable `tenant_id`,
`owner_scope`, country scoping) is **parked with D-8** — the design is retained in
`docs/plan-waves.md` and nothing else here depends on it.

**What to build.**

1. **Migration — the content layer.** Two tables, deliberately small:
   - `training_lessons` — `course_id`, `sort_order`, `title`, `content_type`
     (`rich_text | video | document | external_link`), `body`, `content_url`, `duration_minutes`,
     `is_required`.
   - `training_lesson_progress` — one row per learner per lesson, with `started_at` /
     `completed_at`.
   - A `training-content` storage bucket, plus `content_mode` on `training_courses` defaulting to
     `'external'` so **existing courses are unchanged**.
2. **Course builder** — `/admin/training/$courseId`, a detail route under the existing catalogue,
   not a new top-level destination. Three tabs: Lessons (ordered, per-type editor), Quiz (the
   question bank that currently lives inline on `/admin/training`, moved where it belongs),
   Settings (pass score, attempts, validity, require-lessons-before-quiz).
3. **Course player** — `/me/training/$courseId`. Lesson list, content pane, mark-complete,
   resume-where-you-left-off. Reuse `QuizTaker` unchanged; gate the quiz on required lessons.
4. **Fix X-07 in the same wave** (Priority 1 above) — the training RLS drift is this domain's.
5. **Progress on the org view** — the roster gains per-course completion, so a manager can see
   where their team is.

**Design system.** Everything needed exists: `PageHeader`, `SectionCard`, `KpiTile`, `StatusChip`,
`EmptyState`, `SkeletonRows` from `src/components/monday.tsx`, plus `Tabs`, `Dialog`, `Progress`
and `Textarea` from `src/components/ui/`. If a screen needs a component that does not exist, that
is a finding — there wasn't one when this was specced.

**Done when.** A course with three lessons and a quiz can be authored by `hana.acme`, assigned,
taken to completion by `nina.globex`, and shows as complete on the org roster — without leaving
the product.

---

## Priority 3.5 — Guided onboarding routes *(after Wave 6, not before)*

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

**Why after W6.** Segment 4 (LMS module authoring, quizzes, compliance flagging) and Phase 3
step 2 (mandatory module enrolment with due dates) are both W6 deliverables. Building the guided
route first would mean stepping through a segment that configures nothing.

**Done when.** A new org admin can go from an empty tenant to "Finalize & Activate" without
leaving the flow or being told to go find a page, and a new employee can complete every section of
their own record from one link.

---

## Priority 4 — Performance, in the order it will bite

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

## Priority 5 — Named debt, safe to defer

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

## How to not undo Wave 5

The wave closed three of four ways a page's permission could disagree with itself. Every one was
found by a person, not by the suite, and each is now held by a test that fails loudly. Before
changing gating, run:

```sh
bun run test tests/nav-route-gate-parity.test.ts tests/nav-render-filter.test.ts \
             tests/nav-integrity.test.ts tests/public-endpoint-security.test.ts \
             tests/no-orphan-server-fns.test.ts tests/au-guard-coverage.test.ts
```

Three rules those tests encode, worth stating in prose because the next person will meet them:

1. **One feature key per page**, quoted by the nav row, the route gate and any inline check. If you
   are writing a role list by hand, you are creating the next dead link.
2. **A skip is a failure unless it is written down.** Every `continue` in those tests is now an
   allow-list entry with a reason. That is the whole lesson of the wave: a check that compares two
   things reports nothing when one of them is absent.
3. **A server function is a public HTTP endpoint.** A gated page calling an ungated function is an
   ungated function.

---

## Baseline

A green test run reads **4 failed / 913 passed / 5 skipped**. The 4 are pre-existing failures in
`tests/onboarding-readiness.test.ts`; `tests/rbac.test.ts` and `tests/audit-overtime.test.ts`
cannot collect without live service-role credentials. Any *other* failure is yours.
