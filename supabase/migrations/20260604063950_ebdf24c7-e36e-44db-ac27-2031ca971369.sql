
-- Enums
DO $$ BEGIN CREATE TYPE public.review_cycle_status AS ENUM ('draft','active','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.goal_status AS ENUM ('not_started','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.review_status AS ENUM ('draft','self_submitted','manager_submitted','finalized'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- review_cycles
CREATE TABLE public.review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status public.review_cycle_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_cycles TO authenticated;
GRANT ALL ON public.review_cycles TO service_role;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org reads tenant cycles" ON public.review_cycles FOR SELECT TO authenticated USING (tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant cycles" ON public.review_cycles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "regional reads scoped cycles" ON public.review_cycles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = review_cycles.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));
CREATE POLICY "super admin all cycles" ON public.review_cycles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER review_cycles_touch BEFORE UPDATE ON public.review_cycles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- performance_goals
CREATE TABLE public.performance_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  cycle_id uuid,
  title text NOT NULL,
  description text,
  weight numeric(5,2) NOT NULL DEFAULT 0,
  progress numeric(5,2) NOT NULL DEFAULT 0,
  status public.goal_status NOT NULL DEFAULT 'not_started',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_goals TO authenticated;
GRANT ALL ON public.performance_goals TO service_role;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee manages own goals" ON public.performance_goals FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_goals.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_goals.employee_id AND e.user_id = auth.uid() AND e.tenant_id = performance_goals.tenant_id));
CREATE POLICY "manager reads tenant goals" ON public.performance_goals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "manager updates report goals" ON public.performance_goals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND EXISTS (SELECT 1 FROM public.employees e JOIN public.employees m ON e.manager_id = m.id WHERE e.id = performance_goals.employee_id AND m.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant goals" ON public.performance_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "regional reads scoped goals" ON public.performance_goals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = performance_goals.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));
CREATE POLICY "super admin all goals" ON public.performance_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER performance_goals_touch BEFORE UPDATE ON public.performance_goals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX performance_goals_emp_idx ON public.performance_goals (employee_id);

-- performance_reviews
CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  cycle_id uuid NOT NULL,
  reviewer_id uuid,
  self_rating smallint,
  manager_rating smallint,
  self_comments text,
  manager_comments text,
  status public.review_status NOT NULL DEFAULT 'draft',
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, employee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_reviews TO authenticated;
GRANT ALL ON public.performance_reviews TO service_role;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee reads own review" ON public.performance_reviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_reviews.employee_id AND e.user_id = auth.uid()));
CREATE POLICY "employee updates own self" ON public.performance_reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_reviews.employee_id AND e.user_id = auth.uid()) AND status IN ('draft','self_submitted'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = performance_reviews.employee_id AND e.user_id = auth.uid()));
CREATE POLICY "manager reads tenant reviews" ON public.performance_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "manager updates report reviews" ON public.performance_reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND EXISTS (SELECT 1 FROM public.employees e JOIN public.employees m ON e.manager_id = m.id WHERE e.id = performance_reviews.employee_id AND m.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant reviews" ON public.performance_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "regional reads scoped reviews" ON public.performance_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'regional_admin') AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = performance_reviews.tenant_id AND public.has_country_scope(auth.uid(), t.country_code)));
CREATE POLICY "super admin all reviews" ON public.performance_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER performance_reviews_touch BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- review_feedback
CREATE TABLE public.review_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  review_id uuid NOT NULL,
  author_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'peer',
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_feedback TO authenticated;
GRANT ALL ON public.review_feedback TO service_role;
ALTER TABLE public.review_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "author inserts feedback" ON public.review_feedback FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "author reads own feedback" ON public.review_feedback FOR SELECT TO authenticated
  USING (author_id = auth.uid());
CREATE POLICY "subject reads feedback" ON public.review_feedback FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.performance_reviews r JOIN public.employees e ON r.employee_id = e.id WHERE r.id = review_feedback.review_id AND e.user_id = auth.uid()));
CREATE POLICY "manager reads tenant feedback" ON public.review_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages feedback" ON public.review_feedback FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));
CREATE POLICY "super admin all feedback" ON public.review_feedback FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
