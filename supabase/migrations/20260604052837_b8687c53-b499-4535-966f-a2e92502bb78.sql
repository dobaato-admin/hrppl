
-- 1. EMPLOYEES: drop overly broad tenant read; allow employee self-read + manager read
DROP POLICY IF EXISTS "org members read own tenant employees" ON public.employees;

CREATE POLICY "employee reads own record"
  ON public.employees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "manager reads tenant employees"
  ON public.employees FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

-- Prevent org_admin from re-linking an employee to a different auth user (privilege escalation)
CREATE OR REPLACE FUNCTION public.prevent_employee_user_id_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     AND NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Changing employee.user_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_employee_user_id ON public.employees;
CREATE TRIGGER guard_employee_user_id
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.prevent_employee_user_id_change();

-- 2. LEAVE_BALANCES: drop broad tenant read; keep employee self-read; add manager read
DROP POLICY IF EXISTS "org members read tenant balances" ON public.leave_balances;

CREATE POLICY "manager reads tenant balances"
  ON public.leave_balances FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

-- 3. LEAVE_REQUESTS: drop broad tenant read; keep employee self-read; add manager read
DROP POLICY IF EXISTS "org members read tenant requests" ON public.leave_requests;

CREATE POLICY "manager reads tenant requests"
  ON public.leave_requests FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

-- 4. PAYROLL_PAYSLIPS: drop broad tenant read; rely on existing role-specific policies
DROP POLICY IF EXISTS "org members read own tenant payslips" ON public.payroll_payslips;

CREATE POLICY "manager reads tenant payslips"
  ON public.payroll_payslips FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

-- 5. Fix mutable search_path on internal queue helper functions
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;
