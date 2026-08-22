import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
async function getRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
function ensureAccess(roles) {
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
}
const getOrgAnalytics_createServerFn_handler = createServerRpc({
  id: "f078a7b520eb504621e52866a950164fd13d355039caaa2df619b00598d852b7",
  name: "getOrgAnalytics",
  filename: "src/lib/analytics.functions.ts"
}, (opts) => getOrgAnalytics.__executeServer(opts));
const getOrgAnalytics = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  monthsBack: numberType().int().min(1).max(36).default(6)
}).parse(d)).handler(getOrgAnalytics_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  ensureAccess(roles);
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const tenantId = prof.tenant_id;
  const from = /* @__PURE__ */ new Date();
  from.setUTCMonth(from.getUTCMonth() - (data.monthsBack - 1));
  from.setUTCDate(1);
  from.setUTCHours(0, 0, 0, 0);
  const fromIso = from.toISOString().slice(0, 10);
  const [empRes, deptRes, onbRes, revRes, cycleRes, leaveRes, ltRes, tsRes, runsRes, trainRes, expRes] = await Promise.all([supabase.from("employees").select("id,status,department_id,hire_date,termination_date").eq("tenant_id", tenantId), supabase.from("departments").select("id,name").eq("tenant_id", tenantId), supabase.from("onboarding_assignments").select("status").eq("tenant_id", tenantId), supabase.from("performance_reviews").select("status,cycle_id").eq("tenant_id", tenantId), supabase.from("review_cycles").select("id,name,period_start").eq("tenant_id", tenantId).order("period_start", {
    ascending: false
  }).limit(1), supabase.from("leave_requests").select("status,days,leave_type_id,start_date").eq("tenant_id", tenantId).gte("start_date", fromIso), supabase.from("leave_types").select("id,name").eq("tenant_id", tenantId), supabase.from("timesheets").select("status,period_start").eq("tenant_id", tenantId).gte("period_start", fromIso), supabase.from("payroll_runs").select("id,pay_date,status,base_currency_code,totals").eq("tenant_id", tenantId).gte("pay_date", fromIso).eq("status", "approved"), supabase.from("training_enrollments").select("status,completed_at,assigned_at").eq("tenant_id", tenantId).gte("assigned_at", from.toISOString()), supabase.from("expense_claims").select("status,total_amount,currency,submitted_at,approved_at,created_at").eq("tenant_id", tenantId).gte("created_at", from.toISOString())]);
  const emps = empRes.data ?? [];
  const depts = deptRes.data ?? [];
  const deptMap = new Map(depts.map((d) => [d.id, d.name]));
  const deptHeadcount = /* @__PURE__ */ new Map();
  emps.filter((e) => e.status === "active").forEach((e) => {
    const key = e.department_id ?? "__unassigned";
    deptHeadcount.set(key, (deptHeadcount.get(key) ?? 0) + 1);
  });
  const byDepartment = Array.from(deptHeadcount.entries()).map(([id, count]) => ({
    name: id === "__unassigned" ? "Unassigned" : deptMap.get(id) ?? "Unknown",
    count
  })).sort((a, b) => b.count - a.count);
  const onb = onbRes.data ?? [];
  const onboarding = {
    total: onb.length,
    in_progress: onb.filter((a) => a.status === "in_progress").length,
    completed: onb.filter((a) => a.status === "completed").length,
    signed_off: onb.filter((a) => a.status === "signed_off").length,
    cancelled: onb.filter((a) => a.status === "cancelled").length
  };
  const onboardingCompletionRate = onb.length ? Math.round((onboarding.completed + onboarding.signed_off) / onb.length * 100) : 0;
  const latestCycle = (cycleRes.data ?? [])[0];
  const reviews = (revRes.data ?? []).filter((r) => !latestCycle || r.cycle_id === latestCycle.id);
  const reviewStatus = reviews.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const reviewMix = Object.entries(reviewStatus).map(([name, value]) => ({
    name,
    value
  }));
  const ltMap = new Map((ltRes.data ?? []).map((l) => [l.id, l.name]));
  const leaveByType = /* @__PURE__ */ new Map();
  (leaveRes.data ?? []).forEach((r) => {
    if (r.status !== "approved") return;
    const name = ltMap.get(r.leave_type_id) ?? "Other";
    leaveByType.set(name, (leaveByType.get(name) ?? 0) + Number(r.days ?? 0));
  });
  const leaveBreakdown = Array.from(leaveByType.entries()).map(([name, days]) => ({
    name,
    days: Math.round(days * 10) / 10
  })).sort((a, b) => b.days - a.days);
  const ts = tsRes.data ?? [];
  const timesheetStatus = ts.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const timesheetMix = Object.entries(timesheetStatus).map(([name, value]) => ({
    name,
    value
  }));
  const terminations = emps.filter((e) => {
    if (!e.termination_date) return false;
    return e.termination_date >= fromIso;
  }).length;
  const active = emps.filter((e) => e.status === "active").length;
  const attritionRate = active ? Math.round(terminations / active * 1e3) / 10 : 0;
  const months = [];
  {
    const cursor = new Date(from);
    const end = /* @__PURE__ */ new Date();
    while (cursor <= end) {
      const y = cursor.getUTCFullYear();
      const m = cursor.getUTCMonth();
      const start = new Date(Date.UTC(y, m, 1));
      const next = new Date(Date.UTC(y, m + 1, 1));
      months.push({
        key: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: start.toLocaleString("en", {
          month: "short",
          year: "2-digit"
        }),
        start,
        end: next
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }
  const headcountTrend = months.map((b) => {
    const endIso = b.end.toISOString().slice(0, 10);
    const count = emps.filter((e) => {
      if (!e.hire_date || e.hire_date > endIso) return false;
      if (e.termination_date && e.termination_date < endIso) return false;
      return true;
    }).length;
    return {
      month: b.label,
      headcount: count
    };
  });
  const payrollByMonth = /* @__PURE__ */ new Map();
  let payrollCurrency = "";
  (runsRes.data ?? []).forEach((r) => {
    const d = new Date(r.pay_date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const net = Number(r.totals?.net_pay ?? r.totals?.netPay ?? r.totals?.total_net ?? 0);
    payrollByMonth.set(key, (payrollByMonth.get(key) ?? 0) + net);
    if (!payrollCurrency) payrollCurrency = r.base_currency_code;
  });
  const payrollTrend = months.map((b) => ({
    month: b.label,
    amount: Math.round((payrollByMonth.get(b.key) ?? 0) * 100) / 100
  }));
  const trainRows = trainRes.data ?? [];
  const trainStatus = trainRows.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const trainingMix = Object.entries(trainStatus).map(([name, value]) => ({
    name,
    value
  }));
  const trainingCompletionRate = trainRows.length ? Math.round((trainStatus["completed"] ?? 0) / trainRows.length * 100) : 0;
  const expByMonth = /* @__PURE__ */ new Map();
  let expenseCurrency = "";
  (expRes.data ?? []).forEach((c) => {
    if (!["approved", "paid"].includes(c.status)) return;
    const ts2 = c.approved_at || c.submitted_at || c.created_at;
    if (!ts2) return;
    const d = new Date(ts2);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    expByMonth.set(key, (expByMonth.get(key) ?? 0) + Number(c.total_amount ?? 0));
    if (!expenseCurrency) expenseCurrency = c.currency;
  });
  const expenseTrend = months.map((b) => ({
    month: b.label,
    amount: Math.round((expByMonth.get(b.key) ?? 0) * 100) / 100
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
      expenseCurrency
    },
    byDepartment,
    onboarding,
    reviewMix,
    leaveBreakdown,
    timesheetMix,
    headcountTrend,
    payrollTrend,
    trainingMix,
    expenseTrend
  };
});
export {
  getOrgAnalytics_createServerFn_handler
};
