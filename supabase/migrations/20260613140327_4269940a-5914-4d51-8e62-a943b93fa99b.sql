
-- PAYROLL_RUNS
CREATE POLICY "finance manages tenant payroll_runs" ON public.payroll_runs
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr reads tenant payroll_runs" ON public.payroll_runs
  FOR SELECT TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id));

-- PAYROLL_PAYSLIPS
CREATE POLICY "finance manages tenant payroll_payslips" ON public.payroll_payslips
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr reads tenant payroll_payslips" ON public.payroll_payslips
  FOR SELECT TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "manager reads direct report payroll_payslips" ON public.payroll_payslips
  FOR SELECT TO authenticated
  USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "branch admin reads branch payroll_payslips" ON public.payroll_payslips
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = payroll_payslips.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- EMPLOYEE_PAYROLL_DETAILS
CREATE POLICY "finance manages tenant employee_payroll_details" ON public.employee_payroll_details
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr reads tenant employee_payroll_details" ON public.employee_payroll_details
  FOR SELECT TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "manager reads direct report employee_payroll_details" ON public.employee_payroll_details
  FOR SELECT TO authenticated
  USING (public.is_manager_of(auth.uid(), employee_id));

-- EXPENSE_CLAIMS
CREATE POLICY "finance manages tenant expense_claims" ON public.expense_claims
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant expense_claims" ON public.expense_claims
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch expense_claims" ON public.expense_claims
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = expense_claims.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- EXPENSE_LINES
CREATE POLICY "finance manages tenant expense_lines" ON public.expense_lines
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr reads tenant expense_lines" ON public.expense_lines
  FOR SELECT TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id));

-- EXPENSE_CATEGORIES
CREATE POLICY "finance manages tenant expense_categories" ON public.expense_categories
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr reads tenant expense_categories" ON public.expense_categories
  FOR SELECT TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id));

-- INVOICES
CREATE POLICY "finance manages tenant invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

-- INVOICE_LINES
CREATE POLICY "finance manages tenant invoice_lines" ON public.invoice_lines
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

-- CLIENTS
CREATE POLICY "finance manages tenant clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

-- PROJECTS
CREATE POLICY "finance manages tenant projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant projects" ON public.projects
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));

-- JOBS
CREATE POLICY "finance manages tenant jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant jobs" ON public.jobs
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));

-- PAYSLIP_TEMPLATES (tenant-less but country-scoped; HR within tenant gets read)
CREATE POLICY "hr reads payslip_templates" ON public.payslip_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'finance'::app_role));

CREATE POLICY "hr reads payslip_line_items" ON public.payslip_line_items
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'finance'::app_role));
