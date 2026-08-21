
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_title_trgm
  ON public.in_app_notifications USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_body_trgm
  ON public.in_app_notifications USING gin (body gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_link_trgm
  ON public.in_app_notifications USING gin (link gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_kind_trgm
  ON public.in_app_notifications USING gin (kind gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_csv_export_jobs_parent
  ON public.csv_export_jobs(parent_job_id) WHERE parent_job_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'csv_export_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.csv_export_jobs;
  END IF;
END $$;

ALTER TABLE public.csv_export_jobs REPLICA IDENTITY FULL;
