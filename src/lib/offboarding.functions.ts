import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyEmployeeId, getTenantId, requireTenantId } from "@/lib/tenant-scope";

export const listOffboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("offboarding_cases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((c: any) => c.employee_id)));
    const empMap: Record<string, any> = {};
    if (ids.length) {
      const { data: emps } = await context.supabase
        .from("employees").select("id,first_name,last_name,email,job_title").in("id", ids);
      for (const e of emps ?? []) empMap[(e as any).id] = e;
    }
    const cases = (data ?? []).map((c: any) => ({ ...c, employees: empMap[c.employee_id] ?? null }));
    return { cases };
  });

export const createOffboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      employeeId: z.string().uuid(),
      reason: z.enum(["resignation","termination","redundancy","retirement","end_of_contract","mutual_separation","death","other"]).default("resignation"),
      reasonNotes: z.string().max(2000).optional(),
      noticeGivenOn: z.string().optional(),
      lastWorkingDay: z.string().optional(),
      confidential: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // The caller's own tenant is the authority here, NOT the selected
    // employee's. Copying tenant_id off the employee row is what produced
    // "new row violates row-level security policy for table offboarding_cases":
    // the picker leaked employees from other tenants (RLS has no tenant
    // predicate for super_admin), and the resulting row failed WITH CHECK,
    // which requires tenant_id = user_tenant_id(auth.uid()).
    //
    // Checking it here turns an opaque Postgres error into a clear one, and
    // holds even if a caller crafts the request by hand.
    const callerTenantId = await requireTenantId(context.supabase, context.userId);

    const { data: emp } = await context.supabase
      .from("employees")
      .select("tenant_id,manager_id")
      .eq("id", data.employeeId)
      .single();
    if (!emp) throw new Error("Employee not found");
    if ((emp as { tenant_id: string }).tenant_id !== callerTenantId) {
      throw new Error("That employee belongs to a different organization.");
    }

    // Offboarding yourself is never intentional. The picker already excludes
    // the caller; this stops a hand-crafted request doing it anyway.
    const myEmployeeId = await getMyEmployeeId(context.supabase, context.userId);
    if (myEmployeeId && myEmployeeId === data.employeeId) {
      throw new Error("You cannot start an offboarding case for yourself.");
    }

    const { data: row, error } = await context.supabase.from("offboarding_cases").insert({
      tenant_id: callerTenantId,
      employee_id: data.employeeId,
      manager_id: (emp as any).manager_id,
      reason: data.reason as any,
      reason_notes: data.reasonNotes,
      notice_given_on: data.noticeGivenOn || null,
      last_working_day: data.lastWorkingDay || null,
      confidential: data.confidential,
      hr_owner_id: context.userId,
      created_by: context.userId,
    }).select().single();
    if (error) throw new Error(error.message);
    return { case: row };
  });

export const getOffboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: c, error } = await context.supabase
      .from("offboarding_cases")
      .select("*")
      .eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const { data: emp } = await context.supabase
      .from("employees").select("id,first_name,last_name,email,job_title").eq("id", (c as any).employee_id).maybeSingle();
    const { data: items } = await context.supabase
      .from("offboarding_checklist_items")
      .select("*")
      .eq("case_id", data.id)
      .order("sort_order", { ascending: true });
    return { case: { ...(c as any), employees: emp }, items: items ?? [] };
  });

