const SET = (...r) => new Set(r);
const MATRIX = {
  // Platform
  "platform.admin": SET("super_admin"),
  "platform.tenants": SET("super_admin"),
  "platform.fx": SET("super_admin"),
  "platform.leads": SET("super_admin"),
  "platform.blog": SET("super_admin"),
  "platform.blogIntegrations": SET("super_admin"),
  "platform.apiDocs": SET("super_admin", "regional_admin", "org_admin"),
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
  "org.overtimeRates": SET("super_admin", "regional_admin", "org_admin", "branch_admin", "finance"),
  "org.payrollSetup": SET("super_admin", "org_admin", "branch_admin", "finance"),
  "org.payrollSettings": SET("super_admin", "org_admin", "branch_admin", "finance"),
  "org.payslipTemplates": SET("super_admin", "org_admin", "finance"),
  "org.payroll": SET("super_admin", "org_admin", "branch_admin", "finance"),
  "org.expenses": SET("super_admin", "org_admin", "branch_admin", "finance", "manager"),
  "org.documents": SET("super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"),
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
  "account.suspend": SET("super_admin", "org_admin")
};
function can(feature, roles) {
  if (!roles || roles.length === 0) return false;
  const allowed = MATRIX[feature];
  for (const r of roles) if (allowed.has(r)) return true;
  return false;
}
function isOrgMember(roles) {
  if (!roles) return false;
  return roles.some(
    (r) => r === "super_admin" || r === "org_admin" || r === "branch_admin" || r === "hr" || r === "finance" || r === "manager"
  );
}
SET(
  "super_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager"
);
const ADMIN_LAYOUT_ROLES = SET(
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager"
);
const ORG_ADMIN_ONLY = SET("super_admin", "org_admin");
const ORG_ADMIN_OR_MANAGER = SET(
  "super_admin",
  "org_admin",
  "manager"
);
const PLATFORM_OR_ORG_ADMIN = SET(
  "super_admin",
  "regional_admin",
  "org_admin"
);
const SUPER_ADMIN_ONLY = SET("super_admin");
const OFFBOARDING_ROLES = SET(
  "super_admin",
  "org_admin",
  "manager",
  "hr"
);
export {
  ADMIN_LAYOUT_ROLES as A,
  ORG_ADMIN_OR_MANAGER as O,
  PLATFORM_OR_ORG_ADMIN as P,
  SUPER_ADMIN_ONLY as S,
  ORG_ADMIN_ONLY as a,
  OFFBOARDING_ROLES as b,
  can as c,
  isOrgMember as i
};
