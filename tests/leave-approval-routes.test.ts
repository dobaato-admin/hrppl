/**
 * `leave_approval_routes` was authored — full CRUD server fns, a setup-wizard
 * UI (`admin.leave-setup-wizard.tsx`) — but never consumed: approve/reject
 * accepted any manager or org_admin in the tenant regardless of a configured
 * multi-tier chain, and nothing stopped a manager approving their own
 * request (the same self-decision hole fixed for WFH's `tg_wfh_lifecycle`,
 * which leave had no equivalent of at all).
 *
 * These pin `assertApproverForRequest` against an in-memory fake of the
 * Supabase client, in the style of `tests/onboarding-readiness.test.ts`.
 */
import { describe, it, expect } from "vitest";
import { assertApproverForRequest } from "@/lib/leave.functions";

type Row = Record<string, any>;

/**
 * Minimal chainable mock covering `.from(t).select().eq().in().maybeSingle()`
 * plus a bare-array await, matching what assertApproverForRequest's call
 * chain actually uses.
 */
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
      select() { return chain; },
      eq(col: string, val: any) { filters.push((r) => r[col] === val); return chain; },
      in(col: string, vals: any[]) { filters.push((r) => vals.includes(r[col])); return chain; },
      maybeSingle() { single = true; return exec(); },
      then(onFulfilled: any, onRejected: any) { return exec().then(onFulfilled, onRejected); },
    };
    return chain;
  }
  return { from: (t: string) => query(t) };
}

const TENANT = "tenant-1";
const OTHER_TENANT = "tenant-2";
const LEAVE_TYPE = "annual";
const OTHER_LEAVE_TYPE = "sick";

const baseTables = (extra: Partial<Record<string, Row[]>> = {}) => ({
  profiles: [
    { id: "manager-1", tenant_id: TENANT },
    { id: "hr-1", tenant_id: TENANT },
    { id: "outsider", tenant_id: OTHER_TENANT },
    { id: "requester", tenant_id: TENANT },
  ],
  user_roles: [
    { user_id: "manager-1", role: "manager" },
    { user_id: "hr-1", role: "hr" },
    { user_id: "requester", role: "manager" },
  ],
  employees: [
    { id: "emp-requester", user_id: "requester", tenant_id: TENANT },
    { id: "emp-manager", user_id: "manager-1", tenant_id: TENANT },
  ],
  leave_approval_routes: [],
  ...extra,
});

function req(overrides: Partial<Row> = {}) {
  return {
    tenant_id: TENANT,
    employee_id: "emp-requester",
    leave_type_id: LEAVE_TYPE,
    current_tier: 1,
    ...overrides,
  };
}

describe("assertApproverForRequest — no routes configured (old behaviour)", () => {
  it("allows a manager in the tenant and finalises immediately", async () => {
    const sb = makeFakeSupabase(baseTables());
    const result = await assertApproverForRequest(sb as any, "manager-1", req());
    expect(result).toEqual({ isFinalTier: true });
  });

  it("rejects a role that isn't manager or org_admin", async () => {
    const sb = makeFakeSupabase(baseTables());
    await expect(assertApproverForRequest(sb as any, "hr-1", req())).rejects.toThrow(/manager or org admin/);
  });

  it("rejects a caller in a different tenant", async () => {
    const sb = makeFakeSupabase(baseTables());
    await expect(assertApproverForRequest(sb as any, "outsider", req())).rejects.toThrow(/tenant mismatch/);
  });

  it("rejects the requester deciding their own request, even though they hold manager", async () => {
    // This is the hole this fix closes: `requester` holds "manager" and is in
    // the right tenant, so the old check alone would have let this through.
    const sb = makeFakeSupabase(baseTables());
    await expect(assertApproverForRequest(sb as any, "requester", req())).rejects.toThrow(/own leave request/);
  });
});

