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
function monthKey(d) {
  const x = new Date(d);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`;
}
const getOrgReports_createServerFn_handler = createServerRpc({
  id: "d7e10a83ce977fbadc14fe63b74e4b07b0b56694b2686c8e820e5b6daf782045",
  name: "getOrgReports",
  filename: "src/lib/reports.functions.ts"
}, (opts) => getOrgReports.__executeServer(opts));
const getOrgReports = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  monthsBack: numberType().int().min(1).max(36).default(6)
}).parse(d)).handler(getOrgReports_createServerFn_handler, async ({
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
  const [empRes, runsRes, leaveRes, tsRes] = await Promise.all([supabase.from("employees").select("id,status,hire_date,termination_date,department_id,base_salary").eq("tenant_id", tenantId), supabase.from("payroll_runs").select("id,pay_date,status,totals,currency_code").eq("tenant_id", tenantId).gte("pay_date", fromIso), supabase.from("leave_requests").select("status,start_date,days").eq("tenant_id", tenantId).gte("start_date", fromIso), supabase.from("timesheets").select("status,period_start,total_hours,overtime_hours").eq("tenant_id", tenantId).gte("period_start", fromIso)]);
  const emps = empRes.data ?? [];
  const active = emps.filter((e) => e.status === "active");
  const headcount = active.length;
  const totalSalary = active.reduce((s, e) => s + Number(e.base_salary ?? 0), 0);
  const months = [];
  for (let i = 0; i < data.monthsBack; i++) {
    const m = new Date(from);
    m.setUTCMonth(m.getUTCMonth() + i);
    months.push(monthKey(m));
  }
  const mkBuckets = () => Object.fromEntries(months.map((m) => [m, 0]));
  const hires = mkBuckets();
  const terminations = mkBuckets();
  emps.forEach((e) => {
    const h = e.hire_date ? monthKey(e.hire_date) : null;
    if (h && h in hires) hires[h] += 1;
    const t = e.termination_date ? monthKey(e.termination_date) : null;
    if (t && t in terminations) terminations[t] += 1;
  });
  const payrollCost = mkBuckets();
  let currency = "USD";
  (runsRes.data ?? []).forEach((r) => {
    if (r.status !== "approved") return;
    const k = monthKey(r.pay_date);
    if (!(k in payrollCost)) return;
    const gross = Number(r.totals?.gross ?? 0);
    payrollCost[k] += gross;
    if (r.currency_code) currency = r.currency_code;
  });
  const leaveDays = mkBuckets();
  let pendingRequests = 0;
  (leaveRes.data ?? []).forEach((r) => {
    if (r.status === "pending") pendingRequests += 1;
    if (r.status !== "approved") return;
    const k = monthKey(r.start_date);
    if (k in leaveDays) leaveDays[k] += Number(r.days ?? 0);
  });
  const overtime = mkBuckets();
  (tsRes.data ?? []).forEach((t) => {
    if (t.status !== "approved") return;
    const k = monthKey(t.period_start);
    if (k in overtime) overtime[k] += Number(t.overtime_hours ?? 0);
  });
  const series = months.map((m) => ({
    month: m,
    hires: hires[m],
    terminations: terminations[m],
    payrollCost: Math.round(payrollCost[m] * 100) / 100,
    leaveDays: Math.round(leaveDays[m] * 10) / 10,
    overtimeHours: Math.round(overtime[m] * 10) / 10
  }));
  return {
    kpis: {
      headcount,
      monthlySalaryBill: Math.round(totalSalary * 100) / 100,
      pendingLeaveRequests: pendingRequests,
      overtimeLast: series.at(-1)?.overtimeHours ?? 0,
      currency
    },
    series
  };
});
export {
  getOrgReports_createServerFn_handler
};
