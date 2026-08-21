
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

  -- Explicit allowlist (free testing accounts / org admins)
  is_allowlisted := lower(NEW.email) IN ('expertsydney@gmail.com', 'mannie@ebta.com.au');

  IF NOT (has_invite OR is_org_signup OR is_super OR is_oauth OR is_allowlisted) THEN
    RAISE EXCEPTION 'signup_not_allowed: This email has no pending invitation. Ask your organisation admin to invite you, or create an organisation account at /signup.';
  END IF;

  RETURN NEW;
END;
$function$;
