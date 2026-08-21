
-- 1. AUD default for new tenants and backfill missing
ALTER TABLE public.tenants ALTER COLUMN currency_code SET DEFAULT 'AUD';
UPDATE public.tenants SET currency_code = 'AUD' WHERE currency_code IS NULL OR currency_code = '';

-- 2. Pending ID document requests table
CREATE TABLE IF NOT EXISTS public.id_document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','cancelled')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_id_doc_requests_employee ON public.id_document_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_id_doc_requests_tenant_status ON public.id_document_requests(tenant_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.id_document_requests TO authenticated;
GRANT ALL ON public.id_document_requests TO service_role;

ALTER TABLE public.id_document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "id_doc_requests admin manage"
  ON public.id_document_requests FOR ALL
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

CREATE POLICY "id_doc_requests employee read own"
  ON public.id_document_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = id_document_requests.employee_id AND e.user_id = auth.uid()
  ));

CREATE TRIGGER id_document_requests_touch
  BEFORE UPDATE ON public.id_document_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
