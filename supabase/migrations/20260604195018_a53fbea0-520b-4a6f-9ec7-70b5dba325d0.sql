
-- Fix 1: subscription_confirmations — restrict org_admin to own tenant on both INSERT and SELECT
DROP POLICY IF EXISTS "admins insert confirmations" ON public.subscription_confirmations;
DROP POLICY IF EXISTS "admins read confirmations" ON public.subscription_confirmations;

CREATE POLICY "admins insert confirmations"
ON public.subscription_confirmations FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  OR (has_role(auth.uid(), 'regional_admin'::app_role) AND EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id = subscription_confirmations.tenant_id
          AND has_country_scope(auth.uid(), t.country_code)))
);

CREATE POLICY "admins read confirmations"
ON public.subscription_confirmations FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  OR (has_role(auth.uid(), 'regional_admin'::app_role) AND EXISTS (
        SELECT 1 FROM public.tenants t
        WHERE t.id = subscription_confirmations.tenant_id
          AND has_country_scope(auth.uid(), t.country_code)))
);

-- Fix 2: payroll_runs — regional_admin must match tenant's country, not run's country_code field
DROP POLICY IF EXISTS "regional admin reads scoped payroll runs" ON public.payroll_runs;

CREATE POLICY "regional admin reads scoped payroll runs"
ON public.payroll_runs FOR SELECT
USING (
  has_role(auth.uid(), 'regional_admin'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = payroll_runs.tenant_id
      AND has_country_scope(auth.uid(), t.country_code)
  )
);
