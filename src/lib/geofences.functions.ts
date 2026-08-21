import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

export const listGeofences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase.from("sign_geofences").select("*").order("name");
    if (error) throw error;
    return { geofences: data ?? [] };
  });

const FenceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().int().min(25).max(5000),
  notes: z.string().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
  background_tracking_enabled: z.boolean().optional().default(false),
  min_accuracy_meters: z.number().int().min(5).max(2000).optional().default(100),
});

export const upsertGeofence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FenceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
    const payload = { ...data, tenant_id: profile.tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("sign_geofences").update(payload).eq("id", data.id).select().single()
      : await supabase.from("sign_geofences").insert(payload).select().single();
    if (error) throw error;
    return { geofence: row };
  });

export const deleteGeofence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("sign_geofences").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Haversine — meters between two coords
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
