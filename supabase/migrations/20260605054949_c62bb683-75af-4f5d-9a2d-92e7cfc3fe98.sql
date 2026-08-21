
-- Per-cycle reminder configuration
ALTER TABLE public.review_cycles
  ADD COLUMN IF NOT EXISTS reminders_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_interval_days integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS reminder_start_offset_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reminder_business_days_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_max_count integer;

ALTER TABLE public.review_cycles
  ADD CONSTRAINT review_cycles_reminder_interval_chk CHECK (reminder_interval_days BETWEEN 1 AND 60),
  ADD CONSTRAINT review_cycles_reminder_offset_chk CHECK (reminder_start_offset_days BETWEEN 0 AND 365),
  ADD CONSTRAINT review_cycles_reminder_max_chk CHECK (reminder_max_count IS NULL OR reminder_max_count BETWEEN 1 AND 50);

-- Per-user overrides
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS review_reminder_min_interval_days integer,
  ADD COLUMN IF NOT EXISTS review_reminder_business_days_only boolean NOT NULL DEFAULT false;

ALTER TABLE public.notification_preferences
  ADD CONSTRAINT notification_prefs_reminder_interval_chk CHECK (review_reminder_min_interval_days IS NULL OR review_reminder_min_interval_days BETWEEN 1 AND 60);
