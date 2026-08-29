import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

// ---------- Notification helpers ----------
async function loadLeaveContext(admin: any, requestId: string) {
  const { data: req } = await admin.from("leave_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) return null;
  const [{ data: emp }, { data: lt }] = await Promise.all([
    admin.from("employees").select("first_name,last_name,email").eq("id", req.employee_id).maybeSingle(),
    admin.from("leave_types").select("name").eq("id", req.leave_type_id).maybeSingle(),
  ]);
  return {
    req,
    employeeEmail: emp?.email as string | undefined,
    employeeName: emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : undefined,
    leaveTypeName: lt?.name as string | undefined,
  };
}

async function getManagerEmails(admin: any, tenantId: string): Promise<string[]> {
  const { data: profiles } = await admin
    .from("profiles").select("id,email").eq("tenant_id", tenantId);
  if (!profiles?.length) return [];
  const ids = profiles.map((p: any) => p.id);
  const { data: roles } = await admin
    .from("user_roles").select("user_id,role").in("user_id", ids)
    .in("role", ["manager", "org_admin"]);
  const roleSet = new Set((roles ?? []).map((r: any) => r.user_id));
  return profiles.filter((p: any) => roleSet.has(p.id) && p.email).map((p: any) => p.email as string);
}

async function getApproverName(admin: any, userId: string): Promise<string | undefined> {
  const { data } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
  return data?.full_name || data?.email;
}


async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadEmailSender() {
  const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
  return sendInternalEmail;
}

async function getRoles(ctxSupabase: any, userId: string): Promise<string[]> {
  const { data } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

async function getEmployeeForUser(ctxSupabase: any, userId: string) {
  const { data } = await ctxSupabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data as { id: string; tenant_id: string } | null;
}

/**
 * Calendar days between two dates inclusive, minus half-day discounts.
 * Deliberately the same formula the client uses (`leave.tsx:31-40`) so a
 * request's `days` can be recomputed here rather than trusted from the
 * caller — a crafted `days` up to the schema's 366-day cap, independent of
 * the actual date range, was previously accepted as-is. Does not exclude
 * weekends or public holidays; that is a separate, tracked gap.
 */
export function daysBetween(
  start: string,
  end: string,
  halfStart: boolean,
  halfEnd: boolean,
): number {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  if (e < s) return 0;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  let d = diff;
  if (halfStart) d -= 0.5;
  if (halfEnd && start !== end) d -= 0.5;
  return Math.max(0.5, d);
}

/**
 * Whether a leave type is balance-tracked at all. Types with neither a quota
 * nor an accrual rate (e.g. Unpaid Leave, seeded with both at 0) are
 * deliberately uncapped — the same "has a real quota" test
 * `leave-setup.functions.ts` uses to decide whether a type counts as
 * configured.
 */
export function hasLeaveQuota(leaveType: {
  annual_quota_days: number | string;
  accrual_per_month: number | string;
}): boolean {
  return Number(leaveType.annual_quota_days) > 0 || Number(leaveType.accrual_per_month) > 0;
}

/**
 * Days available for a leave type/year: the existing balance row if one has
 * been created, or the type's quota if accrual hasn't seeded one yet (mirrors
 * the seeding in {@link upsertBalanceDelta}).
 */
export function availableLeaveBalance(
  leaveType: { annual_quota_days: number | string },
  balance: {
    accrued_days: number | string;
    used_days: number | string;
    pending_days: number | string;
    carried_over_days: number | string;
  } | null,
): number {
  if (!balance) return Number(leaveType.annual_quota_days);
  return (
    Number(balance.accrued_days) +
    Number(balance.carried_over_days) -
    Number(balance.used_days) -
    Number(balance.pending_days)
  );
}

async function assertApproverForTenant(ctxSupabase: any, userId: string, tenantId: string) {
  const rs = await getRoles(ctxSupabase, userId);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("manager") && !rs.includes("org_admin")) {
    throw new Error("Forbidden: manager or org admin role required");
  }
  const { data: profile } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}

// ---------- Submit leave request ----------
export const submitLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      leaveTypeId: z.string().uuid(),
      startDate: z.string(),
      endDate: z.string(),
      // Display-only: the client shows this for the balance preview while the
      // form is open, but it is never trusted. The authoritative value is
      // `computedDays` below, from the dates the request actually carries.
      days: z.number().positive().max(366).optional(),
      halfDayStart: z.boolean().optional(),
      halfDayEnd: z.boolean().optional(),
      reason: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("Employee profile not found");
    if (new Date(data.endDate) < new Date(data.startDate)) throw new Error("End date must be on or after start date");

    const admin = await loadAdmin();
    const { data: lt } = await admin.from("leave_types").select("tenant_id,is_active,allow_half_day,annual_quota_days,accrual_per_month").eq("id", data.leaveTypeId).maybeSingle();
    if (!lt || !lt.is_active) throw new Error("Leave type not available");
    if (lt.tenant_id !== emp.tenant_id) throw new Error("Leave type does not belong to your organization");
    if ((data.halfDayStart || data.halfDayEnd) && !lt.allow_half_day) throw new Error("Half-day not allowed for this leave type");

    const computedDays = daysBetween(data.startDate, data.endDate, !!data.halfDayStart, !!data.halfDayEnd);
    const year = new Date(data.startDate).getUTCFullYear();

    if (hasLeaveQuota(lt)) {
      const { data: balance } = await admin
        .from("leave_balances")
        .select("accrued_days,used_days,pending_days,carried_over_days")
        .eq("employee_id", emp.id).eq("leave_type_id", data.leaveTypeId).eq("year", year).maybeSingle();
      const available = availableLeaveBalance(lt, balance);
      if (computedDays > available) {
        throw new Error(
          `Insufficient leave balance: ${available} day(s) available, ${computedDays} requested.`,
        );
      }
    }

    const { data: req, error } = await admin.from("leave_requests").insert({
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      leave_type_id: data.leaveTypeId,
      start_date: data.startDate,
      end_date: data.endDate,
      days: computedDays,
      half_day_start: !!data.halfDayStart,
      half_day_end: !!data.halfDayEnd,
      reason: data.reason ?? null,
      status: "pending",
    }).select().single();
    if (error) {
      console.error("[leave.submit] DB error:", error.message, error.code);
      throw new Error("Failed to submit leave request.");
    }

    // Bump pending balance
    await upsertBalanceDelta(admin, emp.tenant_id, emp.id, data.leaveTypeId, year, { pending: computedDays });

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_request", entity_id: req.id,
      action: "submit", metadata: { leave_type_id: data.leaveTypeId, days: computedDays },
    });

    // Notifications
    try {
      const ctx = await loadLeaveContext(admin, req.id);
      const baseData = {
        employeeName: ctx?.employeeName,
        leaveType: ctx?.leaveTypeName,
        startDate: data.startDate,
        endDate: data.endDate,
        days: computedDays,
        reason: data.reason,
      };
      if (ctx?.employeeEmail) {
        await sendInternalEmail({
          templateName: "leave-submitted-employee",
          recipientEmail: ctx.employeeEmail,
          idempotencyKey: `leave-submitted-employee-${req.id}`,
          templateData: baseData,
          preferenceKey: "notify_leave_submitted",
        });
      }
      const managers = await getManagerEmails(admin, emp.tenant_id);
      await Promise.all(managers.map((m) =>
        sendInternalEmail({
          templateName: "leave-submitted-manager",
          recipientEmail: m,
          idempotencyKey: `leave-submitted-manager-${req.id}-${m}`,
          templateData: baseData,
          preferenceKey: "notify_leave_submitted",
        })
      ));
    } catch (e) { console.error("[leave.submit] notify failed", e); }

    return { request: req };
  });


