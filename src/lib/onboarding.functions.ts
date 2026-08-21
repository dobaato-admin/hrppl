import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

// Checklists (admin)
export const upsertChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(120),
    description: z.string().max(2000).nullable().optional(),
    isDefault: z.boolean().default(false),
    countryCode: z.string().max(3).nullable().optional(),
    branchId: z.string().uuid().nullable().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    employmentType: z.string().max(40).nullable().optional(),
    priority: z.number().int().min(0).max(9999).default(100),
    stages: z.array(z.object({
      key: z.string().min(1).max(60),
      label: z.string().min(1).max(120),
      order: z.number().int().min(0).max(999).default(0),
    })).max(20).default([]),
    items: z.array(z.object({
      key: z.string().min(1).max(60),
      label: z.string().min(1).max(200),
      required: z.boolean().default(true),
      stage: z.string().max(60).optional().nullable(),
    })).max(100),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    const payload: any = {
      tenant_id: prof.tenant_id,
      name: data.name,
      description: data.description ?? null,
      is_default: data.isDefault,
      country_code: data.countryCode ?? null,
      branch_id: data.branchId ?? null,
      department_id: data.departmentId ?? null,
      employment_type: data.employmentType ?? null,
      priority: data.priority,
      items: data.items,
      stages: data.stages,
    };
    if (data.id) {
      const { error } = await supabase.from("onboarding_checklists").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await supabase.from("onboarding_checklists").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// List all onboarding checklist packs for the current tenant (admin UI).
export const listChecklistPacks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) return { packs: [], branches: [], departments: [] };
    const [packsRes, branchesRes, deptsRes] = await Promise.all([
      supabase.from("onboarding_checklists")
        .select("id,name,description,country_code,branch_id,department_id,employment_type,priority,is_default,is_system_seed,items,stages,updated_at")
        .eq("tenant_id", prof.tenant_id)
        .order("country_code", { ascending: true, nullsFirst: true })
        .order("priority", { ascending: true })
        .order("updated_at", { ascending: false }),
      supabase.from("tenant_branches").select("id,name,country_code").eq("tenant_id", prof.tenant_id).order("name"),
      supabase.from("departments").select("id,name").eq("tenant_id", prof.tenant_id).order("name"),
    ]);
    return {
      packs: packsRes.data ?? [],
      branches: branchesRes.data ?? [],
      departments: deptsRes.data ?? [],
    };
  });

