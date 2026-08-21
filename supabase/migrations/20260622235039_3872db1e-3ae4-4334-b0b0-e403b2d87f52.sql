
-- =====================================================================
-- 1) Step assignment & completion tracker: evidence + attestation
-- =====================================================================
ALTER TABLE public.onboarding_control_room_tasks
  ADD COLUMN IF NOT EXISTS evidence_url text,
  ADD COLUMN IF NOT EXISTS evidence_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_uploaded_by uuid,
  ADD COLUMN IF NOT EXISTS attestation_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS attestation_text text,
  ADD COLUMN IF NOT EXISTS attested_at timestamptz,
  ADD COLUMN IF NOT EXISTS attested_by uuid,
  ADD COLUMN IF NOT EXISTS verifier_role text,
  ADD COLUMN IF NOT EXISTS verifier_id uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_country text,
  ADD COLUMN IF NOT EXISTS is_statutory boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ocr_tasks_status_due
  ON public.onboarding_control_room_tasks(status, due_date);

-- Audit log entries for completion / evidence / attestation events
CREATE OR REPLACE FUNCTION public.tg_ocr_task_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid;
BEGIN
  SELECT e.tenant_id INTO v_tenant
  FROM public.onboarding_assignments oa
  JOIN public.employees e ON e.id = oa.employee_id
  WHERE oa.id = NEW.assignment_id;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.evidence_url IS DISTINCT FROM OLD.evidence_url
       OR NEW.attested_at IS DISTINCT FROM OLD.attested_at
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      INSERT INTO public.admin_audit_log(tenant_id, actor_id, action, entity_type, entity_id, metadata)
      VALUES (
        v_tenant, auth.uid(), 'checklist_step_change', 'onboarding_control_room_tasks', NEW.id,
        jsonb_build_object(
          'old_status', OLD.status, 'new_status', NEW.status,
          'evidence_changed', (NEW.evidence_url IS DISTINCT FROM OLD.evidence_url),
          'attested', (NEW.attested_at IS NOT NULL),
          'verified', (NEW.verified_at IS NOT NULL)
        )
      );
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocr_task_audit ON public.onboarding_control_room_tasks;
CREATE TRIGGER trg_ocr_task_audit AFTER UPDATE ON public.onboarding_control_room_tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_ocr_task_audit();

