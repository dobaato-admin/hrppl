# RBAC — Role × Feature Matrix (Proposed)

> **Status:** Draft for review. Nothing in this document is implemented yet.
> Once you approve, I'll migrate the `app_role` enum, rewrite RLS policies, and align frontend guards in a single pass.

---

## 1. Role definitions

| Role | Scope | Purpose |
|---|---|---|
| `super_admin` | Platform-wide (Lovable side) | Operates hrppl itself — tenants, billing, security, platform settings. **Not** an org user. |
| `regional_admin` | Country-scoped, cross-tenant | hrppl operator who supports tenants in specific countries (payroll templates, tax brackets, holidays). |
| `org_admin` | Single tenant, all branches | Owner/admin of a customer organisation. **Full access to everything inside their org** (see §3). |
| `branch_admin` | Single branch within one tenant | Day-to-day admin of one branch (e.g. country office). Can manage employees, leave, timesheets, payroll for that branch only. |
| `hr` | Single tenant (optionally branch-scoped) | HR staff — employee records, onboarding, offboarding, leave, documents, discipline. Cannot see finance unless also granted `finance`. |
| `finance` | Single tenant (optionally branch-scoped) | Payroll runs, payslips, expenses, invoices, pay rates. Cannot edit HR records. |
| `manager` | Their direct reports / team | Approves leave, timesheets, expenses, reviews for their team. Reads team data only. |
| `employee` | Themselves | Self-service only — `me/*` routes. |

Roles are **additive** — a user can hold multiple (e.g. `hr` + `finance`). `branch_admin`, `hr`, `finance`, `manager` are scoped via `role_scope` (branch_id and/or country_code).

---

## 2. Guiding principles

1. **`org_admin` is unrestricted inside their tenant.** Only blocked from cross-tenant / platform features and from a small set of **destructive actions** (see §4).
2. **`super_admin` ≠ `org_admin`.** Super admins never appear in normal org UI unless they explicitly impersonate.
3. **No role check inside a role-gated layout.** Once a layout has admitted the user, child pages render unconditionally — no "Forbidden" fall-through (this was the bug pattern we kept hitting).
4. **RLS is the source of truth.** Frontend guards exist for UX only; every table policy must enforce the matrix server-side.
5. **Branch scope cascades.** `branch_admin`/`hr`/`finance`/`manager` see only rows whose `branch_id` is in their `role_scope`. `org_admin` sees all branches.

---

## 3. Feature matrix

Legend: **F** = full CRUD · **R** = read only · **A** = approve/act on own scope · **S** = self only · **—** = no access

### 3.1 Platform (super_admin surface)

| Feature | super_admin | regional_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|---|
| `/admin` console | F | R (country) | — | — | — | — | — | — |
| Tenants list & billing | F | — | — | — | — | — | — | — |
| Platform security scans | F | — | — | — | — | — | — | — |
| Blog / careers (marketing) | F | — | — | — | — | — | — | — |
| Payslip templates (country) | F | F (country) | — | — | — | — | — | — |
| Tax brackets / contribution rules | F | F (country) | R | R | R | R | — | — |
| Public holidays / categories | F | F (country) | R | R | R | — | R | R |
| Overtime penalty rates | F | F (country) | R | R | — | R | — | — |
| Feedback / review templates (global) | F | F | F (override per org) | — | — | — | — | — |
| API docs / developers | F | R | R | — | — | — | — | — |

### 3.2 Organization setup & governance

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/org` dashboard | F | F | R (own branch) | R | R | R | — |
| `/org/setup` (org bootstrap) | F | F | — | — | — | — | — |
| `/org/branches` (create/edit branches) | F | F | R (own) | R | — | — | — |
| `/org/white-label` (logo, colors) | F | F | — | — | — | — | — |
| `/org/invitations` (staff invites) | F | F | F (own branch) | F (own scope) | — | — | — |
| Org settings (`/settings/organization`) | F | F | — | — | — | — | — |
| Org billing (`/settings/billing`) | F | F | — | — | — | — | — |
| Tenant governance (audit log, data export) | F | F | R (own branch) | R | R | — | — |
| Delete organization | F | **see §4** | — | — | — | — | — |
| Transfer ownership | F | **see §4** | — | — | — | — | — |

### 3.3 People

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/org/employees` (list) | F | F | F (own branch) | F (own scope) | R | R (team) | — |
| Employee profile (PII, banking, tax) | F | F | F (own branch) | F | R (pay only) | R (team, no banking) | S |
| `/admin/departments` | F | F | F (own branch) | F | — | — | — |
| `/admin/designations` | F | F | F (own branch) | F | — | — | — |
| `/admin/teams` & `/admin/team-assignments` | F | F | F (own branch) | F | — | R (team) | — |
| Promotions (`/org/promotions`) | F | F | F (own branch) | F | R | R (team) | S (read own) |
| Pay rate changes (`/org/pay-rates`) | F | F | F (own branch) | R | F | — | S (read own) |
| Bulk-delete employees | F | **see §4** | — | — | — | — | — |

### 3.4 Onboarding / offboarding

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/org/onboarding` (checklists) | F | F | F (own branch) | F | — | R (team) | S |
| `/admin/offboarding` (cases) | F | F | F (own branch) | F | R | R (team) | S |
| Onboarding default assignments | F | F | F (own branch) | F | — | — | — |
| ID document requests | F | F | F (own branch) | F | — | R (team) | S |

### 3.5 Time, leave, attendance

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/leave` (own) | F | F | F | F | F | F | S |
| `/org/leave` (approve all) | F | F | A (own branch) | A | — | A (team) | — |
| `/admin/leave-types` | F | F | F (own branch) | F | — | — | — |
| `/attendance` (own punches) | F | F | F | F | F | F | S |
| `/org/timesheets` | F | F | A (own branch) | A | R | A (team) | S |
| `/admin/biometric` & `/admin/geofences` | F | F | F (own branch) | F | — | — | — |

