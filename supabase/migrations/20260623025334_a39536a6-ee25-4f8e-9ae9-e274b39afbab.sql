
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS csv_export_retention_days int NOT NULL DEFAULT 7
  CHECK (csv_export_retention_days BETWEEN 1 AND 365);

ALTER TABLE public.csv_export_jobs
  ADD COLUMN IF NOT EXISTS attempt int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_job_id uuid REFERENCES public.csv_export_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_csv_export_jobs_expires_at
  ON public.csv_export_jobs(expires_at) WHERE result_csv IS NOT NULL;

-- Backfill expires_at for existing rows: created_at + tenant retention window.
UPDATE public.csv_export_jobs j
SET expires_at = j.created_at + (COALESCE(t.csv_export_retention_days, 7) || ' days')::interval
FROM public.tenants t
WHERE j.tenant_id = t.id AND j.expires_at IS NULL;

-- Purge function: clears CSV payload (and error text) after the file expires.
CREATE OR REPLACE FUNCTION public.purge_expired_csv_export_files()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  UPDATE public.csv_export_jobs
     SET result_csv = NULL
   WHERE result_csv IS NOT NULL
     AND expires_at IS NOT NULL
     AND expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- Schedule daily at 03:15 UTC. Safe to re-run: unschedule existing job first.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('purge-expired-csv-export-files')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-csv-export-files');
    PERFORM cron.schedule(
      'purge-expired-csv-export-files',
      '15 3 * * *',
      $cron$ SELECT public.purge_expired_csv_export_files(); $cron$
    );
  END IF;
END $$;
