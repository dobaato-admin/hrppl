-- Template versioning for 360 feedback question templates
ALTER TABLE public.feedback_question_templates
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_template_id uuid REFERENCES public.feedback_question_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS change_note text,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Backfill: each existing row is its own family root at version 1
UPDATE public.feedback_question_templates
SET parent_template_id = id
WHERE parent_template_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_fb_templates_family
  ON public.feedback_question_templates(parent_template_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_fb_templates_current
  ON public.feedback_question_templates(tenant_id, is_current) WHERE is_current = true;

-- Pin requests to the exact template version used (id already does this,
-- but keep an explicit version int for human-friendly audit + analytics)
ALTER TABLE public.review_feedback_requests
  ADD COLUMN IF NOT EXISTS template_version integer;

ALTER TABLE public.review_feedback
  ADD COLUMN IF NOT EXISTS template_version integer;

-- Audit trigger: log template version creation
CREATE OR REPLACE FUNCTION public.audit_feedback_template_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('feedback_question_template', NEW.id::text,
      CASE WHEN NEW.version = 1 THEN 'fb_template_created' ELSE 'fb_template_version_created' END,
      auth.uid(),
      jsonb_build_object(
        'tenant_id', NEW.tenant_id,
        'parent_template_id', NEW.parent_template_id,
        'version', NEW.version,
        'name', NEW.name,
        'change_note', NEW.change_note
      ));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS audit_feedback_template_version_t ON public.feedback_question_templates;
CREATE TRIGGER audit_feedback_template_version_t
  AFTER INSERT ON public.feedback_question_templates
  FOR EACH ROW EXECUTE FUNCTION public.audit_feedback_template_version();
