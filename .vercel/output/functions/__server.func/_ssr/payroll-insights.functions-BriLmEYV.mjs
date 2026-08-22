import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
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
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function assertTenantAccess(supabase, userId, tenantId) {
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const rs = (roles ?? []).map((r) => r.role);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("org_admin") && !rs.includes("manager")) {
    throw new Error("Forbidden: org admin or manager role required");
  }
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}
const getRunVariance_createServerFn_handler = createServerRpc({
  id: "618f951b5bb5c1cef011a9313b3da731ea10c67a54e30fa84df54ef0f84b3f3f",
  name: "getRunVariance",
  filename: "src/lib/payroll-insights.functions.ts"
}, (opts) => getRunVariance.__executeServer(opts));
const getRunVariance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(getRunVariance_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: current
  } = await admin.from("payroll_runs").select("*").eq("id", data.runId).maybeSingle();
  if (!current) throw new Error("Run not found");
  await assertTenantAccess(supabase, userId, current.tenant_id);
  const {
    data: priorRows
  } = await admin.from("payroll_runs").select("*").eq("tenant_id", current.tenant_id).eq("status", "approved").lt("pay_date", current.pay_date).order("pay_date", {
    ascending: false
  }).limit(1);
  const prior = priorRows && priorRows.length > 0 ? priorRows[0] : null;
  const {
    data: curSlips
  } = await admin.from("payroll_payslips").select("employee_id,gross,net_pay,income_tax,employee_contributions,allowances,deductions").eq("run_id", current.id);
  const prevMap = /* @__PURE__ */ new Map();
  if (prior) {
    const {
      data: prevSlips
    } = await admin.from("payroll_payslips").select("employee_id,gross,net_pay").eq("run_id", prior.id);
    (prevSlips ?? []).forEach((p) => prevMap.set(p.employee_id, p));
  }
  const empIds = Array.from(new Set((curSlips ?? []).map((p) => p.employee_id)));
  const {
    data: emps
  } = empIds.length ? await admin.from("employees").select("id,first_name,last_name,employee_number").in("id", empIds) : {
    data: []
  };
  const empMap = /* @__PURE__ */ new Map();
  (emps ?? []).forEach((e) => empMap.set(e.id, e));
  const rows = [];
  let newCount = 0;
  let bigDeltaCount = 0;
  const BIG_DELTA_PCT = 20;
  for (const cs of curSlips ?? []) {
    const ps = prevMap.get(cs.employee_id);
    const prevNet = ps ? Number(ps.net_pay) : null;
    const curNet = Number(cs.net_pay);
    const delta = prevNet == null ? null : curNet - prevNet;
    const pct = prevNet == null || prevNet === 0 ? null : (curNet - prevNet) / prevNet * 100;
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
      is_new: isNew
    });
  }
  const droppedIds = [];
  for (const id of prevMap.keys()) {
    if (!(curSlips ?? []).some((c) => c.employee_id === id)) droppedIds.push(id);
  }
  const curTotals = current.totals ?? {};
  const priorTotals = prior?.totals ?? {};
  const totalsDelta = {};
  for (const k of ["gross", "income_tax", "employee_contributions", "employer_contributions", "allowances", "deductions", "net_pay"]) {
    const cur = Number(curTotals[k] ?? 0);
    const prev = prior ? Number(priorTotals[k] ?? 0) : null;
    const delta = prev == null ? null : cur - prev;
    const pct = prev == null || prev === 0 ? null : (cur - prev) / prev * 100;
    totalsDelta[k] = {
      prev,
      cur,
      delta,
      pct
    };
  }
  return {
    prior_run: prior ? {
      id: prior.id,
      period_start: prior.period_start,
      period_end: prior.period_end,
      pay_date: prior.pay_date,
      employee_count: priorTotals.employee_count ?? null
    } : null,
    currency_code: current.currency_code,
    rows: rows.sort((a, b) => Math.abs(b.pct ?? 0) - Math.abs(a.pct ?? 0)),
    dropped_employee_ids: droppedIds,
    summary: {
      employee_count_current: rows.length,
      employee_count_prior: prior ? priorTotals.employee_count ?? prevMap.size : null,
      new_employees: newCount,
      dropped_employees: droppedIds.length,
      large_delta_count: bigDeltaCount,
      large_delta_threshold_pct: BIG_DELTA_PCT
    },
    totals: totalsDelta
  };
});
const getRunDistribution_createServerFn_handler = createServerRpc({
  id: "ac342f06bed4dcf68429bfe8ea70518cc2ba0b42cde8507ac8384b823b07391a",
  name: "getRunDistribution",
  filename: "src/lib/payroll-insights.functions.ts"
}, (opts) => getRunDistribution.__executeServer(opts));
const getRunDistribution = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  runId: stringType().uuid()
}).parse(d)).handler(getRunDistribution_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: run
  } = await admin.from("payroll_runs").select("tenant_id").eq("id", data.runId).maybeSingle();
  if (!run) throw new Error("Run not found");
  await assertTenantAccess(supabase, userId, run.tenant_id);
  const {
    data: slips
  } = await admin.from("payroll_payslips").select("id").eq("run_id", data.runId);
  const payslipIds = (slips ?? []).map((s) => s.id);
  if (payslipIds.length === 0) {
    return {
      distribution: {}
    };
  }
  const {
    data: logs
  } = await admin.from("audit_log").select("entity_id,action,created_at").eq("entity_type", "payslip").in("entity_id", payslipIds).in("action", ["payslip_emailed", "payslip_email_resent"]).order("created_at", {
    ascending: false
  });
  const distribution = {};
  for (const id of payslipIds) distribution[id] = {
    count: 0,
    last_at: null,
    last_action: null
  };
  for (const row of logs ?? []) {
    const slot = distribution[row.entity_id];
    if (!slot) continue;
    slot.count += 1;
    if (!slot.last_at) {
      slot.last_at = row.created_at;
      slot.last_action = row.action;
    }
  }
  return {
    distribution
  };
});
export {
  getRunDistribution_createServerFn_handler,
  getRunVariance_createServerFn_handler
};
