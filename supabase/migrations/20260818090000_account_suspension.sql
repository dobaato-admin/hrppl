-- Account suspension enforcement (Finalization Plan §1 #4 / §5 "Day 1 - Critical").
--
-- Before this migration a suspended account existed only as a tenant-level
-- enum value that nothing read. There was no user-level status at all, so a
-- "suspended" user kept full access until their JWT expired.
--
-- Enforcement is layered:
--   1. profiles.status            - the user-level source of truth.
--   2. public.is_account_active() - profile status AND owning tenant status.
--   3. public.has_role()          - every RLS policy already funnels through
--                                   this, so a suspended user loses row access
--                                   across the whole schema in one change.
--   4. requireActiveUser (app)    - rejects the request before any handler runs
--                                   (see src/lib/auth-guard.ts).
--
-- Layer 3 is defence in depth: even a service-token-free direct PostgREST call
-- with a still-valid access token reads nothing.

-- ---------------------------------------------------------------- 1. schema

CREATE TYPE public.account_status AS ENUM ('active', 'suspended');

ALTER TABLE public.profiles
  ADD COLUMN status public.account_status NOT NULL DEFAULT 'active',
  ADD COLUMN suspended_at TIMESTAMPTZ,
  ADD COLUMN suspended_by UUID REFERENCES auth.users(id),
  ADD COLUMN suspension_reason TEXT;

COMMENT ON COLUMN public.profiles.status IS
  'Auth gate. ''suspended'' blocks every authenticated request server-side and revokes RLS row access via has_role().';

-- Partial index: the hot path asks "is this one user suspended?", and suspended
-- rows are the rare case.
CREATE INDEX idx_profiles_status_suspended
  ON public.profiles (id)
  WHERE status = 'suspended';

-- ------------------------------------------------- 2. is_account_active()

-- TRUE only when the user's own account is active AND (if they belong to one)
-- their tenant has not been suspended or cancelled. A 'pending' tenant is still
-- active: organisations sit in 'pending' during the setup wizard.
CREATE OR REPLACE FUNCTION public.is_account_active(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.tenants t ON t.id = p.tenant_id
    WHERE p.id = _user_id
      AND p.status = 'active'
      AND (p.tenant_id IS NULL OR t.status NOT IN ('suspended', 'cancelled'))
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_account_active(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_account_active(UUID) TO authenticated, service_role;

-- --------------------------------------------- 3. has_role() chokepoint

-- Every RLS policy in the schema calls has_role(). Folding the active check in
-- here revokes row access for a suspended user everywhere at once, rather than
-- editing ~200 policies.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  ) AND public.is_account_active(_user_id);
$$;

-- ------------------------------------- 4. block self-service un-suspension

-- "users update own profile" is USING (id = auth.uid()), so without this a
-- suspended user could PATCH their own status back to 'active' straight from
-- the browser client.
--
-- Rebased on the current body (migration 20260606132210) — that revision added
-- the `auth.role() = 'service_role'` escape to the tenant_id rule, which
-- acceptInvitation depends on. Do not regenerate this from the original
-- 20260604013651 version or that fix is silently reverted.
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Changing profile id is not allowed';
  END IF;

  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     AND NOT (
       public.has_role(auth.uid(), 'super_admin'::app_role)
       OR auth.role() = 'service_role'
     ) THEN
    RAISE EXCEPTION 'Changing tenant_id is not allowed';
  END IF;

  -- Suspension state is service-role only, which is the path the admin server
  -- fn uses. Same idiom as the tenant_id rule above.
  IF (NEW.status IS DISTINCT FROM OLD.status
      OR NEW.suspended_at IS DISTINCT FROM OLD.suspended_at
      OR NEW.suspended_by IS DISTINCT FROM OLD.suspended_by
      OR NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason)
     AND auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Changing account suspension state is not allowed';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_profile_privileged_changes_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privileged_changes_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privileged_changes();

-- CREATE OR REPLACE preserves existing privileges, so this is a restatement
-- of the lockdown applied by 20260607212631 / 20260608110821 / 20260614032356
-- rather than a repair. Kept so this migration is self-contained if replayed
-- against a database built from an older baseline.
REVOKE ALL ON FUNCTION public.prevent_profile_privileged_changes() FROM PUBLIC, anon, authenticated;

-- --------------------------------------------------- 5. session teardown

-- Suspending must terminate live sessions, not wait for natural expiry.
-- Deleting the refresh tokens stops the client renewing; the app-layer check in
-- requireActiveUser rejects the still-valid access token in the meantime.
CREATE OR REPLACE FUNCTION public.revoke_user_sessions(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  removed INTEGER := 0;
BEGIN
  DELETE FROM auth.refresh_tokens WHERE user_id = _user_id::TEXT;
  GET DIAGNOSTICS removed = ROW_COUNT;
  DELETE FROM auth.sessions WHERE user_id = _user_id;
  RETURN removed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.revoke_user_sessions(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_sessions(UUID) TO service_role;
