
-- 1) Alerts log
CREATE TABLE public.security_scan_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid REFERENCES public.security_findings_log(id) ON DELETE CASCADE,
  scanner_name text NOT NULL,
  internal_id text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','webhook')),
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_scan_alerts TO authenticated;
GRANT ALL ON public.security_scan_alerts TO service_role;

ALTER TABLE public.security_scan_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin reads alerts"
  ON public.security_scan_alerts FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 2) Blog webhook secret hashing
ALTER TABLE public.blog_webhooks
  ADD COLUMN IF NOT EXISTS secret_hash text,
  ADD COLUMN IF NOT EXISTS last_rotated_at timestamptz,
  ADD COLUMN IF NOT EXISTS rotated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill hash for existing rows (sha256 of current plaintext)
UPDATE public.blog_webhooks
  SET secret_hash = encode(digest(secret, 'sha256'), 'hex')
  WHERE secret IS NOT NULL AND secret_hash IS NULL;

-- 3) Add tenant_governance webhook URL column for alert delivery (idempotent)
ALTER TABLE public.tenant_governance
  ADD COLUMN IF NOT EXISTS security_alert_webhook_url text;
