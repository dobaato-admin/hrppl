import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

export const listHolidayOverrideAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ employeeId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { rows: [] };
    let q = supabase
      .from("employee_holiday_override_audit")
      .select("id, employee_id, action, changed_by, changed_at, before_data, after_data, employee_overrides_before, employee_overrides_after")
      .eq("tenant_id", tenantId)
      .order("changed_at", { ascending: false })
      .limit(200);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((rows ?? []).map((r: any) => r.changed_by).filter(Boolean)));
    let userMap: Record<string, string> = {};
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
      for (const p of (profs ?? []) as any[]) userMap[p.id] = p.full_name || p.email || p.id;
    }
    return { rows: (rows ?? []).map((r: any) => ({ ...r, changed_by_name: userMap[r.changed_by] ?? r.changed_by })) };
  });
