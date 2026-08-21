
CREATE TABLE public.toil_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  overtime_multiplier numeric NOT NULL DEFAULT 1.0,
  shift_swap_multiplier numeric NOT NULL DEFAULT 1.0,
  penalty_multiplier numeric NOT NULL DEFAULT 1.5,
  max_balance_hours numeric,
  expiry_months integer NOT NULL DEFAULT 12,
  allow_overtime_to_toil boolean NOT NULL DEFAULT true,
  allow_toil_to_overtime boolean NOT NULL DEFAULT false,
  min_request_hours numeric NOT NULL DEFAULT 1,
  require_approval boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.toil_settings TO authenticated;
GRANT ALL ON public.toil_settings TO service_role;
ALTER TABLE public.toil_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY toil_settings_read ON public.toil_settings FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY toil_settings_write ON public.toil_settings FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), tenant_id) OR public.is_hr(auth.uid(), tenant_id));
CREATE TRIGGER trg_toil_settings_touch BEFORE UPDATE ON public.toil_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TYPE public.toil_source AS ENUM ('overtime','shift_swap','penalty','manual','adjustment');
CREATE TYPE public.toil_accrual_status AS ENUM ('active','expired','consumed','reversed');
CREATE TYPE public.toil_request_status AS ENUM ('pending','approved','rejected','cancelled');

CREATE TABLE public.toil_accruals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  source public.toil_source NOT NULL,
  source_ref uuid,
  hours numeric NOT NULL CHECK (hours <> 0),
  consumed_hours numeric NOT NULL DEFAULT 0,
  accrued_on date NOT NULL DEFAULT current_date,
  expires_on date,
  status public.toil_accrual_status NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_toil_accruals_emp ON public.toil_accruals(employee_id, status);
CREATE INDEX idx_toil_accruals_tenant ON public.toil_accruals(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.toil_accruals TO authenticated;
GRANT ALL ON public.toil_accruals TO service_role;
ALTER TABLE public.toil_accruals ENABLE ROW LEVEL SECURITY;
CREATE POLICY toil_accruals_read ON public.toil_accruals FOR SELECT TO authenticated USING (
  public.is_org_admin(auth.uid(), toil_accruals.tenant_id)
  OR public.is_hr(auth.uid(), toil_accruals.tenant_id)
  OR public.is_manager_of(auth.uid(), toil_accruals.employee_id)
  OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = toil_accruals.employee_id AND e.user_id = auth.uid())
);
CREATE POLICY toil_accruals_write ON public.toil_accruals FOR ALL TO authenticated
  USING (public.is_org_admin(auth.uid(), toil_accruals.tenant_id) OR public.is_hr(auth.uid(), toil_accruals.tenant_id))
  WITH CHECK (public.is_org_admin(auth.uid(), toil_accruals.tenant_id) OR public.is_hr(auth.uid(), toil_accruals.tenant_id));
CREATE TRIGGER trg_toil_accruals_touch BEFORE UPDATE ON public.toil_accruals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.toil_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0),
  reason text,
  status public.toil_request_status NOT NULL DEFAULT 'pending',
  approver_id uuid,
  decided_at timestamptz,
  decision_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_toil_requests_emp ON public.toil_requests(employee_id, status);
