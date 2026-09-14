import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertOrgAdmin(ctxSupabase: any, userId: string, tenantId: string) {
  const { data: roles } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (r.includes("super_admin")) return;
  if (!r.includes("org_admin")) throw new Error("Forbidden: org admin role required");
  const callerTenant = await getTenantId(ctxSupabase, userId);
  if (!callerTenant || callerTenant !== tenantId) throw new Error("Forbidden: tenant mismatch");
}

async function getOrCreateBalance(admin: any, tenantId: string, employeeId: string, leaveTypeId: string, year: number) {
  const { data: existing } = await admin.from("leave_balances").select("*")
    .eq("employee_id", employeeId).eq("leave_type_id", leaveTypeId).eq("year", year).maybeSingle();
  if (existing) return existing;
  const { data: created } = await admin.from("leave_balances").insert({
    tenant_id: tenantId, employee_id: employeeId, leave_type_id: leaveTypeId, year,
    accrued_days: 0, used_days: 0, pending_days: 0, carried_over_days: 0,
  }).select().single();
  return created;
}

interface AccrualSummary {
  processed: number;
  skipped: number;
  failed: number;
  errors: string[];
}

// -------------------- Monthly accrual --------------------
async function runMonthlyAccrualImpl(opts: { tenantId?: string; year: number; month: number; actorId: string | null }): Promise<AccrualSummary> {
  const admin = await loadAdmin();
  const periodKey = `${opts.year}-${String(opts.month).padStart(2, "0")}`;
  const summary: AccrualSummary = { processed: 0, skipped: 0, failed: 0, errors: [] };

  // Active leave types with accrual > 0
  let ltQuery = admin.from("leave_types").select("id,tenant_id,accrual_per_month").eq("is_active", true).gt("accrual_per_month", 0);
  if (opts.tenantId) ltQuery = ltQuery.eq("tenant_id", opts.tenantId);
  const { data: leaveTypes, error: ltErr } = await ltQuery;
  if (ltErr) throw new Error(ltErr.message);

  for (const lt of leaveTypes ?? []) {
    // Active employees in that tenant
    const { data: emps } = await admin.from("employees")
      .select("id,tenant_id,hire_date,termination_date,status")
      .eq("tenant_id", lt.tenant_id).eq("status", "active");
    for (const emp of emps ?? []) {
      try {
        // Skip if hired after period or terminated before period start
        const periodStart = new Date(Date.UTC(opts.year, opts.month - 1, 1));
        const periodEnd = new Date(Date.UTC(opts.year, opts.month, 0));
        const hire = new Date(emp.hire_date + "T00:00:00Z");
        if (hire > periodEnd) { summary.skipped++; continue; }
        if (emp.termination_date) {
          const term = new Date(emp.termination_date + "T00:00:00Z");
          if (term < periodStart) { summary.skipped++; continue; }
        }
        const amount = Number(lt.accrual_per_month);

        // Idempotent insert into accrual log
        const { error: logErr } = await admin.from("leave_accrual_log").insert({
          tenant_id: lt.tenant_id, employee_id: emp.id, leave_type_id: lt.id,
          kind: "accrual", period_key: periodKey, amount, actor_id: opts.actorId,
          reason: `Monthly accrual ${periodKey}`,
        });
        if (logErr) {
          // Duplicate (already accrued) — skip silently
          if (logErr.code === "23505") { summary.skipped++; continue; }
          throw new Error(logErr.message);
        }

        const bal = await getOrCreateBalance(admin, lt.tenant_id, emp.id, lt.id, opts.year);
        await admin.from("leave_balances").update({
          accrued_days: Number(bal.accrued_days) + amount,
        }).eq("id", bal.id);

        summary.processed++;
      } catch (e: any) {
        summary.failed++;
        summary.errors.push(`${emp.id}/${lt.id}: ${e.message ?? String(e)}`);
      }
    }
  }
  return summary;
}

export const runMonthlyLeaveAccrual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    year: z.number().int().min(2000).max(2100).optional(),
    month: z.number().int().min(1).max(12).optional(),
    tenantId: z.string().uuid().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Determine tenant scope: org_admin -> their tenant; super_admin -> all (no filter)
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const r = (roles ?? []).map((x: any) => x.role);
    let tenantId = data.tenantId;
    if (!r.includes("super_admin")) {
      if (!r.includes("org_admin")) throw new Error("Forbidden: org admin role required");
      const callerTenantId = await requireTenantId(supabase, userId);
      tenantId = callerTenantId;
    }
    const now = new Date();
    const year = data.year ?? now.getUTCFullYear();
    const month = data.month ?? (now.getUTCMonth() + 1);
    const summary = await runMonthlyAccrualImpl({ tenantId, year, month, actorId: userId });
    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_accrual", entity_id: `${tenantId ?? "all"}-${year}-${month}`,
      action: "monthly_accrual_run", metadata: { ...summary, tenantId, year, month },
    });
    return summary;
  });

