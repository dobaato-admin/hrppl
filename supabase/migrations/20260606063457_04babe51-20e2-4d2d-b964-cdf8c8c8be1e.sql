
-- Enums
DO $$ BEGIN
  CREATE TYPE public.training_enrollment_status AS ENUM ('assigned','in_progress','completed','expired','waived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Courses
CREATE TABLE public.training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  provider text,
  category text,
  duration_hours numeric(6,2),
  is_mandatory boolean NOT NULL DEFAULT false,
  validity_months integer,
  external_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_courses TO authenticated;
GRANT ALL ON public.training_courses TO service_role;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant read courses" ON public.training_courses FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "admin manage courses" ON public.training_courses FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));

CREATE TRIGGER trg_training_courses_updated BEFORE UPDATE ON public.training_courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enrollments
CREATE TABLE public.training_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  status public.training_enrollment_status NOT NULL DEFAULT 'assigned',
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_date date,
  started_at timestamptz,
  completed_at timestamptz,
  score numeric(6,2),
  certificate_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, employee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_enrollments TO authenticated;
GRANT ALL ON public.training_enrollments TO service_role;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee read own enrollments" ON public.training_enrollments FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (
    EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
  ));
CREATE POLICY "admin manage enrollments" ON public.training_enrollments FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "employee update own enrollment progress" ON public.training_enrollments FOR UPDATE TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE TRIGGER trg_training_enrollments_updated BEFORE UPDATE ON public.training_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_enroll_emp ON public.training_enrollments(employee_id, status);
CREATE INDEX idx_enroll_course ON public.training_enrollments(course_id);

-- Certifications
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  name text NOT NULL,
  issuer text,
  credential_id text,
  issued_on date,
  expires_on date,
  file_url text,
  source_course_id uuid REFERENCES public.training_courses(id) ON DELETE SET NULL,
  source_enrollment_id uuid REFERENCES public.training_enrollments(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read certs in tenant"  ON public.certifications FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (
    EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')
  ));
CREATE POLICY "admin manage certs" ON public.certifications FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "employee manage own certs" ON public.certifications FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE TRIGGER trg_certs_updated BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_certs_emp ON public.certifications(employee_id);
CREATE INDEX idx_certs_expires ON public.certifications(expires_on);
