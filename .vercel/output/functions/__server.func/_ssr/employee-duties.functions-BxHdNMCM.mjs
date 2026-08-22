import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
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
async function getTenant(context) {
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
    isAdmin
  };
}
const listEmployeeDuties_createServerFn_handler = createServerRpc({
  id: "aa6a8ca16df5c97718881ac1665d5141f202ddddd84079808cbc1c383670aaf9",
  name: "listEmployeeDuties",
  filename: "src/lib/employee-duties.functions.ts"
}, (opts) => listEmployeeDuties.__executeServer(opts));
const listEmployeeDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid()
}).parse(d)).handler(listEmployeeDuties_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("employee_duties").select("id, employee_id, title, description, weight, kpi_target, sort_order, is_active, created_at, updated_at").eq("employee_id", data.employeeId).order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return {
    duties: rows ?? []
  };
});
const listMyDuties_createServerFn_handler = createServerRpc({
  id: "3cf80544dfcb4a7e89107071e525b2361d675e3a78c169a1dc06665dc7e2d026",
  name: "listMyDuties",
  filename: "src/lib/employee-duties.functions.ts"
}, (opts) => listMyDuties.__executeServer(opts));
const listMyDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyDuties_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    duties: [],
    employeeId: null
  };
  const {
    data: rows,
    error
  } = await supabase.from("employee_duties").select("id, title, description, weight, kpi_target, sort_order, is_active").eq("employee_id", emp.id).eq("is_active", true).order("sort_order");
  if (error) throw new Error(error.message);
  return {
    duties: rows ?? [],
    employeeId: emp.id
  };
});
const Upsert = objectType({
  id: stringType().uuid().optional(),
  employee_id: stringType().uuid(),
  title: stringType().trim().min(1).max(200),
  description: stringType().trim().max(2e3).nullable().optional(),
  weight: numberType().min(0).max(100),
  kpi_target: stringType().trim().max(500).nullable().optional(),
  sort_order: numberType().int().min(0).max(1e3).optional(),
  is_active: booleanType().optional(),
  /** If true, skip the strict weight-tolerance assertion for this single save. */
  allow_partial: booleanType().optional()
});
const upsertEmployeeDuty_createServerFn_handler = createServerRpc({
  id: "47a18cf59d482a0f227fde352983cacf613d5fd5fec4f98f1288c3e3a121624d",
  name: "upsertEmployeeDuty",
  filename: "src/lib/employee-duties.functions.ts"
}, (opts) => upsertEmployeeDuty.__executeServer(opts));
const upsertEmployeeDuty = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => Upsert.parse(d)).handler(upsertEmployeeDuty_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin
  } = await getTenant(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    supabase,
    userId
  } = context;
  const payload = {
    tenant_id: tenantId,
    employee_id: data.employee_id,
    title: data.title,
    description: data.description ?? null,
    weight: data.weight,
    kpi_target: data.kpi_target ?? null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true,
    created_by: userId
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("employee_duties").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : await supabase.from("employee_duties").insert(payload).select().single();
  if (error) throw new Error(error.message);
  const {
    data: all
  } = await supabase.from("employee_duties").select("weight").eq("employee_id", data.employee_id).eq("is_active", true);
  const sum = (all ?? []).reduce((s, r) => s + Number(r.weight || 0), 0);
  const {
    data: tenant
  } = await supabase.from("tenants").select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
  const tolerance = Number(tenant?.kpi_weight_tolerance ?? 0);
  const strict = Boolean(tenant?.kpi_strict_weights ?? true);
  const within = Math.abs(sum - 100) <= tolerance;
  if (strict && !within && !data.allow_partial) {
    if (!data.id) {
      await supabase.from("employee_duties").delete().eq("id", row.id);
    }
    throw new Error(`KPI weights must sum to 100% (±${tolerance}%). Current total: ${sum}%. Adjust other duties first, or re-save with "allow partial".`);
  }
  const warning = within ? null : `KPI weights sum to ${sum}% (expected 100%, tolerance ±${tolerance}%).`;
  return {
    duty: row,
    weight_sum: sum,
    tolerance,
    strict,
    within,
    warning
  };
});
const deleteEmployeeDuty_createServerFn_handler = createServerRpc({
  id: "75d02fd99b5d6a2e0335e2fd5fd35918ef3333b2fff3b7337b8ff544f53e29bb",
  name: "deleteEmployeeDuty",
  filename: "src/lib/employee-duties.functions.ts"
}, (opts) => deleteEmployeeDuty.__executeServer(opts));
const deleteEmployeeDuty = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteEmployeeDuty_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin
  } = await getTenant(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("employee_duties").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listEmployeesForDuties_createServerFn_handler = createServerRpc({
  id: "7f05b3feee6402491dd7bc548ccb8b88ec6bdb1bdcf47fc8e12ceff6cb826c89",
  name: "listEmployeesForDuties",
  filename: "src/lib/employee-duties.functions.ts"
}, (opts) => listEmployeesForDuties.__executeServer(opts));
const listEmployeesForDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEmployeesForDuties_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId,
    isAdmin
  } = await getTenant(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("employees").select("id, first_name, last_name, email").eq("tenant_id", tenantId).order("first_name");
  if (error) throw new Error(error.message);
  return {
    employees: data ?? []
  };
});
export {
  deleteEmployeeDuty_createServerFn_handler,
  listEmployeeDuties_createServerFn_handler,
  listEmployeesForDuties_createServerFn_handler,
  listMyDuties_createServerFn_handler,
  upsertEmployeeDuty_createServerFn_handler
};