-- =====================================================================
-- Mid-cycle country change: merged checklist generator
-- =====================================================================
CREATE OR REPLACE FUNCTION public.merge_checklist_on_country_change(
  p_employee uuid,
  p_new_country text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tenant uuid;
  v_old_country text;
  v_old_checklist uuid;
  v_new_checklist uuid;
  v_assignment uuid;
  v_item jsonb;
  v_merged jsonb := '[]'::jsonb;
  v_existing_titles text[];
BEGIN
  SELECT e.tenant_id INTO v_tenant FROM public.employees e WHERE e.id = p_employee;

  SELECT oa.id, oa.checklist_id INTO v_assignment, v_old_checklist
  FROM public.onboarding_assignments oa
  WHERE oa.employee_id = p_employee
  ORDER BY oa.created_at DESC LIMIT 1;

  SELECT country_code INTO v_old_country
  FROM public.onboarding_checklists WHERE id = v_old_checklist;

  IF v_old_country = p_new_country THEN RETURN v_assignment; END IF;

  SELECT id INTO v_new_checklist FROM public.onboarding_checklists
  WHERE tenant_id = v_tenant AND country_code = p_new_country AND is_active = true
  ORDER BY is_system_seed DESC, priority ASC NULLS LAST LIMIT 1;

  IF v_new_checklist IS NULL THEN RETURN v_assignment; END IF;

  -- Collect titles already in tracker so we don't duplicate completed steps
  SELECT array_agg(title) INTO v_existing_titles
  FROM public.onboarding_control_room_tasks WHERE assignment_id = v_assignment;

  FOR v_item IN
    SELECT jsonb_array_elements(items) FROM public.onboarding_checklists WHERE id = v_new_checklist
  LOOP
    IF v_existing_titles IS NULL OR NOT (v_item->>'title' = ANY(v_existing_titles)) THEN
      INSERT INTO public.onboarding_control_room_tasks
        (assignment_id, owner_role, title, description, source_country, is_statutory, notes)
      VALUES (
        v_assignment,
        COALESCE(v_item->>'owner_role','hr'),
        v_item->>'title',
        v_item->>'description',
        p_new_country,
        COALESCE((v_item->>'is_statutory')::boolean, false),
        'Added via country change merge from ' || COALESCE(v_old_country,'(none)') || ' → ' || p_new_country
      );
    END IF;
  END LOOP;

  INSERT INTO public.admin_audit_log(tenant_id, actor_id, action, entity_type, entity_id, metadata)
  VALUES (v_tenant, auth.uid(), 'checklist_country_merge', 'onboarding_assignments', v_assignment,
          jsonb_build_object('from', v_old_country, 'to', p_new_country));

  RETURN v_assignment;
END;
$$;
GRANT EXECUTE ON FUNCTION public.merge_checklist_on_country_change(uuid, text) TO authenticated;

-- =====================================================================
-- 2) Nepal payroll seed (FY 2024/25 = BS 2081/82) — draft, country='NP'
-- =====================================================================
-- Seed function idempotent per tenant
CREATE OR REPLACE FUNCTION public.seed_nepal_payroll(p_tenant uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.payroll_tax_rules
    WHERE tenant_id = p_tenant AND country_code = 'NP' AND fy_label = '2024/25 (BS 2081/82)'
  ) INTO v_exists;
  IF v_exists THEN RETURN; END IF;

  -- Tax slabs (individual, single) — draft FY 2024/25
  INSERT INTO public.payroll_tax_rules
    (tenant_id, country_code, fy_label, name, rule_type, payload, is_draft, is_active)
  VALUES
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Income tax slabs (single)', 'income_tax', jsonb_build_object(
      'currency','NPR',
      'slabs', jsonb_build_array(
        jsonb_build_object('upto',500000,'rate',0.01,'note','Social Security Tax 1%'),
        jsonb_build_object('upto',700000,'rate',0.10),
        jsonb_build_object('upto',1000000,'rate',0.20),
        jsonb_build_object('upto',2000000,'rate',0.30),
        jsonb_build_object('upto',5000000,'rate',0.36,'note','30% + 20% surcharge'),
        jsonb_build_object('upto',null,'rate',0.39,'note','30% + 30% surcharge')
      )
    ), true, true),
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Income tax slabs (couple)', 'income_tax', jsonb_build_object(
      'currency','NPR',
      'slabs', jsonb_build_array(
        jsonb_build_object('upto',600000,'rate',0.01),
        jsonb_build_object('upto',800000,'rate',0.10),
        jsonb_build_object('upto',1100000,'rate',0.20),
        jsonb_build_object('upto',2000000,'rate',0.30),
        jsonb_build_object('upto',5000000,'rate',0.36),
        jsonb_build_object('upto',null,'rate',0.39)
      )
    ), true, true),
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Social Security Fund (SSF)', 'contribution', jsonb_build_object(
      'employee_pct',11,'employer_pct',20,'base','basic_salary',
      'splits', jsonb_build_object('provident_fund',10,'gratuity',8.33,'social_security',1+1.67)
    ), true, true),
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Citizen Investment Trust (CIT)', 'voluntary_contribution', jsonb_build_object(
      'employee_pct_default',10,'tax_deductible_cap_npr',300000
    ), true, true),
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Festival (Dashain) bonus', 'allowance', jsonb_build_object(
      'amount','one_month_basic','timing','before_dashain','prorated_for_partial_year',true
    ), true, true),
    (p_tenant, 'NP', '2024/25 (BS 2081/82)', 'Leave encashment', 'leave', jsonb_build_object(
      'home_leave_days_per_year',18,'sick_leave_days_per_year',12,'encashable',true
    ), true, true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.seed_nepal_payroll(uuid) TO authenticated;

-- Create the payroll_tax_rules table if not present (used by wizard)
CREATE TABLE IF NOT EXISTS public.payroll_tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  country_code text NOT NULL,
  fy_label text NOT NULL,
  name text NOT NULL,
  rule_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_draft boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_tax_rules TO authenticated;
GRANT ALL ON public.payroll_tax_rules TO service_role;
ALTER TABLE public.payroll_tax_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payroll_tax_rules' AND policyname='ptr_tenant_read') THEN
    CREATE POLICY ptr_tenant_read ON public.payroll_tax_rules FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
           OR public.has_role(auth.uid(),'super_admin'::app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payroll_tax_rules' AND policyname='ptr_admin_write') THEN
    CREATE POLICY ptr_admin_write ON public.payroll_tax_rules FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role));
  END IF;
