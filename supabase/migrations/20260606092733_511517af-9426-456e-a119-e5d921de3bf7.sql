
-- DISCIPLINARY CASES
CREATE TABLE public.disciplinary_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  case_number text,
  category text NOT NULL CHECK (category IN ('verbal_warning','written_warning','final_warning','suspension','termination','pip','investigation','other')),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  incident_date date,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_review','closed','appealed')),
  outcome text,
  opened_by uuid,
  closed_at timestamptz,
  closed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disciplinary_cases_tenant_idx ON public.disciplinary_cases(tenant_id);
CREATE INDEX disciplinary_cases_employee_idx ON public.disciplinary_cases(employee_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinary_cases TO authenticated;
GRANT ALL ON public.disciplinary_cases TO service_role;
ALTER TABLE public.disciplinary_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage cases" ON public.disciplinary_cases FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Employee view own cases" ON public.disciplinary_cases FOR SELECT TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

CREATE TRIGGER disciplinary_cases_touch
BEFORE UPDATE ON public.disciplinary_cases
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- DISCIPLINARY ACTIONS (timeline)
CREATE TABLE public.disciplinary_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.disciplinary_cases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('warning_issued','hearing_scheduled','hearing_held','appeal_filed','outcome_recorded','note','document_attached','status_changed')),
  action_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  document_url text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disciplinary_actions_case_idx ON public.disciplinary_actions(case_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinary_actions TO authenticated;
GRANT ALL ON public.disciplinary_actions TO service_role;
ALTER TABLE public.disciplinary_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage actions" ON public.disciplinary_actions FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Employee view own case actions" ON public.disciplinary_actions FOR SELECT TO authenticated
USING (
  case_id IN (
    SELECT c.id FROM public.disciplinary_cases c
    WHERE c.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- GRIEVANCES
CREATE TABLE public.grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  filer_employee_id uuid,
  filer_user_id uuid NOT NULL,
  against_employee_id uuid,
  category text NOT NULL CHECK (category IN ('harassment','discrimination','workplace','pay','management','safety','other')),
  subject text NOT NULL,
  description text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','acknowledged','investigating','resolved','dismissed')),
  assigned_to uuid,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX grievances_tenant_idx ON public.grievances(tenant_id);
CREATE INDEX grievances_filer_idx ON public.grievances(filer_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grievances TO authenticated;
GRANT ALL ON public.grievances TO service_role;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage grievances" ON public.grievances FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Filer view own grievances" ON public.grievances FOR SELECT TO authenticated
USING (filer_user_id = auth.uid());

CREATE POLICY "Employee file grievance" ON public.grievances FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND filer_user_id = auth.uid()
);

CREATE TRIGGER grievances_touch
BEFORE UPDATE ON public.grievances
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- GRIEVANCE COMMENTS
CREATE TABLE public.grievance_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  author_id uuid NOT NULL,
  comment text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX grievance_comments_grievance_idx ON public.grievance_comments(grievance_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grievance_comments TO authenticated;
GRANT ALL ON public.grievance_comments TO service_role;
ALTER TABLE public.grievance_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage grievance comments" ON public.grievance_comments FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Filer view non-internal comments" ON public.grievance_comments FOR SELECT TO authenticated
USING (
  is_internal = false
  AND grievance_id IN (SELECT id FROM public.grievances WHERE filer_user_id = auth.uid())
);

CREATE POLICY "Filer add comments" ON public.grievance_comments FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND is_internal = false
  AND grievance_id IN (SELECT id FROM public.grievances WHERE filer_user_id = auth.uid())
);
