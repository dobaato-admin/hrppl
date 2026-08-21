
CREATE TABLE public.kpi_review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  label text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  opened_at timestamptz,
  closed_at timestamptz,
  opened_by uuid,
  closed_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_review_cycles TO authenticated;
GRANT ALL ON public.kpi_review_cycles TO service_role;
ALTER TABLE public.kpi_review_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members read cycles" ON public.kpi_review_cycles
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "admins manage cycles" ON public.kpi_review_cycles
  FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manager'))
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manager'))
  );

CREATE TRIGGER trg_kpi_review_cycles_updated_at
  BEFORE UPDATE ON public.kpi_review_cycles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.duty_review_scores ADD COLUMN IF NOT EXISTS submitter_kind text NOT NULL DEFAULT 'reviewer';

DROP POLICY IF EXISTS "employees self submit duty scores" ON public.duty_review_scores;
CREATE POLICY "employees self submit duty scores" ON public.duty_review_scores
  FOR ALL TO authenticated
  USING (
    submitter_kind = 'self'
    AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
  WITH CHECK (
    submitter_kind = 'self'
    AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.kpi_review_cycles c
      WHERE c.label = cycle_label
        AND c.tenant_id = duty_review_scores.tenant_id
        AND c.status = 'open'
        AND CURRENT_DATE BETWEEN c.starts_on AND c.ends_on
    )
  );

CREATE TABLE public.employee_holiday_override_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  action text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  before_data jsonb,
  after_data jsonb,
  employee_overrides_before jsonb,
  employee_overrides_after jsonb
);
GRANT SELECT, INSERT ON public.employee_holiday_override_audit TO authenticated;
GRANT ALL ON public.employee_holiday_override_audit TO service_role;
ALTER TABLE public.employee_holiday_override_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read holiday override audit" ON public.employee_holiday_override_audit
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "system inserts holiday override audit" ON public.employee_holiday_override_audit
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE OR REPLACE FUNCTION public.log_employee_holiday_override_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant uuid;
  v_emp uuid;
  v_before jsonb;
  v_after jsonb;
  v_list_after jsonb;
  v_list_before jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_tenant := OLD.tenant_id; v_emp := OLD.employee_id;
    v_before := to_jsonb(OLD); v_after := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_tenant := NEW.tenant_id; v_emp := NEW.employee_id;
    v_before := NULL; v_after := to_jsonb(NEW);
  ELSE
    v_tenant := NEW.tenant_id; v_emp := NEW.employee_id;
    v_before := to_jsonb(OLD); v_after := to_jsonb(NEW);
  END IF;

  SELECT coalesce(jsonb_agg(to_jsonb(o.*) ORDER BY o.holiday_date), '[]'::jsonb)
    INTO v_list_after
    FROM public.employee_holiday_overrides o WHERE o.employee_id = v_emp;

  IF TG_OP = 'INSERT' THEN
    SELECT coalesce(jsonb_agg(to_jsonb(o.*) ORDER BY o.holiday_date), '[]'::jsonb)
      INTO v_list_before
      FROM public.employee_holiday_overrides o
      WHERE o.employee_id = v_emp AND o.id <> NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT coalesce(jsonb_agg(CASE WHEN o.id = NEW.id THEN to_jsonb(OLD) ELSE to_jsonb(o.*) END ORDER BY o.holiday_date), '[]'::jsonb)
      INTO v_list_before
      FROM public.employee_holiday_overrides o WHERE o.employee_id = v_emp;
  ELSE
    SELECT coalesce(jsonb_agg(to_jsonb(o.*) ORDER BY o.holiday_date), '[]'::jsonb)
      INTO v_list_before
      FROM public.employee_holiday_overrides o WHERE o.employee_id = v_emp;
    v_list_after := (
      SELECT coalesce(jsonb_agg(to_jsonb(o.*) ORDER BY o.holiday_date), '[]'::jsonb)
      FROM public.employee_holiday_overrides o WHERE o.employee_id = v_emp AND o.id <> OLD.id
    );
  END IF;

  INSERT INTO public.employee_holiday_override_audit
    (tenant_id, employee_id, action, changed_by, before_data, after_data, employee_overrides_before, employee_overrides_after)
  VALUES
    (v_tenant, v_emp, lower(TG_OP), auth.uid(), v_before, v_after, v_list_before, v_list_after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_employee_holiday_overrides_audit ON public.employee_holiday_overrides;
CREATE TRIGGER trg_employee_holiday_overrides_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_holiday_overrides
  FOR EACH ROW EXECUTE FUNCTION public.log_employee_holiday_override_change();
