/**
 * Work-from-home requests.
 *
 * This is the module that makes geofenced attendance workable. Before it, a
 * tenant with any active `sign_geofences` row simply could not employ anyone
 * remotely: `clockIn` went straight from "tenant has fences" to a hard throw,
 * with no exception, no appeal, and no record of the attempt.
 *
 * The shape deliberately mirrors `leave.functions.ts` — request, approve,
 * notify — so approvers learn one workflow rather than two. What differs is the
 * effect of an approval: an approved WFH day is what `clockIn` consults before
 * it enforces a perimeter, and a punch taken under that exception is queued for
 * priority review rather than waved through. The review is the thing that makes
 * granting the exception safe, so it is not optional.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import {
  getMyEmployeeId,
  getTenantId,
  requireTenantId,
  type AnySupabase,
} from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadEmailSender() {
  const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
  return sendInternalEmail;
}

async function getApproverName(admin: AnySupabase, userId: string): Promise<string | undefined> {
  const { data } = await admin
    .from("profiles")
    .select("full_name,email")
    .eq("id", userId)
    .maybeSingle();
  return data?.full_name || data?.email;
}

const APPROVER_ROLES = ["manager", "hr", "org_admin", "super_admin"];

async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return ((data ?? []) as { role: string }[]).map((r) => r.role);
}

/**
 * Approver check, kept identical to the RLS policy on `wfh_requests`.
 *
 * These two must not drift: a route gate wider than the policy sends people to
 * a page where every action fails with a raw Postgres error, which is exactly
 * how the offboarding module broke.
 */
async function assertApprover(supabase: any, userId: string) {
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => APPROVER_ROLES.includes(r))) {
    throw new Error("You do not have permission to review work-from-home requests.");
  }
  return roles;
}

/** org_admin or super_admin, in the caller's own tenant. Same shape as org-signup.functions.ts's assertOrgAdmin. */
async function assertOrgAdmin(supabase: AnySupabase, userId: string): Promise<string> {
  const tenantId = await requireTenantId(supabase, userId);
  const roles = await getRoles(supabase, userId);
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: organization admin required");
  }
  return tenantId;
}

export async function isWfhEnabled(supabase: AnySupabase, tenantId: string): Promise<boolean> {
  const { data } = await supabase
    .from("tenants")
    .select("wfh_enabled")
    .eq("id", tenantId)
    .maybeSingle();
  // Absent (pre-migration) reads as enabled — the column defaults to true and
  // this must never be the reason nobody can request a WFH day.
  return data?.wfh_enabled !== false;
}

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
    // A notification that fails must not roll back the decision it describes.
    console.error("[wfh] notification failed", e);
  }
}

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

// ---------- Employee: my requests ----------
export const listMyWfhRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) return { requests: [], hasEmployee: false as const, wfhEnabled: true };

    const { data, error } = await supabase
      .from("wfh_requests")
      .select(
        "id,start_date,end_date,reason,work_address,status,approved_at,decision_note,created_at",
      )
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    // Who will decide this, so the requester is not left staring at a row that
    // appears to belong to nobody. Their own manager cannot be the answer when
    // the requester *is* a manager — the rule is simply "not you".
    const { data: approvers } = await supabase
      .from("user_roles")
      .select("role")
      .in("role", ["manager", "hr", "org_admin"]);

    const tenantId = await getTenantId(supabase, userId);
    const wfhEnabled = tenantId ? await isWfhEnabled(supabase, tenantId) : true;

    return {
      requests: data ?? [],
      hasEmployee: true as const,
      approverRoles: [...new Set(((approvers ?? []) as { role: string }[]).map((r) => r.role))],
      wfhEnabled,
    };
  });

