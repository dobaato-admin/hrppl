import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function getTenant(context: any) {
  const { supabase, userId } = context;
  const callerTenantId = await requireTenantId(supabase, userId);
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role as string);
  const isAdmin = r.some((x: string) => ["org_admin", "super_admin", "manager"].includes(x));
  return { tenantId: callerTenantId as string, isAdmin };
}

export const listEmployeeDuties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ employeeId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("employee_duties")
      .select("id, employee_id, title, description, weight, kpi_target, sort_order, is_active, created_at, updated_at")
      .eq("employee_id", data.employeeId)
      .order("sort_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return { duties: rows ?? [] };
  });

export const listMyDuties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
    if (!emp) return { duties: [], employeeId: null };
    const { data: rows, error } = await supabase
      .from("employee_duties")
      .select("id, title, description, weight, kpi_target, sort_order, is_active")
      .eq("employee_id", emp.id)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return { duties: rows ?? [], employeeId: emp.id as string };
  });

const Upsert = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  weight: z.number().min(0).max(100),
  kpi_target: z.string().trim().max(500).nullable().optional(),
  sort_order: z.number().int().min(0).max(1000).optional(),
  is_active: z.boolean().optional(),
  /** If true, skip the strict weight-tolerance assertion for this single save. */
  allow_partial: z.boolean().optional(),
});

export const upsertEmployeeDuty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Upsert.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin } = await getTenant(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { supabase, userId } = context as any;
    const payload = {
      tenant_id: tenantId,
      employee_id: data.employee_id,
      title: data.title,
      description: data.description ?? null,
      weight: data.weight,
      kpi_target: data.kpi_target ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      created_by: userId,
    };
    const { data: row, error } = data.id
      ? await supabase.from("employee_duties").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("employee_duties").insert(payload).select().single();
    if (error) throw new Error(error.message);

    // Weight sum + tolerance enforcement
    const { data: all } = await supabase
      .from("employee_duties")
      .select("weight")
      .eq("employee_id", data.employee_id)
      .eq("is_active", true);
    const sum = (all ?? []).reduce((s: number, r: any) => s + Number(r.weight || 0), 0);

    const { data: tenant } = await supabase.from("tenants")
      .select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
    const tolerance = Number(tenant?.kpi_weight_tolerance ?? 0);
    const strict = Boolean(tenant?.kpi_strict_weights ?? true);
    const within = Math.abs(sum - 100) <= tolerance;
    if (strict && !within && !data.allow_partial) {
      // Roll back this change so the data never leaves a "broken" state when
      // the admin hasn't explicitly opted into a partial save.
      if (!data.id) {
        await supabase.from("employee_duties").delete().eq("id", row.id);
      }
      throw new Error(`KPI weights must sum to 100% (±${tolerance}%). Current total: ${sum}%. Adjust other duties first, or re-save with "allow partial".`);
    }
    const warning = within ? null : `KPI weights sum to ${sum}% (expected 100%, tolerance ±${tolerance}%).`;
    return { duty: row, weight_sum: sum, tolerance, strict, within, warning };
  });


export const deleteEmployeeDuty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin } = await getTenant(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { supabase } = context as any;
    const { error } = await supabase.from("employee_duties").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEmployeesForDuties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId, isAdmin } = await getTenant(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email")
      .eq("tenant_id", tenantId)
      .order("first_name");
    if (error) throw new Error(error.message);
    return { employees: data ?? [] };
  });
