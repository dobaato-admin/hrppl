CREATE TABLE IF NOT EXISTS public.time_entry_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  time_entry_id uuid NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.client_jobs(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  cost_centre_code text,
  percentage numeric(6,3) NOT NULL,
  hours numeric(6,2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tea_pct_range CHECK (percentage > 0 AND percentage <= 100),
  CONSTRAINT tea_hours_nonneg CHECK (hours >= 0)
);

CREATE INDEX IF NOT EXISTS idx_tea_tenant_entry ON public.time_entry_allocations(tenant_id, time_entry_id);
CREATE INDEX IF NOT EXISTS idx_tea_project ON public.time_entry_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_tea_department ON public.time_entry_allocations(department_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entry_allocations TO authenticated;
GRANT ALL ON public.time_entry_allocations TO service_role;

ALTER TABLE public.time_entry_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tea_select ON public.time_entry_allocations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.time_entries te
    JOIN public.employees e ON e.id = te.employee_id
    WHERE te.id = time_entry_allocations.time_entry_id
      AND (e.user_id = auth.uid()
           OR public.has_role(auth.uid(), 'org_admin')
           OR public.has_role(auth.uid(), 'super_admin')
           OR public.has_role(auth.uid(), 'manager'))
  ));

CREATE POLICY tea_insert ON public.time_entry_allocations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.time_entries te
    JOIN public.employees e ON e.id = te.employee_id
    WHERE te.id = time_entry_allocations.time_entry_id
      AND (e.user_id = auth.uid()
           OR public.has_role(auth.uid(), 'org_admin')
           OR public.has_role(auth.uid(), 'super_admin'))
  ));

CREATE POLICY tea_update ON public.time_entry_allocations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.time_entries te
    JOIN public.employees e ON e.id = te.employee_id
    WHERE te.id = time_entry_allocations.time_entry_id
      AND (e.user_id = auth.uid()
           OR public.has_role(auth.uid(), 'org_admin')
           OR public.has_role(auth.uid(), 'super_admin'))
  ));

CREATE POLICY tea_delete ON public.time_entry_allocations
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.time_entries te
    JOIN public.employees e ON e.id = te.employee_id
    WHERE te.id = time_entry_allocations.time_entry_id
      AND (e.user_id = auth.uid()
           OR public.has_role(auth.uid(), 'org_admin')
           OR public.has_role(auth.uid(), 'super_admin'))
  ));

CREATE OR REPLACE FUNCTION public.validate_time_entry_allocations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  total_pct numeric;
BEGIN
  SELECT COALESCE(SUM(percentage),0) INTO total_pct
    FROM public.time_entry_allocations
   WHERE time_entry_id = COALESCE(NEW.time_entry_id, OLD.time_entry_id);
  IF total_pct > 100.001 THEN
    RAISE EXCEPTION 'Allocations sum to % percent, exceeds 100 for time entry', total_pct;
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_validate_time_entry_allocations ON public.time_entry_allocations;
CREATE CONSTRAINT TRIGGER trg_validate_time_entry_allocations
  AFTER INSERT OR UPDATE OR DELETE ON public.time_entry_allocations
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.validate_time_entry_allocations();

ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS rostered_hours numeric(6,2);

CREATE OR REPLACE VIEW public.v_timesheet_variance AS
WITH att AS (
  SELECT tenant_id, employee_id, work_date,
         SUM(hours_worked)::numeric(6,2) AS attendance_hours
    FROM public.attendance_entries
   WHERE status IN ('approved','submitted','pending','clocked_out')
   GROUP BY tenant_id, employee_id, work_date
), tim AS (
  SELECT tenant_id, employee_id, work_date,
         SUM(hours)::numeric(6,2) AS claimed_hours,
         SUM(COALESCE(rostered_hours,0))::numeric(6,2) AS rostered_hours,
         COUNT(*) AS entry_count
    FROM public.time_entries
   GROUP BY tenant_id, employee_id, work_date
)
SELECT
  COALESCE(tim.tenant_id, att.tenant_id) AS tenant_id,
  COALESCE(tim.employee_id, att.employee_id) AS employee_id,
  COALESCE(tim.work_date, att.work_date) AS work_date,
  COALESCE(tim.rostered_hours,0)  AS rostered_hours,
  COALESCE(att.attendance_hours,0) AS attendance_hours,
  COALESCE(tim.claimed_hours,0)   AS claimed_hours,
  COALESCE(tim.entry_count,0)     AS entry_count,
  (COALESCE(tim.claimed_hours,0) - COALESCE(att.attendance_hours,0))::numeric(6,2) AS variance_claim_vs_attendance,
  (COALESCE(att.attendance_hours,0) - COALESCE(tim.rostered_hours,0))::numeric(6,2) AS variance_attendance_vs_roster,
  CASE WHEN ABS(COALESCE(tim.claimed_hours,0) - COALESCE(att.attendance_hours,0)) > 0.5 THEN true ELSE false END AS flag_suspicious
FROM tim FULL OUTER JOIN att
  ON  tim.tenant_id  = att.tenant_id
 AND tim.employee_id = att.employee_id
 AND tim.work_date   = att.work_date;

GRANT SELECT ON public.v_timesheet_variance TO authenticated;
GRANT SELECT ON public.v_timesheet_variance TO service_role;