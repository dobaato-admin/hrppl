
-- Email retry tracking on existing requests
ALTER TABLE public.id_document_requests
  ADD COLUMN IF NOT EXISTS last_send_status text NOT NULL DEFAULT 'queued'
    CHECK (last_send_status IN ('queued','sent','failed','retrying')),
  ADD COLUMN IF NOT EXISTS last_send_error text,
  ADD COLUMN IF NOT EXISTS send_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_id_doc_requests_next_retry
  ON public.id_document_requests(next_retry_at)
  WHERE last_send_status IN ('failed','retrying');

-- Audit log
CREATE TABLE IF NOT EXISTS public.id_request_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.id_document_requests(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN (
    'created','approved','cancelled','resent',
    'bulk_approved','bulk_cancelled','bulk_resent',
    'send_failed','send_retried','send_succeeded'
  )),
  from_status text,
  to_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_id_req_audit_request ON public.id_request_audit_log(request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_id_req_audit_tenant  ON public.id_request_audit_log(tenant_id, created_at DESC);

GRANT SELECT, INSERT ON public.id_request_audit_log TO authenticated;
GRANT ALL ON public.id_request_audit_log TO service_role;

ALTER TABLE public.id_request_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "id_req_audit admin manage"
  ON public.id_request_audit_log FOR ALL
  USING (
    (tenant_id = public.user_tenant_id(auth.uid())
      AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'manager')))
    OR public.has_role(auth.uid(),'super_admin')
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid())
      AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'manager')))
    OR public.has_role(auth.uid(),'super_admin')
  );

CREATE POLICY "id_req_audit employee read own"
  ON public.id_request_audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.id_document_requests r
    JOIN public.employees e ON e.id = r.employee_id
    WHERE r.id = id_request_audit_log.request_id AND e.user_id = auth.uid()
  ));
