
-- Expense receipts: path layout = {tenant_id}/{employee_id}/{filename}
CREATE POLICY "expense_receipts owner read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'expense-receipts' AND (
    (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text AND (
      public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
      OR (storage.foldername(name))[2] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
    )
  )
);
CREATE POLICY "expense_receipts owner write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'expense-receipts'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND (storage.foldername(name))[2] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
);
CREATE POLICY "expense_receipts owner delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'expense-receipts'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND ((storage.foldername(name))[2] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
       OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

-- Candidate resumes: path layout = {tenant_id}/{job_id}/{filename}
CREATE POLICY "candidate_resumes anon upload" ON storage.objects FOR INSERT TO anon WITH CHECK (
  bucket_id = 'candidate-resumes'
  AND (storage.foldername(name))[2] IN (SELECT id::text FROM public.recruitment_jobs WHERE status = 'open')
);
CREATE POLICY "candidate_resumes auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'candidate-resumes');
CREATE POLICY "candidate_resumes admin read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'candidate-resumes'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
);
