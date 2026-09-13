import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { throwPlain } from "@/lib/db-error";
import { getTenantAndRoles } from "@/lib/tenant-scope";

/**
 * T13 · Both reads go through the memoised, parallel resolver in
 * tenant-scope.ts. Every handler here opened with `await assertAdmin(...)`
 * followed by `await getTenant(...)` — two independent round trips taken one
 * after the other, and re-taken by each handler a page called. The guard is
 * unchanged; only the number of times the same two rows are fetched is.
 */
async function adminTenant(supabase: any, userId: string): Promise<string> {
  const { tenantId, roles } = await getTenantAndRoles(supabase, userId);
  if (!roles.some((r: string) => ["org_admin", "hr", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
  if (!tenantId) throw new Error("No tenant");
  return tenantId;
}

// ============================================================
// Onboarding checklist templates
// ============================================================

export const listOnboardingTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const [tpls, items, courses] = await Promise.all([
      supabase.from("onboarding_checklist_templates").select("*").eq("tenant_id", tenant_id).order("created_at", { ascending: false }),
      supabase.from("onboarding_checklist_template_items").select("*").eq("tenant_id", tenant_id).order("sort_order"),
      supabase.from("onboarding_checklist_template_courses").select("*").eq("tenant_id", tenant_id).order("sort_order"),
    ]);
    return { templates: tpls.data ?? [], items: items.data ?? [], courses: courses.data ?? [] };
  });

const onbTplItem = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(40).default("general"),
  owner_role: z.string().max(40).default("employee"),
  due_offset_days: z.number().int().min(-30).max(365).default(0),
  required: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(999).default(0),
});
const onbTplCourse = z.object({
  course_id: z.string().uuid(),
  due_offset_days: z.number().int().min(0).max(365).default(14),
  required: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(999).default(0),
});

/**
 * Build the rows for an onboarding template's tasks.
 *
 * Exported so `tests/template-items-insert.test.ts` can assert the one thing
 * that matters and is invisible at the call site: the returned rows must not
 * carry an `id` key **at all**. See the comment at the call site for why
 * `id: undefined` is not the same thing.
 */
export function buildTemplateItemRows<T extends { id?: string; sort_order?: number }>(
  items: T[],
  templateId: string,
  tenantId: string,
): Array<Omit<T, "id"> & { template_id: string; tenant_id: string; sort_order: number }> {
  return items.map(({ id: _existingItemId, ...rest }, idx) => ({
    ...(rest as Omit<T, "id">),
    template_id: templateId,
    tenant_id: tenantId,
    sort_order: rest.sort_order ?? idx,
  }));
}

export const upsertOnboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional().nullable(),
    department_id: z.string().uuid().optional().nullable(),
    role_target: z.string().max(60).optional().nullable(),
    is_default: z.boolean().default(false),
    is_active: z.boolean().default(true),
    items: z.array(onbTplItem).max(100).default([]),
    courses: z.array(onbTplCourse).max(50).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const base = {
      tenant_id,
      name: data.name,
      description: data.description ?? null,
      department_id: data.department_id ?? null,
      role_target: data.role_target ?? null,
      is_default: data.is_default,
      is_active: data.is_active,
      created_by: userId,
    };
    let id = data.id;
    if (id) {
      const { error } = await supabase.from("onboarding_checklist_templates").update(base).eq("id", id).eq("tenant_id", tenant_id);
      if (error) throwPlain(error, "Could not save the template.", "upsertOnboardingTemplate update");
    } else {
      const { data: created, error } = await supabase.from("onboarding_checklist_templates").insert(base).select("id").single();
      if (error) throwPlain(error, "Could not create the template.", "upsertOnboardingTemplate insert");
      id = created.id;
    }
    // Replace items & courses
    await supabase.from("onboarding_checklist_template_items").delete().eq("template_id", id);
    if (data.items.length) {
      const { error } = await supabase.from("onboarding_checklist_template_items").insert(
        // T20 · `id` is dropped by *omitting the key*, never by setting it to
        // `undefined`. postgrest-js builds the `columns` query parameter from
        // `Object.keys()` of every row, and `Object.keys({ id: undefined })`
        // still contains "id" — so the column was declared as one we were
        // inserting while `JSON.stringify` removed the value, and PostgREST
        // wrote NULL rather than falling back to `gen_random_uuid()`. Editing
        // a template that already had tasks failed with a not-null violation
        // on every save.
        buildTemplateItemRows(data.items, id, tenant_id)
      );
      if (error) throwPlain(error, "Could not save the template's tasks.", "upsertOnboardingTemplate items");
    }
    await supabase.from("onboarding_checklist_template_courses").delete().eq("template_id", id);
    if (data.courses.length) {
      const { error } = await supabase.from("onboarding_checklist_template_courses").insert(
        data.courses.map((c, idx) => ({ ...c, template_id: id, tenant_id, sort_order: c.sort_order ?? idx }))
      );
      if (error) throwPlain(error, "Could not save the template's courses.", "upsertOnboardingTemplate courses");
    }
    return { id };
  });

