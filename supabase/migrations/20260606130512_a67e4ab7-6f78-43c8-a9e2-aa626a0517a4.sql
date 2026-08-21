
DROP POLICY IF EXISTS "candidate_resumes auth upload" ON storage.objects;
CREATE POLICY "candidate_resumes auth upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'candidate-resumes'
  AND (storage.foldername(name))[1] = (public.user_tenant_id(auth.uid()))::text
  AND EXISTS (
    SELECT 1 FROM public.recruitment_jobs j
    WHERE j.id::text = (storage.foldername(name))[2]
      AND j.tenant_id = public.user_tenant_id(auth.uid())
      AND j.status = 'open'
  )
);

CREATE OR REPLACE FUNCTION public.can_view_employee_event(_event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_events ev
    WHERE ev.id = _event_id
      AND (
        has_role(auth.uid(), 'org_admin'::app_role)
        OR has_role(auth.uid(), 'super_admin'::app_role)
        OR has_role(auth.uid(), 'regional_admin'::app_role)
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
$$;

DROP POLICY IF EXISTS "links readable with event access" ON public.employee_event_links;
CREATE POLICY "links readable with event access"
ON public.employee_event_links FOR SELECT
USING (
  public.can_view_employee_event(from_event_id)
  AND public.can_view_employee_event(to_event_id)
);

DROP POLICY IF EXISTS support_ticket_comments_insert ON public.support_ticket_comments;
CREATE POLICY support_ticket_comments_insert
ON public.support_ticket_comments FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.support_tickets t
    LEFT JOIN public.employees emp ON emp.id = t.employee_id
    LEFT JOIN public.employees mgr ON mgr.id = emp.manager_id
    WHERE t.id = support_ticket_comments.ticket_id
      AND t.tenant_id = support_ticket_comments.tenant_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR emp.user_id = auth.uid()
        OR mgr.user_id = auth.uid()
        OR has_role(auth.uid(), 'org_admin'::app_role)
        OR has_role(auth.uid(), 'super_admin'::app_role)
        OR has_role(auth.uid(), 'regional_admin'::app_role)
      )
  )
);

COMMENT ON TABLE public.leads IS 'Public lead submissions are written exclusively via the server function submitLead using the service role; no client-side INSERT path exists. RLS default-deny applies to anon and authenticated.';
