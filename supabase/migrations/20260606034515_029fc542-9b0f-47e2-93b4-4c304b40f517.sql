
-- ============ DESIGNATIONS CATALOG ============
CREATE TABLE public.designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  code text,
  grade text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  min_salary numeric(14,2),
  max_salary numeric(14,2),
  currency_code text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, title, grade)
);
CREATE INDEX idx_designations_tenant ON public.designations(tenant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designations TO authenticated;
GRANT ALL ON public.designations TO service_role;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "designations tenant read" ON public.designations FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "designations admin write" ON public.designations FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_designations_touch BEFORE UPDATE ON public.designations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PROMOTIONS (with approval workflow) ============
CREATE TYPE public.promotion_status AS ENUM ('proposed','approved','rejected','cancelled','applied');

CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  from_designation_id uuid REFERENCES public.designations(id) ON DELETE SET NULL,
  to_designation_id uuid REFERENCES public.designations(id) ON DELETE SET NULL,
  from_job_title text,
  to_job_title text NOT NULL,
  from_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  to_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  from_manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  to_manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  from_grade text,
  to_grade text,
  effective_date date NOT NULL,
  reason text,
  proposed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_notes text,
  status public.promotion_status NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_promotions_employee ON public.promotions(employee_id);
CREATE INDEX idx_promotions_tenant_status ON public.promotions(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions self read" ON public.promotions FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid()) AND (
      public.has_role(auth.uid(),'org_admin')
      OR public.has_role(auth.uid(),'manager')
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = promotions.employee_id AND e.user_id = auth.uid())
    )
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "promotions manager propose" ON public.promotions FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );
CREATE POLICY "promotions admin decide" ON public.promotions FOR UPDATE TO authenticated
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
    OR public.has_role(auth.uid(),'super_admin')
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE TRIGGER trg_promotions_touch BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PAY RATE HISTORY ============
CREATE TYPE public.pay_rate_status AS ENUM ('proposed','approved','rejected','cancelled','applied');
CREATE TYPE public.pay_rate_reason AS ENUM ('hire','promotion','annual_review','market_adjustment','correction','other');

CREATE TABLE public.pay_rate_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
  from_amount numeric(14,2),
  to_amount numeric(14,2) NOT NULL,
  currency_code text NOT NULL,
  pay_frequency text NOT NULL DEFAULT 'monthly',
  effective_date date NOT NULL,
  reason public.pay_rate_reason NOT NULL DEFAULT 'other',
  notes text,
  proposed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_notes text,
  status public.pay_rate_status NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_rate_changes_employee ON public.pay_rate_changes(employee_id, effective_date DESC);
CREATE INDEX idx_pay_rate_changes_status ON public.pay_rate_changes(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pay_rate_changes TO authenticated;
GRANT ALL ON public.pay_rate_changes TO service_role;
ALTER TABLE public.pay_rate_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_rate self read" ON public.pay_rate_changes FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid()) AND (
      public.has_role(auth.uid(),'org_admin')
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = pay_rate_changes.employee_id AND e.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = pay_rate_changes.employee_id AND e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()))
    )
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "pay_rate manager propose" ON public.pay_rate_changes FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin'))
  );
