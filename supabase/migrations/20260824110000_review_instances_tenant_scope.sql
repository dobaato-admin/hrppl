-- review_instances (20260618042929) and review_instance_versions
-- (20260618043914) both have a role check with no tenant predicate at all on
-- their SELECT policy: any org_admin, manager, or super_admin — from ANY
-- tenant — could read every tenant's scorecards, scores, evidence links, and
-- reviewer comments. This is the same class of bug flagged for
-- offboarding/employees in Wave 1 ("super admin all employees" with no
-- tenant predicate), except here it also caught org_admin and manager, who
-- are meant to be tenant-scoped roles, not just super_admin's documented
-- platform-wide policies.
--
-- super_admin keeps its unconditional read/write, matching the existing
-- convention elsewhere in the schema (RLS is not the *scope* for platform
-- accounts, the server query layer is — see src/lib/tenant-scope.ts). The
-- fix narrows org_admin/manager to their own tenant.
--
-- review_instances' UPDATE policy's WITH CHECK already required a tenant
-- match, but with no super_admin escape — meaning a super_admin could never
-- actually complete a review decision (only read one). Its USING clause had
-- the same unrestricted role check as SELECT. Both are tightened here.

DROP POLICY IF EXISTS "employee read own instances" ON public.review_instances;
CREATE POLICY "employee read own instances"
  ON public.review_instances FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.employees e
            WHERE e.id = review_instances.employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'super_admin')
    OR (
      (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'manager'))
      AND EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
    )
  );

DROP POLICY IF EXISTS "employee submit own instance" ON public.review_instances;
CREATE POLICY "employee submit own instance"
  ON public.review_instances FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.employees e
            WHERE e.id = review_instances.employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'super_admin')
    OR (
      (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'manager'))
      AND EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR EXISTS (SELECT 1 FROM public.profiles p
               WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
  );

DROP POLICY IF EXISTS "employee/admin read versions" ON public.review_instance_versions;
CREATE POLICY "employee/admin read versions"
  ON public.review_instance_versions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.review_instances ri
            JOIN public.employees e ON e.id = ri.employee_id
            WHERE ri.id = review_instance_versions.instance_id
              AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'super_admin')
    OR (
      (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'manager'))
      AND EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid() AND p.tenant_id = review_instance_versions.tenant_id)
    )
  );
