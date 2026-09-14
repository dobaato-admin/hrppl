import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertOrgAdmin(context: any) {
  const { supabase, userId } = context;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (!r.some((x: string) => ["org_admin", "regional_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const callerTenantId = await getTenantId(supabase, userId);
  return { tenantId: callerTenantId as string | null, roles: r };
}

export const listTeamData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    if (!tenantId) return { employees: [], managers: [] };
    const { supabase } = context as any;
    const { data: emps } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email, job_title, manager_id, user_id, status")
      .eq("tenant_id", tenantId)
      .order("first_name");
    const userIds = (emps ?? []).map((e: any) => e.user_id).filter(Boolean);
    let managerUserIds = new Set<string>();
    if (userIds.length) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)
        .eq("role", "manager");
      managerUserIds = new Set((roles ?? []).map((r: any) => r.user_id));
    }
    const managers = (emps ?? []).filter((e: any) => e.user_id && managerUserIds.has(e.user_id));
    return { employees: emps ?? [], managers };
  });

const grantSchema = z.object({
  employee_id: z.string().uuid(),
  grant: z.boolean(),
});

export const setManagerRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => grantSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    if (!tenantId) throw new Error("No organisation");
    const { supabase } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("user_id, tenant_id").eq("id", data.employee_id).maybeSingle();
    if (!emp || emp.tenant_id !== tenantId) throw new Error("Not found");
    if (!emp.user_id) throw new Error("Employee has no linked user account");

    const admin = await loadAdmin();
    if (data.grant) {
      await admin.from("user_roles").upsert(
        { user_id: emp.user_id, role: "manager" },
        { onConflict: "user_id,role" } as any,
      );
    } else {
      await admin.from("user_roles").delete().eq("user_id", emp.user_id).eq("role", "manager");
    }
    return { ok: true };
  });

const assignSchema = z.object({
  manager_employee_id: z.string().uuid(),
  report_employee_ids: z.array(z.string().uuid()).max(500),
});

export const assignReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => assignSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    if (!tenantId) throw new Error("No organisation");
    const { supabase } = context as any;

    // Validate manager belongs to tenant
    const { data: mgr } = await supabase
      .from("employees").select("id, tenant_id").eq("id", data.manager_employee_id).maybeSingle();
    if (!mgr || mgr.tenant_id !== tenantId) throw new Error("Manager not in your organisation");

    // Clear current reports of this manager, then re-assign
    const admin = await loadAdmin();
    const { error: clearErr } = await admin
      .from("employees").update({ manager_id: null })
      .eq("manager_id", data.manager_employee_id).eq("tenant_id", tenantId);
    if (clearErr) throw new Error(clearErr.message);

    if (data.report_employee_ids.length) {
      const { error: setErr } = await admin
        .from("employees").update({ manager_id: data.manager_employee_id })
        .in("id", data.report_employee_ids).eq("tenant_id", tenantId);
      if (setErr) throw new Error(setErr.message);
    }
    return { ok: true, assigned: data.report_employee_ids.length };
  });
