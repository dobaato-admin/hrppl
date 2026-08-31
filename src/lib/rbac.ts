/**
 * RBAC helper — single source of truth for frontend role/feature checks.
 *
 * Server-side enforcement lives in RLS policies and server fn role checks;
 * this helper exists for UX (hide nav items, disable buttons). It MUST stay
 * in sync with docs/rbac.md.
 */

export type AppRole =
  | "super_admin"
  | "regional_admin"
  | "org_admin"
  | "branch_admin"
  | "hr"
  | "finance"
  | "manager"
  | "employee";

export type Feature =
  // Platform / super-admin
  | "platform.admin"
  | "platform.tenants"
  | "platform.fx"
  | "platform.leads"
  | "platform.blog"
  | "platform.blogIntegrations"
  | "platform.apiDocs"
  | "platform.billingDirectDebit"
  | "platform.billingOps"
  // Regional
  | "regional.console"
  // Organization (org_admin + branch_admin + hr + finance, depending)
  | "org.console"
  | "org.setup"
  | "org.branches"
  | "org.whiteLabel"
  | "org.invitations"
  | "org.roles"
  | "org.employees"
  | "org.departments"
  | "org.designations"
  | "org.teams"
  | "org.teamAssignments"
  | "org.recruitment"
  | "org.promotions"
  | "org.payRates"
  | "org.leaveTypes"
  | "org.holidayCalendars"
  | "org.publicHolidays"
  | "org.employeeHolidays"
  | "org.overtimeRates"
  | "org.payrollSetup"
  | "org.payrollSettings"
  | "org.payslipTemplates"
  | "org.payroll"
  | "org.expenses"
  | "org.expenseSettings"
  | "org.documents"
  | "org.documentTemplates"
  | "org.onboardingPacks"
  | "org.employmentVariations"
  | "org.training"
  | "org.trainingCatalog"
  | "org.feedbackTemplates"
  | "org.reviewTemplates"
  | "org.performance"
  | "org.discipline"
  | "org.medical"
  | "org.assets"
  | "org.offboarding"
  | "org.biometric"
  | "org.geofences"
  | "org.wfhApprovals"
  | "org.requests"
  | "org.idRequests"
  | "org.analytics"
  | "org.reports"
  | "org.security"
  // Manager
  | "manager.team"
  | "manager.requestsInbox"
  | "manager.compensation"
  // Compliance — confidential rows
  | "compliance.confidential"
  // Settings
  | "settings.organization"
  | "settings.billing"
  // Practice (legal/practice management — finance + org_admin)
  | "practice.console"
  // Danger zone (org-level destructive actions)
  | "org.danger"
  // Account suspension (§1 #4) — who may block or restore a user's access
  | "account.suspend";

const SET = (...r: AppRole[]) => new Set<AppRole>(r);

/**
 * Matrix — which roles can SEE/use each feature in the nav/UI.
 * Server fns + RLS still gate the data; this only controls visibility.
 *
 * Note: scope filtering (branch_admin's branch, manager's team) cannot be
 * expressed here — those are row-level. UI shows the link if the role can
 * use the feature at all; the page itself shows only the scoped rows.
 */
const MATRIX: Record<Feature, Set<AppRole>> = {
  // Platform
  "platform.admin": SET("super_admin"),
  "platform.tenants": SET("super_admin"),
  "platform.fx": SET("super_admin"),
  "platform.leads": SET("super_admin"),
  "platform.blog": SET("super_admin"),
  "platform.blogIntegrations": SET("super_admin"),
  "platform.apiDocs": SET("super_admin", "regional_admin", "org_admin"),
  // W4 IA: both platform-internal (not the org's own subscription page, which
  // is settings.billing) — had no route-level gate at all before this wave.
  "platform.billingDirectDebit": SET("super_admin"),
  "platform.billingOps": SET("super_admin"),

  // Regional
  "regional.console": SET("super_admin", "regional_admin"),

  // Org-level — all org roles see the console, deeper features filter below
  "org.console": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  "org.setup": SET("super_admin", "org_admin"),
  "org.branches": SET("super_admin", "org_admin"),
  "org.whiteLabel": SET("super_admin", "org_admin"),
  "org.invitations": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.roles": SET("super_admin", "org_admin"),

  "org.employees": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  "org.departments": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.designations": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.teams": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "org.teamAssignments": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.recruitment": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.promotions": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  "org.payRates": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),

  "org.leaveTypes": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.holidayCalendars": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.publicHolidays": SET("super_admin", "regional_admin", "org_admin", "branch_admin", "hr", "manager", "employee"),
  // Matches ORG_ADMIN_OR_MANAGER, the AdminGate allow-set on
  // /admin/employee-holidays itself — this nav item was gated by
  // org.reviewTemplates (super_admin/org_admin/branch_admin/hr), a leftover
  // from being copy-pasted into the Performance section. That let branch_admin
  // and hr see a link the route then rejected, and hid it from manager, who
  // the route does allow.
  "org.employeeHolidays": SET("super_admin", "org_admin", "manager"),
  "org.overtimeRates": SET("super_admin", "regional_admin", "org_admin", "branch_admin", "finance"),

  "org.payrollSetup": SET("super_admin", "org_admin", "branch_admin", "finance"),
  "org.payrollSettings": SET("super_admin", "org_admin", "branch_admin", "finance"),
  "org.payslipTemplates": SET("super_admin", "org_admin", "finance"),
  "org.payroll": SET("super_admin", "org_admin", "branch_admin", "finance"),

  "org.expenses": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),
  // Narrower than org.expenses on purpose: this defines what counts as a
  // valid category, not who can approve a claim. Mirrors org.payslipTemplates
  // — "define a tenant-wide config" — rather than reusing org.expenses, which
  // also admits branch_admin/manager (approvers, not policy owners).
  "org.expenseSettings": SET("super_admin", "org_admin", "finance"),
  "org.documents": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  // Matches org.documents — same domain, same admins. Had no route-level
  // gate at all before this wave.
  "org.documentTemplates": SET(
    "super_admin",
    "org_admin",
    "branch_admin",
    "hr",
    "finance",
    "manager",
  ),
  // Matches admin.onboarding-packs.tsx's own AdminGate allow={ORG_ADMIN_ONLY}.
  "org.onboardingPacks": SET("super_admin", "org_admin"),
  // Matches hr.variations.tsx's own inline role check.
  "org.employmentVariations": SET("super_admin", "org_admin", "hr"),
  "org.training": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "org.trainingCatalog": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.feedbackTemplates": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.reviewTemplates": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.performance": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),

  "org.discipline": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.medical": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.assets": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  "org.offboarding": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.biometric": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.geofences": SET("super_admin", "org_admin", "branch_admin", "hr"),
  // Must stay equal to WFH_APPROVER_ROLES and to the RLS policy on
  // wfh_requests. A nav entry wider than the policy just moves the failure
  // from "not shown" to "Postgres rejected your update".
  "org.wfhApprovals": SET("super_admin", "org_admin", "manager", "hr"),
  "org.requests": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "org.idRequests": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.analytics": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  "org.reports": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  "org.security": SET("super_admin", "org_admin"),

  // Manager
  "manager.team": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "manager.requestsInbox": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "manager.compensation": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),

  // Confidential medical/discipline rows — per your rule
  "compliance.confidential": SET("super_admin", "org_admin", "hr"),

  // Settings
  "settings.organization": SET("super_admin", "org_admin"),
  "settings.billing": SET("super_admin", "org_admin"),

  // Practice (finance + org_admin own this surface)
  "practice.console": SET("super_admin", "org_admin", "finance"),

  // Danger zone — destructive org actions
  "org.danger": SET("super_admin", "org_admin"),

  // Account suspension — deliberately narrow. Scope is enforced server-side in
  // account-suspension.functions.ts: org_admin may only act within their own
  // tenant and never on a platform administrator.
  "account.suspend": SET("super_admin", "org_admin"),
};

