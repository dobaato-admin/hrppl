-- Add pass_score percentage to courses
ALTER TABLE public.training_courses
  ADD COLUMN IF NOT EXISTS pass_score numeric(5,2) NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS max_attempts integer;

-- Quiz questions per course
CREATE TABLE IF NOT EXISTS public.training_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  choices jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index integer NOT NULL DEFAULT 0,
  points numeric(6,2) NOT NULL DEFAULT 1,
  explanation text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_quiz_questions TO authenticated;
GRANT ALL ON public.training_quiz_questions TO service_role;
ALTER TABLE public.training_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant read questions" ON public.training_quiz_questions
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "managers manage questions" ON public.training_quiz_questions
  FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));

CREATE TRIGGER trg_tqq_updated BEFORE UPDATE ON public.training_quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_tqq_course ON public.training_quiz_questions(course_id, sort_order);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.training_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  enrollment_id uuid NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id uuid,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score numeric(5,2) NOT NULL DEFAULT 0,
  max_score numeric(6,2) NOT NULL DEFAULT 0,
  percentage numeric(5,2) NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  attempt_number integer NOT NULL DEFAULT 1,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_quiz_attempts TO authenticated;
GRANT ALL ON public.training_quiz_attempts TO service_role;
ALTER TABLE public.training_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant read attempts" ON public.training_quiz_attempts
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "employee insert own attempt" ON public.training_quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (user_id = auth.uid()
      OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "managers delete attempts" ON public.training_quiz_attempts
  FOR DELETE TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')));

CREATE INDEX IF NOT EXISTS idx_tqa_enroll ON public.training_quiz_attempts(enrollment_id, attempt_number);
CREATE INDEX IF NOT EXISTS idx_tqa_emp ON public.training_quiz_attempts(employee_id);
