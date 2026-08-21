
-- Billing-ops audit trail (7-year retention; super-admin only)
CREATE TABLE IF NOT EXISTS public.billing_ops_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,                 -- e.g. 'alert.retry', 'alert.resolve', 'mandate.update', 'recon.run', 'plan.change', 'preview.run'
  target_type text,                     -- 'alert' | 'subscription' | 'reconciliation' | 'mandate' | 'snapshot'
  target_id text,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  before jsonb,
  after jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.billing_ops_audit IS 'Audit trail for billing operations. Retain for 7 years.';

GRANT SELECT ON public.billing_ops_audit TO authenticated;
GRANT ALL ON public.billing_ops_audit TO service_role;
ALTER TABLE public.billing_ops_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin reads billing ops audit"
  ON public.billing_ops_audit FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_billing_ops_audit_created ON public.billing_ops_audit (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_ops_audit_tenant ON public.billing_ops_audit (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_ops_audit_action ON public.billing_ops_audit (action, created_at DESC);

-- Idempotency + notification tracking on alerts
ALTER TABLE public.billing_admin_alerts
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

-- Unique idempotency key (nulls allowed for old rows). One alert per key.
CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_admin_alerts_idempotency
  ON public.billing_admin_alerts (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
