
CREATE TABLE public.public_holiday_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES public.countries(code),
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, country_code, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_holiday_categories TO authenticated;
GRANT ALL ON public.public_holiday_categories TO service_role;

ALTER TABLE public.public_holiday_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read own categories"
  ON public.public_holiday_categories FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages own tenant categories"
  ON public.public_holiday_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin manages all categories"
  ON public.public_holiday_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_phc_updated_at
  BEFORE UPDATE ON public.public_holiday_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.holiday_category_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.public_holiday_categories(id) ON DELETE CASCADE,
  holiday_date date NOT NULL,
  name text NOT NULL,
  is_paid boolean NOT NULL DEFAULT true,
  pay_multiplier numeric(5,2) CHECK (pay_multiplier IS NULL OR (pay_multiplier >= 1.0 AND pay_multiplier <= 10.0)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, holiday_date, name)
);
CREATE INDEX idx_hcd_category_date ON public.holiday_category_dates(category_id, holiday_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.holiday_category_dates TO authenticated;
GRANT ALL ON public.holiday_category_dates TO service_role;

ALTER TABLE public.holiday_category_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read own category dates"
  ON public.holiday_category_dates FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.public_holiday_categories c
    WHERE c.id = holiday_category_dates.category_id
      AND c.tenant_id = public.user_tenant_id(auth.uid())
  ));

CREATE POLICY "org admin manages own category dates"
  ON public.holiday_category_dates FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'org_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.public_holiday_categories c
      WHERE c.id = holiday_category_dates.category_id
        AND c.tenant_id = public.user_tenant_id(auth.uid())
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'org_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.public_holiday_categories c
      WHERE c.id = holiday_category_dates.category_id
        AND c.tenant_id = public.user_tenant_id(auth.uid())
    )
  );

CREATE POLICY "super admin manages all category dates"
  ON public.holiday_category_dates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_hcd_updated_at
  BEFORE UPDATE ON public.holiday_category_dates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.tenants
  ADD COLUMN default_holiday_category_id uuid REFERENCES public.public_holiday_categories(id) ON DELETE SET NULL;

ALTER TABLE public.departments
  ADD COLUMN default_holiday_category_id uuid REFERENCES public.public_holiday_categories(id) ON DELETE SET NULL;

ALTER TABLE public.employees
  ADD COLUMN holiday_category_id uuid REFERENCES public.public_holiday_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_employees_holiday_category ON public.employees(holiday_category_id) WHERE holiday_category_id IS NOT NULL;
CREATE INDEX idx_departments_holiday_category ON public.departments(default_holiday_category_id) WHERE default_holiday_category_id IS NOT NULL;
