
-- Add branch link to employees (nullable; null = unassigned/all-branches in tenant)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);

-- EMPLOYEES
CREATE POLICY "hr manages tenant employees" ON public.employees
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant employees" ON public.employees
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch employees" ON public.employees
  FOR ALL TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id) AND public.has_branch_access(auth.uid(), branch_id))
  WITH CHECK (public.is_branch_admin(auth.uid(), tenant_id) AND public.has_branch_access(auth.uid(), branch_id));

-- DEPARTMENTS
CREATE POLICY "hr manages tenant departments" ON public.departments
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant departments" ON public.departments
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant departments" ON public.departments
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));

-- DESIGNATIONS
CREATE POLICY "hr manages tenant designations" ON public.designations
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant designations" ON public.designations
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages tenant designations" ON public.designations
  FOR ALL TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id))
  WITH CHECK (public.is_branch_admin(auth.uid(), tenant_id));

-- PROMOTIONS
CREATE POLICY "hr manages tenant promotions" ON public.promotions
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant promotions" ON public.promotions
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch promotions" ON public.promotions
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = promotions.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = promotions.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- PAY_RATE_CHANGES
CREATE POLICY "hr manages tenant pay_rate_changes" ON public.pay_rate_changes
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant pay_rate_changes" ON public.pay_rate_changes
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch pay_rate_changes" ON public.pay_rate_changes
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = pay_rate_changes.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

CREATE POLICY "manager reads direct report pay_rate_changes" ON public.pay_rate_changes
  FOR SELECT TO authenticated
  USING (public.is_manager_of(auth.uid(), employee_id));

-- EMPLOYEE_DOCUMENTS
CREATE POLICY "hr manages tenant employee_documents" ON public.employee_documents
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch employee_documents" ON public.employee_documents
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_documents.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_documents.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- EMPLOYEE_EVENTS
CREATE POLICY "hr manages tenant employee_events" ON public.employee_events
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch employee_events" ON public.employee_events
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND visibility NOT IN ('confidential'::event_visibility, 'hr'::event_visibility)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_events.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );
