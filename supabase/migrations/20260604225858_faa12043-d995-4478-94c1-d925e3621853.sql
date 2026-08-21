DROP TRIGGER IF EXISTS trg_audit_timesheet_overtime_breakdown ON public.timesheets;
CREATE TRIGGER trg_audit_timesheet_overtime_breakdown
AFTER INSERT OR UPDATE OF overtime_breakdown ON public.timesheets
FOR EACH ROW EXECUTE FUNCTION public.audit_timesheet_overtime_breakdown();