import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

function ensureAccess(roles: string[]) {
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
}

/**
 * Cross-module analytics dashboard data:
 * - Department headcount distribution
 * - Onboarding completion funnel
 * - Performance review status mix (current/most recent cycle)
 * - Leave type usage breakdown (approved days)
 * - Timesheet approval status mix
 * - Attrition rate (last N months)
 */
export const getOrgAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ monthsBack: z.number().int().min(1).max(36).default(6) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    ensureAccess(roles);
    const { data: prof } = await supabase
      .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    const tenantId = prof.tenant_id;

    const from = new Date();
    from.setUTCMonth(from.getUTCMonth() - (data.monthsBack - 1));
    from.setUTCDate(1); from.setUTCHours(0, 0, 0, 0);
    const fromIso = from.toISOString().slice(0, 10);

    const [empRes, deptRes, onbRes, revRes, cycleRes, leaveRes, ltRes, tsRes, runsRes, trainRes, expRes] = await Promise.all([
      supabase.from("employees").select("id,status,department_id,hire_date,termination_date").eq("tenant_id", tenantId),
      supabase.from("departments").select("id,name").eq("tenant_id", tenantId),
      supabase.from("onboarding_assignments").select("status").eq("tenant_id", tenantId),
      supabase.from("performance_reviews").select("status,cycle_id").eq("tenant_id", tenantId),
      supabase.from("review_cycles").select("id,name,period_start").eq("tenant_id", tenantId).order("period_start", { ascending: false }).limit(1),
      supabase.from("leave_requests").select("status,days,leave_type_id,start_date").eq("tenant_id", tenantId).gte("start_date", fromIso),
      supabase.from("leave_types").select("id,name").eq("tenant_id", tenantId),
      supabase.from("timesheets").select("status,period_start").eq("tenant_id", tenantId).gte("period_start", fromIso),
      supabase.from("payroll_runs").select("id,pay_date,status,base_currency_code,totals").eq("tenant_id", tenantId).gte("pay_date", fromIso).eq("status", "approved"),
      supabase.from("training_enrollments").select("status,completed_at,assigned_at").eq("tenant_id", tenantId).gte("assigned_at", from.toISOString()),
      supabase.from("expense_claims").select("status,total_amount,currency,submitted_at,approved_at,created_at").eq("tenant_id", tenantId).gte("created_at", from.toISOString()),
    ]);

    const emps = empRes.data ?? [];
    const depts = deptRes.data ?? [];
    const deptMap = new Map<string, string>(depts.map((d: any) => [d.id, d.name]));

    // Department headcount (active employees only)
    const deptHeadcount = new Map<string, number>();
    emps.filter((e: any) => e.status === "active").forEach((e: any) => {
      const key = e.department_id ?? "__unassigned";
      deptHeadcount.set(key, (deptHeadcount.get(key) ?? 0) + 1);
    });
    const byDepartment = Array.from(deptHeadcount.entries()).map(([id, count]) => ({
      name: id === "__unassigned" ? "Unassigned" : (deptMap.get(id) ?? "Unknown"),
      count,
    })).sort((a, b) => b.count - a.count);

    // Onboarding funnel
    const onb = onbRes.data ?? [];
    const onboarding = {
      total: onb.length,
      in_progress: onb.filter((a: any) => a.status === "in_progress").length,
      completed: onb.filter((a: any) => a.status === "completed").length,
      signed_off: onb.filter((a: any) => a.status === "signed_off").length,
      cancelled: onb.filter((a: any) => a.status === "cancelled").length,
    };
    const onboardingCompletionRate = onb.length
      ? Math.round(((onboarding.completed + onboarding.signed_off) / onb.length) * 100)
      : 0;

    // Performance reviews for most recent cycle
    const latestCycle = (cycleRes.data ?? [])[0];
    const reviews = (revRes.data ?? []).filter((r: any) => !latestCycle || r.cycle_id === latestCycle.id);
    const reviewStatus = reviews.reduce((acc: Record<string, number>, r: any) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
    const reviewMix = Object.entries(reviewStatus).map(([name, value]) => ({ name, value }));

    // Leave by type (approved days)
    const ltMap = new Map<string, string>((ltRes.data ?? []).map((l: any) => [l.id, l.name]));
    const leaveByType = new Map<string, number>();
    (leaveRes.data ?? []).forEach((r: any) => {
      if (r.status !== "approved") return;
      const name = ltMap.get(r.leave_type_id) ?? "Other";
      leaveByType.set(name, (leaveByType.get(name) ?? 0) + Number(r.days ?? 0));
    });
    const leaveBreakdown = Array.from(leaveByType.entries())
      .map(([name, days]) => ({ name, days: Math.round(days * 10) / 10 }))
      .sort((a, b) => b.days - a.days);

    // Timesheet status mix
    const ts = tsRes.data ?? [];
    const timesheetStatus = ts.reduce((acc: Record<string, number>, t: any) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});
    const timesheetMix = Object.entries(timesheetStatus).map(([name, value]) => ({ name, value }));

    // Attrition: terminations in window / avg active headcount
    const terminations = emps.filter((e: any) => {
      if (!e.termination_date) return false;
      return e.termination_date >= fromIso;
    }).length;
    const active = emps.filter((e: any) => e.status === "active").length;
    const attritionRate = active ? Math.round((terminations / active) * 1000) / 10 : 0;

    // Build month buckets between (from .. now)
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    {
      const cursor = new Date(from);
      const end = new Date();
      while (cursor <= end) {
        const y = cursor.getUTCFullYear();
        const m = cursor.getUTCMonth();
        const start = new Date(Date.UTC(y, m, 1));
        const next = new Date(Date.UTC(y, m + 1, 1));
        months.push({
          key: `${y}-${String(m + 1).padStart(2, "0")}`,
          label: start.toLocaleString("en", { month: "short", year: "2-digit" }),
          start,
          end: next,
        });
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }

    // Headcount trend: active count at month-end (hire_date <= end AND (no termination OR termination > end))
    const headcountTrend = months.map((b) => {
      const endIso = b.end.toISOString().slice(0, 10);
      const count = emps.filter((e: any) => {
        if (!e.hire_date || e.hire_date > endIso) return false;
        if (e.termination_date && e.termination_date < endIso) return false;
        return true;
      }).length;
      return { month: b.label, headcount: count };
    });

    // Payroll cost trend: sum net_pay per pay-date month (from totals.net_pay or 0)
    const payrollByMonth = new Map<string, number>();
    let payrollCurrency = "";
    (runsRes.data ?? []).forEach((r: any) => {
      const d = new Date(r.pay_date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const net = Number(r.totals?.net_pay ?? r.totals?.netPay ?? r.totals?.total_net ?? 0);
      payrollByMonth.set(key, (payrollByMonth.get(key) ?? 0) + net);
      if (!payrollCurrency) payrollCurrency = r.base_currency_code;
    });
    const payrollTrend = months.map((b) => ({
      month: b.label,
      amount: Math.round((payrollByMonth.get(b.key) ?? 0) * 100) / 100,
    }));

    // Training: status mix + completion rate
    const trainRows = trainRes.data ?? [];
    const trainStatus = trainRows.reduce((acc: Record<string, number>, t: any) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});
    const trainingMix = Object.entries(trainStatus).map(([name, value]) => ({ name, value }));
    const trainingCompletionRate = trainRows.length
      ? Math.round(((trainStatus["completed"] ?? 0) / trainRows.length) * 100)
      : 0;

    // Expense spend trend (approved + paid) per month based on approved_at or submitted_at fallback
    const expByMonth = new Map<string, number>();
    let expenseCurrency = "";
    (expRes.data ?? []).forEach((c: any) => {
      if (!["approved", "paid"].includes(c.status)) return;
      const ts = c.approved_at || c.submitted_at || c.created_at;
      if (!ts) return;
      const d = new Date(ts);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      expByMonth.set(key, (expByMonth.get(key) ?? 0) + Number(c.total_amount ?? 0));
      if (!expenseCurrency) expenseCurrency = c.currency;
    });
    const expenseTrend = months.map((b) => ({
      month: b.label,
      amount: Math.round((expByMonth.get(b.key) ?? 0) * 100) / 100,
    }));

    return {
      kpis: {
        activeHeadcount: active,
        onboardingCompletionRate,
        terminationsInWindow: terminations,
        attritionRate,
        latestCycleName: latestCycle?.name ?? null,
        trainingCompletionRate,
        payrollTotalInWindow: Math.round(Array.from(payrollByMonth.values()).reduce((a, b) => a + b, 0) * 100) / 100,
        payrollCurrency,
        expenseTotalInWindow: Math.round(Array.from(expByMonth.values()).reduce((a, b) => a + b, 0) * 100) / 100,
        expenseCurrency,
      },
      byDepartment,
      onboarding,
      reviewMix,
      leaveBreakdown,
      timesheetMix,
      headcountTrend,
      payrollTrend,
      trainingMix,
      expenseTrend,
    };
  });
