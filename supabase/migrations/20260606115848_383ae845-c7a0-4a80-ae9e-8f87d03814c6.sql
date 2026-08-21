DROP POLICY IF EXISTS "candidate_resumes anon upload" ON storage.objects;

CREATE POLICY "candidate_resumes anon upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'candidate-resumes'
  AND (storage.foldername(name))[1] = (
    SELECT tenant_id::text
    FROM public.recruitment_jobs
    WHERE id::text = (storage.foldername(name))[2]
      AND status = 'open'
  )
);