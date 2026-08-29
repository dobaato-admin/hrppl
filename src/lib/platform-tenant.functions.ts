/**
 * Acting-tenant selection for platform admins.
 *
 * `super_admin` and `regional_admin` have `profiles.tenant_id = NULL` by
 * design, so after Wave 1 scoped every tenant-owned query by tenant_id, every
 * such surface is correctly empty for them. `platform_acting_tenant`
 * (20260824090000) lets them pick a tenant to act within; `getTenantId`
 * (`tenant-scope.ts`) falls back to it once set. RLS on that table is the
 * real boundary — `has_role` for super_admin, `has_role` + `has_country_scope`
 * for regional_admin — the role/scope checks here exist for a readable error
 * message, not because RLS is untrusted.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import type { AnySupabase } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getRoles(supabase: AnySupabase, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return ((data ?? []) as { role: string }[]).map((r) => r.role);
}

type TenantOption = { id: string; name: string; countryCode: string };

async function listTenantOptions(
  supabase: AnySupabase,
  userId: string,
  isSuperAdmin: boolean,
): Promise<TenantOption[]> {
  if (isSuperAdmin) {
    const { data } = await supabase.from("tenants").select("id,name,country_code").order("name");
    return ((data ?? []) as { id: string; name: string; country_code: string }[]).map((t) => ({
      id: t.id,
      name: t.name,
      countryCode: t.country_code,
    }));
  }

  // regional_admin — restrict to the countries in their own role_scope rows.
  const { data: scope } = await supabase
    .from("role_scope")
    .select("country_code")
    .eq("user_id", userId);
  const countries = [
    ...new Set(
      ((scope ?? []) as { country_code: string | null }[])
        .map((s) => s.country_code)
        .filter((c): c is string => !!c),
    ),
  ];
  if (countries.length === 0) return [];

  const { data } = await supabase
    .from("tenants")
    .select("id,name,country_code")
    .in("country_code", countries)
    .order("name");
  return ((data ?? []) as { id: string; name: string; country_code: string }[]).map((t) => ({
    id: t.id,
    name: t.name,
    countryCode: t.country_code,
  }));
}

/**
 * Tenants the caller may act as, plus their current acting tenant. Returns an
 * empty, non-platform-admin shape for anyone who isn't super_admin/regional_admin
 * rather than throwing — this is read as a query, not gated behind a route.
 */
export const listActingTenantOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    const isSuperAdmin = roles.includes("super_admin");
    const isRegionalAdmin = roles.includes("regional_admin");
    if (!isSuperAdmin && !isRegionalAdmin) {
      return { isPlatformAdmin: false as const, tenants: [], actingTenantId: null };
    }

    const [tenants, actingRow] = await Promise.all([
      listTenantOptions(supabase, userId, isSuperAdmin),
      supabase
        .from("platform_acting_tenant")
        .select("tenant_id")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    return {
      isPlatformAdmin: true as const,
      tenants,
      actingTenantId: (actingRow.data?.tenant_id as string | undefined) ?? null,
    };
  });

/**
 * Set or clear the caller's acting tenant. `tenantId: null` stops acting.
 */
export const setActingTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tenantId: z.string().uuid().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    const isSuperAdmin = roles.includes("super_admin");
    const isRegionalAdmin = roles.includes("regional_admin");
    if (!isSuperAdmin && !isRegionalAdmin) {
      throw new Error("Only platform admins can act as a tenant.");
    }

    const { data: previousRow } = await supabase
      .from("platform_acting_tenant")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    const previousTenantId = (previousRow?.tenant_id as string | undefined) ?? null;

    if (data.tenantId === null) {
      const { error } = await supabase
        .from("platform_acting_tenant")
        .delete()
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id,name,country_code")
        .eq("id", data.tenantId)
        .maybeSingle();
      if (tenantError) throw new Error(tenantError.message);
      if (!tenant) throw new Error("That organization no longer exists.");

      if (isRegionalAdmin && !isSuperAdmin) {
        const { data: inScope } = await supabase.rpc("has_country_scope", {
          _user_id: userId,
          _country_code: tenant.country_code,
        });
        if (!inScope) {
          throw new Error("That organization is outside your assigned region.");
        }
      }

      const { error } = await supabase
        .from("platform_acting_tenant")
        .upsert({ user_id: userId, tenant_id: data.tenantId, set_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    }

    try {
      const admin = await loadAdmin();
      await admin.from("audit_log").insert({
        actor_id: userId,
        entity_type: "tenant",
        entity_id: data.tenantId ?? previousTenantId,
        action: data.tenantId ? "platform_acting_tenant_set" : "platform_acting_tenant_cleared",
        metadata: { previous_tenant_id: previousTenantId, new_tenant_id: data.tenantId },
      });
    } catch (e) {
      console.error("[platform-tenant] audit log write failed", e);
    }

    return { ok: true, tenantId: data.tenantId };
  });
