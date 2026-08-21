
-- 1. disciplinary_actions: hide confidential cases from subject employee
DROP POLICY IF EXISTS "Employee view own case actions" ON public.disciplinary_actions;
CREATE POLICY "Employee view own case actions" ON public.disciplinary_actions
FOR SELECT USING (
  case_id IN (
    SELECT c.id FROM public.disciplinary_cases c
    WHERE COALESCE(c.confidential, false) = false
      AND c.employee_id IN (
        SELECT e.id FROM public.employees e WHERE e.user_id = auth.uid()
      )
  )
);

-- 2. disciplinary_attachments: same fix
DROP POLICY IF EXISTS "Employee view own case attachments" ON public.disciplinary_attachments;
CREATE POLICY "Employee view own case attachments" ON public.disciplinary_attachments
FOR SELECT USING (
  case_id IN (
    SELECT c.id FROM public.disciplinary_cases c
    WHERE COALESCE(c.confidential, false) = false
      AND c.employee_id IN (
        SELECT e.id FROM public.employees e WHERE e.user_id = auth.uid()
      )
  )
);

-- 3. recruitment_candidates: restrict reads to hiring roles
DROP POLICY IF EXISTS "recruitment_candidates tenant read" ON public.recruitment_candidates;
CREATE POLICY "recruitment_candidates tenant read" ON public.recruitment_candidates
FOR SELECT USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'manager'::app_role)
    OR public.has_role(auth.uid(), 'org_admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- 4. recruitment_notes: restrict reads to hiring roles
DROP POLICY IF EXISTS "recruitment_notes tenant read" ON public.recruitment_notes;
CREATE POLICY "recruitment_notes tenant read" ON public.recruitment_notes
FOR SELECT USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'manager'::app_role)
    OR public.has_role(auth.uid(), 'org_admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- 5. document_envelopes: restrict managers to envelopes for their direct reports
DROP POLICY IF EXISTS "env_manager_read" ON public.document_envelopes;
CREATE POLICY "env_manager_read" ON public.document_envelopes
FOR SELECT USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = public.user_tenant_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = document_envelopes.employee_id
      AND m.user_id = auth.uid()
  )
);

-- 6. performance_reviews: restrict managers to direct-report reviews
DROP POLICY IF EXISTS "manager reads tenant reviews" ON public.performance_reviews;
CREATE POLICY "manager reads tenant reviews" ON public.performance_reviews
FOR SELECT USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = performance_reviews.employee_id
      AND m.user_id = auth.uid()
  )
);
