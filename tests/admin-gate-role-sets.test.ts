import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  ADMIN_LAYOUT_ROLES,
  ORG_ADMIN_ONLY,
  ORG_ADMIN_OR_MANAGER,
  ORG_ADMIN_OR_FINANCE,
  PLATFORM_OR_ORG_ADMIN,
  SUPER_ADMIN_ONLY,
  ORG_ADMIN_OR_HR,
  ORG_ADMIN_HR_MANAGER,
  can,
  type AppRole,
  type Feature,
} from "../src/lib/rbac";

const ALL_ROLES: AppRole[] = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
];

/**
 * Finalization Plan §1 #10 — the safety net for standardizing admin gating.
 *
 * 22 admin pages hand-rolled `if (!canAccess) return <main>Forbidden.</main>`
 * with role sets that were NOT uniform. `<AdminGate>`'s default allow-set is
 * deliberately permissive (all of ADMIN_LAYOUT_ROLES), so converting those
 * pages onto the default would WIDEN access on most of them.
 *
 * EXPECTED below is the set each page enforced before the refactor, captured
 * from the original source. It is a security contract, not a snapshot to be
 * regenerated: if a page's effective set changes, either the change is
 * deliberate and this table is updated in the same commit with a reason, or
 * it is an accident and the test just caught it.
 */

const root = process.cwd();
const routesDir = join(root, "src/routes");

const NAMED: Record<string, ReadonlySet<AppRole>> = {
  ADMIN_LAYOUT_ROLES,
  ORG_ADMIN_ONLY,
  ORG_ADMIN_OR_MANAGER,
  ORG_ADMIN_OR_FINANCE,
  PLATFORM_OR_ORG_ADMIN,
  SUPER_ADMIN_ONLY,
};

/**
 * Roles each admin route admits. A SECURITY CONTRACT, not a snapshot to be
 * regenerated: when a page's effective set changes, either the change is
 * deliberate and this table is updated in the same commit with the reason, or
 * it is an accident and this test just caught it.
 *
 * W5 P1 · Nineteen entries below changed deliberately, applying decisions
 * D-1 to D-4. Every one of them was a nav row that rendered for a role the
 * route then rejected — 36 such drifts across five roles, with `hr` seeing 13
 * and `branch_admin` 17. The reason each moved is on the group heading.
 */
const EXPECTED: Record<string, ReadonlySet<AppRole>> = {
  // ---- D-1 · records administration: hr IN, branch_admin OUT ---------------
  // Departments, designations, team assignments, leave types and holiday
  // categories are records administration, squarely people operations — and
  // all five were dead links for hr. branch_admin comes out because defining
  // the org's structure is an org-defining power, the one thing that role is
  // defined as lacking.
  "admin.departments.tsx": ORG_ADMIN_OR_HR,
  "admin.designations.tsx": ORG_ADMIN_OR_HR,
  "admin.team-assignments.tsx": ORG_ADMIN_OR_HR,
  "admin.leave-types.tsx": ORG_ADMIN_OR_HR,
  "admin.holiday-categories.tsx": ORG_ADMIN_OR_HR,
  // Same reasoning — review and feedback template libraries are HR's to define.
  "admin.feedback-templates.tsx": ORG_ADMIN_OR_HR,
  "admin.review-templates.tsx": ORG_ADMIN_OR_HR,
  "admin.kpi-kra.tsx": ORG_ADMIN_OR_HR,

  // ---- D-2 · performance operations: hr AND manager IN --------------------
  // All four already admitted manager at the route and only the nav was hiding
  // them, so four pages built for managers were reachable solely by URL.
  "admin.review-cycles.tsx": ORG_ADMIN_HR_MANAGER,
  "admin.review-analytics.tsx": ORG_ADMIN_HR_MANAGER,
  "admin.duty-reviews.tsx": ORG_ADMIN_HR_MANAGER,
  "admin.training.tsx": ORG_ADMIN_HR_MANAGER,
  // Was ADMIN_LAYOUT_ROLES at the route — wider than its own nav row, so
  // finance and regional_admin could reach it by URL. Narrowed to match.
  "admin.employee-duties.tsx": ORG_ADMIN_HR_MANAGER,

  // ---- D-4 · finance owns payroll configuration ---------------------------
  // finance is defined as owning payroll and all four were dead links for
  // exactly that role. branch_admin out, as in D-1.
  "admin.payroll-setup.tsx": ORG_ADMIN_OR_FINANCE,
  "admin.payroll-settings.tsx": ORG_ADMIN_OR_FINANCE,
  "admin.payslip-templates.tsx": ORG_ADMIN_OR_FINANCE,

  // ---- Confidentiality alignment ------------------------------------------
  // /admin/medical was gated ADMIN_LAYOUT_ROLES, which admits finance, manager
  // and regional_admin — against a compliance.confidential rule that restricts
  // medical incidents to super_admin/org_admin/hr. The route gate and the
  // confidentiality rule disagreed, and the route gate was the permissive one.
  "admin.medical.tsx": ORG_ADMIN_OR_HR,

  // ---- Unchanged: org_admin + super_admin ---------------------------------
  "admin.leave-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.onboarding-packs.tsx": ORG_ADMIN_ONLY,
  "admin.overtime-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.payroll-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.payroll-wizard.tsx": ORG_ADMIN_ONLY,

  // D-4 again, with regional_admin retained: overtime rates are cross-tenant
  // reference data AND payroll configuration, so the set is
  // PLATFORM_OR_ORG_ADMIN plus finance.
  "admin.overtime-rates.tsx": new Set<AppRole>([
    "super_admin",
    "regional_admin",
    "org_admin",
    "finance",
  ]),

  // ---- Unchanged: + manager ----------------------------------------------
  "admin.employee-holidays.tsx": ORG_ADMIN_OR_MANAGER,

  // ---- Public holidays: read for all, edit for admins ---------------------
  // The only destination with no honest allow/deny answer. Every employee has
  // a reason to look at the holiday calendar and almost none to change it, so
  // the route now admits everyone (org.publicHolidays) and the page hides its
  // own mutations. This was the one drift that reached EVERY role, employees
  // included: the nav admitted them and the page bounced them with "Admin
  // access required".
  "admin.holiday-calendar.tsx": new Set<AppRole>([
    "super_admin",
    "regional_admin",
    "org_admin",
    "branch_admin",
    "hr",
    "manager",
    "employee",
  ]),
  "admin.holidays.tsx": new Set<AppRole>([
    "super_admin",
    "regional_admin",
    "org_admin",
    "branch_admin",
    "hr",
    "manager",
    "employee",
  ]),

  // ---- Platform console ---------------------------------------------------
  "admin.index.tsx": SUPER_ADMIN_ONLY,
  "admin.billing.tsx": SUPER_ADMIN_ONLY,
  "admin.billing-ops.tsx": SUPER_ADMIN_ONLY,

  // ---- W4 IA — gated for the first time while gaining a nav entry ---------
  "admin.expenses.tsx": ORG_ADMIN_OR_FINANCE,
  // Narrowed from ADMIN_LAYOUT_ROLES to match its own nav row: the W4 gate was
  // added in a hurry and admitted regional_admin, which org.documentTemplates
  // never did. A platform role has no business editing one tenant's document
  // templates.
  "org.documents.templates.tsx": new Set<AppRole>([
    "super_admin",
    "org_admin",
    "branch_admin",
    "hr",
    "finance",
    "manager",
  ]),
};

