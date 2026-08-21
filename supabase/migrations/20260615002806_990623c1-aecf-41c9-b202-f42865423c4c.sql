
-- Audit log for trial invitations
CREATE TABLE public.org_trial_invitation_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES public.org_trial_invitations(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created','revoked','redeemed','resent','expired')),
  actor_id uuid REFERENCES auth.users(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.org_trial_invitation_audit TO authenticated;
GRANT ALL ON public.org_trial_invitation_audit TO service_role;
ALTER TABLE public.org_trial_invitation_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_admin reads invitation audit"
  ON public.org_trial_invitation_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin writes invitation audit"
  ON public.org_trial_invitation_audit FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX idx_oti_audit_invitation ON public.org_trial_invitation_audit(invitation_id, created_at DESC);

-- AU payroll add-on flag on tenant_subscriptions
ALTER TABLE public.tenant_subscriptions
  ADD COLUMN IF NOT EXISTS au_payroll_addon boolean NOT NULL DEFAULT false;
