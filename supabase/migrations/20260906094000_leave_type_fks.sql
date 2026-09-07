-- The last embed in the chain: leave_requests → leave_types.
--
-- 20260906093000 gave `leave_requests` its `employee_id` key, and PostgREST
-- promptly started answering
--
--     PGRST200 — Could not find a relationship between 'leave_requests' and
--     'leave_types' … hint: Perhaps you meant 'employees' instead
--
-- because `requests-inbox.functions.ts` embeds BOTH:
--
--     .select("…,employee_id,employees(first_name,last_name),leave_types(name)")
--
-- One missing key breaks the whole select, so leave stayed absent from
-- /me/requests and /admin/requests until both existed. `leave_balances`
-- carries no foreign keys at all and embeds `leave_types` the same way.
--
-- Both tables hold one row pointing at a leave type that no longer exists, so
-- the constraints go on NOT VALID for the reason given in 20260906093000: a
-- pending leave request is a record about a person's absence, and deleting it
-- to satisfy a constraint would be destroying data to tidy a schema. New rows
-- are enforced from here on; `VALIDATE CONSTRAINT` once the strays are dealt
-- with.
--
-- ON DELETE RESTRICT, not CASCADE: deleting a leave type must not silently
-- delete the requests and balances filed under it. That is the opposite of the
-- employee case, where the employee going away is the reason the child row
-- should go too.

DO $$ BEGIN
  ALTER TABLE public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey
    FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id)
    ON DELETE RESTRICT NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_fkey
    FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id)
    ON DELETE RESTRICT NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id)
    ON DELETE CASCADE NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type
  ON public.leave_requests(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type
  ON public.leave_balances(leave_type_id);

NOTIFY pgrst, 'reload schema';
