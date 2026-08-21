
-- Super funds (per tenant directory)
CREATE TABLE public.super_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  fund_type text NOT NULL DEFAULT 'apra' CHECK (fund_type IN ('apra','smsf')),
  abn text,
  usi text,
  smsf_esa text,
  smsf_bsb text,
  smsf_account_number text,
  smsf_account_name text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_super_funds_tenant ON public.super_funds(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_funds TO authenticated;
GRANT ALL ON public.super_funds TO service_role;
ALTER TABLE public.super_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_funds tenant read" ON public.super_funds FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_funds admin write" ON public.super_funds FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id));
CREATE TRIGGER touch_super_funds BEFORE UPDATE ON public.super_funds FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Employee fund choice
CREATE TABLE public.employee_super_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  super_fund_id uuid NOT NULL REFERENCES public.super_funds(id),
  member_number text,
  effective_from date NOT NULL DEFAULT current_date,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_emp_super_employee ON public.employee_super_choices(employee_id, effective_from DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_super_choices TO authenticated;
GRANT ALL ON public.employee_super_choices TO service_role;
ALTER TABLE public.employee_super_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emp_super tenant read" ON public.employee_super_choices FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "emp_super admin write" ON public.employee_super_choices FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id));
CREATE TRIGGER touch_emp_super BEFORE UPDATE ON public.employee_super_choices FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Super batches (remittance to clearing house / SuperStream)
CREATE TABLE public.super_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  payment_due_date date NOT NULL,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  contribution_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','submitted','paid','failed','cancelled')),
  gateway text NOT NULL DEFAULT 'manual',
  gateway_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  gateway_message_id text,
  payload jsonb,
  response jsonb,
  error_message text,
  submitted_at timestamptz,
  paid_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_super_batches_tenant_period ON public.super_batches(tenant_id, period_end DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_batches TO authenticated;
GRANT ALL ON public.super_batches TO service_role;
ALTER TABLE public.super_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_batches tenant read" ON public.super_batches FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_batches finance write" ON public.super_batches FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id));
CREATE TRIGGER touch_super_batches BEFORE UPDATE ON public.super_batches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Super contributions (per payslip / per fund)
CREATE TABLE public.super_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  run_id uuid REFERENCES public.payroll_runs(id) ON DELETE SET NULL,
  payslip_id uuid REFERENCES public.payroll_payslips(id) ON DELETE SET NULL,
  super_fund_id uuid NOT NULL REFERENCES public.super_funds(id),
  member_number text,
  contribution_type text NOT NULL CHECK (contribution_type IN ('SG','salary_sacrifice','employer_additional','member_voluntary','spouse')),
  ote_base numeric(14,2),
  amount numeric(14,2) NOT NULL,
  pay_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','queued','sent','paid','failed','cancelled')),
  batch_id uuid REFERENCES public.super_batches(id) ON DELETE SET NULL,
  payment_due_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_super_contrib_tenant ON public.super_contributions(tenant_id, pay_date DESC);
CREATE INDEX idx_super_contrib_batch ON public.super_contributions(batch_id);
CREATE INDEX idx_super_contrib_employee ON public.super_contributions(employee_id, pay_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_contributions TO authenticated;
GRANT ALL ON public.super_contributions TO service_role;
ALTER TABLE public.super_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_contrib tenant read" ON public.super_contributions FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_contrib self read" ON public.super_contributions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));
CREATE POLICY "super_contrib finance write" ON public.super_contributions FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_finance(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));
CREATE TRIGGER touch_super_contrib BEFORE UPDATE ON public.super_contributions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
