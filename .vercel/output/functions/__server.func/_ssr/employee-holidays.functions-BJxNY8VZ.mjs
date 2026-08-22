import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, B as enumType } from "../_libs/zod.mjs";
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
async function getCtx(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  const isAdmin = r.some((x) => ["org_admin", "super_admin", "manager"].includes(x));
  return {
    tenantId: prof.tenant_id,
    isAdmin,
    userId,
    supabase
  };
}
const listEmployeesWithState_createServerFn_handler = createServerRpc({
  id: "e1ce1b53b0647b71269d215149e38abcaf638b1444a755ca81fea06cfbe59bc7",
  name: "listEmployeesWithState",
  filename: "src/lib/employee-holidays.functions.ts"
}, (opts) => listEmployeesWithState.__executeServer(opts));
const listEmployeesWithState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEmployeesWithState_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    data,
    error
  } = await supabase.from("employees").select("id, first_name, last_name, email, state_region").eq("tenant_id", tenantId).order("first_name");
  if (error) throw new Error(error.message);
  return {
    employees: data ?? []
  };
});
const setEmployeeState_createServerFn_handler = createServerRpc({
  id: "8455ea24b0bbc76342f8af2256017cb63ecd4da8704fa047eda15f6c5dd72445",
  name: "setEmployeeState",
  filename: "src/lib/employee-holidays.functions.ts"
}, (opts) => setEmployeeState.__executeServer(opts));
const setEmployeeState = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  stateRegion: stringType().trim().max(10).nullable()
}).parse(d)).handler(setEmployeeState_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    error
  } = await supabase.from("employees").update({
    state_region: data.stateRegion
  }).eq("id", data.employeeId).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listEmployeeHolidayPlan_createServerFn_handler = createServerRpc({
  id: "80739c86018cb7976f578bec8ea203ae17ffc8728165ffe2e7244c484e396aad",
  name: "listEmployeeHolidayPlan",
  filename: "src/lib/employee-holidays.functions.ts"
}, (opts) => listEmployeeHolidayPlan.__executeServer(opts));
const listEmployeeHolidayPlan = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  year: numberType().int().min(2020).max(2035)
}).parse(d)).handler(listEmployeeHolidayPlan_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    data: emp
  } = await supabase.from("employees").select("id, first_name, last_name, state_region, tenant_id").eq("id", data.employeeId).eq("tenant_id", tenantId).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  const {
    data: tenant
  } = await supabase.from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
  const countryCode = tenant?.country_code ?? "AU";
  const start = `${data.year}-01-01`, end = `${data.year}-12-31`;
  let q = supabase.from("public_holidays").select("*").eq("country_code", countryCode).gte("holiday_date", start).lte("holiday_date", end);
  const {
    data: nationalRows
  } = await q;
  const synced = (nationalRows ?? []).filter((r) => r.region == null || emp.state_region && r.region === emp.state_region);
  const {
    data: overrides
  } = await supabase.from("employee_holiday_overrides").select("*").eq("employee_id", emp.id).gte("holiday_date", start).lte("holiday_date", end);
  return {
    employee: emp,
    countryCode,
    synced,
    overrides: overrides ?? []
  };
});
const overrideSchema = objectType({
  employeeId: stringType().uuid(),
  holidayDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: stringType().trim().min(1).max(200),
  action: enumType(["add", "remove"]),
  isPaid: booleanType().optional(),
  payMultiplier: numberType().nullable().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertHolidayOverride_createServerFn_handler = createServerRpc({
  id: "84ccf42e35621dcff62eaf43c1f495a6cf271ba6fe4fcf8f8b5e58b2f45eecaa",
  name: "upsertHolidayOverride",
  filename: "src/lib/employee-holidays.functions.ts"
}, (opts) => upsertHolidayOverride.__executeServer(opts));
const upsertHolidayOverride = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => overrideSchema.parse(d)).handler(upsertHolidayOverride_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase,
    userId
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const payload = {
    tenant_id: tenantId,
    employee_id: data.employeeId,
    holiday_date: data.holidayDate,
    name: data.name,
    action: data.action,
    is_paid: data.isPaid ?? true,
    pay_multiplier: data.payMultiplier ?? null,
    notes: data.notes ?? null,
    created_by: userId
  };
  const {
    data: row,
    error
  } = await supabase.from("employee_holiday_overrides").upsert(payload, {
    onConflict: "employee_id,holiday_date,name"
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    override: row
  };
});
const deleteHolidayOverride_createServerFn_handler = createServerRpc({
  id: "ed91da48068356ebd6e1d0dc23e65710bc1d7d8153ec0f729ec4ef63906438b3",
  name: "deleteHolidayOverride",
  filename: "src/lib/employee-holidays.functions.ts"
}, (opts) => deleteHolidayOverride.__executeServer(opts));
const deleteHolidayOverride = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteHolidayOverride_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    error
  } = await supabase.from("employee_holiday_overrides").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteHolidayOverride_createServerFn_handler,
  listEmployeeHolidayPlan_createServerFn_handler,
  listEmployeesWithState_createServerFn_handler,
  setEmployeeState_createServerFn_handler,
  upsertHolidayOverride_createServerFn_handler
};
