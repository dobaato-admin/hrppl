import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { can, PAYROLL_APPROVER_ROLES, type AppRole } from "@/lib/rbac";

/**
 * Payroll approval was unreachable through the UI.
 *
 * ---------------------------------------------------------------------------
 * The shape of it
 * ---------------------------------------------------------------------------
 *
 * A run could be created, computed and submitted, and then nobody could approve
 * it from the product. Three roles, three different reasons, none of them
 * visible from inside the app:
 *
 * | Role                                | Sees /org/payroll? | Guard allowed? |
 * | ----------------------------------- | ------------------ | -------------- |
 * | `manager`                           | **No**             | **Yes**        |
 * | `org_admin`, `finance`, `branch_admin` | Yes             | **No**         |
 * | `super_admin`                       | Yes                | Yes            |
 *
 * `assertApproverForTenant` required `manager`. `org.payroll` admits
 * super_admin, org_admin, branch_admin and finance — and not manager. The page
 * gate and the server guard were close to complements of each other, so the
 * Approve button was hidden from everyone who could reach the page, and the
 * only role the server would accept could not open it. A tenant with no
 * platform super_admin on hand simply could not pay anyone.
 *
 * This is the Wave 5 "nav row vs server fn" drift axis in the one place W5 did
 * not reach.
 *
 * ---------------------------------------------------------------------------
 * Why widening it does not cost the four-eyes rule
 * ---------------------------------------------------------------------------
 *
 * Separation of duties here is enforced **by person, not by role**:
 * `approvePayrollRun` refuses when `submitted_by === userId`. A second org
 * admin still has to approve what the first one submitted. That check is
 * independent of the role set and is pinned below, because deleting it would
 * silently turn one person into the whole control.
 *
 * `approvePayrollRun` writes through the SERVICE-ROLE client, so no RLS policy
 * sits behind this guard. It is the only gate on the transition — unlike
 * training or documents, where the guard exists mainly to make a refusal
 * legible. Read any change here as a real widening.
 */

const ROOT = process.cwd();
const GUARD = readFileSync(join(ROOT, "src/lib/payroll.functions.ts"), "utf8");
const PAGE = readFileSync(join(ROOT, "src/routes/org.payroll.tsx"), "utf8");

describe("the approver set is one source, read by both halves", () => {
  it("the server guard reads PAYROLL_APPROVER_ROLES", () => {
    expect(GUARD).toMatch(/PAYROLL_APPROVER_ROLES/);
  });

  it("the server guard no longer hand-rolls a role list", () => {
    // `if (!rs.includes("manager")) throw …` is the exact line that made
    // approval unreachable. A hand-rolled list here is how it comes back.
    expect(GUARD).not.toMatch(/Forbidden: manager role required/);
  });

  it("the page's Approve button reads the same set", () => {
    expect(PAGE).toMatch(/PAYROLL_APPROVER_ROLES/);
    expect(PAGE).not.toMatch(/const isManager\s*=/);
  });
});

describe("four-eyes survives the widening", () => {
  it("the submitter still cannot approve their own run", () => {
    expect(GUARD).toMatch(/Approver must be different from the person who submitted the run/);
    expect(GUARD).toMatch(/run\.submitted_by === userId/);
  });

  it("the page hides the button from the submitter too", () => {
    expect(PAGE).toMatch(/selected\.submitted_by !== user\?\.id/);
  });
});

describe("everyone who may approve can reach a surface that lets them", () => {
  /**
   * The whole defect was a role holding the right without a route to exercise
   * it. Every approver except `manager` must be able to open `/org/payroll`.
   *
   * **`manager` is the known, deliberate exception.** It keeps the right it has
   * always had — removing it would be a separate product decision, and it is
   * still reachable by API — but `org.payroll` renders every payslip for every
   * employee, so admitting managers to that page would hand the whole salary
   * list to each of them. The proper home for a manager's approval is the
   * `/approvals` queue, which shows only what the caller may decide. That is
   * recorded as open work in docs/remaining-work.md rather than fixed in
   * passing, and this test is what stops it being forgotten.
   */
  const EXPECTED_WITHOUT_A_PAGE: AppRole[] = ["manager"];

  for (const role of [...PAYROLL_APPROVER_ROLES] as AppRole[]) {
    const expectedReachable = !EXPECTED_WITHOUT_A_PAGE.includes(role);
    it(`${role} ${expectedReachable ? "can open /org/payroll" : "cannot (known: needs /approvals)"}`, () => {
      expect(can("org.payroll", [role])).toBe(expectedReachable);
    });
  }

  it("at least one tenant-level role can approve without a platform account", () => {
    // The original failure in one assertion: before this change the only role
    // that could both open the page and pass the guard was `super_admin`, which
    // a tenant does not necessarily have available.
    const tenantApprovers = ([...PAYROLL_APPROVER_ROLES] as AppRole[]).filter(
      (r) => r !== "super_admin" && r !== "regional_admin" && can("org.payroll", [r]),
    );
    expect(tenantApprovers.length).toBeGreaterThan(0);
  });

  it("branch_admin may open the page but not approve a tenant-wide run", () => {
    expect(can("org.payroll", ["branch_admin"])).toBe(true);
    expect(PAYROLL_APPROVER_ROLES.has("branch_admin")).toBe(false);
  });
});

describe("the payroll guards honour the acting tenant", () => {
  it("neither guard reads profiles.tenant_id directly", () => {
    // Gap 1 in CLAUDE.md, in the guard rather than the page: a direct read is
    // NULL for a platform account, so a super_admin acting as a tenant failed
    // the tenant-match check on a tenant they had explicitly selected.
    const guards = GUARD.slice(0, GUARD.indexOf("export const createPayrollRun"));
    expect(guards).not.toMatch(/from\("profiles"\)/);
    expect(GUARD).toMatch(/getTenantId\(/);
  });
});
