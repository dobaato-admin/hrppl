CREATE TABLE public.employee_ytd_opening (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  financial_year integer NOT NULL,
  currency_code text NOT NULL DEFAULT 'AUD',
  gross_earnings numeric(14,2) NOT NULL DEFAULT 0,
  taxable_earnings numeric(14,2) NOT NULL DEFAULT 0,
  paye_tax numeric(14,2) NOT NULL DEFAULT 0,
  super_guarantee numeric(14,2) NOT NULL DEFAULT 0,
  super_salary_sacrifice numeric(14,2) NOT NULL DEFAULT 0,
  super_employee_voluntary numeric(14,2) NOT NULL DEFAULT 0,
  allowances numeric(14,2) NOT NULL DEFAULT 0,
  deductions numeric(14,2) NOT NULL DEFAULT 0,
  reportable_fringe_benefits numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, financial_year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_ytd_opening TO authenticated;
GRANT ALL ON public.employee_ytd_opening TO service_role;

ALTER TABLE public.employee_ytd_opening ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ytd_opening_select" ON public.employee_ytd_opening
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
    OR (public.has_role(auth.uid(),'hr') AND tenant_id = public.user_tenant_id(auth.uid()))
    OR (public.has_role(auth.uid(),'finance') AND tenant_id = public.user_tenant_id(auth.uid()))
    OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

CREATE POLICY "ytd_opening_admin_write" ON public.employee_ytd_opening
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
    OR (public.has_role(auth.uid(),'hr') AND tenant_id = public.user_tenant_id(auth.uid()))
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
    OR (public.has_role(auth.uid(),'hr') AND tenant_id = public.user_tenant_id(auth.uid()))
  );

CREATE TRIGGER employee_ytd_opening_touch
  BEFORE UPDATE ON public.employee_ytd_opening
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX employee_ytd_opening_tenant_idx ON public.employee_ytd_opening(tenant_id);
CREATE INDEX employee_ytd_opening_employee_idx ON public.employee_ytd_opening(employee_id);