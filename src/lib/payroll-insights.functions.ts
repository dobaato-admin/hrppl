import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertTenantAccess(supabase: any, userId: string, tenantId: string) {
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r: any) => r.role);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("org_admin") && !rs.includes("manager")) {
    throw new Error("Forbidden: org admin or manager role required");
  }
  const callerTenant = await getTenantId(supabase, userId);
  if (!callerTenant || callerTenant !== tenantId) throw new Error("Forbidden: tenant mismatch");
}

// ---------- Variance: compare a run to the previous approved run ----------
export const getRunVariance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();

    const { data: current } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
    if (!current) throw new Error("Run not found");
    await assertTenantAccess(supabase, userId, current.tenant_id);

    // Find the most recent approved run with an earlier pay_date for the same tenant
    const { data: priorRows } = await admin
      .from("payroll_runs")
      .select("*")
      .eq("tenant_id", current.tenant_id)
      .eq("status", "approved")
      .lt("pay_date", current.pay_date)
      .order("pay_date", { ascending: false })
      .limit(1);
    const prior = priorRows && priorRows.length > 0 ? priorRows[0] : null;

    const { data: curSlips } = await admin
      .from("payroll_payslips")
      .select("employee_id,gross,net_pay,income_tax,employee_contributions,allowances,deductions")
      .eq("run_id", current.id);

    const prevMap = new Map<string, any>();
    if (prior) {
      const { data: prevSlips } = await admin
        .from("payroll_payslips")
        .select("employee_id,gross,net_pay")
        .eq("run_id", prior.id);
      (prevSlips ?? []).forEach((p: any) => prevMap.set(p.employee_id, p));
    }

    const empIds = Array.from(new Set((curSlips ?? []).map((p: any) => p.employee_id)));
    const { data: emps } = empIds.length
      ? await admin.from("employees").select("id,first_name,last_name,employee_number").in("id", empIds)
      : { data: [] as any[] };
    const empMap = new Map<string, any>();
    (emps ?? []).forEach((e: any) => empMap.set(e.id, e));

    const rows: any[] = [];
    let newCount = 0;
    let bigDeltaCount = 0;
    const BIG_DELTA_PCT = 20;

    for (const cs of curSlips ?? []) {
      const ps = prevMap.get(cs.employee_id);
      const prevNet = ps ? Number(ps.net_pay) : null;
      const curNet = Number(cs.net_pay);
      const delta = prevNet == null ? null : curNet - prevNet;
      const pct = prevNet == null || prevNet === 0 ? null : ((curNet - prevNet) / prevNet) * 100;
      const isNew = prevNet == null;
      if (isNew) newCount++;
      if (pct != null && Math.abs(pct) >= BIG_DELTA_PCT) bigDeltaCount++;
      const e = empMap.get(cs.employee_id);
      rows.push({
        employee_id: cs.employee_id,
        employee_name: e ? `${e.first_name} ${e.last_name}` : cs.employee_id,
        employee_number: e?.employee_number ?? "",
        prev_net: prevNet,
        cur_net: curNet,
        delta,
        pct,
        is_new: isNew,
      });
    }

    // Detect employees who were paid previously but not now
    const droppedIds: string[] = [];
    for (const id of prevMap.keys()) {
      if (!(curSlips ?? []).some((c: any) => c.employee_id === id)) droppedIds.push(id);
    }

    const curTotals = (current.totals ?? {}) as Record<string, any>;
    const priorTotals = (prior?.totals ?? {}) as Record<string, any>;
    const totalsDelta: Record<string, { prev: number | null; cur: number; delta: number | null; pct: number | null }> = {};
    for (const k of ["gross", "income_tax", "employee_contributions", "employer_contributions", "allowances", "deductions", "net_pay"] as const) {
      const cur = Number(curTotals[k] ?? 0);
      const prev = prior ? Number(priorTotals[k] ?? 0) : null;
      const delta = prev == null ? null : cur - prev;
      const pct = prev == null || prev === 0 ? null : ((cur - prev) / prev) * 100;
      totalsDelta[k] = { prev, cur, delta, pct };
    }

    return {
      prior_run: prior
        ? { id: prior.id, period_start: prior.period_start, period_end: prior.period_end, pay_date: prior.pay_date, employee_count: (priorTotals.employee_count as number | undefined) ?? null }
        : null,
      currency_code: current.currency_code,
      rows: rows.sort((a, b) => Math.abs(b.pct ?? 0) - Math.abs(a.pct ?? 0)),
      dropped_employee_ids: droppedIds,
      summary: {
        employee_count_current: rows.length,
        employee_count_prior: prior ? ((priorTotals.employee_count as number | undefined) ?? prevMap.size) : null,
        new_employees: newCount,
        dropped_employees: droppedIds.length,
        large_delta_count: bigDeltaCount,
        large_delta_threshold_pct: BIG_DELTA_PCT,
      },
      totals: totalsDelta,
    };
  });