// Internal hook entry-point (no user context, callable by cron)
export async function runMonthlyAccrualSystem(year: number, month: number): Promise<AccrualSummary> {
  return runMonthlyAccrualImpl({ year, month, actorId: null });
}

// -------------------- Year-end carry-over --------------------
async function runCarryOverImpl(opts: { tenantId?: string; fromYear: number; actorId: string | null }): Promise<AccrualSummary> {
  const admin = await loadAdmin();
  const periodKey = `${opts.fromYear}->${opts.fromYear + 1}`;
  const summary: AccrualSummary = { processed: 0, skipped: 0, failed: 0, errors: [] };

  let ltQuery = admin.from("leave_types").select("id,tenant_id,allow_carry_over,max_carry_over_days").eq("is_active", true).eq("allow_carry_over", true);
  if (opts.tenantId) ltQuery = ltQuery.eq("tenant_id", opts.tenantId);
  const { data: leaveTypes, error: ltErr } = await ltQuery;
  if (ltErr) throw new Error(ltErr.message);

  for (const lt of leaveTypes ?? []) {
    const { data: balances } = await admin.from("leave_balances").select("*")
      .eq("leave_type_id", lt.id).eq("year", opts.fromYear);
    for (const bal of balances ?? []) {
      try {
        const remaining = Math.max(0, Number(bal.accrued_days) + Number(bal.carried_over_days) - Number(bal.used_days));
        const cap = Number(lt.max_carry_over_days);
        const carryAmount = cap > 0 ? Math.min(remaining, cap) : remaining;
        if (carryAmount <= 0) { summary.skipped++; continue; }

        const { error: logErr } = await admin.from("leave_accrual_log").insert({
          tenant_id: bal.tenant_id, employee_id: bal.employee_id, leave_type_id: lt.id,
          kind: "carry_over", period_key: periodKey, amount: carryAmount, actor_id: opts.actorId,
          reason: `Year-end carry-over from ${opts.fromYear}`,
        });
        if (logErr) {
          if (logErr.code === "23505") { summary.skipped++; continue; }
          throw new Error(logErr.message);
        }

        const next = await getOrCreateBalance(admin, bal.tenant_id, bal.employee_id, lt.id, opts.fromYear + 1);
        await admin.from("leave_balances").update({
          carried_over_days: Number(next.carried_over_days) + carryAmount,
        }).eq("id", next.id);

        summary.processed++;
      } catch (e: any) {
        summary.failed++;
        summary.errors.push(`${bal.employee_id}/${lt.id}: ${e.message ?? String(e)}`);
      }
    }
  }
  return summary;
}

export const runYearEndCarryOver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    fromYear: z.number().int().min(2000).max(2100).optional(),
    tenantId: z.string().uuid().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const r = (roles ?? []).map((x: any) => x.role);
    let tenantId = data.tenantId;
    if (!r.includes("super_admin")) {
      if (!r.includes("org_admin")) throw new Error("Forbidden: org admin role required");
      const callerTenantId = await requireTenantId(supabase, userId);
      tenantId = callerTenantId;
    }
    const fromYear = data.fromYear ?? (new Date().getUTCFullYear() - 1);
    const summary = await runCarryOverImpl({ tenantId, fromYear, actorId: userId });
    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_accrual", entity_id: `${tenantId ?? "all"}-carry-${fromYear}`,
      action: "year_end_carry_over_run", metadata: { ...summary, tenantId, fromYear },
    });
    return summary;
  });

export async function runCarryOverSystem(fromYear: number): Promise<AccrualSummary> {
  return runCarryOverImpl({ fromYear, actorId: null });
}

// -------------------- Manual adjustment --------------------
export const adjustLeaveBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    employeeId: z.string().uuid(),
    leaveTypeId: z.string().uuid(),
    year: z.number().int().min(2000).max(2100),
    field: z.enum(["accrued_days", "used_days", "carried_over_days"]),
    delta: z.number().min(-365).max(365).refine((n) => n !== 0, "Delta must be non-zero"),
    reason: z.string().min(1).max(500),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();
    const { data: emp } = await admin.from("employees").select("tenant_id").eq("id", data.employeeId).maybeSingle();
    if (!emp) throw new Error("Employee not found");
    await assertOrgAdmin(supabase, userId, emp.tenant_id);

    const bal = await getOrCreateBalance(admin, emp.tenant_id, data.employeeId, data.leaveTypeId, data.year);
    const current = Number((bal as any)[data.field] ?? 0);
    const next = current + data.delta;
    if (next < 0) throw new Error(`Adjustment would make ${data.field} negative (${next.toFixed(2)})`);

    await admin.from("leave_balances").update({ [data.field]: next } as any).eq("id", bal.id);
    await admin.from("leave_accrual_log").insert({
      tenant_id: emp.tenant_id, employee_id: data.employeeId, leave_type_id: data.leaveTypeId,
      kind: "adjustment", period_key: `${data.year}-${data.field}-${Date.now()}`,
      amount: data.delta, actor_id: userId, reason: data.reason,
    });
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_balance", entity_id: bal.id,
      action: "manual_adjustment",
      metadata: { field: data.field, delta: data.delta, reason: data.reason, employee_id: data.employeeId, leave_type_id: data.leaveTypeId, year: data.year },
    });
    return { ok: true, newValue: next };
  });

