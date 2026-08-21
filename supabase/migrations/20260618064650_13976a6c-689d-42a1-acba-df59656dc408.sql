
-- 1) Alert suppression rules: mute notifications for specific tenants/alert types without disabling retries
CREATE TABLE public.billing_alert_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  alert_type text,
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alert_suppr_lookup ON public.billing_alert_suppressions(tenant_id, alert_type, expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_alert_suppressions TO authenticated;
GRANT ALL ON public.billing_alert_suppressions TO service_role;
ALTER TABLE public.billing_alert_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage suppressions" ON public.billing_alert_suppressions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_alert_suppr_touch BEFORE UPDATE ON public.billing_alert_suppressions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Auto-retry policy per alert type
CREATE TABLE public.billing_alert_retry_policies (
  alert_type text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  max_attempts int NOT NULL DEFAULT 3,
  backoff_seconds int NOT NULL DEFAULT 300,
  backoff_multiplier numeric NOT NULL DEFAULT 2.0,
  max_backoff_seconds int NOT NULL DEFAULT 86400,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_alert_retry_policies TO authenticated;
GRANT ALL ON public.billing_alert_retry_policies TO service_role;
ALTER TABLE public.billing_alert_retry_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage retry policies" ON public.billing_alert_retry_policies
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE TRIGGER trg_retry_pol_touch BEFORE UPDATE ON public.billing_alert_retry_policies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed sensible defaults (disabled until super admin turns them on)
INSERT INTO public.billing_alert_retry_policies(alert_type, enabled, max_attempts, backoff_seconds, backoff_multiplier, max_backoff_seconds) VALUES
  ('stripe_usage_report_failed', false, 5, 300, 2.0, 21600),
  ('monthly_billing_unhandled_error', false, 3, 600, 2.0, 21600),
  ('monthly_billing_partial_failure', false, 3, 600, 2.0, 21600),
  ('reconciliation_run_failed', false, 3, 600, 2.0, 21600),
  ('reconciliation_stripe_read_failed', false, 3, 600, 2.0, 21600),
  ('invoice_payment_failed', false, 3, 3600, 2.0, 86400)
ON CONFLICT (alert_type) DO NOTHING;

-- 3) Add suppression/auto-retry state to alerts
ALTER TABLE public.billing_admin_alerts
  ADD COLUMN IF NOT EXISTS suppressed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_retry_exhausted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_auto_retry_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_billing_alerts_next_retry ON public.billing_admin_alerts(next_retry_at)
  WHERE status <> 'resolved' AND auto_retry_exhausted = false AND next_retry_at IS NOT NULL;

-- 4) Frozen discrepancy snapshot data
ALTER TABLE public.billing_reconciliation_log
  ADD COLUMN IF NOT EXISTS snapshot_data jsonb;
