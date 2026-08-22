import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, E as recordType, z as stringType, F as anyType, A as booleanType, B as enumType, C as numberType } from "../_libs/zod.mjs";
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
async function assertAdmin(ctx) {
  const {
    data: roles
  } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Not authorized to view audit trail");
  }
}
const logEventAccess_createServerFn_handler = createServerRpc({
  id: "c896de4d3ec6f4ba7fbf1c2a883e3bf6cfbe2130e7f64badeb7fc37758d8d2de",
  name: "logEventAccess",
  filename: "src/lib/audit.functions.ts"
}, (opts) => logEventAccess.__executeServer(opts));
const logEventAccess = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  resourceType: enumType(["employee_event", "medical_incident", "disciplinary_case", "timeline"]),
  resourceId: stringType().uuid().optional(),
  employeeId: stringType().uuid().optional(),
  action: enumType(["view", "edit", "export", "list"]).default("view"),
  wasConfidential: booleanType().default(false),
  metadata: recordType(stringType(), anyType()).default({})
}).parse(d)).handler(logEventAccess_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.rpc("log_event_access", {
    _resource_type: data.resourceType,
    _resource_id: data.resourceId ?? null,
    _employee_id: data.employeeId ?? null,
    _action: data.action,
    _was_confidential: data.wasConfidential,
    _metadata: data.metadata
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listEventAccessLog_createServerFn_handler = createServerRpc({
  id: "5b327706dd5af5d8c7a5b3eacb57e0714cc8d3f6ba606263b71386e399f8a42e",
  name: "listEventAccessLog",
  filename: "src/lib/audit.functions.ts"
}, (opts) => listEventAccessLog.__executeServer(opts));
const listEventAccessLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional(),
  resourceType: stringType().optional(),
  resourceId: stringType().uuid().optional(),
  actorId: stringType().uuid().optional(),
  confidentialOnly: booleanType().default(false),
  limit: numberType().int().min(1).max(500).default(200)
}).parse(d)).handler(listEventAccessLog_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  let q = context.supabase.from("event_access_log").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  if (data.resourceType) q = q.eq("resource_type", data.resourceType);
  if (data.resourceId) q = q.eq("resource_id", data.resourceId);
  if (data.actorId) q = q.eq("actor_id", data.actorId);
  if (data.confidentialOnly) q = q.eq("was_confidential", true);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id).filter(Boolean)));
  let actors = {};
  if (actorIds.length) {
    const {
      data: profs
    } = await context.supabase.from("profiles").select("id, email, full_name").in("id", actorIds);
    for (const p of profs ?? []) {
      actors[p.id] = {
        email: p.email,
        full_name: p.full_name
      };
    }
  }
  return {
    entries: rows ?? [],
    actors
  };
});
const accessLogSummary_createServerFn_handler = createServerRpc({
  id: "b1f9091f8a7e72854687c4465f582f6abb7488bd7bed5ea75264338a3778b70a",
  name: "accessLogSummary",
  filename: "src/lib/audit.functions.ts"
}, (opts) => accessLogSummary.__executeServer(opts));
const accessLogSummary = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(accessLogSummary_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  let q = context.supabase.from("event_access_log").select("action, was_confidential, resource_type").limit(2e3);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const summary = {
    total: rows?.length ?? 0,
    confidential: 0,
    byAction: {},
    byResource: {}
  };
  for (const r of rows ?? []) {
    if (r.was_confidential) summary.confidential++;
    summary.byAction[r.action] = (summary.byAction[r.action] ?? 0) + 1;
    summary.byResource[r.resource_type] = (summary.byResource[r.resource_type] ?? 0) + 1;
  }
  return summary;
});
export {
  accessLogSummary_createServerFn_handler,
  listEventAccessLog_createServerFn_handler,
  logEventAccess_createServerFn_handler
};
