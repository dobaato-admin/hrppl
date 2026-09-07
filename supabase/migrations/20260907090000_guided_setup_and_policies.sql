-- Wave 7 — the guided setup layer, and the one table it needs that did not exist.
--
-- The guided-onboarding spec (docs/onboarding-guided-routes.md §9) is mostly a
-- *sequence* over surfaces the platform already has. Two things it needs are
-- genuinely absent, and this migration adds exactly those:
--
--   1. Somewhere to record that a tenant has finished configuring itself, and
--      which segments its admin deliberately chose to skip.
--   2. A policy document library with acknowledgements — Segment 7 and Phase 3
--      step 4 both depend on it, and no such table existed.
--
-- Notably NOT added: a per-segment "done" flag. Segment completion is
-- **computed from the tenant's actual data** — leave types exist, pay items
-- exist, a policy is published — never asserted by a checkbox. A checkbox
-- records that somebody clicked; the platform needs to know whether payroll can
-- actually run. `checkPayrollReadiness` already worked this way and the guide
-- extends it rather than inventing a parallel notion of readiness, which is
-- what CLAUDE.md asks for. The only things stored here are the two facts that
-- cannot be derived: what was skipped on purpose, and when the tenant went live.

-- ---------------------------------------------------------------------------
-- 1) Trading name on the legal entity
-- ---------------------------------------------------------------------------
--
-- Segment 1 asks for legal entity name AND trading name (DBA). `tenants`
-- already holds `legal_name`; the trading name belongs beside it. The ABN
-- deliberately stays on `tenant_payroll_settings` where it already lives —
-- duplicating an ABN onto `tenants` would give the product two answers to a
-- question the ATO has one answer to. The guide reads it through.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS trading_name text;

COMMENT ON COLUMN public.tenants.trading_name IS
  'Display / DBA name. legal_name is the registered entity; the ABN lives on tenant_payroll_settings.';

-- ---------------------------------------------------------------------------
-- 2) Setup state: skipped segments, and the activation moment
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tenant_setup_state (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Segments the admin chose to defer. Only optional ones may appear here;
  -- the server refuses to skip a mandatory segment, so this cannot be used to
  -- talk the activation gate into opening.
  skipped_segments text[] NOT NULL DEFAULT '{}',
  -- Where to drop them back in. Pure convenience; nothing depends on it.
  last_segment text,
  activated_at timestamptz,
  activated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tenant_setup_state TO authenticated;
GRANT ALL ON public.tenant_setup_state TO service_role;
ALTER TABLE public.tenant_setup_state ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_tenant_setup_state_updated ON public.tenant_setup_state;
CREATE TRIGGER trg_tenant_setup_state_updated BEFORE UPDATE ON public.tenant_setup_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Everyone in the tenant may read it: the dashboard shows "setup incomplete"
-- to people who cannot fix it, and hiding the reason helps nobody.
DROP POLICY IF EXISTS "tenant reads own setup state" ON public.tenant_setup_state;
CREATE POLICY "tenant reads own setup state" ON public.tenant_setup_state
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "org admin writes setup state" ON public.tenant_setup_state;
CREATE POLICY "org admin writes setup state" ON public.tenant_setup_state
  FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id));

-- ---------------------------------------------------------------------------
-- 3) Policy document library
-- ---------------------------------------------------------------------------
--
-- Code of conduct, whistleblower, grievance, IT usage — the documents an
-- employee must read and sign. Stored as markdown and rendered through
-- `renderMarkdown`, which escapes before converting (docs/security-model.md §6).

CREATE TABLE IF NOT EXISTS public.policy_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  summary text,
  body_md text NOT NULL DEFAULT '',
  -- Bumped by the author when the text changes materially. An acknowledgement
  -- is of a *version*, so re-publishing asks everyone to read it again rather
  -- than silently inheriting consent given to different words.
  version integer NOT NULL DEFAULT 1,
  requires_acknowledgement boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  effective_from date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_documents_tenant
  ON public.policy_documents(tenant_id, is_active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_documents TO authenticated;
GRANT ALL ON public.policy_documents TO service_role;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_policy_documents_updated ON public.policy_documents;
CREATE TRIGGER trg_policy_documents_updated BEFORE UPDATE ON public.policy_documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Read: anyone in the tenant. A policy people are required to sign is not a
-- document to hide from them.
DROP POLICY IF EXISTS "tenant reads active policies" ON public.policy_documents;
CREATE POLICY "tenant reads active policies" ON public.policy_documents
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

-- Write: org_admin or hr. Not manager — a line manager rewriting the
-- whistleblower policy is not a thing this product should allow.
DROP POLICY IF EXISTS "hr and org admin manage policies" ON public.policy_documents;
CREATE POLICY "hr and org admin manage policies" ON public.policy_documents
  FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));

CREATE TABLE IF NOT EXISTS public.policy_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  -- The version acknowledged, copied at signing time. Kept even if the policy
  -- is later revised, because the question "what did this person agree to" has
  -- to stay answerable.
  policy_version integer NOT NULL,
  -- Set when the acknowledgement is *required* of someone; NULL until signed.
  assigned_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  signature_name text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_id, employee_id, policy_version)
);

CREATE INDEX IF NOT EXISTS idx_policy_ack_employee
  ON public.policy_acknowledgements(employee_id, acknowledged_at);
CREATE INDEX IF NOT EXISTS idx_policy_ack_tenant
  ON public.policy_acknowledgements(tenant_id, policy_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_acknowledgements TO authenticated;
GRANT ALL ON public.policy_acknowledgements TO service_role;
ALTER TABLE public.policy_acknowledgements ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_policy_ack_updated ON public.policy_acknowledgements;
CREATE TRIGGER trg_policy_ack_updated BEFORE UPDATE ON public.policy_acknowledgements
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP POLICY IF EXISTS "read own or staff acknowledgements" ON public.policy_acknowledgements;
CREATE POLICY "read own or staff acknowledgements" ON public.policy_acknowledgements
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      EXISTS (SELECT 1 FROM public.employees e
              WHERE e.id = policy_acknowledgements.employee_id AND e.user_id = auth.uid())
      OR public.is_org_admin(auth.uid(), tenant_id)
      OR public.is_hr(auth.uid(), tenant_id)
      OR public.has_role(auth.uid(), 'manager'::app_role)
      OR (
        public.is_branch_admin(auth.uid(), tenant_id)
        AND EXISTS (SELECT 1 FROM public.employees e
                    WHERE e.id = policy_acknowledgements.employee_id
                      AND public.has_branch_access(auth.uid(), e.branch_id))
      )
    )
  );

-- HR and org_admin assign the obligation.
DROP POLICY IF EXISTS "hr and org admin assign acknowledgements" ON public.policy_acknowledgements;
CREATE POLICY "hr and org admin assign acknowledgements" ON public.policy_acknowledgements
  FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));

-- Only the person themselves may sign. An acknowledgement somebody else can
-- record on your behalf is not an acknowledgement; the entire evidentiary value
-- of this table depends on that.
DROP POLICY IF EXISTS "employee signs own acknowledgement" ON public.policy_acknowledgements;
CREATE POLICY "employee signs own acknowledgement" ON public.policy_acknowledgements
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.employees e
                WHERE e.id = policy_acknowledgements.employee_id AND e.user_id = auth.uid())
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.employees e
                WHERE e.id = policy_acknowledgements.employee_id AND e.user_id = auth.uid())
  );

NOTIFY pgrst, 'reload schema';
