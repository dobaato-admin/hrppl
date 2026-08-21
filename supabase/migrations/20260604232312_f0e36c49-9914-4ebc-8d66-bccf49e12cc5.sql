
-- 1. Timesheets: restrict employee UPDATE WITH CHECK to non-approval statuses and immutable ownership
ALTER POLICY "employee updates own draft timesheet" ON public.timesheets
WITH CHECK (
  status = ANY (ARRAY['draft'::timesheet_status, 'submitted'::timesheet_status])
  AND EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = timesheets.employee_id
      AND e.user_id = auth.uid()
      AND e.tenant_id = timesheets.tenant_id
  )
);

-- 2. Performance reviews: split employee write so only self_rating/self_comments may change
DROP POLICY IF EXISTS "employee updates own self" ON public.performance_reviews;

CREATE POLICY "employee updates own self" ON public.performance_reviews
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = performance_reviews.employee_id
      AND e.user_id = auth.uid()
  )
  AND status = ANY (ARRAY['draft'::review_status, 'self_submitted'::review_status])
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = performance_reviews.employee_id
      AND e.user_id = auth.uid()
  )
);

-- Guard trigger: when an employee (non-manager/admin) updates their own review,
-- they may only change self_rating / self_comments. Manager-owned fields and status must stay put.
CREATE OR REPLACE FUNCTION public.guard_employee_review_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_privileged boolean;
BEGIN
  v_is_privileged := public.has_role(auth.uid(), 'super_admin'::app_role)
                  OR public.has_role(auth.uid(), 'org_admin'::app_role)
                  OR public.has_role(auth.uid(), 'manager'::app_role);
  IF v_is_privileged THEN
    RETURN NEW;
  END IF;

  IF NEW.manager_rating IS DISTINCT FROM OLD.manager_rating
     OR NEW.manager_comments IS DISTINCT FROM OLD.manager_comments
     OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.finalized_at IS DISTINCT FROM OLD.finalized_at
     OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
     OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.cycle_id IS DISTINCT FROM OLD.cycle_id THEN
    RAISE EXCEPTION 'Employees may only update self_rating and self_comments on their review';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_employee_review_update_trg ON public.performance_reviews;
CREATE TRIGGER guard_employee_review_update_trg
BEFORE UPDATE ON public.performance_reviews
FOR EACH ROW EXECUTE FUNCTION public.guard_employee_review_update();

-- 3. Employee documents: employees may only read 'employee' visibility docs
DROP POLICY IF EXISTS "employee reads own visible docs" ON public.employee_documents;

CREATE POLICY "employee reads own visible docs" ON public.employee_documents
FOR SELECT TO authenticated
USING (
  visibility = 'employee'
  AND EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_documents.employee_id
      AND e.user_id = auth.uid()
  )
);

-- 4. Performance goals: manager UPDATE WITH CHECK must enforce direct-report relationship
DROP POLICY IF EXISTS "manager updates report goals" ON public.performance_goals;

CREATE POLICY "manager updates report goals" ON public.performance_goals
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = performance_goals.employee_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = performance_goals.employee_id
      AND m.user_id = auth.uid()
  )
);

-- 5. Performance reviews: manager UPDATE WITH CHECK must enforce direct-report relationship
DROP POLICY IF EXISTS "manager updates report reviews" ON public.performance_reviews;

CREATE POLICY "manager updates report reviews" ON public.performance_reviews
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = performance_reviews.employee_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employees m ON e.manager_id = m.id
    WHERE e.id = performance_reviews.employee_id
      AND m.user_id = auth.uid()
  )
);

-- 6. Tenants: prevent regional_admin from moving a tenant to a different country
ALTER POLICY "regional admin updates scoped tenants" ON public.tenants
USING (
  has_role(auth.uid(), 'regional_admin'::app_role)
  AND has_country_scope(auth.uid(), country_code)
)
WITH CHECK (
  has_role(auth.uid(), 'regional_admin'::app_role)
  AND has_country_scope(auth.uid(), country_code)
);

CREATE OR REPLACE FUNCTION public.prevent_tenant_country_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.country_code IS DISTINCT FROM OLD.country_code
     AND NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Changing tenants.country_code is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_tenant_country_change_trg ON public.tenants;
CREATE TRIGGER prevent_tenant_country_change_trg
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.prevent_tenant_country_change();
