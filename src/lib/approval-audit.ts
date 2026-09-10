/**
 * T7 — record every approval decision, and the role it was made under.
 *
 * `approved_by` on the request row says *who*. With four roles able to approve
 * and one person routinely holding several, an audit needs *in what capacity* —
 * and it needs the rejections and escalations too, which the request row
 * overwrites or never carries.
 *
 * Written through the **caller's own client** on purpose. The RLS policy on
 * `approval_actions` checks `approver_id = auth.uid()`, so the database
 * verifies the claim rather than trusting it; an audit trail written with the
 * service role records whatever the code said, which is worth less than no
 * audit trail because it looks authoritative.
 *
 * Failure to record is logged but never blocks the decision: refusing to
 * approve somebody's leave because an audit insert failed would be the wrong
 * trade, and the decision itself still lands on the request row.
 */

export type ApprovalActionKind = "approved" | "rejected" | "escalated" | "reversed";

export async function recordApprovalAction(
  supabase: any,
  input: {
    tenantId: string;
    itemType: string;
    itemId: string;
    employeeId: string | null;
    approverId: string;
    roleUsed: string;
    action: ApprovalActionKind;
    reason?: string | null;
    escalatedFrom?: string | null;
    escalationReason?: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("approval_actions").insert({
    tenant_id: input.tenantId,
    item_type: input.itemType,
    item_id: input.itemId,
    employee_id: input.employeeId,
    approver_id: input.approverId,
    approver_role: input.roleUsed,
    action: input.action,
    reason: input.reason ?? null,
    escalated_from: input.escalatedFrom ?? null,
    escalation_reason: input.escalationReason ?? null,
  });
  if (error) {
    console.error("[approval-audit] failed to record", input.itemType, input.itemId, error);
  }
}
