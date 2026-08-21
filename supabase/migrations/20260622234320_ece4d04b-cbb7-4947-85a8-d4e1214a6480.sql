
-- Scope columns on onboarding checklists
ALTER TABLE public.onboarding_checklists
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS description text;

-- Scope columns on offboarding templates
ALTER TABLE public.offboarding_checklist_templates
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 100;

-- Indexes for scale (tenant-scoped reads dominate)
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_scope
  ON public.onboarding_checklists (tenant_id, country_code, branch_id, department_id, employment_type, priority);

CREATE INDEX IF NOT EXISTS idx_offboarding_templates_scope
  ON public.offboarding_checklist_templates (tenant_id, country_code, branch_id, department_id, employment_type, priority);

CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_tenant_emp
  ON public.onboarding_assignments (tenant_id, employee_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_emp_checklist
  ON public.onboarding_progress (employee_id, checklist_id);

CREATE INDEX IF NOT EXISTS idx_offboarding_items_case
  ON public.offboarding_checklist_items (case_id);

CREATE INDEX IF NOT EXISTS idx_offboarding_cases_tenant_emp
  ON public.offboarding_cases (tenant_id, employee_id);
