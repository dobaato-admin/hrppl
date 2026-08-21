
-- Stages on checklists (ordered phases like pre-boarding, day 1, week 1)
ALTER TABLE public.onboarding_checklists
  ADD COLUMN IF NOT EXISTS stages jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Default assignment rules per role/department
CREATE TABLE IF NOT EXISTS public.onboarding_default_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  checklist_id uuid NOT NULL REFERENCES public.onboarding_checklists(id) ON DELETE CASCADE,
  department_id uuid NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  job_title text NULL,
  due_offset_days integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oda_tenant ON public.onboarding_default_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_oda_checklist ON public.onboarding_default_assignments(checklist_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_default_assignments TO authenticated;
GRANT ALL ON public.onboarding_default_assignments TO service_role;

ALTER TABLE public.onboarding_default_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org reads tenant default assignments"
  ON public.onboarding_default_assignments FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant default assignments"
  ON public.onboarding_default_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all default assignments"
  ON public.onboarding_default_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER onboarding_default_assignments_touch
  BEFORE UPDATE ON public.onboarding_default_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Replace auto-assign trigger to use rule table when it has rows for the tenant,
-- falling back to legacy is_default flag when no rules are configured.
CREATE OR REPLACE FUNCTION public.auto_assign_default_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_rules boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.onboarding_default_assignments
    WHERE tenant_id = NEW.tenant_id AND is_active = true
  ) INTO v_has_rules;

  IF v_has_rules THEN
    INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
    SELECT NEW.tenant_id, NEW.id, r.checklist_id, NULL,
      CASE WHEN NEW.hire_date IS NOT NULL
        THEN (NEW.hire_date + (r.due_offset_days || ' days')::interval)::date
        ELSE NULL
      END
    FROM public.onboarding_default_assignments r
    WHERE r.tenant_id = NEW.tenant_id
      AND r.is_active = true
      AND (r.department_id IS NULL OR r.department_id = NEW.department_id)
      AND (r.job_title IS NULL OR lower(r.job_title) = lower(COALESCE(NEW.job_title,'')))
    ON CONFLICT (employee_id, checklist_id) DO NOTHING;
  ELSE
    INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
    SELECT NEW.tenant_id, NEW.id, c.id, NULL,
      CASE WHEN NEW.hire_date IS NOT NULL THEN NEW.hire_date + INTERVAL '30 days' ELSE NULL END::date
    FROM public.onboarding_checklists c
    WHERE c.tenant_id = NEW.tenant_id AND c.is_default = true
    ON CONFLICT (employee_id, checklist_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
