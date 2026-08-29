-- Acting-tenant selection for tenantless platform admins (super_admin /
-- regional_admin). Wave 1 scoped every tenant-owned query by tenant_id,
-- which correctly leaves these accounts with nothing to see since
-- profiles.tenant_id is NULL for them by design. This table lets them pick a
-- tenant to act within; getTenantId() (src/lib/tenant-scope.ts) falls back to
-- it when profiles.tenant_id is null. One row per user = current acting
-- tenant; switching upserts, clearing deletes the row.
--
-- RLS is the real boundary (has_role + has_country_scope for regional_admin);
-- the setActingTenant server fn re-checks for a readable error message, not
-- because RLS is untrusted.

CREATE TABLE IF NOT EXISTS public.platform_acting_tenant (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  set_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_acting_tenant TO authenticated;
GRANT ALL ON public.platform_acting_tenant TO service_role;
ALTER TABLE public.platform_acting_tenant ENABLE ROW LEVEL SECURITY;

-- super_admin may act as any tenant.
DROP POLICY IF EXISTS "acting tenant super admin" ON public.platform_acting_tenant;
CREATE POLICY "acting tenant super admin" ON public.platform_acting_tenant
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- regional_admin may only act as a tenant within their role_scope countries.
-- USING and WITH CHECK both carry the scope predicate — USING alone would
-- still let a row be moved to an out-of-scope tenant on update (same
-- reasoning as the wfh_requests policies in 20260823060000).
DROP POLICY IF EXISTS "acting tenant regional admin scoped" ON public.platform_acting_tenant;
CREATE POLICY "acting tenant regional admin scoped" ON public.platform_acting_tenant
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'regional_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = platform_acting_tenant.tenant_id
        AND public.has_country_scope(auth.uid(), t.country_code)
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_role(auth.uid(), 'regional_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = platform_acting_tenant.tenant_id
        AND public.has_country_scope(auth.uid(), t.country_code)
    )
  );
