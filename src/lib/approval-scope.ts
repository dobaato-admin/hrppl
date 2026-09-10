/**
 * T6 — who may approve what, and for whom.
 *
 * ---------------------------------------------------------------------------
 * The problem this replaces
 * ---------------------------------------------------------------------------
 *
 * Approval rights were a hardcoded role check inside each domain — leave's
 * fallback was `manager || org_admin`, which left **HR and branch admins unable
 * to approve anything** even though both are expected to. In practice one
 * person holds several of these roles, so tying the right to a single assigned
 * approver on the employee record strands requests whenever that person is not
 * the one looking at them.
 *
 * So the right is a property of the **role**, and each role carries a **scope**:
 *
 * | Role         | May approve | Scope                        |
 * | ------------ | ----------- | ---------------------------- |
 * | org_admin    | all three   | the whole organisation       |
 * | hr           | all three   | the whole organisation       |
 * | branch_admin | all three   | employees in their branches  |
 * | manager      | all three   | their direct reports         |
 * | super_admin  | all three   | the acting tenant            |
 *
 * **Scopes union.** Someone holding `hr` and `manager` gets the wider of the
 * two, not a role switcher — one queue, as the brief asks.
 *
 * **First to action settles it.** Where several people could approve the same
 * item, whoever acts first decides it; the others see it leave their queue.
 * That matches the intent of consolidating the rights in the first place, and
 * the alternative — a designated approver per item — is the thing being fixed.
 * Multi-tier chains (`leave_approval_routes`) still take precedence where a
 * tenant has configured one: that is a deliberate policy, not an accident.
 *
 * **Nobody approves their own request**, including an org admin or HR user who
 * submitted it. Enforced here and again in each domain's guard.
 */

import type { AppRole } from "@/lib/rbac";

export type ApprovalKind = "leave" | "expense" | "timesheet";

/**
 * Roles that may action each kind, in descending order of scope. The order is
 * load-bearing: {@link resolveApprovalScope} reports the first match as the
 * role the decision was made under, which is what the audit trail records.
 */
export const APPROVER_ROLES: Record<ApprovalKind, readonly AppRole[]> = {
  leave: ["super_admin", "org_admin", "hr", "branch_admin", "manager"],
  expense: ["super_admin", "org_admin", "hr", "finance", "branch_admin", "manager"],
  timesheet: ["super_admin", "org_admin", "hr", "branch_admin", "manager"],
};

export type ApprovalScope = {
  /** Whether this caller may action this kind at all. */
  canApprove: boolean;
  /**
   * `"tenant"` — every employee in the organisation.
   * `"branch"` / `"reports"` — only `employeeIds`.
   * `"none"` — nothing.
   */
  scope: "tenant" | "branch" | "reports" | "none";
  /** Null means "the whole tenant"; an array is an explicit allow-list. */
  employeeIds: string[] | null;
  /** The role that granted the right — recorded against every decision. */
  roleUsed: AppRole | null;
  /** The caller's own employee id, excluded from every queue. */
  selfEmployeeId: string | null;
};

const NONE: ApprovalScope = {
  canApprove: false,
  scope: "none",
  employeeIds: [],
  roleUsed: null,
  selfEmployeeId: null,
};

/**
 * Resolve the union of employees this caller may action, for one kind.
 *
 * Reads through the caller's own client so RLS applies — this decides what a
 * queue shows, and a scope computed with the service role would be a scope
 * nobody checked.
 */
export async function resolveApprovalScope(
  supabase: any,
  userId: string,
  tenantId: string,
  kind: ApprovalKind,
): Promise<ApprovalScope> {
  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = ((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role);

  const allowed = APPROVER_ROLES[kind].filter((r) => roles.includes(r));
  const { data: me } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const selfEmployeeId = (me?.id as string | undefined) ?? null;

  if (allowed.length === 0) return { ...NONE, selfEmployeeId };

  // First match wins: APPROVER_ROLES is ordered widest-scope-first, so a user
  // holding both `hr` and `manager` is recorded as having acted as HR, which is
  // the capacity that actually granted them the reach.
  const roleUsed = allowed[0];

  if (roleUsed === "super_admin" || roleUsed === "org_admin" || roleUsed === "hr" || roleUsed === "finance") {
    return { canApprove: true, scope: "tenant", employeeIds: null, roleUsed, selfEmployeeId };
  }

  if (roleUsed === "branch_admin") {
    const { data: scopes } = await supabase
      .from("role_scope")
      .select("branch_id")
      .eq("user_id", userId)
      .eq("role", "branch_admin");
    const branchIds = [
      ...new Set(((scopes ?? []) as { branch_id: string | null }[]).map((s) => s.branch_id).filter(Boolean)),
    ] as string[];
    // A branch_admin with no branch rows is scoped to the tenant by
    // `has_branch_access`, which treats a null branch as "defer to the tenant
    // check". Mirroring that here keeps the queue and the RLS agreeing.
    if (branchIds.length === 0) {
      return { canApprove: true, scope: "tenant", employeeIds: null, roleUsed, selfEmployeeId };
    }
    const { data: emps } = await supabase
      .from("employees")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("branch_id", branchIds);
    return {
      canApprove: true,
      scope: "branch",
      employeeIds: ((emps ?? []) as { id: string }[]).map((e) => e.id),
      roleUsed,
      selfEmployeeId,
    };
  }

  // manager — direct reports only.
  if (!selfEmployeeId) return { ...NONE, selfEmployeeId };
  const { data: reports } = await supabase
    .from("employees")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("manager_id", selfEmployeeId);
  return {
    canApprove: true,
    scope: "reports",
    employeeIds: ((reports ?? []) as { id: string }[]).map((e) => e.id),
    roleUsed,
    selfEmployeeId,
  };
}

/** Does this scope cover one particular employee? Self is always excluded. */
export function scopeCovers(scope: ApprovalScope, employeeId: string): boolean {
  if (!scope.canApprove) return false;
  // Blocked for everyone, including org admins and HR. Someone senior enough to
  // approve their own leave is exactly who should not.
  if (scope.selfEmployeeId && scope.selfEmployeeId === employeeId) return false;
  if (scope.employeeIds === null) return true;
  return scope.employeeIds.includes(employeeId);
}

/**
 * Why a caller cannot action this item — phrased for the person reading it, not
 * for the log.
 */
export function refusalReason(scope: ApprovalScope, employeeId: string): string {
  if (scope.selfEmployeeId && scope.selfEmployeeId === employeeId) {
    return "You cannot approve your own request — it needs another approver.";
  }
  if (!scope.canApprove) return "Your role does not include approving these requests.";
  if (scope.scope === "reports") return "This employee is not one of your direct reports.";
  if (scope.scope === "branch") return "This employee is not in a branch you administer.";
  return "This request is outside the employees you can action.";
}
