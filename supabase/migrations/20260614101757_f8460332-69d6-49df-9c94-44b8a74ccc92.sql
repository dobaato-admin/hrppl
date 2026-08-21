
-- Awards catalogue (reference data, country-scoped)
CREATE TABLE public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  industry text,
  description text,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, code)
);
GRANT SELECT ON public.awards TO anon, authenticated;
GRANT ALL ON public.awards TO service_role;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "awards readable by all" ON public.awards FOR SELECT USING (true);
CREATE POLICY "awards manage by super/regional admin" ON public.awards FOR ALL
  USING (public.has_role(auth.uid(),'super_admin') OR
    (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), country_code)))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR
    (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), country_code)));
CREATE TRIGGER awards_touch BEFORE UPDATE ON public.awards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Classifications within an award
CREATE TABLE public.award_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id uuid NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  level int,
  parent_id uuid REFERENCES public.award_classifications(id) ON DELETE SET NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (award_id, code)
);
GRANT SELECT ON public.award_classifications TO anon, authenticated;
GRANT ALL ON public.award_classifications TO service_role;
ALTER TABLE public.award_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classifications readable by all" ON public.award_classifications FOR SELECT USING (true);
CREATE POLICY "classifications manage by super/regional admin" ON public.award_classifications FOR ALL
  USING (EXISTS (SELECT 1 FROM public.awards a WHERE a.id = award_id AND
    (public.has_role(auth.uid(),'super_admin') OR
     (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), a.country_code)))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.awards a WHERE a.id = award_id AND
    (public.has_role(auth.uid(),'super_admin') OR
     (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), a.country_code)))));
CREATE TRIGGER award_classifications_touch BEFORE UPDATE ON public.award_classifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX award_classifications_award_idx ON public.award_classifications(award_id);

-- Effective-dated minimum rates per classification
CREATE TABLE public.award_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classification_id uuid NOT NULL REFERENCES public.award_classifications(id) ON DELETE CASCADE,
  effective_from date NOT NULL,
  effective_to date,
  hourly_rate numeric(10,4),
  weekly_rate numeric(10,2),
  annual_rate numeric(12,2),
  casual_loading_pct numeric(6,3) DEFAULT 25.0,
  penalty_multipliers jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowances jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.award_rates TO anon, authenticated;
GRANT ALL ON public.award_rates TO service_role;
ALTER TABLE public.award_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates readable by all" ON public.award_rates FOR SELECT USING (true);
CREATE POLICY "rates manage by super/regional admin" ON public.award_rates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.award_classifications c
    JOIN public.awards a ON a.id = c.award_id WHERE c.id = classification_id AND
    (public.has_role(auth.uid(),'super_admin') OR
     (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), a.country_code)))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.award_classifications c
    JOIN public.awards a ON a.id = c.award_id WHERE c.id = classification_id AND
    (public.has_role(auth.uid(),'super_admin') OR
     (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), a.country_code)))));
CREATE TRIGGER award_rates_touch BEFORE UPDATE ON public.award_rates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX award_rates_classification_idx ON public.award_rates(classification_id, effective_from DESC);

-- Employee → award classification assignment (tenant scoped)
CREATE TABLE public.employee_award_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  classification_id uuid NOT NULL REFERENCES public.award_classifications(id),
  effective_from date NOT NULL,
  effective_to date,
  casual boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_award_assignments TO authenticated;
GRANT ALL ON public.employee_award_assignments TO service_role;
ALTER TABLE public.employee_award_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eaa org admin manage" ON public.employee_award_assignments FOR ALL
  USING (public.is_org_admin(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id));
CREATE POLICY "eaa employee read own" ON public.employee_award_assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));
CREATE POLICY "eaa hr read" ON public.employee_award_assignments FOR SELECT
  USING (public.is_hr(auth.uid(), tenant_id));
CREATE TRIGGER employee_award_assignments_touch BEFORE UPDATE ON public.employee_award_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX eaa_tenant_emp_idx ON public.employee_award_assignments(tenant_id, employee_id, effective_from DESC);

-- Helper: get active rate on a date
CREATE OR REPLACE FUNCTION public.award_rate_on(_classification_id uuid, _on date)
RETURNS public.award_rates
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT * FROM public.award_rates
  WHERE classification_id = _classification_id
    AND is_active = true
    AND effective_from <= _on
    AND (effective_to IS NULL OR effective_to >= _on)
  ORDER BY effective_from DESC
  LIMIT 1
$$;
