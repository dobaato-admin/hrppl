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
async function assertOrgAdmin(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  return {
    tenantId: prof.tenant_id
  };
}
const listDepartments_createServerFn_handler = createServerRpc({
  id: "083bc60e25d313798d8e4aafc4d1a4f079432eb9e2240b2ff6e7483f3dabfcee",
  name: "listDepartments",
  filename: "src/lib/departments.functions.ts"
}, (opts) => listDepartments.__executeServer(opts));
const listDepartments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listDepartments_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data: deps,
    error
  } = await supabase.from("departments").select("id, name, parent_id, manager_id, created_at").eq("tenant_id", tenantId).order("name");
  if (error) throw new Error(error.message);
  const {
    data: emps
  } = await supabase.from("employees").select("department_id").eq("tenant_id", tenantId).neq("status", "terminated");
  const counts = {};
  for (const e of emps ?? []) {
    if (e.department_id) counts[e.department_id] = (counts[e.department_id] ?? 0) + 1;
  }
  return {
    departments: (deps ?? []).map((d) => ({
      ...d,
      headcount: counts[d.id] ?? 0
    }))
  };
});
const UpsertSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(120),
  parent_id: stringType().uuid().nullable().optional(),
  manager_id: stringType().uuid().nullable().optional()
});
const upsertDepartment_createServerFn_handler = createServerRpc({
  id: "bd4955b78082526ef9e1592320b5b397176cee778a80df4a1a46f54ee889be54",
  name: "upsertDepartment",
  filename: "src/lib/departments.functions.ts"
}, (opts) => upsertDepartment.__executeServer(opts));
const upsertDepartment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertSchema.parse(d)).handler(upsertDepartment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  if (data.parent_id === data.id && data.id) {
    throw new Error("A department cannot be its own parent");
  }
  const payload = {
    tenant_id: tenantId,
    name: data.name,
    parent_id: data.parent_id ?? null,
    manager_id: data.manager_id ?? null
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("departments").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : await supabase.from("departments").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return {
    department: row
  };
});
const deleteDepartment_createServerFn_handler = createServerRpc({
  id: "41c6d55e5c6a8c5bdd2d7aa91c98fb664d017c91e899b8f45c91a818c28d0a0a",
  name: "deleteDepartment",
  filename: "src/lib/departments.functions.ts"
}, (opts) => deleteDepartment.__executeServer(opts));
const deleteDepartment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDepartment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    count
  } = await supabase.from("employees").select("id", {
    count: "exact",
    head: true
  }).eq("tenant_id", tenantId).eq("department_id", data.id);
  if ((count ?? 0) > 0) {
    throw new Error(`Cannot delete: ${count} employee(s) are still assigned to this department`);
  }
  const {
    error
  } = await supabase.from("departments").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteDepartment_createServerFn_handler,
  listDepartments_createServerFn_handler,
  upsertDepartment_createServerFn_handler
};
