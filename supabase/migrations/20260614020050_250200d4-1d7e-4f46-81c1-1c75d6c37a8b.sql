
-- MFA enrollment tracking on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_method text CHECK (mfa_method IN ('totp','email')),
  ADD COLUMN IF NOT EXISTS mfa_enrolled_at timestamptz;

-- Email OTP challenges (used both for enrollment and per-session step-up)
CREATE TABLE IF NOT EXISTS public.mfa_email_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('enroll','login')),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mfa_email_challenges_user ON public.mfa_email_challenges(user_id, created_at DESC);

GRANT SELECT ON public.mfa_email_challenges TO authenticated;
GRANT ALL ON public.mfa_email_challenges TO service_role;

ALTER TABLE public.mfa_email_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own MFA challenges"
  ON public.mfa_email_challenges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
