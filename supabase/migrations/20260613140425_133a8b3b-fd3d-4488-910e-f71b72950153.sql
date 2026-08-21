
-- DISCIPLINARY_CASES
CREATE POLICY "hr manages tenant disciplinary_cases" ON public.disciplinary_cases
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads non-conf disciplinary_cases" ON public.disciplinary_cases
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND confidential = false
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = disciplinary_cases.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- DISCIPLINARY_ACTIONS / ATTACHMENTS / APPROVALS
CREATE POLICY "hr manages tenant disciplinary_actions" ON public.disciplinary_actions
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant disciplinary_attachments" ON public.disciplinary_attachments
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant disciplinary_approvals" ON public.disciplinary_approvals
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

-- MEDICAL_INCIDENTS
CREATE POLICY "hr manages tenant medical_incidents" ON public.medical_incidents
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads non-conf medical_incidents" ON public.medical_incidents
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND confidential = false
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = medical_incidents.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- GRIEVANCES
CREATE POLICY "hr manages tenant grievances" ON public.grievances
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant grievance_comments" ON public.grievance_comments
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant grievance_attachments" ON public.grievance_attachments
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

-- DOCUMENT_ENVELOPES / SIGNERS / TEMPLATES
CREATE POLICY "hr manages tenant document_envelopes" ON public.document_envelopes
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant document_envelopes" ON public.document_envelopes
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant document_signers" ON public.document_signers
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "hr manages tenant document_templates" ON public.document_templates
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant document_templates" ON public.document_templates
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

-- SUPPORT_TICKETS
CREATE POLICY "hr manages tenant support_tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch support_tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = support_tickets.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- ID_DOCUMENT_REQUESTS
CREATE POLICY "hr manages tenant id_document_requests" ON public.id_document_requests
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads branch id_document_requests" ON public.id_document_requests
  FOR SELECT TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = id_document_requests.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );
