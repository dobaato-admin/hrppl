
-- 1. Assignments table
CREATE TABLE public.onboarding_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  checklist_id uuid NOT NULL REFERENCES public.onboarding_checklists(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_date date,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','signed_off','cancelled')),
  signed_off_by uuid,
  signed_off_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, checklist_id)
);

CREATE INDEX onboarding_assignments_employee_idx ON public.onboarding_assignments(employee_id);
CREATE INDEX onboarding_assignments_tenant_idx ON public.onboarding_assignments(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_assignments TO authenticated;
GRANT ALL ON public.onboarding_assignments TO service_role;

ALTER TABLE public.onboarding_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own assignments" ON public.onboarding_assignments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = onboarding_assignments.employee_id AND e.user_id = auth.uid()));

CREATE POLICY "manager reads tenant assignments" ON public.onboarding_assignments
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant assignments" ON public.onboarding_assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "manager signs off tenant assignments" ON public.onboarding_assignments
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "super admin all assignments" ON public.onboarding_assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER onboarding_assignments_touch BEFORE UPDATE ON public.onboarding_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. Extend onboarding_progress with manager approval
ALTER TABLE public.onboarding_progress
  ADD COLUMN approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  ADD COLUMN approved_by uuid,
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN approval_notes text;

-- Allow managers to update approval fields
CREATE POLICY "manager approves tenant progress" ON public.onboarding_progress
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

-- 3. Auto-assign default checklists when a new employee is created
CREATE OR REPLACE FUNCTION public.auto_assign_default_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
  SELECT NEW.tenant_id, NEW.id, c.id, NULL,
    CASE WHEN NEW.hire_date IS NOT NULL THEN NEW.hire_date + INTERVAL '30 days' ELSE NULL END::date
  FROM public.onboarding_checklists c
  WHERE c.tenant_id = NEW.tenant_id AND c.is_default = true
  ON CONFLICT (employee_id, checklist_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_assign_default_onboarding_t
  AFTER INSERT ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_default_onboarding();