export const updateOffboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["initiated","in_progress","clearance_pending","completed","cancelled"]).optional(),
      lastWorkingDay: z.string().optional(),
      exitInterviewNotes: z.string().max(5000).optional(),
      exitInterviewRating: z.number().int().min(1).max(5).optional(),
      rehireEligible: z.boolean().optional(),
      knowledgeTransferNotes: z.string().max(5000).optional(),
      finalPayStatus: z.string().max(120).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: any = {};
    if (data.status) patch.status = data.status;
    if (data.lastWorkingDay) patch.last_working_day = data.lastWorkingDay;
    if (data.exitInterviewNotes !== undefined) { patch.exit_interview_notes = data.exitInterviewNotes; patch.exit_interview_at = new Date().toISOString(); patch.exit_interview_by = context.userId; }
    if (data.exitInterviewRating !== undefined) patch.exit_interview_rating = data.exitInterviewRating;
    if (data.rehireEligible !== undefined) patch.rehire_eligible = data.rehireEligible;
    if (data.knowledgeTransferNotes !== undefined) patch.knowledge_transfer_notes = data.knowledgeTransferNotes;
    if (data.finalPayStatus !== undefined) patch.final_pay_status = data.finalPayStatus;
    if (data.status === "completed") patch.closed_at = new Date().toISOString();
    const { error } = await context.supabase.from("offboarding_cases").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ itemId: z.string().uuid(), completed: z.boolean(), notes: z.string().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("offboarding_checklist_items").update({
      completed: data.completed,
      completed_at: data.completed ? new Date().toISOString() : null,
      completed_by: data.completed ? context.userId : null,
      completion_notes: data.notes ?? null,
    }).eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      caseId: z.string().uuid(),
      title: z.string().min(1).max(255),
      category: z.string().max(40).default("general"),
      ownerRole: z.enum(["hr","manager","employee","it","finance"]).default("hr"),
      dueDate: z.string().optional(),
      isBlocking: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: c } = await context.supabase.from("offboarding_cases").select("tenant_id").eq("id", data.caseId).single();
    if (!c) throw new Error("Case not found");
    const { error } = await context.supabase.from("offboarding_checklist_items").insert({
      tenant_id: (c as any).tenant_id,
      case_id: data.caseId,
      title: data.title,
      category: data.category,
      owner_role: data.ownerRole,
      due_date: data.dueDate || null,
      is_blocking: data.isBlocking,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myOffboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: emp } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
    if (!emp) return { case: null, items: [] };
    const { data: c } = await context.supabase
      .from("offboarding_cases")
      .select("*")
      .eq("employee_id", (emp as any).id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!c) return { case: null, items: [] };
    const { data: items } = await context.supabase
      .from("offboarding_checklist_items")
      .select("*").eq("case_id", (c as any).id).order("sort_order");
    return { case: c, items: items ?? [] };
  });

// ===== Phase 8: Offboarding checklist templates (per tenant + department + reason) =====

async function offbTenantId(ctx: any): Promise<string> {
  const tenantId = await requireTenantId(ctx.supabase, ctx.userId);
  return tenantId as string;
}

export const listOffboardingTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Scoped explicitly. The writes below already go through offbTenantId(); the
    // read did not, so a super_admin saw every tenant's checklist templates and
    // could then edit one that offbTenantId would refuse to save.
    const tenantId = await getTenantId(context.supabase, context.userId);
    if (!tenantId) return { templates: [], items: [] };
    const { data: templates, error } = await context.supabase
      .from("offboarding_checklist_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (templates ?? []).map((t: any) => t.id);
    let items: any[] = [];
    if (ids.length) {
      const { data: rows } = await context.supabase
        .from("offboarding_checklist_template_items")
        .select("*")
        .in("template_id", ids)
        .order("sort_order");
      items = rows ?? [];
    }
    return { templates: templates ?? [], items };
  });

export const upsertOffboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      departmentId: z.string().uuid().nullable().optional(),
      reason: z.enum(["resignation","termination","redundancy","retirement","end_of_contract","mutual_separation","death","other"]).nullable().optional(),
      isDefault: z.boolean().default(false),
      isActive: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const t = await offbTenantId(context);
    const payload: any = {
      tenant_id: t,
      name: data.name,
      description: data.description ?? null,
      department_id: data.departmentId ?? null,
      reason: data.reason ?? null,
      is_default: data.isDefault,
      is_active: data.isActive,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("offboarding_checklist_templates").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    payload.created_by = context.userId;
    const { data: row, error } = await context.supabase
      .from("offboarding_checklist_templates").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as any).id };
  });

export const deleteOffboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("offboarding_checklist_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertOffboardingTemplateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      templateId: z.string().uuid(),
      title: z.string().min(1).max(255),
      category: z.string().max(40).default("general"),
      ownerRole: z.enum(["hr","manager","employee","it","finance"]).default("hr"),
      dueOffsetDays: z.number().int().min(-365).max(365).default(0),
      isBlocking: z.boolean().default(false),
      sortOrder: z.number().int().min(0).max(9999).default(0),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const t = await offbTenantId(context);
    const payload: any = {
      tenant_id: t,
      template_id: data.templateId,
      title: data.title,
      category: data.category,
      owner_role: data.ownerRole,
      due_offset_days: data.dueOffsetDays,
      is_blocking: data.isBlocking,
      sort_order: data.sortOrder,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("offboarding_checklist_template_items").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("offboarding_checklist_template_items").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as any).id };
  });

export const deleteOffboardingTemplateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("offboarding_checklist_template_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
