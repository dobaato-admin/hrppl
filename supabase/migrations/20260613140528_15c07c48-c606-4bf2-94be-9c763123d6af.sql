
-- PERFORMANCE_REVIEWS
CREATE POLICY "hr manages tenant performance_reviews" ON public.performance_reviews
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch performance_reviews" ON public.performance_reviews
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_reviews.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- PERFORMANCE_GOALS
CREATE POLICY "hr manages tenant performance_goals" ON public.performance_goals
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch performance_goals" ON public.performance_goals
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_goals.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- REVIEW_CYCLES / TEMPLATES / FEEDBACK
CREATE POLICY "hr manages tenant review_cycles" ON public.review_cycles
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant review_cycles" ON public.review_cycles
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant review_templates" ON public.review_templates
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant review_templates" ON public.review_templates
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant review_feedback" ON public.review_feedback
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant feedback_question_templates" ON public.feedback_question_templates
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));

-- TRAINING
CREATE POLICY "hr manages tenant training_courses" ON public.training_courses
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant training_courses" ON public.training_courses
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant training_enrollments" ON public.training_enrollments
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads branch training_enrollments" ON public.training_enrollments
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = training_enrollments.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- ONBOARDING
CREATE POLICY "hr manages tenant onboarding_checklists" ON public.onboarding_checklists
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant onboarding_checklists" ON public.onboarding_checklists
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant onboarding_assignments" ON public.onboarding_assignments
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads branch onboarding_assignments" ON public.onboarding_assignments
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = onboarding_assignments.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- ASSETS
CREATE POLICY "hr manages tenant assets" ON public.assets
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "finance manages tenant assets" ON public.assets
  FOR ALL TO authenticated USING (public.is_finance(auth.uid(), tenant_id)) WITH CHECK (public.is_finance(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant assets" ON public.assets
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant asset_assignments" ON public.asset_assignments
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "finance reads tenant asset_assignments" ON public.asset_assignments
  FOR SELECT TO authenticated USING (public.is_finance(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads branch asset_assignments" ON public.asset_assignments
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = asset_assignments.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- RECRUITMENT
CREATE POLICY "hr manages tenant recruitment_jobs" ON public.recruitment_jobs
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant recruitment_jobs" ON public.recruitment_jobs
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant recruitment_candidates" ON public.recruitment_candidates
  FOR ALL TO authenticated USING (public.is_hr(auth.uid(), tenant_id)) WITH CHECK (public.is_hr(auth.uid(), tenant_id));
CREATE POLICY "branch admin reads tenant recruitment_candidates" ON public.recruitment_candidates
  FOR SELECT TO authenticated USING (public.is_branch_admin(auth.uid(), tenant_id));
