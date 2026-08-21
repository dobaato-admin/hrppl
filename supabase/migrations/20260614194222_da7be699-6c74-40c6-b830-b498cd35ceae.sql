ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(12,4),
  ADD COLUMN IF NOT EXISTS pay_frequency text;

COMMENT ON COLUMN public.employees.hourly_rate IS 'Manual hourly wage rate (optional). Used when employee is paid by the hour rather than annualised salary.';
COMMENT ON COLUMN public.employees.pay_frequency IS 'How the employee is paid: hourly, weekly, fortnightly, monthly, annually.';