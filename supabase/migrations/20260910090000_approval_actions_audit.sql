-- T7 — who approved what, and under which role.
--
-- Approval rights are held by four roles (line manager, branch admin, org admin,
-- HR) with overlapping scopes, and one person routinely holds several. So
-- "approved_by: <uuid>" on the request row does not answer the question an audit
-- actually asks: *in what capacity* did they act, and could they have?
--
-- This records the decision itself as a row — approver, the role that granted
-- the right, the action, the reason, and when. It is append-only: a decision is
-- a historical fact, and a reversal is a new row rather than an edit to the old
-- one.

CREATE TABLE IF NOT EXISTS public.approval_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- What was decided. Kept as text rather than an enum: the set of approvable
  -- things grows (leave, expense, timesheet, overtime, WFH, TOIL…) and a
  -- migration per addition buys nothing here.
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  -- Whose request it was, so the org-wide log (T11) can filter by submitter
  -- without joining through five different request tables.
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,

  approver_id uuid NOT NULL,
  -- The role the approver was acting under. Where several of their roles would
  -- have granted the right, this is the one actually used to authorise it —
  -- see resolveApprovalScope in src/lib/approval-scope.ts.
  approver_role text NOT NULL,
  -- 'approved' | 'rejected' | 'escalated' | 'reversed'
  action text NOT NULL,
  -- Required for a rejection, optional for an approval. Shown to the submitter,
  -- so it is written for them rather than for the log.
  reason text,
  -- Set when this action happened because the item was escalated to them, with
  -- the reason it was (T9).
  escalated_from uuid,
  escalation_reason text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_item
  ON public.approval_actions(item_type, item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_actions_tenant
  ON public.approval_actions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_actions_approver
  ON public.approval_actions(approver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_actions_employee
  ON public.approval_actions(employee_id, created_at DESC);

GRANT SELECT, INSERT ON public.approval_actions TO authenticated;
GRANT ALL ON public.approval_actions TO service_role;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- Read: the submitter sees decisions about their own requests; the four
-- approving roles see them within their scope. Deliberately no UPDATE or DELETE
-- policy for anyone — an audit row that its subject can edit is not an audit
-- row, and a reversal is a new row.
DROP POLICY IF EXISTS "read approval actions in scope" ON public.approval_actions;
CREATE POLICY "read approval actions in scope" ON public.approval_actions
  FOR SELECT TO authenticated
  USING (
    tenant_id = ( SELECT public.user_tenant_id(( SELECT auth.uid() )) )
    AND (
      approver_id = ( SELECT auth.uid() )
      OR EXISTS (SELECT 1 FROM public.employees e
                 WHERE e.id = approval_actions.employee_id AND e.user_id = ( SELECT auth.uid() ))
      OR public.is_org_admin(( SELECT auth.uid() ), tenant_id)
      OR public.is_hr(( SELECT auth.uid() ), tenant_id)
      OR ( SELECT public.has_role(( SELECT auth.uid() ), 'manager'::app_role) )
      OR public.is_branch_admin(( SELECT auth.uid() ), tenant_id)
    )
  );

-- Write: only for yourself, and only inside your tenant. The server functions
-- write these through the caller's client precisely so this policy applies —
-- an audit trail written with the service role would record whatever the code
-- claimed rather than what the database could verify.
DROP POLICY IF EXISTS "record own approval action" ON public.approval_actions;
CREATE POLICY "record own approval action" ON public.approval_actions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = ( SELECT public.user_tenant_id(( SELECT auth.uid() )) )
    AND approver_id = ( SELECT auth.uid() )
  );

NOTIFY pgrst, 'reload schema';
