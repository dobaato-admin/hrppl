
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS notify_onboarding_task boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_timesheet boolean NOT NULL DEFAULT true;

ALTER TABLE public.onboarding_control_room_tasks
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_ocrt_due_status
  ON public.onboarding_control_room_tasks (status, due_date)
  WHERE status IN ('pending','in_progress');
