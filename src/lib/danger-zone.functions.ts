import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Authorize the caller for destructive tenant-level actions.
 * Returns true if super_admin, or org_admin of the given tenant.
 * (Plain auth-middleware supabase client respects RLS via has_role.)
 */
async function assertOrgAdmin(context: { supabase: any; userId: string }, tenantId: string) {
  const { supabase, userId } = context;
  const [{ data: superRow }, callerTenant, { data: adminRow }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    getTenantId(supabase, userId),
    supabase.rpc("has_role", { _user_id: userId, _role: "org_admin" }),
  ]);
  const isSuper = superRow === true;
  const isOrgAdmin = adminRow === true && callerTenant === tenantId;
  if (!isSuper && !isOrgAdmin) throw new Error("Forbidden — org admin required.");
  return { isSuper, userId };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete tenant (organization)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { tenantId: string; confirmName: string }) =>
    z.object({
      tenantId: z.string().uuid(),
      confirmName: z.string().min(1).max(255),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOrgAdmin(context as any, data.tenantId);
    const admin = await loadAdmin();
    const { data: tenant, error: fetchErr } = await admin
      .from("tenants")
      .select("id, name")
      .eq("id", data.tenantId)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!tenant) throw new Error("Organization not found.");
    if (tenant.name !== data.confirmName) {
      throw new Error("Organization name did not match.");
    }
    const { error } = await admin.from("tenants").delete().eq("id", data.tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Bulk-delete employees (>=1, capped)
// ─────────────────────────────────────────────────────────────────────────────
export const bulkDeleteEmployees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { tenantId: string; employeeIds: string[] }) =>
    z.object({
      tenantId: z.string().uuid(),
      employeeIds: z.array(z.string().uuid()).min(1).max(500),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOrgAdmin(context as any, data.tenantId);
    const admin = await loadAdmin();
    // Verify all employees belong to the tenant
    const { data: rows, error: chkErr } = await admin
      .from("employees")
      .select("id")
      .eq("tenant_id", data.tenantId)
      .in("id", data.employeeIds);
    if (chkErr) throw new Error(chkErr.message);
    const okIds = (rows ?? []).map((r) => r.id);
    if (okIds.length === 0) throw new Error("No matching employees found in this organization.");
    const { error } = await admin.from("employees").delete().in("id", okIds);
    if (error) throw new Error(error.message);
    return { deleted: okIds.length };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Purge payroll history before a date (deletes payslips & runs whose pay_date < cutoff)
// ─────────────────────────────────────────────────────────────────────────────
export const purgePayrollHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { tenantId: string; beforeDate: string }) =>
    z.object({
      tenantId: z.string().uuid(),
      beforeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOrgAdmin(context as any, data.tenantId);
    const admin = await loadAdmin();
    // Find runs in window
    const { data: runs, error: runsErr } = await admin
      .from("payroll_runs")
      .select("id")
      .eq("tenant_id", data.tenantId)
      .lt("pay_date", data.beforeDate);
    if (runsErr) throw new Error(runsErr.message);
    const runIds = (runs ?? []).map((r) => r.id);
    if (runIds.length === 0) return { runs: 0, payslips: 0 };
    const { count: payslipCount, error: psErr } = await admin
      .from("payroll_payslips")
      .delete({ count: "exact" })
      .in("run_id", runIds);
    if (psErr) throw new Error(psErr.message);
    const { error: runDelErr } = await admin.from("payroll_runs").delete().in("id", runIds);
    if (runDelErr) throw new Error(runDelErr.message);
    return { runs: runIds.length, payslips: payslipCount ?? 0 };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Transfer ownership — assigns org_admin role to target user; optionally removes from caller.
// ─────────────────────────────────────────────────────────────────────────────
export const transferOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { tenantId: string; newOwnerEmployeeId: string; demoteSelf: boolean }) =>
    z.object({
      tenantId: z.string().uuid(),
      newOwnerEmployeeId: z.string().uuid(),
      demoteSelf: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { isSuper, userId } = await assertOrgAdmin(context as any, data.tenantId);
    const admin = await loadAdmin();
    const { data: emp, error: empErr } = await admin
      .from("employees")
      .select("id, user_id, tenant_id, first_name, last_name")
      .eq("id", data.newOwnerEmployeeId)
      .maybeSingle();
    if (empErr) throw new Error(empErr.message);
    if (!emp || emp.tenant_id !== data.tenantId) {
      throw new Error("Selected employee is not in this organization.");
    }
    if (!emp.user_id) throw new Error("Selected employee has no linked user account.");
    // Grant org_admin
    await admin
      .from("user_roles")
      .upsert({ user_id: emp.user_id, role: "org_admin" } as any, { onConflict: "user_id,role" });
    // Demote self if requested (never demote a super_admin)
    if (data.demoteSelf && !isSuper) {
      await admin
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "org_admin");
    }
    return { ok: true, newOwnerName: `${emp.first_name} ${emp.last_name}`.trim() };
  });
