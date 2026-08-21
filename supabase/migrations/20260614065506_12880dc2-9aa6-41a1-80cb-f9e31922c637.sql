
ALTER TABLE public.tenant_payroll_settings
  ADD COLUMN IF NOT EXISTS abn text,
  ADD COLUMN IF NOT EXISTS branch_code text,
  ADD COLUMN IF NOT EXISTS bms_id text,
  ADD COLUMN IF NOT EXISTS stp_gateway text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS stp_gateway_config jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS tax_treatment_code char(6),
  ADD COLUMN IF NOT EXISTS income_type text,
  ADD COLUMN IF NOT EXISTS employment_basis text,
  ADD COLUMN IF NOT EXISTS tfn_status text,
  ADD COLUMN IF NOT EXISTS cessation_reason_code char(1);

CREATE TABLE IF NOT EXISTS public.stp_pay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  payment_date date NOT NULL,
  run_type text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'draft',
  gateway text NOT NULL DEFAULT 'manual',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload_hash text,
  gateway_message_id text,
  ato_response jsonb,
  error_message text,
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stp_pay_events_tenant ON public.stp_pay_events(tenant_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_stp_pay_events_run ON public.stp_pay_events(run_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stp_pay_events TO authenticated;
GRANT ALL ON public.stp_pay_events TO service_role;

ALTER TABLE public.stp_pay_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stp_pay_events org_admin read"
  ON public.stp_pay_events FOR SELECT TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id));

CREATE POLICY "stp_pay_events org_admin write"
  ON public.stp_pay_events FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id));

CREATE TRIGGER trg_stp_pay_events_touch
  BEFORE UPDATE ON public.stp_pay_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
