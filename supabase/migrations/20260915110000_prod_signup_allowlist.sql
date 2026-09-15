-- =============================================================================
-- Production signup allowlist
-- =============================================================================
--
-- `handle_new_user` decides whether a new `auth.users` row is allowed to exist
-- at all. Signup is closed by default: an account needs a pending invitation,
-- the create-organisation flow, an OAuth provider, an existing super_admin
-- grant, or an explicit entry in the allowlist below.
--
-- The allowlist inherited from development named `expertsydney@gmail.com` and
-- `mannie@ebta.com.au` — testing accounts from that environment. For the
-- production release the list becomes the two addresses that actually own this
-- deployment:
--
--   mannie@ebta.com.au
--   ams@dobaato.com
--
-- `expertsydney@gmail.com` is removed. It was a development testing account and
-- has no business bypassing the invitation requirement in production.
--
-- -----------------------------------------------------------------------------
-- What being on this list does and does not do
-- -----------------------------------------------------------------------------
--
-- It lets the address **sign up without an invitation**. That is all. It grants
-- no role: a new account is an ordinary user until somebody inserts a row in
-- `user_roles`. The two addresses above are intended to hold `super_admin`, and
-- that is granted deliberately by SQL once the accounts exist — NOT from inside
-- this function.
--
-- That separation is on purpose. Auto-granting super_admin from a trigger keyed
-- on an email address would mean anyone who ever controls that mailbox becomes
-- the platform administrator, silently, at signup. Whoever runs the grant should
-- know they ran it.
--
-- -----------------------------------------------------------------------------
-- Rebuilt from the LIVE definition, not from an older migration
-- -----------------------------------------------------------------------------
--
-- `handle_new_user` has been defined four times (20260606113016, 20260606122050,
-- 20260607212631, and now here). CLAUDE.md warns that rebuilding one of these
-- from an old copy silently reverts every later fix, which is why the body below
-- was read back out of the database with `pg_get_functiondef` immediately before
-- this file was written. The ONLY change from the live body is the allowlist.

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_invite boolean := false;
  is_org_signup boolean := false;
  is_super boolean := false;
  is_oauth boolean := false;
  is_allowlisted boolean := false;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (
    SELECT 1 FROM public.staff_invitations
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
      AND expires_at > now()
  ) INTO has_invite;

  is_org_signup := COALESCE((NEW.raw_user_meta_data->>'signup_intent') = 'create_organization', false);

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role = 'super_admin'
  ) INTO is_super;

  -- Allow any OAuth / non-password signup (Google, Apple, etc.) — they cannot pass signup_intent metadata.
  -- Such users land on the org-creation onboarding screen.
  is_oauth := COALESCE(NEW.raw_app_meta_data->>'provider', 'email') <> 'email';

  -- Production allowlist: the owners of this deployment. Grants no role — see
  -- the header. Development's expertsydney@gmail.com was removed here.
  is_allowlisted := lower(NEW.email) IN ('mannie@ebta.com.au', 'ams@dobaato.com');

  IF NOT (has_invite OR is_org_signup OR is_super OR is_oauth OR is_allowlisted) THEN
    RAISE EXCEPTION 'signup_not_allowed: This email has no pending invitation. Ask your organisation admin to invite you, or create an organisation account at /signup.';
  END IF;

  RETURN NEW;
END;
$function$;
