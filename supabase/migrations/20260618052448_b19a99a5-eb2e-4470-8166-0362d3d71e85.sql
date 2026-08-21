
-- 1) Admin alerts for billing failures
CREATE TABLE public.billing_admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'error',
  title text NOT NULL,
  message text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open',
  retry_count int NOT NULL DEFAULT 0,
  last_retry_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.billing_admin_alerts TO authenticated;
GRANT ALL ON public.billing_admin_alerts TO service_role;
ALTER TABLE public.billing_admin_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin manages billing alerts" ON public.billing_admin_alerts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE INDEX idx_billing_alerts_status ON public.billing_admin_alerts(status, created_at DESC);
CREATE INDEX idx_billing_alerts_tenant ON public.billing_admin_alerts(tenant_id);
CREATE TRIGGER trg_billing_admin_alerts_updated
  BEFORE UPDATE ON public.billing_admin_alerts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Tenant invoices (mirrored from Stripe webhooks)
CREATE TABLE public.tenant_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_invoice_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL,
  amount_due bigint NOT NULL DEFAULT 0,
  amount_paid bigint NOT NULL DEFAULT 0,
  currency text,
  hosted_invoice_url text,
  invoice_pdf text,
  period_start date,
  period_end date,
  attempt_count int NOT NULL DEFAULT 0,
  last_payment_error text,
  invoice_created_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenant_invoices TO authenticated;
GRANT ALL ON public.tenant_invoices TO service_role;
ALTER TABLE public.tenant_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant members read invoices" ON public.tenant_invoices
  FOR SELECT TO authenticated
  USING (
    tenant_id = user_tenant_id(auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
CREATE INDEX idx_tenant_invoices_tenant ON public.tenant_invoices(tenant_id, invoice_created_at DESC);
CREATE INDEX idx_tenant_invoices_status ON public.tenant_invoices(status);
CREATE TRIGGER trg_tenant_invoices_updated
  BEFORE UPDATE ON public.tenant_invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) Reconciliation log
CREATE TABLE public.billing_reconciliation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_month int NOT NULL,
  computed_base int NOT NULL DEFAULT 0,
  reported_base int NOT NULL DEFAULT 0,
  computed_addon int NOT NULL DEFAULT 0,
  reported_addon int NOT NULL DEFAULT 0,
  base_delta int NOT NULL DEFAULT 0,
  addon_delta int NOT NULL DEFAULT 0,
  has_discrepancy boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.billing_reconciliation_log TO authenticated;
GRANT ALL ON public.billing_reconciliation_log TO service_role;
ALTER TABLE public.billing_reconciliation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin reads reconciliation" ON public.billing_reconciliation_log
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE INDEX idx_reconciliation_period ON public.billing_reconciliation_log(period_year, period_month);
CREATE INDEX idx_reconciliation_tenant ON public.billing_reconciliation_log(tenant_id);

-- 4) Plan change + mandate tracking on tenant_subscriptions
ALTER TABLE public.tenant_subscriptions
  ADD COLUMN IF NOT EXISTS pending_plan_id uuid REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS plan_change_effective date,
  ADD COLUMN IF NOT EXISTS prior_plan_id uuid REFERENCES public.subscription_plans(id),
  ADD COLUMN IF NOT EXISTS plan_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS mandate_status text,
  ADD COLUMN IF NOT EXISTS mandate_payment_method_id text,
  ADD COLUMN IF NOT EXISTS mandate_last_checked_at timestamptz;

-- 5) Proration metadata on snapshots
ALTER TABLE public.tenant_billing_snapshots
  ADD COLUMN IF NOT EXISTS plan_change_prorated jsonb,
  ADD COLUMN IF NOT EXISTS reconciled_at timestamptz,
  ADD COLUMN IF NOT EXISTS reconciliation_delta int;

-- 6) Helper: proration headcount across mid-month plan change.
-- Returns days_in_period, days_on_prior_plan, days_on_new_plan.
CREATE OR REPLACE FUNCTION public.tenant_plan_change_days(
  _period_year int, _period_month int, _change_date date
) RETURNS TABLE(days_total int, days_prior int, days_new int)
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  period_start date := make_date(_period_year, _period_month, 1);
  period_end date := (make_date(_period_year, _period_month, 1) + INTERVAL '1 month - 1 day')::date;
  total int := (period_end - period_start) + 1;
  prior int := 0;
  newd int := 0;
BEGIN
  IF _change_date IS NULL OR _change_date <= period_start THEN
    days_total := total; days_prior := 0; days_new := total;
    RETURN NEXT; RETURN;
  END IF;
  IF _change_date > period_end THEN
    days_total := total; days_prior := total; days_new := 0;
    RETURN NEXT; RETURN;
  END IF;
  prior := (_change_date - period_start);
  newd := total - prior;
  days_total := total; days_prior := prior; days_new := newd;
  RETURN NEXT;
END;
$$;
