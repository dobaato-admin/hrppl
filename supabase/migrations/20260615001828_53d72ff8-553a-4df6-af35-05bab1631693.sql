
CREATE OR REPLACE FUNCTION public.set_updated_at_oti()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.org_trial_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  org_name text NOT NULL,
  contact_name text,
  country_code text,
  trial_days int NOT NULL DEFAULT 30,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','redeemed','revoked','expired')),
  notes text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_by uuid REFERENCES auth.users(id),
  redeemed_by uuid REFERENCES auth.users(id),
  redeemed_tenant_id uuid REFERENCES public.tenants(id),
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_trial_invitations TO authenticated;
GRANT ALL ON public.org_trial_invitations TO service_role;

ALTER TABLE public.org_trial_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin manage org trial invitations"
  ON public.org_trial_invitations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_org_trial_invitations_status ON public.org_trial_invitations(status);
CREATE INDEX IF NOT EXISTS idx_org_trial_invitations_email ON public.org_trial_invitations(lower(email));

CREATE TRIGGER set_org_trial_invitations_updated_at
  BEFORE UPDATE ON public.org_trial_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_oti();

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = 'mannie@ebta.com.au'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = u.id AND ur.role = 'super_admin'::public.app_role
  );
