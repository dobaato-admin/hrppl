-- Offboarding: let HR run cases, and stop the UI gate disagreeing with the DB.
--
-- The original policy (20260606100321_5a3bc320-adf9-4063-a8d6-59bdf121f492.sql
-- :181-185) admitted org_admin | super_admin | manager. It is the only policy
-- ever defined on this table -- no later migration revises it, so this file is
-- the second revision, not a rebuild of a stale copy.
--
-- Meanwhile the route was gated with ADMIN_LAYOUT_ROLES, which admits hr,
-- finance, branch_admin and regional_admin. So an HR user reached the page and
-- the database rejected their insert with
-- "new row violates row-level security policy for table offboarding_cases".
--
-- Offboarding is an HR function, so the fix is to admit hr here rather than to
-- shut HR out of the page. finance / branch_admin / regional_admin are
-- deliberately NOT added -- the route gate now narrows to match this set
-- exactly (src/lib/rbac.ts OFFBOARDING_ROLES).
--
-- Note this does NOT address cross-tenant selection: WITH CHECK still requires
-- tenant_id = user_tenant_id(auth.uid()), which is correct. That failure mode
-- was caused by the employee picker leaking other tenants' rows and is fixed in
-- application code (src/lib/tenant-scope.ts).

DROP POLICY IF EXISTS "offb tenant admin" ON public.offboarding_cases;

CREATE POLICY "offb tenant admin" ON public.offboarding_cases FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'hr')
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'hr')
    )
  );

-- The child table follows the same access rule; keep it in step so HR can
-- actually work a case rather than only create one.
--
-- Note the policy name uses an UNDERSCORE ("offb_items"), unlike the parent
-- table's ("offb tenant admin"). Getting this wrong matters: DROP ... IF EXISTS
-- on a non-matching name silently succeeds, and the CREATE below would then add
-- a SECOND permissive policy alongside the original. Permissive policies OR
-- together, so that widens access instead of replacing it. Verified against
-- pg_policies before writing.
DROP POLICY IF EXISTS "offb_items tenant admin" ON public.offboarding_checklist_items;

CREATE POLICY "offb_items tenant admin" ON public.offboarding_checklist_items FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'hr')
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'hr')
    )
  );
