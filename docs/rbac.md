# RBAC — Role × Feature Matrix

> **Status: implemented.** The `app_role` enum, the RLS policies and the frontend guards all
> exist. §3 below is **generated from `src/lib/rbac.ts`** by
> `node scripts/gen-rbac-matrix.mjs` and is pinned by `tests/rbac-doc-sync.test.ts`, so it cannot
> drift from the code again. §1, §2 and §4 are hand-written and still current.
>
> **§5 and §6 are historical** — the implementation plan was carried out and the open questions
> were answered. They are kept as a record of why the roles are shaped the way they are.
>
> `can(feature, roles)` is a **UI** control. RLS plus server-fn role checks are the enforcement.
> Where a key deliberately mirrors one specific RLS policy, the comment beside it in `rbac.ts`
> names that policy — widening the key without widening the policy in the same change moves the
> failure from "link hidden" to "new row violates row-level security policy".

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

<!-- BEGIN GENERATED MATRIX -->

> **Generated** by `node scripts/gen-rbac-matrix.mjs` from `src/lib/rbac.ts`.
> Do not edit between the markers — regenerate instead. 88 feature keys across 8 groups.

`can(feature, roles)` controls **UI only**. RLS policies plus server-fn role checks are the actual enforcement; where a key mirrors a specific policy, the comment beside it in `rbac.ts` names that policy.

Legend: **●** = admitted · blank = no access

### platform

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `platform.admin` | ● |  |  |  |  |  |  |  |
| `platform.apiDocs` | ● | ● | ● |  |  |  |  |  |
| `platform.billingDirectDebit` | ● |  |  |  |  |  |  |  |
| `platform.billingOps` | ● |  |  |  |  |  |  |  |
| `platform.blog` | ● |  |  |  |  |  |  |  |
| `platform.blogIntegrations` | ● |  |  |  |  |  |  |  |
| `platform.fx` | ● |  |  |  |  |  |  |  |
| `platform.leads` | ● |  |  |  |  |  |  |  |
| `platform.tenants` | ● |  |  |  |  |  |  |  |

### regional

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `regional.console` | ● | ● |  |  |  |  |  |  |

