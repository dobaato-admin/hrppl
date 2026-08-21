
-- Restrict org_admin audit_log reads to their own tenant via metadata.tenant_id
DROP POLICY IF EXISTS "org admin reads tenant audit" ON public.audit_log;
CREATE POLICY "org admin reads tenant audit"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'org_admin'::app_role)
  AND (metadata->>'tenant_id')::uuid = public.user_tenant_id(auth.uid())
);

-- Tighten storage read policy: require matching row in employee_documents with visibility='employee'
DROP POLICY IF EXISTS "employee reads own bucket files" ON storage.objects;
CREATE POLICY "employee reads own bucket files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents'
  AND EXISTS (
    SELECT 1
    FROM public.employee_documents d
    JOIN public.employees e ON e.id = d.employee_id
    WHERE e.user_id = auth.uid()
      AND d.file_path = storage.objects.name
      AND d.visibility = 'employee'
  )
);