CREATE POLICY "pay_rate admin decide" ON public.pay_rate_changes FOR UPDATE TO authenticated
  USING (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
    OR public.has_role(auth.uid(),'super_admin')
  )
  WITH CHECK (
    (tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin'))
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE TRIGGER trg_pay_rate_touch BEFORE UPDATE ON public.pay_rate_changes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ APPRECIATIONS (peer kudos) ============
CREATE TABLE public.appreciations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  from_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  to_employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  message text NOT NULL,
  emoji text,
  value_tag text,
  visibility text NOT NULL DEFAULT 'public', -- public | manager
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appreciations_tenant_created ON public.appreciations(tenant_id, created_at DESC);
CREATE INDEX idx_appreciations_to ON public.appreciations(to_employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appreciations TO authenticated;
GRANT ALL ON public.appreciations TO service_role;
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appreciations read" ON public.appreciations FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid()) AND (
      visibility = 'public'
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = appreciations.to_employee_id AND (e.user_id = auth.uid() OR e.manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())))
      OR public.has_role(auth.uid(),'org_admin')
    )
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "appreciations create" ON public.appreciations FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND from_employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );
CREATE POLICY "appreciations delete own or admin" ON public.appreciations FOR DELETE TO authenticated
  USING (
    from_employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(),'org_admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

CREATE TABLE public.appreciation_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appreciation_id uuid NOT NULL REFERENCES public.appreciations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '👏',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appreciation_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.appreciation_reactions TO authenticated;
GRANT ALL ON public.appreciation_reactions TO service_role;
ALTER TABLE public.appreciation_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions read" ON public.appreciation_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.appreciations a WHERE a.id = appreciation_reactions.appreciation_id AND a.tenant_id = public.user_tenant_id(auth.uid())));
CREATE POLICY "reactions write own" ON public.appreciation_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.appreciations a WHERE a.id = appreciation_reactions.appreciation_id AND a.tenant_id = public.user_tenant_id(auth.uid())));
CREATE POLICY "reactions delete own" ON public.appreciation_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============ AWARDS (formal nominations) ============
CREATE TYPE public.award_status AS ENUM ('open','nominated','shortlisted','awarded','closed','cancelled');
CREATE TYPE public.nomination_status AS ENUM ('submitted','shortlisted','awarded','rejected','withdrawn');

CREATE TABLE public.award_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  cadence text NOT NULL DEFAULT 'monthly', -- monthly|quarterly|annual|ad_hoc
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.award_types TO authenticated;
GRANT ALL ON public.award_types TO service_role;
ALTER TABLE public.award_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "award_types tenant read" ON public.award_types FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "award_types admin write" ON public.award_types FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_award_types_touch BEFORE UPDATE ON public.award_types FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.award_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  award_type_id uuid NOT NULL REFERENCES public.award_types(id) ON DELETE CASCADE,
  title text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  nominations_close_at timestamptz,
  status public.award_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_award_cycles_tenant ON public.award_cycles(tenant_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.award_cycles TO authenticated;
GRANT ALL ON public.award_cycles TO service_role;
ALTER TABLE public.award_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "award_cycles tenant read" ON public.award_cycles FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "award_cycles admin write" ON public.award_cycles FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_award_cycles_touch BEFORE UPDATE ON public.award_cycles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.award_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.award_cycles(id) ON DELETE CASCADE,
  nominee_employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  nominator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nominator_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  justification text NOT NULL,
  status public.nomination_status NOT NULL DEFAULT 'submitted',
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_award_nominations_cycle ON public.award_nominations(cycle_id);
CREATE INDEX idx_award_nominations_nominee ON public.award_nominations(nominee_employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.award_nominations TO authenticated;
GRANT ALL ON public.award_nominations TO service_role;
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nominations read" ON public.award_nominations FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid()) AND (
      public.has_role(auth.uid(),'org_admin')
      OR nominator_user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = award_nominations.nominee_employee_id AND e.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.award_nominations a2 WHERE a2.id = award_nominations.id AND a2.status IN ('awarded'))
    )
    OR public.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "nominations create" ON public.award_nominations FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.user_tenant_id(auth.uid()) AND nominator_user_id = auth.uid());
CREATE POLICY "nominations admin decide" ON public.award_nominations FOR UPDATE TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_award_nominations_touch BEFORE UPDATE ON public.award_nominations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.awards_granted (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.award_cycles(id) ON DELETE CASCADE,
  award_type_id uuid NOT NULL REFERENCES public.award_types(id) ON DELETE CASCADE,
  nomination_id uuid REFERENCES public.award_nominations(id) ON DELETE SET NULL,
  recipient_employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  citation text NOT NULL,
  granted_on date NOT NULL DEFAULT CURRENT_DATE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  certificate_url text,
  announced boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_awards_granted_recipient ON public.awards_granted(recipient_employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awards_granted TO authenticated;
GRANT ALL ON public.awards_granted TO service_role;
ALTER TABLE public.awards_granted ENABLE ROW LEVEL SECURITY;
CREATE POLICY "awards_granted tenant read" ON public.awards_granted FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "awards_granted admin write" ON public.awards_granted FOR ALL TO authenticated
  USING ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((tenant_id = public.user_tenant_id(auth.uid()) AND public.has_role(auth.uid(),'org_admin')) OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_awards_granted_touch BEFORE UPDATE ON public.awards_granted FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