CREATE INDEX idx_toil_requests_tenant ON public.toil_requests(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.toil_requests TO authenticated;
GRANT ALL ON public.toil_requests TO service_role;
ALTER TABLE public.toil_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY toil_requests_read ON public.toil_requests FOR SELECT TO authenticated USING (
  public.is_org_admin(auth.uid(), toil_requests.tenant_id)
  OR public.is_hr(auth.uid(), toil_requests.tenant_id)
  OR public.is_manager_of(auth.uid(), toil_requests.employee_id)
  OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = toil_requests.employee_id AND e.user_id = auth.uid())
);
CREATE POLICY toil_requests_insert ON public.toil_requests FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.employees e WHERE e.id = toil_requests.employee_id AND e.user_id = auth.uid() AND e.tenant_id = toil_requests.tenant_id)
  OR public.is_org_admin(auth.uid(), toil_requests.tenant_id) OR public.is_hr(auth.uid(), toil_requests.tenant_id)
);
CREATE POLICY toil_requests_update ON public.toil_requests FOR UPDATE TO authenticated USING (
  public.is_org_admin(auth.uid(), toil_requests.tenant_id)
  OR public.is_hr(auth.uid(), toil_requests.tenant_id)
  OR public.is_manager_of(auth.uid(), toil_requests.employee_id)
  OR (toil_requests.status = 'pending'::public.toil_request_status
      AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = toil_requests.employee_id AND e.user_id = auth.uid()))
);
CREATE POLICY toil_requests_delete ON public.toil_requests FOR DELETE TO authenticated USING (
  public.is_org_admin(auth.uid(), toil_requests.tenant_id) OR public.is_hr(auth.uid(), toil_requests.tenant_id)
);
CREATE TRIGGER trg_toil_requests_touch BEFORE UPDATE ON public.toil_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE VIEW public.toil_balances AS
SELECT
  e.tenant_id,
  e.id AS employee_id,
  COALESCE(SUM(CASE WHEN a.status = 'active' THEN a.hours - a.consumed_hours ELSE 0 END), 0) AS available_hours,
  COALESCE(SUM(CASE WHEN a.status = 'active' THEN a.hours ELSE 0 END), 0) AS accrued_hours,
  COALESCE(SUM(a.consumed_hours), 0) AS consumed_hours,
  COALESCE(SUM(CASE WHEN a.status = 'expired' THEN a.hours - a.consumed_hours ELSE 0 END), 0) AS expired_hours
FROM public.employees e
LEFT JOIN public.toil_accruals a ON a.employee_id = e.id
GROUP BY e.tenant_id, e.id;
GRANT SELECT ON public.toil_balances TO authenticated;

CREATE OR REPLACE FUNCTION public.toil_consume_on_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  remaining numeric := NEW.hours;
  available numeric;
  r RECORD;
  take numeric;
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status <> 'approved') THEN
    SELECT COALESCE(SUM(hours - consumed_hours), 0) INTO available
      FROM public.toil_accruals
      WHERE employee_id = NEW.employee_id AND status = 'active';
    IF available < NEW.hours THEN
      RAISE EXCEPTION 'Insufficient TOIL balance (% available, % requested)', available, NEW.hours;
    END IF;
    FOR r IN SELECT * FROM public.toil_accruals
      WHERE employee_id = NEW.employee_id AND status = 'active'
      ORDER BY COALESCE(expires_on, '9999-12-31'::date), accrued_on
    LOOP
      EXIT WHEN remaining <= 0;
      take := LEAST(r.hours - r.consumed_hours, remaining);
      UPDATE public.toil_accruals
        SET consumed_hours = consumed_hours + take,
            status = CASE WHEN consumed_hours + take >= hours THEN 'consumed'::public.toil_accrual_status ELSE status END
        WHERE id = r.id;
      remaining := remaining - take;
    END LOOP;
    NEW.decided_at := now();
    NEW.approver_id := COALESCE(NEW.approver_id, auth.uid());
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_toil_consume BEFORE INSERT OR UPDATE ON public.toil_requests
  FOR EACH ROW EXECUTE FUNCTION public.toil_consume_on_approval();

CREATE OR REPLACE FUNCTION public.toil_expire_due()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  UPDATE public.toil_accruals
    SET status = 'expired'
    WHERE status = 'active' AND expires_on IS NOT NULL AND expires_on < current_date;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

CREATE TABLE public.manager_quick_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  icon text,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manager_quick_access TO authenticated;
GRANT ALL ON public.manager_quick_access TO service_role;
ALTER TABLE public.manager_quick_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY mqa_own ON public.manager_quick_access FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