// ---------- Cancel own pending request ----------
export const cancelLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ requestId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("Employee profile not found");
    const admin = await loadAdmin();
    const { data: req } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.employee_id !== emp.id) throw new Error("You can only cancel your own requests");
    if (req.status !== "pending") throw new Error("Only pending requests can be cancelled");

    const { error } = await admin.from("leave_requests").update({ status: "cancelled" }).eq("id", req.id);
    if (error) { console.error("[leave.cancel]", error.message, error.code); throw new Error("Failed to cancel request."); }

    const year = new Date(req.start_date).getUTCFullYear();
    await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, { pending: -Number(req.days) });

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_request", entity_id: req.id, action: "cancel", metadata: {},
    });

    // Notify managers that the request was cancelled
    try {
      const ctx = await loadLeaveContext(admin, req.id);
      const baseData = {
        employeeName: ctx?.employeeName,
        leaveType: ctx?.leaveTypeName,
        startDate: req.start_date,
        endDate: req.end_date,
        days: Number(req.days),
      };
      const managers = await getManagerEmails(admin, req.tenant_id);
      await Promise.all(managers.map((m) =>
        sendInternalEmail({
          templateName: "leave-cancelled-manager",
          recipientEmail: m,
          idempotencyKey: `leave-cancelled-manager-${req.id}-${m}`,
          templateData: baseData,
          preferenceKey: "notify_leave_cancelled",
        })
      ));
    } catch (e) { console.error("[leave.cancel] notify failed", e); }

    return { ok: true };
  });


