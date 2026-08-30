import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { distanceMeters } from "@/lib/geofences.functions";

export const listReconciliation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      status: z.enum(["open", "reviewed", "resolved", "dismissed", "all"]).default("open"),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase.from("geofence_reconciliation").select("*")
      .order("event_time", { ascending: false }).limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [] };
  });

export const resolveReconciliation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["reviewed", "resolved", "dismissed"]),
      notes: z.string().max(1000).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { error } = await supabase.from("geofence_reconciliation")
      .update({
        status: data.status,
        resolution_notes: data.notes ?? null,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Compare recent geofence capture events vs attendance punches and create
 * reconciliation rows for mismatches. Idempotent-ish via a lookup before insert.
 * Window: last `lookback_hours` (default 48).
 */
export const runReconciliation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ lookback_hours: z.number().int().min(1).max(720).default(48) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
    const tenantId = profile?.tenant_id;
    if (!tenantId) throw new Error("No tenant");
    return doReconcile(supabase, tenantId, data.lookback_hours);
  });

export async function doReconcile(supabase: any, tenantId: string, lookbackHours: number) {
  const since = new Date(Date.now() - lookbackHours * 3600 * 1000).toISOString();

  const { data: audits } = await supabase
    .from("geofence_audit_log").select("*")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .in("action", ["capture", "tracking_started", "tracking_stopped", "suspicious_flagged"]);

  const { data: punches } = await supabase
    .from("attendance_entries").select("*")
    .eq("tenant_id", tenantId)
    .gte("created_at", since);

  const { data: fences } = await supabase
    .from("sign_geofences").select("*").eq("tenant_id", tenantId);

  const fenceById = new Map((fences ?? []).map((f: any) => [f.id, f]));
  const created: any[] = [];
  const WINDOW_MS = 15 * 60 * 1000;

  // 1) capture/enter without nearby attendance punch
  for (const a of audits ?? []) {
    if (a.action !== "capture") continue;
    const at = new Date(a.created_at).getTime();
    const match = (punches ?? []).find((p: any) => {
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
        details: { accuracy_m: a.accuracy_m, suspicious: a.is_suspicious },
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
        details: { reason: a.suspicious_reason, accuracy_m: a.accuracy_m },
      });
    }
  }

  // 2) attendance punch with no nearby geofence capture / too far from fence
  //
  // A remote (approved-WFH) punch is exempt from both checks below. It was
  // already classified correctly at punch time — wfh_outside_fence or
  // accuracy_low, written straight to this same table by clockIn/clockOut —
  // and it is exactly the class of punch least likely to have a correlated
  // background capture near an office fence, since the whole point of the
  // day is not being at one. Without this, every WFH punch this cron ever
  // saw was re-flagged a second time as a plain no_geofence_for_punch
  // anomaly, mislabelling a sanctioned remote day as an unexplained one.
  for (const p of punches ?? []) {
    if (p.work_location === "remote") continue;
    if (p.clock_in_latitude == null || p.clock_in_longitude == null) continue;
    const pt = p.clock_in ? new Date(p.clock_in).getTime() : new Date(p.created_at).getTime();
    const nearby = (audits ?? []).find((a: any) =>
      a.action === "capture" && Math.abs(new Date(a.created_at).getTime() - pt) <= WINDOW_MS);
    if (!nearby) {
      created.push({
        tenant_id: tenantId,
        geofence_id: p.clock_in_geofence_id ?? null,
        attendance_entry_id: p.id,
        event_time: p.clock_in ?? p.created_at,
        event_type: "enter",
        mismatch_type: "no_geofence_for_punch",
        details: { source: p.source, distance_m: p.clock_in_distance_meters },
      });
      continue;
    }
    if (p.clock_in_geofence_id) {
      const f: any = fenceById.get(p.clock_in_geofence_id);
      if (f) {
        const dist = distanceMeters(
          Number(p.clock_in_latitude), Number(p.clock_in_longitude),
          Number(f.latitude), Number(f.longitude),
        );
        if (dist > Number(f.radius_meters) * 1.2) {
          created.push({
            tenant_id: tenantId,
            geofence_id: f.id,
            attendance_entry_id: p.id,
            event_time: p.clock_in ?? p.created_at,
            event_type: "enter",
            audit_log_id: nearby.id,
            mismatch_type: "outside_window",
            details: { distance_m: Math.round(dist), radius_m: f.radius_meters },
          });
        }
      }
    }
  }

  if (created.length) {
    // Best-effort dedupe: skip rows that already exist with same audit/entry+mismatch
    const { data: existing } = await supabase
      .from("geofence_reconciliation")
      .select("audit_log_id, attendance_entry_id, mismatch_type")
      .eq("tenant_id", tenantId)
      .gte("event_time", since);
    const seen = new Set((existing ?? []).map((e: any) =>
      `${e.audit_log_id ?? ""}|${e.attendance_entry_id ?? ""}|${e.mismatch_type}`));
    const fresh = created.filter((c) =>
      !seen.has(`${c.audit_log_id ?? ""}|${c.attendance_entry_id ?? ""}|${c.mismatch_type}`));
    if (fresh.length) {
      await supabase.from("geofence_reconciliation").insert(fresh);
    }
    return { scanned: (audits?.length ?? 0) + (punches?.length ?? 0), created: fresh.length };
  }
  return { scanned: (audits?.length ?? 0) + (punches?.length ?? 0), created: 0 };
}
