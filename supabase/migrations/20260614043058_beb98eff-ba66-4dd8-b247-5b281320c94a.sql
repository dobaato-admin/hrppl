
-- A2: medical_cases table
CREATE TABLE IF NOT EXISTS public.medical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES public.medical_incidents(id) ON DELETE SET NULL,
  case_number text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  description text NOT NULL,
  outcome text,
  opened_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  closed_at timestamptz,
  closed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confidential boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_cases_tenant ON public.medical_cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_cases_employee ON public.medical_cases(employee_id);
CREATE INDEX IF NOT EXISTS idx_medical_cases_incident ON public.medical_cases(incident_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_cases TO authenticated;
GRANT ALL ON public.medical_cases TO service_role;

ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_cases hr admins manage"
  ON public.medical_cases FOR ALL
  TO authenticated
  USING (public.can_see_confidential(auth.uid(), tenant_id))
  WITH CHECK (public.can_see_confidential(auth.uid(), tenant_id));

CREATE POLICY "medical_cases employee self read non-confidential"
  ON public.medical_cases FOR SELECT
  TO authenticated
  USING (
    confidential = false
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = medical_cases.employee_id
        AND e.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS trg_medical_cases_touch ON public.medical_cases;
CREATE TRIGGER trg_medical_cases_touch
BEFORE UPDATE ON public.medical_cases
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Replace tg_event_medical to spawn into medical_cases instead of disciplinary_cases.
CREATE OR REPLACE FUNCTION public.tg_event_medical()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_case_id uuid; v_evt uuid; v_evt2 uuid;
BEGIN
  v_evt := public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'medical', 'medical_incident_recorded',
    'Medical incident: ' || NEW.incident_type,
    LEFT(NEW.description, 500), 'medical_incidents', NEW.id,
    NEW.occurred_at, NEW.severity,
    CASE WHEN NEW.confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
    jsonb_build_object('location', NEW.location, 'severity', NEW.severity)
  );
  IF NEW.requires_case OR NEW.severity IN ('high','critical') THEN
    INSERT INTO public.medical_cases(
      tenant_id, employee_id, incident_id, severity, description, status, confidential
    )
    VALUES (
      NEW.tenant_id, NEW.employee_id, NEW.id, NEW.severity,
      'Auto-opened from medical incident: ' || NEW.incident_type || E'\n' || NEW.description,
      'open', true
    )
    RETURNING id INTO v_case_id;
    v_evt2 := public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'medical','medical_case_opened',
      'Medical case opened', NEW.incident_type,
      'medical_cases', v_case_id, now(), NEW.severity, 'hr',
      jsonb_build_object('source_incident_id', NEW.id)
    );
    INSERT INTO public.employee_event_links(from_event_id, to_event_id, relation)
      VALUES (v_evt, v_evt2, 'spawned'), (v_evt2, v_evt, 'caused_by');
  END IF;
  RETURN NEW;
END $function$;