END $$;

-- =====================================================================
-- 3) AU STP2 + Payday Super readiness fields
-- =====================================================================
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS au_tfn text,
  ADD COLUMN IF NOT EXISTS au_income_stream_type text,
  ADD COLUMN IF NOT EXISTS au_country_code text,
  ADD COLUMN IF NOT EXISTS au_residency_status text CHECK (au_residency_status IN ('resident','foreign_resident','working_holiday_maker') OR au_residency_status IS NULL),
  ADD COLUMN IF NOT EXISTS au_tax_treatment_code text,
  ADD COLUMN IF NOT EXISTS au_employment_basis text CHECK (au_employment_basis IN ('F','P','C','L','N','D') OR au_employment_basis IS NULL),
  ADD COLUMN IF NOT EXISTS au_super_fund_abn text,
  ADD COLUMN IF NOT EXISTS au_super_member_no text,
  ADD COLUMN IF NOT EXISTS au_cessation_type text,
  ADD COLUMN IF NOT EXISTS au_stp_previous_bms_id text;

CREATE TABLE IF NOT EXISTS public.au_stp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  pay_run_id uuid,
  submission_type text NOT NULL CHECK (submission_type IN ('pay_event','update_event','finalisation')),
  reporting_period_start date,
  reporting_period_end date,
  bms_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','sent','accepted','rejected')),
  ato_response jsonb,
  submitted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_au_stp_tenant ON public.au_stp_submissions(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.au_stp_submissions TO authenticated;
GRANT ALL ON public.au_stp_submissions TO service_role;
ALTER TABLE public.au_stp_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY au_stp_tenant_read ON public.au_stp_submissions FOR SELECT TO authenticated
USING (tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
       OR public.has_role(auth.uid(),'super_admin'::app_role));
CREATE POLICY au_stp_admin_write ON public.au_stp_submissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role));

-- Payday Super: track per-payday SG deadlines (effective 1 July 2026)
CREATE TABLE IF NOT EXISTS public.au_payday_super_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_date date NOT NULL,
  ote_amount numeric(14,2) NOT NULL DEFAULT 0,
  sg_rate numeric(5,4) NOT NULL DEFAULT 0.12,
  sg_amount numeric(14,2) NOT NULL DEFAULT 0,
  due_by date NOT NULL,
  paid_at timestamptz,
  super_fund_abn text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','scheduled','paid','late','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payday_super_tenant_due ON public.au_payday_super_obligations(tenant_id, due_by, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.au_payday_super_obligations TO authenticated;
GRANT ALL ON public.au_payday_super_obligations TO service_role;
ALTER TABLE public.au_payday_super_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY payday_super_tenant_read ON public.au_payday_super_obligations FOR SELECT TO authenticated
USING (tenant_id IN (SELECT e.tenant_id FROM public.employees e WHERE e.user_id = auth.uid())
       OR public.has_role(auth.uid(),'super_admin'::app_role));
CREATE POLICY payday_super_admin_write ON public.au_payday_super_obligations FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(),'org_admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role));

CREATE TRIGGER trg_payroll_tax_rules_updated BEFORE UPDATE ON public.payroll_tax_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_au_stp_updated BEFORE UPDATE ON public.au_stp_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payday_super_updated BEFORE UPDATE ON public.au_payday_super_obligations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
