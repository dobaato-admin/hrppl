CREATE POLICY "medical_files_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-files'
    AND (
      public.is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
      OR public.is_hr(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "medical_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medical-files'
    AND (
      public.is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
      OR public.is_hr(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "medical_files_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medical-files'
    AND (
      public.is_org_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
      OR public.is_hr(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  );