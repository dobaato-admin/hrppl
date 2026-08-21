
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS notify_onboarding_overdue boolean NOT NULL DEFAULT true;

ALTER TABLE public.onboarding_assignments
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;
