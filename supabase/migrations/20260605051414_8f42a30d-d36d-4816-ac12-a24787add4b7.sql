
-- 1. New status value
ALTER TYPE public.review_status ADD VALUE IF NOT EXISTS 'acknowledged';

-- 2. Review templates (tenant-scoped, versioned, mirroring feedback templates)
CREATE TABLE IF NOT EXISTS public.review_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  scale_min smallint NOT NULL DEFAULT 1,
  scale_max smallint NOT NULL DEFAULT 5,
  scale_labels jsonb NOT NULL DEFAULT '[]'::jsonb,
  competencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  parent_template_id uuid,
  is_current boolean NOT NULL DEFAULT true,
  change_note text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_templates TO authenticated;
GRANT ALL ON public.review_templates TO service_role;

ALTER TABLE public.review_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org reads tenant review templates" ON public.review_templates
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant review templates" ON public.review_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "super admin all review templates" ON public.review_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER review_templates_touch BEFORE UPDATE ON public.review_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. New columns on review_cycles
ALTER TABLE public.review_cycles
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS template_version integer;

-- 4. New columns on performance_reviews
ALTER TABLE public.performance_reviews
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS template_version integer,
  ADD COLUMN IF NOT EXISTS self_responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS manager_responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS calibrated_rating numeric(4,2),
  ADD COLUMN IF NOT EXISTS calibration_notes text,
  ADD COLUMN IF NOT EXISTS calibrated_by uuid,
  ADD COLUMN IF NOT EXISTS calibrated_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledgment_comments text;

-- 5. Audit trigger for status changes
CREATE OR REPLACE FUNCTION public.audit_review_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('performance_review', NEW.id::text, 'review_created', auth.uid(),
      jsonb_build_object('tenant_id', NEW.tenant_id, 'cycle_id', NEW.cycle_id,
        'employee_id', NEW.employee_id, 'status', NEW.status));
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('performance_review', NEW.id::text, 'review_status_changed', auth.uid(),
      jsonb_build_object('tenant_id', NEW.tenant_id, 'cycle_id', NEW.cycle_id,
        'employee_id', NEW.employee_id, 'from', OLD.status, 'to', NEW.status,
        'self_rating', NEW.self_rating, 'manager_rating', NEW.manager_rating,
        'calibrated_rating', NEW.calibrated_rating));
  END IF;
  IF NEW.calibrated_rating IS DISTINCT FROM OLD.calibrated_rating THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, actor_id, metadata)
    VALUES ('performance_review', NEW.id::text, 'review_calibrated', auth.uid(),
      jsonb_build_object('tenant_id', NEW.tenant_id, 'cycle_id', NEW.cycle_id,
        'employee_id', NEW.employee_id,
        'before', OLD.calibrated_rating, 'after', NEW.calibrated_rating,
        'notes', NEW.calibration_notes));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_review_status_trg ON public.performance_reviews;
CREATE TRIGGER audit_review_status_trg
  AFTER INSERT OR UPDATE OF status, calibrated_rating ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.audit_review_status_change();

-- 6. Update guard_employee_review_update to allow employee acknowledgment after finalize
CREATE OR REPLACE FUNCTION public.guard_employee_review_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_employee boolean;
BEGIN
  -- Allow privileged paths through
  IF has_role(auth.uid(), 'org_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
     OR has_role(auth.uid(), 'manager'::app_role) THEN
    RETURN NEW;
  END IF;
  SELECT EXISTS(SELECT 1 FROM employees e WHERE e.id = NEW.employee_id AND e.user_id = auth.uid())
    INTO is_employee;
  IF NOT is_employee THEN
    RETURN NEW;
  END IF;
  -- Employee can: self-submit (draft -> self_submitted) OR acknowledge (finalized -> acknowledged)
  IF OLD.status = 'finalized' AND NEW.status = 'acknowledged' THEN
    -- Only acknowledgment-related fields may change
    IF NEW.self_rating IS DISTINCT FROM OLD.self_rating
       OR NEW.manager_rating IS DISTINCT FROM OLD.manager_rating
       OR NEW.calibrated_rating IS DISTINCT FROM OLD.calibrated_rating
       OR NEW.manager_comments IS DISTINCT FROM OLD.manager_comments THEN
      RAISE EXCEPTION 'Employees cannot modify rating or manager fields on acknowledgment';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.status IN ('draft','self_submitted') AND NEW.status IN ('draft','self_submitted') THEN
    IF NEW.manager_rating IS DISTINCT FROM OLD.manager_rating
       OR NEW.manager_comments IS DISTINCT FROM OLD.manager_comments
       OR NEW.calibrated_rating IS DISTINCT FROM OLD.calibrated_rating THEN
      RAISE EXCEPTION 'Employees cannot modify manager or calibration fields';
    END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Employee cannot transition review from % to %', OLD.status, NEW.status;
END;
$$;
