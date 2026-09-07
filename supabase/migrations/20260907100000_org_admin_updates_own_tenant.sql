-- An org admin could not edit their own organisation, and nothing said so.
--
-- ---------------------------------------------------------------------------
-- What was found
-- ---------------------------------------------------------------------------
--
-- `tenants` had exactly three write policies: `super admin all tenants` (ALL),
-- `regional admin inserts scoped tenants` (INSERT) and
-- `regional admin updates scoped tenants` (UPDATE). **No UPDATE policy for
-- org_admin at all.**
--
-- The product hides this because `updateOrganizationProfile`
-- (`org-signup.functions.ts`) writes through the service-role client, which
-- bypasses RLS entirely. So the main write path to this table has no row-level
-- protection, and any code that reaches it through the *caller's* client
-- silently writes nothing: PostgREST returns 200 for an UPDATE that matches
-- zero rows, so the endpoint answers `{ ok: true }` having done nothing at all.
--
-- W7's setup guide hit exactly that. The company-profile form saved, the toast
-- said "saved", the segment stayed at 2/6, and the row was untouched.
--
-- ---------------------------------------------------------------------------
-- The fix, and why it is not simply "grant UPDATE"
-- ---------------------------------------------------------------------------
--
-- `tenants` holds `plan`, `status`, `country_code` and `slug` alongside the
-- address and the trading name. A blanket UPDATE for org_admin would let a
-- tenant set its own billing plan and lift its own suspension — a privilege
-- escalation reached through a settings form.
--
-- So: an UPDATE policy scoped to the caller's own tenant, plus a trigger that
-- refuses changes to the privileged columns. The trigger uses `auth.role()`
-- rather than `current_user`, for the reason recorded in CLAUDE.md — inside a
-- SECURITY DEFINER function `current_user` is the owner and a `current_user IN
-- ('postgres', …)` exemption matches on every call, disabling the guard
-- completely.

CREATE OR REPLACE FUNCTION public.prevent_tenant_privileged_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := auth.role();
BEGIN
  -- No JWT at all means a migration, a seed or psql. The service role is the
  -- backend acting deliberately (billing changes a plan; an admin console
  -- suspends a tenant). Everything else is a person in a browser: enforce.
  IF jwt_role IS NULL OR jwt_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Changing the tenant id is not allowed';
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Changing the billing plan is not allowed from here';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Changing the tenant status is not allowed from here';
  END IF;
  IF NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'Changing the tenant slug is not allowed from here';
  END IF;
  IF NEW.country_code IS DISTINCT FROM OLD.country_code THEN
    RAISE EXCEPTION 'Country is set when the organisation is created and drives payroll rules';
  END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
     OR NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
    RAISE EXCEPTION 'Approval provenance is not editable';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_tenants_privileged_changes ON public.tenants;
CREATE TRIGGER trg_tenants_privileged_changes
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.prevent_tenant_privileged_changes();

DROP POLICY IF EXISTS "org admin updates own tenant" ON public.tenants;
CREATE POLICY "org admin updates own tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), id))
  WITH CHECK (public.is_org_admin(auth.uid(), id));

NOTIFY pgrst, 'reload schema';
