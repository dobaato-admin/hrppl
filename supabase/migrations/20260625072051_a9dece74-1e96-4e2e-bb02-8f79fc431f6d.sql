
-- au_payday_super_obligations
DROP POLICY IF EXISTS payday_super_admin_write ON public.au_payday_super_obligations;
CREATE POLICY payday_super_admin_write ON public.au_payday_super_obligations
  FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- au_stp_submissions
DROP POLICY IF EXISTS au_stp_admin_write ON public.au_stp_submissions;
CREATE POLICY au_stp_admin_write ON public.au_stp_submissions
  FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- employment_variations
DROP POLICY IF EXISTS emp_var_hr_write ON public.employment_variations;
CREATE POLICY emp_var_hr_write ON public.employment_variations
  FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid())
      AND (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role)))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid())
      AND (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role)))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- employment_variation_approvals (scope via parent variation tenant)
DROP POLICY IF EXISTS emp_var_app_hr_write ON public.employment_variation_approvals;
CREATE POLICY emp_var_app_hr_write ON public.employment_variation_approvals
  FOR ALL
  USING (
    (
      (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role))
      AND variation_id IN (
        SELECT ev.id FROM public.employment_variations ev
        WHERE ev.tenant_id = public.user_tenant_id(auth.uid())
      )
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (
      (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role))
      AND variation_id IN (
        SELECT ev.id FROM public.employment_variations ev
        WHERE ev.tenant_id = public.user_tenant_id(auth.uid())
      )
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- onboarding_control_room_tasks (scope via assignment -> employee.tenant_id)
DROP POLICY IF EXISTS ocr_tasks_hr_write ON public.onboarding_control_room_tasks;
CREATE POLICY ocr_tasks_hr_write ON public.onboarding_control_room_tasks
  FOR ALL
  USING (
    (
      (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role))
      AND assignment_id IN (
        SELECT oa.id FROM public.onboarding_assignments oa
        JOIN public.employees e ON e.id = oa.employee_id
        WHERE e.tenant_id = public.user_tenant_id(auth.uid())
      )
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (
      (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'org_admin'::app_role))
      AND assignment_id IN (
        SELECT oa.id FROM public.onboarding_assignments oa
        JOIN public.employees e ON e.id = oa.employee_id
        WHERE e.tenant_id = public.user_tenant_id(auth.uid())
      )
    )
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- payroll_tax_rules
DROP POLICY IF EXISTS ptr_admin_write ON public.payroll_tax_rules;
CREATE POLICY ptr_admin_write ON public.payroll_tax_rules
  FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- tenant_mfa_policy
DROP POLICY IF EXISTS mfa_policy_admin_write ON public.tenant_mfa_policy;
CREATE POLICY mfa_policy_admin_write ON public.tenant_mfa_policy
  FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'org_admin'::app_role))
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Remove direct authenticated upload to candidate-resumes; uploads must use server-issued signed URLs
DROP POLICY IF EXISTS "candidate_resumes auth upload" ON storage.objects;
