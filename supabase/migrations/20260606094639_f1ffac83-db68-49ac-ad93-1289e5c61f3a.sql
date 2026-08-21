
-- ============================================
-- Unified Employee Event Timeline
-- ============================================

-- 1) Enum & tables
CREATE TYPE public.event_category AS ENUM (
  'medical','disciplinary','grievance','training','payroll','review',
  'appraisal','onboarding','expense','timesheet','leave','document',
  'recruitment','promotion','pay_change','recognition','other'
);

CREATE TYPE public.event_visibility AS ENUM ('employee','manager','hr','confidential');

CREATE TABLE public.employee_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  category public.event_category NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  summary text,
  source_table text,
  source_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  severity text,
  visibility public.event_visibility NOT NULL DEFAULT 'employee',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_emp_events_employee ON public.employee_events(employee_id, occurred_at DESC);
CREATE INDEX idx_emp_events_tenant ON public.employee_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_emp_events_category ON public.employee_events(category);
CREATE INDEX idx_emp_events_source ON public.employee_events(source_table, source_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_events TO authenticated;
GRANT ALL ON public.employee_events TO service_role;
ALTER TABLE public.employee_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own non-confidential events" ON public.employee_events FOR SELECT
  USING (visibility <> 'confidential' AND EXISTS (
    SELECT 1 FROM public.employees e WHERE e.id = employee_events.employee_id AND e.user_id = auth.uid()
  ) AND visibility IN ('employee'));
CREATE POLICY "manager reads team events" ON public.employee_events FOR SELECT
  USING (has_role(auth.uid(),'manager') AND tenant_id = user_tenant_id(auth.uid()) AND visibility <> 'confidential');
CREATE POLICY "org admin all tenant events" ON public.employee_events
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all events" ON public.employee_events
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

-- Links between events
CREATE TABLE public.employee_event_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_event_id uuid NOT NULL REFERENCES public.employee_events(id) ON DELETE CASCADE,
  to_event_id uuid NOT NULL REFERENCES public.employee_events(id) ON DELETE CASCADE,
  relation text NOT NULL DEFAULT 'related',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_event_id, to_event_id, relation)
);
GRANT SELECT, INSERT, DELETE ON public.employee_event_links TO authenticated;
GRANT ALL ON public.employee_event_links TO service_role;
ALTER TABLE public.employee_event_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links readable with event access" ON public.employee_event_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.employee_events e WHERE e.id = from_event_id));
CREATE POLICY "org admin manages links" ON public.employee_event_links
  USING (has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'super_admin'));

-- 2) Medical incidents
CREATE TABLE public.medical_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  incident_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  location text,
  description text NOT NULL,
  treatment_notes text,
  requires_case boolean NOT NULL DEFAULT false,
  reported_to_authority boolean NOT NULL DEFAULT false,
  confidential boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_med_incidents_emp ON public.medical_incidents(employee_id, occurred_at DESC);
CREATE INDEX idx_med_incidents_tenant ON public.medical_incidents(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_incidents TO authenticated;
GRANT ALL ON public.medical_incidents TO service_role;
ALTER TABLE public.medical_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee reads own non-confidential medical" ON public.medical_incidents FOR SELECT
  USING (NOT confidential AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));
CREATE POLICY "org admin manages medical" ON public.medical_incidents
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all medical" ON public.medical_incidents
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_med_incidents_updated_at BEFORE UPDATE ON public.medical_incidents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) Generic helper for inserting events from triggers
CREATE OR REPLACE FUNCTION public.record_employee_event(
  _tenant uuid, _employee uuid, _category event_category, _event_type text,
  _title text, _summary text, _source_table text, _source_id uuid,
  _occurred timestamptz, _severity text, _visibility event_visibility, _metadata jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.employee_events(
    tenant_id, employee_id, category, event_type, title, summary,
    source_table, source_id, occurred_at, severity, visibility, metadata, created_by
  ) VALUES (
    _tenant, _employee, _category, _event_type, _title, _summary,
    _source_table, _source_id, COALESCE(_occurred, now()), _severity,
    COALESCE(_visibility,'employee'), COALESCE(_metadata,'{}'::jsonb), auth.uid()
  ) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- 4) Trigger functions per source
CREATE OR REPLACE FUNCTION public.tg_event_medical() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
    INSERT INTO public.disciplinary_cases(tenant_id, employee_id, category, severity, description, status, confidential)
    VALUES (NEW.tenant_id, NEW.employee_id, 'medical_review', NEW.severity,
            'Auto-opened from medical incident: ' || NEW.incident_type || E'\n' || NEW.description,
            'investigation', true)
    RETURNING id INTO v_case_id;
    v_evt2 := public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'disciplinary','case_auto_opened_from_medical',
      'Case file opened from medical incident', NEW.incident_type,
      'disciplinary_cases', v_case_id, now(), NEW.severity, 'hr',
      jsonb_build_object('source_incident_id', NEW.id)
    );
    INSERT INTO public.employee_event_links(from_event_id, to_event_id, relation)
      VALUES (v_evt, v_evt2, 'spawned'), (v_evt2, v_evt, 'caused_by');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_medical AFTER INSERT ON public.medical_incidents
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_medical();

