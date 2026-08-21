
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_log_tenant_created_idx ON public.admin_audit_log (tenant_id, created_at DESC);
CREATE INDEX admin_audit_log_category_idx ON public.admin_audit_log (tenant_id, category, created_at DESC);

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can read tenant audit log"
ON public.admin_audit_log FOR SELECT
TO authenticated
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Authenticated can insert own audit rows"
ON public.admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
