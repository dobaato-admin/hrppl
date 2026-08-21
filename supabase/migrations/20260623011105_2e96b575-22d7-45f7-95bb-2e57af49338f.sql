-- 1. Offboarding comms-removal verification rows
CREATE TABLE IF NOT EXISTS public.offboarding_comms_removal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.offboarding_cases(id) ON DELETE CASCADE,
  channel text NOT NULL,
  channel_label text NOT NULL,
  is_mandatory boolean NOT NULL DEFAULT true,
  removed boolean NOT NULL DEFAULT false,
  removed_at timestamptz,
  evidence_url text,
  attested_by uuid REFERENCES auth.users(id),
  attestation_signature text,
  attested_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, channel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding_comms_removal TO authenticated;
GRANT ALL ON public.offboarding_comms_removal TO service_role;

ALTER TABLE public.offboarding_comms_removal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read comms removal" ON public.offboarding_comms_removal
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    )
  );

CREATE POLICY "hr write comms removal" ON public.offboarding_comms_removal
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
    )
  );

CREATE INDEX IF NOT EXISTS ix_ocr_case ON public.offboarding_comms_removal(case_id);
CREATE INDEX IF NOT EXISTS ix_ocr_tenant ON public.offboarding_comms_removal(tenant_id);

CREATE OR REPLACE FUNCTION public.touch_ocr_updated() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_ocr_touch ON public.offboarding_comms_removal;
CREATE TRIGGER trg_ocr_touch BEFORE UPDATE ON public.offboarding_comms_removal
  FOR EACH ROW EXECUTE FUNCTION public.touch_ocr_updated();

-- 2. Seed mandatory channels when an offboarding case is opened
CREATE OR REPLACE FUNCTION public.seed_offboarding_comms_removal() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_channels jsonb := '[
    {"channel":"whatsapp","label":"WhatsApp (work groups & broadcasts)"},
    {"channel":"slack","label":"Slack workspaces & channels"},
    {"channel":"ms_teams","label":"Microsoft Teams & channels"},
    {"channel":"discord","label":"Discord servers & channels"},
    {"channel":"google_workspace","label":"Google Workspace groups & shared drives"},
    {"channel":"telegram","label":"Telegram groups & channels"},
    {"channel":"viber","label":"Viber groups"},
    {"channel":"trello","label":"Trello boards & workspaces"},
    {"channel":"messenger","label":"Facebook Messenger groups"},
    {"channel":"shared_drives","label":"Other shared drives & file links"}
  ]'::jsonb;
  v_item jsonb;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_channels) LOOP
    INSERT INTO public.offboarding_comms_removal(tenant_id, case_id, channel, channel_label, is_mandatory)
    VALUES (NEW.tenant_id, NEW.id, v_item->>'channel', v_item->>'label', true)
    ON CONFLICT (case_id, channel) DO NOTHING;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_seed_ocr ON public.offboarding_cases;
CREATE TRIGGER trg_seed_ocr AFTER INSERT ON public.offboarding_cases
  FOR EACH ROW EXECUTE FUNCTION public.seed_offboarding_comms_removal();

-- Backfill existing open cases
INSERT INTO public.offboarding_comms_removal(tenant_id, case_id, channel, channel_label, is_mandatory)
SELECT c.tenant_id, c.id, x.channel, x.label, true
FROM public.offboarding_cases c
CROSS JOIN LATERAL (VALUES
  ('whatsapp','WhatsApp (work groups & broadcasts)'),
  ('slack','Slack workspaces & channels'),
  ('ms_teams','Microsoft Teams & channels'),
  ('discord','Discord servers & channels'),
  ('google_workspace','Google Workspace groups & shared drives'),
  ('telegram','Telegram groups & channels'),
  ('viber','Viber groups'),
  ('trello','Trello boards & workspaces'),
  ('messenger','Facebook Messenger groups'),
  ('shared_drives','Other shared drives & file links')
) AS x(channel,label)
WHERE c.status <> 'completed'
ON CONFLICT (case_id, channel) DO NOTHING;

-- 3. Nepal payroll wizard run log
CREATE TABLE IF NOT EXISTS public.np_payroll_wizard_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  fiscal_year text NOT NULL DEFAULT '2081/82',
  marital_default text NOT NULL DEFAULT 'single',
  ssf_enrolled boolean NOT NULL DEFAULT true,
  cit_percent numeric(6,3) NOT NULL DEFAULT 33.333,
  festival_month text NOT NULL DEFAULT 'Ashwin',
  remittance_percent numeric(6,3) NOT NULL DEFAULT 0,
  pf_election text NOT NULL DEFAULT 'optional',
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  run_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.np_payroll_wizard_runs TO authenticated;
GRANT ALL ON public.np_payroll_wizard_runs TO service_role;

ALTER TABLE public.np_payroll_wizard_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org admin manage np wizard runs" ON public.np_payroll_wizard_runs
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
  );

CREATE INDEX IF NOT EXISTS ix_np_wiz_tenant ON public.np_payroll_wizard_runs(tenant_id);