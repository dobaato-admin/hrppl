
-- =================== ENUMS ===================
DO $$ BEGIN CREATE TYPE expense_claim_status AS ENUM ('draft','submitted','approved','rejected','paid','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE recruitment_job_status AS ENUM ('draft','open','paused','closed','filled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE recruitment_candidate_status AS ENUM ('active','hired','rejected','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE recruitment_interview_status AS ENUM ('scheduled','completed','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE recruitment_offer_status AS ENUM ('draft','sent','accepted','declined','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE biometric_vendor AS ENUM ('zkteco','generic','suprema'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE biometric_punch_type AS ENUM ('in','out','break_in','break_out','unknown'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================== EXPENSES ===================
CREATE TABLE public.expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text,
  requires_receipt boolean NOT NULL DEFAULT true,
  max_amount numeric(14,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_categories tenant read" ON public.expense_categories FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "expense_categories admin write" ON public.expense_categories FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')));
CREATE TRIGGER trg_expense_categories_updated BEFORE UPDATE ON public.expense_categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.expense_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status expense_claim_status NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'AUD',
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  reference_code text,
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejected_reason text,
  paid_at timestamptz,
  paid_by uuid REFERENCES auth.users(id),
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_expense_claims_tenant ON public.expense_claims(tenant_id, status);
CREATE INDEX idx_expense_claims_employee ON public.expense_claims(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_claims TO authenticated;
GRANT ALL ON public.expense_claims TO service_role;
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_claims tenant scope" ON public.expense_claims FOR SELECT TO authenticated USING (
  tenant_id = public.user_tenant_id(auth.uid()) AND (
    public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);
CREATE POLICY "expense_claims employee insert" ON public.expense_claims FOR INSERT TO authenticated WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid()) AND
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid() AND tenant_id = expense_claims.tenant_id)
);
CREATE POLICY "expense_claims employee update own draft" ON public.expense_claims FOR UPDATE TO authenticated USING (
  tenant_id = public.user_tenant_id(auth.uid()) AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  AND status IN ('draft','submitted')
) WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "expense_claims admin manage" ON public.expense_claims FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_expense_claims_updated BEFORE UPDATE ON public.expense_claims FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.expense_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.expense_claims(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.expense_categories(id),
  expense_date date NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'AUD',
  merchant text,
  description text,
  receipt_path text,
  mileage_km numeric(10,2),
  tax_amount numeric(14,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_expense_lines_claim ON public.expense_lines(claim_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_lines TO authenticated;
GRANT ALL ON public.expense_lines TO service_role;
ALTER TABLE public.expense_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_lines via claim" ON public.expense_lines FOR ALL TO authenticated USING (
  claim_id IN (SELECT id FROM public.expense_claims WHERE tenant_id = public.user_tenant_id(auth.uid()) AND (
    public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  ))
) WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));

CREATE TABLE public.expense_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.expense_claims(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('approved','rejected','requested_changes','commented')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_expense_approvals_claim ON public.expense_approvals(claim_id);
GRANT SELECT, INSERT ON public.expense_approvals TO authenticated;
GRANT ALL ON public.expense_approvals TO service_role;
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_approvals read in tenant" ON public.expense_approvals FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "expense_approvals manager insert" ON public.expense_approvals FOR INSERT TO authenticated WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid()) AND approver_id = auth.uid() AND
  (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
);

-- =================== RECRUITMENT / ATS ===================
CREATE TABLE public.recruitment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  location text,
  employment_type text,
  description_html text,
  requirements_html text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  currency text DEFAULT 'AUD',
  status recruitment_job_status NOT NULL DEFAULT 'draft',
  hiring_manager_id uuid REFERENCES auth.users(id),
  published_at timestamptz,
  closed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_recruitment_jobs_status ON public.recruitment_jobs(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_jobs TO authenticated;
GRANT SELECT ON public.recruitment_jobs TO anon;
GRANT ALL ON public.recruitment_jobs TO service_role;
ALTER TABLE public.recruitment_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_jobs public read open" ON public.recruitment_jobs FOR SELECT TO anon USING (status = 'open');
CREATE POLICY "recruitment_jobs tenant read" ON public.recruitment_jobs FOR SELECT TO authenticated USING (
  status = 'open' OR tenant_id = public.user_tenant_id(auth.uid())
);
CREATE POLICY "recruitment_jobs admin manage" ON public.recruitment_jobs FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_recruitment_jobs_updated BEFORE UPDATE ON public.recruitment_jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.recruitment_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.recruitment_jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  kind text NOT NULL DEFAULT 'custom' CHECK (kind IN ('applied','screen','interview','offer','hired','rejected','custom')),
  is_terminal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recruitment_stages_job ON public.recruitment_stages(job_id, sort_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_stages TO authenticated;
GRANT ALL ON public.recruitment_stages TO service_role;
ALTER TABLE public.recruitment_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_stages tenant" ON public.recruitment_stages FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));

CREATE TABLE public.recruitment_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.recruitment_jobs(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES public.recruitment_stages(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_path text,
  cover_letter text,
  linkedin_url text,
  source text DEFAULT 'careers_page',
  current_company text,
  current_title text,
  desired_salary numeric(14,2),
  status recruitment_candidate_status NOT NULL DEFAULT 'active',
  overall_rating numeric(3,2),
  hired_employee_id uuid REFERENCES public.employees(id),
  rejected_reason text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, email)
);
CREATE INDEX idx_recruitment_candidates_job ON public.recruitment_candidates(job_id, stage_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_candidates TO authenticated;
GRANT INSERT ON public.recruitment_candidates TO anon;
GRANT ALL ON public.recruitment_candidates TO service_role;
ALTER TABLE public.recruitment_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_candidates public apply" ON public.recruitment_candidates FOR INSERT TO anon WITH CHECK (
  job_id IN (SELECT id FROM public.recruitment_jobs WHERE status = 'open' AND id = recruitment_candidates.job_id AND tenant_id = recruitment_candidates.tenant_id)
);
CREATE POLICY "recruitment_candidates tenant read" ON public.recruitment_candidates FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "recruitment_candidates tenant write" ON public.recruitment_candidates FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_recruitment_candidates_updated BEFORE UPDATE ON public.recruitment_candidates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.recruitment_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.recruitment_candidates(id) ON DELETE CASCADE,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 45,
  mode text NOT NULL DEFAULT 'video' CHECK (mode IN ('video','phone','onsite')),
  location text,
  interviewer_ids uuid[] NOT NULL DEFAULT '{}',
  status recruitment_interview_status NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recruitment_interviews_candidate ON public.recruitment_interviews(candidate_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_interviews TO authenticated;
GRANT ALL ON public.recruitment_interviews TO service_role;
ALTER TABLE public.recruitment_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_interviews tenant" ON public.recruitment_interviews FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_recruitment_interviews_updated BEFORE UPDATE ON public.recruitment_interviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.recruitment_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.recruitment_candidates(id) ON DELETE CASCADE,
  interview_id uuid REFERENCES public.recruitment_interviews(id) ON DELETE SET NULL,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  overall_rating int CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation text CHECK (recommendation IN ('strong_yes','yes','neutral','no','strong_no')),
  strengths text,
  concerns text,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recruitment_scorecards_candidate ON public.recruitment_scorecards(candidate_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_scorecards TO authenticated;
GRANT ALL ON public.recruitment_scorecards TO service_role;
ALTER TABLE public.recruitment_scorecards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_scorecards tenant" ON public.recruitment_scorecards FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND reviewer_id = auth.uid());

CREATE TABLE public.recruitment_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.recruitment_candidates(id) ON DELETE CASCADE,
  job_title text NOT NULL,
  base_salary numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'AUD',
  start_date date,
  notes text,
  status recruitment_offer_status NOT NULL DEFAULT 'draft',
  envelope_id uuid REFERENCES public.document_envelopes(id),
  sent_at timestamptz,
  responded_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruitment_offers TO authenticated;
GRANT ALL ON public.recruitment_offers TO service_role;
ALTER TABLE public.recruitment_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_offers tenant" ON public.recruitment_offers FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_recruitment_offers_updated BEFORE UPDATE ON public.recruitment_offers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.recruitment_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.recruitment_candidates(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.recruitment_notes TO authenticated;
GRANT ALL ON public.recruitment_notes TO service_role;
ALTER TABLE public.recruitment_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recruitment_notes tenant read" ON public.recruitment_notes FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "recruitment_notes author insert" ON public.recruitment_notes FOR INSERT TO authenticated WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND author_id = auth.uid());
CREATE POLICY "recruitment_notes author delete" ON public.recruitment_notes FOR DELETE TO authenticated USING (author_id = auth.uid());

-- =================== BIOMETRIC DEVICES & PUNCHES ===================
CREATE TABLE public.biometric_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  vendor biometric_vendor NOT NULL DEFAULT 'zkteco',
  device_serial text,
  location text,
  ip_address text,
  webhook_token text NOT NULL DEFAULT encode(gen_random_bytes(24),'hex'),
  shared_secret text NOT NULL DEFAULT encode(gen_random_bytes(32),'hex'),
  last_sync_at timestamptz,
  last_punch_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (webhook_token)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biometric_devices TO authenticated;
GRANT ALL ON public.biometric_devices TO service_role;
ALTER TABLE public.biometric_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biometric_devices admin" ON public.biometric_devices FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_biometric_devices_updated BEFORE UPDATE ON public.biometric_devices FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.biometric_user_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.biometric_devices(id) ON DELETE CASCADE,
  raw_user_id text NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, raw_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biometric_user_mappings TO authenticated;
GRANT ALL ON public.biometric_user_mappings TO service_role;
ALTER TABLE public.biometric_user_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biometric_mappings admin" ON public.biometric_user_mappings FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));

CREATE TABLE public.biometric_punches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.biometric_devices(id) ON DELETE CASCADE,
  raw_user_id text NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  punch_at timestamptz NOT NULL,
  punch_type biometric_punch_type NOT NULL DEFAULT 'unknown',
  source text NOT NULL DEFAULT 'webhook',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  attendance_entry_id uuid REFERENCES public.attendance_entries(id) ON DELETE SET NULL,
  ingested_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, raw_user_id, punch_at, punch_type)
);
CREATE INDEX idx_biometric_punches_tenant_time ON public.biometric_punches(tenant_id, punch_at DESC);
CREATE INDEX idx_biometric_punches_employee ON public.biometric_punches(employee_id, punch_at DESC);
GRANT SELECT ON public.biometric_punches TO authenticated;
GRANT ALL ON public.biometric_punches TO service_role;
ALTER TABLE public.biometric_punches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biometric_punches tenant read" ON public.biometric_punches FOR SELECT TO authenticated USING (
  tenant_id = public.user_tenant_id(auth.uid()) AND (
    public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- =================== SIGN GEOFENCES ===================
CREATE TABLE public.sign_geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  radius_meters int NOT NULL DEFAULT 150 CHECK (radius_meters BETWEEN 25 AND 5000),
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sign_geofences TO authenticated;
GRANT ALL ON public.sign_geofences TO service_role;
ALTER TABLE public.sign_geofences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sign_geofences tenant read" ON public.sign_geofences FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "sign_geofences admin write" ON public.sign_geofences FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()));
CREATE TRIGGER trg_sign_geofences_updated BEFORE UPDATE ON public.sign_geofences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Extend document_envelopes & document_signers for geofence
ALTER TABLE public.document_envelopes
  ADD COLUMN IF NOT EXISTS require_geofence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allowed_geofence_ids uuid[] NOT NULL DEFAULT '{}';

ALTER TABLE public.document_signers
  ADD COLUMN IF NOT EXISTS signature_latitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS signature_longitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS signature_geo_accuracy_m numeric(8,2),
  ADD COLUMN IF NOT EXISTS signature_geofence_id uuid REFERENCES public.sign_geofences(id);
