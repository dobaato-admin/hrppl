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
  | "org.onboardingAdmin"
  | "org.auStpAudit"
  // Australian compliance (P4). One key per RLS tier — see the MATRIX note.
  | "org.auSuperFunds"
  | "org.auSuperBatches"
  | "org.auStpEvents"
  | "org.auAwards"
  | "org.auUnderpayment"
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
  | "org.leaveManagement"
  | "org.leaveTypes"
  | "org.toilAdmin"
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
  | "org.trainingManage"
  | "org.trainingCatalog"
  | "org.feedbackTemplates"
  | "org.reviewTemplates"
  | "org.reviewCycles"
  | "org.reviewAnalytics"
  | "org.kpiLibrary"
  | "org.employeeDuties"
  | "org.dutyReviews"
  | "org.templatesHub"
  | "org.performance"
  | "org.discipline"
  | "org.medical"
  | "org.assets"
  | "org.offboarding"
  | "org.biometric"
  | "org.geofences"
  | "org.wfhApprovals"
  | "org.requests"
  | "org.ticketInternalNotes"
  | "org.idRequests"
  | "org.analytics"
  | "org.reports"
  | "org.auditHistory"
  | "org.timesheetReview"
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
  // Split out of org.console in W5 P1. Onboarding administration is people ops,
  // not "anyone who can see the org console".
  "org.onboardingAdmin": SET("super_admin", "org_admin", "branch_admin", "hr"),
  // Also split out of org.console, which admitted six roles while the page's
  // own inline check requires is_org_admin — so it was a dead link for
  // branch_admin, hr, finance and manager. Not caught by the parity test
  // because the page gates inline rather than with <AdminGate>.
  "org.auStpAudit": SET("super_admin", "org_admin", "finance"),

  // ── Australian compliance ────────────────────────────────────────────────
  //
  // Five keys, not one. The obvious design was a single `org.auCompliance`
  // admitting super_admin/org_admin/finance for the whole subgroup — and it
  // would have been wrong in both directions at once, because the DATABASE
  // does not treat this domain uniformly:
  //
  //   super_funds / employee_super_choices   org_admin | finance | hr
  //   super_batches                          org_admin | finance
  //   stp_pay_events / finalisation events    org_admin
  //   payroll_underpayment_findings          org_admin | hr
  //   employee_award_assignments             org_admin
  //
  // One key would have locked finance out of Payday Super (which RLS grants
  // them) while offering finance STP lodgement (which RLS refuses). That is
  // the nav-vs-RLS drift axis — the one that fails latest and hardest, because
  // the page loads and Postgres refuses the write. Each key below mirrors the
  // policy on the table its page writes, and the matching server guard in
  // src/lib/au-guard.ts mirrors the same one.
  //
  // The subgroup also carries `country: ["AU"]` in nav-tree.ts. Both must pass:
  // an org_admin in the Nepali tenant sees none of this.

  /** Fund register and member choices. Mirrors `super_funds admin write`. */
  "org.auSuperFunds": SET("super_admin", "org_admin", "finance", "hr"),
  /** Remittance batches — moving money. Mirrors `super_batches finance write`. */
  "org.auSuperBatches": SET("super_admin", "org_admin", "finance"),
  /**
   * STP pay events and EOFY finalisation. Narrowest in the domain, on purpose:
   * lodging is a legal declaration by the employer, and `stp_pay_events
   * org_admin write` admits nobody else. Finance is deliberately absent.
   */
  "org.auStpEvents": SET("super_admin", "org_admin"),
  /** Award assignment. Mirrors `eaa org admin manage`; hr reads but cannot assign. */
  "org.auAwards": SET("super_admin", "org_admin"),
  /** Underpayment remediation. Mirrors "Org admins and HR can manage ...". */
  "org.auUnderpayment": SET("super_admin", "org_admin", "hr"),

  "org.setup": SET("super_admin", "org_admin"),
  "org.branches": SET("super_admin", "org_admin"),
  "org.whiteLabel": SET("super_admin", "org_admin"),
  "org.invitations": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.roles": SET("super_admin", "org_admin"),

  "org.employees": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  "org.departments": SET("super_admin", "org_admin", "hr"),
  "org.designations": SET("super_admin", "org_admin", "hr"),
  "org.teams": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "org.teamAssignments": SET("super_admin", "org_admin", "hr"),
  "org.recruitment": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.promotions": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
  "org.payRates": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),

  // Who APPROVES leave. Split from org.leaveTypes in W5 P1: one key used to
  // gate leave approvals, the leave-type library and TOIL admin alike, so any
  // answer that suited one was wrong for the others.
  "org.leaveManagement": SET("super_admin", "org_admin", "branch_admin", "hr"),
  // Who DEFINES leave types. D-1: records administration, squarely HR.
  // branch_admin dropped — defining the org's leave policy is an org-defining
  // power, which is the one thing that role is defined as lacking.
  "org.leaveTypes": SET("super_admin", "org_admin", "hr"),
  "org.toilAdmin": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.holidayCalendars": SET("super_admin", "org_admin", "hr"),
  "org.publicHolidays": SET(
    "super_admin",
    "regional_admin",
    "org_admin",
    "branch_admin",
    "hr",
    "manager",
    "employee",
  ),
  // Matches ORG_ADMIN_OR_MANAGER, the AdminGate allow-set on
  // /admin/employee-holidays itself — this nav item was gated by
  // org.reviewTemplates (super_admin/org_admin/branch_admin/hr), a leftover
  // from being copy-pasted into the Performance section. That let branch_admin
  // and hr see a link the route then rejected, and hid it from manager, who
  // the route does allow.
  "org.employeeHolidays": SET("super_admin", "org_admin", "manager"),
  "org.overtimeRates": SET("super_admin", "regional_admin", "org_admin", "finance"),

  // D-4 · finance is defined as owning payroll, and all four payroll-config
  // routes were dead links for exactly that role. branch_admin dropped:
  // configuring how the org pays people is an org-defining power.
  "org.payrollSetup": SET("super_admin", "org_admin", "finance"),
  "org.payrollSettings": SET("super_admin", "org_admin", "finance"),
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
  // W6 · Training needs TWO keys, because the database grants read and write to
  // different sets and one key could only express one of them.
  //
  // `org.training` is the *view* key for /org/training: who may open the
  // roster. It admits branch_admin, whose every policy in this domain is a
  // `FOR SELECT` — the same shape 20260613140528 chose for branch_admin across
  // performance, onboarding and assets.
  //
  // `org.trainingManage` is the *write* key: assign a course, change an
  // enrollment, author a lesson or a quiz question. It mirrors
  // `assertTrainingAuthor` in src/lib/training-guard.ts, which mirrors the RLS
  // write policies. Collapsing these back into one key re-opens X-07 from
  // whichever end you collapse it: branch_admin gets an Assign button Postgres
  // refuses, or loses a roster they are entitled to read.
  "org.training": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  "org.trainingManage": SET("super_admin", "org_admin", "hr", "manager"),
  "org.trainingCatalog": SET("super_admin", "org_admin", "hr", "manager"),
  "org.feedbackTemplates": SET("super_admin", "org_admin", "hr"),
  // W5 P1 · org.reviewTemplates used to gate SEVEN destinations at once —
  // review cycles, analytics, the KPI library, duties, duty reviews, the
  // template pages and the Templates Hub. D-2 admits manager to four of them
  // and not the other three, so one key could not express both. Split.
  "org.reviewTemplates": SET("super_admin", "org_admin", "hr"),
  "org.kpiLibrary": SET("super_admin", "org_admin", "hr"),
  "org.templatesHub": SET("super_admin", "org_admin", "hr"),
  // D-2 · the routes already admitted manager and the nav wrongly hid it.
  "org.reviewCycles": SET("super_admin", "org_admin", "hr", "manager"),
  "org.reviewAnalytics": SET("super_admin", "org_admin", "hr", "manager"),
  "org.dutyReviews": SET("super_admin", "org_admin", "hr", "manager"),
  "org.employeeDuties": SET("super_admin", "org_admin", "hr", "manager"),
  "org.performance": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),

  // Narrowed to match compliance.confidential. These two hold disciplinary and
  // medical records; the confidentiality rule restricts them to
  // super_admin/org_admin/hr, and the nav keys admitted branch_admin as well.
  // /admin/medical's route gate was wider still (ADMIN_LAYOUT_ROLES), so
  // finance, manager and regional_admin could reach medical incidents by URL.
  "org.discipline": SET("super_admin", "org_admin", "hr"),
  "org.medical": SET("super_admin", "org_admin", "hr"),
  "org.assets": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  // D-3 · MUST equal OFFBOARDING_ROLES, which mirrors the `offb tenant admin`
  // RLS policy on offboarding_cases. The nav was the only one of the three
  // that admitted branch_admin, so it advertised a page the database refuses.
  // manager added for the opposite reason: the policy allows it and the
  // sidebar was hiding it.
  "org.offboarding": SET("super_admin", "org_admin", "manager", "hr"),
  "org.biometric": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.geofences": SET("super_admin", "org_admin", "branch_admin", "hr"),
  // Must stay equal to WFH_APPROVER_ROLES and to the RLS policy on
  // wfh_requests. A nav entry wider than the policy just moves the failure
  // from "not shown" to "Postgres rejected your update".
  "org.wfhApprovals": SET("super_admin", "org_admin", "manager", "hr"),
  "org.requests": SET("super_admin", "org_admin", "branch_admin", "hr", "manager"),
  /**
   * Who may write a comment the requester cannot see.
   *
   * Mirrors the second half of "support_ticket_comments_view", which returns
   * `is_internal` rows only to org_admin, manager, regional_admin and
   * super_admin. Note what is NOT here: `hr`, `finance` and `branch_admin` all
   * reach the requests queue through org.requests, but the policy does not let
   * them READ an internal note back. Offering them the toggle would let them
   * write a note that vanishes on the next page load — worse than not offering
   * it, because nothing would report the loss.
   */
  "org.ticketInternalNotes": SET("super_admin", "regional_admin", "org_admin", "manager"),
  "org.idRequests": SET("super_admin", "org_admin", "branch_admin", "hr"),
  "org.analytics": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  "org.reports": SET("super_admin", "org_admin", "branch_admin", "hr", "finance"),
  // W5 P2 · An audit trail names every actor and what they touched. Narrower
  // than the admin surfaces it reports on, deliberately.
  "org.auditHistory": SET("super_admin", "org_admin"),
  // Mirrors who already approves time: the same people who see Timesheets.
  "org.timesheetReview": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),
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
  return roles.some(
    (r) =>
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

/**
 * D-1 · Records administration — the org's structural lookup tables.
 *
 * hr is in because departments, designations, leave types and holiday
 * categories are records administration, squarely people operations.
 * branch_admin is out because defining the org's structure is an org-defining
 * power, and that role is defined as org_admin minus exactly those.
 */
export const ORG_ADMIN_OR_HR: ReadonlySet<AppRole> = SET("super_admin", "org_admin", "hr");

/**
 * D-2 · Performance operations — running review cycles, reading their
 * analytics, scoring duties, assigning from the training catalog.
 *
 * manager is in because all four routes already admitted it and only the nav
 * was hiding them, so four pages built for managers were reachable solely by
 * typing the URL.
 */
export const ORG_ADMIN_HR_MANAGER: ReadonlySet<AppRole> = SET(
  "super_admin",
  "org_admin",
  "hr",
  "manager",
);

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
