
ALTER TABLE public.onboarding_control_room_tasks
  ADD COLUMN IF NOT EXISTS reminder_interval_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS escalate_after_days integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.offboarding_comms_removal
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS reminder_interval_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS escalate_after_days integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.offboarding_comms_removal_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.offboarding_cases(id) ON DELETE CASCADE,
  comms_row_id uuid NOT NULL,
  channel text NOT NULL,
  action text NOT NULL,
  before jsonb NOT NULL DEFAULT '{}'::jsonb,
  after jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  actor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.offboarding_comms_removal_audit TO authenticated;
GRANT ALL ON public.offboarding_comms_removal_audit TO service_role;
ALTER TABLE public.offboarding_comms_removal_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant read ocr audit" ON public.offboarding_comms_removal_audit;
CREATE POLICY "tenant read ocr audit" ON public.offboarding_comms_removal_audit
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "nobody insert ocr audit" ON public.offboarding_comms_removal_audit;
CREATE POLICY "nobody insert ocr audit" ON public.offboarding_comms_removal_audit
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE INDEX IF NOT EXISTS ix_ocr_audit_case ON public.offboarding_comms_removal_audit(case_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.tg_audit_offboarding_comms_removal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text; v_name text;
  v_action text;
BEGIN
  IF v_actor IS NOT NULL THEN
    SELECT email, full_name INTO v_email, v_name FROM public.profiles WHERE id = v_actor;
  END IF;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.offboarding_comms_removal_audit(tenant_id, case_id, comms_row_id, channel, action, before, after, actor_id, actor_email, actor_name)
    VALUES (NEW.tenant_id, NEW.case_id, NEW.id, NEW.channel, 'channel_seeded', '{}'::jsonb, to_jsonb(NEW), v_actor, v_email, v_name);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.removed IS DISTINCT FROM OLD.removed THEN
      v_action := CASE WHEN NEW.removed THEN 'channel_marked_removed' ELSE 'channel_unmarked' END;
    ELSIF NEW.attestation_signature IS DISTINCT FROM OLD.attestation_signature AND NEW.attestation_signature IS NOT NULL THEN
      v_action := 'attestation_signed';
    ELSIF NEW.evidence_url IS DISTINCT FROM OLD.evidence_url THEN
      v_action := CASE WHEN NEW.evidence_url IS NULL THEN 'evidence_removed' ELSE 'evidence_uploaded' END;
    ELSIF NEW.last_reminder_at IS DISTINCT FROM OLD.last_reminder_at THEN
      v_action := 'reminder_sent';
    ELSE
      v_action := 'channel_updated';
    END IF;
    INSERT INTO public.offboarding_comms_removal_audit(tenant_id, case_id, comms_row_id, channel, action, before, after, actor_id, actor_email, actor_name)
    VALUES (NEW.tenant_id, NEW.case_id, NEW.id, NEW.channel, v_action,
      jsonb_build_object('removed', OLD.removed, 'evidence_url', OLD.evidence_url, 'attestation_signature', OLD.attestation_signature, 'notes', OLD.notes, 'due_date', OLD.due_date),
      jsonb_build_object('removed', NEW.removed, 'evidence_url', NEW.evidence_url, 'attestation_signature', NEW.attestation_signature, 'notes', NEW.notes, 'due_date', NEW.due_date),
      v_actor, v_email, v_name);
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_audit_ocr ON public.offboarding_comms_removal;
CREATE TRIGGER trg_audit_ocr
  AFTER INSERT OR UPDATE ON public.offboarding_comms_removal
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_offboarding_comms_removal();

CREATE OR REPLACE FUNCTION public.tg_block_modify_audit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit log rows are immutable';
END $$;

DROP TRIGGER IF EXISTS trg_block_ocr_audit_upd ON public.offboarding_comms_removal_audit;
CREATE TRIGGER trg_block_ocr_audit_upd
  BEFORE UPDATE OR DELETE ON public.offboarding_comms_removal_audit
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_modify_audit();

DROP TRIGGER IF EXISTS trg_block_onb_audit_upd ON public.onboarding_control_room_audit;
CREATE TRIGGER trg_block_onb_audit_upd
  BEFORE UPDATE OR DELETE ON public.onboarding_control_room_audit
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_modify_audit();

CREATE TABLE IF NOT EXISTS public.compliance_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope text NOT NULL,
  ref_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel text NOT NULL,
  escalated boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.compliance_reminder_log TO authenticated;
GRANT ALL ON public.compliance_reminder_log TO service_role;
ALTER TABLE public.compliance_reminder_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant read reminder log" ON public.compliance_reminder_log;
CREATE POLICY "tenant read reminder log" ON public.compliance_reminder_log
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin'::app_role));
CREATE INDEX IF NOT EXISTS ix_crl_ref ON public.compliance_reminder_log(scope, ref_id, sent_at DESC);

CREATE OR REPLACE FUNCTION public.list_onboarding_tasks_due_reminder()
RETURNS TABLE(task_id uuid, assignment_id uuid, tenant_id uuid, employee_id uuid, assignee_user_id uuid, title text, days_overdue int, escalate boolean, interval_days int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id, t.assignment_id, e.tenant_id, a.employee_id,
         COALESCE(t.assigned_to, e.user_id) AS assignee_user_id,
         t.title,
         GREATEST(0, (current_date - t.due_date))::int AS days_overdue,
         ((current_date - t.due_date) >= t.escalate_after_days) AS escalate,
         t.reminder_interval_days
  FROM public.onboarding_control_room_tasks t
  JOIN public.onboarding_assignments a ON a.id = t.assignment_id
  JOIN public.employees e ON e.id = a.employee_id
  WHERE t.status NOT IN ('completed','skipped')
    AND t.due_date IS NOT NULL AND t.due_date <= current_date
    AND (t.last_reminder_at IS NULL OR t.last_reminder_at < (now() - (t.reminder_interval_days || ' days')::interval));
$$;

CREATE OR REPLACE FUNCTION public.list_offboarding_comms_due_reminder()
RETURNS TABLE(row_id uuid, case_id uuid, tenant_id uuid, employee_id uuid, channel_label text, days_overdue int, escalate boolean, interval_days int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.case_id, r.tenant_id, c.employee_id, r.channel_label,
         GREATEST(0, (current_date - COALESCE(r.due_date, c.last_working_day, current_date)))::int AS days_overdue,
         ((current_date - COALESCE(r.due_date, c.last_working_day, current_date)) >= r.escalate_after_days) AS escalate,
         r.reminder_interval_days
  FROM public.offboarding_comms_removal r
  JOIN public.offboarding_cases c ON c.id = r.case_id
  WHERE r.removed = false
    AND c.status NOT IN ('completed','cancelled')
    AND COALESCE(r.due_date, c.last_working_day, current_date) <= current_date
    AND (r.last_reminder_at IS NULL OR r.last_reminder_at < (now() - (r.reminder_interval_days || ' days')::interval));
$$;
