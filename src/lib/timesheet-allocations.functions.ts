import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

// ---------- Schemas ----------
const allocationSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  cost_centre_code: z.string().trim().max(40).nullable().optional(),
  percentage: z.number().min(0.001).max(100),
  hours: z.number().min(0),
  notes: z.string().trim().max(500).nullable().optional(),
});

const saveAllocationsInput = z.object({
  time_entry_id: z.string().uuid(),
  allocations: z.array(allocationSchema).max(20),
});

// ---------- List allocations for a single time entry ----------
export const listAllocationsForEntry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ time_entry_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("time_entry_allocations")
      .select("*")
      .eq("time_entry_id", data.time_entry_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { allocations: rows ?? [] };
  });

// ---------- Save allocations (replace all) for a time entry ----------
export const saveAllocations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveAllocationsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    // Load the parent entry to validate ownership / tenant and fetch hours
    const { data: te, error: teErr } = await supabase
      .from("time_entries")
      .select("id, tenant_id, hours, employee_id")
      .eq("id", data.time_entry_id)
      .maybeSingle();
    if (teErr) throw new Error(teErr.message);
    if (!te) throw new Error("Time entry not found");

    const totalPct = data.allocations.reduce((s, a) => s + Number(a.percentage), 0);
    if (totalPct > 100.001) throw new Error(`Allocations exceed 100% (got ${totalPct.toFixed(2)}%)`);
    const sumHours = data.allocations.reduce((s, a) => s + Number(a.hours), 0);
    if (sumHours > Number(te.hours) + 0.01) {
      throw new Error(`Allocated hours (${sumHours}) exceed entry hours (${te.hours})`);
    }

    // Replace existing allocations (deferred trigger validates the final sum)
    const { error: delErr } = await supabase
      .from("time_entry_allocations")
      .delete()
      .eq("time_entry_id", data.time_entry_id);
    if (delErr) throw new Error(delErr.message);

    if (data.allocations.length === 0) return { ok: true, allocations: [] };

    const rows = data.allocations.map((a) => ({
      tenant_id: te.tenant_id,
      time_entry_id: data.time_entry_id,
      project_id: a.project_id || null,
      job_id: a.job_id || null,
      department_id: a.department_id || null,
      cost_centre_code: a.cost_centre_code || null,
      percentage: a.percentage,
      hours: a.hours,
      notes: a.notes || null,
    }));
    const { data: inserted, error: insErr } = await supabase
      .from("time_entry_allocations")
      .insert(rows)
      .select("*");
    if (insErr) throw new Error(insErr.message);
    return { ok: true, allocations: inserted ?? [] };
  });

// ---------- Manager review queue: three-way variance ----------
export const listVarianceQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
        only_flagged: z.boolean().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const callerTenantId = await getTenantId(supabase, userId);
    const tenantId = callerTenantId;
    if (!tenantId) throw new Error("No organization");

    let q = supabase
      .from("v_timesheet_variance")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("work_date", { ascending: false });
    if (data.from) q = q.gte("work_date", data.from);
    if (data.to) q = q.lte("work_date", data.to);
    if (data.only_flagged) q = q.eq("flag_suspicious", true);

    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);

    const empIds = Array.from(new Set((rows ?? []).map((r: any) => r.employee_id)));
    let empsById: Record<string, any> = {};
    if (empIds.length) {
      const { data: emps } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number")
        .in("id", empIds);
      empsById = Object.fromEntries((emps ?? []).map((e: any) => [e.id, e]));
    }
    return { rows: (rows ?? []).map((r: any) => ({ ...r, employee: empsById[r.employee_id] ?? null })) };
  });

// ---------- Allocation rollup (for cost-centre reporting) ----------
export const allocationRollup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ from: z.string().optional(), to: z.string().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const callerTenantId = await getTenantId(supabase, userId);
    const tenantId = callerTenantId;
    if (!tenantId) throw new Error("No organization");

    let q = supabase
      .from("time_entry_allocations")
      .select("hours, project_id, department_id, cost_centre_code, time_entries:time_entry_id(work_date, employee_id)")
      .eq("tenant_id", tenantId);
    const { data: rows, error } = await q.limit(2000);
    if (error) throw new Error(error.message);

    const byProject: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    for (const r of rows ?? []) {
      const wd = (r as any).time_entries?.work_date as string | undefined;
      if (data.from && wd && wd < data.from) continue;
      if (data.to && wd && wd > data.to) continue;
      const h = Number((r as any).hours || 0);
      if ((r as any).project_id) byProject[(r as any).project_id] = (byProject[(r as any).project_id] || 0) + h;
      if ((r as any).department_id) byDept[(r as any).department_id] = (byDept[(r as any).department_id] || 0) + h;
    }
    return { byProject, byDept };
  });
