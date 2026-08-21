import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const RecordInput = z.object({
  employeeId: z.string().uuid(),
  incidentType: z.string().min(1).max(120),
  severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
  occurredAt: z.string().optional(),
  location: z.string().max(255).optional(),
  description: z.string().min(1).max(5000),
  treatmentNotes: z.string().max(5000).optional(),
  requiresCase: z.boolean().default(false),
  reportedToAuthority: z.boolean().default(false),
  confidential: z.boolean().default(true),
});

async function assertHr(ctx: any) {
  const { data: roles } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (!r.some((x: string) => ["org_admin", "super_admin", "manager"].includes(x))) {
    throw new Error("Not authorized");
  }
}

export const recordMedicalIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecordInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertHr(context);
    const { data: emp } = await context.supabase
      .from("employees")
      .select("tenant_id")
      .eq("id", data.employeeId)
      .single();
    if (!emp) throw new Error("Employee not found");
    const { data: row, error } = await context.supabase
      .from("medical_incidents")
      .insert({
        tenant_id: (emp as any).tenant_id,
        employee_id: data.employeeId,
        incident_type: data.incidentType,
        severity: data.severity,
        occurred_at: data.occurredAt ?? new Date().toISOString(),
        location: data.location,
        description: data.description,
        treatment_notes: data.treatmentNotes,
        requires_case: data.requiresCase,
        reported_to_authority: data.reportedToAuthority,
        confidential: data.confidential,
        created_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { incident: row };
  });

export const listMedicalIncidents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ employeeId: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("medical_incidents")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(200);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    // Audit: record this medical view (RLS already blocks anyone who isn't HR/admin/the employee themselves)
    const hadConfidential = (rows ?? []).some((r: any) => r.confidential);
    try {
      await context.supabase.rpc("log_event_access", {
        _resource_type: "medical_incident",
        _resource_id: null as any,
        _employee_id: (data.employeeId ?? null) as any,
        _action: "list",
        _was_confidential: hadConfidential,
        _metadata: { count: rows?.length ?? 0 },
      });
    } catch {}
    return { incidents: rows ?? [] };
  });

// ============ ATTACHMENTS ============
export const recordMedicalAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    incident_id: z.string().uuid(),
    storage_path: z.string().min(1).max(500),
    file_name: z.string().min(1).max(255),
    mime_type: z.string().max(120).optional().nullable(),
    size_bytes: z.number().int().nonnegative().max(50 * 1024 * 1024).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: inc } = await supabase
      .from("medical_incidents").select("tenant_id").eq("id", data.incident_id).single();
    if (!inc) throw new Error("Incident not found");
    const { data: row, error } = await supabase.from("medical_attachments").insert({
      ...data, tenant_id: (inc as any).tenant_id, uploaded_by: userId,
    }).select().single();
    if (error) throw new Error(error.message);
    return { attachment: row };
  });

export const listMedicalAttachments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ incident_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase.from("medical_attachments")
      .select("*").eq("incident_id", data.incident_id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { attachments: rows ?? [] };
  });

export const deleteMedicalAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: row } = await supabase.from("medical_attachments").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) await supabase.storage.from("medical-files").remove([row.storage_path]);
    const { error } = await supabase.from("medical_attachments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMedicalAttachmentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ storage_path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: signed, error } = await supabase.storage
      .from("medical-files").createSignedUrl(data.storage_path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
