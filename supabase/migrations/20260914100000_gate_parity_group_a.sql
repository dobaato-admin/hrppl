-- =============================================================================
-- Gate parity, group A: let two pages work for the roles they already offer
-- =============================================================================
--
-- Found by `tests/server-fn-role-parity.test.ts`, which compares a page's
-- feature key against the server functions it calls AS IT LOADS. Both of these
-- rendered as an empty surface rather than a refusal.
--
-- Widening the server guard alone would only have moved each failure from
-- "Forbidden" to a Postgres policy error, which is the trap the X-07 write-up
-- warns about. So the policies move in the same change as the guards.

-- -----------------------------------------------------------------------------
-- 1. white_label_settings — org_admin manages its own tenant's branding
-- -----------------------------------------------------------------------------
--
-- `org.whiteLabel` has admitted `super_admin` and `org_admin` since Wave 5,
-- which recorded "/org/white-label locking out org_admin" as one of the eleven
-- nav-vs-inline-check disagreements it converged. It fixed the page. It did not
-- fix `getMyWhiteLabel`, which still demanded super_admin, and it could not have
-- fixed this: **both policies on the table are super_admin-only**, so an
-- org_admin had no read path to their own tenant's logo and colours.
--
-- This is a tenant's own branding. The owner of the tenant is the right person
-- to set it, and `tenant_id = user_tenant_id(...)` keeps them inside it.
DROP POLICY IF EXISTS "org admin manages own white-label" ON public.white_label_settings;
CREATE POLICY "org admin manages own white-label" ON public.white_label_settings
  FOR ALL TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'org_admin'::app_role)
    AND tenant_id = public.user_tenant_id((SELECT auth.uid()))
  )
  WITH CHECK (
    public.has_role((SELECT auth.uid()), 'org_admin'::app_role)
    AND tenant_id = public.user_tenant_id((SELECT auth.uid()))
  );

-- -----------------------------------------------------------------------------
-- 2. Payroll configuration — finance may write it, not just read it
-- -----------------------------------------------------------------------------
--
-- `org.payrollSetup` admits `super_admin`, `org_admin` and `finance`, and
-- finance is there deliberately: configuring pay components and pay cadence is
-- the finance role's job.
--
-- The existing policies split differently. "tenant members read …" lets ANY
-- member of the tenant SELECT, so finance could always have read this; it was
-- the server guard (`assertOrgAdmin`) that refused them, which is why the page
-- came back empty. But the write policies are org_admin-only, so widening the
-- guard without this would have let finance open the wizard, fill it in, press
-- Save, and receive a row-level-security error.
--
-- Note this is a real widening: finance can now change how everyone is paid.
-- That is what the feature key has claimed since it was written, and a key that
-- claims something the database refuses is the defect being closed here.
DROP POLICY IF EXISTS "finance manages payroll settings" ON public.tenant_payroll_settings;
CREATE POLICY "finance manages payroll settings" ON public.tenant_payroll_settings
  FOR ALL TO authenticated
  USING (public.is_finance((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_finance((SELECT auth.uid()), tenant_id));

DROP POLICY IF EXISTS "finance manages payroll components" ON public.payroll_components;
CREATE POLICY "finance manages payroll components" ON public.payroll_components
  FOR ALL TO authenticated
  USING (public.is_finance((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_finance((SELECT auth.uid()), tenant_id));
