import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { resolveApprovalScope, scopeCovers, refusalReason } from "@/lib/approval-scope";
import { recordApprovalAction } from "@/lib/approval-audit";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function notifyTimesheet(opts: {
  supabase: any; userId: string; timesheet_id: string; action: string;
  reason?: string | null;
}) {
  try {
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    const { data: t } = await opts.supabase
      .from("timesheets")
      .select(
        "id, period_start, period_end, total_hours, employee:employee_id(first_name, last_name, email, manager_id)",
      )
      .eq("id", opts.timesheet_id).maybeSingle();
    if (!t?.employee) return;
    const emp = t.employee as any;
    const { data: actorP } = await opts.supabase
      .from("profiles").select("email, full_name").eq("id", opts.userId).maybeSingle();
    const recipients = new Set<string>();
    if (emp.email) recipients.add(emp.email);
    if (emp.manager_id) {
      const { data: mgr } = await opts.supabase
        .from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.email) recipients.add(mgr.email);
    }
    for (const to of recipients) {
      await sendInternalEmail({
        templateName: "timesheet-status",
        recipientEmail: to,
        idempotencyKey: `timesheet-${opts.timesheet_id}-${opts.action}`,
        preferenceKey: "notify_timesheet",
        templateData: {
          employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
          periodStart: t.period_start,
          periodEnd: t.period_end,
          totalHours: Number(t.total_hours ?? 0),
          status: opts.action,
          actorName: actorP?.full_name ?? actorP?.email ?? "Someone",
          reason: opts.reason ?? null,
        },
      });
    }
  } catch (e) { console.error("[timesheet email]", e); }
}

// ---------- Employee: submit a week (or arbitrary range) for approval ----------
export const submitMyTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      period_start: dateStr,
      period_end: dateStr,
      notes: z.string().trim().max(1000).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("id, tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (empErr) throw new Error(empErr.message);
    if (!emp) throw new Error("Employee profile not found");

    const { data: entries, error: entErr } = await supabase
      .from("time_entries")
      .select("hours, work_date")
      .eq("employee_id", emp.id)
      .gte("work_date", data.period_start)
      .lte("work_date", data.period_end);
    if (entErr) throw new Error(entErr.message);
    if (!entries || entries.length === 0) {
      throw new Error("No time entries in this period to submit");
    }

    const total = entries.reduce((s: number, r: any) => s + Number(r.hours || 0), 0);

    const { data: existing } = await supabase
      .from("timesheets")
      .select("id, status")
      .eq("employee_id", emp.id)
      .eq("period_start", data.period_start)
      .eq("period_end", data.period_end)
      .maybeSingle();

    const now = new Date().toISOString();
    const payload: any = {
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      period_start: data.period_start,
      period_end: data.period_end,
      total_hours: total,
      overtime_hours: 0,
      status: "submitted",
      submitted_at: now,
      submitted_by: userId,
      notes: data.notes ?? null,
      rejection_reason: null,
      approved_at: null,
      approved_by: null,
      totals: { entries: entries.length, hours: total },
    };

    let tsId: string;
    if (existing) {
      if (existing.status === "approved") {
        throw new Error("Timesheet for this period has already been approved");
      }
      const { error } = await supabase.from("timesheets").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      tsId = existing.id;
    } else {
      const { data: ins, error } = await supabase
        .from("timesheets").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      tsId = ins.id;
    }
    await notifyTimesheet({ supabase, userId, timesheet_id: tsId, action: "submitted" });
    return { ok: true, id: tsId, status: "submitted" as const };
  });

// ---------- Employee: list own timesheets ----------
export const listMyTimesheets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: emp } = await supabase
      .from("employees").select("id").eq("user_id", userId).maybeSingle();
    if (!emp) return { timesheets: [] };
    const { data, error } = await supabase
      .from("timesheets")
      .select("id, period_start, period_end, total_hours, status, submitted_at, approved_at, rejection_reason, notes")
      .eq("employee_id", emp.id)
      .order("period_start", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { timesheets: data ?? [] };
  });

/**
 * The caller's approval scope for one timesheet, or a refusal explaining why
 * they cannot action it. Loads the sheet as well, since every caller needs it.
 */
async function assertTimesheetApprover(supabase: any, userId: string, timesheetId: string) {
  const { data: sheet } = await supabase
    .from("timesheets")
    .select("id, tenant_id, employee_id, status")
    .eq("id", timesheetId)
    .maybeSingle();
  if (!sheet) throw new Error("Timesheet not found");
  const scope = await resolveApprovalScope(supabase, userId, sheet.tenant_id, "timesheet");
  if (!scopeCovers(scope, sheet.employee_id)) {
    throw new Error(refusalReason(scope, sheet.employee_id));
  }
  return { scope, sheet };
}

// ---------- Manager: list timesheets awaiting approval ----------
export const listPendingTimesheets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      status: z.enum(["submitted", "approved", "rejected", "all"]).default("submitted"),
    }).partial().parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase
      .from("timesheets")
      .select("id, employee_id, period_start, period_end, total_hours, status, submitted_at, approved_at, rejection_reason, notes, employees:employee_id(first_name, last_name, employee_number)")
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(200);
    const status = data?.status ?? "submitted";
    if (status !== "all") q = q.eq("status", status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { timesheets: rows ?? [] };
  });

// ---------- Manager: approve ----------
export const approveTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), comment: z.string().trim().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // T6 · These two carried no role check at all — they relied entirely on
    // RLS, which is a security boundary but not a scoping one, and which had
    // nothing to say about approving your own timesheet.
    const { scope, sheet } = await assertTimesheetApprover(supabase, userId, data.id);

    const { error } = await supabase
      .from("timesheets")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: userId,
        rejection_reason: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await recordApprovalAction(supabase, {
      tenantId: sheet.tenant_id, itemType: "timesheet", itemId: sheet.id,
      employeeId: sheet.employee_id, approverId: userId,
      roleUsed: scope.roleUsed ?? "manager", action: "approved",
      reason: data.comment ?? null,
    });
    await notifyTimesheet({ supabase, userId, timesheet_id: data.id, action: "approved" });
    return { ok: true };
  });

// ---------- Manager: reject ----------
export const rejectTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      reason: z.string().trim().min(3).max(1000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { scope, sheet } = await assertTimesheetApprover(supabase, userId, data.id);

    const { error } = await supabase
      .from("timesheets")
      .update({
        status: "rejected",
        rejection_reason: data.reason,
        approved_at: null,
        approved_by: userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await recordApprovalAction(supabase, {
      tenantId: sheet.tenant_id, itemType: "timesheet", itemId: sheet.id,
      employeeId: sheet.employee_id, approverId: userId,
      roleUsed: scope.roleUsed ?? "manager", action: "rejected", reason: data.reason,
    });
    await notifyTimesheet({ supabase, userId, timesheet_id: data.id, action: "rejected", reason: data.reason });
    return { ok: true };
  });
