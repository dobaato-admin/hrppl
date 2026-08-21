
CREATE TABLE IF NOT EXISTS public.tenant_mfa_policy (
  tenant_id uuid PRIMARY KEY,
  required_roles text[] NOT NULL DEFAULT ARRAY[]::text[],
  grace_period_days int NOT NULL DEFAULT 7,
  is_enforced boolean NOT NULL DEFAULT false,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_mfa_policy TO authenticated;
GRANT ALL ON public.tenant_mfa_policy TO service_role;
ALTER TABLE public.tenant_mfa_policy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfa_policy_select_same_tenant" ON public.tenant_mfa_policy FOR SELECT TO authenticated
USING (
  tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "mfa_policy_admin_write" ON public.tenant_mfa_policy FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TABLE IF NOT EXISTS public.onboarding_control_room_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.onboarding_assignments(id) ON DELETE CASCADE,
  owner_role text NOT NULL CHECK (owner_role IN ('hr','it','manager','employee','finance')),
  title text NOT NULL,
  description text,
  due_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked','skipped')),
  completed_at timestamptz,
  completed_by uuid,
  assigned_to uuid,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_assignment ON public.onboarding_control_room_tasks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_owner ON public.onboarding_control_room_tasks(owner_role, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_control_room_tasks TO authenticated;
GRANT ALL ON public.onboarding_control_room_tasks TO service_role;
ALTER TABLE public.onboarding_control_room_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ocr_tasks_tenant_select" ON public.onboarding_control_room_tasks FOR SELECT TO authenticated
USING (
  assignment_id IN (
    SELECT oa.id FROM public.onboarding_assignments oa
    JOIN public.employees e ON e.id = oa.employee_id
    WHERE e.tenant_id IN (SELECT em.tenant_id FROM public.employees em WHERE em.user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "ocr_tasks_hr_write" ON public.onboarding_control_room_tasks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "ocr_tasks_owner_update" ON public.onboarding_control_room_tasks FOR UPDATE TO authenticated
USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

CREATE TABLE IF NOT EXISTS public.employment_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  variation_type text NOT NULL CHECK (variation_type IN ('promotion','transfer','pay_change','hours_change','role_change','department_change','contract_change')),
  effective_date date NOT NULL,
  current_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','applied','cancelled')),
  requested_by uuid,
  approver_id uuid,
  approved_at timestamptz,
  applied_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emp_variations_emp ON public.employment_variations(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_emp_variations_tenant ON public.employment_variations(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_variations TO authenticated;
GRANT ALL ON public.employment_variations TO service_role;
ALTER TABLE public.employment_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emp_var_tenant_select" ON public.employment_variations FOR SELECT TO authenticated
USING (
  tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "emp_var_hr_write" ON public.employment_variations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TABLE IF NOT EXISTS public.employment_variation_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variation_id uuid NOT NULL REFERENCES public.employment_variations(id) ON DELETE CASCADE,
  step_no int NOT NULL DEFAULT 1,
  approver_role text NOT NULL,
  approver_id uuid,
  decision text CHECK (decision IN ('approved','rejected','pending')) DEFAULT 'pending',
  decided_at timestamptz,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emp_var_approvals_var ON public.employment_variation_approvals(variation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_variation_approvals TO authenticated;
GRANT ALL ON public.employment_variation_approvals TO service_role;
ALTER TABLE public.employment_variation_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emp_var_app_tenant_select" ON public.employment_variation_approvals FOR SELECT TO authenticated
USING (
  variation_id IN (
    SELECT ev.id FROM public.employment_variations ev
    WHERE ev.tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "emp_var_app_hr_write" ON public.employment_variation_approvals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

ALTER TABLE public.recruitment_jobs
  ADD COLUMN IF NOT EXISTS public_slug text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_summary text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_recruitment_jobs_public_slug
  ON public.recruitment_jobs(tenant_id, public_slug) WHERE public_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.tenant_careers_settings (
  tenant_id uuid PRIMARY KEY,
  public_slug text UNIQUE NOT NULL,
  headline text,
  about_html text,
  brand_color text DEFAULT '#0F172A',
  hero_image_url text,
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_careers_settings TO authenticated;
GRANT SELECT ON public.tenant_careers_settings TO anon;
GRANT ALL ON public.tenant_careers_settings TO service_role;
ALTER TABLE public.tenant_careers_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "careers_settings_public_read" ON public.tenant_careers_settings FOR SELECT TO anon USING (is_enabled = true);
CREATE POLICY "careers_settings_tenant_read" ON public.tenant_careers_settings FOR SELECT TO authenticated
USING (
  tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "careers_settings_admin_write" ON public.tenant_careers_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "recruitment_jobs_public_read" ON public.recruitment_jobs FOR SELECT TO anon USING (is_published = true);
GRANT SELECT ON public.recruitment_jobs TO anon;

CREATE TRIGGER trg_tenant_mfa_policy_updated BEFORE UPDATE ON public.tenant_mfa_policy
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ocr_tasks_updated BEFORE UPDATE ON public.onboarding_control_room_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_emp_variations_updated BEFORE UPDATE ON public.employment_variations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_careers_settings_updated BEFORE UPDATE ON public.tenant_careers_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
