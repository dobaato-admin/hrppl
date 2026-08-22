import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, D as arrayType, A as booleanType } from "../_libs/zod.mjs";
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
async function assertOrgAdmin(context, tenantId) {
  const {
    supabase,
    userId
  } = context;
  const [{
    data: superRow
  }, {
    data: profile
  }, {
    data: adminRow
  }] = await Promise.all([supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  }), supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle(), supabase.rpc("has_role", {
    _user_id: userId,
    _role: "org_admin"
  })]);
  const isSuper = superRow === true;
  const isOrgAdmin = adminRow === true && profile?.tenant_id === tenantId;
  if (!isSuper && !isOrgAdmin) throw new Error("Forbidden — org admin required.");
  return {
    isSuper,
    userId
  };
}
const deleteTenant_createServerFn_handler = createServerRpc({
  id: "d18667f1417277d9887c43a7b2268655099565f94896b1f8c64a6745451c90fb",
  name: "deleteTenant",
  filename: "src/lib/danger-zone.functions.ts"
}, (opts) => deleteTenant.__executeServer(opts));
const deleteTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  confirmName: stringType().min(1).max(255)
}).parse(input)).handler(deleteTenant_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOrgAdmin(context, data.tenantId);
  const admin = await loadAdmin();
  const {
    data: tenant,
    error: fetchErr
  } = await admin.from("tenants").select("id, name").eq("id", data.tenantId).maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!tenant) throw new Error("Organization not found.");
  if (tenant.name !== data.confirmName) {
    throw new Error("Organization name did not match.");
  }
  const {
    error
  } = await admin.from("tenants").delete().eq("id", data.tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const bulkDeleteEmployees_createServerFn_handler = createServerRpc({
  id: "1d1739e9578e4582299f91887aa3c92621e467cd7a904fef971b73e6f3e681f6",
  name: "bulkDeleteEmployees",
  filename: "src/lib/danger-zone.functions.ts"
}, (opts) => bulkDeleteEmployees.__executeServer(opts));
const bulkDeleteEmployees = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  employeeIds: arrayType(stringType().uuid()).min(1).max(500)
}).parse(input)).handler(bulkDeleteEmployees_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOrgAdmin(context, data.tenantId);
  const admin = await loadAdmin();
  const {
    data: rows,
    error: chkErr
  } = await admin.from("employees").select("id").eq("tenant_id", data.tenantId).in("id", data.employeeIds);
  if (chkErr) throw new Error(chkErr.message);
  const okIds = (rows ?? []).map((r) => r.id);
  if (okIds.length === 0) throw new Error("No matching employees found in this organization.");
  const {
    error
  } = await admin.from("employees").delete().in("id", okIds);
  if (error) throw new Error(error.message);
  return {
    deleted: okIds.length
  };
});
const purgePayrollHistory_createServerFn_handler = createServerRpc({
  id: "401fca7e742e5ad31f8fb3b3a98e8c33d726c8471a4b4c143a94f115d9851128",
  name: "purgePayrollHistory",
  filename: "src/lib/danger-zone.functions.ts"
}, (opts) => purgePayrollHistory.__executeServer(opts));
const purgePayrollHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  beforeDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/)
}).parse(input)).handler(purgePayrollHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOrgAdmin(context, data.tenantId);
  const admin = await loadAdmin();
  const {
    data: runs,
    error: runsErr
  } = await admin.from("payroll_runs").select("id").eq("tenant_id", data.tenantId).lt("pay_date", data.beforeDate);
  if (runsErr) throw new Error(runsErr.message);
  const runIds = (runs ?? []).map((r) => r.id);
  if (runIds.length === 0) return {
    runs: 0,
    payslips: 0
  };
  const {
    count: payslipCount,
    error: psErr
  } = await admin.from("payroll_payslips").delete({
    count: "exact"
  }).in("run_id", runIds);
  if (psErr) throw new Error(psErr.message);
  const {
    error: runDelErr
  } = await admin.from("payroll_runs").delete().in("id", runIds);
  if (runDelErr) throw new Error(runDelErr.message);
  return {
    runs: runIds.length,
    payslips: payslipCount ?? 0
  };
});
const transferOwnership_createServerFn_handler = createServerRpc({
  id: "5a71826e133d711c1939267bc2bb4601cc9ec431ed649f1935304c5f835732d1",
  name: "transferOwnership",
  filename: "src/lib/danger-zone.functions.ts"
}, (opts) => transferOwnership.__executeServer(opts));
const transferOwnership = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  newOwnerEmployeeId: stringType().uuid(),
  demoteSelf: booleanType()
}).parse(input)).handler(transferOwnership_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    isSuper,
    userId
  } = await assertOrgAdmin(context, data.tenantId);
  const admin = await loadAdmin();
  const {
    data: emp,
    error: empErr
  } = await admin.from("employees").select("id, user_id, tenant_id, first_name, last_name").eq("id", data.newOwnerEmployeeId).maybeSingle();
  if (empErr) throw new Error(empErr.message);
  if (!emp || emp.tenant_id !== data.tenantId) {
    throw new Error("Selected employee is not in this organization.");
  }
  if (!emp.user_id) throw new Error("Selected employee has no linked user account.");
  await admin.from("user_roles").upsert({
    user_id: emp.user_id,
    role: "org_admin"
  }, {
    onConflict: "user_id,role"
  });
  if (data.demoteSelf && !isSuper) {
    await admin.from("user_roles").delete().eq("user_id", userId).eq("role", "org_admin");
  }
  return {
    ok: true,
    newOwnerName: `${emp.first_name} ${emp.last_name}`.trim()
  };
});
export {
  bulkDeleteEmployees_createServerFn_handler,
  deleteTenant_createServerFn_handler,
  purgePayrollHistory_createServerFn_handler,
  transferOwnership_createServerFn_handler
};
