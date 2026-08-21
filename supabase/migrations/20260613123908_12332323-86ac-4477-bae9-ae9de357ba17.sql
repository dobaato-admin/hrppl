
CREATE TABLE public.tenant_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  country_code text NOT NULL REFERENCES public.countries(code),
  currency_code text NOT NULL,
  timezone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  contact_name text,
  contact_email text,
  contact_phone text,
  holiday_category_id uuid REFERENCES public.public_holiday_categories(id) ON DELETE SET NULL,
  is_headquarters boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX idx_tenant_branches_tenant ON public.tenant_branches(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_branches TO authenticated;
GRANT ALL ON public.tenant_branches TO service_role;

ALTER TABLE public.tenant_branches ENABLE ROW LEVEL SECURITY;

-- Everyone in the same tenant can view branches
CREATE POLICY "Tenant members view branches"
ON public.tenant_branches FOR SELECT TO authenticated
USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));

-- Only org_admins of the tenant (or super admin) can manage branches
CREATE POLICY "Org admins insert branches"
ON public.tenant_branches FOR INSERT TO authenticated
WITH CHECK (
  (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
  OR public.has_role(auth.uid(),'super_admin')
);

CREATE POLICY "Org admins update branches"
ON public.tenant_branches FOR UPDATE TO authenticated
USING (
  (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
  OR public.has_role(auth.uid(),'super_admin')
)
WITH CHECK (
  (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
  OR public.has_role(auth.uid(),'super_admin')
);

CREATE POLICY "Org admins delete branches"
ON public.tenant_branches FOR DELETE TO authenticated
USING (
  (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
  OR public.has_role(auth.uid(),'super_admin')
);

CREATE TRIGGER trg_tenant_branches_updated_at
BEFORE UPDATE ON public.tenant_branches
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
