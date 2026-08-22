import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { distanceMeters } from "./geofences.functions-C8KvPefL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, B as enumType, z as stringType } from "../_libs/zod.mjs";
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
import "./createSsrRpc-CRedQJGY.mjs";
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
const listReconciliation_createServerFn_handler = createServerRpc({
  id: "e4ed6ea3c7a177936390ea01be671b67dfde284c55431c074f3bd3568513ab9c",
  name: "listReconciliation",
  filename: "src/lib/geofence-reconciliation.functions.ts"
}, (opts) => listReconciliation.__executeServer(opts));
const listReconciliation = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["open", "reviewed", "resolved", "dismissed", "all"]).default("open"),
  limit: numberType().int().min(1).max(500).default(200)
}).parse(d ?? {})).handler(listReconciliation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("geofence_reconciliation").select("*").order("event_time", {
    ascending: false
  }).limit(data.limit);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    rows: rows ?? []
  };
});
const resolveReconciliation_createServerFn_handler = createServerRpc({
  id: "4b7e5bcbafcd4221892bf5095ae7fc86cbf11611a3f6a190929ffb77b66da2e6",
  name: "resolveReconciliation",
  filename: "src/lib/geofence-reconciliation.functions.ts"
}, (opts) => resolveReconciliation.__executeServer(opts));
const resolveReconciliation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["reviewed", "resolved", "dismissed"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(resolveReconciliation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("geofence_reconciliation").update({
    status: data.status,
    resolution_notes: data.notes ?? null,
    resolved_by: userId,
    resolved_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const runReconciliation_createServerFn_handler = createServerRpc({
  id: "d2099c667ea0e2840c941a1603a9d7c0c7cf1046abd9e62126e3fae6c7fb9b7b",
  name: "runReconciliation",
  filename: "src/lib/geofence-reconciliation.functions.ts"
}, (opts) => runReconciliation.__executeServer(opts));
const runReconciliation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  lookback_hours: numberType().int().min(1).max(720).default(48)
}).parse(d ?? {})).handler(runReconciliation_createServerFn_handler, async ({
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
  const tenantId = profile?.tenant_id;
  if (!tenantId) throw new Error("No tenant");
  return doReconcile(supabase, tenantId, data.lookback_hours);
});
async function doReconcile(supabase, tenantId, lookbackHours) {
  const since = new Date(Date.now() - lookbackHours * 3600 * 1e3).toISOString();
  const {
    data: audits
  } = await supabase.from("geofence_audit_log").select("*").eq("tenant_id", tenantId).gte("created_at", since).in("action", ["capture", "tracking_started", "tracking_stopped", "suspicious_flagged"]);
  const {
    data: punches
  } = await supabase.from("attendance_entries").select("*").eq("tenant_id", tenantId).gte("created_at", since);
  const {
    data: fences
  } = await supabase.from("sign_geofences").select("*").eq("tenant_id", tenantId);
  const fenceById = new Map((fences ?? []).map((f) => [f.id, f]));
  const created = [];
  const WINDOW_MS = 15 * 60 * 1e3;
  for (const a of audits ?? []) {
    if (a.action !== "capture") continue;
    const at = new Date(a.created_at).getTime();
    const match = (punches ?? []).find((p) => {
      const pt = p.clock_in ? new Date(p.clock_in).getTime() : new Date(p.created_at).getTime();
      return Math.abs(pt - at) <= WINDOW_MS;
    });
    if (!match) {
      created.push({
        tenant_id: tenantId,
        geofence_id: a.geofence_id,
        actor_user_id: a.actor_user_id,
        event_time: a.created_at,
        event_type: "enter",
        audit_log_id: a.id,
        mismatch_type: "no_attendance_for_enter",
        details: {
          accuracy_m: a.accuracy_m,
          suspicious: a.is_suspicious
        }
      });
    } else if (a.is_suspicious) {
      created.push({
        tenant_id: tenantId,
        geofence_id: a.geofence_id,
        actor_user_id: a.actor_user_id,
        attendance_entry_id: match.id,
        event_time: a.created_at,
        event_type: "capture",
        audit_log_id: a.id,
        mismatch_type: "accuracy_low",
        details: {
          reason: a.suspicious_reason,
          accuracy_m: a.accuracy_m
        }
      });
    }
  }
  for (const p of punches ?? []) {
    if (p.clock_in_latitude == null || p.clock_in_longitude == null) continue;
    const pt = p.clock_in ? new Date(p.clock_in).getTime() : new Date(p.created_at).getTime();
    const nearby = (audits ?? []).find((a) => a.action === "capture" && Math.abs(new Date(a.created_at).getTime() - pt) <= WINDOW_MS);
    if (!nearby) {
      created.push({
        tenant_id: tenantId,
        geofence_id: p.clock_in_geofence_id ?? null,
        attendance_entry_id: p.id,
        event_time: p.clock_in ?? p.created_at,
        event_type: "enter",
        mismatch_type: "no_geofence_for_punch",
        details: {
          source: p.source,
          distance_m: p.clock_in_distance_meters
        }
      });
      continue;
    }
    if (p.clock_in_geofence_id) {
      const f = fenceById.get(p.clock_in_geofence_id);
      if (f) {
        const dist = distanceMeters(Number(p.clock_in_latitude), Number(p.clock_in_longitude), Number(f.latitude), Number(f.longitude));
        if (dist > Number(f.radius_meters) * 1.2) {
          created.push({
            tenant_id: tenantId,
            geofence_id: f.id,
            attendance_entry_id: p.id,
            event_time: p.clock_in ?? p.created_at,
            event_type: "enter",
            audit_log_id: nearby.id,
            mismatch_type: "outside_window",
            details: {
              distance_m: Math.round(dist),
              radius_m: f.radius_meters
            }
          });
        }
      }
    }
  }
  if (created.length) {
    const {
      data: existing
    } = await supabase.from("geofence_reconciliation").select("audit_log_id, attendance_entry_id, mismatch_type").eq("tenant_id", tenantId).gte("event_time", since);
    const seen = new Set((existing ?? []).map((e) => `${e.audit_log_id ?? ""}|${e.attendance_entry_id ?? ""}|${e.mismatch_type}`));
    const fresh = created.filter((c) => !seen.has(`${c.audit_log_id ?? ""}|${c.attendance_entry_id ?? ""}|${c.mismatch_type}`));
    if (fresh.length) {
      await supabase.from("geofence_reconciliation").insert(fresh);
    }
    return {
      scanned: (audits?.length ?? 0) + (punches?.length ?? 0),
      created: fresh.length
    };
  }
  return {
    scanned: (audits?.length ?? 0) + (punches?.length ?? 0),
    created: 0
  };
}
export {
  listReconciliation_createServerFn_handler,
  resolveReconciliation_createServerFn_handler,
  runReconciliation_createServerFn_handler
};
