
-- 1) employee_event_links: tenant-scope org_admin policy via join to employee_events
DROP POLICY IF EXISTS "org admin manages links" ON public.employee_event_links;
CREATE POLICY "org admin manages links" ON public.employee_event_links
  FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'org_admin'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.employee_events ev
        WHERE ev.id = employee_event_links.from_event_id
          AND ev.tenant_id = user_tenant_id(auth.uid())
      )
      AND EXISTS (
        SELECT 1 FROM public.employee_events ev2
        WHERE ev2.id = employee_event_links.to_event_id
          AND ev2.tenant_id = user_tenant_id(auth.uid())
      )
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'org_admin'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.employee_events ev
        WHERE ev.id = employee_event_links.from_event_id
          AND ev.tenant_id = user_tenant_id(auth.uid())
      )
      AND EXISTS (
        SELECT 1 FROM public.employee_events ev2
        WHERE ev2.id = employee_event_links.to_event_id
          AND ev2.tenant_id = user_tenant_id(auth.uid())
      )
    )
  );

-- 2) clients: restrict broad SELECT to manager/org_admin
DROP POLICY IF EXISTS "org members read tenant clients" ON public.clients;
CREATE POLICY "managers read tenant clients" ON public.clients
  FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'manager'::app_role)
      OR has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

-- 3) disciplinary_cases: hide confidential cases from subject employee
DROP POLICY IF EXISTS "Employee view own cases" ON public.disciplinary_cases;
CREATE POLICY "Employee view own non-confidential cases" ON public.disciplinary_cases
  FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND COALESCE(confidential, false) = false
    AND employee_id IN (
      SELECT employees.id FROM public.employees WHERE employees.user_id = auth.uid()
    )
  );

-- 4) invoices: restrict broad SELECT to manager/org_admin
DROP POLICY IF EXISTS "org members read tenant invoices" ON public.invoices;
CREATE POLICY "managers read tenant invoices" ON public.invoices
  FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'manager'::app_role)
      OR has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

-- 5) invoice_lines: restrict broad SELECT to manager/org_admin
DROP POLICY IF EXISTS "org members read tenant invoice lines" ON public.invoice_lines;
CREATE POLICY "managers read tenant invoice lines" ON public.invoice_lines
  FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'manager'::app_role)
      OR has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

-- 6) onboarding_assignments: allow employee to update progress on their own assignment
CREATE POLICY "employee updates own assignment progress" ON public.onboarding_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = onboarding_assignments.employee_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = onboarding_assignments.employee_id
        AND e.user_id = auth.uid()
    )
  );

-- 7) training_quiz_questions: restrict broad SELECT to managers/admins; expose public view for learners
DROP POLICY IF EXISTS "tenant read questions" ON public.training_quiz_questions;
CREATE POLICY "managers read questions" ON public.training_quiz_questions
  FOR SELECT
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'manager'::app_role)
      OR has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

CREATE OR REPLACE VIEW public.training_quiz_questions_public
WITH (security_invoker = on) AS
  SELECT id, tenant_id, course_id, sort_order, question, choices, points, created_at, updated_at
  FROM public.training_quiz_questions;

GRANT SELECT ON public.training_quiz_questions_public TO authenticated;

-- Allow tenant members to read the safe view (no correct_index / explanation)
CREATE POLICY "tenant read questions via view" ON public.training_quiz_questions
  FOR SELECT
  USING (false);
-- Note: above is a no-op placeholder kept for documentation; we rely on the view + restrictive base policy.
DROP POLICY IF EXISTS "tenant read questions via view" ON public.training_quiz_questions;