describe("assertApproverForRequest — configured multi-tier chain", () => {
  const routes: Row[] = [
    { tenant_id: TENANT, tier: 1, approver_role: "manager", approver_user_id: null, leave_type_id: null, is_active: true },
    { tenant_id: TENANT, tier: 2, approver_role: null, approver_user_id: "hr-1", leave_type_id: null, is_active: true },
  ];

  it("a tier-1 approver advances rather than finalises when more tiers exist", async () => {
    const sb = makeFakeSupabase(baseTables({ leave_approval_routes: routes }));
    const result = await assertApproverForRequest(sb as any, "manager-1", req({ current_tier: 1 }));
    expect(result).toEqual({ isFinalTier: false });
  });

  it("the named tier-2 approver finalises", async () => {
    const sb = makeFakeSupabase(baseTables({ leave_approval_routes: routes }));
    const result = await assertApproverForRequest(sb as any, "hr-1", req({ current_tier: 2 }));
    expect(result).toEqual({ isFinalTier: true });
  });

  it("a manager cannot act at tier 2 — that tier names a specific person", async () => {
    const sb = makeFakeSupabase(baseTables({ leave_approval_routes: routes }));
    await expect(
      assertApproverForRequest(sb as any, "manager-1", req({ current_tier: 2 })),
    ).rejects.toThrow(/tier 2 approver/);
  });

  it("hr cannot jump ahead and act at tier 1", async () => {
    const sb = makeFakeSupabase(baseTables({ leave_approval_routes: routes }));
    await expect(
      assertApproverForRequest(sb as any, "hr-1", req({ current_tier: 1 })),
    ).rejects.toThrow(/tier 1 approver/);
  });

  it("a leave-type-specific route overrides the tenant-wide route at the same tier", async () => {
    const specific: Row[] = [
      { tenant_id: TENANT, tier: 1, approver_role: "manager", approver_user_id: null, leave_type_id: null, is_active: true },
      { tenant_id: TENANT, tier: 1, approver_role: null, approver_user_id: "hr-1", leave_type_id: LEAVE_TYPE, is_active: true },
    ];
    const sb = makeFakeSupabase(baseTables({ leave_approval_routes: specific }));
    // For LEAVE_TYPE, the specific hr-1 route wins over the tenant-wide manager one.
    await expect(
      assertApproverForRequest(sb as any, "manager-1", req({ leave_type_id: LEAVE_TYPE, current_tier: 1 })),
    ).rejects.toThrow(/tier 1 approver/);
    const result = await assertApproverForRequest(sb as any, "hr-1", req({ leave_type_id: LEAVE_TYPE, current_tier: 1 }));
    expect(result).toEqual({ isFinalTier: true });
  });

  it("a request for an unrouted leave type falls back to the old behaviour", async () => {
    // Routes exist for LEAVE_TYPE only; a request for a different leave type
    // with no tenant-wide (null) route configured sees maxTier 0.
    const sb = makeFakeSupabase(
      baseTables({
        leave_approval_routes: [
          { tenant_id: TENANT, tier: 1, approver_role: "manager", approver_user_id: null, leave_type_id: LEAVE_TYPE, is_active: true },
        ],
      }),
    );
    const result = await assertApproverForRequest(
      sb as any,
      "manager-1",
      req({ leave_type_id: OTHER_LEAVE_TYPE, current_tier: 1 }),
    );
    expect(result).toEqual({ isFinalTier: true });
  });

  it("an inactive route does not count", async () => {
    const sb = makeFakeSupabase(
      baseTables({
        leave_approval_routes: [
          { tenant_id: TENANT, tier: 1, approver_role: "manager", approver_user_id: null, leave_type_id: null, is_active: false },
        ],
      }),
    );
    const result = await assertApproverForRequest(sb as any, "manager-1", req());
    expect(result).toEqual({ isFinalTier: true }); // treated as unrouted
  });

  it("super_admin bypasses tenant, self-decision, and route checks", async () => {
    const sb = makeFakeSupabase(
      baseTables({
        user_roles: [{ user_id: "super-1", role: "super_admin" }],
        leave_approval_routes: routes,
      }),
    );
    const result = await assertApproverForRequest(sb as any, "super-1", req({ current_tier: 1 }));
    expect(result).toEqual({ isFinalTier: true });
  });
});
