
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'branch_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

ALTER TABLE public.role_scope
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role public.app_role;

ALTER TABLE public.role_scope ALTER COLUMN country_code DROP NOT NULL;

ALTER TABLE public.role_scope DROP CONSTRAINT IF EXISTS role_scope_user_id_country_code_key;

-- PG15 NULLS NOT DISTINCT lets us avoid COALESCE-in-index
CREATE UNIQUE INDEX IF NOT EXISTS role_scope_user_role_unique
  ON public.role_scope (user_id, role, country_code, tenant_id, branch_id)
  NULLS NOT DISTINCT;
