-- Restrict authenticated SELECT on candidate-resumes to tenant admins/managers
CREATE POLICY "candidate_resumes authenticated tenant scoped read"
ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated
USING (
  bucket_id <> 'candidate-resumes'
  OR (
    (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
    )
  )
);

-- Scope expense claims update policy to authenticated role only
DROP POLICY IF EXISTS "expense_claims employee update own draft" ON public.expense_claims;
CREATE POLICY "expense_claims employee update own draft"
ON public.expense_claims FOR UPDATE TO authenticated
USING (
  tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  AND status = ANY (ARRAY['draft'::expense_claim_status, 'submitted'::expense_claim_status])
)
WITH CHECK (
  tenant_id = user_tenant_id(auth.uid())
  AND employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  AND status = ANY (ARRAY['draft'::expense_claim_status, 'submitted'::expense_claim_status])
);