// ---------- Distribution status: last email per payslip from audit_log ----------
export const getRunDistribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ runId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();

    const { data: run } = await admin.from("payroll_runs").select("tenant_id").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    await assertTenantAccess(supabase, userId, run.tenant_id);

    const { data: slips } = await admin
      .from("payroll_payslips")
      .select("id")
      .eq("run_id", data.runId);
    const payslipIds = (slips ?? []).map((s: any) => s.id);
    if (payslipIds.length === 0) {
      return { distribution: {} as Record<string, { count: number; last_at: string | null; last_action: string | null }> };
    }

    const { data: logs } = await admin
      .from("audit_log")
      .select("entity_id,action,created_at")
      .eq("entity_type", "payslip")
      .in("entity_id", payslipIds)
      .in("action", ["payslip_emailed", "payslip_email_resent"])
      .order("created_at", { ascending: false });

    const distribution: Record<string, { count: number; last_at: string | null; last_action: string | null }> = {};
    for (const id of payslipIds) distribution[id] = { count: 0, last_at: null, last_action: null };
    for (const row of logs ?? []) {
      const slot = distribution[row.entity_id as string];
      if (!slot) continue;
      slot.count += 1;
      if (!slot.last_at) {
        slot.last_at = row.created_at as string;
        slot.last_action = row.action as string;
      }
    }
    return { distribution };
  });

/**
 * Payroll cost over time, for the trend charts on /org/payroll.
 *
 * Returns raw per-run points rather than pre-bucketed totals: the grouping and
 * the cost view are things the reader changes constantly, and re-fetching for
 * each would make an exploratory screen feel broken. `src/lib/payroll-trends.ts`
 * does the arithmetic client-side, and is tested there.
 *
 * Only APPROVED runs count. A draft is a proposal and a pending run is an
 * unanswered question; putting either in a cost trend reports money as spent
 * that nobody has agreed to.
 */
export const getPayrollTrends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        /** Oldest pay date to include. Defaults to 24 months back. */
        from: z.string().optional(),
        includeExpenses: z.boolean().optional().default(true),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);

    const from =
      data.from ??
      (() => {
        const d = new Date();
        d.setUTCMonth(d.getUTCMonth() - 24);
        return d.toISOString().slice(0, 10);
      })();

    const { data: runs, error: runErr } = await supabase
      .from("payroll_runs")
      .select("id, pay_date, period_start, period_end, currency_code, status")
      .eq("tenant_id", tenantId)
      .eq("status", "approved")
      .gte("pay_date", from)
      .order("pay_date");
    if (runErr) {
      console.error("[payroll-trends] runs read failed", runErr);
      throw new Error("Could not load payroll history.");
    }

    const runIds = (runs ?? []).map((r: any) => r.id);
    const byRun = new Map<string, any>();
    if (runIds.length > 0) {
      const { data: slips, error: slipErr } = await supabase
        .from("payroll_payslips")
        .select("run_id, gross, income_tax, employee_contributions, employer_contributions, net_pay")
        .in("run_id", runIds);
      if (slipErr) {
        console.error("[payroll-trends] payslips read failed", slipErr);
        throw new Error("Could not load payroll history.");
      }
      for (const s of slips ?? []) {
        const agg = byRun.get(s.run_id) ?? {
          gross: 0,
          incomeTax: 0,
          employeeContributions: 0,
          employerContributions: 0,
          netPay: 0,
          headcount: 0,
        };
        agg.gross += Number(s.gross ?? 0);
        agg.incomeTax += Number(s.income_tax ?? 0);
        agg.employeeContributions += Number(s.employee_contributions ?? 0);
        agg.employerContributions += Number(s.employer_contributions ?? 0);
        agg.netPay += Number(s.net_pay ?? 0);
        agg.headcount += 1;
        byRun.set(s.run_id, agg);
      }
    }

    const points = (runs ?? []).map((r: any) => {
      const agg = byRun.get(r.id) ?? {
        gross: 0,
        incomeTax: 0,
        employeeContributions: 0,
        employerContributions: 0,
        netPay: 0,
        headcount: 0,
      };
      return {
        payDate: r.pay_date as string,
        periodStart: r.period_start as string,
        periodEnd: r.period_end as string,
        currency: (r.currency_code as string) ?? "",
        ...agg,
      };
    });

    // Reimbursed expenses, by the date they were actually paid. Unpaid claims
    // are a liability, not a cost that has left the business, so they are not
    // in this series — the same reason drafts are excluded above.
    let expenses: Array<{ paidDate: string; amount: number }> = [];
    if (data.includeExpenses) {
      const { data: claims, error: expErr } = await supabase
        .from("expense_claims")
        .select("paid_at, total_amount")
        .eq("tenant_id", tenantId)
        .not("paid_at", "is", null)
        .gte("paid_at", from);
      if (expErr) {
        // Not fatal: the payroll series is still worth showing. But the caller
        // must be able to tell "no expenses" from "we could not read them".
        console.error("[payroll-trends] expenses read failed", expErr);
        return { points, expenses: [], expensesKnown: false, currency: points[0]?.currency ?? "" };
      }
      expenses = (claims ?? []).map((c: any) => ({
        paidDate: String(c.paid_at).slice(0, 10),
        amount: Number(c.total_amount ?? 0),
      }));
    }

    return {
      points,
      expenses,
      expensesKnown: data.includeExpenses,
      currency: points[0]?.currency ?? "",
    };
  });
