import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy_m: z.number().min(0).max(100000).optional(),
  t_offset_ms: z.number().int().min(0).optional(),
});
const TraceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  points: z.array(PointSchema).max(5000),
});

export const listSimTraces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("geofence_sim_traces").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return { traces: data ?? [] };
  });

export const saveSimTrace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TraceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const payload = {
      tenant_id: tenantId,
      name: data.name,
      description: data.description ?? null,
      points: data.points,
      created_by: userId,
    };
    const { data: row, error } = data.id
      ? await supabase.from("geofence_sim_traces").update(payload).eq("id", data.id).select().single()
      : await supabase.from("geofence_sim_traces").insert(payload).select().single();
    if (error) throw error;
    return { trace: row };
  });

export const deleteSimTrace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase.from("geofence_sim_traces").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
