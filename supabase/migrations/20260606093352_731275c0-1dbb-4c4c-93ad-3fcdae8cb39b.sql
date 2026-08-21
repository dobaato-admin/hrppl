
-- ===== Workflow expansion on disciplinary_cases =====
ALTER TABLE public.disciplinary_cases
  DROP CONSTRAINT IF EXISTS disciplinary_cases_status_check;
ALTER TABLE public.disciplinary_cases
  ADD CONSTRAINT disciplinary_cases_status_check CHECK (
    status IN ('draft','open','investigation','hearing_scheduled','hearing_held',
               'decision_pending','decision_issued','appeal_open','under_review',
               'appealed','closed','withdrawn')
  );

ALTER TABLE public.disciplinary_cases
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS appeal_deadline date,
  ADD COLUMN IF NOT EXISTS confidential boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;

CREATE INDEX IF NOT EXISTS disciplinary_cases_assigned_idx ON public.disciplinary_cases(assigned_to);
CREATE INDEX IF NOT EXISTS disciplinary_cases_due_idx ON public.disciplinary_cases(due_date) WHERE status NOT IN ('closed','withdrawn');

-- ===== Approval workflow =====
CREATE TABLE IF NOT EXISTS public.disciplinary_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.disciplinary_cases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  approver_id uuid NOT NULL,
  approver_role text NOT NULL CHECK (approver_role IN ('manager','hr','legal','org_admin')),
  requested_by uuid NOT NULL,
  decision text CHECK (decision IN ('approved','rejected')),
  notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);
CREATE INDEX IF NOT EXISTS disciplinary_approvals_case_idx ON public.disciplinary_approvals(case_id);
CREATE INDEX IF NOT EXISTS disciplinary_approvals_approver_idx ON public.disciplinary_approvals(approver_id) WHERE decided_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinary_approvals TO authenticated;
GRANT ALL ON public.disciplinary_approvals TO service_role;
ALTER TABLE public.disciplinary_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage approvals" ON public.disciplinary_approvals FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Approver sees own pending" ON public.disciplinary_approvals FOR SELECT TO authenticated
USING (approver_id = auth.uid());

CREATE POLICY "Approver decides own" ON public.disciplinary_approvals FOR UPDATE TO authenticated
USING (approver_id = auth.uid())
WITH CHECK (approver_id = auth.uid());

-- ===== Attachments: disciplinary =====
CREATE TABLE IF NOT EXISTS public.disciplinary_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.disciplinary_cases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS disciplinary_attachments_case_idx ON public.disciplinary_attachments(case_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinary_attachments TO authenticated;
GRANT ALL ON public.disciplinary_attachments TO service_role;
ALTER TABLE public.disciplinary_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage case attachments" ON public.disciplinary_attachments FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Employee view own case attachments" ON public.disciplinary_attachments FOR SELECT TO authenticated
USING (
  case_id IN (
    SELECT c.id FROM public.disciplinary_cases c
    WHERE c.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- ===== Attachments: grievance =====
CREATE TABLE IF NOT EXISTS public.grievance_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS grievance_attachments_grievance_idx ON public.grievance_attachments(grievance_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grievance_attachments TO authenticated;
GRANT ALL ON public.grievance_attachments TO service_role;
ALTER TABLE public.grievance_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR manage grievance attachments" ON public.grievance_attachments FOR ALL TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
)
WITH CHECK (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "Filer view own grievance attachments" ON public.grievance_attachments FOR SELECT TO authenticated
USING (
  grievance_id IN (SELECT id FROM public.grievances WHERE filer_user_id = auth.uid())
);

CREATE POLICY "Filer add grievance attachments" ON public.grievance_attachments FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND grievance_id IN (SELECT id FROM public.grievances WHERE filer_user_id = auth.uid())
);

-- ===== Overdue alert tracking =====
CREATE TABLE IF NOT EXISTS public.disciplinary_overdue_state (
  case_id uuid PRIMARY KEY REFERENCES public.disciplinary_cases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  last_alert_date date,
  alert_count int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinary_overdue_state TO authenticated;
GRANT ALL ON public.disciplinary_overdue_state TO service_role;
ALTER TABLE public.disciplinary_overdue_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HR view overdue state" ON public.disciplinary_overdue_state FOR SELECT TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

-- ===== Storage RLS for disciplinary-files (path: tenant_id/...)
CREATE POLICY "HR read tenant disciplinary files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "HR write tenant disciplinary files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

CREATE POLICY "HR delete tenant disciplinary files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text
  AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
);

-- Employees can read files attached to their own cases (path layout: tenant/case_id/...)
CREATE POLICY "Employee read own case files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text FROM public.disciplinary_cases c
    WHERE c.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- Filers can read/write files attached to their own grievances (path: tenant/grievance/<id>/...)
CREATE POLICY "Filer read own grievance files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[2] = 'grievance'
  AND (storage.foldername(name))[3] IN (SELECT id::text FROM public.grievances WHERE filer_user_id = auth.uid())
);

CREATE POLICY "Filer write own grievance files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[2] = 'grievance'
  AND (storage.foldername(name))[3] IN (SELECT id::text FROM public.grievances WHERE filer_user_id = auth.uid())
);