### 3.6 Payroll & finance

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/org/payroll` (runs) | F | F | F (own branch) | R | F | — | — |
| `/admin/payroll-settings` / `payroll-setup` | F | F | F (own branch) | R | F | — | — |
| `/admin/payslip-templates` (org overrides) | F | F | — | — | F | — | — |
| `/admin/overtime-rates` (org) | F | F | F (own branch) | R | F | — | — |
| Approve payroll run | F | F | — | — | A | — | — |
| `/my-payslips` | F | F | F | F | F | F | S |
| `/org/expenses` (approve) | F | F | A (own branch) | R | A | A (team) | — |
| `/me/expenses` (submit) | F | F | F | F | F | F | S |
| Invoices / clients / projects / jobs | F | F | F (own branch) | — | F | — | — |

### 3.7 Performance & growth

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/org/performance` (cycles, calibration) | F | F | F (own branch) | F | — | A (team) | S |
| `/admin/review-templates` | F | F | F (own branch) | F | — | — | — |
| `/admin/feedback-templates` | F | F | F (own branch) | F | — | — | — |
| 360 feedback requests | F | F | F (own branch) | F | — | F (team) | S |
| `/org/training` & `/admin/training` | F | F | F (own branch) | F | — | R (team) | S |

### 3.8 Compliance, discipline, documents

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/admin/discipline` (cases) | F | F | F (own branch) | F | — | R (team, non-confidential) | S (own non-confidential) |
| `/admin/medical` (incidents) | F | F | F (own branch) | F | — | — | S (own non-confidential) |
| `/org/documents` (envelopes, templates) | F | F | F (own branch) | F | R | R (team) | S |
| `/me/grievances` | F | F | F (own branch) | F | — | — | S |
| `/admin/requests` (support tickets) | F | F | F (own branch) | F | — | A (team) | S |
| `/admin/security` (org audit log) | F | F | R (own branch) | R | R | — | — |
| `/admin/api-docs` & `/admin/blog-integrations` | F | F | — | — | — | — | — |

### 3.9 Assets

| Feature | super_admin | org_admin | branch_admin | hr | finance | manager | employee |
|---|---|---|---|---|---|---|---|
| `/admin/assets` (catalog, assignments) | F | F | F (own branch) | F | R | R (team) | — |
| `/me/assets` (acknowledge, return) | F | F | F | F | F | F | S |

### 3.10 Self-service (`/me/*`)

All authenticated users get **S** on every `/me/*` route. `org_admin` and above can also view any employee's data via the org routes.

---

## 4. Destructive actions (org_admin protections)

`org_admin` has unrestricted access **except** for these actions, which require an extra confirmation step (typed org name) and are audit-logged. `super_admin` can perform them directly.

1. **Delete organization** — irreversibly removes tenant + all data.
2. **Transfer organization ownership** — assigns `org_admin` to another user and demotes the current one.
3. **Bulk-delete employees** (>5 at once) — soft-deletes still allowed individually.
4. **Bulk-purge payroll runs** — single run delete still allowed for `draft` runs.
5. **Disable RLS / change `country_code` on tenant** — locked entirely; super_admin only.
6. **Rotate API keys / webhook secrets** — allowed but requires re-auth (password) in the same session.

---

## 5. Implementation plan (after you approve)

1. **Migration** — extend `app_role` enum: add `branch_admin`, `hr`, `finance`. Keep existing roles. Add `branch_id` to `role_scope`.
2. **Helpers** — add `has_org_admin(_user)`, `has_branch_scope(_user, _branch_id)`, `is_org_member(_user, _tenant_id)` security-definer functions.
3. **RLS sweep** — rewrite policies on every `public.*` table per the matrix. One migration per domain (people, payroll, leave, performance, docs, compliance, assets).
4. **Frontend guards** — single source: `useAuth()` exposes `can(feature)` derived from roles + scope. Replace every ad-hoc `has_role` check in components with `can('feature.action')`.
5. **Route gates** — `_authenticated/_org` layout admits org_admin / branch_admin / hr / finance / manager; `_authenticated/_super` admits super_admin only. Remove "Forbidden" fall-throughs.
6. **Destructive-action modals** — add typed-confirmation UI for the actions in §4.
7. **Backfill** — existing `regional_admin` users keep their role; existing `org_admin` users get the expanded permissions automatically.
8. **Tests** — extend `tests/admin-routes-block.test.ts` and `e2e/` specs to cover each role × representative route.

---

## 6. Open questions for you

1. **Branch-scoping HR/finance/manager:** Should HR & finance default to all branches in their org (like `org_admin`), or default to scoped and require explicit branch assignment? *(My recommendation: default scoped — safer, matches multi-country orgs.)*
2. **Can `branch_admin` invite staff?** Yes for their own branch only — confirm?
3. **Can `manager` see compensation for their reports?** Currently no (pay rate hidden). Keep hidden, or show?
4. **Should `org_admin` see other tenants' data if they're a Lovable employee?** No — only `super_admin` does. Confirm.
5. **Confidential medical/discipline records:** Currently visible to HR + org_admin. Should org_admin be excluded from `confidential = true` rows? *(Default: org_admin sees everything in their org; opt-in flag if you want stricter.)*

---

**Once you reply with answers/approval (even just "looks good"), I'll execute the implementation plan in §5.**
