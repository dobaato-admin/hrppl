
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS notify_review_self_pending boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_review_manager_pending boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_review_acknowledgment boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_review_calibration boolean NOT NULL DEFAULT true;

ALTER TABLE public.performance_reviews
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS in_app_notifications_user_idx
  ON public.in_app_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS in_app_notifications_unread_idx
  ON public.in_app_notifications (user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.in_app_notifications TO authenticated;
GRANT ALL ON public.in_app_notifications TO service_role;

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.in_app_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.in_app_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
