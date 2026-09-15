# Changelog

All notable changes to Global Payroll Hub / HRPPL.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from v1.0.0 onward.

Before v1.0.0 the project carried no version at all — the history below is reconstructed from the
wave records in `docs/plan-waves.md` and from git. Dates are the dates the work landed on `main`.

---

## [1.0.0] — 2026-09-15

First production release. Deployed to a **new, empty Supabase project**; the schema is built
entirely by replaying `supabase/migrations/` in order, with **no user, tenant or demo data** of any
kind. Everything the migrations insert is reference or system data: countries and public holidays,
subscription plans, onboarding and offboarding checklist *templates*, payslip *templates*,
knowledge-base articles, storage buckets, and one singleton row for the email subsystem.

### The product

Multi-tenant HR and payroll SaaS on TanStack Start (React 19, SSR) and Supabase (Postgres, RLS,
Auth, Storage).

- **People** — employees, departments, branches, teams, reporting lines, documents with expiry and
  verification, the company directory.
- **Time** — attendance with geofenced clock-in, timesheets, overtime, TOIL, leave with accrual and
  carry-over, public-holiday calendars per country and branch.
- **Pay** — payroll runs with compute / submit / approve, payslips and PDF delivery, pay components,
  Australian STP2 and Payday Super, Nepali payroll.
- **Requests** — one normalised inbox over leave, work-from-home, expenses, support tickets, TOIL
  and grievances, plus an approvals queue scoped to what each approver may actually decide.
- **Growth** — performance reviews, 360 feedback, duty and KPI scorecards, a learning module with
  lessons, quizzes and certificates.
- **Lifecycle** — recruitment and a public careers page, guided onboarding, offboarding, discipline,
  a policy library with versioned acknowledgements.
- **Platform** — eight roles from `employee` to `super_admin`, a tenant switcher for platform
  accounts, white-label branding, billing and subscriptions, an audit trail, and a public developer
  API with OpenAPI.

### Security posture at launch

- **Row-level security on every table.** 708 policies; RLS is the boundary, and every list-style
  query also filters `tenant_id` itself, because `super_admin` policies carry no tenant predicate.
- **Every server function re-checks account suspension** on every request, through the caller's own
  client and never the service-role key.
- **Public endpoints** (webhooks, cron hooks, the careers page) authenticate by bearer secret and
  are rate limited on a salted hash of the IP, failing open so a limiter outage cannot take a
  careers page offline.
- **Caught errors are never echoed** from public hook endpoints — the caller gets a correlation
  ref, the detail goes to the server log.
- **Signup is closed by default.** A new account needs a pending invitation, the create-organisation
  flow, an OAuth provider, or an explicit allowlist entry.

### Known properties worth reading before launch

- **The signup allowlist is in the schema.** `handle_new_user` names the addresses that may sign up
  without an invitation. See `supabase/migrations/` for the current definition — it is a function
  body, so the *last* migration to define it wins.
- **Platform accounts have no tenant.** A `super_admin` sees nothing on tenant-scoped pages until
  they pick a tenant in the switcher. That is deliberate, not a fault.
- **`docs/remaining-work.md` is current** and lists what is open, struck through what is not. Four
  items remain open at this release; none is a defect.
- **`docs/qa-sweep-report.md` is stale** (pre-Wave 5) and says so. It is the outstanding
  verification step: the only check that walks all eight roles through a real browser.

---

## Pre-1.0 history

Summarised; the full record for each wave is in `docs/plan-waves.md`.

### Wave 7 — guided setup and the policy library (2026-09-07)

Seven-segment setup guide that **computes completion from the tenant's own rows rather than storing
a flag**, so a segment reopens when its data is deleted. Policy library with versioned
acknowledgements. Phase 3 provisioning for mandatory training and sign-offs. Found and fixed:
`tenants` had no UPDATE policy for `org_admin` at all, and a zero-row PostgREST update was
reporting success.

### Wave 6 — learning, and X-07 (2026-09-06)

The LMS: lessons, per-lesson progress, a private content bucket, a course builder and a player.
Closed the last gate-drift axis. Found two silent failures larger than the one being fixed — a
linter-driven migration had flipped the quiz view to `security_invoker`, so no learner could read a
quiz question and therefore no employee could complete any course; and seven tables embedded
`employees(...)` through a foreign key that did not exist, leaving four training surfaces and the
leave half of both requests inboxes permanently empty.

### Wave 5 — reachability (2026-08)

Every authorisation surface resolves **one feature key**. 36 dead nav links, 11 inline-check
disagreements and 23 ungated destinations converged; orphan server functions went from 48 to 0.

### Waves 1–4

The domain model, the navigation architecture, attendance and geofencing, payroll, and the request
and approval flows.

---

## Release checklist

Kept here because a release is a procedure, not an event.

1. `bun run test` — expect 0 failed. `tests/rbac.test.ts` and `tests/audit-overtime.test.ts` need
   live service-role credentials and cannot *collect* without them; that is a missing credential,
   not a failure.
2. `NODE_OPTIONS="--max-old-space-size=8192" bun run build` — the default node heap is not enough
   and fails with a bare `SIGABRT`.
3. Apply migrations oldest-first, halting on the first failure.
4. Diff the target schema against the source: tables, functions, policies, triggers, enums, buckets.
5. Confirm `VITE_*` values point at the right project **before** building — they are compiled in at
   build time, not read at runtime, so a rebuild is required after any change.
6. Never run `scripts/demo-seed.ts` against production. It creates users and tenants.
