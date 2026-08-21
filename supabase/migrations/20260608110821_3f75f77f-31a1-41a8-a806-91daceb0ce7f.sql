-- Lock down trigger functions and internal helpers from anon/authenticated.
-- They are invoked by the DB (triggers / cron); the API never needs them.
DO $$
DECLARE
  f text;
  -- Functions intentionally callable by signed-in users (security definer
  -- still applies, but we want the API surface to remain).
  app_callable text[] := ARRAY[
    'public.has_role(uuid, app_role)',
    'public.has_country_scope(uuid, text)',
    'public.user_tenant_id(uuid)',
    'public.can_view_employee_event(uuid)',
    'public.active_payslip_template(text, date)',
    'public.clone_payslip_template(uuid)',
    'public.publish_payslip_template(uuid, date)',
    'public.record_employee_event(uuid, uuid, event_category, text, text, text, text, uuid, timestamp with time zone, text, event_visibility, jsonb)',
    'public.log_event_access(text, uuid, uuid, text, boolean, jsonb)'
  ];
  internal_fns text[] := ARRAY[
    'public.audit_feedback_template_version()',
    'public.audit_review_feedback_request()',
    'public.audit_review_status_change()',
    'public.audit_timesheet_overtime_breakdown()',
    'public.auto_assign_default_onboarding()',
    'public.blog_publish_due_posts()',
    'public.ensure_setup_progress()',
    'public.guard_employee_review_update()',
    'public.handle_new_user()',
    'public.prevent_employee_user_id_change()',
    'public.prevent_profile_privileged_changes()',
    'public.prevent_tenant_country_change()',
    'public.tg_asset_sync_status()',
    'public.tg_audit_sensitive_edit()',
    'public.tg_event_asset_assignment()',
    'public.tg_event_disciplinary_case()',
    'public.tg_event_employee_document()',
    'public.tg_event_expense()',
    'public.tg_event_grievance()',
    'public.tg_event_leave()',
    'public.tg_event_medical()',
    'public.tg_event_onboarding()',
    'public.tg_event_pay_change()',
    'public.tg_event_payslip()',
    'public.tg_event_promotion()',
    'public.tg_event_review()',
    'public.tg_event_support_ticket()',
    'public.tg_event_training()',
    'public.tg_offboarding_seed()',
    'public.tg_offboarding_status_event()',
    'public.validate_timesheet_overtime_breakdown()',
    'public.enqueue_email(text, jsonb)',
    'public.read_email_batch(text, integer, integer)',
    'public.delete_email(text, bigint)',
    'public.move_to_dlq(text, text, bigint, jsonb)'
  ];
BEGIN
  FOREACH f IN ARRAY internal_fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', f);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;

  -- App helpers: revoke from anon, keep authenticated + service_role.
  FOREACH f IN ARRAY app_callable LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;