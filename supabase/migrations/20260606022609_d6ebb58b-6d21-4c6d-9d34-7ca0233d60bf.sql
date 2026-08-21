
-- =============================================================================
-- DOCUMENTS & E-SIGNATURE
-- =============================================================================

-- Enums
CREATE TYPE public.document_type AS ENUM (
  'employment_contract',
  'offer_letter',
  'policy',
  'hr_letter',
  'other'
);

CREATE TYPE public.document_template_status AS ENUM ('draft','published','archived');

CREATE TYPE public.document_envelope_status AS ENUM (
  'draft','sent','viewed','in_progress','completed','declined','cancelled','expired'
);

CREATE TYPE public.document_signer_status AS ENUM (
  'pending','viewed','signed','declined'
);

CREATE TYPE public.signature_method AS ENUM ('typed','drawn','acknowledged');

CREATE TYPE public.employee_document_category AS ENUM (
  'identity','certificate','visa','contract','signed_document','letter','policy_ack','other'
);

CREATE TYPE public.employee_document_verification AS ENUM (
  'unverified','verified','rejected'
);

-- =============================================================================
-- document_templates
-- =============================================================================
CREATE TABLE public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  doc_type public.document_type NOT NULL DEFAULT 'other',
  body_html text NOT NULL DEFAULT '',
  merge_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.document_template_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  parent_template_id uuid REFERENCES public.document_templates(id) ON DELETE SET NULL,
  requires_signature boolean NOT NULL DEFAULT true,
  requires_countersign boolean NOT NULL DEFAULT false,
  countersigner_role text,
  default_due_days integer NOT NULL DEFAULT 14,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX document_templates_tenant_idx ON public.document_templates(tenant_id, doc_type, status);

CREATE POLICY "tpl_org_admin_all" ON public.document_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "tpl_super_all" ON public.document_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE POLICY "tpl_manager_read" ON public.document_templates
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'manager') AND tenant_id = user_tenant_id(auth.uid()) AND status = 'published');

CREATE TRIGGER document_templates_touch BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================================
-- document_envelopes
-- =============================================================================
CREATE TABLE public.document_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.document_templates(id) ON DELETE SET NULL,
  template_version integer,
  doc_type public.document_type NOT NULL DEFAULT 'other',
  subject text NOT NULL,
  body_html_snapshot text NOT NULL,
  merge_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  recipient_email text,
  recipient_name text,
  status public.document_envelope_status NOT NULL DEFAULT 'draft',
  requires_signature boolean NOT NULL DEFAULT true,
  requires_countersign boolean NOT NULL DEFAULT false,
  due_date date,
  sent_at timestamptz,
  first_viewed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cancel_reason text,
  signed_document_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  bulk_batch_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_envelopes TO authenticated;
GRANT ALL ON public.document_envelopes TO service_role;
ALTER TABLE public.document_envelopes ENABLE ROW LEVEL SECURITY;

CREATE INDEX env_tenant_idx ON public.document_envelopes(tenant_id, status);
CREATE INDEX env_emp_idx ON public.document_envelopes(employee_id);
CREATE INDEX env_batch_idx ON public.document_envelopes(bulk_batch_id);

CREATE POLICY "env_org_admin_all" ON public.document_envelopes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "env_super_all" ON public.document_envelopes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE POLICY "env_manager_read" ON public.document_envelopes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'manager') AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "env_employee_read" ON public.document_envelopes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = document_envelopes.employee_id AND e.user_id = auth.uid()));

CREATE TRIGGER document_envelopes_touch BEFORE UPDATE ON public.document_envelopes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================================
-- document_signers
-- =============================================================================
CREATE TABLE public.document_signers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES public.document_envelopes(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 1,
  role text NOT NULL DEFAULT 'signer',
  signer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signer_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  signer_email text NOT NULL,
  signer_name text NOT NULL,
  status public.document_signer_status NOT NULL DEFAULT 'pending',
  viewed_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  signature_method public.signature_method,
  signature_typed text,
  signature_drawn_svg text,
  signature_ip text,
  signature_user_agent text,
  audit_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_signers TO authenticated;
GRANT ALL ON public.document_signers TO service_role;
ALTER TABLE public.document_signers ENABLE ROW LEVEL SECURITY;

CREATE INDEX signers_env_idx ON public.document_signers(envelope_id);
CREATE INDEX signers_user_idx ON public.document_signers(signer_user_id, status);

CREATE POLICY "sgn_org_admin_all" ON public.document_signers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "sgn_super_all" ON public.document_signers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE POLICY "sgn_signer_self" ON public.document_signers
  FOR SELECT TO authenticated
  USING (signer_user_id = auth.uid());

CREATE POLICY "sgn_signer_update_self" ON public.document_signers
  FOR UPDATE TO authenticated
  USING (signer_user_id = auth.uid())
  WITH CHECK (signer_user_id = auth.uid());

CREATE TRIGGER document_signers_touch BEFORE UPDATE ON public.document_signers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =============================================================================
-- document_events  (audit trail)
-- =============================================================================
CREATE TABLE public.document_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid NOT NULL REFERENCES public.document_envelopes(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event text NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  ip text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.document_events TO authenticated;
GRANT ALL ON public.document_events TO service_role;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX evt_env_idx ON public.document_events(envelope_id, created_at);

CREATE POLICY "evt_org_admin_read" ON public.document_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "evt_super_read" ON public.document_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'super_admin'));

CREATE POLICY "evt_signer_read" ON public.document_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.document_signers s
    WHERE s.envelope_id = document_events.envelope_id AND s.signer_user_id = auth.uid()
  ));

CREATE POLICY "evt_insert_authenticated" ON public.document_events
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin'));

-- =============================================================================
-- Extend employee_documents
-- =============================================================================
ALTER TABLE public.employee_documents
  ADD COLUMN IF NOT EXISTS category public.employee_document_category NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS issued_date date,
  ADD COLUMN IF NOT EXISTS issuer text,
  ADD COLUMN IF NOT EXISTS reference_number text,
  ADD COLUMN IF NOT EXISTS verification_status public.employee_document_verification NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS source_envelope_id uuid REFERENCES public.document_envelopes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS empdocs_expiry_idx ON public.employee_documents(tenant_id, expiry_date)
  WHERE expiry_date IS NOT NULL;
