
-- ============ PUBLIC HOLIDAYS ============
CREATE TABLE IF NOT EXISTS public.public_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  holiday_date date NOT NULL,
  name text NOT NULL,
  is_paid boolean NOT NULL DEFAULT true,
  is_recurring boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, holiday_date, name)
);
CREATE INDEX IF NOT EXISTS idx_public_holidays_country_date
  ON public.public_holidays(country_code, holiday_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_holidays TO authenticated;
GRANT ALL ON public.public_holidays TO service_role;

ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin all holidays" ON public.public_holidays
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "regional admin manages scoped holidays" ON public.public_holidays
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code))
  WITH CHECK (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code));

CREATE POLICY "org reads own country holidays" ON public.public_holidays
  FOR SELECT TO authenticated
  USING (country_code IN (SELECT t.country_code FROM public.tenants t WHERE t.id = user_tenant_id(auth.uid())));

CREATE TRIGGER trg_public_holidays_updated_at BEFORE UPDATE ON public.public_holidays
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ OVERTIME / PENALTY RATES ============
CREATE TABLE IF NOT EXISTS public.overtime_penalty_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  applies_to text NOT NULL CHECK (applies_to IN ('overtime','penalty')),
  rate_multiplier numeric(6,3) NOT NULL CHECK (rate_multiplier >= 0),
  description text,
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, code, effective_from)
);
CREATE INDEX IF NOT EXISTS idx_otp_country
  ON public.overtime_penalty_rates(country_code, applies_to, effective_from);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.overtime_penalty_rates TO authenticated;
GRANT ALL ON public.overtime_penalty_rates TO service_role;

ALTER TABLE public.overtime_penalty_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin all otp rates" ON public.overtime_penalty_rates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "regional admin manages scoped otp rates" ON public.overtime_penalty_rates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code))
  WITH CHECK (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code));

CREATE POLICY "org reads own country otp rates" ON public.overtime_penalty_rates
  FOR SELECT TO authenticated
  USING (country_code IN (SELECT t.country_code FROM public.tenants t WHERE t.id = user_tenant_id(auth.uid())));

CREATE TRIGGER trg_otp_updated_at BEFORE UPDATE ON public.overtime_penalty_rates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ TAX BRACKETS — add regional_admin manage ============
DROP POLICY IF EXISTS "regional admin manages scoped tax brackets" ON public.tax_brackets;
CREATE POLICY "regional admin manages scoped tax brackets" ON public.tax_brackets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code))
  WITH CHECK (has_role(auth.uid(), 'regional_admin'::app_role) AND has_country_scope(auth.uid(), country_code));
