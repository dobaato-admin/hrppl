import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function assertOrgAdmin(context: any) {
  const { supabase, userId } = context;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (!r.some((x: string) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const { data: prof } = await supabase
    .from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  return { tenantId: prof.tenant_id as string };
}

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: deps, error } = await supabase
      .from("departments")
      .select("id, name, parent_id, manager_id, created_at")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw new Error(error.message);
    // Headcount per department
    const { data: emps } = await supabase
      .from("employees")
      .select("department_id")
      .eq("tenant_id", tenantId)
      .neq("status", "terminated");
    const counts: Record<string, number> = {};
    for (const e of emps ?? []) {
      if (e.department_id) counts[e.department_id] = (counts[e.department_id] ?? 0) + 1;
    }
    return {
      departments: (deps ?? []).map((d: any) => ({ ...d, headcount: counts[d.id] ?? 0 })),
    };
  });

const UpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  parent_id: z.string().uuid().nullable().optional(),
  manager_id: z.string().uuid().nullable().optional(),
});

export const upsertDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    if (data.parent_id === data.id && data.id) {
      throw new Error("A department cannot be its own parent");
    }
    const payload = {
      tenant_id: tenantId,
      name: data.name,
      parent_id: data.parent_id ?? null,
      manager_id: data.manager_id ?? null,
    };
    const { data: row, error } = data.id
      ? await supabase.from("departments").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("departments").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { department: row };
  });

export const deleteDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("department_id", data.id);
    if ((count ?? 0) > 0) {
      throw new Error(`Cannot delete: ${count} employee(s) are still assigned to this department`);
    }
    const { error } = await supabase
      .from("departments").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
