-- Two-step expense workflow: add 'recommended' status + manager recommendation action
ALTER TYPE public.expense_claim_status ADD VALUE IF NOT EXISTS 'recommended' BEFORE 'approved';

ALTER TABLE public.expense_approvals
  DROP CONSTRAINT IF EXISTS expense_approvals_action_check;
ALTER TABLE public.expense_approvals
  ADD CONSTRAINT expense_approvals_action_check
  CHECK (action = ANY (ARRAY['recommended'::text,'recommendation_withdrawn'::text,'approved'::text,'rejected'::text,'requested_changes'::text,'commented'::text,'paid'::text]));

-- Track who recommended a claim (manager) — kept separate from approved_by so audit history remains intact
ALTER TABLE public.expense_claims
  ADD COLUMN IF NOT EXISTS recommended_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS recommended_at timestamptz,
  ADD COLUMN IF NOT EXISTS recommendation_note text;