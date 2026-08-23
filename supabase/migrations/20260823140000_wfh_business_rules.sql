-- Work-from-home: make the lifecycle rules real.
--
-- 20260823060000 shipped the table and a server function that refused
-- self-approval. The server function was the *only* thing refusing it: the
-- approver policy is `FOR ALL` across the tenant with no self-exclusion, so any
-- manager, HR or org_admin could PATCH their own row straight through PostgREST
-- and approve themselves. Verified against the live database before writing
-- this — a manager created and approved their own request in one transaction.
--
-- A rule that lives only in a server function is a suggestion. This moves the
-- lifecycle into the database, where every client is subject to it.
--
-- It also fixes the other half of the same confusion. Because self-decision was
-- blocked in the function *and* the row was hidden from the requester's own
-- approval queue, a manager's request had no legitimate route to approval at
-- all — it sat pending forever, `has_approved_wfh` stayed false, and clocking in
-- from outside a fence kept failing with no indication why. The rule now says
-- plainly who may decide, and the application can therefore say so too.
--
-- ## The lifecycle
--
--   pending   → approved   an approver who is NOT the requester
--   pending   → rejected   an approver who is NOT the requester
--   pending   → cancelled  the requester withdraws
--   approved  → cancelled  the requester, but only before the window opens;
--                          an approver may revoke at any time
--   approved  → rejected   never. Rejecting after approving is a revocation,
--                          and revocation is `cancelled` so the two are
--                          distinguishable in history.
--   rejected  → *          never
--   cancelled → *          never
--
-- Dates and ownership freeze once a request leaves `pending`, so an approved
-- window cannot be quietly widened after the fact.

-- ---------------------------------------------------------------------------
-- 1. Close the self-approval hole at the policy level
-- ---------------------------------------------------------------------------
--
-- Belt and braces with the trigger below: the trigger states the rule
-- precisely, the policy makes the row unreachable for the write in the first
-- place. Requesters still read their own row through "wfh employee reads own",
-- so excluding it here costs them no visibility.

DROP POLICY IF EXISTS "wfh tenant approver manages" ON public.wfh_requests;
CREATE POLICY "wfh tenant approver manages" ON public.wfh_requests
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND employee_id IS DISTINCT FROM public.my_employee_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND employee_id IS DISTINCT FROM public.my_employee_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
    )
  );

