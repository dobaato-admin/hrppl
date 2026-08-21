
-- Audit log for views/edits on sensitive employee event records
CREATE TABLE public.event_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  resource_type text NOT NULL,         -- 'employee_event' | 'medical_incident' | 'disciplinary_case' | 'timeline'
  resource_id uuid,
  action text NOT NULL,                -- 'view' | 'edit' | 'export' | 'list'
  was_confidential boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_access_log_tenant ON public.event_access_log (tenant_id, created_at DESC);
CREATE INDEX idx_event_access_log_resource ON public.event_access_log (resource_type, resource_id);
CREATE INDEX idx_event_access_log_employee ON public.event_access_log (employee_id, created_at DESC);
CREATE INDEX idx_event_access_log_actor ON public.event_access_log (actor_id, created_at DESC);

GRANT SELECT, INSERT ON public.event_access_log TO authenticated;
GRANT ALL ON public.event_access_log TO service_role;

ALTER TABLE public.event_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read the access log (tenant scoped)
CREATE POLICY "org admin reads access log"
  ON public.event_access_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin reads access log"
  ON public.event_access_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Any authenticated user can append their own access events (scoped to their tenant)
CREATE POLICY "authenticated inserts own access log"
  ON public.event_access_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND tenant_id = public.user_tenant_id(auth.uid()));

-- Security-definer helper used by server functions to log access
CREATE OR REPLACE FUNCTION public.log_event_access(
  _resource_type text,
  _resource_id uuid,
  _employee_id uuid,
  _action text,
  _was_confidential boolean,
  _metadata jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid; v_id uuid;
BEGIN
  IF _employee_id IS NOT NULL THEN
    SELECT tenant_id INTO v_tenant FROM public.employees WHERE id = _employee_id;
  END IF;
  IF v_tenant IS NULL THEN
    v_tenant := public.user_tenant_id(auth.uid());
  END IF;
  IF v_tenant IS NULL THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.event_access_log(
    tenant_id, actor_id, employee_id, resource_type, resource_id, action, was_confidential, metadata
  ) VALUES (
    v_tenant, auth.uid(), _employee_id, _resource_type, _resource_id, _action,
    COALESCE(_was_confidential, false), COALESCE(_metadata, '{}'::jsonb)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

GRANT EXECUTE ON FUNCTION public.log_event_access(text, uuid, uuid, text, boolean, jsonb) TO authenticated;

-- Tighten medical_incidents: ensure UPDATE/DELETE restricted (already covered by USING on org admin policy via FOR ALL),
-- but verify by adding explicit guard: managers cannot read confidential medical (no manager policy exists).

-- Tighten employee_events: drop overly-broad manager policy and replace with one that excludes confidential AND hr visibility
DROP POLICY IF EXISTS "manager reads team events" ON public.employee_events;
CREATE POLICY "manager reads team events"
  ON public.employee_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager')
    AND tenant_id = public.user_tenant_id(auth.uid())
    AND visibility NOT IN ('confidential','hr')
  );

-- Audit trigger: log every UPDATE/DELETE on employee_events and medical_incidents
CREATE OR REPLACE FUNCTION public.tg_audit_sensitive_edit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_resource text := TG_TABLE_NAME;
  v_emp uuid;
  v_conf boolean := false;
  v_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_emp := (OLD).employee_id;
    v_id := (OLD).id;
    IF TG_TABLE_NAME = 'medical_incidents' THEN v_conf := (OLD).confidential; END IF;
    IF TG_TABLE_NAME = 'employee_events' THEN v_conf := (OLD).visibility IN ('confidential','hr'); END IF;
    PERFORM public.log_event_access(v_resource, v_id, v_emp, 'delete', v_conf,
      jsonb_build_object('before', to_jsonb(OLD)));
    RETURN OLD;
  ELSE
    v_emp := (NEW).employee_id;
    v_id := (NEW).id;
    IF TG_TABLE_NAME = 'medical_incidents' THEN v_conf := (NEW).confidential; END IF;
    IF TG_TABLE_NAME = 'employee_events' THEN v_conf := (NEW).visibility IN ('confidential','hr'); END IF;
    PERFORM public.log_event_access(v_resource, v_id, v_emp,
      CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'edit' END,
      v_conf,
      CASE WHEN TG_OP = 'UPDATE'
           THEN jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW))
           ELSE jsonb_build_object('after', to_jsonb(NEW)) END);
    RETURN NEW;
  END IF;
END $$;

DROP TRIGGER IF EXISTS tg_audit_employee_events ON public.employee_events;
CREATE TRIGGER tg_audit_employee_events
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_sensitive_edit();

DROP TRIGGER IF EXISTS tg_audit_medical_incidents ON public.medical_incidents;
CREATE TRIGGER tg_audit_medical_incidents
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_incidents
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_sensitive_edit();

DROP TRIGGER IF EXISTS tg_audit_disciplinary_cases ON public.disciplinary_cases;
CREATE TRIGGER tg_audit_disciplinary_cases
  AFTER INSERT OR UPDATE OR DELETE ON public.disciplinary_cases
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_sensitive_edit();
