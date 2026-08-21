
-- 1) Extend staff_invitations with duties payload + state region
ALTER TABLE public.staff_invitations
  ADD COLUMN IF NOT EXISTS duties jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS state_region text;

-- 2) Per-employee state region (e.g. NSW, VIC) used to filter AU state holidays
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS state_region text;

-- 3) AU holiday sync log
CREATE TABLE IF NOT EXISTS public.au_holiday_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  year int NOT NULL,
  status text NOT NULL CHECK (status IN ('success','partial','failed')),
  source_url text,
  inserted_count int NOT NULL DEFAULT 0,
  skipped_count int NOT NULL DEFAULT 0,
  total_count int NOT NULL DEFAULT 0,
  error_message text,
  csv_parse_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  synced_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.au_holiday_sync_log TO authenticated;
GRANT ALL ON public.au_holiday_sync_log TO service_role;

ALTER TABLE public.au_holiday_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sync log read" ON public.au_holiday_sync_log;
CREATE POLICY "sync log read" ON public.au_holiday_sync_log
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'org_admin')
    OR public.has_role(auth.uid(),'regional_admin')
  );

DROP POLICY IF EXISTS "sync log insert" ON public.au_holiday_sync_log;
CREATE POLICY "sync log insert" ON public.au_holiday_sync_log
  FOR INSERT TO authenticated
  WITH CHECK (
    synced_by = auth.uid()
    AND (
      public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'regional_admin')
    )
  );

CREATE INDEX IF NOT EXISTS au_holiday_sync_log_started_idx
  ON public.au_holiday_sync_log (started_at DESC);

-- 4) Per-employee holiday overrides (admin can add a custom holiday for an
--    employee, or suppress a synced state holiday they shouldn't observe).
CREATE TABLE IF NOT EXISTS public.employee_holiday_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  holiday_date date NOT NULL,
  name text NOT NULL,
  action text NOT NULL CHECK (action IN ('add','remove')),
  is_paid boolean NOT NULL DEFAULT true,
  pay_multiplier numeric,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, holiday_date, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_holiday_overrides TO authenticated;
GRANT ALL ON public.employee_holiday_overrides TO service_role;

ALTER TABLE public.employee_holiday_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "overrides tenant read" ON public.employee_holiday_overrides;
CREATE POLICY "overrides tenant read" ON public.employee_holiday_overrides
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "overrides admin manage" ON public.employee_holiday_overrides;
CREATE POLICY "overrides admin manage" ON public.employee_holiday_overrides
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
    )
  );

CREATE OR REPLACE FUNCTION public.touch_updated_at_overrides()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_emp_holiday_overrides_updated ON public.employee_holiday_overrides;
CREATE TRIGGER trg_emp_holiday_overrides_updated
  BEFORE UPDATE ON public.employee_holiday_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_overrides();

-- 5) Duty-based KPI review scores
CREATE TABLE IF NOT EXISTS public.duty_review_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  duty_id uuid NOT NULL REFERENCES public.employee_duties(id) ON DELETE CASCADE,
  cycle_label text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  comments text,
  reviewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, duty_id, cycle_label)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.duty_review_scores TO authenticated;
GRANT ALL ON public.duty_review_scores TO service_role;

ALTER TABLE public.duty_review_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "duty scores admin manage" ON public.duty_review_scores;
CREATE POLICY "duty scores admin manage" ON public.duty_review_scores
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'manager')
    )
  );

DROP POLICY IF EXISTS "duty scores employee read own" ON public.duty_review_scores;
CREATE POLICY "duty scores employee read own" ON public.duty_review_scores
  FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS trg_duty_review_scores_updated ON public.duty_review_scores;
CREATE TRIGGER trg_duty_review_scores_updated
  BEFORE UPDATE ON public.duty_review_scores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_overrides();
