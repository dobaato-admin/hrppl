
-- is_org_admin: super_admin OR org_admin in the given tenant
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'super_admin'::app_role)
      OR (public.has_role(_user_id, 'org_admin'::app_role)
          AND public.user_tenant_id(_user_id) = _tenant_id);
$$;

-- is_hr: tenant-scoped HR
CREATE OR REPLACE FUNCTION public.is_hr(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'hr'::app_role)
     AND public.user_tenant_id(_user_id) = _tenant_id;
$$;

-- is_finance: tenant-scoped finance
CREATE OR REPLACE FUNCTION public.is_finance(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'finance'::app_role)
     AND public.user_tenant_id(_user_id) = _tenant_id;
$$;

-- is_branch_admin: tenant-scoped branch_admin
CREATE OR REPLACE FUNCTION public.is_branch_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'branch_admin'::app_role)
     AND public.user_tenant_id(_user_id) = _tenant_id;
$$;

-- has_branch_access: true if user can act on rows belonging to a branch.
-- super_admin / org_admin (of that tenant) always pass. Other roles must have a
-- role_scope row for that branch, or one with branch_id IS NULL matching tenant.
CREATE OR REPLACE FUNCTION public.has_branch_access(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _branch_id IS NULL THEN true  -- row not yet branch-tagged; defer to tenant check
    WHEN public.has_role(_user_id, 'super_admin'::app_role) THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.tenant_branches b
      WHERE b.id = _branch_id
        AND public.is_org_admin(_user_id, b.tenant_id)
    ) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.role_scope rs
      JOIN public.tenant_branches b ON b.id = _branch_id
      WHERE rs.user_id = _user_id
        AND (rs.branch_id = _branch_id
             OR (rs.branch_id IS NULL AND rs.tenant_id = b.tenant_id))
    )
  END;
$$;

-- is_manager_of: true when _user_id is the manager_id of _employee_id's record
CREATE OR REPLACE FUNCTION public.is_manager_of(_user_id uuid, _employee_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = _employee_id
      AND e.manager_id = public.my_employee_id(_user_id)
  );
$$;

-- can_see_confidential: super_admin OR org_admin(tenant) OR hr(tenant)
CREATE OR REPLACE FUNCTION public.can_see_confidential(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_org_admin(_user_id, _tenant_id)
      OR public.is_hr(_user_id, _tenant_id);
$$;
