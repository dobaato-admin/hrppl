
-- =========================================================
-- ASSETS REGISTER
-- =========================================================
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  asset_tag text NOT NULL,
  category public.asset_category NOT NULL DEFAULT 'other',
  name text NOT NULL,
  brand text,
  model text,
  serial_number text,
  description text,
  purchase_date date,
  purchase_cost numeric(14,2),
  currency_code text,
  warranty_expires_on date,
  status public.asset_status NOT NULL DEFAULT 'available',
  current_assignment_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, asset_tag)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets tenant read" ON public.assets FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "assets admin write" ON public.assets FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));

CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- ASSET ASSIGNMENTS
-- =========================================================
CREATE TABLE public.asset_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid,
  expected_return_on date,
  returned_at timestamptz,
  returned_to uuid,
  return_condition text,
  condition_on_issue text,
  acknowledged_at timestamptz,
  acknowledgement_notes text,
  notes text,
  context text NOT NULL DEFAULT 'employment', -- onboarding|employment|offboarding
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_assignments TO authenticated;
GRANT ALL ON public.asset_assignments TO service_role;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_assign tenant read" ON public.asset_assignments FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = asset_assignments.employee_id AND e.user_id = auth.uid())
    ));
CREATE POLICY "asset_assign admin write" ON public.asset_assignments FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "asset_assign employee ack" ON public.asset_assignments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = asset_assignments.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = asset_assignments.employee_id AND e.user_id = auth.uid()));

CREATE INDEX idx_asset_assignments_employee ON public.asset_assignments(employee_id);
CREATE INDEX idx_asset_assignments_asset ON public.asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_open ON public.asset_assignments(asset_id) WHERE returned_at IS NULL;

CREATE TRIGGER trg_asset_assignments_updated BEFORE UPDATE ON public.asset_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Keep asset.status / current_assignment_id in sync
CREATE OR REPLACE FUNCTION public.tg_asset_sync_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.assets SET status = 'assigned', current_assignment_id = NEW.id WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.returned_at IS NOT NULL AND OLD.returned_at IS NULL THEN
      UPDATE public.assets
      SET status = CASE WHEN NEW.return_condition = 'lost' THEN 'lost'::asset_status
                        WHEN NEW.return_condition = 'damaged' THEN 'damaged'::asset_status
                        ELSE 'available'::asset_status END,
          current_assignment_id = NULL
      WHERE id = NEW.asset_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_asset_assign_sync
AFTER INSERT OR UPDATE ON public.asset_assignments
FOR EACH ROW EXECUTE FUNCTION public.tg_asset_sync_status();

-- Log to unified employee timeline
CREATE OR REPLACE FUNCTION public.tg_event_asset_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_asset RECORD;
BEGIN
  SELECT name, asset_tag, category INTO v_asset FROM public.assets WHERE id = NEW.asset_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'asset','asset_assigned',
      'Asset issued: ' || COALESCE(v_asset.name,'(asset)') || ' [' || COALESCE(v_asset.asset_tag,'') || ']',
      NEW.notes, 'asset_assignments', NEW.id, NEW.assigned_at, NULL, 'employee',
      jsonb_build_object('asset_id', NEW.asset_id, 'category', v_asset.category, 'context', NEW.context, 'expected_return_on', NEW.expected_return_on)
    );
  ELSIF NEW.returned_at IS NOT NULL AND OLD.returned_at IS NULL THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'asset','asset_returned',
      'Asset returned: ' || COALESCE(v_asset.name,'(asset)') || ' [' || COALESCE(v_asset.asset_tag,'') || ']',
      NEW.return_condition, 'asset_assignments', NEW.id, NEW.returned_at, NEW.return_condition, 'employee',
      jsonb_build_object('asset_id', NEW.asset_id, 'condition', NEW.return_condition)
    );
  ELSIF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'asset','asset_acknowledged',
      'Asset receipt acknowledged: ' || COALESCE(v_asset.name,'(asset)'),
      NEW.acknowledgement_notes, 'asset_assignments', NEW.id, NEW.acknowledged_at, NULL, 'employee',
      jsonb_build_object('asset_id', NEW.asset_id)
    );
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_asset_assign_event
AFTER INSERT OR UPDATE ON public.asset_assignments
FOR EACH ROW EXECUTE FUNCTION public.tg_event_asset_assignment();

-- =========================================================
-- OFFBOARDING CASES
-- =========================================================
CREATE TABLE public.offboarding_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  reason public.offboarding_reason NOT NULL DEFAULT 'resignation',
  reason_notes text,
  notice_given_on date,
  last_working_day date,
  status public.offboarding_status NOT NULL DEFAULT 'initiated',
  exit_interview_at timestamptz,
  exit_interview_by uuid,
  exit_interview_notes text,
  exit_interview_rating int,
  rehire_eligible boolean,
  final_pay_status text,
  final_pay_processed_on date,
  knowledge_transfer_notes text,
  hr_owner_id uuid,
  manager_id uuid,
  confidential boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding_cases TO authenticated;
GRANT ALL ON public.offboarding_cases TO service_role;
ALTER TABLE public.offboarding_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offb tenant admin" ON public.offboarding_cases FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "offb employee read" ON public.offboarding_cases FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = offboarding_cases.employee_id AND e.user_id = auth.uid()));

