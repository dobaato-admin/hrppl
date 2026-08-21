ALTER TABLE public.country_payroll_settings
  ADD COLUMN IF NOT EXISTS holiday_pay_multiplier numeric(5,2) NOT NULL DEFAULT 2.0
  CHECK (holiday_pay_multiplier >= 1.0 AND holiday_pay_multiplier <= 10.0);

ALTER TABLE public.public_holidays
  ADD COLUMN IF NOT EXISTS pay_multiplier numeric(5,2)
  CHECK (pay_multiplier IS NULL OR (pay_multiplier >= 1.0 AND pay_multiplier <= 10.0));

COMMENT ON COLUMN public.country_payroll_settings.holiday_pay_multiplier IS
  'Default pay multiplier for hours worked on a public holiday (e.g., 2.0 = double pay). Used by payroll engine.';
COMMENT ON COLUMN public.public_holidays.pay_multiplier IS
  'Per-holiday override of the country holiday_pay_multiplier. NULL = use country default.';