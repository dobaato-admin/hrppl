import { describe, it, expect } from "vitest";
import {
  resolveApprovalScope,
  scopeCovers,
  refusalReason,
  APPROVER_ROLES,
} from "../src/lib/approval-scope";

/**
 * T6 — approval is a role's right, with a scope.
 *
 * ---------------------------------------------------------------------------
 * What this replaces
 * ---------------------------------------------------------------------------
 *
 * Each domain hardcoded its own role check, and they disagreed:
 *
 *   leave      `manager || org_admin`        — HR and branch admins refused
 *   expenses   `org_admin` only              — HR, finance, managers refused
 *   timesheets no role check whatsoever      — relied entirely on RLS, and had
 *                                              nothing to say about approving
 *                                              your own timesheet
 *
 * In practice one person holds several of these roles, so tying the right to a
 * single assigned approver strands requests whenever that person is not the one
 * looking at them.
 */

type Row = Record<string, any>;

function makeFakeSupabase(tables: Record<string, Row[]>) {
  function query(table: string) {
    const filters: Array<(r: Row) => boolean> = [];
    let single = false;
    const exec = () => {
      const rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      if (single) return Promise.resolve({ data: rows[0] ?? null });
      return Promise.resolve({ data: rows });
    };
    const chain: any = {
      select: () => chain,
      eq: (c: string, v: any) => (filters.push((r) => r[c] === v), chain),
      in: (c: string, v: any[]) => (filters.push((r) => v.includes(r[c])), chain),
      maybeSingle: () => ((single = true), exec()),
      then: (ok: any, err: any) => exec().then(ok, err),
    };
    return chain;
  }
  return { from: (t: string) => query(t) };
}

const T = "tenant-1";

const world = (roles: Row[], extra: Partial<Record<string, Row[]>> = {}) => ({
  user_roles: roles,
  employees: [
    { id: "e-alice", user_id: "u-alice", tenant_id: T, manager_id: null, branch_id: "b1" },
    { id: "e-bob", user_id: "u-bob", tenant_id: T, manager_id: "e-mgr", branch_id: "b1" },
    { id: "e-carol", user_id: "u-carol", tenant_id: T, manager_id: null, branch_id: "b2" },
    { id: "e-mgr", user_id: "u-mgr", tenant_id: T, manager_id: null, branch_id: "b1" },
  ],
  role_scope: [],
  ...extra,
});

describe("scope by role", () => {
  it("org_admin and hr reach the whole organisation", async () => {
    for (const role of ["org_admin", "hr"]) {
      const sb = makeFakeSupabase(world([{ user_id: "u-x", role }]));
      const s = await resolveApprovalScope(sb as any, "u-x", T, "leave");
      expect(s.scope, `${role} should be tenant-wide`).toBe("tenant");
      expect(s.employeeIds).toBeNull();
      expect(scopeCovers(s, "e-carol")).toBe(true);
    }
  });

  it("a manager reaches only their direct reports", async () => {
    const sb = makeFakeSupabase(world([{ user_id: "u-mgr", role: "manager" }]));
    const s = await resolveApprovalScope(sb as any, "u-mgr", T, "leave");
    expect(s.scope).toBe("reports");
    expect(s.employeeIds).toEqual(["e-bob"]);
    expect(scopeCovers(s, "e-bob")).toBe(true);
    expect(scopeCovers(s, "e-carol")).toBe(false);
  });

  it("a branch admin reaches their branches", async () => {
    const sb = makeFakeSupabase(
      world([{ user_id: "u-ba", role: "branch_admin" }], {
        role_scope: [{ user_id: "u-ba", role: "branch_admin", branch_id: "b1" }],
      }),
    );
    const s = await resolveApprovalScope(sb as any, "u-ba", T, "leave");
    expect(s.scope).toBe("branch");
    expect(s.employeeIds).toContain("e-bob");
    expect(s.employeeIds).not.toContain("e-carol");
  });

  it("a branch admin with no branch rows is tenant-wide, matching has_branch_access", async () => {
    // `has_branch_access` treats a null branch as "defer to the tenant check",
    // so narrowing here would make the queue and RLS disagree — the queue would
    // hide items the database would happily let them action.
    const sb = makeFakeSupabase(world([{ user_id: "u-ba", role: "branch_admin" }]));
    const s = await resolveApprovalScope(sb as any, "u-ba", T, "leave");
    expect(s.scope).toBe("tenant");
  });

  it("a role with no approval right gets nothing", async () => {
    const sb = makeFakeSupabase(world([{ user_id: "u-e", role: "employee" }]));
    const s = await resolveApprovalScope(sb as any, "u-e", T, "leave");
    expect(s.canApprove).toBe(false);
    expect(scopeCovers(s, "e-bob")).toBe(false);
  });
});

