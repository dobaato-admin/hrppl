
CREATE TABLE public.payroll_underpayment_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  payslip_id uuid NOT NULL REFERENCES public.payroll_payslips(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  classification_id uuid REFERENCES public.award_classifications(id) ON DELETE SET NULL,
  pay_date date NOT NULL,
  ordinary_hours numeric(10,2) NOT NULL,
  paid_ordinary_earnings numeric(14,2) NOT NULL,
  paid_hourly_rate numeric(12,4) NOT NULL,
  award_hourly_rate numeric(12,4) NOT NULL,
  shortfall_per_hour numeric(12,4) NOT NULL,
  shortfall_total numeric(14,2) NOT NULL,
  casual boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  notes text,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (payslip_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_underpayment_findings TO authenticated;
GRANT ALL ON public.payroll_underpayment_findings TO service_role;

ALTER TABLE public.payroll_underpayment_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins and HR can view underpayment findings"
  ON public.payroll_underpayment_findings FOR SELECT TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "Org admins and HR can manage underpayment findings"
  ON public.payroll_underpayment_findings FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));

CREATE INDEX idx_underpayment_findings_tenant_status
  ON public.payroll_underpayment_findings(tenant_id, status);
CREATE INDEX idx_underpayment_findings_employee
  ON public.payroll_underpayment_findings(employee_id);

CREATE TRIGGER trg_underpayment_findings_touch
  BEFORE UPDATE ON public.payroll_underpayment_findings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
