
CREATE TABLE public.employee_payroll_details (
  employee_id uuid PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_number text,
  bank_name text,
  bank_bsb text,
  bank_account_number text,
  bank_account_name text,
  tfn text,
  super_fund_name text,
  super_member_number text,
  next_of_kin_name text,
  next_of_kin_relationship text,
  next_of_kin_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_payroll_details TO authenticated;
GRANT ALL ON public.employee_payroll_details TO service_role;

ALTER TABLE public.employee_payroll_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee reads own payroll details" ON public.employee_payroll_details
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "employee updates own payroll details" ON public.employee_payroll_details
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "org admin manages tenant payroll details" ON public.employee_payroll_details
  FOR ALL USING (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "super admin all payroll details" ON public.employee_payroll_details
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_employee_payroll_details_updated_at
  BEFORE UPDATE ON public.employee_payroll_details
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
