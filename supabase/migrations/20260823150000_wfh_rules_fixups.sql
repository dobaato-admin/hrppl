-- Two defects in 20260823140000, both found by testing it rather than reading it.
--
-- ## 1. The trigger's escape hatch was far too wide
--
-- It read `session_user IN ('postgres','supabase_admin')`. `session_user` is the
-- role the *connection* authenticated as and never changes for the life of that
-- connection — `SET ROLE` moves `current_user`, not `session_user`. PostgREST
-- connects as `authenticator` and then `SET ROLE`s to `authenticated` or
-- `service_role` per request, so on a pooled admin connection every request
-- would have skipped the entire lifecycle check.
--
-- It also made the rules untestable: a verification session that connects as
-- `postgres` and does `SET LOCAL ROLE authenticated` still matched the escape,
-- so backdated and overlapping inserts sailed through and looked like passes.
-- A guard that silently disables itself under the exact conditions you test it
-- in is worse than no guard.
--
-- `current_user` is the right thing to read: it is what `SET ROLE` changes, what
-- RLS is evaluated against, and what genuinely distinguishes a trusted
-- server-side caller from an end user.
--
-- ## 2. An employee could not cancel their own approved request
--
-- The lifecycle deliberately permits `approved → cancelled` by the requester
-- before the window opens — plans change, and forcing someone to ask an
-- approver to undo a day they no longer need is friction with no purpose. But
-- the only employee-side UPDATE policy was `USING (status = 'pending')`, so the
-- row was invisible to the update and the transition could never fire. The rule
-- existed in the trigger and was unreachable through the policy.
--
-- Widened to cover `approved` as well. The *date* condition stays in the
-- trigger, because a policy cannot produce a useful error message and "no rows
-- updated" is the least helpful failure a UI can be handed.

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
  -- 20260821093000 fixed it.
  --
  -- `current_user`, NOT `session_user` — see the header. session_user does not
  -- follow SET ROLE, so it would have exempted every request on a pooled
  -- connection and made these rules untestable.
  IF auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
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
    IF NOT (is_requester OR is_approver) THEN
      RAISE EXCEPTION 'Only the requester or an approver can cancel an approved request.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF is_requester AND NOT is_approver AND OLD.start_date <= CURRENT_DATE THEN
      RAISE EXCEPTION 'This work-from-home period has already started. Ask your manager or HR to revoke it.'
        USING ERRCODE = 'check_violation';
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

-- ---------------------------------------------------------------------------
-- The requester's own UPDATE policy has to admit the approved row too,
-- otherwise the approved → cancelled transition above is unreachable.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "wfh employee cancels own pending" ON public.wfh_requests;
DROP POLICY IF EXISTS "wfh employee cancels own request" ON public.wfh_requests;
CREATE POLICY "wfh employee cancels own request" ON public.wfh_requests
  FOR UPDATE TO authenticated
  USING (
    status IN ('pending', 'approved')
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = wfh_requests.employee_id AND e.user_id = auth.uid()
    )
  )
  -- Cancelling is the only thing a requester may do to their own row. Approving
  -- is excluded here as well as in the trigger: two independent layers, because
  -- self-approval is the failure that matters most.
  WITH CHECK (status = 'cancelled');
