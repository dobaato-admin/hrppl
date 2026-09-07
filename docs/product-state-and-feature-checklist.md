# HRPPL / Global Payroll Hub — Product state & verification checklist

**Generated:** 2026-08-30 · **Revised:** 2026-09-03 after Wave 5 + audit A1 · **Branch:** `main` @ `4da3ead`
**Scale:** 166 routes · 97 fn modules · 591 server fns · 119 nav destinations · 208 migrations · 60 unit-test files
**Dev server:** `bun run dev` → http://localhost:8080 · **Supabase:** `xnrjfrxzahmfdrqfsnnq` (dev)

This document is two things at once:

1. **A state-of-the-product report** — what exists, who sees what, and how the flows connect.
2. **A verification checklist** — every row names the demo account to sign in as, so you can
   tick it off against a real, correctly-scoped login rather than guessing.

Password for every demo account: **`DemoPassw0rd!23`** · Sign in at `/auth`.
MFA is enforced globally, but `.env` has `VITE_DEV_BYPASS_MFA=1`, so local sign-in skips it.

---

## 1. What the product is

A **multi-tenant HR and payroll SaaS**. One deployment serves many customer organizations
("tenants"); a platform team sits above them all. It covers the full employee lifecycle:

> **hire → onboard → work (attendance, leave, WFH, timesheets) → get paid → be reviewed →
> be developed → be disciplined/supported → exit**

plus the org-side machinery that makes each of those legal and auditable — payroll compliance
(AU STP2 / Payday Super, Nepal payroll), document signing, asset custody, geofenced attendance,
audit retention, and a public developer API.

**Scale:** 197 route files · 97 server-fn domains · 207 migrations · 55 unit tests · 37 E2E specs.

### Technical shape (one paragraph)

TanStack Start (React 19, file-based routing, SSR) on Supabase (Postgres + RLS + Auth + Storage),
deployed to Vercel. Business logic lives in `createServerFn` RPC modules (`src/lib/*.functions.ts`),
**not** Supabase Edge Functions. RLS policies are the real security boundary; `src/lib/rbac.ts`
controls UI visibility only. Every list query must filter `tenant_id` itself — RLS is a boundary,
not a scope.

---

## 2. The eight roles, and what each one *is*

| Role | Has a tenant? | One-line identity | Demo account |
|---|---|---|---|
| `super_admin` | **No** (platform) | Runs the whole platform. Sees every tenant, but only via the tenant switcher. | `sam.platform@demo.hrppl.test` |
| `regional_admin` | **No** (platform, country-scoped) | Same, but fenced to countries in `role_scope`. Seeded to **AU only** → sees Acme, not Globex. | `rita.platform@demo.hrppl.test` |
| `org_admin` | Yes | Owns one customer org end-to-end. The broadest tenant role. | `alice.acme@…` / `gina.globex@…` |
| `branch_admin` | Yes | org_admin minus the org-defining powers (no roles, branches, white-label, danger zone). | `bruce.acme@demo.hrppl.test` |
| `hr` | Yes | People operations: hiring, records, discipline, medical, training, offboarding. **No payroll.** | `hana.acme@…` / `hugo.globex@…` |
| `finance` | Yes | Money: payroll, pay rates, expenses, overtime, reports. **No HR records.** | `fred.acme@demo.hrppl.test` |
| `manager` | Yes | Their team only. Approves, reviews, sees team comp. | `mia.acme@…` / `maya.gurung@…` |
| `employee` | Yes | `/me/*` and their own records. Nothing org-wide. | `evan.acme@…`, `nina.globex@…` |

Roles are **additive**. `super_admin` > `regional_admin` > `org_admin` > `branch_admin`/`hr`/`finance`/`manager` > `employee`.

### The two tenants

| Tenant | Country | Currency | Founder | Why it exists |
|---|---|---|---|---|
| **Acme Global** | AU | AUD | Alice Nguyen | Exercises AU payroll (STP2, Payday Super, awards), 9 employees, 4 departments |
| **Globex Nepal** | NP | NPR | Gina Shrestha | Exercises Nepal payroll + a **+05:45 sub-hour timezone**, 5 employees |

**One tenant cannot demonstrate isolation.** The whole point of two is that you sign in as an
Acme user and confirm Globex is invisible — and vice versa.

---

## 3. How each user type sees the product

The sidebar is assembled in `src/components/AppShell.tsx` and gated by `can(feature, roles)`
from `src/lib/rbac.ts`. Nav groups appear/disappear wholesale when nothing inside is visible.

