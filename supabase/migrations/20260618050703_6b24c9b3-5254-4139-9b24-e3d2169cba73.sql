
-- Extend subscription_plans with Stripe metadata
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS billing_basis text NOT NULL DEFAULT 'flat',
  ADD COLUMN IF NOT EXISTS is_addon boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_months integer NOT NULL DEFAULT 0;

-- Extend tenant_subscriptions with Stripe + DD config
ALTER TABLE public.tenant_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS base_subscription_item_id text,
  ADD COLUMN IF NOT EXISTS addon_subscription_item_id text,
  ADD COLUMN IF NOT EXISTS debit_regions text[] NOT NULL DEFAULT ARRAY['ach','becs','sepa','bacs']::text[],
  ADD COLUMN IF NOT EXISTS allow_card_fallback boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS trial_consumed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_reported_period date;

-- Monthly billing snapshots per tenant
CREATE TABLE IF NOT EXISTS public.tenant_billing_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_month int NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  net_employees int NOT NULL DEFAULT 0,
  joined_count int NOT NULL DEFAULT 0,
  left_count int NOT NULL DEFAULT 0,
  base_units int NOT NULL DEFAULT 0,
  addon_units int NOT NULL DEFAULT 0,
  base_amount_cents bigint NOT NULL DEFAULT 0,
  addon_amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  trial_applied boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  stripe_base_usage_id text,
  stripe_addon_usage_id text,
  error text,
  reported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_year, period_month)
);

GRANT SELECT ON public.tenant_billing_snapshots TO authenticated;
GRANT ALL ON public.tenant_billing_snapshots TO service_role;
ALTER TABLE public.tenant_billing_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read own billing snapshots"
  ON public.tenant_billing_snapshots FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE TRIGGER trg_billing_snapshots_updated
  BEFORE UPDATE ON public.tenant_billing_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Billing audit log (webhook + cron events)
CREATE TABLE IF NOT EXISTS public.billing_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  stripe_event_id text UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.billing_audit_log TO authenticated;
GRANT ALL ON public.billing_audit_log TO service_role;
ALTER TABLE public.billing_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin reads billing audit"
  ON public.billing_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Function: compute net active headcount for a tenant for a given month
CREATE OR REPLACE FUNCTION public.tenant_net_headcount(
  _tenant uuid,
  _year int,
  _month int
) RETURNS TABLE(net_employees int, joined_count int, left_count int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  period_start date := make_date(_year, _month, 1);
  period_end date := (make_date(_year, _month, 1) + interval '1 month - 1 day')::date;
BEGIN
  RETURN QUERY
  SELECT
    -- Active at end of month: hired on/before EOM, not terminated before EOM
    COUNT(*) FILTER (
      WHERE e.hire_date <= period_end
        AND (e.termination_date IS NULL OR e.termination_date > period_end)
    )::int AS net_employees,
    COUNT(*) FILTER (
      WHERE e.hire_date BETWEEN period_start AND period_end
    )::int AS joined_count,
    COUNT(*) FILTER (
      WHERE e.termination_date BETWEEN period_start AND period_end
    )::int AS left_count
  FROM public.employees e
  WHERE e.tenant_id = _tenant;
END;
$$;

-- Seed Stripe billing metadata onto the new plans
UPDATE public.subscription_plans
  SET billing_basis = 'net_active_employees_per_calendar_month',
      trial_months = 1
  WHERE code IN ('starter_v2','pro_v2');

UPDATE public.subscription_plans
  SET billing_basis = 'net_active_employees_per_calendar_month',
      is_addon = true
  WHERE code = 'au_payroll_addon';
