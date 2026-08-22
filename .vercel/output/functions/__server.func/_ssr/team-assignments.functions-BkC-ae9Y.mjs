import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, D as arrayType } from "../_libs/zod.mjs";
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
async function assertOrgAdmin(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "regional_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  return {
    tenantId: prof?.tenant_id,
    roles: r
  };
}
const listTeamData_createServerFn_handler = createServerRpc({
  id: "952fac3e24d750ac56a27b3b83e48f7a74200e8977398f31eed74b8e67c09205",
  name: "listTeamData",
  filename: "src/lib/team-assignments.functions.ts"
}, (opts) => listTeamData.__executeServer(opts));
const listTeamData = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTeamData_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  if (!tenantId) return {
    employees: [],
    managers: []
  };
  const {
    supabase
  } = context;
  const {
    data: emps
  } = await supabase.from("employees").select("id, first_name, last_name, email, job_title, manager_id, user_id, status").eq("tenant_id", tenantId).order("first_name");
  const userIds = (emps ?? []).map((e) => e.user_id).filter(Boolean);
  let managerUserIds = /* @__PURE__ */ new Set();
  if (userIds.length) {
    const {
      data: roles
    } = await supabase.from("user_roles").select("user_id, role").in("user_id", userIds).eq("role", "manager");
    managerUserIds = new Set((roles ?? []).map((r) => r.user_id));
  }
  const managers = (emps ?? []).filter((e) => e.user_id && managerUserIds.has(e.user_id));
  return {
    employees: emps ?? [],
    managers
  };
});
const grantSchema = objectType({
  employee_id: stringType().uuid(),
  grant: booleanType()
});
const setManagerRole_createServerFn_handler = createServerRpc({
  id: "b93f108d8422d2ad941979d287acd49bc0965c78a1d5a18f125017c5fa2dce33",
  name: "setManagerRole",
  filename: "src/lib/team-assignments.functions.ts"
}, (opts) => setManagerRole.__executeServer(opts));
const setManagerRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => grantSchema.parse(d)).handler(setManagerRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  if (!tenantId) throw new Error("No organisation");
  const {
    supabase
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("user_id, tenant_id").eq("id", data.employee_id).maybeSingle();
  if (!emp || emp.tenant_id !== tenantId) throw new Error("Not found");
  if (!emp.user_id) throw new Error("Employee has no linked user account");
  const admin = await loadAdmin();
  if (data.grant) {
    await admin.from("user_roles").upsert({
      user_id: emp.user_id,
      role: "manager"
    }, {
      onConflict: "user_id,role"
    });
  } else {
    await admin.from("user_roles").delete().eq("user_id", emp.user_id).eq("role", "manager");
  }
  return {
    ok: true
  };
});
const assignSchema = objectType({
  manager_employee_id: stringType().uuid(),
  report_employee_ids: arrayType(stringType().uuid()).max(500)
});
const assignReports_createServerFn_handler = createServerRpc({
  id: "a26f6c54629d42b97358b5bd364456fc7709183f8ab226884cb016662156dcf3",
  name: "assignReports",
  filename: "src/lib/team-assignments.functions.ts"
}, (opts) => assignReports.__executeServer(opts));
const assignReports = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => assignSchema.parse(d)).handler(assignReports_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  if (!tenantId) throw new Error("No organisation");
  const {
    supabase
  } = context;
  const {
    data: mgr
  } = await supabase.from("employees").select("id, tenant_id").eq("id", data.manager_employee_id).maybeSingle();
  if (!mgr || mgr.tenant_id !== tenantId) throw new Error("Manager not in your organisation");
  const admin = await loadAdmin();
  const {
    error: clearErr
  } = await admin.from("employees").update({
    manager_id: null
  }).eq("manager_id", data.manager_employee_id).eq("tenant_id", tenantId);
  if (clearErr) throw new Error(clearErr.message);
  if (data.report_employee_ids.length) {
    const {
      error: setErr
    } = await admin.from("employees").update({
      manager_id: data.manager_employee_id
    }).in("id", data.report_employee_ids).eq("tenant_id", tenantId);
    if (setErr) throw new Error(setErr.message);
  }
  return {
    ok: true,
    assigned: data.report_employee_ids.length
  };
});
export {
  assignReports_createServerFn_handler,
  listTeamData_createServerFn_handler,
  setManagerRole_createServerFn_handler
};
