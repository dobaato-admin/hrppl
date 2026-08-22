import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
const getAuStpAudit_createServerFn_handler = createServerRpc({
  id: "37ff8749f71134bd639040e742b4f79fbfd9c98758bc4f436945ae243c651ab2",
  name: "getAuStpAudit",
  filename: "src/lib/au-stp-audit.functions.ts"
}, (opts) => getAuStpAudit.__executeServer(opts));
const getAuStpAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getAuStpAudit_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    data: tenant
  } = await supabase.from("tenants").select("id, name, country_code").eq("id", prof.tenant_id).maybeSingle();
  if (!tenant) throw new Error("Tenant not found");
  if (tenant.country_code !== "AU") {
    return {
      ok: false,
      reason: "Tenant is not configured for Australia",
      tenant
    };
  }
  const {
    data: isAdmin
  } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: tenant.id
  });
  if (!isAdmin) throw new Error("Forbidden: org admin required");
  const {
    data: settings
  } = await supabase.from("tenant_payroll_settings").select("abn, branch_code, bms_id, stp_gateway, stp_gateway_config, payday_super_enabled, default_super_fund_id").eq("tenant_id", tenant.id).maybeSingle();
  const s = settings ?? {};
  const employer = {
    abn: {
      value: s.abn ?? null,
      ok: !!s.abn,
      label: "ABN"
    },
    branch_code: {
      value: s.branch_code ?? null,
      ok: !!s.branch_code,
      label: "Branch code (default 001)"
    },
    bms_id: {
      value: s.bms_id ?? null,
      ok: !!s.bms_id,
      label: "BMS ID (Business Management Software ID)"
    },
    stp_gateway: {
      value: s.stp_gateway ?? "manual",
      ok: !!s.stp_gateway && s.stp_gateway !== "manual",
      label: "STP submission gateway"
    },
    default_super_fund: {
      value: s.default_super_fund_id ?? null,
      ok: !!s.default_super_fund_id,
      label: "Default super fund (stapled fallback)"
    }
  };
  const employerReady = Object.values(employer).every((v) => v.ok);
  const {
    data: emps
  } = await supabase.from("employees").select("id, first_name, last_name, employee_number, status, hire_date, tfn_status, income_type, employment_basis, tax_treatment_code, cessation_reason_code").eq("tenant_id", tenant.id).neq("status", "terminated").limit(2e3);
  const empGaps = (emps ?? []).map((e) => {
    const missing = [];
    if (!e.tfn_status || e.tfn_status === "unknown") missing.push("TFN status");
    if (!e.income_type) missing.push("Income type (SAW/CHP/WHM/SWP/VOL)");
    if (!e.employment_basis) missing.push("Employment basis (F/P/C/L/N/D)");
    if (!e.tax_treatment_code) missing.push("Tax treatment code (6-char)");
    return {
      id: e.id,
      name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
      employee_number: e.employee_number,
      missing
    };
  });
  const empWithGaps = empGaps.filter((e) => e.missing.length > 0);
  const empIds = (emps ?? []).map((e) => e.id);
  const {
    data: choices
  } = empIds.length ? await supabase.from("employee_super_choices").select("employee_id, fund_id").in("employee_id", empIds) : {
    data: []
  };
  const haveChoice = new Set((choices ?? []).map((c) => c.employee_id));
  const empMissingSuper = (emps ?? []).filter((e) => !haveChoice.has(e.id)).map((e) => ({
    id: e.id,
    name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
    employee_number: e.employee_number
  }));
  const {
    data: obligations
  } = await supabase.from("au_payday_super_obligations").select("id, pay_date, due_date, status, amount_due, amount_paid").eq("tenant_id", tenant.id).order("pay_date", {
    ascending: false
  }).limit(20);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overdueSuper = (obligations ?? []).filter((o) => o.due_date < today && o.status !== "paid").length;
  return {
    ok: true,
    tenant: {
      id: tenant.id,
      name: tenant.name
    },
    employer,
    employerReady,
    employees: {
      total: (emps ?? []).length,
      with_gaps: empWithGaps.length,
      gaps: empWithGaps.slice(0, 200),
      missing_super_choice: empMissingSuper.slice(0, 200),
      missing_super_count: empMissingSuper.length
    },
    paydaySuper: {
      enabled: !!s.payday_super_enabled,
      overdue: overdueSuper,
      recent: obligations ?? [],
      sevenDayRuleAchievable: !!s.payday_super_enabled && !!s.default_super_fund_id && employerReady
    },
    exportBlocked: !employerReady || empWithGaps.length > 0
  };
});
export {
  getAuStpAudit_createServerFn_handler
};
