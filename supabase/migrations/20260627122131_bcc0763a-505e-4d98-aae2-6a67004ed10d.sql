
-- 1) employee_duties: duties & responsibilities captured during onboarding,
--    surfaced on employee dashboard, used for KPI weighting in reviews.
CREATE TABLE public.employee_duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  weight numeric(5,2) NOT NULL DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  kpi_target text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_duties_tenant ON public.employee_duties(tenant_id);
CREATE INDEX idx_employee_duties_employee ON public.employee_duties(employee_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_duties TO authenticated;
GRANT ALL ON public.employee_duties TO service_role;

ALTER TABLE public.employee_duties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duties tenant members read"
  ON public.employee_duties FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "duties employee read own"
  ON public.employee_duties FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_duties.employee_id AND e.user_id = auth.uid()
  ));

CREATE POLICY "duties admin manage"
  ON public.employee_duties FOR ALL TO authenticated
  USING (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = user_tenant_id(auth.uid())
    AND (
      has_role(auth.uid(), 'org_admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
    )
  );

CREATE TRIGGER trg_employee_duties_updated_at
  BEFORE UPDATE ON public.employee_duties
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Add region/state column to public_holidays so we can store AU state-scoped
--    holidays alongside national ones. NULL = applies nationally.
ALTER TABLE public.public_holidays ADD COLUMN IF NOT EXISTS region text;
-- Replace unique constraint to include region (so same-date holiday in two
-- states doesn't collide).
ALTER TABLE public.public_holidays
  DROP CONSTRAINT IF EXISTS public_holidays_country_code_holiday_date_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS public_holidays_country_date_region_name_key
  ON public.public_holidays(country_code, holiday_date, COALESCE(region, ''), name);
