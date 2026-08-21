CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_changes()
RETURNS trigger
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

  RETURN NEW;
END;
$function$;