import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getCallerTenantAndRole(supabase: any, userId: string) {
  const callerTenantId = await getTenantId(supabase, userId);
  const tenantId = (callerTenantId as string | null) ?? null;
  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r: any) => r.role as string);
  return { tenantId, roles };
}

export const getOrgSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { tenantId, roles } = await getCallerTenantAndRole(supabase, userId);
    if (!tenantId) return { tenant: null, countries: [], payrollDefaults: null, canEdit: false };

    const canEdit = roles.includes("org_admin") || roles.includes("super_admin");

    const [{ data: tenant }, { data: countries }] = await Promise.all([
      supabase
        .from("tenants")
        .select("id,name,legal_name,primary_contact_name,slug,country_code,currency_code,status,plan,contact_email,contact_phone,address_line1,address_line2,city,region,postal_code,website,tagline,registration_number,tax_id_number")
        .eq("id", tenantId)
        .maybeSingle(),
      supabase.from("countries").select("code,name,currency_code,region_code").order("name"),
    ]);

    let payrollDefaults: any = null;
    if (tenant?.country_code) {
      const { data: d } = await supabase
        .from("country_payroll_settings")
        .select("country_code,pay_frequency,workweek_hours,overtime_multiplier,fiscal_year_start_month,rounding_mode,rounding_decimals,notes")
        .eq("country_code", tenant.country_code)
        .maybeSingle();
      payrollDefaults = d;
    }

    return { tenant, countries: countries ?? [], payrollDefaults, canEdit };
  });

const UpdateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  legal_name: z.string().trim().max(160).optional().nullable(),
  primary_contact_name: z.string().trim().max(160).optional().nullable(),
  country_code: z.string().trim().length(2),
  currency_code: z.string().trim().length(3),
  contact_email: z.string().trim().email().max(160),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  address_line1: z.string().trim().max(160).optional().nullable(),
  address_line2: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  region: z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(32).optional().nullable(),
  website: z.string().trim().max(255).optional().nullable(),
  tagline: z.string().trim().max(160).optional().nullable(),
  registration_number: z.string().trim().max(80).optional().nullable(),
  tax_id_number: z.string().trim().max(80).optional().nullable(),
});

export const updateOrgSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { tenantId, roles } = await getCallerTenantAndRole(supabase, userId);
    if (!tenantId) throw new Error("No organization found for this user.");
    if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
      throw new Error("Only organization admins can update these settings.");
    }

    const admin = await loadAdmin();
    // Validate country + currency exist and match
    const { data: country } = await admin
      .from("countries")
      .select("code,currency_code")
      .eq("code", data.country_code.toUpperCase())
      .maybeSingle();
    if (!country) throw new Error("Unknown country code.");

    const { error } = await admin
      .from("tenants")
      .update({
        name: data.name,
        legal_name: data.legal_name?.trim() || null,
        primary_contact_name: data.primary_contact_name?.trim() || null,
        country_code: country.code,
        currency_code: data.currency_code.toUpperCase(),
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        address_line1: data.address_line1?.trim() || null,
        address_line2: data.address_line2?.trim() || null,
        city: data.city?.trim() || null,
        region: data.region?.trim() || null,
        postal_code: data.postal_code?.trim() || null,
        website: data.website?.trim() || null,
        tagline: data.tagline?.trim() || null,
        registration_number: data.registration_number?.trim() || null,
        tax_id_number: data.tax_id_number?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