| Nav group | employee | manager | hr | finance | branch_admin | org_admin | regional_admin | super_admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **My workspace** (30 items) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Practice** (5 items) | — | — | — | ✅ | — | ✅ | — | ✅ |
| **Manager** (2 items) | — | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| **Organization** (52 items) | — | partial | partial | partial | ✅ | ✅ | — | ✅ |
| **Regional** (1 item) | — | — | — | — | — | — | ✅ | ✅ |
| **Super admin** (10 items) | — | — | — | — | — | — | — | ✅ |
| **Account** (3–6 items) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Help** (1–2 items) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Note:** `regional_admin` is deliberately *not* in `ORG_LAYOUT_ROLES`, so it sees no
> Organization group at all — it reaches tenant data through the switcher, then acts as that org.

### The platform-account quirk (expected, not a bug)

`super_admin` and `regional_admin` have `profiles.tenant_id = NULL`. Every correctly tenant-scoped
page is therefore **legitimately empty** for them until they pick a tenant.

**This is now solved** by `TenantSwitcher.tsx` (top bar) + `ActingTenantBanner.tsx` (amber "Acting
as X" strip on every page). CLAUDE.md still lists "no tenant switcher" as gap #1 — **that is stale**;
it landed in commit `1f994a1`.

---

## 4. The overall flow

```
PUBLIC                    SIGNUP / ENTRY                 IN-APP
──────                    ──────────────                 ──────
/ (marketing)             /signup ──┐
/pricing                            ├→ create_organization → /org/setup (wizard) ─┐
/blog, /help                        │                                             │
/careers/:tenant/:job ──→ apply     └→ staff_invitations → /invite/:token ────────┤
/contact → leads                                                                  │
                                                                                  ▼
                                          AuthRouteGate: no tenant? → /welcome
                                                          setup incomplete? → /org/setup
                                                          suspended? → /suspended
                                                          MFA unmet? → /me/security
                                                                                  │
                                                                                  ▼
                                                              /dashboard  ("Home")
                                                          ┌───────┴────────┐
                                                    /me/* (self)      /org/* + /admin/* (org)
```

### The employee's day

`ClockWidget` (floating, rendered once in `ShellInner`) → **clock in** → `resolvePunchInstant`
trusts client time within ±5 min → `evaluateGeofence` scores GPS accuracy →
`inside` / `inside_low_confidence` / `uncertain` / `outside`. An approved **WFH request** is the
sanctioned exception that lets an outside punch succeed as `work_location = 'remote'`.
Refusals are written to `geofence_audit_log` through the *service-role* client so the subject
cannot suppress them.

### The request lifecycle (one shape, six tables)

`leave_requests` · `wfh_requests` · `expense_claims` · `support_tickets` · `toil_requests` · `grievances`

`src/lib/requests-inbox.functions.ts` normalises all six — and their six different status
vocabularies — into one `InboxRow`, rendered by `RequestList.tsx` on both pages:

- **`/me/requests`** — personal only: what *I* asked for.
- **`/admin/requests`** — org-wide repository: everything, every state, with history.

**Deciding still happens on the page that owns the rules** (approving leave touches balances;
approving WFH changes what `clockIn` accepts). WFH's state machine is enforced in **Postgres**
(`tg_wfh_lifecycle` + RLS), not in the server fn.

A manager may **raise** a request and may never **decide** it. That is why `/admin/requests`
shows their own row (a repository must be complete) while the actionable queue hides it.

---

## 5. Feature checklist

Legend: **Sign in as** = the demo account that gives you correctly-scoped data for that row.
Tick the box once you've seen it behave as described.

### 5.1 Public / pre-auth

| ☐ | Feature | Route | Sign in as | What you should see |
|:-:|---|---|---|---|
| ☐ | Marketing home | `/` | *(signed out)* | Landing page, no chrome |
| ☐ | Pricing | `/pricing` | *(signed out)* | Plan tiers |
| ☐ | Blog (public) | `/blog`, `/blog/:slug` | *(signed out)* | Published posts only |
| ☐ | Careers board | `/careers`, `/careers/:tenantSlug` | *(signed out)* | Per-tenant public job list |
| ☐ | Job detail + apply | `/careers/:tenantSlug/:jobSlug` | *(signed out)* | Application form |
| ☐ | Contact → lead capture | `/contact` | *(signed out)* | Writes a row visible at `/platform/leads` |
| ☐ | Help / knowledge hub | `/help`, `/help/:slug` | *(signed out)* | Articles from `knowledge_articles` |
| ☐ | Developer docs | `/developers` | *(signed out)* | Public API landing |
| ☐ | Sign in | `/auth` | any | Email + password; Google OAuth is deploy-only |
| ☐ | Sign up | `/signup` | *(new)* | Intent split: create org vs join |
| ☐ | Password reset | `/forgot-password` → `/reset-password` | any | Email round-trip |
| ☐ | Invitation accept | `/invite/:token` | *(invited)* | Auto-accepts if signed in with matching email |
| ☐ | Document signing (public) | `/sign/:envelopeId` | *(signer)* | Signature ceremony, no session needed |
| ☐ | Signature certificate | `/sign/certificate/:token` | *(anyone w/ token)* | Audit certificate |
| ☐ | Unsubscribe | `/unsubscribe` | *(anyone)* | Email preference opt-out |

### 5.2 Every signed-in user — "My workspace"

**Sign in as `evan.acme@demo.hrppl.test`** (plain `employee` — the strictest view). Every row below
should be reachable; nothing org-wide should appear anywhere in the sidebar.

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Home / dashboard | `/dashboard` | 5 KPI tiles + 3 board cards. *Known: identical for employee/manager/hr/finance — W4 will fix* |
| ☐ | Me overview | `/me` | Employee card, manager, leave balances, recent leave, recent payslips |
| ☐ | Contact details | `/me/contact` | Editable personal contact info |
| ☐ | Banking & tax | `/me/banking-tax` | Bank account + tax declarations |
| ☐ | Company directory | `/me/directory` | **All Acme colleagues, zero Globex.** Reads via service-role by design — no compensation, no identifiers |
| ☐ | Security / MFA | `/me/security` | TOTP enrolment, self-heal for interrupted enrolment |
| ☐ | My leave | `/leave` | Balances + request form. Days are **server-computed**, weekends/holidays excluded, over-balance rejected |
| ☐ | Attendance | `/attendance` | Week grid in **local** dates. Clock in/out via floating widget |
| ☐ | My TOIL | `/me/toil` | Time-off-in-lieu accrual + requests |
| ☐ | Work from home | `/me/wfh` | Raise/cancel WFH. Cannot start non-pending, cannot be wholly past, cannot overlap |
| ☐ | My payslips | `/my-payslips` | Payslips once a run is approved |
| ☐ | My expenses | `/me/expenses` | Submit claims. **Category dropdown must be populated** (seeded) |
| ☐ | My performance | `/performance` | Review cycles I'm in |
| ☐ | My scorecards | `/me/reviews` | `review_instances` scorecards |
| ☐ | My duties | `/me/duties` | Assigned duties/responsibilities |
| ☐ | Duty self-review | `/me/duty-self-review` | Self-score against duties |
| ☐ | My training | `/me/training` | Enrolled courses |
| ☐ | Recognition | `/recognition` | Peer recognition wall |
| ☐ | Onboarding | `/onboarding`, `/onboarding/profile` | First-run profile completion |
| ☐ | My requests | `/me/requests` | **All six request types**, mine only, unified |
| ☐ | My documents | `/me/documents` | Documents shared with me |
| ☐ | Signatures | `/me/signatures` | Envelopes awaiting my signature |
| ☐ | My assets | `/me/assets` | Assets in my custody |
| ☐ | My record | `/me/timeline` | Employment timeline |
| ☐ | Grievances | `/me/grievances` | Raise a grievance |
| ☐ | Notifications | `/notifications`, `/settings/notifications` | Bell + preferences. **`listNotifications` fires once per session, not per navigation** |
| ☐ | Profile / account | `/settings/profile`, `/settings/account` | Name, avatar, sign-in methods |

### 5.3 Manager

**Sign in as `mia.acme@demo.hrppl.test`.** Everything in 5.2 **plus** the Manager group.
`employees.manager_id` is seeded, so team scoping has real rows to scope to.

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Team dashboard | `/team` | Direct reports only |
| ☐ | Requests inbox | `/admin/requests` | Org-wide repository **including her own row**… |
| ☐ | …but not actionable on self | `/admin/requests` | The actionable queue **hides Mia's own request**. A manager may raise but never decide |
| ☐ | Team members | `/admin/teams` | Team roster |
| ☐ | Employees (scoped) | `/org/employees` | Acme employees; **no Globex rows** |
| ☐ | Pay rates | `/org/pay-rates` | Team compensation (`manager.compensation`) |
| ☐ | Promotions | `/org/promotions` | Promotion proposals |
| ☐ | Expenses (approve) | `/org/expenses` | Team claims to approve — **not her own** |
| ☐ | Performance reviews | `/org/performance` | The **real** cycle control (not "Performance → Cycles") |
| ☐ | Review cycles | `/admin/review-cycles` | `ORG_ADMIN_OR_MANAGER` |
| ☐ | Review analytics | `/admin/review-analytics` | `ORG_ADMIN_OR_MANAGER` |
| ☐ | Duty-based KPI review | `/admin/duty-reviews` | `ORG_ADMIN_OR_MANAGER` |
| ☐ | Per-employee holidays | `/admin/employee-holidays` | `ORG_ADMIN_OR_MANAGER` — nav gate was fixed to match the route |
| ☐ | Training catalog | `/admin/training` | `ORG_ADMIN_OR_MANAGER` |
| ☐ | WFH approvals | `/admin/wfh` | Approve/reject team WFH. **Cannot decide her own** |
| ☐ | Public holidays | `/admin/holiday-calendar` | Read access |
| ☐ | Offboarding | `/admin/offboarding` | In `OFFBOARDING_ROLES`. Picker excludes **herself** and all Globex staff |
| ☐ | Timesheets | `/org/timesheets` | Team timesheets |
| ☐ | **Must NOT see** | — | Payroll runs, payroll setup, roles, branches, white-label, danger zone, Practice |

### 5.4 HR

**Sign in as `hana.acme@demo.hrppl.test`.** People operations. **No payroll, no money.**

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Employees | `/org/employees` | Full Acme roster + bulk import |
| ☐ | Employee detail | `/admin/employees/:employeeId` | Full record |
| ☐ | Invite staff | `/org/invitations` | Creates a real `staff_invitations` row |
| ☐ | Departments | `/admin/departments` | *Gated `ORG_ADMIN_ONLY` — **HR sees the nav link but the route rejects**. See §7* |
| ☐ | Designations | `/admin/designations` | *Same mismatch as above* |
| ☐ | Team assignments | `/admin/team-assignments` | *Same mismatch as above* |
| ☐ | Recruitment | `/org/recruitment`, `/org/recruitment/:jobId` | Jobs → candidates → stages (seeded) |
| ☐ | Candidate detail | `/org/recruitment/candidate/:candidateId` | Pipeline movement |
| ☐ | Careers settings | `/org/careers/settings` | Public board config |
| ☐ | Leave management | `/org/leave` | Approve leave. **`leave_approval_routes` is now enforced** |
| ☐ | Leave types | `/admin/leave-types` | *`ORG_ADMIN_ONLY` — nav/route mismatch* |
| ☐ | Onboarding admin | `/org/onboarding`, `/org/onboarding/tracker` | Pack assignment + progress |
| ☐ | Onboarding control room | `/org/onboarding/control-room`, `/…/:id` | Per-hire orchestration |
| ☐ | Missing info requests | `/admin/id-requests` | Chase missing employee data |
| ☐ | Documents | `/org/documents`, `/org/documents/expiring` | Envelopes, templates, expiry |
| ☐ | Training | `/org/training` | Assign courses |
| ☐ | Performance reviews | `/org/performance` | Cycle management |
| ☐ | Discipline & grievances | `/admin/discipline` | **Confidential** — `compliance.confidential` |
| ☐ | Medical incidents | `/admin/medical` | **Confidential** |
| ☐ | Exit & offboarding | `/admin/offboarding` | In `OFFBOARDING_ROLES` — RLS was aligned to match |
| ☐ | Biometric devices | `/admin/biometric` | Device registry |
| ☐ | Signing geofences | `/admin/geofences` | Fence definitions + `min_accuracy_meters` |
| ☐ | Analytics / Reports | `/org/analytics`, `/org/reports` | HR metrics |
| ☐ | Employment variations | `/hr/variations` | Contract changes |
| ☐ | **Must NOT see** | — | Run payroll, pay rates, payroll settings, billing, roles, danger zone |

### 5.5 Finance

**Sign in as `fred.acme@demo.hrppl.test`.** Money. **No HR records** (no discipline, no medical).

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Run payroll | `/org/payroll` | Payroll run wizard, AUD |
| ☐ | Pay rates | `/org/pay-rates` | Rate cards |
| ☐ | Overtime rates | `/admin/overtime-rates` | Overtime multipliers |
| ☐ | Payroll setup | `/admin/payroll-setup` | *`ORG_ADMIN_ONLY` — nav/route mismatch* |
| ☐ | Payroll settings | `/admin/payroll-settings` | `PLATFORM_OR_ORG_ADMIN` — *mismatch* |
| ☐ | Payslip templates | `/admin/payslip-templates` | `PLATFORM_OR_ORG_ADMIN` — *mismatch* |
| ☐ | Promotions | `/org/promotions` | Comp changes |
| ☐ | Expenses | `/org/expenses` | Approve org expenses |
| ☐ | Asset register | `/admin/assets` | Asset custody + value |
| ☐ | AU STP2 & Payday Super | `/admin/au-stp-audit` | **AU compliance audit** — Acme is AU, so this has data |
| ☐ | Analytics / Reports | `/org/analytics`, `/org/reports` | Financial reporting |
| ☐ | Practice — time | `/practice/time` | Billable time |
| ☐ | Practice — clients | `/practice/clients` | Client register |
| ☐ | Practice — projects | `/practice/projects` | Project register |
| ☐ | Practice — jobs | `/practice/jobs` | Job register |
| ☐ | Practice — invoices | `/practice/invoices` | Invoicing |
| ☐ | **Must NOT see** | — | Discipline, medical, recruitment, leave types, roles, danger zone |

### 5.6 Branch admin

**Sign in as `bruce.acme@demo.hrppl.test`.** Nearly everything org_admin has, **minus** the
org-defining powers. Fastest way to verify: confirm these five are **absent**.

| ☐ | Must NOT be visible | Route |
|:-:|---|---|
| ☐ | Setup wizard | `/org/setup` |
| ☐ | Branches | `/org/branches` |
| ☐ | Roles & permissions | `/org/roles` |
| ☐ | White-label | `/org/white-label` |
| ☐ | Danger zone + Org settings + Billing | `/org/danger`, `/settings/organization`, `/settings/billing` |

| ☐ | Must BE visible | Route |
|:-:|---|---|
| ☐ | Employees, invitations, recruitment | `/org/employees`, `/org/invitations`, `/org/recruitment` |
| ☐ | Payroll + expenses + assets | `/org/payroll`, `/org/expenses`, `/admin/assets` |
| ☐ | Discipline, medical, offboarding, biometric, geofences | `/admin/*` |
| ☐ | Analytics + reports | `/org/analytics`, `/org/reports` |

### 5.7 Org admin

**Sign in as `alice.acme@demo.hrppl.test`** (AU) — and **`gina.globex@demo.hrppl.test`** (NP) to
verify isolation from the other side.

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Org console | `/org` | Org landing |
| ☐ | Setup wizard | `/org/setup` | Reachable pre-tenant (`TENANTLESS_ALLOWED`); renders **without** org nav by design |
| ☐ | Branches | `/org/branches` | Branch CRUD + **per-branch timezone** (beats tenant tz) |
| ☐ | Roles & permissions | `/org/roles` | Grant/revoke roles within Acme only |
| ☐ | White-label | `/org/white-label` | Branding |
| ☐ | Org settings | `/settings/organization` | Name, country, **tenant timezone**, remote-work toggle |
| ☐ | Billing & subscription | `/settings/billing` | Plan + invoices |
| ☐ | Danger zone | `/org/danger` | Destructive org actions behind `DestructiveConfirm` |
| ☐ | MFA policy | `/org/settings/mfa-policy` | Org-wide second-factor enforcement |
| ☐ | Account suspension | via `/org/roles` | `account.suspend` — **cannot suspend a platform admin**, enforced server-side |
| ☐ | Templates Hub | `/admin/templates` | Meta-page linking the other four template libraries |
| ☐ | Review templates | `/admin/review-templates` | Shared by all three review systems |
| ☐ | Feedback templates | `/admin/feedback-templates` | 360 feedback |
| ☐ | KPI & KRA library | `/admin/kpi-kra` | **W3.1** — distribution link now built |
| ☐ | Duties & responsibilities | `/admin/employee-duties` | Duty assignment |
| ☐ | Holiday categories | `/admin/holiday-categories` | Calendar config |
| ☐ | Public holidays | `/admin/holiday-calendar` | AU holidays for Acme |
| ☐ | TOIL admin | `/admin/toil` | TOIL settings (seeded) |
| ☐ | Audit history | `/admin/audit-history` | Audit explorer + export |
| ☐ | API reference | `/admin/api-docs` | OpenAPI for `/api/v1/*` |
| ☐ | **Isolation check** | any org page | As Alice: **9 Acme employees, 0 Globex**. As Gina: **5 Globex, 0 Acme** |

### 5.8 Regional admin

**Sign in as `rita.platform@demo.hrppl.test`.** Country-scoped to **AU** via `role_scope`.

| ☐ | Check | Expected |
|:-:|---|---|
| ☐ | Regional console | `/regional` renders |
| ☐ | **No Organization group** in sidebar | Correct — `regional_admin` is not in `ORG_LAYOUT_ROLES` |
| ☐ | Tenant switcher lists **Acme only** | Globex (NP) is out of scope — this is the country fence working |
| ☐ | Act as Acme → org pages populate | Amber "Acting as Acme Global" banner on every page |
| ☐ | Clear acting tenant → pages empty again | Empty is *correct*, not broken |
| ☐ | Public holidays, overtime rates, payroll settings, payslip templates, API docs | Visible (`PLATFORM_OR_ORG_ADMIN`) |
| ☐ | Super-admin group absent | No `/platform/*`, no blog, no diagnostics |

### 5.9 Super admin

**Sign in as `sam.platform@demo.hrppl.test`.** Platform-wide, no tenant of their own.

| ☐ | Feature | Route | What you should see |
|:-:|---|---|---|
| ☐ | Platform admin home | `/admin` | `SUPER_ADMIN_ONLY` |
| ☐ | Tenants | `/platform/tenants` | Both Acme and Globex |
| ☐ | FX rates | `/platform/fx` | AUD/NPR conversion |
| ☐ | Leads | `/platform/leads` | Rows from `/contact` |
| ☐ | Trial invitations | `/platform/invitations` | Platform-issued invites |
| ☐ | Blog CMS | `/admin/blog` | Authoring for `/blog` |
| ☐ | Blog API & webhooks | `/admin/blog-integrations` | Integration keys |
| ☐ | Security findings | `/admin/security` | *(`/admin/security-findings` is a near-duplicate orphan — W4)* |
| ☐ | Diagnostics | `/admin/diagnostics` | System health |
| ☐ | Knowledge editor | `/admin/knowledge` | Authoring for `/help` |
| ☐ | **Tenant switcher lists BOTH tenants** | top bar | Unlike Rita, Sam has no country fence |
| ☐ | Act as Globex → **NPR + Asia/Kathmandu** | `/org/payroll`, `/attendance` | **+05:45**. A punch before 05:45 local must **not** file against yesterday |
| ☐ | Offboarding picker while acting | `/admin/offboarding` | Only the acting tenant's staff; **excludes Sam** |

---

## 6. Cross-cutting behaviours worth a deliberate look

| ☐ | Behaviour | How to verify |
|:-:|---|---|
| ☐ | **Tenant isolation** | Alice sees 9, Gina sees 5, neither sees the other's. Every list query filters `tenant_id` itself — RLS is the boundary, not the scope |
| ☐ | **Timezone correctness** | Act as Globex (Asia/Kathmandu, **+05:45**). Attendance week grid columns must query **their own** day, not the day before. `work_timezone` is stored per attendance row, so fixing tenant tz never retro-moves history |
| ☐ | **Clock-in honesty** | Client captures the instant the button is pressed; server trusts it within **±5 min**, else substitutes server time and records `clock_in_skew_seconds`. `clock_in_recorded_at` keeps the server receipt separately |
| ☐ | **Geofence grading** | `evaluateGeofence` returns 4 states, not a boolean. Deliberately generous at the boundary — a false refusal stops someone working; a false acceptance is recorded and reviewable |
| ☐ | **Refusals leave a trace** | A refused punch writes `geofence_audit_log` + `geofence_reconciliation` via **service-role**, so the subject can't suppress it — inside `try/catch`, so a missing service key never blocks clocking in |
| ☐ | **WFH state machine** | Enforced in Postgres (`tg_wfh_lifecycle`). Try to approve your own → refused. Try to revoke after a remote punch was taken under it → **refused** (that punch was made in good faith and feeds pay) |
| ☐ | **Chrome on every page** | All 20 previously-orphaned routes now render inside `AppShell`. `admin.tsx` is a bare `<Outlet/>` **on purpose** — each `/admin/*` page brings its own shell |
| ☐ | **AppShell nesting** | Nested instances render only a `PageHeader`. Wrapping any page is always safe — don't "fix" this |
| ☐ | **Loading bar** | `RouteLoadingBar` on every navigation |
| ☐ | **Global search** | ⌘K — *note: a second, hand-maintained nav registry (~30 entries) independent of the sidebar. W4 target* |
| ☐ | **Suspension re-checked per request** | `requireActiveUser` fronts ~92 server fns and re-checks on **every** request, using the caller's own client — never service-role |
| ☐ | **Public hooks don't leak** | `/api/public/hooks/*` return a generic message + correlation ref, never `e.message` |
| ☐ | **Audit retention actually runs** | Was silently broken for the project's whole life (`tg_block_modify_audit` read a legacy GUC PostgREST no longer sets). Fixed in `20260821093000` |

---

## 7. Known gaps and inconsistencies — verified 2026-09-03

**Everything §7 previously listed under "nav/route gate mismatches" is closed.** That table named
9 route groups; the real count turned out to be 29 routes across three distinct failure shapes,
all fixed in Wave 5. What follows is what is actually left.

### 7.1 Gate drift — closed, and how to keep it closed

A page's permission could be written in four places that were free to disagree. Three of the four
axes are now impossible by construction; the fourth is 7.3 below.

| Axis | Was | Now |
| --- | --- | --- |
| nav row vs route gate | 36 dead links | one `feature` key each |
| nav row vs inline page check | 11 more, incl. `/org/white-label` locking out `org_admin` | converged |
| nav row vs no gate at all | 23 destinations open to any signed-in user | gated |
| nav row vs RLS policy | — | **still open — see 7.3** |

Do not re-derive this by hand. `bun run test tests/nav-route-gate-parity.test.ts` resolves the
effective gate in all four forms and fails with a role × URL list. `tests/nav-render-filter.test.ts`
covers the case where the sidebar filters correctly and *renders* the unfiltered list — which
happened, and which no data-level test could see.

### 7.2 Acting-tenant coverage: 13 of 97 modules — **the biggest gap left**

`TenantSwitcher` and `platform_acting_tenant` exist and work. Only modules that call
`requireTenantId()` / `getTenantId()` from `src/lib/tenant-scope.ts` honour them; the other 84 read
`profiles.tenant_id` directly, which is `NULL` for a platform account.

**What you will see:** as `sam.platform` acting as Acme, `/org/payroll` works and `/org/analytics`
says "No tenant". Same switcher, same account, two different answers, page by page. Worth checking
during §5 — it is the most likely thing to look like a broken page when it is not.

### 7.3 X-07 — closed in Wave 6 (2026-09-06)

`hr` now holds manage policies on `training_quiz_questions` and `certifications`, alongside the
ones it already had on `training_courses` and `training_enrollments`. `branch_admin` stays
**read-only** — every branch_admin policy in this domain is a `FOR SELECT` — and the client offers
them a roster with no write controls and a "View only" marker, behind a second feature key,
`org.trainingManage`. Every writing server fn in the domain now calls `assertTrainingAuthor` so the
refusal is a sentence rather than a Postgres policy error.

**To confirm:** as `hana.acme` (hr), open `/admin/training`, open any course's builder, add a
lesson and a quiz question — all three succeed. As `bruce.acme` (branch_admin), `/org/training`
shows the roster with "View only" and no Assign button, Manage catalog link, status control or
Remove.

**Two larger defects were found underneath it**, both of which had been rendering as emptiness
rather than as errors — see `docs/plan-waves.md` § Wave 6:

- The quiz view had been flipped to `security_invoker = on` by a linter-driven migration, so **no
  learner could read a single quiz question** and therefore no employee could complete any course.
  The screen said "No quiz questions have been set for this course yet."
- Seven tables embedded `employees(...)` through a foreign key that had never existed. That left
  `/org/training`'s two tabs, `/me/training`'s two tabs, and the **leave** half of both requests
  inboxes permanently empty.

### 7.4 Three unconnected review systems

`performance_reviews` (whole-tenant fan-out on cycle activate), `review_instances`
(schedule-generated scorecards) and `duty_review_scores` (duty-based KPI) share `review_templates`
and never reconcile. There is no assignment table.

Both previously-orphaned functions now have callers and targeting works — `generateReviewInstances`
is passed `employeeIds`, and `reviewReviewInstance` is wired to `/admin/review-analytics` — so this
is a **modelling** gap rather than a dead feature. It will not block the checklist.

### 7.5 Attendance remainder

`clockOut` records position but does not validate it; WFH decisions notify in-app only; the 24h
reconciliation cron does not know the newer WFH mismatch types; there is no tenant-level "remote
work allowed" switch. The punch-time, geofence-grading and WFH-exception work is done — see
CLAUDE.md.

### 7.6 Learning — built in Wave 6

Courses can now carry lessons. Four content types (`rich_text`, `video`, `document`,
`external_link`), ordered, with per-learner progress, hosted in a private `training-content` bucket
read back through short-lived signed URLs.

- **Author** at `/admin/training/$courseId` — Lessons, Quiz, Settings.
- **Learn** at `/me/training/$enrollmentId` — lesson list, content pane, mark-complete, resume
  where you left off, and the quiz locked until the required lessons are done.
- **Track** on `/org/training` — a per-learner lessons column on the roster.

`content_mode` defaults to `'external'`, so every course that existed before the wave behaves
exactly as it did; a course only gains the player once someone switches it in Settings.

**Still absent, deliberately:** SCORM (a JavaScript runtime and a content-security decision, not a
content type — `docs/onboarding-guided-routes.md` §10) and the cross-tenant course library (parked
with D-8). Do not file either as a defect.

### 7.6b Guided setup and policies — built in Wave 7

`/org/setup-guide` walks an org admin through seven configuration segments, and
**every item is checked against the tenant's real data** rather than a stored
tick. A segment therefore reopens if its rows are deleted, and the page says so.
Required segments (company, payroll, policies) gate "Finalize & activate";
optional ones can be deferred, and a required one cannot.

- **Segment 1 is editable inside the guide** — there is no company-profile page,
  and sending an established admin into the create-an-org wizard to change an
  address is the thing this flow exists to remove.
- `/admin/policies` is the policy document library; `/me/policies` is where an
  employee reads and signs. An acknowledgement records the **version** read, so
  a materially revised policy asks everyone again.
- Phase 3 provisioning runs from `/org/onboarding/tracker` — mandatory training
  (7 days) and policy sign-offs (3 days), dated in the tenant's zone.

**To confirm:** as `alice.acme`, open `/org/setup-guide`, fill in the company
form and watch the percentage move; publish a policy on `/admin/policies` and
watch Segment 7 go green. As `evan.acme`, `/me/policies` shows it, and signing
records your name and the version.

**Deliberately not automated:** asset allocation (issuing a laptop is a physical
act; a false row in the register is worse than a gap) and KPI assignment, which
is blocked on the three unreconciled review systems and says so on screen rather
than silently doing nothing.

### 7.7 Performance — measured, recorded, not urgent

36 loop-with-query sites remain (`payroll.functions.ts` has 8, the hottest path). 194 `useQuery`
sites, of which only 19 declare `staleTime`, so most refetch on every mount. Neither bites at demo
scale. The sharpest one — a per-payslip fund lookup in `generateSuperContributionsForRun`, 500
sequential round trips on a 500-employee run — is fixed.

### 7.8 Not seeded

No payroll run, payslip, leave request, timesheet or attendance history exists until you create it.
Several §5 rows therefore start from an empty state by design, not by fault. AU compliance pages in
particular will show empty-with-an-explanation until an AU run is approved.

### 7.9 Test baseline — do not mistake these for regressions

A green run reads **4 failed / 913 passed / 5 skipped**. The 4 are pre-existing failures in
`tests/onboarding-readiness.test.ts`. `tests/rbac.test.ts` and `tests/audit-overtime.test.ts`
cannot collect without live service-role credentials. Any *other* failure is real.

### 7.10 Security posture

Audited 2026-09-03. Two findings, both fixed: an unauthenticated server fn that leaked a count of
open critical security findings, and the absence of any rate limit on the five public endpoints
(`check_rate_limit` waves anonymous callers through by construction). Verified clean in the same
pass: RLS on all 207 tables, no unscoped `employees` read, no secret behind a `VITE_` prefix, all
20 public hooks using `hookFailure()`. `tests/public-endpoint-security.test.ts` holds it.

## 8. Suggested verification order

Roughly 45 minutes end-to-end. Each step builds on the last.

1. **`evan.acme`** (employee) — walk all of §5.2. Establishes the floor: nothing org-wide anywhere.
2. **`mia.acme`** (manager) — §5.3. Watch specifically for *raise-but-not-decide* on her own request.
3. **`hana.acme`** (hr) — §5.4. Expect the §7.1 dead links; note which.
4. **`fred.acme`** (finance) — §5.5. Confirm no HR records; check the AU STP2 audit page.
5. **`bruce.acme`** (branch_admin) — §5.6. Five absences, then the presences.
6. **`alice.acme`** (org_admin) — §5.7. Full org surface. Count: **9 employees, 0 Globex**.
7. **`gina.globex`** (org_admin, NP) — isolation from the other side: **5 employees, 0 Acme**.
8. **`rita.platform`** (regional_admin) — §5.8. Switcher shows **Acme only** — the AU fence.
9. **`sam.platform`** (super_admin) — §5.9. Switcher shows **both**. Act as Globex and check
   **+05:45** on attendance.

**Highest-value single check:** step 7 → step 9. Tenant isolation and the sub-hour timezone are the
two things that have actually broken in production, and they are invisible from a single-tenant view.