describe("scopes union rather than requiring a role switch", () => {
  it("hr + manager gets the wider of the two", async () => {
    // The brief asks for one dashboard, no role switching. Someone holding both
    // must not be reduced to their narrowest role.
    const sb = makeFakeSupabase(
      world([
        { user_id: "u-mgr", role: "manager" },
        { user_id: "u-mgr", role: "hr" },
      ]),
    );
    const s = await resolveApprovalScope(sb as any, "u-mgr", T, "leave");
    expect(s.scope).toBe("tenant");
    expect(s.roleUsed).toBe("hr");
    expect(scopeCovers(s, "e-carol")).toBe(true);
  });

  it("records the role that actually granted the reach", async () => {
    // T7 stores this against the decision. With several roles able to approve,
    // "approved_by: <uuid>" alone does not say in what capacity.
    const sb = makeFakeSupabase(
      world([
        { user_id: "u-x", role: "manager" },
        { user_id: "u-x", role: "branch_admin" },
      ]),
    );
    const s = await resolveApprovalScope(sb as any, "u-x", T, "leave");
    expect(s.roleUsed).toBe("branch_admin");
  });

  it("the role order is widest-first, which is what makes roleUsed meaningful", () => {
    for (const kind of ["leave", "expense", "timesheet"] as const) {
      const order = APPROVER_ROLES[kind];
      expect(order[0]).toBe("super_admin");
      expect(order.indexOf("org_admin")).toBeLessThan(order.indexOf("branch_admin"));
      expect(order.indexOf("branch_admin")).toBeLessThan(order.indexOf("manager"));
    }
  });
});

describe("nobody approves their own request", () => {
  it("blocks self-approval even for an org admin", async () => {
    // Explicitly in the brief: "including where an Org Admin or HR user submits
    // their own request". Seniority is the reason to block it, not to allow it.
    const sb = makeFakeSupabase(world([{ user_id: "u-alice", role: "org_admin" }]));
    const s = await resolveApprovalScope(sb as any, "u-alice", T, "leave");
    expect(s.scope).toBe("tenant");
    expect(scopeCovers(s, "e-alice")).toBe(false);
    expect(refusalReason(s, "e-alice")).toMatch(/cannot approve your own/);
  });

  it("blocks it for HR too", async () => {
    const sb = makeFakeSupabase(world([{ user_id: "u-carol", role: "hr" }]));
    const s = await resolveApprovalScope(sb as any, "u-carol", T, "leave");
    expect(scopeCovers(s, "e-carol")).toBe(false);
  });
});

describe("refusals say something the reader can act on", () => {
  it.each([
    ["employee", "e-bob", /role does not include approving/],
    ["manager", "e-carol", /not one of your direct reports/],
  ])("%s → %s", async (role, target, pattern) => {
    const sb = makeFakeSupabase(world([{ user_id: "u-mgr", role }]));
    const s = await resolveApprovalScope(sb as any, "u-mgr", T, "leave");
    expect(refusalReason(s, target)).toMatch(pattern);
  });
});

describe("expenses admit finance, which leave does not", () => {
  it("finance can action a claim but not leave", async () => {
    const sb = makeFakeSupabase(world([{ user_id: "u-f", role: "finance" }]));
    const claim = await resolveApprovalScope(sb as any, "u-f", T, "expense");
    const leave = await resolveApprovalScope(sb as any, "u-f", T, "leave");
    expect(claim.canApprove).toBe(true);
    expect(leave.canApprove).toBe(false);
  });
});
