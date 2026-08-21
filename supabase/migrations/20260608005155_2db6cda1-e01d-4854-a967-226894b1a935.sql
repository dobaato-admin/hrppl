
-- Scope manager visibility to direct reports only (matches the pattern already used on performance_reviews).
-- Helper expression repeated inline because we cannot reference auth.uid() from a STABLE function returning set.

-- employees
DROP POLICY IF EXISTS "manager reads tenant employees" ON public.employees;
CREATE POLICY "manager reads direct report employees" ON public.employees
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND (
    user_id = auth.uid()
    OR manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- attendance_entries
DROP POLICY IF EXISTS "manager reads tenant attendance" ON public.attendance_entries;
CREATE POLICY "manager reads direct report attendance" ON public.attendance_entries
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- leave_accrual_log
DROP POLICY IF EXISTS "manager reads tenant accrual log" ON public.leave_accrual_log;
CREATE POLICY "manager reads direct report accrual log" ON public.leave_accrual_log
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- leave_balances
DROP POLICY IF EXISTS "manager reads tenant balances" ON public.leave_balances;
CREATE POLICY "manager reads direct report balances" ON public.leave_balances
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- leave_requests (SELECT + UPDATE)
DROP POLICY IF EXISTS "manager reads tenant requests" ON public.leave_requests;
CREATE POLICY "manager reads direct report requests" ON public.leave_requests
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "manager approves tenant requests" ON public.leave_requests;
CREATE POLICY "manager approves direct report requests" ON public.leave_requests
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- payroll_payslips
DROP POLICY IF EXISTS "manager reads tenant payslips" ON public.payroll_payslips;
CREATE POLICY "manager reads direct report payslips" ON public.payroll_payslips
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- staff_onboarding_profiles
DROP POLICY IF EXISTS "manager reads tenant onboarding profiles" ON public.staff_onboarding_profiles;
CREATE POLICY "manager reads direct report onboarding profiles" ON public.staff_onboarding_profiles
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- timesheets (SELECT + UPDATE)
DROP POLICY IF EXISTS "manager reads tenant timesheets" ON public.timesheets;
CREATE POLICY "manager reads direct report timesheets" ON public.timesheets
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "manager updates tenant timesheets" ON public.timesheets;
CREATE POLICY "manager updates direct report timesheets" ON public.timesheets
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (
    SELECT e.id FROM public.employees e
    WHERE e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);