// ---------- Approve ----------
export const approveLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ requestId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const admin = await loadAdmin();
    const { data: req } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Only pending requests can be approved");
    await assertApproverForTenant(supabase, userId, req.tenant_id);

    const { error } = await admin.from("leave_requests").update({
      status: "approved", approved_by: userId, approved_at: new Date().toISOString(),
    }).eq("id", req.id);
    if (error) { console.error("[leave.approve]", error.message, error.code); throw new Error("Failed to approve request."); }

    const year = new Date(req.start_date).getUTCFullYear();
    await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, {
      pending: -Number(req.days), used: Number(req.days),
    });

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_request", entity_id: req.id, action: "approve", metadata: { days: req.days },
    });

    // Notify employee of approval
    try {
      const ctx = await loadLeaveContext(admin, req.id);
      const approverName = await getApproverName(admin, userId);
      if (ctx?.employeeEmail) {
        await sendInternalEmail({
          templateName: "leave-approved",
          recipientEmail: ctx.employeeEmail,
          idempotencyKey: `leave-approved-${req.id}`,
          templateData: {
            approverName,
            leaveType: ctx.leaveTypeName,
            startDate: req.start_date,
            endDate: req.end_date,
            days: Number(req.days),
          },
          preferenceKey: "notify_leave_decision",
        });
      }
    } catch (e) { console.error("[leave.approve] notify failed", e); }

    return { ok: true };
  });


// ---------- Reject ----------
export const rejectLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ requestId: z.string().uuid(), reason: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const admin = await loadAdmin();
    const { data: req } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Only pending requests can be rejected");
    await assertApproverForTenant(supabase, userId, req.tenant_id);

    const { error } = await admin.from("leave_requests").update({
      status: "rejected", approved_by: userId, approved_at: new Date().toISOString(),
      rejection_reason: data.reason ?? null,
    }).eq("id", req.id);
    if (error) { console.error("[leave.reject]", error.message, error.code); throw new Error("Failed to reject request."); }

    const year = new Date(req.start_date).getUTCFullYear();
    await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, { pending: -Number(req.days) });

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_request", entity_id: req.id, action: "reject",
      metadata: { reason: data.reason ?? null },
    });

    // Notify employee of rejection
    try {
      const ctx = await loadLeaveContext(admin, req.id);
      const approverName = await getApproverName(admin, userId);
      if (ctx?.employeeEmail) {
        await sendInternalEmail({
          templateName: "leave-rejected",
          recipientEmail: ctx.employeeEmail,
          idempotencyKey: `leave-rejected-${req.id}`,
          templateData: {
            approverName,
            leaveType: ctx.leaveTypeName,
            startDate: req.start_date,
            endDate: req.end_date,
            days: Number(req.days),
            rejectionReason: data.reason,
          },
          preferenceKey: "notify_leave_decision",
        });
      }
    } catch (e) { console.error("[leave.reject] notify failed", e); }

    return { ok: true };
  });


// ---------- Balance helper ----------
async function upsertBalanceDelta(
  admin: any,
  tenantId: string,
  employeeId: string,
  leaveTypeId: string,
  year: number,
  delta: { pending?: number; used?: number; accrued?: number; carried_over?: number },
) {
  const { data: existing } = await admin.from("leave_balances").select("*")
    .eq("employee_id", employeeId).eq("leave_type_id", leaveTypeId).eq("year", year).maybeSingle();
  if (existing) {
    const update: any = {};
    if (delta.pending !== undefined) update.pending_days = Math.max(0, Number(existing.pending_days) + delta.pending);
    if (delta.used !== undefined) update.used_days = Math.max(0, Number(existing.used_days) + delta.used);
    if (delta.accrued !== undefined) update.accrued_days = Number(existing.accrued_days) + delta.accrued;
    if (delta.carried_over !== undefined) update.carried_over_days = Number(existing.carried_over_days) + delta.carried_over;
    await admin.from("leave_balances").update(update).eq("id", existing.id);
  } else {
    // Seed from leave_type quota
    const { data: lt } = await admin.from("leave_types").select("annual_quota_days").eq("id", leaveTypeId).maybeSingle();
    await admin.from("leave_balances").insert({
      tenant_id: tenantId,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year,
      accrued_days: Number(lt?.annual_quota_days ?? 0) + (delta.accrued ?? 0),
      used_days: Math.max(0, delta.used ?? 0),
      pending_days: Math.max(0, delta.pending ?? 0),
      carried_over_days: delta.carried_over ?? 0,
    });
  }
}
