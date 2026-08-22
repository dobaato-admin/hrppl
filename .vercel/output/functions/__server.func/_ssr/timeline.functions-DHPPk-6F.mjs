import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { r as requireTenantId, i as isNoTenantScope, g as getMyEmployeeId } from "./tenant-scope-BlIr6GnF.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType, D as arrayType, E as recordType, F as anyType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
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
const ListInput = objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType()).optional(),
  from: stringType().optional(),
  to: stringType().optional(),
  limit: numberType().int().min(1).max(500).default(200)
});
const listEmployeeTimeline_createServerFn_handler = createServerRpc({
  id: "052d2d56ddfbea3d8df3bf69029bb1ef83cbedde6bf27a66581e21e44f43ccc5",
  name: "listEmployeeTimeline",
  filename: "src/lib/timeline.functions.ts"
}, (opts) => listEmployeeTimeline.__executeServer(opts));
const listEmployeeTimeline = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ListInput.parse(d)).handler(listEmployeeTimeline_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("employee_events").select("*").eq("employee_id", data.employeeId).order("occurred_at", {
    ascending: false
  }).limit(data.limit);
  if (data.categories?.length) q = q.in("category", data.categories);
  if (data.from) q = q.gte("occurred_at", data.from);
  if (data.to) q = q.lte("occurred_at", data.to);
  const {
    data: events,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const ids = (events ?? []).map((e) => e.id);
  let links = [];
  if (ids.length) {
    const {
      data: l
    } = await supabase.from("employee_event_links").select("*").in("from_event_id", ids);
    links = l ?? [];
  }
  const hasConfidential = (events ?? []).some((e) => e.visibility === "confidential" || e.visibility === "hr");
  try {
    await supabase.rpc("log_event_access", {
      _resource_type: "timeline",
      _resource_id: null,
      _employee_id: data.employeeId,
      _action: "list",
      _was_confidential: hasConfidential,
      _metadata: {
        count: events?.length ?? 0,
        categories: data.categories ?? null
      }
    });
  } catch {
  }
  return {
    events: events ?? [],
    links
  };
});
async function assertHrOrAdmin(supabase, userId) {
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["manager", "org_admin", "super_admin", "hr"]);
  if (!roles?.length) throw new Error("Forbidden");
}
const linkEvents_createServerFn_handler = createServerRpc({
  id: "d51047ee80647fcbcd1c43342b8e0127beaefea7f8711f1575a7cc34eafe2b6d",
  name: "linkEvents",
  filename: "src/lib/timeline.functions.ts"
}, (opts) => linkEvents.__executeServer(opts));
const linkEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fromEventId: stringType().uuid(),
  toEventId: stringType().uuid(),
  relation: stringType().min(1).max(50).default("related")
}).parse(d)).handler(linkEvents_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("employee_event_links").insert({
    from_event_id: data.fromEventId,
    to_event_id: data.toEventId,
    relation: data.relation
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const recordCustomEvent_createServerFn_handler = createServerRpc({
  id: "b97a74db99c229a97ea2a0b89a831b3e193861f85f50202832619a34790b6c3d",
  name: "recordCustomEvent",
  filename: "src/lib/timeline.functions.ts"
}, (opts) => recordCustomEvent.__executeServer(opts));
const recordCustomEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  category: stringType().min(1),
  eventType: stringType().min(1).max(100),
  title: stringType().min(1).max(255),
  summary: stringType().max(2e3).optional(),
  severity: stringType().max(50).optional(),
  visibility: enumType(["employee", "manager", "hr", "confidential"]).default("employee"),
  occurredAt: stringType().optional(),
  metadata: recordType(stringType(), anyType()).default({})
}).parse(d)).handler(recordCustomEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    supabase
  } = context;
  const {
    data: emp,
    error: e1
  } = await supabase.from("employees").select("tenant_id").eq("id", data.employeeId).single();
  if (e1 || !emp) throw new Error("Employee not found");
  const {
    data: ev,
    error
  } = await supabase.from("employee_events").insert({
    tenant_id: emp.tenant_id,
    employee_id: data.employeeId,
    category: data.category,
    event_type: data.eventType,
    title: data.title,
    summary: data.summary,
    severity: data.severity,
    visibility: data.visibility,
    occurred_at: data.occurredAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    metadata: data.metadata
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    event: ev
  };
});
const listEmployeesForAdmin_createServerFn_handler = createServerRpc({
  id: "bfca804f13447d2f0dc0da9e3cecb9e05d5551caacf9ce524ce74e10eaaaf3f7",
  name: "listEmployeesForAdmin",
  filename: "src/lib/timeline.functions.ts"
}, (opts) => listEmployeesForAdmin.__executeServer(opts));
const listEmployeesForAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  // Off by default only where selecting yourself is meaningful. The
  // callers that must never offer self (offboarding, discipline) leave
  // this alone.
  includeSelf: booleanType().default(false),
  includeInactive: booleanType().default(false)
}).parse(d ?? {})).handler(listEmployeesForAdmin_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  let tenantId;
  try {
    tenantId = await requireTenantId(context.supabase, context.userId);
  } catch (e) {
    if (isNoTenantScope(e)) return {
      employees: [],
      noTenantScope: true
    };
    throw e;
  }
  let q = context.supabase.from("employees").select("id, first_name, last_name, email, job_title, department_id, status").eq("tenant_id", tenantId).order("first_name", {
    ascending: true
  });
  if (!data.includeInactive) q = q.eq("status", "active");
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  let employees = rows ?? [];
  if (!data.includeSelf) {
    const meId = await getMyEmployeeId(context.supabase, context.userId);
    if (meId) employees = employees.filter((e) => e.id !== meId);
  }
  return {
    employees,
    noTenantScope: false
  };
});
const myEmployeeId_createServerFn_handler = createServerRpc({
  id: "46133b391f80385fff9b352fdf34b66e211b4871590fc93dad68fc24d6ae42d7",
  name: "myEmployeeId",
  filename: "src/lib/timeline.functions.ts"
}, (opts) => myEmployeeId.__executeServer(opts));
const myEmployeeId = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(myEmployeeId_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("employees").select("id, tenant_id, first_name, last_name").eq("user_id", context.userId).maybeSingle();
  return {
    employee: data
  };
});
export {
  linkEvents_createServerFn_handler,
  listEmployeeTimeline_createServerFn_handler,
  listEmployeesForAdmin_createServerFn_handler,
  myEmployeeId_createServerFn_handler,
  recordCustomEvent_createServerFn_handler
};
