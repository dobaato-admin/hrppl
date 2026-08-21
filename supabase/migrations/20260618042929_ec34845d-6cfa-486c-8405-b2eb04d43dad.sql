
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.review_template_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  template_id UUID,
  template_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('export','import')),
  file_name TEXT,
  actor_id UUID NOT NULL,
  actor_email TEXT,
  snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.review_template_audit_log TO authenticated;
GRANT ALL ON public.review_template_audit_log TO service_role;
ALTER TABLE public.review_template_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant admins read audit"
  ON public.review_template_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.tenant_id = review_template_audit_log.tenant_id)
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE POLICY "tenant admins write audit"
  ON public.review_template_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.tenant_id = review_template_audit_log.tenant_id)
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE INDEX ix_rtal_tenant_created ON public.review_template_audit_log (tenant_id, created_at DESC);

CREATE TABLE public.review_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  template_id UUID NOT NULL,
  template_version INTEGER,
  employee_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  period_label TEXT NOT NULL,
  scheduled_for DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','submitted','approved','rejected')),
  score JSONB,
  evidence JSONB DEFAULT '[]'::jsonb,
  reviewer_id UUID,
  reviewer_comments TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, employee_id, item_id, period_label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_instances TO authenticated;
GRANT ALL ON public.review_instances TO service_role;
ALTER TABLE public.review_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee read own instances"
  ON public.review_instances FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.employees e
            WHERE e.id = review_instances.employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'org_admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'manager')
  );

CREATE POLICY "employee submit own instance"
  ON public.review_instances FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.employees e
            WHERE e.id = review_instances.employee_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'org_admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'manager')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
  );

CREATE POLICY "admins create instances"
  ON public.review_instances FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'))
  );

CREATE POLICY "admins delete instances"
  ON public.review_instances FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.tenant_id = review_instances.tenant_id)
    AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );

CREATE INDEX ix_ri_emp_status ON public.review_instances (employee_id, status, scheduled_for);
CREATE INDEX ix_ri_tenant_template ON public.review_instances (tenant_id, template_id);

CREATE TRIGGER trg_ri_updated_at BEFORE UPDATE ON public.review_instances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
