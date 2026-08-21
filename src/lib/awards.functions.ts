/**
 * M6 — Award rate library (AU Modern Awards).
 *
 * Catalogue management for Modern Awards, classifications, and effective-dated
 * minimum rates, plus per-employee classification assignments.
 *
 *   listAwards({ countryCode })
 *   upsertAward({...}) / upsertAwardClassification({...}) / upsertAwardRate({...})
 *   assignEmployeeAward({...})
 *   getEffectiveAwardRate({ employeeId, on })
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertCatalogueAdmin(supabase: any, userId: string, countryCode: string) {
  const { data: isSuper } = await supabase.rpc("has_role", {
    _user_id: userId, _role: "super_admin",
  } as any);
  if (isSuper) return;
  const { data: isRegional } = await supabase.rpc("has_role", {
    _user_id: userId, _role: "regional_admin",
  } as any);
  const { data: scoped } = await supabase.rpc("has_country_scope", {
    _user_id: userId, _country_code: countryCode,
  } as any);
  if (!(isRegional && scoped)) {
    throw new Error("Forbidden: super_admin or country-scoped regional_admin required");
  }
}

async function assertOrgAdmin(supabase: any, userId: string, tenantId: string) {
  const { data: isAdmin } = await supabase.rpc("is_org_admin", {
    _user_id: userId, _tenant_id: tenantId,
  } as any);
  if (!isAdmin) throw new Error("Forbidden: org admin required");
}

export const listAwards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    countryCode: z.string().length(2).optional(),
    includeRates: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const admin = await loadAdmin();
    let q = admin.from("awards").select("*").eq("is_active", true);
    if (data.countryCode) q = q.eq("country_code", data.countryCode);
    const { data: awards, error } = await q.order("code");
    if (error) throw new Error(error.message);

    const ids = (awards ?? []).map((a: any) => a.id);
    if (!ids.length) return { awards: [] };

    const { data: classifications } = await admin
      .from("award_classifications").select("*")
      .in("award_id", ids).order("sort_order");

    let rates: any[] = [];
    if (data.includeRates) {
      const cIds = (classifications ?? []).map((c: any) => c.id);
      if (cIds.length) {
        const { data: r } = await admin.from("award_rates").select("*")
          .in("classification_id", cIds).eq("is_active", true)
          .order("effective_from", { ascending: false });
        rates = r ?? [];
      }
    }
    return { awards, classifications: classifications ?? [], rates };
  });

export const upsertAward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    country_code: z.string().length(2),
    code: z.string().min(1).max(32),
    name: z.string().min(1).max(255),
    industry: z.string().max(255).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    source_url: z.string().url().optional().nullable(),
    is_active: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCatalogueAdmin(context.supabase, context.userId, data.country_code);
    const admin = await loadAdmin();
    const { data: row, error } = await admin.from("awards")
      .upsert(data as any, { onConflict: "country_code,code" })
      .select("*").single();
    if (error) throw new Error(error.message);
    return { award: row };
  });

export const upsertAwardClassification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    award_id: z.string().uuid(),
    code: z.string().min(1).max(64),
    name: z.string().min(1).max(255),
    level: z.number().int().optional().nullable(),
    parent_id: z.string().uuid().optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: aw } = await admin.from("awards").select("country_code")
      .eq("id", data.award_id).maybeSingle();
    if (!aw) throw new Error("Award not found");
    await assertCatalogueAdmin(context.supabase, context.userId, (aw as any).country_code);
    const { data: row, error } = await admin.from("award_classifications")
      .upsert(data as any, { onConflict: "award_id,code" })
      .select("*").single();
    if (error) throw new Error(error.message);
    return { classification: row };
  });

export const upsertAwardRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    classification_id: z.string().uuid(),
    effective_from: z.string(),
    effective_to: z.string().optional().nullable(),
    hourly_rate: z.number().optional().nullable(),
    weekly_rate: z.number().optional().nullable(),
    annual_rate: z.number().optional().nullable(),
    casual_loading_pct: z.number().min(0).max(100).optional(),
    penalty_multipliers: z.record(z.string(), z.number()).optional(),
    allowances: z.record(z.string(), z.any()).optional(),
    notes: z.string().max(2000).optional().nullable(),
    is_active: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: cls } = await admin.from("award_classifications")
      .select("award_id, awards:awards!inner(country_code)")
      .eq("id", data.classification_id).maybeSingle();
    if (!cls) throw new Error("Classification not found");
    const cc = (cls as any).awards?.country_code;
    if (!cc) throw new Error("Award country not resolvable");
    await assertCatalogueAdmin(context.supabase, context.userId, cc);
    const { data: row, error } = await admin.from("award_rates")
      .upsert(data as any).select("*").single();
    if (error) throw new Error(error.message);
    return { rate: row };
  });

export const assignEmployeeAward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    employeeId: z.string().uuid(),
    classificationId: z.string().uuid(),
    effectiveFrom: z.string(),
    effectiveTo: z.string().optional().nullable(),
    casual: z.boolean().optional(),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOrgAdmin(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    const { data: row, error } = await admin.from("employee_award_assignments").insert({
      tenant_id: data.tenantId,
      employee_id: data.employeeId,
      classification_id: data.classificationId,
      effective_from: data.effectiveFrom,
      effective_to: data.effectiveTo ?? null,
      casual: data.casual ?? false,
      notes: data.notes ?? null,
      created_by: context.userId,
    } as any).select("*").single();
    if (error) throw new Error(error.message);
    return { assignment: row };
  });

/**
 * Resolve the effective award rate for an employee on a given date.
 * Returns the active assignment + classification + most recent rate row.
 */
export const getEffectiveAwardRate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    employeeId: z.string().uuid(),
    on: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const on = data.on ?? new Date().toISOString().slice(0, 10);

    const { data: emp } = await admin.from("employees")
      .select("id,tenant_id,user_id").eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    const tenantId = (emp as any).tenant_id;

    // Authz: org admin, HR, or the employee themselves.
    const isSelf = (emp as any).user_id === context.userId;
    if (!isSelf) {
      const { data: isAdmin } = await context.supabase.rpc("is_org_admin",
        { _user_id: context.userId, _tenant_id: tenantId } as any);
      const { data: isHr } = await context.supabase.rpc("is_hr",
        { _user_id: context.userId, _tenant_id: tenantId } as any);
      if (!isAdmin && !isHr) throw new Error("Forbidden");
    }

    const { data: asg } = await admin.from("employee_award_assignments")
      .select("*").eq("employee_id", data.employeeId)
      .lte("effective_from", on)
      .or(`effective_to.is.null,effective_to.gte.${on}`)
      .order("effective_from", { ascending: false })
      .limit(1).maybeSingle();
    if (!asg) return { assignment: null, classification: null, rate: null };

    const { data: cls } = await admin.from("award_classifications")
      .select("*, awards(*)").eq("id", (asg as any).classification_id).maybeSingle();

    const { data: rate } = await admin.rpc("award_rate_on", {
      _classification_id: (asg as any).classification_id, _on: on,
    } as any);

    return { assignment: asg, classification: cls, rate };
  });
