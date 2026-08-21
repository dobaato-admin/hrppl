ALTER TABLE public.onboarding_assignments
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.onboarding_control_room_tasks
  ADD COLUMN IF NOT EXISTS attestation_signature text,
  ADD COLUMN IF NOT EXISTS verifier_notes text;

ALTER TABLE public.tenant_payroll_settings
  ADD COLUMN IF NOT EXISTS payday_super_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_super_fund_id uuid REFERENCES public.super_funds(id);