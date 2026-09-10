/**
 * T9 — route onward when the approver is not there.
 *
 * ---------------------------------------------------------------------------
 * No delegation setup
 * ---------------------------------------------------------------------------
 *
 * The brief is explicit: an approver going on leave must not require anybody to
 * remember to nominate a stand-in. Delegation that has to be configured is
 * delegation that is configured after the first time it was needed.
 *
 * So availability is *derived*: a line manager is unavailable if they hold an
 * approved leave request covering the date, or their account is deactivated.
 * When they are, the item routes to the next tier that can actually act.
 *
 *     line manager → branch admin (same branch) → org admin / HR
 *
 * Two triggers, because one is not enough:
 *
 *   **At submission** — the manager is already away, so the request never sits
 *   in a queue nobody is reading.
 *
 *   **As it ages** — the manager went away *after* it was submitted, or simply
 *   has not looked. `escalateStaleApprovals` sweeps for both. Without it a
 *   request submitted the day before a fortnight's leave sits for a fortnight,
 *   which is the failure this whole feature exists to prevent.
 *
 * Both parties are told: the new approver gets the reason it reached them, and
 * the original gets told it moved while they were away — otherwise they return
 * to an empty queue and assume nothing happened.
 */

import { notifyInApp } from "@/lib/notify.server";

export type EscalationTarget = {
  userIds: string[];
  tier: "manager" | "branch_admin" | "org_admin";
  reason: string;
};

/**
 * Is this user able to act on `onDate`?
 *
 * Deliberately generous: only an *approved* leave request counts, not a pending
 * one. Escalating because somebody might be away would route around approvers
 * who are present, and the cost of a wrong escalation is a decision made by
 * someone with less context.
 */
export async function isApproverAvailable(
  admin: any,
  userId: string,
  onDate: string,
): Promise<{ available: boolean; reason: string | null }> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id,status")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return { available: false, reason: "the approver's account no longer exists" };
  if (profile.status && profile.status !== "active") {
    return { available: false, reason: "the approver's account is not active" };
  }

  const { data: emp } = await admin
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!emp) return { available: true, reason: null };

  const { data: leave } = await admin
    .from("leave_requests")
    .select("id,start_date,end_date")
    .eq("employee_id", emp.id)
    .eq("status", "approved")
    .lte("start_date", onDate)
    .gte("end_date", onDate)
    .limit(1);
  if ((leave ?? []).length > 0) {
    return { available: false, reason: "the approver is on approved leave" };
  }
  return { available: true, reason: null };
}

/** Everyone in the tenant holding a role, as user ids. */
async function usersWithRole(admin: any, tenantId: string, role: string): Promise<string[]> {
  const { data: profiles } = await admin.from("profiles").select("id").eq("tenant_id", tenantId);
  const ids = ((profiles ?? []) as any[]).map((p) => p.id);
  if (!ids.length) return [];
  const { data: roles } = await admin
    .from("user_roles")
    .select("user_id")
    .in("user_id", ids)
    .eq("role", role);
  return [...new Set(((roles ?? []) as any[]).map((r) => r.user_id as string))];
}

/**
 * Who should hold this item now.
 *
 * Returns null when the line manager is available and should keep it — the
 * common case, and the one where doing nothing is correct.
 */
export async function resolveEscalation(
  admin: any,
  tenantId: string,
  employeeId: string,
  onDate: string,
): Promise<EscalationTarget | null> {
  const { data: emp } = await admin
    .from("employees")
    .select("id,manager_id,branch_id")
    .eq("id", employeeId)
    .maybeSingle();
  if (!emp) return null;

  let reason: string | null = null;

  if (emp.manager_id) {
    const { data: mgr } = await admin
      .from("employees")
      .select("id,user_id")
      .eq("id", emp.manager_id)
      .maybeSingle();
    if (mgr?.user_id) {
      const { available, reason: why } = await isApproverAvailable(admin, mgr.user_id, onDate);
      if (available) return null; // The manager has it. Nothing to do.
      reason = why;
    } else {
      reason = "the line manager has no account to act with";
    }
  } else {
    reason = "this employee has no line manager";
  }

  // Next tier: a branch admin for their branch.
  if (emp.branch_id) {
    const branchAdmins = await usersWithRole(admin, tenantId, "branch_admin");
    const available: string[] = [];
    for (const uid of branchAdmins) {
      const { data: scopes } = await admin
        .from("role_scope")
        .select("branch_id")
        .eq("user_id", uid)
        .eq("role", "branch_admin");
      const covers =
        (scopes ?? []).length === 0 ||
        ((scopes ?? []) as any[]).some((s) => s.branch_id === emp.branch_id || s.branch_id === null);
      if (!covers) continue;
      if ((await isApproverAvailable(admin, uid, onDate)).available) available.push(uid);
    }
    if (available.length) {
      return { userIds: available, tier: "branch_admin", reason: reason ?? "no line manager available" };
    }
  }

  // Final tier: org admins and HR, who hold organisation-wide scope.
  const [orgAdmins, hr] = await Promise.all([
    usersWithRole(admin, tenantId, "org_admin"),
    usersWithRole(admin, tenantId, "hr"),
  ]);
  const candidates: string[] = [];
  for (const uid of [...new Set([...orgAdmins, ...hr])]) {
    if ((await isApproverAvailable(admin, uid, onDate)).available) candidates.push(uid);
  }
  if (!candidates.length) return null; // Nobody left to escalate to; leave it be.
  return { userIds: candidates, tier: "org_admin", reason: reason ?? "no line manager available" };
}

/**
 * Mark an item escalated and tell both sides.
 *
 * `escalated_at` on the row is the current state — what the queue badges. The
 * history lives in `approval_actions`, so an item escalated twice keeps both.
 */
export async function applyEscalation(
  admin: any,
  opts: {
    table: "leave_requests" | "expense_claims" | "timesheets";
    itemType: string;
    itemId: string;
    tenantId: string;
    employeeId: string;
    employeeName: string;
    target: EscalationTarget;
    originalApproverUserId: string | null;
    link: string;
  },
): Promise<void> {
  const now = new Date().toISOString();
  await admin
    .from(opts.table)
    .update({ escalated_at: now, escalated_reason: opts.target.reason })
    .eq("id", opts.itemId);

  await admin.from("approval_actions").insert({
    tenant_id: opts.tenantId,
    item_type: opts.itemType,
    item_id: opts.itemId,
    employee_id: opts.employeeId,
    // The escalation is the system's act, recorded against the first recipient
    // so the row has an approver_id; the reason says it was not their decision.
    approver_id: opts.target.userIds[0],
    approver_role: opts.target.tier,
    action: "escalated",
    reason: opts.target.reason,
    escalated_from: opts.originalApproverUserId,
    escalation_reason: opts.target.reason,
  });

  await Promise.all(
    opts.target.userIds.map((uid) =>
      notifyInApp({
        tenantId: opts.tenantId,
        userId: uid,
        kind: "approval_escalated",
        title: "Escalated to you for approval",
        body: `${opts.employeeName}'s request needs a decision because ${opts.target.reason}.`,
        link: opts.link,
      }),
    ),
  );

  if (opts.originalApproverUserId) {
    await notifyInApp({
      tenantId: opts.tenantId,
      userId: opts.originalApproverUserId,
      kind: "approval_escalated_away",
      title: "A request was escalated while you were away",
      body: `${opts.employeeName}'s request moved to another approver because ${opts.target.reason}.`,
      link: opts.link,
    });
  }
}