export const cloneOnboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), newName: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const { data: src } = await supabase.from("onboarding_checklist_templates").select("*").eq("id", data.id).eq("tenant_id", tenant_id).maybeSingle();
    if (!src) throw new Error("Template not found");
    const { data: created, error } = await supabase.from("onboarding_checklist_templates").insert({
      tenant_id, name: data.newName, description: src.description, department_id: src.department_id,
      role_target: src.role_target, is_default: false, is_active: true, created_by: userId,
    }).select("id").single();
    if (error) throwPlain(error, "Could not create the copy.", "cloneOnboardingTemplate insert");
    const newId = created.id;
    const { data: items } = await supabase.from("onboarding_checklist_template_items").select("*").eq("template_id", data.id);
    if (items?.length) {
      // A clone that copies the template but none of its tasks is worse than a
      // failed clone: the admin sees "Cloned", opens an empty checklist, and
      // has no reason to connect the two.
      const { error: itemErr } = await supabase.from("onboarding_checklist_template_items").insert(
        items.map((i: any) => ({ template_id: newId, tenant_id, title: i.title, description: i.description, category: i.category, owner_role: i.owner_role, due_offset_days: i.due_offset_days, required: i.required, sort_order: i.sort_order }))
      );
      if (itemErr) throwPlain(itemErr, "The copy was created but its tasks could not be copied.", "cloneOnboardingTemplate items");
    }
    const { data: courses } = await supabase.from("onboarding_checklist_template_courses").select("*").eq("template_id", data.id);
    if (courses?.length) {
      const { error: courseErr } = await supabase.from("onboarding_checklist_template_courses").insert(
        courses.map((c: any) => ({ template_id: newId, tenant_id, course_id: c.course_id, due_offset_days: c.due_offset_days, required: c.required, sort_order: c.sort_order }))
      );
      if (courseErr) throwPlain(courseErr, "The copy was created but its courses could not be copied.", "cloneOnboardingTemplate courses");
    }
    return { id: newId };
  });

export const deleteOnboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const { error } = await supabase.from("onboarding_checklist_templates").delete().eq("id", data.id).eq("tenant_id", tenant_id);
    if (error) throw error;
    return { ok: true };
  });

export const applyOnboardingTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    template_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    start_date: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const start = data.start_date ? new Date(data.start_date) : new Date();
    const { data: tpl } = await supabase.from("onboarding_checklist_templates").select("*").eq("id", data.template_id).eq("tenant_id", tenant_id).maybeSingle();
    if (!tpl) throw new Error("Template not found");
    const { data: items } = await supabase.from("onboarding_checklist_template_items").select("*").eq("template_id", data.template_id).order("sort_order");
    const { data: courses } = await supabase.from("onboarding_checklist_template_courses").select("*").eq("template_id", data.template_id).order("sort_order");

    // 1. Materialize an onboarding_checklists row from the template items
    const checklistItems = (items ?? []).map((i: any) => ({
      key: i.id, label: i.title, description: i.description, category: i.category,
      owner_role: i.owner_role, due_offset_days: i.due_offset_days, required: i.required, sort_order: i.sort_order,
    }));
    const { data: cl, error: clErr } = await supabase.from("onboarding_checklists").insert({
      tenant_id, name: `${tpl.name} — ${new Date().toISOString().slice(0, 10)}`, items: checklistItems, is_default: false,
    }).select("id").single();
    if (clErr) throw clErr;

    // 2. Create assignment
    const maxOffset = Math.max(0, ...checklistItems.map((i) => Number(i.due_offset_days) || 0));
    const due = new Date(start.getTime() + maxOffset * 86400000).toISOString().slice(0, 10);
    const { data: assign, error: aErr } = await supabase.from("onboarding_assignments").upsert({
      tenant_id, employee_id: data.employee_id, checklist_id: cl.id, assigned_by: userId, due_date: due, status: "in_progress",
    }, { onConflict: "employee_id,checklist_id" }).select("id").single();
    if (aErr) throw aErr;

    // 3. Enroll into linked courses
    let enrolled = 0;
    if (courses?.length) {
      const rows = courses.map((c: any) => ({
        tenant_id, course_id: c.course_id, employee_id: data.employee_id,
        due_date: new Date(start.getTime() + (c.due_offset_days ?? 14) * 86400000).toISOString().slice(0, 10),
        status: "assigned" as const, assigned_by: userId,
      }));
      const { error: eErr } = await supabase.from("training_enrollments").upsert(rows, { onConflict: "course_id,employee_id", ignoreDuplicates: true });
      if (!eErr) enrolled = rows.length;
    }
    return { assignment_id: assign.id, checklist_id: cl.id, enrolled };
  });

// ============================================================
// Training bundles
// ============================================================

