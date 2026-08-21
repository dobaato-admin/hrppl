-- Fix audit_log: remove manager from broad cross-tenant read policy
DROP POLICY IF EXISTS "org admin reads tenant audit" ON public.audit_log;
CREATE POLICY "org admin reads tenant audit" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'org_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Fix storage policy: enforce employee_documents visibility at storage layer too
DROP POLICY IF EXISTS "manager reads tenant bucket files" ON storage.objects;
CREATE POLICY "manager reads tenant bucket files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'employee-documents'
    AND has_role(auth.uid(), 'manager'::app_role)
    AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
    AND EXISTS (
      SELECT 1 FROM public.employee_documents d
      WHERE d.file_path = storage.objects.name
        AND d.tenant_id = user_tenant_id(auth.uid())
        AND d.visibility = ANY (ARRAY['manager','employee'])
    )
  );