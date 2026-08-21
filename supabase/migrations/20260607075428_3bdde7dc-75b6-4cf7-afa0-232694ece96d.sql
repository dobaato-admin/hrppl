
-- Phase 4: Tenant-scoped payroll setup expansion

CREATE TABLE IF NOT EXISTS public.tenant_payroll_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  pay_period text NOT NULL DEFAULT 'monthly' CHECK (pay_period IN ('weekly','fortnightly','semimonthly','monthly')),
  standard_hours_per_day numeric(5,2) NOT NULL DEFAULT 8.0,
  standard_days_per_week numeric(3,1) NOT NULL DEFAULT 5.0,
  meal_break_minutes integer NOT NULL DEFAULT 30,
  rest_break_minutes integer NOT NULL DEFAULT 15,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_payroll_settings TO authenticated;
GRANT ALL ON public.tenant_payroll_settings TO service_role;
ALTER TABLE public.tenant_payroll_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read payroll settings" ON public.tenant_payroll_settings
  FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "org admin manages payroll settings" ON public.tenant_payroll_settings
  FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_tps_updated BEFORE UPDATE ON public.tenant_payroll_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Components (tax, PF, retirement, allowance, etc.) at tenant level
CREATE TABLE IF NOT EXISTS public.payroll_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('tax','pf','retirement','allowance','deduction','other')),
  calc_type text NOT NULL CHECK (calc_type IN ('flat','pct_of_basic','pct_of_gross')),
  rate numeric(10,4) NOT NULL DEFAULT 0,
  is_taxable boolean NOT NULL DEFAULT false,
  show_on_payslip boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code, department_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_components TO authenticated;
GRANT ALL ON public.payroll_components TO service_role;
ALTER TABLE public.payroll_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read components" ON public.payroll_components
  FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "org admin manages components" ON public.payroll_components
  FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_pc_updated BEFORE UPDATE ON public.payroll_components
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_payroll_components_tenant ON public.payroll_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_components_dept ON public.payroll_components(department_id);
