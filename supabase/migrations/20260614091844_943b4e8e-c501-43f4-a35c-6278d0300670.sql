
CREATE TABLE public.stp_finalisation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  financial_year int NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  run_type text NOT NULL DEFAULT 'final' CHECK (run_type IN ('final','amendment')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','awaiting_manual_lodgement','acknowledged','error')),
  gateway text NOT NULL DEFAULT 'manual',
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  gateway_message_id text,
  ato_response jsonb,
  error_message text,
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, financial_year, employee_id, run_type, created_at)
);
CREATE INDEX idx_stp_final_tenant_fy ON public.stp_finalisation_events(tenant_id, financial_year);
CREATE INDEX idx_stp_final_employee ON public.stp_finalisation_events(employee_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stp_finalisation_events TO authenticated;
GRANT ALL ON public.stp_finalisation_events TO service_role;

ALTER TABLE public.stp_finalisation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins manage finalisation events"
  ON public.stp_finalisation_events
  FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id));

CREATE POLICY "Service role full access finalisation"
  ON public.stp_finalisation_events
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_stp_final_updated_at
  BEFORE UPDATE ON public.stp_finalisation_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
