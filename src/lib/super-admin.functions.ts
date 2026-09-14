import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyRoles, getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function assertSuper(context: any) {
  // RLS is the real gate; we keep this as a friendlier early-fail.
  // Roles aren't always in claims, so rely on a real query.
  return context.userId as string;
}

// ---------- Tenants overview ----------
export const listAllTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = assertSuper(context);
    const admin = await loadAdmin();
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "super_admin")) {
      throw new Error("Forbidden");
    }
    const { data: tenants } = await admin
      .from("tenants")
      .select("id, name, slug, country_code, currency_code, plan, status, created_at")
      .order("created_at", { ascending: false });
    const { data: governance } = await admin.from("tenant_governance").select("*");
    return { tenants: tenants ?? [], governance: governance ?? [] };
  });

const govSchema = z.object({
  tenant_id: z.string().uuid(),
  health_status: z.enum(["healthy", "warning", "at_risk", "suspended"]),
  internal_notes: z.string().trim().max(2000).optional().nullable(),
  risk_score: z.number().int().min(0).max(100).default(0),
});

export const upsertTenantGovernance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => govSchema.parse(d))
  .handler(async ({ data, context }) => {
    const userId = assertSuper(context);
    const admin = await loadAdmin();
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
    const payload = { ...data, last_reviewed_at: new Date().toISOString(), last_reviewed_by: userId };
    const { error } = await admin
      .from("tenant_governance")
      .upsert(payload, { onConflict: "tenant_id" } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Who may read and set a tenant's own branding.
 *
 * Mirrors `white_label_settings`: "super admin all white-label" plus
 * "org admin manages own white-label" (20260914100000). A tenant's logo and
 * colours belong to the tenant, and `tenant_id = user_tenant_id(...)` in the
 * policy keeps an org admin inside their own.
 *
 * Named rather than inlined because this same check guards a read AND a write
 * that goes through the service-role client, where RLS is not a backstop.
 */
async function assertWhiteLabelAdmin(supabase: any, userId: string) {
  const roles = await getMyRoles(supabase, userId);
  if (!roles.some((r) => r === "super_admin" || r === "org_admin")) {
    throw new Error("Forbidden: organisation admin required");
  }
}

// ---------- White label ----------
export const getMyWhiteLabel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    // `org.whiteLabel` has admitted org_admin since Wave 5 — which recorded
    // "/org/white-label locking out org_admin" as one of the disagreements it
    // converged. It fixed the page and not this function, so an org admin still
    // could not read their own tenant's branding. 20260914100000 gives them the
    // policy this now depends on.
    await assertWhiteLabelAdmin(supabase, userId);
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { settings: null };
    const { data } = await supabase.from("white_label_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
    return { settings: data };
  });

const wlSchema = z.object({
  brand_name: z.string().trim().max(120).optional().nullable(),
  logo_url: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  primary_color: z.string().trim().max(20).optional().nullable(),
  accent_color: z.string().trim().max(20).optional().nullable(),
  email_from_name: z.string().trim().max(120).optional().nullable(),
  email_from_address: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  support_email: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  footer_html: z.string().trim().max(4000).optional().nullable(),
  custom_domain: z.string().trim().max(255).optional().nullable(),
});

export const upsertMyWhiteLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => wlSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertWhiteLabelAdmin(supabase, userId);
    const tenantId = await requireTenantId(supabase, userId);
    const admin = await loadAdmin();
    const payload: any = { ...data, tenant_id: tenantId };
    for (const k of ["logo_url", "email_from_address", "support_email"]) if (payload[k] === "") payload[k] = null;
    const { error } = await admin.from("white_label_settings").upsert(payload, { onConflict: "tenant_id" } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- FX rates ----------
export const listFxRates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("fx_rates")
      .select("*")
      .order("rate_date", { ascending: false })
      .order("base_currency")
      .limit(500);
    if (error) throw new Error(error.message);
    return { rates: data ?? [] };
  });

const fxSchema = z.object({
  base_currency: z.string().trim().length(3),
  quote_currency: z.string().trim().length(3),
  rate: z.number().positive(),
  rate_date: z.string(),
});

export const upsertFxRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => fxSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    const admin = await loadAdmin();
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
    const payload = {
      base_currency: data.base_currency.toUpperCase(),
      quote_currency: data.quote_currency.toUpperCase(),
      rate: data.rate,
      rate_date: data.rate_date,
      source: "manual",
      created_by: userId,
    };
    const { error } = await admin
      .from("fx_rates")
      .upsert(payload, { onConflict: "base_currency,quote_currency,rate_date" } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