/**
 * Effective allow-set for a route, from whichever form it uses:
 *   `component: () => (<AdminGate allow={X}>…)`  -> X
 *   bare `<AdminGate>`                            -> the permissive default
 *   otherwise                                     -> literal roles.includes()
 */
function effectiveRoles(src: string): Set<AppRole> {
  const gate = src.match(/<AdminGate\s+allow=\{(\w+)\}/);
  if (gate) {
    const set = NAMED[gate[1]];
    if (!set) throw new Error(`Unknown allow-set "${gate[1]}" — add it to NAMED`);
    return new Set(set);
  }
  // W5 · The default form is now `feature="…"`, resolved through the same
  // MATRIX entry the sidebar reads. The set below is what the page actually
  // admits, so this contract keeps testing effective access rather than the
  // spelling of the gate.
  const byFeature = src.match(/<AdminGate\s+feature="([^"]+)"/);
  if (byFeature) {
    return new Set(ALL_ROLES.filter((r) => can(byFeature[1] as Feature, [r])));
  }
  if (/<AdminGate(\s|>)/.test(src)) return new Set(ADMIN_LAYOUT_ROLES);

  const roles = new Set<AppRole>();
  for (const m of src.matchAll(/roles\.includes\(["'`](\w+)["'`]\)/g)) {
    roles.add(m[1] as AppRole);
  }
  return roles;
}

const sorted = (s: Iterable<string>) => [...s].sort();

describe("admin route allow-sets are unchanged by the standardization", () => {
  for (const [file, expected] of Object.entries(EXPECTED)) {
    it(`${file} admits exactly its original roles`, () => {
      const src = readFileSync(join(routesDir, file), "utf8");
      expect(sorted(effectiveRoles(src))).toEqual(sorted(expected));
    });
  }
});

describe("no admin page silently inherits the permissive default", () => {
  it("every page in the contract declares its allow-set explicitly", () => {
    // A bare <AdminGate> on any of these would admit hr, finance, manager and
    // branch_admin — the widening this whole test exists to prevent.
    const widened: string[] = [];
    for (const [file, expected] of Object.entries(EXPECTED)) {
      const src = readFileSync(join(routesDir, file), "utf8");
      const usesBareGate = /<AdminGate(\s*>|\s+(?!allow=|feature=))/.test(src);
      if (usesBareGate && sorted(expected).join() !== sorted(ADMIN_LAYOUT_ROLES).join()) {
        widened.push(file);
      }
    }
    expect(widened).toEqual([]);
  });
});

describe("the contract stays in step with the filesystem", () => {
  it("covers every admin route that previously hand-rolled a gate", () => {
    // Guards against a page being deleted or renamed and the contract rotting.
    const missing = Object.keys(EXPECTED).filter((f) => !readdirSync(routesDir).includes(f));
    expect(missing).toEqual([]);
  });
});
