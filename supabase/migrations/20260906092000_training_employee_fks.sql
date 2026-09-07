-- The training roster has never shown a single row.
--
-- `training_enrollments.employee_id` and `certifications.employee_id` were
-- declared as bare `uuid NOT NULL` in 20260606063457. No foreign key, ever.
--
-- Both tables are read through PostgREST embeds:
--
--     .select("*, training_courses(...), employees(id,first_name,last_name,...)")
--
-- and PostgREST resolves an embed from the FOREIGN KEY graph. With no FK there
-- is no relationship to find, so every one of those calls returned
--
--     PGRST200 — Could not find a relationship between 'training_enrollments'
--     and 'employees' in the schema cache
--
-- and the four surfaces built on them have been permanently empty:
--
--   /org/training  · Course enrollments   listEnrollments
--   /org/training  · Expiring certs       listCertifications
--   /me/training   · Assigned courses     listEnrollments (scope "me")
--   /me/training   · My certifications    listCertifications (scope "me")
--   plus listAttempts, which embeds employees the same way
--
-- The pages render "No enrollments." and "No certifications yet." — the same
-- shape of lie as the quiz saying "no questions have been set". A thrown
-- PostgREST error would have been visible on day one; an empty list looks like
-- an empty tenant.
--
-- Adding the keys fixes the embed and closes the integrity hole that let it
-- happen: without them an enrollment or a certificate could outlive the
-- employee it belongs to. Verified zero orphan rows before applying.
--
-- ON DELETE CASCADE matches `training_quiz_attempts.employee_id`, which has
-- carried exactly this constraint since 20260606064416 — which is why the
-- attempts embed was the only one that worked.

DO $$ BEGIN
  ALTER TABLE public.training_enrollments
    ADD CONSTRAINT training_enrollments_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.certifications
    ADD CONSTRAINT certifications_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_training_enrollments_employee
  ON public.training_enrollments(employee_id);

-- PostgREST caches the schema; without this the embed keeps failing until the
-- next connection reload.
NOTIFY pgrst, 'reload schema';
