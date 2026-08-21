
CREATE TRIGGER trg_event_support_ticket
AFTER INSERT OR UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.tg_event_support_ticket();

CREATE TRIGGER trg_audit_support_ticket
AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_sensitive_edit();
