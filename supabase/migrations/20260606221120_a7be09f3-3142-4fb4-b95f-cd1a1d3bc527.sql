
-- 1. expense_approvals: restrict SELECT
DROP POLICY IF EXISTS "expense_approvals read in tenant" ON public.expense_approvals;
CREATE POLICY "expense_approvals read scoped"
  ON public.expense_approvals FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
      OR approver_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.expense_claims c
        JOIN public.employees e ON e.id = c.employee_id
        WHERE c.id = expense_approvals.claim_id
          AND e.user_id = auth.uid()
      )
    )
  );

-- 2. recruitment_interviews: restrict to managers/admins
DROP POLICY IF EXISTS "recruitment_interviews tenant" ON public.recruitment_interviews;
CREATE POLICY "recruitment_interviews managers"
  ON public.recruitment_interviews FOR ALL
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
    )
  );

-- 3. recruitment_stages: tenant read, manager/admin write
DROP POLICY IF EXISTS "recruitment_stages tenant" ON public.recruitment_stages;
CREATE POLICY "recruitment_stages read"
  ON public.recruitment_stages FOR SELECT
  USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "recruitment_stages write managers"
  ON public.recruitment_stages FOR INSERT
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'manager'::app_role))
  );
CREATE POLICY "recruitment_stages update managers"
  ON public.recruitment_stages FOR UPDATE
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'manager'::app_role))
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'manager'::app_role))
  );
CREATE POLICY "recruitment_stages delete managers"
  ON public.recruitment_stages FOR DELETE
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'manager'::app_role))
  );

-- 4. training_quiz_attempts: own attempts only for employees
DROP POLICY IF EXISTS "tenant read attempts" ON public.training_quiz_attempts;
CREATE POLICY "read own or manager attempts"
  ON public.training_quiz_attempts FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      user_id = auth.uid()
      OR has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
      OR has_role(auth.uid(),'manager'::app_role)
    )
  );

-- 5. asset_assignments employee ack: add tenant scope
DROP POLICY IF EXISTS "asset_assign employee ack" ON public.asset_assignments;
CREATE POLICY "asset_assign employee ack"
  ON public.asset_assignments FOR UPDATE
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = asset_assignments.employee_id
        AND e.user_id = auth.uid()
        AND e.tenant_id = asset_assignments.tenant_id
    )
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = asset_assignments.employee_id
        AND e.user_id = auth.uid()
        AND e.tenant_id = asset_assignments.tenant_id
    )
  );

-- 6. expense_claims employee update: enforce employee_id in WITH CHECK
DROP POLICY IF EXISTS "expense_claims employee update own draft" ON public.expense_claims;
CREATE POLICY "expense_claims employee update own draft"
  ON public.expense_claims FOR UPDATE
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    AND status = ANY (ARRAY['draft'::expense_claim_status, 'submitted'::expense_claim_status])
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid() AND tenant_id = expense_claims.tenant_id)
  );

-- 7. recruitment_scorecards: restrict reads to managers/admins
DROP POLICY IF EXISTS "recruitment_scorecards tenant" ON public.recruitment_scorecards;
CREATE POLICY "recruitment_scorecards managers"
  ON public.recruitment_scorecards FOR ALL
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
      OR has_role(auth.uid(),'manager'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND reviewer_id = auth.uid()
    AND (
      has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
      OR has_role(auth.uid(),'manager'::app_role)
    )
  );

-- 8. support_ticket_comments view: add tenant scope
DROP POLICY IF EXISTS "support_ticket_comments_view" ON public.support_ticket_comments;
CREATE POLICY "support_ticket_comments_view"
  ON public.support_ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_ticket_comments.ticket_id
        AND t.tenant_id = support_ticket_comments.tenant_id
        AND t.tenant_id = user_tenant_id(auth.uid())
    )
    AND (
      NOT is_internal
      OR has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'manager'::app_role)
      OR has_role(auth.uid(),'regional_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
    )
  );

-- 9. candidate_resumes anon upload: enforce safe filename
DROP POLICY IF EXISTS "candidate_resumes anon upload" ON storage.objects;
CREATE POLICY "candidate_resumes anon upload"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'candidate-resumes'
    AND (storage.foldername(name))[1] = (
      SELECT (recruitment_jobs.tenant_id)::text
      FROM public.recruitment_jobs
      WHERE (recruitment_jobs.id)::text = (storage.foldername(objects.name))[2]
        AND recruitment_jobs.status = 'open'::recruitment_job_status
    )
    AND array_length(string_to_array(name, '/'), 1) = 3
    AND (storage.filename(name)) ~ '^[A-Za-z0-9._-]{1,200}$'
  );

-- 10. expense_receipts: add explicit UPDATE policy
DROP POLICY IF EXISTS "expense_receipts owner update" ON storage.objects;
CREATE POLICY "expense_receipts owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
    AND (
      (storage.foldername(name))[2] IN (SELECT (employees.id)::text FROM public.employees WHERE employees.user_id = auth.uid())
      OR has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
    )
  )
  WITH CHECK (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
    AND (
      (storage.foldername(name))[2] IN (SELECT (employees.id)::text FROM public.employees WHERE employees.user_id = auth.uid())
      OR has_role(auth.uid(),'org_admin'::app_role)
      OR has_role(auth.uid(),'super_admin'::app_role)
    )
  );
