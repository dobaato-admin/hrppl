
CREATE TYPE public.pay_frequency AS ENUM ('weekly', 'biweekly', 'semimonthly', 'monthly');

-- Per-country payroll defaults
CREATE TABLE public.country_payroll_settings (
  country_code text PRIMARY KEY REFERENCES public.countries(code) ON DELETE CASCADE,
  pay_frequency public.pay_frequency NOT NULL DEFAULT 'monthly',
  workweek_hours numeric(5,2) NOT NULL DEFAULT 40,
  overtime_multiplier numeric(5,2) NOT NULL DEFAULT 1.5,
  fiscal_year_start_month smallint NOT NULL DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  rounding_mode text NOT NULL DEFAULT 'half_up',
  rounding_decimals smallint NOT NULL DEFAULT 2 CHECK (rounding_decimals BETWEEN 0 AND 6),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_payroll_settings TO authenticated;
GRANT ALL ON public.country_payroll_settings TO service_role;
ALTER TABLE public.country_payroll_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cps_updated_at BEFORE UPDATE ON public.country_payroll_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Progressive income tax brackets
CREATE TABLE public.tax_brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  name text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  bracket_order smallint NOT NULL,
  min_income numeric(14,2) NOT NULL DEFAULT 0,
  max_income numeric(14,2),
  rate_percent numeric(6,3) NOT NULL,
  fixed_amount numeric(14,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (max_income IS NULL OR max_income > min_income),
  CHECK (rate_percent >= 0 AND rate_percent <= 100)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_brackets TO authenticated;
GRANT ALL ON public.tax_brackets TO service_role;
ALTER TABLE public.tax_brackets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tb_updated_at BEFORE UPDATE ON public.tax_brackets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_tax_brackets_country ON public.tax_brackets(country_code, effective_from);

-- Statutory contributions
CREATE TABLE public.contribution_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  name text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  employee_rate_percent numeric(6,3) NOT NULL DEFAULT 0,
  employer_rate_percent numeric(6,3) NOT NULL DEFAULT 0,
  min_base numeric(14,2) NOT NULL DEFAULT 0,
  max_base numeric(14,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (employee_rate_percent >= 0 AND employee_rate_percent <= 100),
  CHECK (employer_rate_percent >= 0 AND employer_rate_percent <= 100),
  CHECK (max_base IS NULL OR max_base >= min_base)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contribution_rules TO authenticated;
GRANT ALL ON public.contribution_rules TO service_role;
ALTER TABLE public.contribution_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cr_updated_at BEFORE UPDATE ON public.contribution_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_contrib_country ON public.contribution_rules(country_code, effective_from);

-- RLS: super admin manages everything
CREATE POLICY "super admin all cps" ON public.country_payroll_settings
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super admin all tax brackets" ON public.tax_brackets
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super admin all contribs" ON public.contribution_rules
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Regional admin reads scoped country rules
CREATE POLICY "regional admin reads scoped cps" ON public.country_payroll_settings
  FOR SELECT USING (
    public.has_role(auth.uid(), 'regional_admin')
    AND public.has_country_scope(auth.uid(), country_code)
  );

CREATE POLICY "regional admin reads scoped tax brackets" ON public.tax_brackets
  FOR SELECT USING (
    public.has_role(auth.uid(), 'regional_admin')
    AND public.has_country_scope(auth.uid(), country_code)
  );

CREATE POLICY "regional admin reads scoped contribs" ON public.contribution_rules
  FOR SELECT USING (
    public.has_role(auth.uid(), 'regional_admin')
    AND public.has_country_scope(auth.uid(), country_code)
  );

-- Org members read rules for their tenant's country
CREATE POLICY "org reads own country cps" ON public.country_payroll_settings
  FOR SELECT USING (
    country_code IN (SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid()))
  );

CREATE POLICY "org reads own country tax brackets" ON public.tax_brackets
  FOR SELECT USING (
    country_code IN (SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid()))
  );

CREATE POLICY "org reads own country contribs" ON public.contribution_rules
  FOR SELECT USING (
    country_code IN (SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid()))
  );
