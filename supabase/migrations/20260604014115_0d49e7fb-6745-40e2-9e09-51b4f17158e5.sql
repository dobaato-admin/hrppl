
-- enums
CREATE TYPE public.leave_request_status AS ENUM ('pending','approved','rejected','cancelled');

-- leave_types
CREATE TABLE public.leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  annual_quota_days numeric NOT NULL DEFAULT 0,
  accrual_per_month numeric NOT NULL DEFAULT 0,
  requires_approval boolean NOT NULL DEFAULT true,
  is_paid boolean NOT NULL DEFAULT true,
  allow_half_day boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_types TO authenticated;
GRANT ALL ON public.leave_types TO service_role;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant leave types" ON public.leave_types
  FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant leave types" ON public.leave_types
  FOR ALL USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "regional admin reads scoped leave types" ON public.leave_types
  FOR SELECT USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = leave_types.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));
CREATE POLICY "super admin all leave types" ON public.leave_types
  FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER touch_leave_types_updated BEFORE UPDATE ON public.leave_types
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- leave_balances
CREATE TABLE public.leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  year int NOT NULL,
  accrued_days numeric NOT NULL DEFAULT 0,
  used_days numeric NOT NULL DEFAULT 0,
  pending_days numeric NOT NULL DEFAULT 0,
  carried_over_days numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_balances TO authenticated;
GRANT ALL ON public.leave_balances TO service_role;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own balance" ON public.leave_balances
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_balances.employee_id AND e.user_id = auth.uid()));
CREATE POLICY "org members read tenant balances" ON public.leave_balances
  FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant balances" ON public.leave_balances
  FOR ALL USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "regional admin reads scoped balances" ON public.leave_balances
  FOR SELECT USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = leave_balances.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));
CREATE POLICY "super admin all balances" ON public.leave_balances
  FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER touch_leave_balances_updated BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- leave_requests
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL,
  half_day_start boolean NOT NULL DEFAULT false,
  half_day_end boolean NOT NULL DEFAULT false,
  reason text,
  status public.leave_request_status NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (days > 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Employee read own + create own + cancel own pending
CREATE POLICY "employee reads own requests" ON public.leave_requests
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND e.user_id = auth.uid()));
CREATE POLICY "employee creates own request" ON public.leave_requests
  FOR INSERT WITH CHECK (
    status = 'pending'
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND e.user_id = auth.uid() AND e.tenant_id = leave_requests.tenant_id)
  );
CREATE POLICY "employee cancels own pending request" ON public.leave_requests
  FOR UPDATE USING (
    status = 'pending'
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND e.user_id = auth.uid())
  ) WITH CHECK (
    status IN ('pending','cancelled')
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND e.user_id = auth.uid())
  );

-- Org members read tenant requests
CREATE POLICY "org members read tenant requests" ON public.leave_requests
  FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));

-- Org admin manages tenant requests (approve/reject)
CREATE POLICY "org admin manages tenant requests" ON public.leave_requests
  FOR ALL USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

-- Manager approves tenant requests
CREATE POLICY "manager approves tenant requests" ON public.leave_requests
  FOR UPDATE USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "regional admin reads scoped requests" ON public.leave_requests
  FOR SELECT USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = leave_requests.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));

CREATE POLICY "super admin all requests" ON public.leave_requests
  FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER touch_leave_requests_updated BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX leave_requests_tenant_status_idx ON public.leave_requests (tenant_id, status);
CREATE INDEX leave_requests_employee_idx ON public.leave_requests (employee_id, start_date);
CREATE INDEX leave_balances_employee_year_idx ON public.leave_balances (employee_id, year);