### org

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `org.analytics` | ● |  | ● | ● | ● | ● |  |  |
| `org.approvalActivity` | ● |  | ● | ● | ● |  | ● |  |
| `org.approvals` | ● |  | ● | ● | ● | ● | ● |  |
| `org.assets` | ● |  | ● | ● | ● | ● |  |  |
| `org.auAwards` | ● |  | ● |  |  |  |  |  |
| `org.auditHistory` | ● |  | ● |  |  |  |  |  |
| `org.auStpAudit` | ● |  | ● |  |  | ● |  |  |
| `org.auStpEvents` | ● |  | ● |  |  |  |  |  |
| `org.auSuperBatches` | ● |  | ● |  |  | ● |  |  |
| `org.auSuperFunds` | ● |  | ● |  | ● | ● |  |  |
| `org.auUnderpayment` | ● |  | ● |  | ● |  |  |  |
| `org.biometric` | ● |  | ● | ● | ● |  |  |  |
| `org.branches` | ● |  | ● |  |  |  |  |  |
| `org.console` | ● |  | ● | ● | ● | ● | ● |  |
| `org.danger` | ● |  | ● |  |  |  |  |  |
| `org.departments` | ● |  | ● |  | ● |  |  |  |
| `org.designations` | ● |  | ● |  | ● |  |  |  |
| `org.discipline` | ● |  | ● |  | ● |  |  |  |
| `org.documents` | ● |  | ● | ● | ● | ● | ● |  |
| `org.documentTemplates` | ● |  | ● | ● | ● | ● | ● |  |
| `org.dutyReviews` | ● |  | ● |  | ● |  | ● |  |
| `org.employeeDuties` | ● |  | ● |  | ● |  | ● |  |
| `org.employeeHolidays` | ● |  | ● |  |  |  | ● |  |
| `org.employees` | ● |  | ● | ● | ● | ● | ● |  |
| `org.employmentVariations` | ● |  | ● |  | ● |  |  |  |
| `org.expenses` | ● |  | ● | ● |  | ● | ● |  |
| `org.expenseSettings` | ● |  | ● |  |  | ● |  |  |
| `org.feedbackTemplates` | ● |  | ● |  | ● |  |  |  |
| `org.geofences` | ● |  | ● | ● | ● |  |  |  |
| `org.holidayCalendars` | ● |  | ● |  | ● |  |  |  |
| `org.idRequests` | ● |  | ● | ● | ● |  |  |  |
| `org.invitations` | ● |  | ● | ● | ● |  |  |  |
| `org.kpiLibrary` | ● |  | ● |  | ● |  |  |  |
| `org.leaveManagement` | ● |  | ● | ● | ● |  |  |  |
| `org.leaveTypes` | ● |  | ● |  | ● |  |  |  |
| `org.medical` | ● |  | ● |  | ● |  |  |  |
| `org.offboarding` | ● |  | ● |  | ● |  | ● |  |
| `org.onboardingAdmin` | ● |  | ● | ● | ● |  |  |  |
| `org.onboardingPacks` | ● |  | ● |  |  |  |  |  |
| `org.overtimeRates` | ● | ● | ● |  |  | ● |  |  |
| `org.payRates` | ● |  | ● | ● |  | ● | ● |  |
| `org.payroll` | ● |  | ● | ● |  | ● |  |  |
| `org.payrollSettings` | ● |  | ● |  |  | ● |  |  |
| `org.payrollSetup` | ● |  | ● |  |  | ● |  |  |
| `org.payslipTemplates` | ● |  | ● |  |  | ● |  |  |
| `org.performance` | ● |  | ● | ● | ● |  | ● |  |
| `org.policies` | ● |  | ● |  | ● |  |  |  |
| `org.promotions` | ● |  | ● | ● | ● | ● | ● |  |
| `org.publicHolidays` | ● | ● | ● | ● | ● |  | ● | ● |
| `org.recruitment` | ● |  | ● | ● | ● |  |  |  |
| `org.reports` | ● |  | ● | ● | ● | ● |  |  |
| `org.requests` | ● |  | ● | ● | ● |  | ● |  |
| `org.reviewAnalytics` | ● |  | ● |  | ● |  | ● |  |
| `org.reviewCycles` | ● |  | ● |  | ● |  | ● |  |
| `org.reviewTemplates` | ● |  | ● |  | ● |  |  |  |
| `org.roles` | ● |  | ● |  |  |  |  |  |
| `org.security` | ● |  | ● |  |  |  |  |  |
| `org.setup` | ● |  | ● |  |  |  |  |  |
| `org.setupGuide` | ● |  | ● |  |  |  |  |  |
| `org.teamAssignments` | ● |  | ● |  | ● |  |  |  |
| `org.teams` | ● |  | ● | ● | ● |  | ● |  |
| `org.templatesHub` | ● |  | ● |  | ● |  |  |  |
| `org.ticketInternalNotes` | ● | ● | ● |  |  |  | ● |  |
| `org.timesheetReview` | ● |  | ● | ● |  | ● | ● |  |
| `org.toilAdmin` | ● |  | ● | ● | ● |  |  |  |
| `org.training` | ● |  | ● | ● | ● |  | ● |  |
| `org.trainingCatalog` | ● |  | ● |  | ● |  | ● |  |
| `org.trainingManage` | ● |  | ● |  | ● |  | ● |  |
| `org.wfhApprovals` | ● |  | ● |  | ● |  | ● |  |
| `org.whiteLabel` | ● |  | ● |  |  |  |  |  |

### manager

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `manager.compensation` | ● |  | ● | ● |  | ● | ● |  |
| `manager.requestsInbox` | ● |  | ● | ● | ● |  | ● |  |
| `manager.team` | ● |  | ● | ● | ● |  | ● |  |

### settings

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `settings.billing` | ● |  | ● |  |  |  |  |  |
| `settings.organization` | ● |  | ● |  |  |  |  |  |

### practice

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `practice.console` | ● |  | ● |  |  | ● |  |  |

### compliance

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `compliance.confidential` | ● |  | ● |  | ● |  |  |  |

### account

| Feature key | `super_admin` | `regional_admin` | `org_admin` | `branch_admin` | `hr` | `finance` | `manager` | `employee` |
|---|---|---|---|---|---|---|---|---|
| `account.suspend` | ● |  | ● |  |  |  |  |  |

### Surface size per role

| Role | Feature keys admitted |
|---|---|
| `super_admin` | 88 of 88 |
| `regional_admin` | 5 of 88 |
| `org_admin` | 79 of 88 |
| `branch_admin` | 30 of 88 |
| `hr` | 49 of 88 |
| `finance` | 23 of 88 |
| `manager` | 28 of 88 |
| `employee` | 1 of 88 |

<!-- END GENERATED MATRIX -->

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
