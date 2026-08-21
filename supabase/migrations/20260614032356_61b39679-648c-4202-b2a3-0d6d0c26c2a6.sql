-- Phase 3 Batch 1 (corrected)

-- ---------- Section C: Indexes that don't already exist ----------
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status_start
  ON public.leave_requests (employee_id, status, start_date);

CREATE INDEX IF NOT EXISTS idx_expense_claims_tenant_status_created
  ON public.expense_claims (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employee_events_employee_occurred
  ON public.employee_events (employee_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON public.audit_log (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user
  ON public.notification_preferences (user_id);

CREATE INDEX IF NOT EXISTS idx_employees_tenant_status
  ON public.employees (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_timesheets_tenant_status
  ON public.timesheets (tenant_id, status);

-- ---------- Section B1: SECURITY DEFINER hardening ----------
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint)               SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb)               SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   SET search_path = public;

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.read_email_batch(text,integer,integer)',
    'public.delete_email(text,bigint)',
    'public.enqueue_email(text,jsonb)',
    'public.move_to_dlq(text,text,bigint,jsonb)',
    'public.log_event_access(text,uuid,uuid,text,boolean,jsonb)',
    'public.blog_publish_due_posts()',
    'public.handle_new_user()',
    'public.ensure_setup_progress()',
    'public.auto_assign_default_onboarding()',
    'public.prevent_profile_privileged_changes()',
    'public.prevent_employee_user_id_change()',
    'public.prevent_tenant_country_change()',
    'public.guard_leave_opening_balance()',
    'public.guard_payroll_run_locked()',
    'public.guard_payslip_locked()',
    'public.guard_employee_review_update()',
    'public.validate_timesheet_overtime_breakdown()',
    'public.audit_timesheet_overtime_breakdown()',
    'public.audit_review_status_change()',
    'public.audit_review_feedback_request()',
    'public.audit_feedback_template_version()',
    'public.tg_audit_sensitive_edit()',
    'public.tg_event_disciplinary_case()',
    'public.tg_event_support_ticket()',
    'public.tg_event_training()',
    'public.tg_event_medical()',
    'public.tg_event_expense()',
    'public.tg_event_onboarding()',
    'public.tg_event_review()',
    'public.tg_event_payslip()',
    'public.tg_event_promotion()',
    'public.tg_event_employee_document()',
    'public.tg_event_leave()',
    'public.tg_event_pay_change()',
    'public.tg_event_grievance()',
    'public.tg_event_asset_assignment()',
    'public.tg_asset_sync_status()',
    'public.tg_offboarding_seed()',
    'public.tg_offboarding_status_event()',
    'public.touch_updated_at()',
    'public.blog_set_updated_at()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing function %', fn;
    END;
  END LOOP;
END $$;