// Reorder packs within a scope by updating priority values.
export const reorderChecklistPacks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    ordered: z.array(z.object({ id: z.string().uuid(), priority: z.number().int().min(0).max(9999) })).min(1).max(200),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    for (const row of data.ordered) {
      const { error } = await supabase.from("onboarding_checklists")
        .update({ priority: row.priority })
        .eq("id", row.id).eq("tenant_id", prof.tenant_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Clone an existing pack (typically a system seed) into a new editable override
// scoped to a specific country/branch/dept/employment_type.
export const cloneChecklistPack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    sourceId: z.string().uuid(),
    name: z.string().min(1).max(120),
    countryCode: z.string().max(3).nullable().optional(),
    branchId: z.string().uuid().nullable().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    employmentType: z.string().max(40).nullable().optional(),
    priority: z.number().int().min(0).max(9999).default(50),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    const { data: src, error: srcErr } = await supabase.from("onboarding_checklists")
      .select("items,stages,description").eq("id", data.sourceId).maybeSingle();
    if (srcErr || !src) throw new Error("Source pack not found");
    const { data: row, error } = await supabase.from("onboarding_checklists").insert({
      tenant_id: prof.tenant_id,
      name: data.name,
      description: (src as any).description ?? null,
      is_default: false,
      is_system_seed: false,
      country_code: data.countryCode ?? null,
      branch_id: data.branchId ?? null,
      department_id: data.departmentId ?? null,
      employment_type: data.employmentType ?? null,
      priority: data.priority,
      items: (src as any).items ?? [],
      stages: (src as any).stages ?? [],
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// Delete a non-system pack.
export const deleteChecklistPack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: row } = await supabase.from("onboarding_checklists")
      .select("is_system_seed").eq("id", data.id).maybeSingle();
    if ((row as any)?.is_system_seed) throw new Error("Cannot delete a system seed pack. Clone it to override.");
    const { error } = await supabase.from("onboarding_checklists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


// =====================================================
// Default assignment rules (per role / department)
// =====================================================

export const upsertDefaultAssignmentRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    checklistId: z.string().uuid(),
    departmentId: z.string().uuid().nullable().optional(),
    jobTitle: z.string().max(120).nullable().optional(),
    dueOffsetDays: z.number().int().min(0).max(3650).default(30),
    isActive: z.boolean().default(true),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    const payload = {
      tenant_id: prof.tenant_id,
      checklist_id: data.checklistId,
      department_id: data.departmentId ?? null,
      job_title: data.jobTitle?.trim() ? data.jobTitle.trim() : null,
      due_offset_days: data.dueOffsetDays,
      is_active: data.isActive,
      created_by: userId,
    };
    if (data.id) {
      const { error } = await supabase.from("onboarding_default_assignments").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await supabase.from("onboarding_default_assignments").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const deleteDefaultAssignmentRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    const { error } = await supabase.from("onboarding_default_assignments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Tick a checklist item (employee or admin)
export const toggleChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    employeeId: z.string().uuid(),
    checklistId: z.string().uuid(),
    itemKey: z.string().min(1).max(60),
    done: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: emp } = await supabase.from("employees").select("tenant_id,user_id").eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    if (data.done) {
      // Enforce stage progression for non-privileged callers (the employee themself).
      const roles = await getRoles(supabase, userId);
      const privileged = roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r));
      if (!privileged) {
        const { data: cl } = await supabase.from("onboarding_checklists")
          .select("items,stages").eq("id", data.checklistId).maybeSingle();
        if (cl) {
          const items = (cl.items ?? []) as Array<{ key: string; label: string; required: boolean; stage?: string | null }>;
          const stages = (cl.stages ?? []) as Array<{ key: string; label: string; order: number }>;
          const item = items.find((it) => it.key === data.itemKey);
          if (item && stages.length > 0) {
            const { computeUnlockedStages, STAGE_NONE_KEY } = await import("./onboarding-stage-rules");
            const { data: progRows } = await supabase.from("onboarding_progress")
              .select("checklist_id,item_key,approval_status")
              .eq("employee_id", data.employeeId).eq("checklist_id", data.checklistId);
            const unlocked = computeUnlockedStages(stages, items, (progRows ?? []) as any, data.checklistId);
            const stageKey = item.stage || STAGE_NONE_KEY;
            if (!unlocked.has(stageKey)) {
              throw new Error("Complete required items in earlier stages before starting this one.");
            }
          }
        }
      }
      const { error } = await supabase.from("onboarding_progress").upsert({
        tenant_id: emp.tenant_id, employee_id: data.employeeId, checklist_id: data.checklistId,
        item_key: data.itemKey, completed_by: userId, completed_at: new Date().toISOString(),
      }, { onConflict: "employee_id,checklist_id,item_key" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("onboarding_progress").delete()
        .eq("employee_id", data.employeeId).eq("checklist_id", data.checklistId).eq("item_key", data.itemKey);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Record an uploaded document (file already uploaded to storage by client)
export const recordEmployeeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    employeeId: z.string().uuid(),
    filePath: z.string().min(1).max(500),
    fileName: z.string().min(1).max(255),
    mimeType: z.string().max(200).optional(),
    sizeBytes: z.number().int().min(0).optional(),
    docType: z.string().max(60).default("other"),
    visibility: z.enum(["employee", "manager", "admin"]).default("employee"),
    notes: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: emp } = await supabase.from("employees").select("tenant_id,user_id").eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    const isOwner = emp.user_id === userId;
    if (!isOwner) {
      const roles = await getRoles(supabase, userId);
      if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
    } else if (data.visibility !== "employee") {
      throw new Error("Employees can only upload employee-visible files");
    }
    const { data: row, error } = await supabase.from("employee_documents").insert({
      tenant_id: emp.tenant_id, employee_id: data.employeeId, doc_type: data.docType,
      file_path: data.filePath, file_name: data.fileName, mime_type: data.mimeType ?? null,
      size_bytes: data.sizeBytes ?? null, uploaded_by: userId, visibility: data.visibility,
      notes: data.notes ?? null,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const getDocumentDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: doc, error } = await supabase.from("employee_documents").select("file_path,file_name").eq("id", data.documentId).maybeSingle();
    if (error || !doc) throw new Error("Not found or not authorized");
    const admin = await loadAdmin();
    const { data: signed, error: e2 } = await admin.storage.from("employee-documents").createSignedUrl(doc.file_path, 60);
    if (e2 || !signed) throw new Error("Failed to sign URL");
    return { url: signed.signedUrl, fileName: doc.file_name };
  });

export const deleteEmployeeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: doc } = await supabase.from("employee_documents").select("file_path").eq("id", data.documentId).maybeSingle();
    if (!doc) throw new Error("Not found");
    const admin = await loadAdmin();
    await admin.storage.from("employee-documents").remove([doc.file_path]);
    const { error } = await supabase.from("employee_documents").delete().eq("id", data.documentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =====================================================
// Onboarding assignments & manager sign-off
// =====================================================

function isManagerOrAdmin(roles: string[]) {
  return roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r));
}

export const assignChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    employeeId: z.string().uuid(),
    checklistId: z.string().uuid(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const { data: emp } = await supabase.from("employees").select("tenant_id").eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    const { data: row, error } = await supabase.from("onboarding_assignments").upsert({
      tenant_id: emp.tenant_id,
      employee_id: data.employeeId,
      checklist_id: data.checklistId,
      assigned_by: userId,
      due_date: data.dueDate ?? null,
      notes: data.notes ?? null,
      status: "in_progress",
    }, { onConflict: "employee_id,checklist_id" }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// Auto-apply default assignment rules for a freshly-created employee (or backfill).
// Matches rules where (department_id IS NULL OR matches employee.department_id)
// AND (job_title IS NULL OR case-insensitive matches employee.job_title).
export const applyDefaultAssignmentsForEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ employeeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const { data: emp } = await supabase.from("employees")
      .select("id,tenant_id,department_id,job_title,hire_date")
      .eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    const { data: rules } = await supabase.from("onboarding_default_assignments")
      .select("checklist_id,department_id,job_title,due_offset_days,is_active")
      .eq("tenant_id", emp.tenant_id).eq("is_active", true);
    const matching = (rules ?? []).filter((r: any) => {
      const deptOk = !r.department_id || r.department_id === emp.department_id;
      const titleOk = !r.job_title || (emp.job_title && emp.job_title.trim().toLowerCase() === String(r.job_title).trim().toLowerCase());
      return deptOk && titleOk;
    });
    if (matching.length === 0) return { ok: true, assigned: 0 };
    const hire = emp.hire_date ? new Date(emp.hire_date) : new Date();
    const rows = matching.map((r: any) => {
      const due = new Date(hire); due.setDate(due.getDate() + (r.due_offset_days ?? 30));
      return {
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        checklist_id: r.checklist_id,
        assigned_by: userId,
        due_date: due.toISOString().slice(0, 10),
        status: "in_progress",
      };
    });
    const { error } = await supabase.from("onboarding_assignments")
      .upsert(rows, { onConflict: "employee_id,checklist_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true, assigned: rows.length };
  });

export const updateAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    assignmentId: z.string().uuid(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    status: z.enum(["in_progress", "completed", "signed_off", "cancelled"]).optional(),
    notes: z.string().max(1000).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const patch: any = {};
    if (data.dueDate !== undefined) patch.due_date = data.dueDate;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.status) {
      patch.status = data.status;
      if (data.status === "signed_off") {
        patch.signed_off_by = userId;
        patch.signed_off_at = new Date().toISOString();
      }
    }
    const { error } = await supabase.from("onboarding_assignments").update(patch).eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const signOffAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    assignmentId: z.string().uuid(),
    notes: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const { error } = await supabase.from("onboarding_assignments").update({
      status: "signed_off",
      signed_off_by: userId,
      signed_off_at: new Date().toISOString(),
      notes: data.notes ?? null,
    }).eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ assignmentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const { error } = await supabase.from("onboarding_assignments").delete().eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reviewChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    progressId: z.string().uuid(),
    decision: z.enum(["approved", "rejected"]),
    notes: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!isManagerOrAdmin(roles)) throw new Error("Not authorized");
    const { error } = await supabase.from("onboarding_progress").update({
      approval_status: data.decision,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      approval_notes: data.notes ?? null,
    }).eq("id", data.progressId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


/**
 * Whether the signed-in employee has finished their own onboarding (§1 #1).
 *
 * Exists so the shell can drop the "Onboarding" nav entry once there is nothing
 * left to do — leaving it there is what made the task feel permanent. Kept
 * deliberately small: it runs on every authenticated page render, so it returns
 * two booleans and nothing else.
 */
export const getMyOnboardingCompletion = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: emp } = await supabase
      .from("employees").select("id").eq("user_id", userId).maybeSingle();
    if (!emp) return { hasOnboarding: false, complete: false };

    const { data: assignments } = await supabase
      .from("onboarding_assignments")
      .select("checklist_id")
      .eq("employee_id", emp.id)
      .neq("status", "cancelled");

    const checklistIds = [...new Set((assignments ?? []).map((a: { checklist_id: string }) => a.checklist_id))];
    if (checklistIds.length === 0) return { hasOnboarding: false, complete: false };

    const [{ data: checklists }, { data: progress }] = await Promise.all([
      supabase.from("onboarding_checklists").select("id,items").in("id", checklistIds),
      supabase
        .from("onboarding_progress")
        .select("checklist_id,item_key,approval_status")
        .eq("employee_id", emp.id),
    ]);

    const { computeOnboardingCompletion } = await import("@/lib/onboarding-completion");
    const result = computeOnboardingCompletion(
      (checklists ?? []) as never,
      (progress ?? []) as never,
    );
    return { hasOnboarding: true, complete: result.complete };
  });