// -------------------- Balance projection --------------------
export const projectLeaveBalances = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    employeeId: z.string().uuid().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await loadAdmin();

    let empId = data.employeeId;
    let tenantId: string | undefined;
    if (!empId) {
      const { data: e } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
      if (!e) throw new Error("Employee profile not found");
      empId = e.id; tenantId = e.tenant_id;
    } else {
      const { data: e } = await admin.from("employees").select("tenant_id").eq("id", empId).maybeSingle();
      if (!e) throw new Error("Employee not found");
      tenantId = e.tenant_id;
      // Authorisation: self, manager/org_admin of tenant, or super_admin
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const r = (roles ?? []).map((x: any) => x.role);
      const callerTenantId = await getTenantId(supabase, userId);
      const isPriv = r.includes("super_admin") ||
        ((r.includes("org_admin") || r.includes("manager")) && callerTenantId === tenantId);
      const { data: self } = await supabase.from("employees").select("id").eq("user_id", userId).eq("id", empId).maybeSingle();
      if (!isPriv && !self) throw new Error("Forbidden");
    }

    const today = new Date();
    const target = new Date(data.targetDate + "T00:00:00Z");
    if (target < today) throw new Error("Target date must be in the future");
    const targetYear = target.getUTCFullYear();

    // Active leave types for this tenant
    const { data: types } = await admin.from("leave_types")
      .select("id,name,color,accrual_per_month,allow_carry_over,max_carry_over_days,is_paid")
      .eq("tenant_id", tenantId!).eq("is_active", true);

    // Existing balances for current + each subsequent year up to target
    const { data: balances } = await admin.from("leave_balances")
      .select("*").eq("employee_id", empId).gte("year", today.getUTCFullYear()).lte("year", targetYear);

    // Future approved + pending leave requests (will reduce/reserve balance) up to target
    const { data: futureReqs } = await admin.from("leave_requests")
      .select("leave_type_id,start_date,end_date,days,status")
      .eq("employee_id", empId)
      .in("status", ["pending", "approved"])
      .gte("end_date", today.toISOString().slice(0, 10))
      .lte("start_date", data.targetDate);

    const projections = (types ?? []).map((t: any) => {
      const curYear = today.getUTCFullYear();
      const curBal = (balances ?? []).find((b: any) => b.leave_type_id === t.id && b.year === curYear);
      let accrued = Number(curBal?.accrued_days ?? 0);
      let used = Number(curBal?.used_days ?? 0);
      let pending = Number(curBal?.pending_days ?? 0);
      let carried = Number(curBal?.carried_over_days ?? 0);

      // Projected monthly accruals from next month through target
      const monthsBetween = (a: Date, b: Date) =>
        (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
      const nextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
      let projectedAccrual = 0;
      if (Number(t.accrual_per_month) > 0 && target >= nextMonth) {
        const m = monthsBetween(nextMonth, target) + 1;
        projectedAccrual = Math.max(0, m) * Number(t.accrual_per_month);
      }

      // Projected year-end carry-over if target is next year
      let projectedCarry = 0;
      if (targetYear > curYear && t.allow_carry_over) {
        const remaining = Math.max(0, accrued + carried + projectedAccrual - used - pending);
        const cap = Number(t.max_carry_over_days);
        projectedCarry = cap > 0 ? Math.min(remaining, cap) : remaining;
      }

      // Apply future approved + pending requests on top of currentbalance pending/used
      let futurePending = 0;
      let futureApproved = 0;
      (futureReqs ?? []).filter((r: any) => r.leave_type_id === t.id).forEach((r: any) => {
        if (r.status === "pending") futurePending += Number(r.days);
        else if (r.status === "approved") futureApproved += Number(r.days);
      });

      const projectedAvailable =
        accrued + carried + projectedAccrual + projectedCarry
        - used - pending - futureApproved - futurePending;

      return {
        leaveTypeId: t.id,
        leaveTypeName: t.name,
        color: t.color,
        current: { accrued, used, pending, carried, available: accrued + carried - used - pending },
        projected: {
          accrual: projectedAccrual,
          carryOver: projectedCarry,
          futureApproved,
          futurePending,
          available: projectedAvailable,
        },
      };
    });

    return { targetDate: data.targetDate, projections };
  });
