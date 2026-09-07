/**
 * Unit tests for the onboarding readiness gates that hard-block
 * staff invitations until payroll, overtime, and leave setup are complete.
 *
 * These run against in-memory fakes of the Supabase admin client to verify
 * the pure server-side logic in `checkPayrollReadiness`, `checkOvertimeReadiness`,
 * and `checkLeaveReadiness`, plus the integrated gate used by `inviteStaff`.
 *
 * Run: bunx vitest run tests/onboarding-readiness.test.ts
 *
 * ---------------------------------------------------------------------------
 * 2026-09-07 — these four tests were failing, and it was the fixtures
 * ---------------------------------------------------------------------------
 *
 * `checkPayrollReadiness` resolves overtime rates by the tenant's
 * `country_code`; `overtime_penalty_rates` has no `tenant_id` column. The
 * fixtures here predate that change and still filed rates under a tenant, so
 * `overtimeRates` was false in every "everything is configured" case and four
 * tests went red — permanently, and documented as the expected baseline.
 *
 * A suite that is normally red cannot tell you when something breaks, which is
 * the entire point of having one. W7 made it load-bearing again:
 * `buildSetupGuide` calls `checkPayrollReadiness` to decide whether a tenant may
 * activate, so this contract now gates going live.
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
      select(_cols?: string, opts?: any) {
        if (opts?.count === "exact") countMode = true;
        return chain;
      },
      eq(col: string, val: any) {
        filters.push((r) => r[col] === val);
        return chain;
      },
      in(col: string, vals: any[]) {
        filters.push((r) => vals.includes(r[col]));
        return chain;
      },
      limit(n: number) {
        limitN = n;
        return chain;
      },
      order() {
        return chain;
      },
      maybeSingle() {
        single = true;
        return exec();
      },
      then(onFulfilled: any, onRejected: any) {
        return exec().then(onFulfilled, onRejected);
      },
    };
    return chain;
  }
  return { from: (t: string) => query(t) };
}

const TENANT = "t-1";
/**
 * The tenant's country. Load-bearing: `overtime_penalty_rates` carries a
 * `country_code` and **no `tenant_id` at all** — the rates are shared
 * reference data, the same way `public_holidays` are. Every fixture in the
 * original version of this file wrote `tenant_id` onto those rows and left
 * `country_code` off the tenant, which described a table shape that does not
 * exist. Four tests failed continuously as a result, and the failure was
 * recorded in CLAUDE.md as an accepted baseline rather than read.
 */
const COUNTRY = "AU";

describe("checkPayrollReadiness", () => {
  it("flags every step incomplete when tables are empty", async () => {
    const sb = makeFakeSupabase({});
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(false);
    expect(r.steps).toEqual({
      payItems: false,
      payDates: false,
      overtimeRates: false,
      currency: false,
    });
  });

  it("marks all steps complete when everything is configured", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(true);
  });

  it("treats invalid currency codes as missing", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "XX", country_code: COUNTRY }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.steps.currency).toBe(false);
    expect(r.allComplete).toBe(false);
  });

  it("ignores inactive pay items when deciding readiness", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: false }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
    });
    const r = await checkPayrollReadiness(sb as any, TENANT);
    expect(r.steps.payItems).toBe(false);
    expect(r.allComplete).toBe(false);
  });
});

describe("checkOvertimeReadiness", () => {
  it("returns hasRates=false when none are configured", async () => {
    const sb = makeFakeSupabase({
      tenants: [{ id: TENANT, country_code: COUNTRY }],
      overtime_penalty_rates: [],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r).toEqual({ hasRates: false, rateCount: 0, allComplete: false });
  });

  it("returns hasRates=true when at least one rate exists", async () => {
    const sb = makeFakeSupabase({
      tenants: [{ id: TENANT, country_code: COUNTRY }],
      overtime_penalty_rates: [
        { id: "ot1", country_code: COUNTRY, is_active: true },
        { id: "ot2", country_code: COUNTRY, is_active: true },
      ],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r.hasRates).toBe(true);
    expect(r.allComplete).toBe(true);
    expect(r.rateCount).toBeGreaterThanOrEqual(2);
  });

  it("excludes rates belonging to another country", async () => {
    // Overtime rates are keyed by COUNTRY, not tenant: two Australian tenants
    // share the same rows, and a Nepali tenant sees none of them. The previous
    // version of this test filed rates under `tenant_id: "other-tenant"` and
    // asserted allComplete === false — which passed, but only because a tenant
    // fixture with no `country_code` makes checkOvertimeReadiness return early.
    // It was green for a reason unrelated to what it claimed to check.
    const sb = makeFakeSupabase({
      tenants: [{ id: TENANT, country_code: COUNTRY }],
      overtime_penalty_rates: [{ id: "ot1", country_code: "NP", is_active: true }],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r.allComplete).toBe(false);
  });

  it("is not ready when the tenant has no country at all", async () => {
    // A tenant with no country cannot resolve a rate table, so readiness is
    // false — and this is now asserted deliberately rather than relied on as a
    // side effect of an incomplete fixture.
    const sb = makeFakeSupabase({
      tenants: [{ id: TENANT }],
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
    });
    const r = await checkOvertimeReadiness(sb as any, TENANT);
    expect(r).toEqual({ hasRates: false, rateCount: 0, allComplete: false });
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
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 0,
          accrual_per_month: 0,
          requires_approval: false,
        },
      ],
      user_roles: [],
    });
    const r = await checkLeaveReadiness(sb as any, TENANT);
    expect(r.steps.accruals).toBe(false);
  });

  it("passes accruals when annual quota is non-zero", async () => {
    const sb = makeFakeSupabase({
      leave_types: [
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: false,
        },
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
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: true,
        },
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
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: true,
        },
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
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
      leave_types: [
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: false,
        },
      ],
      user_roles: [],
    });
    expect(await gate(sb)).toEqual({ ok: false, reason: "payroll" });
  });

  it("blocks when overtime is missing even if payroll-core + leave are fine", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
      leave_types: [
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: false,
        },
      ],
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
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
      leave_types: [],
      user_roles: [],
    });
    expect(await gate(sb)).toEqual({ ok: false, reason: "leave" });
  });

  it("permits invitations only when every section is complete", async () => {
    const sb = makeFakeSupabase({
      payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
      tenant_payroll_settings: [{ tenant_id: TENANT, pay_period: "monthly" }],
      overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
      tenants: [{ id: TENANT, currency_code: "USD", country_code: COUNTRY }],
      leave_types: [
        {
          id: "lt1",
          tenant_id: TENANT,
          is_active: true,
          annual_quota_days: 20,
          accrual_per_month: 0,
          requires_approval: true,
        },
      ],
      user_roles: [{ user_id: "u1", role: "manager", tenant_id: TENANT }],
    });
    expect(await gate(sb)).toEqual({ ok: true, reason: null });
  });
});
