import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { resolveApprovalScope, scopeCovers, refusalReason } from "@/lib/approval-scope";
import { recordApprovalAction } from "@/lib/approval-audit";
import { getTenantId } from "@/lib/tenant-scope";

// ---------- Notification helpers ----------
async function loadLeaveContext(admin: any, requestId: string) {
  const { data: req } = await admin.from("leave_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) return null;
  const [{ data: emp }, { data: lt }] = await Promise.all([
    admin.from("employees").select("first_name,last_name,email,user_id").eq("id", req.employee_id).maybeSingle(),
    admin.from("leave_types").select("name").eq("id", req.leave_type_id).maybeSingle(),
  ]);
  return {
    req,
    employeeEmail: emp?.email as string | undefined,
    employeeUserId: (emp?.user_id as string | undefined) ?? null,
    employeeName: emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : undefined,
    leaveTypeName: lt?.name as string | undefined,
  };
}

async function getManagerRecipients(
  admin: any,
  tenantId: string,
): Promise<{ id: string; email: string | null }[]> {
  const { data: profiles } = await admin
    .from("profiles").select("id,email").eq("tenant_id", tenantId);
  if (!profiles?.length) return [];
  const ids = profiles.map((p: any) => p.id);
  const { data: roles } = await admin
    .from("user_roles").select("user_id,role").in("user_id", ids)
    .in("role", ["manager", "org_admin"]);
  const roleSet = new Set((roles ?? []).map((r: any) => r.user_id));
  return profiles
    .filter((p: any) => roleSet.has(p.id))
    .map((p: any) => ({ id: p.id as string, email: (p.email as string | null) ?? null }));
}

/**
 * In-app companion to the email notifications below — email alone is
 * silently invisible whenever `employees.email` is null, which nothing else
 * here checks for. Same shape as `notify()` in wfh.functions.ts. A failure
 * here must never roll back the leave decision it describes.
 */
async function notify(args: {
  tenantId: string;
  userId: string | null;
  kind: string;
  title: string;
  body: string;
  link: string;
}) {
  if (!args.userId) return;
  try {
    const admin = await loadAdmin();
    await admin.from("in_app_notifications").insert({
      tenant_id: args.tenantId,
      user_id: args.userId,
      kind: args.kind,
      title: args.title,
      body: args.body,
      link: args.link,
    });
  } catch (e) {
    console.error("[leave] in-app notification failed", e);
  }
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
 * Raw calendar days between two dates inclusive, minus half-day discounts.
 * Kept as the building block for {@link countWorkingDays} and unit-tested on
 * its own, but no longer what a leave request is actually charged against —
 * see that function for the weekend/holiday exclusion.
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

/** UTC-Saturday or UTC-Sunday, for a `YYYY-MM-DD` date string. */
export function isWeekend(dateYmd: string): boolean {
  const day = new Date(dateYmd + "T00:00:00Z").getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Working days between two dates inclusive: every calendar day minus
 * weekends and the given public holidays, with half-day discounts applied to
 * whichever end of the range they name (a half-day flag on a day that's
 * already excluded is simply inert — you cannot half-request a day off from a
 * holiday).
 *
 * This is what a leave request is actually charged against. The server fetches
 * `holidays` for the tenant's country and the request's date range
 * (`submitLeaveRequest`); the client mirrors this exactly so the balance
 * preview it shows matches what will be submitted (`leave.tsx`).
 */
export function countWorkingDays(
  start: string,
  end: string,
  halfStart: boolean,
  halfEnd: boolean,
  holidays: ReadonlySet<string>,
): number {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  if (e < s) return 0;

  let total = 0;
  for (const cursor = new Date(s); cursor.getTime() <= e.getTime(); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const ymd = cursor.toISOString().slice(0, 10);
    if (isWeekend(ymd) || holidays.has(ymd)) continue;
    let dayValue = 1;
    if (halfStart && ymd === start) dayValue -= 0.5;
    if (halfEnd && ymd === end && start !== end) dayValue -= 0.5;
    total += dayValue;
  }
  return total;
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

/**
 * Highest active tier configured for this tenant/leave type. 0 means the
 * tenant has not set up `leave_approval_routes` at all (or none active for
 * this leave type), in which case {@link assertApproverForRequest} falls
 * back to the old behaviour untouched — this is the "only enforce for
 * tenants that configured one" default, deliberately non-breaking for every
 * tenant that never opened the leave setup wizard's routing tab.
 */
export async function getMaxApprovalTier(admin: any, tenantId: string, leaveTypeId: string): Promise<number> {
  const { data } = await admin
    .from("leave_approval_routes")
    .select("tier,leave_type_id")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);
  const relevant = ((data ?? []) as { tier: number; leave_type_id: string | null }[]).filter(
    (r) => r.leave_type_id === leaveTypeId || r.leave_type_id === null,
  );
  if (!relevant.length) return 0;
  return Math.max(...relevant.map((r) => r.tier));
}

/**
 * The active route for one tier — a row scoped to this exact leave type
 * takes precedence over a tenant-wide one (`leave_type_id: null`) at the
 * same tier.
 */
export async function getTierRoute(
  admin: any,
  tenantId: string,
  leaveTypeId: string,
  tier: number,
): Promise<{ approver_role: string | null; approver_user_id: string | null } | null> {
  const { data } = await admin
    .from("leave_approval_routes")
    .select("approver_role,approver_user_id,leave_type_id")
    .eq("tenant_id", tenantId)
    .eq("tier", tier)
    .eq("is_active", true);
  const rows = (data ?? []) as {
    approver_role: string | null;
    approver_user_id: string | null;
    leave_type_id: string | null;
  }[];
  return rows.find((r) => r.leave_type_id === leaveTypeId) ?? rows.find((r) => r.leave_type_id === null) ?? null;
}

async function getTenantUsersWithRole(admin: any, tenantId: string, role: string): Promise<string[]> {
  const { data: profiles } = await admin.from("profiles").select("id").eq("tenant_id", tenantId);
  const ids = (profiles ?? []).map((p: any) => p.id);
  if (!ids.length) return [];
  const { data: roles } = await admin.from("user_roles").select("user_id").in("user_id", ids).eq("role", role);
  return Array.from(new Set((roles ?? []).map((r: any) => r.user_id as string)));
}

/**
 * Who may decide a leave request right now, and whether their decision
 * finalises it or only advances it to the next tier of the tenant's
 * configured chain.
 *
 * `leave_approval_routes` was authored — full CRUD, a setup-wizard UI — but
 * never consumed here: any manager or org_admin in the tenant could approve
 * anything regardless of a configured multi-tier chain, and a manager could
 * approve their own request (the same self-decision hole fixed for WFH in
 * `tg_wfh_lifecycle`; leave had no equivalent check at all).
 */
export async function assertApproverForRequest(
  ctxSupabase: any,
  userId: string,
  req: { tenant_id: string; employee_id: string; leave_type_id: string; current_tier: number },
): Promise<{ isFinalTier: boolean; roleUsed: string }> {
  const rs = await getRoles(ctxSupabase, userId);
  if (rs.includes("super_admin")) return { isFinalTier: true, roleUsed: "super_admin" };

  const callerTenant = await getTenantId(ctxSupabase, userId);
  if (!callerTenant || callerTenant !== req.tenant_id) throw new Error("Forbidden: tenant mismatch");

  const myEmployee = await getEmployeeForUser(ctxSupabase, userId);
  if (myEmployee && myEmployee.id === req.employee_id) {
    throw new Error("Forbidden: you cannot decide your own leave request");
  }

  // T6 · Approval is a property of the role, with a scope, rather than a
  // hardcoded pair of role names. This check used to be
  // `manager || org_admin`, which left HR and branch admins — both expected to
  // approve — unable to action anything at all.
  const scope = await resolveApprovalScope(ctxSupabase, userId, req.tenant_id, "leave");
  if (!scopeCovers(scope, req.employee_id)) {
    throw new Error(refusalReason(scope, req.employee_id));
  }

  const maxTier = await getMaxApprovalTier(ctxSupabase, req.tenant_id, req.leave_type_id);
  if (maxTier === 0) {
    return { isFinalTier: true, roleUsed: scope.roleUsed ?? "manager" };
  }

  const route = await getTierRoute(ctxSupabase, req.tenant_id, req.leave_type_id, req.current_tier);
  if (!route) {
    // Tiers are configured but none exists at this exact tier (a gap in the
    // chain) — fall back rather than stranding the request with no possible
    // approver. The scope check above already ran.
    return { isFinalTier: true, roleUsed: scope.roleUsed ?? "manager" };
  }

  const matchesRoute =
    (!!route.approver_user_id && route.approver_user_id === userId) ||
    (!!route.approver_role && rs.includes(route.approver_role));
  if (!matchesRoute) {
    throw new Error(`Forbidden: this request is awaiting its tier ${req.current_tier} approver`);
  }

  return { isFinalTier: req.current_tier >= maxTier, roleUsed: scope.roleUsed ?? "manager" };
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

    const { data: tenant } = await admin.from("tenants").select("country_code").eq("id", emp.tenant_id).maybeSingle();
    const { data: holidayRows } = await admin
      .from("public_holidays")
      .select("holiday_date")
      .eq("country_code", tenant?.country_code ?? "")
      .gte("holiday_date", data.startDate)
      .lte("holiday_date", data.endDate);
    const holidays = new Set((holidayRows ?? []).map((h: any) => h.holiday_date as string));

    const computedDays = countWorkingDays(data.startDate, data.endDate, !!data.halfDayStart, !!data.halfDayEnd, holidays);
    if (computedDays <= 0) {
      throw new Error("Selected dates contain no working days — every day falls on a weekend or public holiday.");
    }
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
      const managers = await getManagerRecipients(admin, emp.tenant_id);
      await Promise.all(managers.map((m) => {
        const email = m.email
          ? sendInternalEmail({
              templateName: "leave-submitted-manager",
              recipientEmail: m.email,
              idempotencyKey: `leave-submitted-manager-${req.id}-${m.email}`,
              templateData: baseData,
              preferenceKey: "notify_leave_submitted",
            })
          : Promise.resolve();
        const inApp = notify({
          tenantId: emp.tenant_id,
          userId: m.id,
          kind: "leave_submitted",
          title: "Leave request",
          body: `${ctx?.employeeName ?? "An employee"} requested ${computedDays} day(s) of ${ctx?.leaveTypeName ?? "leave"} from ${data.startDate} to ${data.endDate}.`,
          link: "/approvals",
        });
        return Promise.all([email, inApp]);
      }));
    } catch (e) { console.error("[leave.submit] notify failed", e); }

    // T9 · Route onward if the line manager is already unavailable, so the
    // request never lands in a queue nobody is reading. Best-effort: an
    // escalation that fails must not fail the submission — the employee has
    // done their part, and the ageing sweep will catch it.
    try {
      const { resolveEscalation, applyEscalation } = await import("@/lib/approval-escalation");
      const target = await resolveEscalation(admin, emp.tenant_id, emp.id, data.startDate);
      if (target) {
        // Re-read rather than widening getEmployeeForUser's projection, which
        // several other callers depend on being narrow.
        const { data: full } = await admin
          .from("employees")
          .select("manager_id, first_name, last_name")
          .eq("id", emp.id)
          .maybeSingle();
        const { data: mgrRow } = (full as any)?.manager_id
          ? await admin.from("employees").select("user_id").eq("id", (full as any).manager_id).maybeSingle()
          : { data: null };
        await applyEscalation(admin, {
          table: "leave_requests",
          itemType: "leave",
          itemId: req.id,
          tenantId: emp.tenant_id,
          employeeId: emp.id,
          employeeName:
            `${(full as any)?.first_name ?? ""} ${(full as any)?.last_name ?? ""}`.trim() ||
            "An employee",
          target,
          originalApproverUserId: (mgrRow as any)?.user_id ?? null,
          link: "/approvals",
        });
      }
    } catch (e) { console.error("[leave.submit] escalation check failed", e); }

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
      const managers = await getManagerRecipients(admin, req.tenant_id);
      await Promise.all(managers.map((m) => {
        const email = m.email
          ? sendInternalEmail({
              templateName: "leave-cancelled-manager",
              recipientEmail: m.email,
              idempotencyKey: `leave-cancelled-manager-${req.id}-${m.email}`,
              templateData: baseData,
              preferenceKey: "notify_leave_cancelled",
            })
          : Promise.resolve();
        const inApp = notify({
          tenantId: req.tenant_id,
          userId: m.id,
          kind: "leave_cancelled",
          title: "Leave request withdrawn",
          body: `${ctx?.employeeName ?? "An employee"} withdrew their request for ${req.start_date} to ${req.end_date}.`,
          link: "/approvals",
        });
        return Promise.all([email, inApp]);
      }));
    } catch (e) { console.error("[leave.cancel] notify failed", e); }

    return { ok: true };
  });


