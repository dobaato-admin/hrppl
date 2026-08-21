
-- Fix: tg_block_modify_audit function search_path mutable
CREATE OR REPLACE FUNCTION public.tg_block_modify_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR session_user IN ('postgres','supabase_admin') THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  RAISE EXCEPTION 'Audit log rows are immutable';
END $function$;

-- Fix: csv_export_jobs result_csv exposure
-- Revoke direct SELECT on result_csv from authenticated users; downloads must go through server fns using admin client.
REVOKE SELECT (result_csv) ON public.csv_export_jobs FROM authenticated;
REVOKE SELECT (result_csv) ON public.csv_export_jobs FROM anon;

-- Fix: candidate_resumes anonymous upload path traversal
-- Remove broad anon INSERT policy; uploads will be performed using signed upload URLs minted by a server function after validating the job is open.
DROP POLICY IF EXISTS "candidate_resumes anon upload" ON storage.objects;
