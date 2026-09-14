import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

const ACTIONS = [
  "create", "update", "delete",
  "capture", "manual_edit", "permission_denied",
  "permission_timeout", "tracking_started", "tracking_stopped",
  "suspicious_flagged", "background_enabled", "background_disabled",
  "simulation_run", "simulation_point",
] as const;

const LogSchema = z.object({
  geofence_id: z.string().uuid().nullable().optional(),
  action: z.enum(ACTIONS),
  source: z.enum(["device", "manual", "map", "background", "simulation"]).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  accuracy_m: z.number().min(0).max(100000).nullable().optional(),
  is_suspicious: z.boolean().optional(),
  suspicious_reason: z.string().max(280).nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

async function notifyAdmins(
  supabase: any,
  tenantId: string,
  title: string,
  body: string,
  link: string,
  metadata: Record<string, any>,
) {
  // Fetch admins for this tenant
  const { data: admins } = await supabase
    .from("user_roles")
    .select("user_id, profiles!inner(tenant_id)")
    .in("role", ["org_admin", "super_admin", "hr"])
    .eq("profiles.tenant_id", tenantId);
  if (!admins?.length) return;
  const rows = admins.map((a: any) => ({
    user_id: a.user_id,
    tenant_id: tenantId,
    kind: "geofence_alert",
    title,
    body,
    link,
    metadata,
  }));
  await supabase.from("in_app_notifications").insert(rows);
}

export const logGeofenceEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const callerTenantId = await requireTenantId(supabase, userId);
    const tenantId = callerTenantId as string;
    const { data: row, error } = await supabase.from("geofence_audit_log").insert({
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
      metadata: data.metadata ?? {},
    }).select().single();
    if (error) throw error;

    // Real-time admin alerts: suspicious event OR repeated permission_denied
    try {
      if (data.is_suspicious) {
        await notifyAdmins(
          supabase, tenantId,
          "Suspicious geofence event",
          data.suspicious_reason ?? "A geofence capture was flagged as suspicious.",
          "/admin/geofences",
          { audit_id: row.id, geofence_id: data.geofence_id ?? null },
        );
      } else if (data.action === "permission_denied" || data.action === "permission_timeout") {
        // count recent denials by this user (last 30m)
        const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from("geofence_audit_log")
          .select("id", { count: "exact", head: true })
          .eq("actor_user_id", userId)
          .in("action", ["permission_denied", "permission_timeout"])
          .gte("created_at", cutoff);
        if ((count ?? 0) >= 3) {
          await notifyAdmins(
            supabase, tenantId,
            "Repeated location permission denials",
            `User had ${count} location denials in the last 30 minutes.`,
            "/admin/geofences",
            { user_id: userId, count },
          );
        }
      }
    } catch {
      /* notification failures shouldn't block the audit write */
    }
    return { ok: true };
  });

export const listGeofenceAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      geofence_id: z.string().uuid().optional(),
      actor_user_id: z.string().uuid().optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      limit: z.number().int().min(1).max(2000).default(200),
      suspicious_only: z.boolean().optional(),
    }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase.from("geofence_audit_log").select("*")
      .order("created_at", { ascending: false }).limit(data.limit);
    if (data.geofence_id) q = q.eq("geofence_id", data.geofence_id);
    if (data.actor_user_id) q = q.eq("actor_user_id", data.actor_user_id);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.suspicious_only) q = q.eq("is_suspicious", true);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [] };
  });
