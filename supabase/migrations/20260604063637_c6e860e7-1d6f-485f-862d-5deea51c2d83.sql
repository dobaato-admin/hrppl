
-- Enum
DO $$ BEGIN
  CREATE TYPE public.timesheet_status AS ENUM ('draft','submitted','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- attendance_entries
CREATE TABLE public.attendance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  work_date date NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes integer NOT NULL DEFAULT 0,
  hours_worked numeric(6,2) NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'web',
  notes text,
  status text NOT NULL DEFAULT 'open',
  timesheet_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_entries TO authenticated;
GRANT ALL ON public.attendance_entries TO service_role;
ALTER TABLE public.attendance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee manages own attendance" ON public.attendance_entries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = attendance_entries.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = attendance_entries.employee_id AND e.user_id = auth.uid() AND e.tenant_id = attendance_entries.tenant_id));

CREATE POLICY "manager reads tenant attendance" ON public.attendance_entries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant attendance" ON public.attendance_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "regional reads scoped attendance" ON public.attendance_entries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = attendance_entries.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));

CREATE POLICY "super admin all attendance" ON public.attendance_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER attendance_entries_touch BEFORE UPDATE ON public.attendance_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX attendance_entries_tenant_date_idx ON public.attendance_entries (tenant_id, work_date);
CREATE INDEX attendance_entries_employee_date_idx ON public.attendance_entries (employee_id, work_date);

-- timesheets
CREATE TABLE public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_hours numeric(8,2) NOT NULL DEFAULT 0,
  overtime_hours numeric(8,2) NOT NULL DEFAULT 0,
  status public.timesheet_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  submitted_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  rejection_reason text,
  notes text,
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, period_start, period_end)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.timesheets TO authenticated;
GRANT ALL ON public.timesheets TO service_role;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND e.user_id = auth.uid()));

CREATE POLICY "employee inserts own timesheet" ON public.timesheets
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND e.user_id = auth.uid() AND e.tenant_id = timesheets.tenant_id));

CREATE POLICY "employee updates own draft timesheet" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (status IN ('draft','submitted','rejected') AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND e.user_id = auth.uid()));

CREATE POLICY "manager reads tenant timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "manager updates tenant timesheets" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "regional reads scoped timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = timesheets.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));

CREATE POLICY "super admin all timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER timesheets_touch BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX timesheets_tenant_period_idx ON public.timesheets (tenant_id, period_start, period_end);
CREATE INDEX timesheets_status_idx ON public.timesheets (tenant_id, status);
