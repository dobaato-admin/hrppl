
-- ============================================================
-- 1. SCHEMA: add country_code + is_system_seed to checklist tables
-- ============================================================
ALTER TABLE public.onboarding_checklists
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS is_system_seed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS onb_checklists_country_idx
  ON public.onboarding_checklists(tenant_id, country_code) WHERE country_code IS NOT NULL;

ALTER TABLE public.offboarding_checklist_templates
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS is_system_seed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS offb_tpl_country_idx
  ON public.offboarding_checklist_templates(tenant_id, country_code) WHERE country_code IS NOT NULL;

-- ============================================================
-- 2. SEED FUNCTION: install country-specific packs for a tenant
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_country_onboarding_packs(_tenant uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_countries text[];
  v_country text;
  v_checklist_id uuid;
  v_offb_id uuid;
  v_items jsonb;
  v_stages jsonb;
  v_name text;
BEGIN
  -- Collect distinct countries used by this tenant: tenant country + branch countries.
  SELECT array_agg(DISTINCT c) FILTER (WHERE c IS NOT NULL)
    INTO v_countries
  FROM (
    SELECT country_code AS c FROM public.tenants WHERE id = _tenant
    UNION
    SELECT country_code FROM public.tenant_branches WHERE tenant_id = _tenant
  ) s;

  v_countries := COALESCE(v_countries, ARRAY[]::text[]);
  -- Always include the generic fallback pack.
  IF NOT ('XX' = ANY(v_countries)) THEN
    v_countries := v_countries || ARRAY['XX'];
  END IF;

  -- Shared stages used by every onboarding pack
  v_stages := '[
    {"key":"pre_start","label":"Before day 1","order":0},
    {"key":"day_one","label":"Day 1","order":1},
    {"key":"first_week","label":"First week","order":2},
    {"key":"first_month","label":"First month","order":3}
  ]'::jsonb;

  FOREACH v_country IN ARRAY v_countries LOOP
    -- Skip if a seed pack for this (tenant, country) already exists
    IF EXISTS (
      SELECT 1 FROM public.onboarding_checklists
      WHERE tenant_id = _tenant AND is_system_seed = true
        AND COALESCE(country_code,'XX') = v_country
    ) THEN
      CONTINUE;
    END IF;

    v_name := CASE v_country
      WHEN 'AU' THEN 'Australia onboarding (standard)'
      WHEN 'IN' THEN 'India onboarding (standard)'
      WHEN 'SG' THEN 'Singapore onboarding (standard)'
      WHEN 'US' THEN 'United States onboarding (standard)'
      WHEN 'GB' THEN 'United Kingdom onboarding (standard)'
      WHEN 'NZ' THEN 'New Zealand onboarding (standard)'
      WHEN 'AE' THEN 'UAE onboarding (standard)'
      WHEN 'PH' THEN 'Philippines onboarding (standard)'
      ELSE 'Generic onboarding (any country)'
    END;

    -- Items: universal core + country-specific statutory items
    v_items := '[
      {"key":"signed_offer","label":"Signed offer / employment contract returned","required":true,"stage":"pre_start"},
      {"key":"id_proof","label":"Government-issued photo ID uploaded","required":true,"stage":"pre_start"},
      {"key":"bank_details","label":"Bank account details for salary","required":true,"stage":"pre_start"},
      {"key":"emergency_contact","label":"Emergency contact details","required":true,"stage":"pre_start"},
      {"key":"address_proof","label":"Residential address confirmed","required":false,"stage":"pre_start"},
      {"key":"equipment_request","label":"Equipment & access request submitted","required":true,"stage":"pre_start"},
      {"key":"workplace_tour","label":"Workplace / virtual tour and intro","required":false,"stage":"day_one"},
      {"key":"code_of_conduct","label":"Acknowledge code of conduct & policies","required":true,"stage":"day_one"},
      {"key":"workhealth_safety","label":"Workplace health & safety briefing","required":true,"stage":"first_week"},
      {"key":"manager_1on1","label":"First 1:1 with manager scheduled","required":true,"stage":"first_week"},
      {"key":"30_day_review","label":"30-day check-in review","required":false,"stage":"first_month"}
    ]'::jsonb;

    -- Country-specific statutory steps
    IF v_country = 'AU' THEN
      v_items := v_items || '[
        {"key":"au_tfn","label":"TFN declaration form completed","required":true,"stage":"pre_start"},
        {"key":"au_super_choice","label":"Superannuation Standard Choice form","required":true,"stage":"pre_start"},
        {"key":"au_fairwork_fis","label":"Fair Work Information Statement acknowledged","required":true,"stage":"day_one"},
        {"key":"au_visa_check","label":"Work rights / visa (VEVO) verified","required":true,"stage":"pre_start"},
        {"key":"au_award_classification","label":"Award & classification confirmed","required":true,"stage":"first_week"}
      ]'::jsonb;
    ELSIF v_country = 'IN' THEN
      v_items := v_items || '[
        {"key":"in_pan","label":"PAN card uploaded","required":true,"stage":"pre_start"},
        {"key":"in_aadhaar","label":"Aadhaar uploaded","required":true,"stage":"pre_start"},
        {"key":"in_uan","label":"UAN / EPF details captured","required":true,"stage":"pre_start"},
        {"key":"in_esic","label":"ESIC details (if applicable)","required":false,"stage":"pre_start"},
        {"key":"in_form11","label":"EPF Form 11 signed","required":true,"stage":"day_one"},
        {"key":"in_gratuity_nominee","label":"Gratuity nominee form","required":false,"stage":"first_week"},
        {"key":"in_pf_nominee","label":"PF nominee form","required":true,"stage":"first_week"}
      ]'::jsonb;
    ELSIF v_country = 'SG' THEN
      v_items := v_items || '[
        {"key":"sg_nric_fin","label":"NRIC / FIN uploaded","required":true,"stage":"pre_start"},
        {"key":"sg_cpf","label":"CPF registration confirmed","required":true,"stage":"pre_start"},
        {"key":"sg_iras","label":"IRAS tax form submitted (if applicable)","required":false,"stage":"first_week"},
        {"key":"sg_work_pass","label":"Work pass / EP details verified","required":true,"stage":"pre_start"}
      ]'::jsonb;
    ELSIF v_country = 'US' THEN
      v_items := v_items || '[
        {"key":"us_i9","label":"Form I-9 (employment eligibility) completed","required":true,"stage":"day_one"},
        {"key":"us_w4","label":"Form W-4 (federal withholding) completed","required":true,"stage":"day_one"},
        {"key":"us_state_w4","label":"State withholding form completed","required":false,"stage":"day_one"},
        {"key":"us_direct_deposit","label":"Direct deposit authorisation","required":true,"stage":"pre_start"},
        {"key":"us_benefits_enrol","label":"Benefits enrolment (health/401k)","required":false,"stage":"first_month"},
        {"key":"us_eeo","label":"EEO self-identification form","required":false,"stage":"first_week"}
      ]'::jsonb;
    ELSIF v_country = 'GB' THEN
      v_items := v_items || '[
        {"key":"gb_right_to_work","label":"Right to Work check completed","required":true,"stage":"pre_start"},
        {"key":"gb_p45_p46","label":"P45 from previous employer (or Starter Checklist)","required":true,"stage":"pre_start"},
        {"key":"gb_ni_number","label":"National Insurance number captured","required":true,"stage":"pre_start"},
        {"key":"gb_pension_optin","label":"Pension auto-enrolment notice issued","required":true,"stage":"first_month"}
      ]'::jsonb;
    ELSIF v_country = 'NZ' THEN
      v_items := v_items || '[
        {"key":"nz_ird","label":"IRD number & IR330 tax code declaration","required":true,"stage":"pre_start"},
        {"key":"nz_kiwisaver","label":"KiwiSaver KS2 form","required":true,"stage":"pre_start"},
        {"key":"nz_visa","label":"Work visa / residence verified","required":true,"stage":"pre_start"}
      ]'::jsonb;
    ELSIF v_country = 'AE' THEN
      v_items := v_items || '[
        {"key":"ae_visa","label":"Employment visa & entry permit","required":true,"stage":"pre_start"},
        {"key":"ae_emirates_id","label":"Emirates ID application / upload","required":true,"stage":"pre_start"},
        {"key":"ae_labour_card","label":"MOHRE labour card","required":true,"stage":"first_week"},
        {"key":"ae_wps_account","label":"WPS-compliant bank account confirmed","required":true,"stage":"pre_start"},
        {"key":"ae_medical_insurance","label":"Mandatory medical insurance enrolment","required":true,"stage":"first_week"}
      ]'::jsonb;
    ELSIF v_country = 'PH' THEN
      v_items := v_items || '[
        {"key":"ph_tin","label":"BIR TIN / Form 1902 completed","required":true,"stage":"pre_start"},
        {"key":"ph_sss","label":"SSS number captured","required":true,"stage":"pre_start"},
        {"key":"ph_philhealth","label":"PhilHealth number captured","required":true,"stage":"pre_start"},
        {"key":"ph_pagibig","label":"Pag-IBIG / HDMF number captured","required":true,"stage":"pre_start"},
        {"key":"ph_pre_employment","label":"Pre-employment medical clearance","required":false,"stage":"pre_start"}
      ]'::jsonb;
    END IF;

    INSERT INTO public.onboarding_checklists (tenant_id, name, is_default, items, country_code, is_system_seed)
    VALUES (
      _tenant, v_name, false, v_items,
      NULLIF(v_country,'XX'), true
    )
    RETURNING id INTO v_checklist_id;

    -- Add stages column if present
    BEGIN
      UPDATE public.onboarding_checklists SET stages = v_stages WHERE id = v_checklist_id;
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
  END LOOP;

  -- =========================================================
  -- Offboarding seed templates per country (and generic).
  -- All include comms / channel-removal items.
  -- =========================================================
  FOREACH v_country IN ARRAY v_countries LOOP
    IF EXISTS (
      SELECT 1 FROM public.offboarding_checklist_templates
      WHERE tenant_id = _tenant AND is_system_seed = true
        AND COALESCE(country_code,'XX') = v_country
    ) THEN
      CONTINUE;
    END IF;

    v_name := CASE v_country
      WHEN 'AU' THEN 'Australia offboarding (standard)'
      WHEN 'IN' THEN 'India offboarding (standard)'
      WHEN 'SG' THEN 'Singapore offboarding (standard)'
      WHEN 'US' THEN 'United States offboarding (standard)'
      WHEN 'GB' THEN 'United Kingdom offboarding (standard)'
      WHEN 'NZ' THEN 'New Zealand offboarding (standard)'
      WHEN 'AE' THEN 'UAE offboarding (standard)'
      WHEN 'PH' THEN 'Philippines offboarding (standard)'
      ELSE 'Generic offboarding (any country)'
    END;

    INSERT INTO public.offboarding_checklist_templates
      (tenant_id, name, description, is_default, is_active, country_code, is_system_seed)
    VALUES (
      _tenant, v_name,
      'Auto-seeded ' || v_name || '. Includes universal exit steps plus removal from formal and informal communication channels.',
      v_country = 'XX', true,
      NULLIF(v_country,'XX'), true
    )
    RETURNING id INTO v_offb_id;

    -- Universal items
    INSERT INTO public.offboarding_checklist_template_items
      (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
      (v_offb_id, _tenant, 'Acknowledge resignation / termination letter', 'hr', 'hr', -7, true, 10),
      (v_offb_id, _tenant, 'Conduct exit interview', 'hr', 'hr', -2, false, 20),
      (v_offb_id, _tenant, 'Knowledge transfer plan & handover', 'work', 'manager', -7, true, 30),
      (v_offb_id, _tenant, 'Return company assets (laptop, devices, ID badge, keys)', 'assets', 'employee', 0, true, 40),
      (v_offb_id, _tenant, 'Revoke single sign-on (SSO) & email account', 'it', 'it', 0, true, 50),
      (v_offb_id, _tenant, 'Revoke VPN, code repository & internal app access', 'it', 'it', 0, true, 60),
      (v_offb_id, _tenant, 'Final payroll & severance calculation', 'finance', 'hr', 7, true, 70),
      (v_offb_id, _tenant, 'Issue experience / relieving / service letter', 'hr', 'hr', 14, false, 80),
      (v_offb_id, _tenant, 'Update org chart & notify team', 'comms', 'manager', 0, false, 90),
      -- Formal channels
      (v_offb_id, _tenant, 'Remove from Slack workspace(s)', 'comms', 'it', 0, true, 100),
      (v_offb_id, _tenant, 'Remove from Microsoft Teams', 'comms', 'it', 0, true, 110),
      (v_offb_id, _tenant, 'Remove from Trello / Asana / Jira boards', 'comms', 'it', 0, true, 120),
      (v_offb_id, _tenant, 'Remove from Notion / Confluence workspaces', 'comms', 'it', 0, false, 130),
      (v_offb_id, _tenant, 'Revoke Google Drive / OneDrive / SharePoint shared folders', 'comms', 'it', 0, true, 140),
      (v_offb_id, _tenant, 'Remove from CRM (HubSpot / Salesforce) and other SaaS tools', 'comms', 'it', 0, false, 150),
      -- Informal channels
      (v_offb_id, _tenant, 'Remove from WhatsApp groups (team, project, all-hands)', 'comms', 'manager', 0, true, 160),
      (v_offb_id, _tenant, 'Remove from Telegram channels / groups', 'comms', 'manager', 0, false, 170),
      (v_offb_id, _tenant, 'Remove from Viber communities / groups', 'comms', 'manager', 0, false, 180),
      (v_offb_id, _tenant, 'Remove from Facebook Messenger group chats', 'comms', 'manager', 0, false, 190),
      (v_offb_id, _tenant, 'Remove from Signal / Discord servers (if used)', 'comms', 'manager', 0, false, 200),
      (v_offb_id, _tenant, 'Remove from shared calendars & recurring meeting invites', 'comms', 'manager', 0, false, 210),
      (v_offb_id, _tenant, 'Forward / archive personal mailbox & set auto-reply', 'comms', 'it', 0, false, 220),
      (v_offb_id, _tenant, 'Disable building access card / biometric enrolment', 'assets', 'it', 0, true, 230),
      (v_offb_id, _tenant, 'Remove from client distribution lists & external groups', 'comms', 'manager', 0, true, 240);

    -- Country-specific exit items
    IF v_country = 'AU' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'STP finalisation event lodged to ATO', 'finance', 'hr', 14, true, 300),
        (v_offb_id, _tenant, 'Final super guarantee paid', 'finance', 'hr', 14, true, 310),
        (v_offb_id, _tenant, 'Unused annual leave & LSL paid out', 'finance', 'hr', 7, true, 320),
        (v_offb_id, _tenant, 'Issue employment separation certificate (if requested)', 'hr', 'hr', 14, false, 330);
    ELSIF v_country = 'IN' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'Full & Final settlement calculated', 'finance', 'hr', 30, true, 300),
        (v_offb_id, _tenant, 'PF/UAN withdrawal or transfer initiated', 'finance', 'hr', 30, true, 310),
        (v_offb_id, _tenant, 'Gratuity payment (if eligible)', 'finance', 'hr', 30, false, 320),
        (v_offb_id, _tenant, 'Issue Form 16 for the year', 'finance', 'hr', 60, false, 330),
        (v_offb_id, _tenant, 'Issue experience & relieving letter', 'hr', 'hr', 14, true, 340);
    ELSIF v_country = 'SG' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'IR21 tax clearance lodged (if applicable)', 'finance', 'hr', 30, true, 300),
        (v_offb_id, _tenant, 'Final CPF contribution submitted', 'finance', 'hr', 14, true, 310),
        (v_offb_id, _tenant, 'Cancel work pass with MOM (if applicable)', 'hr', 'hr', 7, true, 320);
    ELSIF v_country = 'US' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'Issue final paycheck per state law', 'finance', 'hr', 0, true, 300),
        (v_offb_id, _tenant, 'COBRA / benefits continuation notice sent', 'hr', 'hr', 14, true, 310),
        (v_offb_id, _tenant, '401(k) rollover paperwork provided', 'finance', 'hr', 30, false, 320),
        (v_offb_id, _tenant, 'Issue Form W-2 for the year', 'finance', 'hr', 60, false, 330);
    ELSIF v_country = 'GB' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'Issue P45 via final FPS to HMRC', 'finance', 'hr', 7, true, 300),
        (v_offb_id, _tenant, 'Pension scheme leaver notice issued', 'finance', 'hr', 14, true, 310),
        (v_offb_id, _tenant, 'Pay outstanding holiday entitlement', 'finance', 'hr', 7, true, 320);
    ELSIF v_country = 'NZ' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'Final IRD payday filing submitted', 'finance', 'hr', 7, true, 300),
        (v_offb_id, _tenant, 'KiwiSaver final contribution', 'finance', 'hr', 14, true, 310),
        (v_offb_id, _tenant, 'Holiday pay & 8% calculation paid out', 'finance', 'hr', 7, true, 320);
    ELSIF v_country = 'AE' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'End-of-service gratuity calculated & paid', 'finance', 'hr', 14, true, 300),
        (v_offb_id, _tenant, 'Visa cancellation / labour card cancellation (MOHRE)', 'hr', 'hr', 30, true, 310),
        (v_offb_id, _tenant, 'Final WPS salary transfer processed', 'finance', 'hr', 7, true, 320),
        (v_offb_id, _tenant, 'Medical insurance cancellation', 'hr', 'hr', 14, false, 330);
    ELSIF v_country = 'PH' THEN
      INSERT INTO public.offboarding_checklist_template_items
        (template_id, tenant_id, title, category, owner_role, due_offset_days, is_blocking, sort_order) VALUES
        (v_offb_id, _tenant, 'Final pay & 13th-month pro-rated', 'finance', 'hr', 30, true, 300),
        (v_offb_id, _tenant, 'BIR Form 2316 issued', 'finance', 'hr', 30, true, 310),
        (v_offb_id, _tenant, 'SSS / PhilHealth / Pag-IBIG separation report filed', 'finance', 'hr', 30, true, 320),
        (v_offb_id, _tenant, 'Certificate of employment issued', 'hr', 'hr', 7, true, 330);
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.seed_country_onboarding_packs(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_country_onboarding_packs(uuid) TO service_role;

-- ============================================================
-- 3. AUTO-SEED: ensure new tenants get packs; reseed branches
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_seed_packs_on_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_country_onboarding_packs(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_seed_packs_on_tenant ON public.tenants;
CREATE TRIGGER tg_seed_packs_on_tenant
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.tg_seed_packs_on_tenant();

CREATE OR REPLACE FUNCTION public.tg_seed_packs_on_branch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_country_onboarding_packs(NEW.tenant_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_seed_packs_on_branch ON public.tenant_branches;
CREATE TRIGGER tg_seed_packs_on_branch
  AFTER INSERT ON public.tenant_branches
  FOR EACH ROW EXECUTE FUNCTION public.tg_seed_packs_on_branch();

-- ============================================================
-- 4. AUTO-ASSIGN onboarding: prefer country-specific seed pack
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_assign_default_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_rules boolean;
  v_country text;
  v_checklist_id uuid;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.onboarding_default_assignments
    WHERE tenant_id = NEW.tenant_id AND is_active = true
  ) INTO v_has_rules;

  IF v_has_rules THEN
    INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
    SELECT NEW.tenant_id, NEW.id, r.checklist_id, NULL,
      CASE WHEN NEW.hire_date IS NOT NULL
        THEN (NEW.hire_date + (r.due_offset_days || ' days')::interval)::date
        ELSE NULL
      END
    FROM public.onboarding_default_assignments r
    WHERE r.tenant_id = NEW.tenant_id
      AND r.is_active = true
      AND (r.department_id IS NULL OR r.department_id = NEW.department_id)
      AND (r.job_title IS NULL OR lower(r.job_title) = lower(COALESCE(NEW.job_title,'')))
    ON CONFLICT (employee_id, checklist_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Try tenant default checklist first
  INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
  SELECT NEW.tenant_id, NEW.id, c.id, NULL,
    CASE WHEN NEW.hire_date IS NOT NULL THEN NEW.hire_date + INTERVAL '30 days' ELSE NULL END::date
  FROM public.onboarding_checklists c
  WHERE c.tenant_id = NEW.tenant_id AND c.is_default = true
  ON CONFLICT (employee_id, checklist_id) DO NOTHING;

  -- If still nothing assigned, fall back to country-specific seed pack
  IF NOT EXISTS (SELECT 1 FROM public.onboarding_assignments WHERE employee_id = NEW.id) THEN
    -- Resolve employee country: branch -> tenant
    SELECT b.country_code INTO v_country
    FROM public.tenant_branches b WHERE b.id = NEW.branch_id;
    IF v_country IS NULL THEN
      SELECT t.country_code INTO v_country FROM public.tenants t WHERE t.id = NEW.tenant_id;
    END IF;

    SELECT id INTO v_checklist_id
    FROM public.onboarding_checklists
    WHERE tenant_id = NEW.tenant_id AND is_system_seed = true
      AND country_code = v_country
    ORDER BY created_at DESC LIMIT 1;

    IF v_checklist_id IS NULL THEN
      -- Generic pack
      SELECT id INTO v_checklist_id
      FROM public.onboarding_checklists
      WHERE tenant_id = NEW.tenant_id AND is_system_seed = true AND country_code IS NULL
      ORDER BY created_at DESC LIMIT 1;
    END IF;

    IF v_checklist_id IS NOT NULL THEN
      INSERT INTO public.onboarding_assignments (tenant_id, employee_id, checklist_id, assigned_by, due_date)
      VALUES (NEW.tenant_id, NEW.id, v_checklist_id, NULL,
        CASE WHEN NEW.hire_date IS NOT NULL THEN NEW.hire_date + INTERVAL '30 days' ELSE NULL END::date)
      ON CONFLICT (employee_id, checklist_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auto_assign_default_onboarding() FROM PUBLIC;

-- ============================================================
-- 5. OFFBOARDING SEED: prefer country-specific template
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_offboarding_seed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r RECORD;
  v_due date;
  v_dept uuid;
  v_branch uuid;
  v_country text;
  v_template uuid;
BEGIN
  v_due := COALESCE(NEW.last_working_day, (current_date + INTERVAL '14 days')::date);
  SELECT department_id, branch_id INTO v_dept, v_branch
    FROM public.employees WHERE id = NEW.employee_id;

  -- Resolve country: branch -> tenant
  IF v_branch IS NOT NULL THEN
    SELECT country_code INTO v_country FROM public.tenant_branches WHERE id = v_branch;
  END IF;
  IF v_country IS NULL THEN
    SELECT country_code INTO v_country FROM public.tenants WHERE id = NEW.tenant_id;
  END IF;

  -- Most-specific match order:
  -- 1) dept + reason  2) dept  3) reason  4) country seed  5) tenant default
  SELECT id INTO v_template FROM public.offboarding_checklist_templates
    WHERE tenant_id = NEW.tenant_id AND is_active = true
      AND department_id = v_dept AND reason = NEW.reason::text
    ORDER BY updated_at DESC LIMIT 1;
  IF v_template IS NULL AND v_dept IS NOT NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id = v_dept AND reason IS NULL
      ORDER BY updated_at DESC LIMIT 1;
  END IF;
  IF v_template IS NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id IS NULL AND reason = NEW.reason::text
      ORDER BY updated_at DESC LIMIT 1;
  END IF;
  IF v_template IS NULL AND v_country IS NOT NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND country_code = v_country
      ORDER BY is_system_seed DESC, updated_at DESC LIMIT 1;
  END IF;
  IF v_template IS NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND department_id IS NULL AND reason IS NULL AND is_default = true
      ORDER BY updated_at DESC LIMIT 1;
  END IF;
  -- Final fallback: any generic seed pack
  IF v_template IS NULL THEN
    SELECT id INTO v_template FROM public.offboarding_checklist_templates
      WHERE tenant_id = NEW.tenant_id AND is_active = true
        AND is_system_seed = true AND country_code IS NULL
      ORDER BY updated_at DESC LIMIT 1;
  END IF;

  IF v_template IS NOT NULL THEN
    INSERT INTO public.offboarding_checklist_items
      (tenant_id, case_id, title, category, owner_role, due_date, is_blocking, sort_order)
    SELECT NEW.tenant_id, NEW.id, ti.title, ti.category, ti.owner_role,
      (v_due + (ti.due_offset_days || ' days')::interval)::date,
      ti.is_blocking, ti.sort_order
    FROM public.offboarding_checklist_template_items ti
    WHERE ti.template_id = v_template
    ORDER BY ti.sort_order;
  ELSE
    -- Hard-coded last-resort fallback
    INSERT INTO public.offboarding_checklist_items (tenant_id, case_id, title, category, owner_role, due_date, is_blocking, sort_order) VALUES
      (NEW.tenant_id, NEW.id, 'Acknowledge resignation / termination letter', 'hr', 'hr', v_due, true, 10),
      (NEW.tenant_id, NEW.id, 'Conduct exit interview', 'hr', 'hr', v_due, false, 20),
      (NEW.tenant_id, NEW.id, 'Knowledge transfer plan & handover', 'work', 'manager', v_due, true, 30),
      (NEW.tenant_id, NEW.id, 'Revoke system access (email, SSO, VPN, apps)', 'it', 'it', v_due, true, 40),
      (NEW.tenant_id, NEW.id, 'Final payroll & severance calculation', 'finance', 'hr', v_due, true, 50),
      (NEW.tenant_id, NEW.id, 'Return ID badge & office keys', 'assets', 'employee', v_due, true, 70);
  END IF;

  -- Auto-create return tasks for any currently-issued assets
  FOR r IN
    SELECT aa.id AS assignment_id, a.name, a.asset_tag
    FROM public.asset_assignments aa
    JOIN public.assets a ON a.id = aa.asset_id
    WHERE aa.employee_id = NEW.employee_id AND aa.returned_at IS NULL
  LOOP
    INSERT INTO public.offboarding_checklist_items
      (tenant_id, case_id, title, category, owner_role, asset_assignment_id, due_date, is_blocking, sort_order)
    VALUES
      (NEW.tenant_id, NEW.id, 'Return asset: ' || COALESCE(r.name,'(asset)') || ' [' || COALESCE(r.asset_tag,'') || ']',
       'assets', 'employee', r.assignment_id, v_due, true, 100);
  END LOOP;

  PERFORM public.record_employee_event(
    NEW.tenant_id, NEW.employee_id, 'offboarding','offboarding_initiated',
    'Offboarding initiated (' || NEW.reason || ')', NEW.reason_notes,
    'offboarding_cases', NEW.id, NEW.created_at, NULL,
    CASE WHEN NEW.confidential THEN 'hr'::event_visibility ELSE 'employee'::event_visibility END,
    jsonb_build_object('reason', NEW.reason, 'last_working_day', NEW.last_working_day, 'country', v_country)
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tg_offboarding_seed() FROM PUBLIC;

-- ============================================================
-- 6. ONE-TIME BACKFILL: seed packs for all existing tenants
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.tenants LOOP
    PERFORM public.seed_country_onboarding_packs(r.id);
  END LOOP;
END;
$$;
