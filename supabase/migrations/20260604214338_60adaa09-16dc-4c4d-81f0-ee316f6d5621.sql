CREATE OR REPLACE FUNCTION public.audit_timesheet_overtime_breakdown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.overtime_breakdown IS NULL OR NEW.overtime_breakdown = '{}'::jsonb THEN
      RETURN NEW;
    END IF;
    v_action := 'overtime_breakdown_set';
    v_before := '{}'::jsonb;
    v_after := NEW.overtime_breakdown;
  ELSE
    IF NEW.overtime_breakdown IS NOT DISTINCT FROM OLD.overtime_breakdown THEN
      RETURN NEW;
    END IF;
    v_action := 'overtime_breakdown_changed';
    v_before := COALESCE(OLD.overtime_breakdown, '{}'::jsonb);
    v_after := COALESCE(NEW.overtime_breakdown, '{}'::jsonb);
  END IF;

  INSERT INTO public.audit_log (entity_type, entity_id, action, actor_id, metadata)
  VALUES (
    'timesheet',
    NEW.id::text,
    v_action,
    auth.uid(),
    jsonb_build_object(
      'tenant_id', NEW.tenant_id,
      'employee_id', NEW.employee_id,
      'period_start', NEW.period_start,
      'period_end', NEW.period_end,
      'overtime_hours', NEW.overtime_hours,
      'status', NEW.status,
      'before', v_before,
      'after', v_after
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_timesheet_overtime_breakdown ON public.timesheets;
CREATE TRIGGER trg_audit_timesheet_overtime_breakdown
AFTER INSERT OR UPDATE OF overtime_breakdown ON public.timesheets
FOR EACH ROW EXECUTE FUNCTION public.audit_timesheet_overtime_breakdown();
