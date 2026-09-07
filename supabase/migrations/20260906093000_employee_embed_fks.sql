-- The same defect as 20260906092000, in six more tables.
--
-- Chasing the empty training roster turned up its cause: PostgREST resolves an
-- embed (`.select("*, employees(first_name,last_name)")`) from the FOREIGN KEY
-- graph, and `training_enrollments.employee_id` never had one. With no FK there
-- is no relationship, PostgREST answers PGRST200, and the caller — which throws
-- the error away and renders `rows ?? []` — draws an empty table.
--
-- An audit of every table embedded that way found six more with an
-- `employee_id` column and no key on it:
--
--   leave_requests       requests-inbox.functions.ts — /me/requests, /admin/requests
--   performance_reviews  dashboard, analytics
--   timesheets           attendance
--   employee_documents   documents (embedded as `employee:employees(...)`)
--   disciplinary_cases   discipline
--   asset_assignments    assets
--
-- `leave_requests` is the sharp one. The requests inbox normalises six tables
-- into one list; `wfh_requests`, `expense_claims`, `support_tickets` and
-- `toil_requests` all carry the key and work. Leave — the highest-volume
-- request type in the product — silently contributed nothing to either inbox.
--
-- ---------------------------------------------------------------------------
-- Why NOT VALID, and why that is not a shortcut
-- ---------------------------------------------------------------------------
--
-- Two rows already point at an employee that no longer exists — both belonging
-- to `1649efd6-b59e-4b59-875e-31e81bb1764b`, a pending leave request and a
-- submitted timesheet from 2026-08-21. That is precisely the damage a missing
-- FK permits, and it is real data about a real person's absence and hours.
-- Deleting it to make a constraint apply would be destroying a record to tidy
-- up a schema.
--
-- `NOT VALID` creates the constraint — so PostgREST sees the relationship and
-- every embed starts working — and enforces it on all future writes, while
-- leaving those two rows alone for someone to decide about. Run
-- `ALTER TABLE ... VALIDATE CONSTRAINT ...` once they are resolved. The four
-- clean tables are validated here and now.

-- Written out per table rather than looped, so that both a reader and
-- tests/postgrest-embeds.test.ts can see which tables are covered. A
-- FOREACH loop over an array hides the answer from every grep.

DO $$ BEGIN
  ALTER TABLE public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);

DO $$ BEGIN
  ALTER TABLE public.timesheets
    ADD CONSTRAINT timesheets_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON public.timesheets(employee_id);

DO $$ BEGIN
  ALTER TABLE public.performance_reviews
    ADD CONSTRAINT performance_reviews_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);

DO $$ BEGIN
  ALTER TABLE public.employee_documents
    ADD CONSTRAINT employee_documents_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON public.employee_documents(employee_id);

DO $$ BEGIN
  ALTER TABLE public.disciplinary_cases
    ADD CONSTRAINT disciplinary_cases_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_disciplinary_cases_employee ON public.disciplinary_cases(employee_id);

DO $$ BEGIN
  ALTER TABLE public.asset_assignments
    ADD CONSTRAINT asset_assignments_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee ON public.asset_assignments(employee_id);


-- Validate the four with nothing to object to. The two above keep their
-- NOT VALID until the stray rows are dealt with.

ALTER TABLE public.performance_reviews VALIDATE CONSTRAINT performance_reviews_employee_id_fkey;
ALTER TABLE public.employee_documents VALIDATE CONSTRAINT employee_documents_employee_id_fkey;
ALTER TABLE public.disciplinary_cases VALIDATE CONSTRAINT disciplinary_cases_employee_id_fkey;
ALTER TABLE public.asset_assignments VALIDATE CONSTRAINT asset_assignments_employee_id_fkey;

NOTIFY pgrst, 'reload schema';
