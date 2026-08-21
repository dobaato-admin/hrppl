
-- 1) payroll_runs: remove broad tenant-member read
DROP POLICY IF EXISTS "org members read own tenant runs" ON public.payroll_runs;

CREATE POLICY "managers read tenant payroll runs"
ON public.payroll_runs FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
);

-- org_admin already has ALL; super_admin and regional_admin already covered by existing policies.

-- 2) employee_documents: simplify contradictory visibility filter
DROP POLICY IF EXISTS "employee reads own visible docs" ON public.employee_documents;

CREATE POLICY "employee reads own visible docs"
ON public.employee_documents FOR SELECT
TO authenticated
USING (
  visibility IN ('employee', 'manager')
  AND EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_documents.employee_id
      AND e.user_id = auth.uid()
  )
);

-- 3) subscription_confirmations: scope regional_admin by country
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='subscription_confirmations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "admins read confirmations" ON public.subscription_confirmations';
    EXECUTE 'DROP POLICY IF EXISTS "admins insert confirmations" ON public.subscription_confirmations';

    EXECUTE $p$
      CREATE POLICY "admins read confirmations"
      ON public.subscription_confirmations FOR SELECT
      TO authenticated
      USING (
        has_role(auth.uid(), 'super_admin'::app_role)
        OR has_role(auth.uid(), 'org_admin'::app_role)
        OR (
          has_role(auth.uid(), 'regional_admin'::app_role)
          AND EXISTS (
            SELECT 1 FROM public.tenants t
            WHERE t.id = subscription_confirmations.tenant_id
              AND has_country_scope(auth.uid(), t.country_code)
          )
        )
      )
    $p$;

    EXECUTE $p$
      CREATE POLICY "admins insert confirmations"
      ON public.subscription_confirmations FOR INSERT
      TO authenticated
      WITH CHECK (
        has_role(auth.uid(), 'super_admin'::app_role)
        OR has_role(auth.uid(), 'org_admin'::app_role)
        OR (
          has_role(auth.uid(), 'regional_admin'::app_role)
          AND EXISTS (
            SELECT 1 FROM public.tenants t
            WHERE t.id = subscription_confirmations.tenant_id
              AND has_country_scope(auth.uid(), t.country_code)
          )
        )
      )
    $p$;
  END IF;
END $$;
