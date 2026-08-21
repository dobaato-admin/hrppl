-- Fix: training_quiz_questions.correct_index visible to learners via RLS.
-- Drop the employee SELECT policy on the base table so learners cannot read
-- correct_index. Replace the learner read path with a security-definer view
-- that omits correct_index/explanation and enforces tenant + enrollment scope
-- internally. Managers/admins keep full table access via existing policies.

DROP POLICY IF EXISTS "enrolled employees read quiz questions" ON public.training_quiz_questions;

DROP VIEW IF EXISTS public.training_quiz_questions_public;

CREATE VIEW public.training_quiz_questions_public
WITH (security_invoker = off) AS
SELECT q.id, q.tenant_id, q.course_id, q.sort_order, q.question, q.choices,
       q.points, q.created_at, q.updated_at
FROM public.training_quiz_questions q
WHERE
  -- Managers/admins of the same tenant
  (
    q.tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
  OR
  -- Employees actively enrolled in the course (same tenant)
  (
    q.tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.training_enrollments en
      JOIN public.employees e ON e.id = en.employee_id
      WHERE en.course_id = q.course_id
        AND e.user_id = auth.uid()
        AND en.status IN ('assigned'::training_enrollment_status, 'in_progress'::training_enrollment_status)
    )
  );

GRANT SELECT ON public.training_quiz_questions_public TO authenticated;
