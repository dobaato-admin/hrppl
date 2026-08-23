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
import { getMyEmployeeId, getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
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
    if (!employeeId) return { requests: [], hasEmployee: false as const };

    const { data, error } = await supabase
      .from("wfh_requests")
      .select(
        "id,start_date,end_date,reason,work_address,status,approved_at,decision_note,created_at",
      )
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { requests: data ?? [], hasEmployee: true as const };
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

    const { error } = await supabase
      .from("wfh_requests")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("employee_id", employeeId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
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

    // Assert the tenant rather than trusting the row we just read. Reading it
    // proves RLS let us see it, and for super_admin RLS lets us see everything.
    if (existing.tenant_id !== tenantId) {
      throw new Error("That request belongs to a different organisation.");
    }
    if (myEmployeeId && existing.employee_id === myEmployeeId) {
      throw new Error("You cannot decide your own work-from-home request.");
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
        .select("user_id")
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