// ---------- Approve ----------
export const approveLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    // T2 · An approval may carry a comment. Optional, unlike a rejection —
    // "approved" needs no justification, but an approver often wants to note a
    // condition, and the submitter should see it.
    z.object({
      requestId: z.string().uuid(),
      comment: z.string().trim().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const admin = await loadAdmin();
    const { data: req } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Only pending requests can be approved");
    const { isFinalTier, roleUsed } = await assertApproverForRequest(supabase, userId, req);

    if (!isFinalTier) {
      // A configured chain has more tiers to go: advance without finalising —
      // balance stays pending, status stays pending, and the next tier's
      // approver(s) are notified.
      const nextTier = req.current_tier + 1;
      const { error } = await admin.from("leave_requests").update({ current_tier: nextTier }).eq("id", req.id);
      if (error) { console.error("[leave.approve]", error.message, error.code); throw new Error("Failed to advance request."); }

      await admin.from("audit_log").insert({
        actor_id: userId, entity_type: "leave_request", entity_id: req.id,
        action: "approve_tier", metadata: { tier: req.current_tier, next_tier: nextTier },
      });
      await recordApprovalAction(supabase, {
        tenantId: req.tenant_id, itemType: "leave", itemId: req.id,
        employeeId: req.employee_id, approverId: userId, roleUsed,
        action: "approved", reason: data.comment ?? `Advanced to tier ${nextTier}`,
      });

      try {
        const ctx = await loadLeaveContext(admin, req.id);
        const nextRoute = await getTierRoute(admin, req.tenant_id, req.leave_type_id, nextTier);
        const recipientIds = nextRoute?.approver_user_id
          ? [nextRoute.approver_user_id]
          : nextRoute?.approver_role
            ? await getTenantUsersWithRole(admin, req.tenant_id, nextRoute.approver_role)
            : [];
        await Promise.all(recipientIds.map((uid) => notify({
          tenantId: req.tenant_id,
          userId: uid,
          kind: "leave_submitted",
          title: "Leave request awaiting your approval",
          body: `${ctx?.employeeName ?? "An employee"}'s ${ctx?.leaveTypeName ?? "leave"} request needs your sign-off (tier ${nextTier}).`,
          link: "/approvals",
        })));
      } catch (e) { console.error("[leave.approve] tier notify failed", e); }

      return { ok: true, advanced: true, tier: nextTier };
    }

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
    await recordApprovalAction(supabase, {
      tenantId: req.tenant_id, itemType: "leave", itemId: req.id,
      employeeId: req.employee_id, approverId: userId, roleUsed,
      action: "approved", reason: data.comment ?? null,
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
      await notify({
        tenantId: req.tenant_id,
        userId: ctx?.employeeUserId ?? null,
        kind: "leave_approved",
        title: "Leave approved",
        body: `${approverName ?? "Your approver"} approved your ${ctx?.leaveTypeName ?? "leave"} request for ${req.start_date} to ${req.end_date}.`,
        link: "/leave",
      });
    } catch (e) { console.error("[leave.approve] notify failed", e); }

    return { ok: true };
  });


// ---------- Reject ----------
export const rejectLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    // T2 · A rejection reason is required. It is shown to the submitter, who
    // otherwise has to guess what to change before resubmitting, and it is the
    // field an audit is most often read for.
    z.object({
      requestId: z.string().uuid(),
      reason: z.string().trim().min(1, "A reason is required when rejecting").max(2000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sendInternalEmail = await loadEmailSender();
    const admin = await loadAdmin();
    const { data: req } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Only pending requests can be rejected");
    // A reject at any tier ends the chain outright — there is no "advance
    // past a rejection" the way an approval advances past a tier.
    const { roleUsed } = await assertApproverForRequest(supabase, userId, req);

    const { error } = await admin.from("leave_requests").update({
      status: "rejected", approved_by: userId, approved_at: new Date().toISOString(),
      rejection_reason: data.reason,
    }).eq("id", req.id);
    if (error) { console.error("[leave.reject]", error.message, error.code); throw new Error("Failed to reject request."); }

    const year = new Date(req.start_date).getUTCFullYear();
    await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, { pending: -Number(req.days) });

    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "leave_request", entity_id: req.id, action: "reject",
      metadata: { reason: data.reason },
    });
    await recordApprovalAction(supabase, {
      tenantId: req.tenant_id, itemType: "leave", itemId: req.id,
      employeeId: req.employee_id, approverId: userId, roleUsed,
      action: "rejected", reason: data.reason,
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
      await notify({
        tenantId: req.tenant_id,
        userId: ctx?.employeeUserId ?? null,
        kind: "leave_rejected",
        title: "Leave request declined",
        body: `${approverName ?? "Your approver"} declined your ${ctx?.leaveTypeName ?? "leave"} request for ${req.start_date} to ${req.end_date}.${data.reason ? ` Reason: ${data.reason}` : ""}`,
        link: "/leave",
      });
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
