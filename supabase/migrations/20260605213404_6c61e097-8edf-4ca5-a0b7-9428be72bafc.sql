
-- ============== organization_setup_progress ==============
CREATE TABLE public.organization_setup_progress (
  tenant_id uuid PRIMARY KEY,
  details_done boolean NOT NULL DEFAULT false,
  branding_done boolean NOT NULL DEFAULT false,
  departments_done boolean NOT NULL DEFAULT false,
  defaults_done boolean NOT NULL DEFAULT false,
  invites_done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_reminder_at timestamptz,
  reminder_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_setup_progress TO authenticated;
GRANT ALL ON public.organization_setup_progress TO service_role;

ALTER TABLE public.organization_setup_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant setup progress"
  ON public.organization_setup_progress FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant setup progress"
  ON public.organization_setup_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all setup progress"
  ON public.organization_setup_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_setup_progress_updated_at
  BEFORE UPDATE ON public.organization_setup_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create progress row when a tenant is inserted
CREATE OR REPLACE FUNCTION public.ensure_setup_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.organization_setup_progress (tenant_id)
  VALUES (NEW.id)
  ON CONFLICT (tenant_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_ensure_setup_progress
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.ensure_setup_progress();

-- Backfill for any existing tenants
INSERT INTO public.organization_setup_progress (tenant_id, completed_at)
SELECT id, now() FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- ============== staff_invitations ==============
CREATE TABLE public.staff_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  job_title text,
  department_id uuid,
  country_code text,
  role public.app_role NOT NULL DEFAULT 'employee',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','expired','revoked')),
  invited_by uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_user_id uuid,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  send_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_invitations_tenant ON public.staff_invitations(tenant_id);
CREATE INDEX idx_staff_invitations_email ON public.staff_invitations(lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_invitations TO authenticated;
GRANT ALL ON public.staff_invitations TO service_role;

ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org admin manages tenant invitations"
  ON public.staff_invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "manager reads tenant invitations"
  ON public.staff_invitations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "invitee reads own pending invitation"
  ON public.staff_invitations FOR SELECT TO authenticated
  USING (
    status = 'pending'
    AND lower(email) = lower(coalesce((auth.jwt() ->> 'email'),''))
  );

CREATE POLICY "super admin all invitations"
  ON public.staff_invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_staff_invitations_updated_at
  BEFORE UPDATE ON public.staff_invitations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============== staff_onboarding_profiles ==============
CREATE TABLE public.staff_onboarding_profiles (
  employee_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  country_code text,
  legal_first_name text,
  legal_middle_name text,
  legal_last_name text,
  date_of_birth date,
  gender text,
  nationality text,
  marital_status text,
  national_id_number text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_of_residence text,
  personal_email text,
  personal_phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  bank_name text,
  bank_account_holder text,
  bank_account_number text,
  bank_branch_code text,
  bank_iban text,
  bank_swift text,
  tax_identification_number text,
  social_security_number text,
  provident_fund_number text,
  pension_fund_number text,
  country_specific jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  submitted_at timestamptz,
  submitted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_onboarding_tenant ON public.staff_onboarding_profiles(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_onboarding_profiles TO authenticated;
GRANT ALL ON public.staff_onboarding_profiles TO service_role;

ALTER TABLE public.staff_onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own onboarding profile"
  ON public.staff_onboarding_profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = staff_onboarding_profiles.employee_id AND e.user_id = auth.uid()
  ));

CREATE POLICY "employee inserts own onboarding profile"
  ON public.staff_onboarding_profiles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = staff_onboarding_profiles.employee_id
      AND e.user_id = auth.uid()
      AND e.tenant_id = staff_onboarding_profiles.tenant_id
  ));

CREATE POLICY "employee updates own onboarding profile"
  ON public.staff_onboarding_profiles FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = staff_onboarding_profiles.employee_id AND e.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = staff_onboarding_profiles.employee_id AND e.user_id = auth.uid()
  ));

CREATE POLICY "manager reads tenant onboarding profiles"
  ON public.staff_onboarding_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant onboarding profiles"
  ON public.staff_onboarding_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all onboarding profiles"
  ON public.staff_onboarding_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_staff_onboarding_updated_at
  BEFORE UPDATE ON public.staff_onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
