
-- 1) Background CSV export jobs
CREATE TABLE IF NOT EXISTS public.csv_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  job_type text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed')),
  progress int NOT NULL DEFAULT 0,
  row_count int,
  truncated boolean NOT NULL DEFAULT false,
  result_csv text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.csv_export_jobs TO authenticated;
GRANT ALL ON public.csv_export_jobs TO service_role;
ALTER TABLE public.csv_export_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own export jobs"
  ON public.csv_export_jobs FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Users create their own export jobs"
  ON public.csv_export_jobs FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users update their own export jobs"
  ON public.csv_export_jobs FOR UPDATE TO authenticated
  USING (requested_by = auth.uid()) WITH CHECK (requested_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_csv_export_jobs_user ON public.csv_export_jobs(requested_by, created_at DESC);

-- 2) Augment retention policies with last-run status fields
ALTER TABLE public.audit_retention_policies
  ADD COLUMN IF NOT EXISTS last_run_status text,
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_run_error text,
  ADD COLUMN IF NOT EXISTS last_archived_count int,
  ADD COLUMN IF NOT EXISTS last_deleted_count int;
