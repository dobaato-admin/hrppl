
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  notify_leave_submitted boolean NOT NULL DEFAULT true,
  notify_leave_decision boolean NOT NULL DEFAULT true,
  notify_leave_cancelled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own prefs" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "users insert own prefs" ON public.notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users update own prefs" ON public.notification_preferences
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER notification_preferences_touch
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