export const listTrainingBundles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const [bundles, items, courses] = await Promise.all([
      supabase.from("training_bundles").select("*").eq("tenant_id", tenant_id).order("created_at", { ascending: false }),
      supabase.from("training_bundle_items").select("*").eq("tenant_id", tenant_id).order("sort_order"),
      supabase.from("training_courses").select("id,title,is_active").eq("tenant_id", tenant_id),
    ]);
    return { bundles: bundles.data ?? [], items: items.data ?? [], courses: courses.data ?? [] };
  });

export const upsertTrainingBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional().nullable(),
    target_role: z.string().max(60).optional().nullable(),
    is_active: z.boolean().default(true),
    items: z.array(z.object({
      course_id: z.string().uuid(),
      due_offset_days: z.number().int().min(0).max(365).default(14),
      required: z.boolean().default(true),
      sort_order: z.number().int().min(0).max(999).default(0),
    })).max(50).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const base = { tenant_id, name: data.name, description: data.description ?? null, target_role: data.target_role ?? null, is_active: data.is_active, created_by: userId };
    let id = data.id;
    if (id) {
      const { error } = await supabase.from("training_bundles").update(base).eq("id", id).eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { data: created, error } = await supabase.from("training_bundles").insert(base).select("id").single();
      if (error) throw error;
      id = created.id;
    }
    await supabase.from("training_bundle_items").delete().eq("bundle_id", id);
    if (data.items.length) {
      const { error } = await supabase.from("training_bundle_items").insert(
        data.items.map((i, idx) => ({ ...i, bundle_id: id, tenant_id, sort_order: i.sort_order ?? idx }))
      );
      if (error) throw error;
    }
    return { id };
  });

export const deleteTrainingBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const { error } = await supabase.from("training_bundles").delete().eq("id", data.id).eq("tenant_id", tenant_id);
    if (error) throw error;
    return { ok: true };
  });

export const applyTrainingBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    bundle_id: z.string().uuid(),
    employee_ids: z.array(z.string().uuid()).min(1).max(500),
    start_date: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const start = data.start_date ? new Date(data.start_date) : new Date();
    const { data: items } = await supabase.from("training_bundle_items").select("*").eq("bundle_id", data.bundle_id).eq("tenant_id", tenant_id);
    if (!items?.length) return { enrolled: 0 };
    const rows: any[] = [];
    for (const emp of data.employee_ids) {
      for (const it of items) {
        rows.push({
          tenant_id, course_id: it.course_id, employee_id: emp,
          due_date: new Date(start.getTime() + (it.due_offset_days ?? 14) * 86400000).toISOString().slice(0, 10),
          status: "assigned" as const, assigned_by: userId,
        });
      }
    }
    const { error } = await supabase.from("training_enrollments").upsert(rows, { onConflict: "course_id,employee_id", ignoreDuplicates: true });
    if (error) throw error;
    return { enrolled: rows.length };
  });

// ============================================================
// Document request templates (bundles of document templates)
// ============================================================

export const listDocumentRequestTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const [tpls, items, docTpls] = await Promise.all([
      supabase.from("document_request_templates").select("*").eq("tenant_id", tenant_id).order("created_at", { ascending: false }),
      supabase.from("document_request_template_items").select("*").eq("tenant_id", tenant_id).order("sort_order"),
      supabase.from("document_templates").select("id,name,doc_type,status").eq("tenant_id", tenant_id),
    ]);
    return { templates: tpls.data ?? [], items: items.data ?? [], documentTemplates: docTpls.data ?? [] };
  });

export const upsertDocumentRequestTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional().nullable(),
    trigger: z.string().max(40).optional().nullable(),
    is_active: z.boolean().default(true),
    items: z.array(z.object({
      document_template_id: z.string().uuid(),
      required_signature: z.boolean().default(true),
      due_offset_days: z.number().int().min(0).max(365).default(7),
      sort_order: z.number().int().min(0).max(999).default(0),
    })).max(50).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const base = { tenant_id, name: data.name, description: data.description ?? null, trigger: data.trigger ?? null, is_active: data.is_active, created_by: userId };
    let id = data.id;
    if (id) {
      const { error } = await supabase.from("document_request_templates").update(base).eq("id", id).eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { data: created, error } = await supabase.from("document_request_templates").insert(base).select("id").single();
      if (error) throw error;
      id = created.id;
    }
    await supabase.from("document_request_template_items").delete().eq("template_id", id);
    if (data.items.length) {
      const { error } = await supabase.from("document_request_template_items").insert(
        data.items.map((i, idx) => ({ ...i, template_id: id, tenant_id, sort_order: i.sort_order ?? idx }))
      );
      if (error) throw error;
    }
    return { id };
  });

export const deleteDocumentRequestTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const { error } = await supabase.from("document_request_templates").delete().eq("id", data.id).eq("tenant_id", tenant_id);
    if (error) throw error;
    return { ok: true };
  });

// ============================================================
// Lightweight employee picker for "apply" dialogs
// ============================================================
export const listActiveEmployees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await adminTenant(supabase, userId);
    const { data } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email, department_id")
      .eq("tenant_id", tenant_id)
      .eq("status", "active")
      .order("first_name");
    return { employees: data ?? [] };
  });
