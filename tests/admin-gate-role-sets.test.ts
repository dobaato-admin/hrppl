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
  type AppRole,
} from "../src/lib/rbac";

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

/** Roles each admin route admitted before the standardization. */
const EXPECTED: Record<string, ReadonlySet<AppRole>> = {
  // org_admin + super_admin
  "admin.departments.tsx": ORG_ADMIN_ONLY,
  "admin.designations.tsx": ORG_ADMIN_ONLY,
  "admin.feedback-templates.tsx": ORG_ADMIN_ONLY,
  "admin.holiday-categories.tsx": ORG_ADMIN_ONLY,
  "admin.leave-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.leave-types.tsx": ORG_ADMIN_ONLY,
  "admin.onboarding-packs.tsx": ORG_ADMIN_ONLY,
  "admin.overtime-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.payroll-setup-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.payroll-setup.tsx": ORG_ADMIN_ONLY,
  "admin.payroll-wizard.tsx": ORG_ADMIN_ONLY,
  "admin.team-assignments.tsx": ORG_ADMIN_ONLY,

  // + regional_admin (cross-tenant, country-scoped reference data)
  "admin.holiday-calendar.tsx": PLATFORM_OR_ORG_ADMIN,
  "admin.holidays.tsx": PLATFORM_OR_ORG_ADMIN,
  "admin.overtime-rates.tsx": PLATFORM_OR_ORG_ADMIN,
  "admin.payroll-settings.tsx": PLATFORM_OR_ORG_ADMIN,
  "admin.payslip-templates.tsx": PLATFORM_OR_ORG_ADMIN,

  // + manager (people-management surfaces)
  "admin.duty-reviews.tsx": ORG_ADMIN_OR_MANAGER,
  "admin.employee-holidays.tsx": ORG_ADMIN_OR_MANAGER,
  "admin.review-analytics.tsx": ORG_ADMIN_OR_MANAGER,
  "admin.review-cycles.tsx": ORG_ADMIN_OR_MANAGER,
  "admin.training.tsx": ORG_ADMIN_OR_MANAGER,

  // platform console
  "admin.index.tsx": SUPER_ADMIN_ONLY,

  // W4 IA (docs/w4-information-architecture-design.md) — gated for the
  // first time while giving each page a nav entry.
  "admin.expenses.tsx": ORG_ADMIN_OR_FINANCE,
  "admin.billing.tsx": SUPER_ADMIN_ONLY,
  "admin.billing-ops.tsx": SUPER_ADMIN_ONLY,
  "org.documents.templates.tsx": ADMIN_LAYOUT_ROLES,
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
      const usesBareGate = /<AdminGate(\s*>|\s+(?!allow=))/.test(src);
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
