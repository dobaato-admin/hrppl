-- 1) Hide sensitive secret columns from the Data API for regular authenticated users.
--    Service role retains full access for HMAC signing / verification in server code.
REVOKE SELECT (secret) ON public.blog_webhooks FROM authenticated;
REVOKE SELECT (shared_secret, webhook_token) ON public.biometric_devices FROM authenticated;
-- (anon never had SELECT on these tables; nothing to revoke there.)

-- 2) Defense-in-depth on candidate-resumes bucket: explicitly DENY anon read/update/delete
--    via a RESTRICTIVE policy. Existing PERMISSIVE INSERT policy continues to allow uploads.
CREATE POLICY "candidate_resumes anon no read"
ON storage.objects AS RESTRICTIVE FOR SELECT TO anon
USING (bucket_id <> 'candidate-resumes');

CREATE POLICY "candidate_resumes anon no update"
ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon
USING (bucket_id <> 'candidate-resumes')
WITH CHECK (bucket_id <> 'candidate-resumes');

CREATE POLICY "candidate_resumes anon no delete"
ON storage.objects AS RESTRICTIVE FOR DELETE TO anon
USING (bucket_id <> 'candidate-resumes');

-- 3) Admin Security Findings log
CREATE TABLE public.security_findings_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  scanner_name text NOT NULL,
  internal_id text NOT NULL,
  title text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('error','warn','info')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','fixed','ignored','accepted_risk')),
  description text,
  remediation text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scanner_name, internal_id, scanned_at)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_findings_log TO authenticated;
GRANT ALL ON public.security_findings_log TO service_role;

ALTER TABLE public.security_findings_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage security log"
ON public.security_findings_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_security_findings_log_updated
BEFORE UPDATE ON public.security_findings_log
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4) Seed the log with the findings just remediated this turn.
INSERT INTO public.security_findings_log (scanner_name, internal_id, title, severity, status, description, remediation, resolved_at)
VALUES
  ('supabase_lov','SERVER_FN_MISSING_AUTH_expenses_signed_url','IDOR: getReceiptSignedUrl signs URL for any path','error','fixed',
    'getReceiptSignedUrl used admin client to sign arbitrary paths without verifying ownership.',
    'Added user-scoped ownership check via expense_lines/expense_claims before signing; admin client now only signs verified paths owned by the caller.', now()),
  ('supabase_lov','SERVER_FN_MISSING_AUTH_biometric_rotate','rotateDeviceSecret missing role check','error','fixed',
    'rotateDeviceSecret and upsertBiometricDevice/upsertMapping accepted any authenticated caller.',
    'Added org_admin/super_admin guard and tenant-scoped writes on all biometric admin server fns.', now()),
  ('supabase_lov','SERVER_FN_MISSING_AUTH_timeline_list','listEmployeesForAdmin exposed PII','error','fixed',
    'listEmployeesForAdmin returned full employee directory to any authenticated user; recordCustomEvent + linkEvents allowed timeline writes for any user.',
    'Added manager/org_admin/super_admin role guard to listEmployeesForAdmin, recordCustomEvent, and linkEvents.', now()),
  ('supabase_lov','SERVER_FN_MISSING_AUTH_expense_delete','deleteExpenseClaim missing ownership check','warn','fixed',
    'Relied on RLS alone with no server-side ownership/role assertion.',
    'Added explicit ownership/admin check before delete.', now()),
  ('supabase_lov','SERVER_FN_MISSING_AUTH_legacy_returnAsset','Legacy returnAsset missing ownership check','warn','fixed',
    'Legacy returnAsset allowed any authenticated user to confirm any asset return.',
    'Added employee-ownership guard matching reportReturn/confirmReturn pattern.', now()),
  ('supabase','EXPOSED_SENSITIVE_DATA_biometric_secrets','Biometric shared_secret/webhook_token readable by org_admins','warn','fixed',
    'shared_secret and webhook_token columns were SELECT-able by tenant org_admins via Data API.',
    'Revoked column-level SELECT for authenticated role; service-role only. Plaintext returned once at rotation through server fn.', now()),
  ('supabase','MISSING_RLS_PROTECTION_blog_webhook_secret','blog_webhooks.secret readable by super_admins','warn','fixed',
    'Webhook HMAC signing key was returned over Data API to super_admin reads.',
    'Revoked column-level SELECT on blog_webhooks.secret from authenticated; service-role only.', now()),
  ('supabase_lov','STORAGE_candidate_resumes_anon_hardening','Anonymous candidate resume bucket defense-in-depth','warn','fixed',
    'Anon role had implicit deny on read/update/delete via absence of policies; tightened with explicit RESTRICTIVE policies.',
    'Added RESTRICTIVE policies denying anon SELECT/UPDATE/DELETE on candidate-resumes bucket. INSERT still gated by existing tenant + open-job + filename-regex policy.', now()),
  ('supabase','SECURITY_DEFINER_VIEW_quiz_public','training_quiz_questions_public view (intentional)','warn','accepted_risk',
    'SECURITY DEFINER view hides correct_index/explanation from learners while enforcing tenant + active-enrollment scoping.',
    'Intentional design — documented in security memory.', now()),
  ('supabase','SECURITY_DEFINER_FUNCTIONS_rls_helpers','has_role / has_country_scope / user_tenant_id SECURITY DEFINER','warn','accepted_risk',
    'Required by RLS policies to avoid recursion. Standard Supabase RBAC pattern.',
    'Intentional design — these functions only read role membership and tenant id; cannot escalate privileges.', now());