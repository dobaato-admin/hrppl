-- Phase 3 Batch 2: Additive FK columns (A9, A4, A7)

-- ---------- A9: employees.designation_id ----------
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS designation_id uuid
    REFERENCES public.designations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_employees_designation
  ON public.employees (designation_id);

-- ---------- A4: payslip_line_items.component_id ----------
ALTER TABLE public.payslip_line_items
  ADD COLUMN IF NOT EXISTS component_id uuid
    REFERENCES public.payroll_components(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payslip_line_items_component
  ON public.payslip_line_items (component_id);

-- ---------- A7: onboarding_progress.profile_section ----------
ALTER TABLE public.onboarding_progress
  ADD COLUMN IF NOT EXISTS profile_section text;

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_profile_section
  ON public.onboarding_progress (profile_section)
  WHERE profile_section IS NOT NULL;
