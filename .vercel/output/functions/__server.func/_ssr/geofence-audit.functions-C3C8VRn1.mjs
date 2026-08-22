import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, E as recordType, z as stringType, F as anyType, A as booleanType, C as numberType, B as enumType } from "../_libs/zod.mjs";
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
const ACTIONS = ["create", "update", "delete", "capture", "manual_edit", "permission_denied", "permission_timeout", "tracking_started", "tracking_stopped", "suspicious_flagged", "background_enabled", "background_disabled", "simulation_run", "simulation_point"];
const LogSchema = objectType({
  geofence_id: stringType().uuid().nullable().optional(),
  action: enumType(ACTIONS),
  source: enumType(["device", "manual", "map", "background", "simulation"]).nullable().optional(),
  latitude: numberType().min(-90).max(90).nullable().optional(),
  longitude: numberType().min(-180).max(180).nullable().optional(),
  accuracy_m: numberType().min(0).max(1e5).nullable().optional(),
  is_suspicious: booleanType().optional(),
  suspicious_reason: stringType().max(280).nullable().optional(),
  metadata: recordType(stringType(), anyType()).optional()
});
async function notifyAdmins(supabase, tenantId, title, body, link, metadata) {
  const {
    data: admins
  } = await supabase.from("user_roles").select("user_id, profiles!inner(tenant_id)").in("role", ["org_admin", "super_admin", "hr"]).eq("profiles.tenant_id", tenantId);
  if (!admins?.length) return;
  const rows = admins.map((a) => ({
    user_id: a.user_id,
    tenant_id: tenantId,
    kind: "geofence_alert",
    title,
    body,
    link,
    metadata
  }));
  await supabase.from("in_app_notifications").insert(rows);
}
const logGeofenceEvent_createServerFn_handler = createServerRpc({
  id: "426ee86312116c89f6763861b849205a4e193492669d6bc435b1796558a89510",
  name: "logGeofenceEvent",
  filename: "src/lib/geofence-audit.functions.ts"
}, (opts) => logGeofenceEvent.__executeServer(opts));
const logGeofenceEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => LogSchema.parse(d)).handler(logGeofenceEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  if (!profile?.tenant_id) throw new Error("No tenant for user");
  const tenantId = profile.tenant_id;
  const {
    data: row,
    error
  } = await supabase.from("geofence_audit_log").insert({
    tenant_id: tenantId,
    actor_user_id: userId,
    geofence_id: data.geofence_id ?? null,
    action: data.action,
    source: data.source ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    accuracy_m: data.accuracy_m ?? null,
    is_suspicious: data.is_suspicious ?? false,
    suspicious_reason: data.suspicious_reason ?? null,
    metadata: data.metadata ?? {}
  }).select().single();
  if (error) throw error;
  try {
    if (data.is_suspicious) {
      await notifyAdmins(supabase, tenantId, "Suspicious geofence event", data.suspicious_reason ?? "A geofence capture was flagged as suspicious.", "/admin/geofences", {
        audit_id: row.id,
        geofence_id: data.geofence_id ?? null
      });
    } else if (data.action === "permission_denied" || data.action === "permission_timeout") {
      const cutoff = new Date(Date.now() - 30 * 60 * 1e3).toISOString();
      const {
        count
      } = await supabase.from("geofence_audit_log").select("id", {
        count: "exact",
        head: true
      }).eq("actor_user_id", userId).in("action", ["permission_denied", "permission_timeout"]).gte("created_at", cutoff);
      if ((count ?? 0) >= 3) {
        await notifyAdmins(supabase, tenantId, "Repeated location permission denials", `User had ${count} location denials in the last 30 minutes.`, "/admin/geofences", {
          user_id: userId,
          count
        });
      }
    }
  } catch {
  }
  return {
    ok: true
  };
});
const listGeofenceAudit_createServerFn_handler = createServerRpc({
  id: "66e9738c0be1073e724d7b54d6865773ec183a6e2a186433b93e03f9001da63d",
  name: "listGeofenceAudit",
  filename: "src/lib/geofence-audit.functions.ts"
}, (opts) => listGeofenceAudit.__executeServer(opts));
const listGeofenceAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  geofence_id: stringType().uuid().optional(),
  actor_user_id: stringType().uuid().optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  limit: numberType().int().min(1).max(2e3).default(200),
  suspicious_only: booleanType().optional()
}).parse(d ?? {})).handler(listGeofenceAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("geofence_audit_log").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.geofence_id) q = q.eq("geofence_id", data.geofence_id);
  if (data.actor_user_id) q = q.eq("actor_user_id", data.actor_user_id);
  if (data.from) q = q.gte("created_at", data.from);
  if (data.to) q = q.lte("created_at", data.to);
  if (data.suspicious_only) q = q.eq("is_suspicious", true);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    rows: rows ?? []
  };
});
export {
  listGeofenceAudit_createServerFn_handler,
  logGeofenceEvent_createServerFn_handler
};