-- super_admin holds a separate FOR ALL policy. Narrow it the same way: a
-- platform administrator who also happens to have an employee row must not be
-- able to approve their own leave from the platform side either.
DROP POLICY IF EXISTS "wfh super admin all" ON public.wfh_requests;
CREATE POLICY "wfh super admin all" ON public.wfh_requests
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    AND employee_id IS DISTINCT FROM public.my_employee_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    AND employee_id IS DISTINCT FROM public.my_employee_id(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 2. Can this user decide this request?
-- ---------------------------------------------------------------------------
--
-- Exposed so the UI can explain *who* will decide rather than leaving a
-- requester staring at a request nobody appears to own.

CREATE OR REPLACE FUNCTION public.can_decide_wfh(_user_id uuid, _request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wfh_requests w
    WHERE w.id = _request_id
      -- Never your own, whatever roles you hold.
      AND w.employee_id IS DISTINCT FROM public.my_employee_id(_user_id)
      AND w.tenant_id = public.user_tenant_id(_user_id)
      AND (
        public.has_role(_user_id, 'manager'::app_role)
        OR public.has_role(_user_id, 'hr'::app_role)
        OR public.has_role(_user_id, 'org_admin'::app_role)
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_decide_wfh(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_decide_wfh(uuid, uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. The lifecycle itself
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.tg_wfh_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_employee uuid;
  is_requester boolean;
  is_approver boolean;
  overlap_count int;
  remote_punches int;
BEGIN
  -- Trusted server paths bypass the state machine: the seed builds
  -- already-approved history, and support tooling must be able to correct data.
  --
  -- `auth.role()` deliberately, NOT the legacy `request.jwt.claim.role` GUC —
  -- current PostgREST does not set that one, which is how the audit-log
  -- immutability trigger silently blocked every service-role write until
  -- 20260821093000 fixed it. Same mistake, do not repeat it.
  IF auth.role() = 'service_role'
     OR session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  actor_employee := public.my_employee_id(auth.uid());

  ---------------------------------------------------------------- INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending' THEN
      RAISE EXCEPTION 'A work-from-home request must start as pending.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- A request for days that have already passed cannot change what happened
    -- on them; it can only be an attempt to retro-justify a punch.
    IF NEW.end_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Work-from-home cannot be requested for dates that have already passed.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Overlap makes it ambiguous which approval a punch was taken under, and
    -- leaves reviewers resolving the same day twice.
    SELECT count(*) INTO overlap_count
      FROM public.wfh_requests w
     WHERE w.employee_id = NEW.employee_id
       AND w.status IN ('pending', 'approved')
       AND w.start_date <= NEW.end_date
       AND w.end_date   >= NEW.start_date;
    IF overlap_count > 0 THEN
      RAISE EXCEPTION 'You already have a pending or approved work-from-home request covering those dates.'
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  ---------------------------------------------------------------- UPDATE
  is_requester := actor_employee IS NOT NULL AND actor_employee = OLD.employee_id;
  is_approver  := NOT is_requester
                  AND OLD.tenant_id = public.user_tenant_id(auth.uid())
                  AND (
                    public.has_role(auth.uid(), 'manager'::app_role)
                    OR public.has_role(auth.uid(), 'hr'::app_role)
                    OR public.has_role(auth.uid(), 'org_admin'::app_role)
                    OR public.has_role(auth.uid(), 'super_admin'::app_role)
                  );

  -- Ownership and dates freeze the moment a request leaves pending, so an
  -- approved window cannot be widened after the fact.
  IF OLD.status <> 'pending' THEN
    IF NEW.start_date <> OLD.start_date
       OR NEW.end_date <> OLD.end_date
       OR NEW.employee_id <> OLD.employee_id
       OR NEW.tenant_id <> OLD.tenant_id THEN
      RAISE EXCEPTION 'A decided work-from-home request cannot have its dates or owner changed.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;  -- editing a note or reason, no transition to police
  END IF;

  -- pending → approved | rejected : an approver who is not the requester
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    IF is_requester THEN
      RAISE EXCEPTION 'You cannot decide your own work-from-home request. It must be approved by your manager, HR, or an organisation administrator.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF NOT is_approver THEN
      RAISE EXCEPTION 'You do not have permission to decide work-from-home requests.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  -- pending → cancelled : the requester withdraws
  IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
    IF NOT (is_requester OR is_approver) THEN
      RAISE EXCEPTION 'Only the requester or an approver can withdraw this request.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  -- approved → cancelled : the requester may change their plans before the
  -- window opens; an approver may revoke at any point.
  IF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
    IF is_requester AND OLD.start_date <= CURRENT_DATE THEN
      RAISE EXCEPTION 'This work-from-home period has already started. Ask your approver to revoke it.'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NOT (is_requester OR is_approver) THEN
      RAISE EXCEPTION 'Only the requester or an approver can cancel an approved request.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Revoking an approval that someone has already clocked in under would
    -- retroactively invalidate a punch taken in good faith, and attendance is
    -- the input to pay. The approval stands for days already worked.
    SELECT count(*) INTO remote_punches
      FROM public.attendance_entries a
     WHERE a.employee_id = OLD.employee_id
       AND a.work_location = 'remote'
       AND a.work_date BETWEEN OLD.start_date AND OLD.end_date;
    IF remote_punches > 0 THEN
      RAISE EXCEPTION 'This request cannot be cancelled: % remote clock-in(s) have already been recorded under it.', remote_punches
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'A work-from-home request cannot go from % to %.', OLD.status, NEW.status
    USING ERRCODE = 'check_violation';
END $$;

DROP TRIGGER IF EXISTS trg_wfh_lifecycle ON public.wfh_requests;
CREATE TRIGGER trg_wfh_lifecycle
  BEFORE INSERT OR UPDATE ON public.wfh_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_wfh_lifecycle();

-- ---------------------------------------------------------------------------
-- 4. Overlap, at the database rather than only in application code
-- ---------------------------------------------------------------------------
--
-- The trigger covers INSERT; this index makes the lookup it performs — and the
-- one clockIn performs on every punch — cheap.

CREATE INDEX IF NOT EXISTS wfh_requests_employee_active_range_idx
  ON public.wfh_requests (employee_id, start_date, end_date)
  WHERE status IN ('pending', 'approved');
