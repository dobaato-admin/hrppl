
ALTER TABLE public.payroll_runs
  ADD COLUMN IF NOT EXISTS base_currency_code text,
  ADD COLUMN IF NOT EXISTS fx_rate numeric NOT NULL DEFAULT 1.0;

-- Backfill base_currency_code from existing currency_code (so historical runs are self-describing)
UPDATE public.payroll_runs SET base_currency_code = currency_code WHERE base_currency_code IS NULL;

ALTER TABLE public.payroll_runs
  ALTER COLUMN base_currency_code SET NOT NULL;

ALTER TABLE public.payroll_runs
  ADD CONSTRAINT payroll_runs_fx_rate_positive CHECK (fx_rate > 0);