CREATE TRIGGER trg_offb_updated BEFORE UPDATE ON public.offboarding_cases
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- OFFBOARDING CHECKLIST ITEMS
-- =========================================================
CREATE TABLE public.offboarding_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.offboarding_cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  owner_role text NOT NULL DEFAULT 'hr', -- hr|manager|employee|it|finance
  assigned_to uuid,
  asset_assignment_id uuid REFERENCES public.asset_assignments(id) ON DELETE SET NULL,
  due_date date,
  is_blocking boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid,
  completion_notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding_checklist_items TO authenticated;
GRANT ALL ON public.offboarding_checklist_items TO service_role;
ALTER TABLE public.offboarding_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offb_items tenant admin" ON public.offboarding_checklist_items FOR ALL TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')))
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));
CREATE POLICY "offb_items employee" ON public.offboarding_checklist_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.offboarding_cases c
    JOIN public.employees e ON e.id = c.employee_id
    WHERE c.id = offboarding_checklist_items.case_id AND e.user_id = auth.uid()
  ));
CREATE POLICY "offb_items employee ack" ON public.offboarding_checklist_items FOR UPDATE TO authenticated
  USING (owner_role = 'employee' AND EXISTS (
    SELECT 1 FROM public.offboarding_cases c
    JOIN public.employees e ON e.id = c.employee_id
    WHERE c.id = offboarding_checklist_items.case_id AND e.user_id = auth.uid()
  ))
  WITH CHECK (owner_role = 'employee' AND EXISTS (
    SELECT 1 FROM public.offboarding_cases c
    JOIN public.employees e ON e.id = c.employee_id
    WHERE c.id = offboarding_checklist_items.case_id AND e.user_id = auth.uid()
  ));

CREATE TRIGGER trg_offb_items_updated BEFORE UPDATE ON public.offboarding_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default checklist on case insert + auto-create return tasks for outstanding assets
CREATE OR REPLACE FUNCTION public.tg_offboarding_seed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_due date;
BEGIN
  v_due := COALESCE(NEW.last_working_day, (current_date + INTERVAL '14 days')::date);
  INSERT INTO public.offboarding_checklist_items (tenant_id, case_id, title, category, owner_role, due_date, is_blocking, sort_order) VALUES
    (NEW.tenant_id, NEW.id, 'Acknowledge resignation / termination letter', 'hr', 'hr', v_due, true, 10),
    (NEW.tenant_id, NEW.id, 'Conduct exit interview', 'hr', 'hr', v_due, false, 20),
    (NEW.tenant_id, NEW.id, 'Knowledge transfer plan & handover', 'work', 'manager', v_due, true, 30),
    (NEW.tenant_id, NEW.id, 'Revoke system access (email, SSO, VPN, apps)', 'it', 'it', v_due, true, 40),
    (NEW.tenant_id, NEW.id, 'Final payroll & severance calculation', 'finance', 'hr', v_due, true, 50),
    (NEW.tenant_id, NEW.id, 'Issue experience / relieving letter', 'hr', 'hr', v_due, false, 60),
    (NEW.tenant_id, NEW.id, 'Return ID badge & office keys', 'assets', 'employee', v_due, true, 70),
    (NEW.tenant_id, NEW.id, 'Update org chart & notify team', 'comms', 'manager', v_due, false, 80);

  -- Auto-create return tasks for any currently-issued assets
  FOR r IN
    SELECT aa.id AS assignment_id, a.name, a.asset_tag
    FROM public.asset_assignments aa
    JOIN public.assets a ON a.id = aa.asset_id
    WHERE aa.employee_id = NEW.employee_id AND aa.returned_at IS NULL
  LOOP
    INSERT INTO public.offboarding_checklist_items
      (tenant_id, case_id, title, category, owner_role, asset_assignment_id, due_date, is_blocking, sort_order)
    VALUES
      (NEW.tenant_id, NEW.id, 'Return asset: ' || COALESCE(r.name,'(asset)') || ' [' || COALESCE(r.asset_tag,'') || ']',
       'assets', 'employee', r.assignment_id, v_due, true, 100);
  END LOOP;

  -- Timeline
  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'offboarding','offboarding_initiated',
    'Offboarding initiated (' || NEW.reason || ')', NEW.reason_notes,
    'offboarding_cases', NEW.id, NEW.created_at, NULL,
    CASE WHEN NEW.confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
    jsonb_build_object('reason', NEW.reason, 'last_working_day', NEW.last_working_day)
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_offboarding_seed
AFTER INSERT ON public.offboarding_cases
FOR EACH ROW EXECUTE FUNCTION public.tg_offboarding_seed();

CREATE OR REPLACE FUNCTION public.tg_offboarding_status_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'offboarding','offboarding_status_changed',
      'Offboarding: ' || OLD.status || ' → ' || NEW.status, NULL,
      'offboarding_cases', NEW.id, now(), NULL,
      CASE WHEN NEW.confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
    IF NEW.status = 'completed' THEN
      UPDATE public.employees SET status = 'terminated', termination_date = COALESCE(NEW.last_working_day, current_date)
      WHERE id = NEW.employee_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_offboarding_status_event
AFTER UPDATE ON public.offboarding_cases
FOR EACH ROW EXECUTE FUNCTION public.tg_offboarding_status_event();
