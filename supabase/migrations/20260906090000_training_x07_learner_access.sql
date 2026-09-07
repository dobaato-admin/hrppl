-- X-07, and the thing found under it: NO LEARNER COULD SEE A QUIZ QUESTION.
--
-- ---------------------------------------------------------------------------
-- What actually broke, and how it hid
-- ---------------------------------------------------------------------------
--
-- `20260609033335` deliberately built `training_quiz_questions_public` as a
-- SECURITY DEFINER view (`security_invoker = off`) and said so in its header:
-- the learner's SELECT policy on the base table had just been dropped so that
-- nobody taking a quiz could read `correct_index`, and the view was to be the
-- learner's only read path, enforcing tenant + enrollment scope in its own
-- WHERE clause.
--
-- `20260609120840` then logged that definer view in `security_findings_log`
-- as `SECURITY_DEFINER_VIEW_quiz_public … accepted_risk`. The trade had been
-- made, in writing.
--
-- Four days later `20260613143222` — "Fix Security Definer view" — ran
--
--     ALTER VIEW public.training_quiz_questions_public SET (security_invoker = on);
--
-- to clear the linter warning that had already been accepted. Under
-- `security_invoker = on` the view has no privileges of its own: the caller's
-- RLS on the base table decides, and the caller is an employee with no SELECT
-- policy there. The view's entire enrolled-learner branch became dead code.
--
-- Verified against this database on 2026-09-06 with a real JWT (never as
-- `postgres`, which bypasses RLS): an employee enrolled in a course with one
-- question read **0 rows** from both the view and the table.
--
-- The symptom is not an error. `listQuestions` returns `{ questions: [] }` and
-- the quiz dialog renders "No quiz questions have been set for this course
-- yet." with Submit disabled — and since `/me/training` deliberately disables
-- the "Completed" option ("Completed (via quiz)"), **no employee could finish
-- any course.** The whole training module was inert for the people it exists
-- for, and it read as "not configured yet". Nothing in the demo data had a
-- quiz question, so nothing ever contradicted that.
--
-- Restoring `security_invoker = off` is the fix, not a regression: the view
-- omits `correct_index` and `explanation` and carries its own tenant and
-- enrollment predicates, which is exactly why the definer form was chosen.
-- `tests/training-access.test.ts` now fails if anyone flips it back.
--
-- ---------------------------------------------------------------------------
-- X-07 proper: the nav admits hr and branch_admin; the policies did not
-- ---------------------------------------------------------------------------
--
-- `20260613140528` gave `hr` manage rights over `training_courses` and
-- `training_enrollments`, and `branch_admin` read rights, but never revisited
-- `training_quiz_questions`, `training_quiz_attempts` or `certifications`.
-- So HR could assign a course and not author its quiz; could open
-- /org/training and see an empty "Expiring certs" tab, because HR had no read
-- policy on `certifications` at all. Empty, again — not refused.
--
-- Direction chosen: **widen for hr, stay read-only for branch_admin.** HR
-- already administers courses and enrollments by an explicit earlier decision;
-- the quiz and certificate halves were an oversight, not a boundary. Every
-- branch_admin policy written in `20260613140528` is a SELECT, so that is the
-- shape kept here. `org.trainingManage` in `src/lib/rbac.ts` is the matching
-- client-side key, and the server fns now assert it before Postgres has to.

-- ---------------------------------------------------------------------------
-- 1) The learner read path
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS public.training_quiz_questions_public;

CREATE VIEW public.training_quiz_questions_public
-- SECURITY DEFINER **on purpose**. See the header: the base table denies
-- learners by design so they cannot read the answers, and this view is their
-- only read path. Setting `security_invoker = on` to satisfy a linter hands
-- enforcement back to that deny and silently empties every quiz.
WITH (security_invoker = off) AS
SELECT q.id, q.tenant_id, q.course_id, q.sort_order, q.question, q.choices,
       q.points, q.created_at, q.updated_at
FROM public.training_quiz_questions q
WHERE
  -- Staff who administer training in this tenant. hr and branch_admin are new
  -- here; both see question text only, never `correct_index`.
  (
    q.tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.is_hr(auth.uid(), q.tenant_id)
      OR public.is_branch_admin(auth.uid(), q.tenant_id)
    )
  )
  OR
  -- Employees actively enrolled in the course (same tenant).
  (
    q.tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.training_enrollments en
      JOIN public.employees e ON e.id = en.employee_id
      WHERE en.course_id = q.course_id
        AND e.user_id = auth.uid()
        AND en.status IN ('assigned'::training_enrollment_status,
                          'in_progress'::training_enrollment_status)
    )
  );

-- anon is deliberately not granted: every branch above needs an auth.uid().
REVOKE ALL ON public.training_quiz_questions_public FROM anon;
GRANT SELECT ON public.training_quiz_questions_public TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2) hr authors quizzes
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "hr manages tenant training_quiz_questions" ON public.training_quiz_questions;
CREATE POLICY "hr manages tenant training_quiz_questions" ON public.training_quiz_questions
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

-- ---------------------------------------------------------------------------
-- 3) hr and branch_admin see attempt history
-- ---------------------------------------------------------------------------
--
-- Reviewing who passed is the point of the roster. branch_admin is scoped to
-- their own branches, exactly as `branch admin reads branch training_enrollments`
-- already is; hr is tenant-wide, as everywhere else.

DROP POLICY IF EXISTS "read own or manager attempts" ON public.training_quiz_attempts;
CREATE POLICY "read own or manager attempts" ON public.training_quiz_attempts
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      user_id = auth.uid()
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR public.is_hr(auth.uid(), tenant_id)
      OR (
        public.is_branch_admin(auth.uid(), tenant_id)
        AND EXISTS (
          SELECT 1 FROM public.employees e
          WHERE e.id = training_quiz_attempts.employee_id
            AND public.has_branch_access(auth.uid(), e.branch_id)
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 4) certifications: hr manages, branch_admin reads its own branches
-- ---------------------------------------------------------------------------
--
-- Until now hr had no policy here whatsoever, so /org/training's "Expiring
-- certs" tab was permanently empty for the role that chases renewals.

DROP POLICY IF EXISTS "hr manages tenant certifications" ON public.certifications;
CREATE POLICY "hr manages tenant certifications" ON public.certifications
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

DROP POLICY IF EXISTS "branch admin reads branch certifications" ON public.certifications;
CREATE POLICY "branch admin reads branch certifications" ON public.certifications
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = certifications.employee_id
        AND public.has_branch_access(auth.uid(), e.branch_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 5) Re-affirm the accepted risk, so the next linter sweep does not re-open it
-- ---------------------------------------------------------------------------

UPDATE public.security_findings_log
   SET status = 'accepted_risk',
       remediation = 'Deliberate SECURITY DEFINER view. It is the ONLY read path for '
            || 'learners, who are denied on the base table so they cannot read '
            || 'correct_index. Flipping it to security_invoker=on (as '
            || '20260613143222 did) empties every quiz for every employee and '
            || 'silently blocks course completion. Restored 20260906090000; '
            || 'pinned by tests/training-access.test.ts.',
       updated_at = now()
 WHERE internal_id = 'SECURITY_DEFINER_VIEW_quiz_public';
