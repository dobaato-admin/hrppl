
-- AU Payroll M2: pay run engine primitives (OTE, SG, PAYG-W)

-- 1) Component classification for STP2 + OTE/super eligibility
ALTER TABLE public.payroll_components
  ADD COLUMN IF NOT EXISTS stp2_category text,
  ADD COLUMN IF NOT EXISTS ote_eligible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS super_eligible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.payroll_components.stp2_category IS
  'STP Phase 2 disaggregation category: gross|overtime|bonus|commission|directors|allowance_CD|allowance_AD|allowance_LD|allowance_MD|allowance_TD|allowance_KN|allowance_QN|allowance_OD|allowance_G1|leave_cash|leave_unused|leave_ancillary|leave_other|lumpsum_A_R|lumpsum_A_T|lumpsum_B|lumpsum_D|lumpsum_E|lumpsum_W|salary_sacrifice_S|salary_sacrifice_O|deduction_F|deduction_W|deduction_D|deduction_G|deduction_M';

-- 2) AU PAYG-W tax tables (Schedule 1 statement-of-formulas)
-- Each row: for a given scale + frequency + threshold bracket, withholding = a*x - b
CREATE TABLE IF NOT EXISTS public.tax_tables_au (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scale text NOT NULL,            -- '1','2','3','4 (TFN provided)','4 (no TFN)','5','6'
  frequency text NOT NULL,        -- 'weekly'|'fortnightly'|'monthly'
  threshold_min numeric(14,2) NOT NULL,
  threshold_max numeric(14,2),    -- NULL = open-ended
  a numeric(12,8) NOT NULL,
  b numeric(14,4) NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_tables_au_lookup
  ON public.tax_tables_au (scale, frequency, effective_from);

GRANT SELECT ON public.tax_tables_au TO authenticated, anon;
GRANT ALL ON public.tax_tables_au TO service_role;

ALTER TABLE public.tax_tables_au ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_tables_au read" ON public.tax_tables_au
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "tax_tables_au admin write" ON public.tax_tables_au
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 3) Statutory SG rate history (AU)
CREATE TABLE IF NOT EXISTS public.au_sg_rates (
  effective_from date PRIMARY KEY,
  rate numeric(5,4) NOT NULL,           -- e.g. 0.12 for 12%
  max_contribution_base_quarterly numeric(14,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.au_sg_rates TO authenticated, anon;
GRANT ALL ON public.au_sg_rates TO service_role;

ALTER TABLE public.au_sg_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "au_sg_rates read" ON public.au_sg_rates
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "au_sg_rates admin write" ON public.au_sg_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Seed current statutory SG rates (history)
INSERT INTO public.au_sg_rates (effective_from, rate, notes) VALUES
  ('2024-07-01', 0.115, 'SG step-up to 11.5%'),
  ('2025-07-01', 0.12,  'SG final step to 12%')
ON CONFLICT (effective_from) DO NOTHING;

-- Helper: resolve SG rate for a given date
CREATE OR REPLACE FUNCTION public.au_sg_rate_on(_on date)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT rate FROM public.au_sg_rates
  WHERE effective_from <= _on
  ORDER BY effective_from DESC
  LIMIT 1
$$;

-- Helper: lookup PAYG-W coefficient
CREATE OR REPLACE FUNCTION public.au_payg_lookup(_scale text, _frequency text, _earnings numeric, _on date)
RETURNS TABLE(a numeric, b numeric)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT t.a, t.b
  FROM public.tax_tables_au t
  WHERE t.scale = _scale
    AND t.frequency = _frequency
    AND t.effective_from <= _on
    AND (t.effective_to IS NULL OR t.effective_to >= _on)
    AND t.threshold_min <= _earnings
    AND (t.threshold_max IS NULL OR t.threshold_max >= _earnings)
  ORDER BY t.effective_from DESC, t.threshold_min DESC
  LIMIT 1
$$;
