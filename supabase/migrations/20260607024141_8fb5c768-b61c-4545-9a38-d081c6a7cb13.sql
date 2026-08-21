
-- 1) Fix can_view_employee_event so regional_admin is restricted to non-confidential/non-hr events
CREATE OR REPLACE FUNCTION public.can_view_employee_event(_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_events ev
    WHERE ev.id = _event_id
      AND (
        has_role(auth.uid(), 'org_admin'::app_role)
        OR has_role(auth.uid(), 'super_admin'::app_role)
        OR (
          has_role(auth.uid(), 'regional_admin'::app_role)
          AND ev.visibility NOT IN ('confidential'::event_visibility, 'hr'::event_visibility)
        )
        OR (
          has_role(auth.uid(), 'manager'::app_role)
          AND ev.tenant_id = user_tenant_id(auth.uid())
          AND ev.visibility NOT IN ('confidential'::event_visibility, 'hr'::event_visibility)
        )
        OR (
          ev.visibility = 'employee'::event_visibility
          AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = ev.employee_id AND e.user_id = auth.uid())
        )
      )
  );
$function$;

-- 2) Add UPDATE policy for disciplinary-files storage bucket (mirror INSERT/SELECT/DELETE)
DROP POLICY IF EXISTS "HR update tenant disciplinary files" ON storage.objects;
CREATE POLICY "HR update tenant disciplinary files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
  AND (
    has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'org_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
)
WITH CHECK (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[1] = (user_tenant_id(auth.uid()))::text
  AND (
    has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'org_admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);
