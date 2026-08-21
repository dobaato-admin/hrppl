import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function getCtx(context: any) {
  const { supabase, userId } = context;
  const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role as string);
  const isAdmin = r.some((x: string) => ["org_admin", "super_admin", "manager"].includes(x));
  return { tenantId: prof.tenant_id as string, isAdmin, userId, supabase };
}

export const listEmployeesWithState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email, state_region")
      .eq("tenant_id", tenantId)
      .order("first_name");
    if (error) throw new Error(error.message);
    return { employees: data ?? [] };
  });

export const setEmployeeState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    employeeId: z.string().uuid(),
    stateRegion: z.string().trim().max(10).nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { error } = await supabase
      .from("employees")
      .update({ state_region: data.stateRegion })
      .eq("id", data.employeeId)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEmployeeHolidayPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    employeeId: z.string().uuid(),
    year: z.number().int().min(2020).max(2035),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { data: emp } = await supabase
      .from("employees").select("id, first_name, last_name, state_region, tenant_id")
      .eq("id", data.employeeId).eq("tenant_id", tenantId).maybeSingle();
    if (!emp) throw new Error("Employee not found");

    const { data: tenant } = await supabase
      .from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
    const countryCode = tenant?.country_code ?? "AU";

    const start = `${data.year}-01-01`, end = `${data.year}-12-31`;
    let q = supabase.from("public_holidays").select("*")
      .eq("country_code", countryCode)
      .gte("holiday_date", start)
      .lte("holiday_date", end);
    const { data: nationalRows } = await q;
    // Filter: keep where region IS NULL (national) OR region matches employee state
    const synced = ((nationalRows ?? []) as any[]).filter((r) =>
      r.region == null || (emp.state_region && r.region === emp.state_region),
    );

    const { data: overrides } = await supabase
      .from("employee_holiday_overrides")
      .select("*")
      .eq("employee_id", emp.id)
      .gte("holiday_date", start)
      .lte("holiday_date", end);

    return {
      employee: emp,
      countryCode,
      synced,
      overrides: overrides ?? [],
    };
  });

const overrideSchema = z.object({
  employeeId: z.string().uuid(),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(1).max(200),
  action: z.enum(["add", "remove"]),
  isPaid: z.boolean().optional(),
  payMultiplier: z.number().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const upsertHolidayOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => overrideSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase, userId } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const payload = {
      tenant_id: tenantId,
      employee_id: data.employeeId,
      holiday_date: data.holidayDate,
      name: data.name,
      action: data.action,
      is_paid: data.isPaid ?? true,
      pay_multiplier: data.payMultiplier ?? null,
      notes: data.notes ?? null,
      created_by: userId,
    };
    const { data: row, error } = await supabase
      .from("employee_holiday_overrides")
      .upsert(payload, { onConflict: "employee_id,holiday_date,name" } as any)
      .select().single();
    if (error) throw new Error(error.message);
    return { override: row };
  });

export const deleteHolidayOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { error } = await supabase
      .from("employee_holiday_overrides")
      .delete()
      .eq("id", data.id)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
