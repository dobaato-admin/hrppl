
ALTER TABLE public.document_envelopes
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signed_certificate_html text,
  ADD COLUMN IF NOT EXISTS certificate_token text UNIQUE;

CREATE INDEX IF NOT EXISTS env_cert_token_idx ON public.document_envelopes(certificate_token);
