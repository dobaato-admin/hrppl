/**
 * Per-tenant audit retention configuration.
 * Active tables stay immutable; the cron-invoked `run_audit_retention` RPC
 * archives aged rows and hard-deletes from the archive after the deletion window.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId, requireTenantId } from "@/lib/tenant-scope";

const TABLES = ["onboarding_control_room_audit", "offboarding_comms_removal_audit"] as const;

export const listRetentionPolicies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { rows: [] };
    const { data, error } = await supabase
      .from("audit_retention_policies").select("*")
      .eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    const byTable = new Map((data ?? []).map((r: any) => [r.table_name, r]));
    const rows = TABLES.map((t) => byTable.get(t) ?? {
      tenant_id: tenantId, table_name: t,
      archive_after_days: 365, delete_after_days: 2555, is_active: true,
    });
    return { rows };
  });

export const upsertRetentionPolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    table_name: z.enum(TABLES),
    archive_after_days: z.number().int().min(30).max(3650),
    delete_after_days: z.number().int().min(365).max(36500),
    is_active: z.boolean().default(true),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    if (data.delete_after_days < data.archive_after_days) {
      throw new Error("delete_after_days must be >= archive_after_days");
    }
    const { error } = await supabase.from("audit_retention_policies").upsert({
      tenant_id: tenantId, ...data,
    }, { onConflict: "tenant_id,table_name" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runRetentionNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only admins can run retention.");
    const { data, error } = await supabase.rpc("run_audit_retention_for_tenant", { _tenant_id: tenantId });
    if (error) throw new Error(error.message);
    return { results: data ?? [] };
  });

