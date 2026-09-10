-- T9 — escalation when the approver is unavailable.
--
-- No manual delegation setup: the brief is explicit that an approver going on
-- leave should not require anybody to remember to configure a stand-in. So the
-- routing decides at submission time, and again as items age.
--
-- The ageing threshold is per-tenant because "too long" is a policy, not a
-- constant: a 3-day default is short enough that a forgotten claim surfaces
-- inside a working week, and long enough that a normal weekend does not
-- escalate everything on a Monday morning. Set 0 to switch ageing off and rely
-- only on availability-based escalation.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS approval_escalation_days integer NOT NULL DEFAULT 3;

COMMENT ON COLUMN public.tenants.approval_escalation_days IS
  'Days a pending approval may sit before escalating a tier. 0 disables ageing escalation.';

-- Rows already escalated, so a sweep does not escalate the same item twice and
-- so the queue can show why an item appeared. `approval_actions` carries the
-- history; this is the current state.
ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalated_reason text;
ALTER TABLE public.expense_claims
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalated_reason text;
ALTER TABLE public.timesheets
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalated_reason text;

CREATE INDEX IF NOT EXISTS idx_leave_requests_pending_escalation
  ON public.leave_requests (tenant_id, status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_expense_claims_pending_escalation
  ON public.expense_claims (tenant_id, status, submitted_at) WHERE status IN ('submitted','recommended');
CREATE INDEX IF NOT EXISTS idx_timesheets_pending_escalation
  ON public.timesheets (tenant_id, status, submitted_at) WHERE status = 'submitted';

NOTIFY pgrst, 'reload schema';
