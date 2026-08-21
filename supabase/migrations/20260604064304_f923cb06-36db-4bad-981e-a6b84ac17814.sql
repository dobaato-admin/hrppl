
-- onboarding_checklists
CREATE TABLE public.onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_checklists TO authenticated;
GRANT ALL ON public.onboarding_checklists TO service_role;
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org reads tenant checklists" ON public.onboarding_checklists FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant checklists" ON public.onboarding_checklists FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "super admin all checklists" ON public.onboarding_checklists FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER onboarding_checklists_touch BEFORE UPDATE ON public.onboarding_checklists FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- onboarding_progress
CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  checklist_id uuid NOT NULL,
  item_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  completed_by uuid,
  UNIQUE (employee_id, checklist_id, item_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_progress TO authenticated;
GRANT ALL ON public.onboarding_progress TO service_role;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee manages own progress" ON public.onboarding_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = onboarding_progress.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = onboarding_progress.employee_id AND e.user_id = auth.uid() AND e.tenant_id = onboarding_progress.tenant_id));
CREATE POLICY "manager reads tenant progress" ON public.onboarding_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant progress" ON public.onboarding_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "super admin all progress" ON public.onboarding_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- employee_documents
CREATE TABLE public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  doc_type text NOT NULL DEFAULT 'other',
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  visibility text NOT NULL DEFAULT 'employee',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_documents TO authenticated;
GRANT ALL ON public.employee_documents TO service_role;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee reads own visible docs" ON public.employee_documents FOR SELECT TO authenticated
  USING (visibility IN ('employee','manager','admin') AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_documents.employee_id AND e.user_id = auth.uid()) AND visibility <> 'admin');
CREATE POLICY "employee uploads own docs" ON public.employee_documents FOR INSERT TO authenticated
  WITH CHECK (visibility = 'employee' AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_documents.employee_id AND e.user_id = auth.uid() AND e.tenant_id = employee_documents.tenant_id));
CREATE POLICY "employee deletes own employee-visible docs" ON public.employee_documents FOR DELETE TO authenticated
  USING (visibility = 'employee' AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_documents.employee_id AND e.user_id = auth.uid()));
CREATE POLICY "manager reads tenant docs" ON public.employee_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()) AND visibility IN ('manager','employee'));
CREATE POLICY "org admin manages tenant docs" ON public.employee_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "super admin all docs" ON public.employee_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER employee_documents_touch BEFORE UPDATE ON public.employee_documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX employee_documents_emp_idx ON public.employee_documents (employee_id);

-- storage.objects policies for employee-documents bucket (path layout: {tenant_id}/{employee_id}/...)
CREATE POLICY "employee reads own bucket files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'employee-documents' AND EXISTS (
    SELECT 1 FROM public.employees e WHERE e.user_id = auth.uid() AND e.id::text = (storage.foldername(name))[2]
  ));
CREATE POLICY "employee uploads own bucket files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'employee-documents' AND EXISTS (
    SELECT 1 FROM public.employees e WHERE e.user_id = auth.uid() AND e.id::text = (storage.foldername(name))[2] AND e.tenant_id::text = (storage.foldername(name))[1]
  ));
CREATE POLICY "employee deletes own bucket files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'employee-documents' AND EXISTS (
    SELECT 1 FROM public.employees e WHERE e.user_id = auth.uid() AND e.id::text = (storage.foldername(name))[2]
  ));
CREATE POLICY "manager reads tenant bucket files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'employee-documents' AND public.has_role(auth.uid(),'manager') AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text);
CREATE POLICY "org admin manages tenant bucket files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'employee-documents' AND public.has_role(auth.uid(),'org_admin') AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text)
  WITH CHECK (bucket_id = 'employee-documents' AND public.has_role(auth.uid(),'org_admin') AND (storage.foldername(name))[1] = public.user_tenant_id(auth.uid())::text);
CREATE POLICY "super admin all bucket files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'employee-documents' AND public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (bucket_id = 'employee-documents' AND public.has_role(auth.uid(),'super_admin'));
