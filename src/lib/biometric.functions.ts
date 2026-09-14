import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertOrgAdmin(supabase: any, userId: string): Promise<string> {
  // Returns caller tenant_id if they are org_admin or super_admin; throws otherwise.
  const { data: roles } = await supabase
    .from("user_roles").select("role").eq("user_id", userId)
    .in("role", ["org_admin", "super_admin"]);
  if (!roles?.length) throw new Error("Forbidden");
  const tenantId = await requireTenantId(supabase, userId);
  return tenantId as string;
}

export const listBiometricDevices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase.from("biometric_devices").select("*").order("name");
    if (error) throw error;
    return { devices: data ?? [] };
  });

const DeviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  vendor: z.enum(["zkteco","generic","suprema"]).default("zkteco"),
  device_serial: z.string().max(120).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  ip_address: z.string().max(80).optional().nullable(),
  is_active: z.boolean().default(true),
  config: z.record(z.string(), z.any()).default({}),
});

export const upsertBiometricDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeviceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const payload = { ...data, tenant_id: tenantId };
    const { data: row, error } = data.id
      ? await supabase.from("biometric_devices").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("biometric_devices").insert(payload).select().single();
    if (error) throw error;
    return { device: row };
  });

export const rotateDeviceSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const admin = await loadAdmin();
    // Verify the device belongs to caller's tenant before rotating with admin client.
    const { data: existing } = await admin
      .from("biometric_devices").select("id, tenant_id").eq("id", data.id).maybeSingle();
    if (!existing || existing.tenant_id !== tenantId) throw new Error("Forbidden");
    const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
    const newToken = Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { data: row, error } = await admin
      .from("biometric_devices")
      .update({ shared_secret: newSecret, webhook_token: newToken })
      .eq("id", data.id).eq("tenant_id", tenantId)
      .select("id,name,vendor,is_active,last_sync_at,last_punch_at").single();
    if (error) throw error;
    // Plaintext returned ONCE here; it's no longer readable through the Data API.
    return { device: row, shared_secret: newSecret, webhook_token: newToken };
  });

export const listMappings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ device_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows } = await supabase.from("biometric_user_mappings")
      .select("*, employees(first_name,last_name,email)").eq("device_id", data.device_id).order("raw_user_id");
    return { mappings: rows ?? [] };
  });

export const upsertMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    device_id: z.string().uuid(),
    raw_user_id: z.string().min(1).max(80),
    employee_id: z.string().uuid(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const { error } = await supabase.from("biometric_user_mappings").upsert({ ...data, tenant_id: tenantId }, { onConflict: "device_id,raw_user_id" });
    if (error) throw error;
    return { ok: true };
  });

export const listPunches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    device_id: z.string().uuid().optional(),
    employee_id: z.string().uuid().optional(),
    limit: z.number().int().positive().max(500).default(100),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase.from("biometric_punches")
      .select("*, biometric_devices(name), employees(first_name,last_name)")
      .order("punch_at", { ascending: false }).limit(data.limit);
    if (data.device_id) q = q.eq("device_id", data.device_id);
    if (data.employee_id) q = q.eq("employee_id", data.employee_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { punches: rows ?? [] };
  });

// Ingest punches called from the public webhook route (also reusable as admin "import").
const PunchInputSchema = z.object({
  raw_user_id: z.string().min(1).max(80),
  punch_at: z.string(),
  punch_type: z.enum(["in","out","break_in","break_out","unknown"]).default("unknown"),
  raw: z.record(z.string(), z.any()).default({}),
});

export async function ingestPunches(deviceId: string, source: string, punches: z.infer<typeof PunchInputSchema>[]) {
  const admin = await loadAdmin();
  const { data: device } = await admin.from("biometric_devices").select("*").eq("id", deviceId).single();
  if (!device || !device.is_active) throw new Error("Device not active");
  const { data: mappings } = await admin.from("biometric_user_mappings").select("raw_user_id,employee_id").eq("device_id", deviceId);
  const map = new Map<string, string>((mappings ?? []).map((m: any) => [m.raw_user_id, m.employee_id]));
  const rows = punches.map((p) => ({
    tenant_id: device.tenant_id, device_id: device.id,
    raw_user_id: p.raw_user_id, employee_id: map.get(p.raw_user_id) ?? null,
    punch_at: p.punch_at, punch_type: p.punch_type, source, raw: p.raw,
  }));
  let inserted = 0;
  if (rows.length) {
    const { error, count } = await admin.from("biometric_punches").upsert(rows, {
      onConflict: "device_id,raw_user_id,punch_at,punch_type", ignoreDuplicates: true, count: "exact",
    });
    if (error) throw error;
    inserted = count ?? 0;
  }
  const latest = punches.reduce((a, p) => (p.punch_at > a ? p.punch_at : a), "");
  await admin.from("biometric_devices").update({ last_sync_at: new Date().toISOString(), last_punch_at: latest || null }).eq("id", device.id);
  return { received: punches.length, inserted };
}

export const importPunchesManually = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    device_id: z.string().uuid(),
    punches: z.array(PunchInputSchema).min(1).max(2000),
  }).parse(d))
  .handler(async ({ data }) => ingestPunches(data.device_id, "manual", data.punches));
