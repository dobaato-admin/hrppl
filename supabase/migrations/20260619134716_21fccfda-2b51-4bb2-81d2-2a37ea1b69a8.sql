
DROP POLICY IF EXISTS "employee uploads own bucket files" ON storage.objects;

CREATE POLICY "employee uploads own bucket files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'employee-documents'
  AND array_length(storage.foldername(objects.name), 1) >= 3
  AND COALESCE((storage.foldername(objects.name))[3], '') <> ''
  AND position('..' in objects.name) = 0
  AND EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.user_id = auth.uid()
      AND (e.id)::text = (storage.foldername(objects.name))[2]
      AND (e.tenant_id)::text = (storage.foldername(objects.name))[1]
  )
);

DROP POLICY IF EXISTS "Employees read own non-confidential medical files" ON storage.objects;

CREATE POLICY "Employees read own non-confidential medical files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-files'
  AND EXISTS (
    SELECT 1
    FROM public.medical_attachments a
    JOIN public.medical_incidents mi ON mi.id = a.incident_id
    JOIN public.employees e ON e.id = mi.employee_id
    WHERE a.storage_path = objects.name
      AND e.user_id = auth.uid()
      AND mi.confidential = false
  )
);
