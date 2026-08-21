
-- Enum for payroll run status
DO $$ BEGIN
  CREATE TYPE public.payroll_run_status AS ENUM ('draft','computed','approved','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- payroll_runs
CREATE TABLE public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  country_code text NOT NULL,
  currency_code text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  pay_date date NOT NULL,
  status public.payroll_run_status NOT NULL DEFAULT 'draft',
  template_id uuid,
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  computed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_start, period_end)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_runs TO authenticated;
GRANT ALL ON public.payroll_runs TO service_role;

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin all payroll runs" ON public.payroll_runs
  FOR ALL USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "regional admin reads scoped payroll runs" ON public.payroll_runs
  FOR SELECT USING (
    public.has_role(auth.uid(),'regional_admin')
    AND public.has_country_scope(auth.uid(), country_code)
  );

CREATE POLICY "org admin manages own tenant runs" ON public.payroll_runs
  FOR ALL USING (
    public.has_role(auth.uid(),'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  ) WITH CHECK (
    public.has_role(auth.uid(),'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  );

CREATE POLICY "org members read own tenant runs" ON public.payroll_runs
  FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE TRIGGER trg_payroll_runs_touch BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lock approved runs
CREATE OR REPLACE FUNCTION public.guard_payroll_run_locked()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'approved' THEN RAISE EXCEPTION 'Approved payroll run is locked'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.status = 'approved' AND NEW.status = 'approved' THEN
    -- allow only no-op or notes/totals immutability already satisfied by not changing core fields
    IF NEW.period_start <> OLD.period_start
       OR NEW.period_end <> OLD.period_end
       OR NEW.pay_date <> OLD.pay_date
       OR NEW.tenant_id <> OLD.tenant_id
       OR NEW.totals::text <> OLD.totals::text THEN
      RAISE EXCEPTION 'Approved payroll run is locked';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_payroll_runs_guard
  BEFORE UPDATE OR DELETE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.guard_payroll_run_locked();

-- payroll_payslips
CREATE TABLE public.payroll_payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  template_id uuid,
  currency_code text NOT NULL,
  gross numeric NOT NULL DEFAULT 0,
  taxable_base numeric NOT NULL DEFAULT 0,
  income_tax numeric NOT NULL DEFAULT 0,
  employee_contributions numeric NOT NULL DEFAULT 0,
  employer_contributions numeric NOT NULL DEFAULT 0,
  allowances numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, employee_id)
);

CREATE INDEX idx_payslips_employee ON public.payroll_payslips(employee_id);
CREATE INDEX idx_payslips_run ON public.payroll_payslips(run_id);
CREATE INDEX idx_payslips_tenant ON public.payroll_payslips(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_payslips TO authenticated;
GRANT ALL ON public.payroll_payslips TO service_role;

ALTER TABLE public.payroll_payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admin all payslips" ON public.payroll_payslips
  FOR ALL USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "regional admin reads scoped payslips" ON public.payroll_payslips
  FOR SELECT USING (
    public.has_role(auth.uid(),'regional_admin')
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = payroll_payslips.tenant_id
        AND public.has_country_scope(auth.uid(), t.country_code)
    )
  );

CREATE POLICY "org admin manages own tenant payslips" ON public.payroll_payslips
  FOR ALL USING (
    public.has_role(auth.uid(),'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  ) WITH CHECK (
    public.has_role(auth.uid(),'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  );

CREATE POLICY "org members read own tenant payslips" ON public.payroll_payslips
  FOR SELECT USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "employee reads own payslip" ON public.payroll_payslips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = payroll_payslips.employee_id
        AND e.user_id = auth.uid()
    )
  );

CREATE TRIGGER trg_payslips_touch BEFORE UPDATE ON public.payroll_payslips
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lock payslips when run is approved
CREATE OR REPLACE FUNCTION public.guard_payslip_locked()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE st public.payroll_run_status;
BEGIN
  SELECT status INTO st FROM public.payroll_runs
    WHERE id = COALESCE(NEW.run_id, OLD.run_id);
  IF st = 'approved' THEN
    RAISE EXCEPTION 'Cannot modify payslip of an approved run';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_payslips_guard
  BEFORE UPDATE OR DELETE ON public.payroll_payslips
  FOR EACH ROW EXECUTE FUNCTION public.guard_payslip_locked();
