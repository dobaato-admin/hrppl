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
  const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  return { tenantId: prof.tenant_id as string, userId: userId as string };
}

async function writeAudit(
  context: any,
  tenantId: string,
  actorId: string,
  category: string,
  action: string,
  entityType: string | null,
  entityId: string | null,
  details: Record<string, any> = {},
) {
  try {
    await (context as any).supabase.from("admin_audit_log").insert({
      tenant_id: tenantId, actor_id: actorId, category, action,
      entity_type: entityType, entity_id: entityId, details,
    });
  } catch { /* never block on audit-log failure */ }
}

export const getPayrollSetup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const [{ data: settings }, { data: components }, { data: departments }] = await Promise.all([
      supabase.from("tenant_payroll_settings").select("*").eq("tenant_id", tenantId).maybeSingle(),
      supabase.from("payroll_components").select("*").eq("tenant_id", tenantId).order("sort_order").order("label"),
      supabase.from("departments").select("id, name").eq("tenant_id", tenantId).order("name"),
    ]);
    return { settings: settings ?? null, components: components ?? [], departments: departments ?? [] };
  });

const SettingsSchema = z.object({
  pay_period: z.enum(["weekly", "fortnightly", "semimonthly", "monthly"]),
  standard_hours_per_day: z.number().min(0).max(24),
  standard_days_per_week: z.number().min(0).max(7),
  meal_break_minutes: z.number().int().min(0).max(240),
  rest_break_minutes: z.number().int().min(0).max(240),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const upsertPayrollSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: row, error } = await supabase
      .from("tenant_payroll_settings")
      .upsert({ tenant_id: tenantId, ...data, notes: data.notes ?? null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "payroll_settings", "upsert", "tenant_payroll_settings", row?.id ?? tenantId, { changes: data });
    return { settings: row };
  });

const ComponentSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
  label: z.string().trim().min(1).max(120),
  kind: z.enum(["tax", "pf", "retirement", "allowance", "deduction", "other"]),
  calc_type: z.enum(["flat", "pct_of_basic", "pct_of_gross"]),
  rate: z.number().min(0).max(1000000),
  is_taxable: z.boolean().optional(),
  show_on_payslip: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  department_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const upsertPayrollComponent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ComponentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    if (data.department_id) {
      const { data: dept } = await supabase
        .from("departments").select("id").eq("id", data.department_id).eq("tenant_id", tenantId).maybeSingle();
      if (!dept) throw new Error("Department not found");
    }
    const payload = {
      tenant_id: tenantId,
      code: data.code, label: data.label, kind: data.kind, calc_type: data.calc_type, rate: data.rate,
      is_taxable: data.is_taxable ?? false, show_on_payslip: data.show_on_payslip ?? true,
      is_active: data.is_active ?? true, sort_order: data.sort_order ?? 100,
      department_id: data.department_id ?? null, notes: data.notes ?? null,
    };
    const { data: row, error } = data.id
      ? await supabase.from("payroll_components").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("payroll_components").insert(payload).select().single();
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "payroll_component", data.id ? "update" : "create",
      "payroll_components", row?.id ?? null, { code: data.code, label: data.label, kind: data.kind, rate: data.rate, calc_type: data.calc_type });
    return { component: row };
  });

export const togglePayrollComponent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { error } = await supabase
      .from("payroll_components").update({ is_active: data.is_active })
      .eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "payroll_component", data.is_active ? "enable" : "disable",
      "payroll_components", data.id, { is_active: data.is_active });
    return { ok: true };
  });

export const deletePayrollComponent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { error } = await supabase
      .from("payroll_components").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "payroll_component", "delete", "payroll_components", data.id, {});
    return { ok: true };
  });

const ScenarioLogSchema = z.object({
  scenarioId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  action: z.enum(["create", "update", "delete"]),
  gross: z.number().optional(),
  overrideCount: z.number().int().optional(),
});
export const logPayrollScenarioEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScenarioLogSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    await writeAudit(context, tenantId, userId, "payroll_scenario", data.action, "scenario", data.scenarioId, {
      name: data.name, gross: data.gross, overrideCount: data.overrideCount,
    });
    return { ok: true };
  });

const ExportLogSchema = z.object({
  format: z.enum(["csv", "pdf"]),
  sections: z.array(z.string()).min(1),
  scenarios: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
});
export const logPayrollExportEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ExportLogSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    await writeAudit(context, tenantId, userId, "payroll_export", data.format, "bundle", null, {
      sections: data.sections, scenarios: data.scenarios ?? [],
    });
    return { ok: true };
  });

export const getAdminAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      category: z.string().optional(),
      limit: z.number().int().min(1).max(500).optional(),
    }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    let q = supabase.from("admin_audit_log").select("*").eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }).limit(data.limit ?? 100);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });

export const getPayrollExportBundle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: tenant } = await supabase
      .from("tenants").select("id,name,country_code,currency_code").eq("id", tenantId).maybeSingle();
    const [
      { data: settings },
      { data: components },
      { data: leaveTypes },
      { data: overtimeRates },
      { data: taxBrackets },
      { data: holidayCategories },
      { data: holidays },
    ] = await Promise.all([
      supabase.from("tenant_payroll_settings").select("*").eq("tenant_id", tenantId).maybeSingle(),
      supabase.from("payroll_components").select("*").eq("tenant_id", tenantId).order("sort_order").order("label"),
      supabase.from("leave_types").select("*").eq("tenant_id", tenantId).order("name"),
      tenant?.country_code
        ? supabase.from("overtime_penalty_rates").select("*").eq("country_code", tenant.country_code).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
      tenant?.country_code
        ? supabase.from("tax_brackets").select("*").eq("country_code", tenant.country_code).order("bracket_order")
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("public_holiday_categories").select("*").eq("tenant_id", tenantId).order("name"),
      // public_holidays is keyed by country_code, NOT tenant_id — the table has
      // no tenant_id column, so filtering on it was a PostgREST 42703 and this
      // list was always empty. Per-tenant observed days live in
      // public_holiday_categories (queried on the line above).
      tenant?.country_code
        ? supabase.from("public_holidays").select("*").eq("country_code", tenant.country_code).order("holiday_date")
        : Promise.resolve({ data: [] as any[] }),
    ]);
    return {
      tenant: tenant ?? null,
      settings: settings ?? null,
      components: components ?? [],
      leaveTypes: leaveTypes ?? [],
      overtimeRates: overtimeRates ?? [],
      taxBrackets: taxBrackets ?? [],
      holidayCategories: holidayCategories ?? [],
      holidays: holidays ?? [],
    };
  });

// ---------------- Payroll Setup Wizard readiness ----------------
//
// Hard-blocks employee invitations until the four mandatory steps are
// configured: pay items, pay dates, overtime/penalty rates, currency.

export type PayrollReadinessSteps = {
  payItems: boolean;
  payDates: boolean;
  overtimeRates: boolean;
  currency: boolean;
};

export async function checkPayrollReadiness(
  supabase: any,
  tenantId: string,
): Promise<{ steps: PayrollReadinessSteps; allComplete: boolean }> {
  const { data: tenant } = await supabase
    .from("tenants").select("currency_code, country_code").eq("id", tenantId).maybeSingle();
  const countryCode = tenant?.country_code ?? null;
  const [{ data: items }, { data: settings }, otRes] = await Promise.all([
    supabase.from("payroll_components").select("id").eq("tenant_id", tenantId).eq("is_active", true).limit(1),
    supabase.from("tenant_payroll_settings").select("pay_period").eq("tenant_id", tenantId).maybeSingle(),
    countryCode
      ? supabase.from("overtime_penalty_rates").select("id").eq("country_code", countryCode).eq("is_active", true).limit(1)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const ot = otRes.data;
  const steps: PayrollReadinessSteps = {
    payItems: (items ?? []).length > 0,
    payDates: !!settings?.pay_period,
    overtimeRates: (ot ?? []).length > 0,
    currency: !!tenant?.currency_code && String(tenant.currency_code).trim().length === 3,
  };
  const allComplete = steps.payItems && steps.payDates && steps.overtimeRates && steps.currency;
  return { steps, allComplete };
}

export const getPayrollReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!profile?.tenant_id) throw new Error("No organisation");
    return checkPayrollReadiness(supabase, profile.tenant_id as string);
  });

export const updateTenantCurrency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ currency_code: z.string().trim().length(3).regex(/^[A-Za-z]{3}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const code = data.currency_code.toUpperCase();
    const { error } = await supabase.from("tenants").update({ currency_code: code }).eq("id", tenantId);
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "tenant_settings", "update_currency", "tenants", tenantId, { currency_code: code });
    return { ok: true, currency_code: code };
  });

export const upsertOvertimeRateQuick = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    code: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(120),
    applies_to: z.enum(["overtime", "penalty"]),
    rate_multiplier: z.number().min(0.5).max(10),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, userId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: tenant } = await supabase
      .from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
    if (!tenant?.country_code) throw new Error("Organisation country is not set");
    const { data: row, error } = await supabase
      .from("overtime_penalty_rates")
      .insert({
        country_code: tenant.country_code,
        code: data.code,
        name: data.name,
        applies_to: data.applies_to,
        rate_multiplier: data.rate_multiplier,
        effective_from: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(context, tenantId, userId, "overtime_rate", "create", "overtime_penalty_rates", row?.id ?? null, data);
    return { rate: row };
  });

// ---------------- Overtime readiness (slice of payroll readiness) ----------------
//
// Exposed independently so the invitations page can show a dedicated banner
// for overtime/penalty rates with its own deep-link wizard.

export type OvertimeReadiness = {
  hasRates: boolean;
  rateCount: number;
  allComplete: boolean;
};

export async function checkOvertimeReadiness(supabase: any, tenantId: string): Promise<OvertimeReadiness> {
  const { data: tenant } = await supabase
    .from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
  if (!tenant?.country_code) {
    return { hasRates: false, rateCount: 0, allComplete: false };
  }
  const { data, count } = await supabase
    .from("overtime_penalty_rates")
    .select("id", { count: "exact" })
    .eq("country_code", tenant.country_code);
  const rateCount = count ?? (data ?? []).length;
  const hasRates = rateCount > 0;
  return { hasRates, rateCount, allComplete: hasRates };
}

export const getOvertimeReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
    if (!profile?.tenant_id) throw new Error("No organisation");
    return checkOvertimeReadiness(supabase, profile.tenant_id as string);
  });
