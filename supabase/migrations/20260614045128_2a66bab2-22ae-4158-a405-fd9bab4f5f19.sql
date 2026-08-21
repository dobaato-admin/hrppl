
-- 1) event_access_log: remove authenticated insert; only service_role writes.
DROP POLICY IF EXISTS "authenticated inserts own access log" ON public.event_access_log;

CREATE POLICY "service role inserts access log"
  ON public.event_access_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2) suppressed_emails: super_admin can read.
CREATE POLICY "super admin reads suppressed emails"
  ON public.suppressed_emails
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

GRANT SELECT ON public.suppressed_emails TO authenticated;

-- 3) Lock down SECURITY DEFINER trigger function from direct public/anon execution.
REVOKE EXECUTE ON FUNCTION public.tg_sync_employee_current_pay_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_sync_employee_current_pay_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.tg_sync_employee_current_pay_change() FROM authenticated;
