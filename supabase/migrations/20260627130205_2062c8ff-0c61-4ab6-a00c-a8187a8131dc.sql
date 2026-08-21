
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS kpi_weight_tolerance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kpi_strict_weights boolean NOT NULL DEFAULT true;

ALTER TABLE public.kpi_review_cycles
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_days_before integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS open_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_notified_at timestamptz;
