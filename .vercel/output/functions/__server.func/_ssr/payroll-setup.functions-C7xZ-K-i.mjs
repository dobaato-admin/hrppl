import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, C as numberType, B as enumType, D as arrayType } from "../_libs/zod.mjs";
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
const getPayrollSetup = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a6adf36d1adb34fb77fa572d57a58cbbae78af0d62587ba518d3f0b02c45bcd9"));
const SettingsSchema = objectType({
  pay_period: enumType(["weekly", "fortnightly", "semimonthly", "monthly"]),
  standard_hours_per_day: numberType().min(0).max(24),
  standard_days_per_week: numberType().min(0).max(7),
  meal_break_minutes: numberType().int().min(0).max(240),
  rest_break_minutes: numberType().int().min(0).max(240),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertPayrollSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SettingsSchema.parse(d)).handler(createSsrRpc("2c19fd0a5f8207bef3e74331a09206a9c28244bd851a8d3b2e1b4df589656434"));
const ComponentSchema = objectType({
  id: stringType().uuid().optional(),
  code: stringType().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
  label: stringType().trim().min(1).max(120),
  kind: enumType(["tax", "pf", "retirement", "allowance", "deduction", "other"]),
  calc_type: enumType(["flat", "pct_of_basic", "pct_of_gross"]),
  rate: numberType().min(0).max(1e6),
  is_taxable: booleanType().optional(),
  show_on_payslip: booleanType().optional(),
  is_active: booleanType().optional(),
  sort_order: numberType().int().min(0).max(9999).optional(),
  department_id: stringType().uuid().nullable().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertPayrollComponent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ComponentSchema.parse(d)).handler(createSsrRpc("dcf8bd5016566210843cae6e61dd5795a1d03f8ecc2bea105aa4e0a0ff0cbb4d"));
const togglePayrollComponent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  is_active: booleanType()
}).parse(d)).handler(createSsrRpc("d1701c3028759d86cd5e5b044aee6adb9e6d50ef574370b596a5c3052f1493cc"));
const deletePayrollComponent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("95b63901aea3f1449bdb2f0be85118a76e8fe65e8e6bde191bc08edb6a5f25d6"));
const ScenarioLogSchema = objectType({
  scenarioId: stringType().min(1),
  name: stringType().trim().min(1).max(120),
  action: enumType(["create", "update", "delete"]),
  gross: numberType().optional(),
  overrideCount: numberType().int().optional()
});
const logPayrollScenarioEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ScenarioLogSchema.parse(d)).handler(createSsrRpc("153b617cf3be7df9d9bf9710f584141e1718961dbf6e7d093d61582c6e1daa5c"));
const ExportLogSchema = objectType({
  format: enumType(["csv", "pdf"]),
  sections: arrayType(stringType()).min(1),
  scenarios: arrayType(objectType({
    id: stringType(),
    name: stringType()
  })).optional()
});
const logPayrollExportEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ExportLogSchema.parse(d)).handler(createSsrRpc("1bc5fed8d9e6a30b23c064200fc9b1ea8cfdfb3a85e71607db9efdaa03a552b2"));
const getAdminAuditLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  category: stringType().optional(),
  limit: numberType().int().min(1).max(500).optional()
}).parse(d ?? {})).handler(createSsrRpc("f0af8d406b266cde10fec5fb5c9df453365273293ff00184715db2cc076ccb43"));
const getPayrollExportBundle = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2fc9c4b3a55c1ac37059d347d3c99fe8384b6fd2289cc1e0c606a648dae958ab"));
async function checkPayrollReadiness(supabase, tenantId) {
  const {
    data: tenant
  } = await supabase.from("tenants").select("currency_code, country_code").eq("id", tenantId).maybeSingle();
  const countryCode = tenant?.country_code ?? null;
  const [{
    data: items
  }, {
    data: settings
  }, otRes] = await Promise.all([supabase.from("payroll_components").select("id").eq("tenant_id", tenantId).eq("is_active", true).limit(1), supabase.from("tenant_payroll_settings").select("pay_period").eq("tenant_id", tenantId).maybeSingle(), countryCode ? supabase.from("overtime_penalty_rates").select("id").eq("country_code", countryCode).eq("is_active", true).limit(1) : Promise.resolve({
    data: []
  })]);
  const ot = otRes.data;
  const steps = {
    payItems: (items ?? []).length > 0,
    payDates: !!settings?.pay_period,
    overtimeRates: (ot ?? []).length > 0,
    currency: !!tenant?.currency_code && String(tenant.currency_code).trim().length === 3
  };
  const allComplete = steps.payItems && steps.payDates && steps.overtimeRates && steps.currency;
  return {
    steps,
    allComplete
  };
}
const getPayrollReadiness = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5e887b2708b73fb1e633ee372484d5225cfe937f4ad0d1528d5d2a27f694af72"));
const updateTenantCurrency = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  currency_code: stringType().trim().length(3).regex(/^[A-Za-z]{3}$/)
}).parse(d)).handler(createSsrRpc("2efed6893352772ab3a4adae778de20436cc4447d1cc5020d6dd1de55fdd8c3d"));
const upsertOvertimeRateQuick = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  code: stringType().trim().min(1).max(40),
  name: stringType().trim().min(1).max(120),
  applies_to: enumType(["overtime", "penalty"]),
  rate_multiplier: numberType().min(0.5).max(10)
}).parse(d)).handler(createSsrRpc("43941ed53770ebac6c3bbd95ee8a6f1195f434bd954224e74842e8336d5e393b"));
async function checkOvertimeReadiness(supabase, tenantId) {
  const {
    data: tenant
  } = await supabase.from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
  if (!tenant?.country_code) {
    return {
      hasRates: false,
      rateCount: 0,
      allComplete: false
    };
  }
  const {
    data,
    count
  } = await supabase.from("overtime_penalty_rates").select("id", {
    count: "exact"
  }).eq("country_code", tenant.country_code);
  const rateCount = count ?? (data ?? []).length;
  const hasRates = rateCount > 0;
  return {
    hasRates,
    rateCount,
    allComplete: hasRates
  };
}
const getOvertimeReadiness = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("956ae30622c5d1d1e6ca4d6bab16766b3f1d2b1f577355f4fb2674d8bf524ef5"));
export {
  checkOvertimeReadiness,
  checkPayrollReadiness,
  deletePayrollComponent,
  getAdminAuditLog,
  getOvertimeReadiness,
  getPayrollExportBundle,
  getPayrollReadiness,
  getPayrollSetup,
  logPayrollExportEvent,
  logPayrollScenarioEvent,
  togglePayrollComponent,
  updateTenantCurrency,
  upsertOvertimeRateQuick,
  upsertPayrollComponent,
  upsertPayrollSettings
};