// ---------- Employee: request a WFH window ----------
export const requestWfh = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        startDate: DateStr,
        endDate: DateStr,
        reason: z.string().max(1000).optional(),
        workAddress: z.string().max(300).optional(),
      })
      .refine((v) => v.endDate >= v.startDate, {
        message: "End date cannot be before the start date",
        path: ["endDate"],
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Employee first: a platform account fails both checks, and "no employee
    // record" is the accurate and more useful of the two messages for it.
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) throw new Error("No employee record is linked to your account.");
    const tenantId = await requireTenantId(supabase, userId);

    if (!(await isWfhEnabled(supabase, tenantId))) {
      throw new Error("Your organization does not currently permit work-from-home requests.");
    }

    // Overlap, not just duplication. A range unique index cannot express this,
    // so it is enforced here — two overlapping approvals would make it
    // ambiguous which one a punch was taken under, and reviewers would be
    // resolving the same day twice.
    const { data: clashes } = await supabase
      .from("wfh_requests")
      .select("id,start_date,end_date,status")
      .eq("employee_id", employeeId)
      .in("status", ["pending", "approved"])
      .lte("start_date", data.endDate)
      .gte("end_date", data.startDate);
    const clash = (clashes ?? [])[0];
    if (clash) {
      throw new Error(
        `You already have a ${clash.status} work-from-home request covering ${clash.start_date} to ${clash.end_date}.`,
      );
    }

    const { data: inserted, error } = await supabase
      .from("wfh_requests")
      .insert({
        tenant_id: tenantId,
        employee_id: employeeId,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason ?? null,
        work_address: data.workAddress ?? null,
        status: "pending",
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Tell the approvers now. Leave and reviews both learned this the hard way:
    // a cron-only notification means a same-day request is invisible until
    // tomorrow, by which point the day it was for has already happened.
    try {
      const admin = await loadAdmin();
      const { data: emp } = await admin
        .from("employees")
        .select("first_name,last_name,manager_id")
        .eq("id", employeeId)
        .maybeSingle();
      const name = `${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim() || "An employee";

      const { data: approvers } = await admin
        .from("user_roles")
        .select("user_id,role,profiles!inner(tenant_id)")
        .in("role", ["manager", "hr", "org_admin"])
        .eq("profiles.tenant_id", tenantId);

      const targets = new Set<string>((approvers ?? []).map((r) => r.user_id as string));
      targets.delete(userId); // never ask someone to approve their own request
      for (const target of targets) {
        await notify({
          tenantId,
          userId: target,
          kind: "wfh_request_pending",
          title: "Work-from-home request",
          body: `${name} requested to work remotely from ${data.startDate} to ${data.endDate}.`,
          link: "/admin/wfh",
        });
      }
    } catch (e) {
      console.error("[wfh] approver notification failed", e);
    }

    return { ok: true, id: inserted.id };
  });

// ---------- Employee: withdraw a pending request ----------
export const cancelMyWfhRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) throw new Error("No employee record is linked to your account.");

    // Pending *or* approved. The lifecycle trigger decides whether an
    // approved window may still be withdrawn — a requester may back out before
    // it opens, but not once it has started, and never once a remote punch has
    // been taken under it. Filtering to "pending" here would have made the
    // approved case fail as "0 rows updated", which tells the user nothing.
    const { data: updated, error } = await supabase
      .from("wfh_requests")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("employee_id", employeeId)
      .in("status", ["pending", "approved"])
      .select("id");
    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("That request can no longer be withdrawn.");
    }
    return { ok: true };
  });

// ---------- Approver: the queue ----------
export const listWfhForApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.enum(["pending", "approved", "rejected", "cancelled", "all"]).default("pending"),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertApprover(supabase, userId);

    // Tenant-scoped explicitly. RLS is the boundary but does not narrow for
    // super_admin, whose policy carries no tenant predicate — trusting it here
    // would list every tenant's requests. See the tenant-scoping section of
    // CLAUDE.md.
    //
    // A platform account genuinely has no tenant, so report that rather than
    // throwing: "not attached to an organization" is a correct description of
    // super_admin, not a failure, and the page should say so instead of
    // showing an error toast.
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { requests: [], noTenantScope: true as const };
    const myEmployeeId = await getMyEmployeeId(supabase, userId);

    let q = supabase
      .from("wfh_requests")
      // One string literal, deliberately. TypeScript types `"a" + "b"` as plain
      // `string`, not `"ab"`, and supabase-js parses this argument at the type
      // level — split across a concatenation it degrades to GenericStringError
      // and every field of the result silently becomes untyped.
      .select(
        "id,employee_id,start_date,end_date,reason,work_address,status,approved_at,decision_note,created_at,employees!inner(first_name,last_name,job_title)",
      )
      .eq("tenant_id", tenantId)
      .order("start_date", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    // You should not be able to approve your own request from the queue.
    if (myEmployeeId) q = q.neq("employee_id", myEmployeeId);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    return {
      noTenantScope: false as const,
      requests: (rows ?? []).map((r) => ({
        id: r.id as string,
        employeeId: r.employee_id as string,
        employeeName: `${r.employees?.first_name ?? ""} ${r.employees?.last_name ?? ""}`.trim(),
        jobTitle: (r.employees?.job_title ?? null) as string | null,
        startDate: r.start_date as string,
        endDate: r.end_date as string,
        reason: (r.reason ?? null) as string | null,
        workAddress: (r.work_address ?? null) as string | null,
        status: r.status as string,
        decisionNote: (r.decision_note ?? null) as string | null,
        createdAt: r.created_at as string,
      })),
    };
  });

// ---------- Approver: decide ----------
export const decideWfhRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertApprover(supabase, userId);
    const tenantId = await requireTenantId(supabase, userId);
    const myEmployeeId = await getMyEmployeeId(supabase, userId);

    const { data: existing, error: readErr } = await supabase
      .from("wfh_requests")
      .select("id,employee_id,tenant_id,status,start_date,end_date")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!existing) throw new Error("That request no longer exists.");

    // These checks exist for the error messages, not for enforcement: since
    // 20260823160000 the wfh_requests lifecycle trigger and the RLS policies
    // both refuse self-decision and illegal transitions, so a caller who skips
    // this function entirely still cannot get past them. Duplicating them here
    // just means the UI can explain the refusal in a sentence instead of
    // surfacing a Postgres error.
    //
    // Assert the tenant rather than trusting the row we just read. Reading it
    // proves RLS let us see it, and for super_admin RLS lets us see everything.
    // The switch has to close the side door as well as the front one.
    // `createWfhRequest` already refuses when WFH is off, but requests filed
    // BEFORE it was turned off sat in the queue and could still be approved —
    // and an approved window authorises remote punches, so the organisation
    // ended up permitting exactly what it had just said it did not.
    //
    // Rejecting stays allowed at all times: an approver must be able to clear a
    // queue they can no longer say yes to, and refusing both decisions would
    // strand every pending request forever.
    if (data.decision === "approved" && !(await isWfhEnabled(supabase, tenantId))) {
      throw new Error(
        "Work-from-home is switched off for your organisation, so this request cannot be approved. " +
          "Turn it back on in Settings, or decline the request.",
      );
    }

    if (existing.tenant_id !== tenantId) {
      throw new Error("That request belongs to a different organisation.");
    }
    if (myEmployeeId && existing.employee_id === myEmployeeId) {
      throw new Error(
        "You cannot decide your own work-from-home request. It has to be approved by your manager, HR, or an organisation administrator.",
      );
    }
    if (existing.status !== "pending") {
      throw new Error(`That request has already been ${existing.status}.`);
    }

    const { error } = await supabase
      .from("wfh_requests")
      .update({
        status: data.decision,
        approved_by: userId,
        approved_at: new Date().toISOString(),
        decision_note: data.note ?? null,
      })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);

    try {
      const admin = await loadAdmin();
      const { data: emp } = await admin
        .from("employees")
        .select("user_id,email")
        .eq("id", existing.employee_id)
        .maybeSingle();
      await notify({
        tenantId,
        userId: (emp?.user_id ?? null) as string | null,
        kind: `wfh_${data.decision}`,
        title: data.decision === "approved" ? "Work-from-home approved" : "Work-from-home declined",
        body:
          data.decision === "approved"
            ? `You can clock in remotely from ${existing.start_date} to ${existing.end_date}.`
            : `Your request for ${existing.start_date} to ${existing.end_date} was declined.` +
              (data.note ? ` Reason: ${data.note}` : ""),
        link: "/me/wfh",
      });

      // In-app only until now — the same gap leave had before
      // leave-approved/leave-rejected existed. Reuses notify_leave_decision:
      // both are "a decision was made on your time-off-adjacent request",
      // and a dedicated preference column felt like more schema than a
      // second toggle nobody has asked for yet.
      if (emp?.email) {
        const sendInternalEmail = await loadEmailSender();
        const approverName = await getApproverName(admin, userId);
        await sendInternalEmail({
          templateName: data.decision === "approved" ? "wfh-approved" : "wfh-rejected",
          recipientEmail: emp.email,
          idempotencyKey: `wfh-${data.decision}-${data.id}`,
          templateData: {
            approverName,
            startDate: existing.start_date,
            endDate: existing.end_date,
            rejectionReason: data.decision === "rejected" ? data.note : undefined,
          },
          preferenceKey: "notify_leave_decision",
        });
      }

      await admin.from("audit_log").insert({
        actor_id: userId,
        entity_type: "wfh_request",
        entity_id: data.id,
        action: data.decision,
        metadata: { note: data.note ?? null },
      });
    } catch (e) {
      console.error("[wfh] post-decision side effects failed", e);
    }

    return { ok: true };
  });

// ---------- Tenant setting: is remote work permitted at all ----------
//
// Before this, every tenant with an employee record showed the WFH request
// route, whether or not the organisation actually intends to allow remote
// work. Defaults to true (20260824130000) — this is an opt-out switch, not
// an opt-in one, so no existing tenant's behaviour changes until an
// org_admin turns it off.

export const getWfhSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const tenantId = await requireTenantId(context.supabase, context.userId);
    return { enabled: await isWfhEnabled(context.supabase, tenantId) };
  });

export const setWfhEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const tenantId = await assertOrgAdmin(context.supabase, context.userId);
    const admin = await loadAdmin();
    const { error } = await admin
      .from("tenants")
      .update({ wfh_enabled: data.enabled })
      .eq("id", tenantId);
    if (error) throw new Error(error.message);

    // Switching WFH off stops new requests and blocks new approvals. It does
    // NOT revoke windows already approved: somebody was told they may work from
    // home on a given day, may have arranged their life around it, and
    // attendance is the input to pay. That is the same good-faith rule the
    // lifecycle trigger applies to a request with a punch already taken under
    // it (20260823060000).
    //
    // But a consequence nobody is told about is a consequence nobody accounts
    // for, so the count comes back and the page says it. An admin who expected
    // the switch to take effect today can then decline the remaining windows
    // deliberately, rather than discovering them in next month's attendance.
    let remainingApprovedWindows = 0;
    if (!data.enabled) {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await admin
        .from("wfh_requests")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("status", "approved")
        .gte("end_date", today);
      remainingApprovedWindows = count ?? 0;
    }

    try {
      await admin.from("audit_log").insert({
        actor_id: context.userId,
        entity_type: "tenant",
        entity_id: tenantId,
        action: data.enabled ? "wfh_enabled" : "wfh_disabled",
        metadata: {},
      });
    } catch (e) {
      console.error("[wfh] settings audit log write failed", e);
    }

    return { ok: true, enabled: data.enabled, remainingApprovedWindows };
  });
