
-- 1) audit_log: lock writes to service_role only via RESTRICTIVE policy
CREATE POLICY "audit_log service_role writes only"
ON public.audit_log AS RESTRICTIVE
FOR ALL TO authenticated
USING (false) WITH CHECK (false);

-- 2) id_request_audit_log: replace ALL-admin policy with read-only for admins
DROP POLICY IF EXISTS "id_req_audit admin manage" ON public.id_request_audit_log;
CREATE POLICY "id_req_audit admin read"
ON public.id_request_audit_log
FOR SELECT
USING (
  ((tenant_id = user_tenant_id(auth.uid()))
    AND (has_role(auth.uid(), 'org_admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "id_req_audit service_role writes only"
ON public.id_request_audit_log AS RESTRICTIVE
FOR ALL TO authenticated
USING (false) WITH CHECK (false);

-- 3) super_contributions: drop broad tenant read; add finance/HR/admin read
DROP POLICY IF EXISTS "super_contrib tenant read" ON public.super_contributions;
CREATE POLICY "super_contrib finance read"
ON public.super_contributions
FOR SELECT TO authenticated
USING (
  is_org_admin(auth.uid(), tenant_id)
  OR is_finance(auth.uid(), tenant_id)
  OR is_hr(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4) super_batches: drop broad tenant read; add finance/admin read
DROP POLICY IF EXISTS "super_batches tenant read" ON public.super_batches;
CREATE POLICY "super_batches finance read"
ON public.super_batches
FOR SELECT TO authenticated
USING (
  is_org_admin(auth.uid(), tenant_id)
  OR is_finance(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 5) blog_access_audit: explicit service_role-only writes via RESTRICTIVE policy
CREATE POLICY "blog_access_audit service_role writes only"
ON public.blog_access_audit AS RESTRICTIVE
FOR ALL TO authenticated
USING (false) WITH CHECK (false);
