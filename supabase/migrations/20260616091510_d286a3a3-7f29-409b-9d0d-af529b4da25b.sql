CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email_pending_lookup ON public.staff_invitations (email, status, expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_trial_invitations_email_pending_lookup ON public.org_trial_invitations (email, status, expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_courses_tenant_title ON public.training_courses (tenant_id, title);