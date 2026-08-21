-- A3: rename jobs -> client_jobs, keep `jobs` as a view alias for one release
ALTER TABLE public.jobs RENAME TO client_jobs;

-- Recreate grants explicitly on the renamed table (privileges are preserved by RENAME, but be explicit)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_jobs TO authenticated;
GRANT ALL ON public.client_jobs TO service_role;

-- Backward-compatible view (read/write) so any lingering code keeps working
CREATE OR REPLACE VIEW public.jobs AS SELECT * FROM public.client_jobs;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
COMMENT ON VIEW public.jobs IS 'DEPRECATED alias for public.client_jobs (A3 rename). Remove after all callers migrate.';