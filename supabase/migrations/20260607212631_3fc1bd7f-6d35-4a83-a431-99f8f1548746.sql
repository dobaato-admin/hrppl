
-- 1) Disciplinary storage: exclude confidential cases from employee read
DROP POLICY IF EXISTS "Employee read own case files" ON storage.objects;
CREATE POLICY "Employee read own case files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'disciplinary-files'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text FROM public.disciplinary_cases c
    WHERE c.confidential = false
      AND c.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- 2) employee-documents DELETE: mirror SELECT (visibility='employee' on metadata row)
DROP POLICY IF EXISTS "employee deletes own bucket files" ON storage.objects;
CREATE POLICY "employee deletes own bucket files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'employee-documents'
  AND EXISTS (
    SELECT 1 FROM public.employee_documents d
    JOIN public.employees e ON e.id = d.employee_id
    WHERE e.user_id = auth.uid()
      AND d.file_path = storage.objects.name
      AND d.visibility = 'employee'
  )
);

-- 3) Allow enrolled employees to read quiz questions for their assigned courses
CREATE POLICY "enrolled employees read quiz questions"
ON public.training_quiz_questions FOR SELECT
TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.training_enrollments en
    JOIN public.employees e ON e.id = en.employee_id
    WHERE en.course_id = training_quiz_questions.course_id
      AND e.user_id = auth.uid()
      AND en.status IN ('assigned','in_progress')
  )
);

-- 4) Harden SECURITY DEFINER functions: revoke PUBLIC EXECUTE; grant only what's needed
-- Helpers used inside RLS policies must remain callable by authenticated.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_offboarding_seed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_offboarding_status_event() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_assign_default_onboarding() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_setup_progress() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_payroll_run_locked() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_payslip_locked() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_employee_review_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privileged_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_employee_user_id_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_tenant_country_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_timesheet_overtime_breakdown() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_timesheet_overtime_breakdown() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_feedback_template_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_review_feedback_request() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_review_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_payslip() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_review() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_pay_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_expense() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_employee_document() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_promotion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_disciplinary_case() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_training() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_leave() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_support_ticket() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_grievance() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_onboarding() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_medical() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_event_asset_assignment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_asset_sync_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_audit_sensitive_edit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_employee_event(uuid,uuid,event_category,text,text,text,text,uuid,timestamptz,text,event_visibility,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_event_access(text,uuid,uuid,text,boolean,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text,text,bigint,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text,integer,integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text,bigint) FROM PUBLIC;

-- Helpers used in RLS policies — must remain callable by authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_country_scope(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_country_scope(uuid, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_tenant_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_tenant_id(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.can_view_employee_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_employee_event(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.active_payslip_template(text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.active_payslip_template(text, date) TO authenticated, service_role;

-- RPC functions invoked by privileged users from the app
REVOKE EXECUTE ON FUNCTION public.clone_payslip_template(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clone_payslip_template(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.publish_payslip_template(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_payslip_template(uuid, date) TO authenticated, service_role;