CREATE OR REPLACE FUNCTION public.tg_event_disciplinary_case() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'disciplinary','case_opened',
      'Disciplinary case opened: ' || NEW.category,
      LEFT(NEW.description,500), 'disciplinary_cases', NEW.id,
      NEW.created_at, NEW.severity,
      CASE WHEN NEW.confidential THEN 'hr' ELSE 'employee' END,
      jsonb_build_object('status', NEW.status, 'category', NEW.category)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'disciplinary','case_status_changed',
      'Case status: ' || OLD.status || ' → ' || NEW.status, NULL,
      'disciplinary_cases', NEW.id, now(), NEW.severity,
      CASE WHEN NEW.confidential THEN 'hr' ELSE 'employee' END,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_disciplinary_case AFTER INSERT OR UPDATE OF status ON public.disciplinary_cases
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_disciplinary_case();

CREATE OR REPLACE FUNCTION public.tg_event_grievance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_emp uuid;
BEGIN
  SELECT id INTO v_emp FROM public.employees WHERE user_id = NEW.filer_user_id AND tenant_id = NEW.tenant_id LIMIT 1;
  IF v_emp IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, v_emp, 'grievance','grievance_filed',
      'Grievance filed: ' || NEW.subject, LEFT(NEW.description,500),
      'grievances', NEW.id, NEW.created_at, NEW.severity,
      CASE WHEN NEW.is_anonymous THEN 'hr' ELSE 'employee' END,
      jsonb_build_object('category', NEW.category, 'status', NEW.status, 'anonymous', NEW.is_anonymous)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, v_emp, 'grievance','grievance_status_changed',
      'Grievance status: ' || OLD.status || ' → ' || NEW.status, NULL,
      'grievances', NEW.id, now(), NEW.severity,
      CASE WHEN NEW.is_anonymous THEN 'hr' ELSE 'employee' END,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_grievance AFTER INSERT OR UPDATE OF status ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_grievance();

CREATE OR REPLACE FUNCTION public.tg_event_payslip() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'payroll','payslip_issued',
    'Payslip issued', NULL, 'payroll_payslips', NEW.id, NEW.created_at, NULL, 'employee',
    jsonb_build_object('net_pay', NEW.net_pay, 'currency', NEW.currency_code, 'run_id', NEW.run_id)
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_payslip AFTER INSERT ON public.payroll_payslips
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_payslip();

CREATE OR REPLACE FUNCTION public.tg_event_review() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'review','review_created',
      'Performance review created', NULL,'performance_reviews', NEW.id,
      NEW.created_at, NULL,'employee', jsonb_build_object('status', NEW.status, 'cycle_id', NEW.cycle_id));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'review','review_status_changed',
      'Review status: ' || OLD.status || ' → ' || NEW.status, NULL,
      'performance_reviews', NEW.id, now(), NULL,'employee',
      jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_review AFTER INSERT OR UPDATE OF status ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_review();

CREATE OR REPLACE FUNCTION public.tg_event_training() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_title text;
BEGIN
  SELECT title INTO v_title FROM public.training_courses WHERE id = NEW.course_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'training','training_assigned',
      'Training assigned: ' || COALESCE(v_title,'(course)'), NULL,
      'training_enrollments', NEW.id, NEW.assigned_at, NULL,'employee',
      jsonb_build_object('course_id', NEW.course_id, 'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'training','training_status_changed',
      'Training: ' || COALESCE(v_title,'(course)') || ' — ' || NEW.status, NULL,
      'training_enrollments', NEW.id, now(), NULL,'employee',
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'course_id', NEW.course_id));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_training AFTER INSERT OR UPDATE OF status ON public.training_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_training();

