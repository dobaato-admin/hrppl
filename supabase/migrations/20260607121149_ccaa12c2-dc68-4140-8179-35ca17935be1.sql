
CREATE TABLE public.offboarding_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  reason text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX offb_tpl_tenant_idx ON public.offboarding_checklist_templates(tenant_id);
CREATE INDEX offb_tpl_dept_idx ON public.offboarding_checklist_templates(tenant_id, department_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding_checklist_templates TO authenticated;
GRANT ALL ON public.offboarding_checklist_templates TO service_role;
ALTER TABLE public.offboarding_checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offb_tpl admin read" ON public.offboarding_checklist_templates
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "offb_tpl admin write" ON public.offboarding_checklist_templates
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_offb_tpl_updated BEFORE UPDATE ON public.offboarding_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.offboarding_checklist_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.offboarding_checklist_templates(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  owner_role text NOT NULL DEFAULT 'hr',
  due_offset_days integer NOT NULL DEFAULT 0,
  is_blocking boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX offb_tpl_items_template_idx ON public.offboarding_checklist_template_items(template_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding_checklist_template_items TO authenticated;
GRANT ALL ON public.offboarding_checklist_template_items TO service_role;
ALTER TABLE public.offboarding_checklist_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offb_tpl_items admin read" ON public.offboarding_checklist_template_items
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );
CREATE POLICY "offb_tpl_items admin write" ON public.offboarding_checklist_template_items
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER tg_offb_tpl_items_updated BEFORE UPDATE ON public.offboarding_checklist_template_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Replace seed trigger to support templates with department + reason scope.
CREATE OR REPLACE FUNCTION public.tg_offboarding_seed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
  v_due date;
  v_dept uuid;
  v_template uuid;
BEGIN
  v_due := COALESCE(NEW.last_working_day, (current_date + INTERVAL '14 days')::date);
  SELECT department_id INTO v_dept FROM public.employees WHERE id = NEW.employee_id;

  -- Pick the most specific matching template:
  -- 1) dept + reason match, 2) dept match, 3) reason match, 4) tenant default
  SELECT id INTO v_template FROM public.offboarding_checklist_templates
    WHERE tenant_id = NEW.tenant_id AND is_active = true
      AND department_id = v_dept AND reason = NEW.reason::text
    ORDER BY updated_at DESC LIMIT 1;
  IF v_template IS NULL AND v_dept IS NOT NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id = v_dept AND reason IS NULL
      ORDER BY updated_at DESC LIMIT 1;
  END IF;
  IF v_template IS NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id IS NULL AND reason = NEW.reason::text
      ORDER BY updated_at DESC LIMIT 1;
  END IF;
  IF v_template IS NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id IS NULL AND reason IS NULL AND is_default = true
      ORDER BY updated_at DESC LIMIT 1;
  END IF;

  IF v_template IS NOT NULL THEN
    INSERT INTO public.offboarding_checklist_items
      (tenant_id, case_id, title, category, owner_role, due_date, is_blocking, sort_order)
    SELECT NEW.tenant_id, NEW.id, ti.title, ti.category, ti.owner_role,
      (v_due + (ti.due_offset_days || ' days')::interval)::date,
      ti.is_blocking, ti.sort_order
    FROM public.offboarding_checklist_template_items ti
    WHERE ti.template_id = v_template
    ORDER BY ti.sort_order;
  ELSE
    INSERT INTO public.offboarding_checklist_items (tenant_id, case_id, title, category, owner_role, due_date, is_blocking, sort_order) VALUES
      (NEW.tenant_id, NEW.id, 'Acknowledge resignation / termination letter', 'hr', 'hr', v_due, true, 10),
      (NEW.tenant_id, NEW.id, 'Conduct exit interview', 'hr', 'hr', v_due, false, 20),
      (NEW.tenant_id, NEW.id, 'Knowledge transfer plan & handover', 'work', 'manager', v_due, true, 30),
      (NEW.tenant_id, NEW.id, 'Revoke system access (email, SSO, VPN, apps)', 'it', 'it', v_due, true, 40),
      (NEW.tenant_id, NEW.id, 'Final payroll & severance calculation', 'finance', 'hr', v_due, true, 50),
      (NEW.tenant_id, NEW.id, 'Issue experience / relieving letter', 'hr', 'hr', v_due, false, 60),
      (NEW.tenant_id, NEW.id, 'Return ID badge & office keys', 'assets', 'employee', v_due, true, 70),
      (NEW.tenant_id, NEW.id, 'Update org chart & notify team', 'comms', 'manager', v_due, false, 80);
  END IF;

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

  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'offboarding','offboarding_initiated',
    'Offboarding initiated (' || NEW.reason || ')', NEW.reason_notes,
    'offboarding_cases', NEW.id, NEW.created_at, NULL,
    CASE WHEN NEW.confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
    jsonb_build_object('reason', NEW.reason, 'last_working_day', NEW.last_working_day)
  );
  RETURN NEW;
END $function$;
