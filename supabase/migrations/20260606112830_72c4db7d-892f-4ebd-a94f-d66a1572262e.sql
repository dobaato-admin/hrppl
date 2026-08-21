
-- ===== 1. Support ticket module (employee requests routed to managers/admins) =====

CREATE TYPE public.support_ticket_category AS ENUM (
  'stationery','equipment','shift_swap','time_in_lieu','overtime_payment',
  'expense_reimbursement','api_access_request','other'
);

CREATE TYPE public.support_ticket_status AS ENUM (
  'open','in_review','approved','rejected','fulfilled','closed'
);

CREATE TYPE public.support_ticket_priority AS ENUM ('low','normal','high','urgent');

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  category public.support_ticket_category NOT NULL,
  subject text NOT NULL CHECK (length(subject) BETWEEN 2 AND 200),
  description text NOT NULL CHECK (length(description) BETWEEN 1 AND 4000),
  status public.support_ticket_status NOT NULL DEFAULT 'open',
  priority public.support_ticket_priority NOT NULL DEFAULT 'normal',
  requested_amount numeric(12,2),
  currency_code text,
  requested_for_date date,
  assigned_to uuid,
  approver_id uuid,
  decision_notes text,
  decided_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_tenant ON public.support_tickets(tenant_id, status, created_at DESC);
CREATE INDEX idx_support_tickets_employee ON public.support_tickets(employee_id, created_at DESC);
CREATE INDEX idx_support_tickets_assigned ON public.support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Employee can view & insert their own
CREATE POLICY "support_tickets_owner_select" ON public.support_tickets
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
);
CREATE POLICY "support_tickets_owner_insert" ON public.support_tickets
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.employees e
          WHERE e.id = employee_id AND e.user_id = auth.uid()
            AND e.tenant_id = support_tickets.tenant_id)
  AND created_by = auth.uid()
);
-- Employee can update their own only while open (e.g., add detail/cancel)
CREATE POLICY "support_tickets_owner_update" ON public.support_tickets
FOR UPDATE TO authenticated USING (
  status IN ('open','in_review')
  AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
);

-- Manager: assigned-to OR direct reports
CREATE POLICY "support_tickets_manager_select" ON public.support_tickets
FOR SELECT TO authenticated USING (
  has_role(auth.uid(),'manager')
  AND (assigned_to = auth.uid()
       OR EXISTS (
         SELECT 1 FROM public.employees e
         JOIN public.employees mgr ON mgr.id = e.manager_id
         WHERE e.id = support_tickets.employee_id AND mgr.user_id = auth.uid()
       ))
);
CREATE POLICY "support_tickets_manager_update" ON public.support_tickets
FOR UPDATE TO authenticated USING (
  has_role(auth.uid(),'manager')
  AND (assigned_to = auth.uid()
       OR EXISTS (
         SELECT 1 FROM public.employees e
         JOIN public.employees mgr ON mgr.id = e.manager_id
         WHERE e.id = support_tickets.employee_id AND mgr.user_id = auth.uid()
       ))
);

-- Org admin: full access within tenant
CREATE POLICY "support_tickets_org_admin_all" ON public.support_tickets
FOR ALL TO authenticated USING (
  has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid())
) WITH CHECK (
  has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid())
);

-- Regional in scope
CREATE POLICY "support_tickets_regional_all" ON public.support_tickets
FOR ALL TO authenticated USING (
  has_role(auth.uid(),'regional_admin')
  AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND has_country_scope(auth.uid(), t.country_code))
) WITH CHECK (
  has_role(auth.uid(),'regional_admin')
  AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND has_country_scope(auth.uid(), t.country_code))
);

-- Super admin
CREATE POLICY "support_tickets_super_all" ON public.support_tickets
FOR ALL TO authenticated USING (has_role(auth.uid(),'super_admin'))
WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Comments
CREATE TABLE public.support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_ticket_comments_ticket ON public.support_ticket_comments(ticket_id, created_at);

GRANT SELECT, INSERT ON public.support_ticket_comments TO authenticated;
GRANT ALL ON public.support_ticket_comments TO service_role;

ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_ticket_comments_view" ON public.support_ticket_comments
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id)
  AND (
    NOT is_internal OR
    has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager') OR
    has_role(auth.uid(),'regional_admin') OR has_role(auth.uid(),'super_admin')
  )
);

CREATE POLICY "support_ticket_comments_insert" ON public.support_ticket_comments
FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.tenant_id = support_ticket_comments.tenant_id)
);

-- Timeline trigger
CREATE OR REPLACE FUNCTION public.tg_event_support_ticket()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'request'::event_category, 'support_ticket_created',
      'Request: ' || NEW.subject, LEFT(NEW.description,500),
      'support_tickets', NEW.id, NEW.created_at, NEW.priority::text, 'employee'::event_visibility,
      jsonb_build_object('category', NEW.category, 'status', NEW.status)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'request'::event_category, 'support_ticket_status_changed',
      'Request ' || NEW.status || ': ' || NEW.subject, NEW.decision_notes,
      'support_tickets', NEW.id, now(), NEW.priority::text, 'employee'::event_visibility,
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'category', NEW.category)
    );
  END IF;
  RETURN NEW;
END $$;

-- Add 'request' to event_category enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'request'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_category')
  ) THEN
    ALTER TYPE public.event_category ADD VALUE 'request';
  END IF;
END $$;
