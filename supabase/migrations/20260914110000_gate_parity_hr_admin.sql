-- =============================================================================
-- Gate parity, group B: HR can administer the pages HR is offered
-- =============================================================================
--
-- Seven org-configuration pages admit `hr` through their feature key in
-- `rbac.ts`, and every one of them refused hr at the server function with
-- "Forbidden: organisation admin only". Found by
-- `tests/server-fn-role-parity.test.ts`; it rendered as an empty page, not as a
-- refusal, which is why nobody reported it.
--
-- -----------------------------------------------------------------------------
-- Why a migration is needed for only five of the tables
-- -----------------------------------------------------------------------------
--
-- The reads were never the problem. `employee_duties`, `duty_review_scores`,
-- `kpi_review_cycles`, `public_holiday_categories` and `holiday_category_dates`
-- all carry a "tenant members read" SELECT policy, so hr could always have read
-- them — it was purely the server guard refusing. `departments` and the
-- `disciplinary_*` tables already have explicit hr policies
-- (20260613140101 / 20260613140425), so they need nothing here at all.
--
-- But those guards are shared with the WRITES in the same modules. Widening one
-- without this migration would have moved the failure rather than fixed it: hr
-- opens the page, sees the data at last, presses Save, and gets a row-level
-- security error naming a policy. That is the exact trap the X-07 write-up
-- warns about, and it is worse than the original bug because it looks like data
-- loss.
--
-- So the write policies move with the guards. `is_hr` is tenant-scoped
-- (20260613135135), so each of these is confined to hr's own tenant.
--
-- This is a real widening: HR can now change duty assignments, KPI review
-- cycles and the public-holiday calendar. That is what each feature key has
-- claimed since it was written; a key that claims something the database
-- refuses is the defect being closed.

DROP POLICY IF EXISTS "hr manages tenant employee_duties" ON public.employee_duties;
CREATE POLICY "hr manages tenant employee_duties" ON public.employee_duties
  FOR ALL TO authenticated
  USING (public.is_hr((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_hr((SELECT auth.uid()), tenant_id));

DROP POLICY IF EXISTS "hr manages tenant duty_review_scores" ON public.duty_review_scores;
CREATE POLICY "hr manages tenant duty_review_scores" ON public.duty_review_scores
  FOR ALL TO authenticated
  USING (public.is_hr((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_hr((SELECT auth.uid()), tenant_id));

DROP POLICY IF EXISTS "hr manages tenant kpi_review_cycles" ON public.kpi_review_cycles;
CREATE POLICY "hr manages tenant kpi_review_cycles" ON public.kpi_review_cycles
  FOR ALL TO authenticated
  USING (public.is_hr((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_hr((SELECT auth.uid()), tenant_id));

DROP POLICY IF EXISTS "hr manages tenant holiday categories" ON public.public_holiday_categories;
CREATE POLICY "hr manages tenant holiday categories" ON public.public_holiday_categories
  FOR ALL TO authenticated
  USING (public.is_hr((SELECT auth.uid()), tenant_id))
  WITH CHECK (public.is_hr((SELECT auth.uid()), tenant_id));

-- `holiday_category_dates` has no tenant_id of its own; it reaches the tenant
-- through its category, exactly as the org_admin policy beside it does.
DROP POLICY IF EXISTS "hr manages tenant category dates" ON public.holiday_category_dates;
CREATE POLICY "hr manages tenant category dates" ON public.holiday_category_dates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.public_holiday_categories c
      WHERE c.id = holiday_category_dates.category_id
        AND public.is_hr((SELECT auth.uid()), c.tenant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.public_holiday_categories c
      WHERE c.id = holiday_category_dates.category_id
        AND public.is_hr((SELECT auth.uid()), c.tenant_id)
    )
  );
