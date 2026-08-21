
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_invite boolean := false;
  is_org_signup boolean := false;
  is_super boolean := false;
BEGIN
  -- Always create the profile row first (downstream code relies on it)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  -- Pending invitation?
  SELECT EXISTS (
    SELECT 1 FROM public.staff_invitations
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
      AND expires_at > now()
  ) INTO has_invite;

  -- Explicit org-signup marker (set via /signup org flow OR by Mannie / first super admin)
  is_org_signup := COALESCE((NEW.raw_user_meta_data->>'signup_intent') = 'create_organization', false);

  -- Allow if a super admin already exists for this email
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role = 'super_admin'
  ) INTO is_super;

  IF NOT (has_invite OR is_org_signup OR is_super) THEN
    -- Roll back the auth signup by deleting the profile and raising; the auth user row will be left
    -- but downstream RLS denies access, and the trigger error surfaces to the client.
    RAISE EXCEPTION 'signup_not_allowed: This email has no pending invitation. Ask your organisation admin to invite you, or create an organisation account at /signup.';
  END IF;

  RETURN NEW;
END;
$$;
