
-- Add overtime breakdown column to timesheets
ALTER TABLE public.timesheets
  ADD COLUMN IF NOT EXISTS overtime_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Validation trigger
CREATE OR REPLACE FUNCTION public.validate_timesheet_overtime_breakdown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
  v numeric;
  total numeric := 0;
  country text;
  rate_exists boolean;
BEGIN
  -- Lock guard: do not allow editing overtime fields after a payroll run has consumed this timesheet.
  IF TG_OP = 'UPDATE'
     AND OLD.consumed_by_run_id IS NOT NULL
     AND (NEW.overtime_hours IS DISTINCT FROM OLD.overtime_hours
          OR NEW.overtime_breakdown::text IS DISTINCT FROM OLD.overtime_breakdown::text) THEN
    RAISE EXCEPTION 'Cannot modify overtime fields: timesheet already consumed by payroll run %', OLD.consumed_by_run_id;
  END IF;

  IF NEW.overtime_breakdown IS NULL OR NEW.overtime_breakdown = '{}'::jsonb THEN
    RETURN NEW;
  END IF;

  SELECT t.country_code INTO country FROM public.tenants t WHERE t.id = NEW.tenant_id;
  IF country IS NULL THEN
    RAISE EXCEPTION 'Tenant country not found for timesheet';
  END IF;

  FOR k, v IN
    SELECT key, value::numeric FROM jsonb_each_text(NEW.overtime_breakdown)
  LOOP
    IF v < 0 THEN
      RAISE EXCEPTION 'Overtime breakdown hours for % cannot be negative', k;
    END IF;
    total := total + v;
    SELECT EXISTS (
      SELECT 1 FROM public.overtime_penalty_rates r
      WHERE r.country_code = country
        AND r.code = k
        AND r.is_active = true
        AND r.effective_from <= NEW.period_end
        AND (r.effective_to IS NULL OR r.effective_to >= NEW.period_end)
    ) INTO rate_exists;
    IF NOT rate_exists THEN
      RAISE EXCEPTION 'Unknown or inactive overtime rate code: %', k;
    END IF;
  END LOOP;

  IF ABS(total - COALESCE(NEW.overtime_hours, 0)) > 0.01 THEN
    RAISE EXCEPTION 'Overtime breakdown total (%) must equal overtime_hours (%)', total, NEW.overtime_hours;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_timesheet_overtime_breakdown_trg ON public.timesheets;
CREATE TRIGGER validate_timesheet_overtime_breakdown_trg
BEFORE INSERT OR UPDATE ON public.timesheets
FOR EACH ROW EXECUTE FUNCTION public.validate_timesheet_overtime_breakdown();
