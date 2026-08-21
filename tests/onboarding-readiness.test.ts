/**
 * Unit tests for the onboarding readiness gates that hard-block
 * staff invitations until payroll, overtime, and leave setup are complete.
 *
 * These run against in-memory fakes of the Supabase admin client to verify
 * the pure server-side logic in `checkPayrollReadiness`, `checkOvertimeReadiness`,
 * and `checkLeaveReadiness`, plus the integrated gate used by `inviteStaff`.
 *
 * Run: bunx vitest run tests/onboarding-readiness.test.ts
 */
import { describe, it, expect } from "vitest";
import { checkPayrollReadiness, checkOvertimeReadiness } from "../src/lib/payroll-setup.functions";
import { checkLeaveReadiness } from "../src/lib/leave-setup.functions";

type Row = Record<string, any>;

/**
 * Minimal chainable mock that mimics the surface area we exercise:
 *   .from(t).select(cols, opts?).eq(...).in(...).limit(n).maybeSingle()
 * The fake resolves to a thenable result `{ data, count }` and honors
 * filtering equality (eq), membership (in), and limit truncation.
 */
function makeFakeSupabase(tables: Record<string, Row[]>) {
  function query(table: string) {
    const filters: Array<(r: Row) => boolean> = [];
    let limitN: number | null = null;
    let single = false;
    let countMode = false;

    const exec = () => {
      let rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      if (limitN != null) rows = rows.slice(0, limitN);
      if (single) return Promise.resolve({ data: rows[0] ?? null, count: rows.length });
      return Promise.resolve({ data: rows, count: countMode ? rows.length : undefined });
    };

    const chain: any = {
      select(_cols?: string, opts?: any) { if (opts?.count === "exact") countMode = true; return chain; },
      eq(col: string, val: any) { filters.push((r) => r[col] === val); return chain; },
      in(col: string, vals: any[]) { filters.push((r) => vals.includes(r[col])); return chain; },
      limit(n: number) { limitN = n; return chain; },
      order() { return chain; },
      maybeSingle() { single = true; return exec(); },
      then(onFulfilled: any, onRejected: any) { return exec().then(onFulfilled, onRejected); },
    };
    return chain;
  }
  return { from: (t: string) => query(t) };
}

const TENANT = "t-1";

describe("checkPayrollReadiness", () => {
  it("flags every step incomplete when tables are empty", async () => {
    const sb = makeFakeSupabase({});
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(false);
    expect(r.steps).toEqual({ payItems: false, payDates: false, overtimeRates: false, currency: false });
  });

  it("marks all steps complete when everything is configured", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "USD" }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(true);
  });

  it("treats invalid currency codes as missing", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "XX" }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.steps.currency).toBe(false);
    expect(r.allComplete).toBe(false);
  });

  it("ignores inactive pay items when deciding readiness", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: false }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "USD" }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.steps.payItems).toBe(false);
    expect(r.allComplete).toBe(false);
  });
});

describe("checkOvertimeReadiness", () => {
  it("returns hasRates=false when none are configured", async () => {
    const sb = makeFakeSupabase({ overtime_penalty_rates: [] });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r).toEqual({ hasRates: false, rateCount: 0, allComplete: false });
  });

  it("returns hasRates=true when at least one rate exists", async () => {
    const sb = makeFakeSupabase({
      overtime_penalty_rates: [
        { id: "ot1", tenant_id: TENANT },
        { id: "ot2", tenant_id: TENANT },
      ],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r.hasRates).toBe(true);
    expect(r.allComplete).toBe(true);
    expect(r.rateCount).toBeGreaterThanOrEqual(2);
  });

  it("excludes rates from other tenants", async () => {
    const sb = makeFakeSupabase({
      overtime_penalty_rates: [{ id: "ot1", tenant_id: "other-tenant" }],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(false);
  });
});

describe("checkLeaveReadiness", () => {
  it("fails when no active leave types exist", async () => {
    const sb = makeFakeSupabase({ leave_types: [], user_roles: [] });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.leaveTypes).toBe(false);
    expect(r.allComplete).toBe(false);
  });

  it("fails accruals when an active type has zero quota AND zero accrual", async () => {
    const sb = makeFakeSupabase({
      leave_types: [
        { id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 0, accrual_per_month: 0, requires_approval: false },
      ],
      user_roles: [],
    });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.accruals).toBe(false);
  });

  it("passes accruals when annual quota is non-zero", async () => {
    const sb = makeFakeSupabase({
      leave_types: [
        { id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: false },
      ],
      user_roles: [],
    });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.accruals).toBe(true);
    expect(r.steps.approvalRouting).toBe(true); // no type requires approval
    expect(r.allComplete).toBe(true);
  });

  it("requires an approver when at least one active type requires approval", async () => {
    const sb = makeFakeSupabase({
      leave_types: [
        { id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: true },
      ],
      user_roles: [],
    });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.approvalRouting).toBe(false);
    expect(r.allComplete).toBe(false);
  });

  it("treats a manager in the tenant as a sufficient approver", async () => {
    const sb = makeFakeSupabase({
      leave_types: [
        { id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: true },
      ],
      user_roles: [{ user_id: "u1", role: "manager", tenant_id: TENANT }],
    });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.approvalRouting).toBe(true);
    expect(r.allComplete).toBe(true);
  });
});

describe("invitation gate — combined readiness", () => {
  /**
   * Mirrors the exact check inviteStaff() runs server-side: every block
   * must be allComplete or the invitation is rejected before any DB write.
   */
  async function gate(sb: any) {
    const [payroll, overtime, leave] = await Promise.all([
      checkPayrollReadiness(sb, TENANT),
      checkOvertimeReadiness(sb, TENANT),
      checkLeaveReadiness(sb, TENANT),
    ]);
    if (!payroll.allComplete) return { ok: false, reason: "payroll" };
    if (!overtime.allComplete) return { ok: false, reason: "overtime" };
    if (!leave.allComplete) return { ok: false, reason: "leave" };
    return { ok: true as const, reason: null };
  }

  it("blocks when payroll is incomplete even if leave is fine", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "USD" }],
      leave_types: [{ id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: false }],
      user_roles: [],
    });
    expect(await gate(sb)).toEqual({ ok: false, reason: "payroll" });
  });

  it("blocks when overtime is missing even if payroll-core + leave are fine", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [],
      tenants: [{ id: TENANT, currency_code: "USD" }],
      leave_types: [{ id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: false }],
      user_roles: [],
    });
    // payroll readiness also fails (overtime is one of its steps); first failure wins.
    const result = await gate(sb);
    expect(result.ok).toBe(false);
    expect(["payroll", "overtime"]).toContain(result.reason);
  });

  it("blocks when leave is incomplete even when payroll & overtime are fine", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "USD" }],
      leave_types: [],
      user_roles: [],
    });
    expect(await gate(sb)).toEqual({ ok: false, reason: "leave" });
  });

  it("permits invitations only when every section is complete", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", tenant_id: TENANT }],
      tenants: [{ id: TENANT, currency_code: "USD" }],
      leave_types: [{ id: "lt1", tenant_id: TENANT, is_active: true, annual_quota_days: 20, accrual_per_month: 0, requires_approval: true }],
      user_roles: [{ user_id: "u1", role: "manager", tenant_id: TENANT }],
    });
    expect(await gate(sb)).toEqual({ ok: true, reason: null });
  });
});
