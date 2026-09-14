import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function assertOrgAdmin(context: any) {
  const { supabase, userId } = context;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role);
  // `hr` is admitted by this domain's feature key in rbac.ts and was refused
  // here, so HR opened the page and read an empty one. 20260914110000 gives
  // hr the matching write policies, so the refusal does not simply move from
  // this guard to a row-level-security error on Save.
  if (!r.some((x: string) => ["org_admin", "super_admin", "hr"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const callerTenantId = await requireTenantId(supabase, userId);
  return { tenantId: callerTenantId as string };
}

export const listHolidayCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: cats, error } = await supabase
      .from("public_holiday_categories")
      .select("id, country_code, name, is_default, notes, created_at")
      .eq("tenant_id", tenantId)
      .order("country_code")
      .order("name");
    if (error) throw new Error(error.message);
    const ids = (cats ?? []).map((c: any) => c.id);
    let dates: any[] = [];
    if (ids.length) {
      const { data } = await supabase
        .from("holiday_category_dates")
        .select("id, category_id, holiday_date, name, is_paid, pay_multiplier, notes")
        .in("category_id", ids)
        .order("holiday_date");
      dates = data ?? [];
    }
    return { categories: cats ?? [], dates };
  });

const UpsertCategory = z.object({
  id: z.string().uuid().optional(),
  country_code: z.string().trim().min(2).max(3),
  name: z.string().trim().min(1).max(120),
  is_default: z.boolean().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const upsertHolidayCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertCategory.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const payload = {
      tenant_id: tenantId,
      country_code: data.country_code.toUpperCase(),
      name: data.name,
      is_default: data.is_default ?? false,
      notes: data.notes ?? null,
    };
    const { data: row, error } = data.id
      ? await supabase.from("public_holiday_categories").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("public_holiday_categories").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { category: row };
  });

export const deleteHolidayCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { error } = await supabase
      .from("public_holiday_categories").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpsertDate = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(1).max(160),
  is_paid: z.boolean().optional(),
  pay_multiplier: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const upsertHolidayCategoryDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertDate.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    // Verify the category belongs to this tenant.
    const { data: cat } = await supabase
      .from("public_holiday_categories").select("id").eq("id", data.category_id).eq("tenant_id", tenantId).maybeSingle();
    if (!cat) throw new Error("Category not found");
    const payload = {
      category_id: data.category_id,
      holiday_date: data.holiday_date,
      name: data.name,
      is_paid: data.is_paid ?? true,
      pay_multiplier: data.pay_multiplier ?? null,
      notes: data.notes ?? null,
    };
    const { data: row, error } = data.id
      ? await supabase.from("holiday_category_dates").update(payload).eq("id", data.id).select().single()
      : await supabase.from("holiday_category_dates").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { date: row };
  });

export const deleteHolidayCategoryDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { error } = await supabase.from("holiday_category_dates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
