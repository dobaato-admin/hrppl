
ALTER TABLE public.expense_categories
  ADD COLUMN IF NOT EXISTS tax_rate numeric(6,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_code text,
  ADD COLUMN IF NOT EXISTS daily_limit numeric,
  ADD COLUMN IF NOT EXISTS monthly_limit numeric;

CREATE TABLE IF NOT EXISTS public.expense_approval_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  min_amount numeric NOT NULL DEFAULT 0,
  max_amount numeric,
  approver_id uuid NOT NULL,
  priority int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_approval_rules TO authenticated;
GRANT ALL ON public.expense_approval_rules TO service_role;

ALTER TABLE public.expense_approval_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members read approval rules"
  ON public.expense_approval_rules FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "Org admins manage approval rules insert"
  ON public.expense_approval_rules FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE POLICY "Org admins manage approval rules update"
  ON public.expense_approval_rules FOR UPDATE TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE POLICY "Org admins manage approval rules delete"
  ON public.expense_approval_rules FOR DELETE TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE INDEX IF NOT EXISTS expense_approval_rules_tenant_idx ON public.expense_approval_rules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS expense_approval_rules_dept_idx ON public.expense_approval_rules(department_id);

CREATE TRIGGER expense_approval_rules_touch_updated_at
  BEFORE UPDATE ON public.expense_approval_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
