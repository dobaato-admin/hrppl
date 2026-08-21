
-- 1) Remove csv_export_jobs from the Realtime publication so result_csv payloads are not broadcast.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'csv_export_jobs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.csv_export_jobs';
  END IF;
END$$;

-- 2) Block anonymous uploads to the candidate-resumes bucket. Public applicants
-- must obtain a one-time signed upload URL via the createResumeUploadUrl server fn.
DROP POLICY IF EXISTS "candidate_resumes anon no insert" ON storage.objects;
CREATE POLICY "candidate_resumes anon no insert"
  ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id <> 'candidate-resumes');

-- 3) Hide biometric device credentials from the Data API. Service-role server
-- code (webhook ingest, rotateDeviceSecret) keeps full access.
REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM authenticated;
REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM anon;

-- 4) Re-assert that the plaintext blog webhook secret is not readable through PostgREST.
REVOKE SELECT (secret), INSERT (secret), UPDATE (secret) ON public.blog_webhooks FROM authenticated;
REVOKE SELECT (secret), INSERT (secret), UPDATE (secret) ON public.blog_webhooks FROM anon;
