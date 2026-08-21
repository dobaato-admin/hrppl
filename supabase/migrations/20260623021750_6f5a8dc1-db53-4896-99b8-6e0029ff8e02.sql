
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS reminder_local_hour smallint NOT NULL DEFAULT 9;

CREATE OR REPLACE FUNCTION public.tenants_due_for_reminder_now(_target_hour int DEFAULT NULL)
RETURNS TABLE(tenant_id uuid, tz text, local_hour int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id,
         COALESCE(t.timezone, 'UTC'),
         EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(t.timezone, 'UTC')))::int
  FROM public.tenants t
  WHERE t.status = 'active'
    AND EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(t.timezone, 'UTC')))::int
        = COALESCE(_target_hour, t.reminder_local_hour);
$$;

GRANT EXECUTE ON FUNCTION public.tenants_due_for_reminder_now(int) TO authenticated, service_role;
