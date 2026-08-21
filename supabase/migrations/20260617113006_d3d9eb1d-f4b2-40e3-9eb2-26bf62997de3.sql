CREATE POLICY "hr reads tenant bucket files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'employee-documents'
  AND has_role(auth.uid(), 'hr'::app_role)
  AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
  AND EXISTS (
    SELECT 1 FROM public.employee_documents d
    WHERE d.file_path = storage.objects.name
      AND d.tenant_id = user_tenant_id(auth.uid())
  )
);