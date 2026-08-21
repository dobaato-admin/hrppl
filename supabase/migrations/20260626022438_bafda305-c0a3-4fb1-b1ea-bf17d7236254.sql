
-- Revoke direct client read access to sensitive columns.
-- Reads must go through server functions using the admin client.

REVOKE SELECT (result_csv) ON public.csv_export_jobs FROM anon, authenticated;

REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM anon, authenticated;

REVOKE SELECT (secret) ON public.blog_webhooks FROM anon, authenticated;

-- Lock down candidate-resumes bucket: only server-issued signed upload URLs may write.
-- Authenticated users must NOT be able to INSERT/UPDATE/DELETE directly into this bucket.
DROP POLICY IF EXISTS "candidate_resumes authenticated no direct insert" ON storage.objects;
CREATE POLICY "candidate_resumes authenticated no direct insert"
  ON storage.objects AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id <> 'candidate-resumes');

DROP POLICY IF EXISTS "candidate_resumes authenticated no direct update" ON storage.objects;
CREATE POLICY "candidate_resumes authenticated no direct update"
  ON storage.objects AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (bucket_id <> 'candidate-resumes')
  WITH CHECK (bucket_id <> 'candidate-resumes');

DROP POLICY IF EXISTS "candidate_resumes authenticated no direct delete" ON storage.objects;
CREATE POLICY "candidate_resumes authenticated no direct delete"
  ON storage.objects AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (bucket_id <> 'candidate-resumes');
