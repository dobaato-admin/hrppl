
-- Templates table
CREATE TABLE public.feedback_question_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_question_templates TO authenticated;
GRANT ALL ON public.feedback_question_templates TO service_role;

ALTER TABLE public.feedback_question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org reads tenant fb templates" ON public.feedback_question_templates
  FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant fb templates" ON public.feedback_question_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all fb templates" ON public.feedback_question_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER fb_templates_touch BEFORE UPDATE ON public.feedback_question_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Extend review_feedback_requests
ALTER TABLE public.review_feedback_requests
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

-- Extend review_feedback
ALTER TABLE public.review_feedback
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS avg_rating numeric;

-- Audit trigger for feedback request lifecycle
CREATE OR REPLACE FUNCTION public.audit_review_feedback_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_action text;
  v_target uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'feedback360_requested';
    v_target := NEW.id;
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('review_feedback_request', v_target::text, v_action, auth.uid(),
      jsonb_build_object(
        'tenant_id', NEW.tenant_id, 'review_id', NEW.review_id,
        'subject_employee_id', NEW.subject_employee_id,
        'requested_user_id', NEW.requested_user_id, 'kind', NEW.kind,
        'template_id', NEW.template_id, 'due_date', NEW.due_date
      ));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    v_action := CASE NEW.status
      WHEN 'submitted' THEN 'feedback360_submitted'
      WHEN 'declined' THEN 'feedback360_declined'
      ELSE 'feedback360_status_changed' END;
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('review_feedback_request', NEW.id::text, v_action, auth.uid(),
      jsonb_build_object(
        'tenant_id', NEW.tenant_id, 'from', OLD.status, 'to', NEW.status,
        'feedback_id', NEW.feedback_id
      ));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.reminder_count IS DISTINCT FROM OLD.reminder_count THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('review_feedback_request', NEW.id::text, 'feedback360_reminder_sent', auth.uid(),
      jsonb_build_object('tenant_id', NEW.tenant_id, 'reminder_count', NEW.reminder_count));
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS audit_review_feedback_request_t ON public.review_feedback_requests;
CREATE TRIGGER audit_review_feedback_request_t
  AFTER INSERT OR UPDATE ON public.review_feedback_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_review_feedback_request();

-- Allow org_admin / manager / super_admin to read audit_log entries
DROP POLICY IF EXISTS "org admin reads tenant audit" ON public.audit_log;
CREATE POLICY "org admin reads tenant audit" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'manager')
  );
