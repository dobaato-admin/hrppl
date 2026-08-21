
-- Plans catalog
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_monthly numeric(12,2) NOT NULL DEFAULT 0,
  price_annual numeric(12,2) NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'USD',
  employee_limit integer,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed-in reads active plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active = true OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "super admin manages plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_subscription_plans_updated BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Tenant subscriptions
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','past_due','cancelled');
CREATE TYPE public.billing_interval AS ENUM ('monthly','annual');

CREATE TABLE public.tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval public.billing_interval NOT NULL DEFAULT 'monthly',
  current_period_start date NOT NULL DEFAULT now()::date,
  current_period_end date NOT NULL DEFAULT (now() + interval '30 days')::date,
  trial_ends_at date,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tenant_subscriptions TO authenticated;
GRANT ALL ON public.tenant_subscriptions TO service_role;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read their subscription" ON public.tenant_subscriptions
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin')
    OR (has_role(auth.uid(),'regional_admin') AND EXISTS (
      SELECT 1 FROM public.tenants t WHERE t.id = tenant_subscriptions.tenant_id
        AND has_country_scope(auth.uid(), t.country_code))));

CREATE POLICY "super admin manages subscriptions" ON public.tenant_subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_tenant_subscriptions_updated BEFORE UPDATE ON public.tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed plans
INSERT INTO public.subscription_plans (code, name, description, price_monthly, price_annual, currency_code, employee_limit, features, sort_order) VALUES
  ('starter','Starter','Small teams getting started with HR & payroll',49,490,'USD',10,
    '["Up to 10 employees","Core HR records","Leave management","Basic payroll"]'::jsonb, 10),
  ('growth','Growth','Growing organizations that need full HR + payroll',149,1490,'USD',50,
    '["Up to 50 employees","Performance reviews","Onboarding workflows","Payroll with statutory contributions","Advanced reports"]'::jsonb, 20),
  ('scale','Scale','For larger orgs with multi-country needs',399,3990,'USD',NULL,
    '["Unlimited employees","Multi-country payroll","360 feedback","White-label","API access","Priority support"]'::jsonb, 30);

-- Backfill: give every existing tenant a trialing Starter subscription
INSERT INTO public.tenant_subscriptions (tenant_id, plan_id, status, billing_interval, current_period_start, current_period_end, trial_ends_at)
SELECT t.id, p.id, 'trialing', 'monthly', now()::date, (now() + interval '30 days')::date, (now() + interval '30 days')::date
FROM public.tenants t
CROSS JOIN public.subscription_plans p
WHERE p.code = 'starter'
ON CONFLICT (tenant_id) DO NOTHING;