CREATE OR REPLACE FUNCTION public.tg_event_leave() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'leave','leave_requested',
      'Leave requested ('|| NEW.days ||' days)', NULL,
      'leave_requests', NEW.id, NEW.created_at, NULL,'employee',
      jsonb_build_object('start', NEW.start_date,'end', NEW.end_date,'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'leave','leave_status_changed',
      'Leave ' || NEW.status, NULL,'leave_requests', NEW.id, now(), NULL,'employee',
      jsonb_build_object('from', OLD.status,'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_leave AFTER INSERT OR UPDATE OF status ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_leave();

CREATE OR REPLACE FUNCTION public.tg_event_expense() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'expense','expense_submitted',
      'Expense claim: ' || NEW.title, NULL,'expense_claims', NEW.id,
      NEW.created_at, NULL,'employee',
      jsonb_build_object('amount', NEW.total_amount, 'currency', NEW.currency, 'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'expense','expense_status_changed',
      'Expense ' || NEW.status || ': ' || NEW.title, NULL,
      'expense_claims', NEW.id, now(), NULL,'employee',
      jsonb_build_object('from', OLD.status,'to', NEW.status,'amount', NEW.total_amount));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_expense AFTER INSERT OR UPDATE OF status ON public.expense_claims
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_expense();

CREATE OR REPLACE FUNCTION public.tg_event_onboarding() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_name text;
BEGIN
  SELECT name INTO v_name FROM public.onboarding_checklists WHERE id = NEW.checklist_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'onboarding','onboarding_assigned',
      'Onboarding assigned: ' || COALESCE(v_name,'checklist'), NULL,
      'onboarding_assignments', NEW.id, NEW.assigned_at, NULL,'employee',
      jsonb_build_object('checklist_id', NEW.checklist_id, 'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'onboarding','onboarding_status_changed',
      'Onboarding ' || NEW.status, NULL,'onboarding_assignments', NEW.id, now(), NULL,'employee',
      jsonb_build_object('from', OLD.status,'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_onboarding AFTER INSERT OR UPDATE OF status ON public.onboarding_assignments
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_onboarding();

CREATE OR REPLACE FUNCTION public.tg_event_promotion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'promotion','promotion_recorded',
    'Promotion recorded', NULL,'promotions', NEW.id, NEW.created_at, NULL,'employee', to_jsonb(NEW));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_promotion AFTER INSERT ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_promotion();

CREATE OR REPLACE FUNCTION public.tg_event_pay_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'pay_change','pay_rate_changed',
    'Pay rate changed', NULL,'pay_rate_changes', NEW.id, NEW.created_at, NULL,'hr', to_jsonb(NEW));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_pay_change AFTER INSERT ON public.pay_rate_changes
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_pay_change();

CREATE OR REPLACE FUNCTION public.tg_event_employee_document() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'document','document_added',
    'Document added', NULL,'employee_documents', NEW.id, NEW.created_at, NULL,'employee',
    jsonb_build_object('id', NEW.id));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_employee_document AFTER INSERT ON public.employee_documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_event_employee_document();

-- 5) Backfill from existing data
INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, severity, visibility, metadata)
SELECT tenant_id, employee_id, 'disciplinary','case_opened','Disciplinary case: '||category,'disciplinary_cases',id,created_at,severity,
  CASE WHEN confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
  jsonb_build_object('status',status,'category',category)
FROM public.disciplinary_cases;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, visibility, metadata)
SELECT g.tenant_id, e.id,'grievance','grievance_filed','Grievance: '||g.subject,'grievances',g.id,g.created_at,
  CASE WHEN g.is_anonymous THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
  jsonb_build_object('status',g.status,'category',g.category)
FROM public.grievances g JOIN public.employees e ON e.user_id = g.filer_user_id AND e.tenant_id = g.tenant_id;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'payroll','payslip_issued','Payslip','payroll_payslips',id,created_at,
  jsonb_build_object('net_pay',net_pay,'currency',currency_code,'run_id',run_id)
FROM public.payroll_payslips;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'review','review_created','Performance review','performance_reviews',id,created_at,
  jsonb_build_object('status',status,'cycle_id',cycle_id)
FROM public.performance_reviews;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT te.tenant_id, te.employee_id,'training','training_assigned','Training: '||COALESCE(tc.title,'course'),'training_enrollments',te.id,te.assigned_at,
  jsonb_build_object('course_id',te.course_id,'status',te.status)
FROM public.training_enrollments te LEFT JOIN public.training_courses tc ON tc.id = te.course_id;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'leave','leave_requested','Leave request','leave_requests',id,created_at,
  jsonb_build_object('start',start_date,'end',end_date,'status',status,'days',days)
FROM public.leave_requests;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'expense','expense_submitted','Expense: '||title,'expense_claims',id,created_at,
  jsonb_build_object('amount',total_amount,'currency',currency,'status',status)
FROM public.expense_claims;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT oa.tenant_id, oa.employee_id,'onboarding','onboarding_assigned','Onboarding: '||COALESCE(oc.name,'checklist'),'onboarding_assignments',oa.id,oa.assigned_at,
  jsonb_build_object('checklist_id',oa.checklist_id,'status',oa.status)
FROM public.onboarding_assignments oa LEFT JOIN public.onboarding_checklists oc ON oc.id = oa.checklist_id;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'promotion','promotion_recorded','Promotion','promotions',id,created_at, to_jsonb(promotions.*)
FROM public.promotions;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, visibility, metadata)
SELECT tenant_id, employee_id,'pay_change','pay_rate_changed','Pay change','pay_rate_changes',id,created_at,'hr', to_jsonb(pay_rate_changes.*)
FROM public.pay_rate_changes;

INSERT INTO public.employee_events(tenant_id, employee_id, category, event_type, title, source_table, source_id, occurred_at, metadata)
SELECT tenant_id, employee_id,'document','document_added','Document','employee_documents',id,created_at,'{}'::jsonb
FROM public.employee_documents;
