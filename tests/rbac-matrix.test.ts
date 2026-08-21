/**
 * Phase 5 — RBAC matrix unit tests.
 *
 * Verifies the can() helper for every 8-role × key feature combination.
 * No DB required — pure matrix verification.
 *
 * If you change docs/rbac.md or src/lib/rbac.ts, update this file too.
 */
import { describe, it, expect } from "vitest";
import { can, isOrgMember, ORG_LAYOUT_ROLES, type AppRole, type Feature } from "../src/lib/rbac";

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

interface MatrixRow {
  feature: Feature;
  allowed: AppRole[];
}

/**
 * Source-of-truth expectations.  Each row lists the roles that SHOULD have
 * access; everything else must be denied.  Keep this in sync with docs/rbac.md.
 */
const EXPECTED: MatrixRow[] = [
  // Super-admin only
  { feature: "platform.admin", allowed: ["super_admin"] },
  { feature: "platform.tenants", allowed: ["super_admin"] },
  { feature: "platform.fx", allowed: ["super_admin"] },
  { feature: "platform.blog", allowed: ["super_admin"] },

  // Regional console
  { feature: "regional.console", allowed: ["super_admin", "regional_admin"] },

  // Org-admin destructive surface — locked to admins only
  { feature: "org.danger", allowed: ["super_admin", "org_admin"] },
  { feature: "org.setup", allowed: ["super_admin", "org_admin"] },
  { feature: "org.branches", allowed: ["super_admin", "org_admin"] },
  { feature: "org.whiteLabel", allowed: ["super_admin", "org_admin"] },
  { feature: "org.roles", allowed: ["super_admin", "org_admin"] },

  // Invitations — admins, branch_admin (own branch), HR
  { feature: "org.invitations", allowed: ["super_admin", "org_admin", "branch_admin", "hr"] },

  // Confidential medical/discipline — super_admin + org_admin + hr ONLY
  { feature: "compliance.confidential", allowed: ["super_admin", "org_admin", "hr"] },

  // Payroll — finance owns, branch_admin scoped, hr read elsewhere
  { feature: "org.payroll", allowed: ["super_admin", "org_admin", "branch_admin", "finance"] },
  { feature: "org.payslipTemplates", allowed: ["super_admin", "org_admin", "finance"] },

  // Manager compensation visibility
  {
    feature: "manager.compensation",
    allowed: ["super_admin", "org_admin", "branch_admin", "finance", "manager"],
  },

  // Employees list — broadly visible to org roles (scoped server-side)
  {
    feature: "org.employees",
    allowed: ["super_admin", "org_admin", "branch_admin", "hr", "finance", "manager"],
  },
];

describe("RBAC matrix — can() helper", () => {
  for (const row of EXPECTED) {
    describe(row.feature, () => {
      for (const role of ALL_ROLES) {
        const shouldAllow = row.allowed.includes(role);
        it(`${role} → ${shouldAllow ? "ALLOWED" : "DENIED"}`, () => {
          expect(can(row.feature, [role])).toBe(shouldAllow);
        });
      }
    });
  }

  it("returns false for empty / missing role list", () => {
    expect(can("org.employees", [])).toBe(false);
    expect(can("org.employees", null)).toBe(false);
    expect(can("org.employees", undefined)).toBe(false);
  });

  it("multi-role grants if ANY role qualifies", () => {
    // An employee who is also a manager should see manager features.
    expect(can("manager.compensation", ["employee", "manager"])).toBe(true);
    // A plain employee+something-unrelated still cannot see confidential.
    expect(can("compliance.confidential", ["employee", "manager"])).toBe(false);
  });

  it("super_admin is universal across the matrix", () => {
    // Sample a representative set of features.
    const sample: Feature[] = [
      "platform.admin",
      "regional.console",
      "org.danger",
      "compliance.confidential",
      "manager.compensation",
      "settings.billing",
    ];
    for (const f of sample) {
      expect(can(f, ["super_admin"])).toBe(true);
    }
  });

  it("plain employee never sees admin/destructive features", () => {
    const forbidden: Feature[] = [
      "platform.admin",
      "org.danger",
      "org.setup",
      "org.roles",
      "compliance.confidential",
      "org.payroll",
    ];
    for (const f of forbidden) {
      expect(can(f, ["employee"])).toBe(false);
    }
  });
});

describe("isOrgMember helper", () => {
  it("returns true for every in-org role", () => {
    for (const r of ALL_ROLES) {
      const expected = ORG_LAYOUT_ROLES.has(r);
      expect(isOrgMember([r])).toBe(expected);
    }
  });
  it("returns false for empty list", () => {
    expect(isOrgMember([])).toBe(false);
    expect(isOrgMember(null)).toBe(false);
  });
});