/** Returns true if any of the given roles can use `feature`. */
export function can(feature: Feature, roles: readonly AppRole[] | undefined | null): boolean {
  if (!roles || roles.length === 0) return false;
  const allowed = MATRIX[feature];
  for (const r of roles) if (allowed.has(r)) return true;
  return false;
}

/** Convenience: true if user holds any org-level role (incl. super_admin). */
export function isOrgMember(roles: readonly AppRole[] | undefined | null): boolean {
  if (!roles) return false;
  return roles.some((r) =>
    r === "super_admin" ||
    r === "org_admin" ||
    r === "branch_admin" ||
    r === "hr" ||
    r === "finance" ||
    r === "manager",
  );
}

/** Roles that get unrestricted access to an org route layout (gate at layout, not children). */
export const ORG_LAYOUT_ROLES: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
);

/** Roles that can access /admin/* admin pages (admins of any kind). */
export const ADMIN_LAYOUT_ROLES: ReadonlySet<AppRole> = SET(
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
);

/**
 * Named allow-sets for `<AdminGate allow={…}>` (§1 #10).
 *
 * Individual admin pages previously hand-rolled their own role checks, each
 * returning a bare "Forbidden." Those sets were NOT uniform, so they cannot be
 * collapsed onto AdminGate's permissive default without widening access. These
 * constants capture the distinct sets that actually existed, so every page
 * declares its intent by name instead of inline.
 *
 * ADMIN_LAYOUT_ROLES stays the default for pages that genuinely admit any
 * admin-class role; do not use it as a shortcut for the sets below.
 */
export const ORG_ADMIN_ONLY: ReadonlySet<AppRole> = SET("super_admin", "org_admin");

export const ORG_ADMIN_OR_MANAGER: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "manager",
);

export const PLATFORM_OR_ORG_ADMIN: ReadonlySet<AppRole> = SET(
  "super_admin",
  "regional_admin",
  "org_admin",
);

export const SUPER_ADMIN_ONLY: ReadonlySet<AppRole> = SET("super_admin");

/** Matches the org.expenseSettings feature — policy owners, not approvers. */
export const ORG_ADMIN_OR_FINANCE: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "finance",
);

/**
 * Roles that may run an offboarding case.
 *
 * This set MUST mirror the `offb tenant admin` RLS policy on
 * `offboarding_cases` exactly (see
 * supabase/migrations/20260821090000_offboarding_hr_policy.sql). It previously
 * did not: the page was gated with ADMIN_LAYOUT_ROLES, which admits `hr`,
 * `finance`, `branch_admin` and `regional_admin`, while the policy admitted
 * only `org_admin | super_admin | manager`. HR reached the page and the
 * database rejected their insert.
 *
 * If you widen this, widen the policy in the same change — the UI gate is not
 * the boundary and drifting from the policy just moves the error later.
 */
export const OFFBOARDING_ROLES: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "manager",
  "hr",
);

/**
 * Who may review work-from-home requests.
 *
 * Mirrors the `"wfh tenant approver manages"` policy in migration
 * 20260823060000 exactly — manager, hr, org_admin, plus super_admin through its
 * own separate policy. Same warning as OFFBOARDING_ROLES above: widen the
 * policy in the same change, or HR reaches the page and Postgres rejects the
 * update.
 */
export const WFH_APPROVER_ROLES: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "manager",
  "hr",
);
