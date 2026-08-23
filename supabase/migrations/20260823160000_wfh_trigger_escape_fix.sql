-- The work-from-home lifecycle trigger has never actually enforced anything.
--
-- Both previous attempts at its "trusted server path" escape were wrong, and
-- the second was wrong in a way that is worth writing down because it is not
-- obvious and it will come up again.
--
--   20260823140000: `session_user IN ('postgres','supabase_admin')`
--       session_user is the connection's original role and does not follow
--       SET ROLE. PostgREST connects as `authenticator` and SET ROLEs per
--       request, so on that connection this never matched — but any tooling
--       connected directly as postgres skipped the rules entirely.
--
--   20260823150000: `current_user IN ('postgres','supabase_admin','service_role')`
--       Looks right, and is right in ordinary code. But this function is
--       SECURITY DEFINER, and inside a SECURITY DEFINER function `current_user`
--       is the function *owner* — postgres. So the escape matched on every
--       single call, from every caller, and the entire state machine below it
--       was dead code.
--
-- The lesson: inside SECURITY DEFINER, neither `current_user` nor `session_user`
-- tells you who the caller is. Only the request context does.
--
-- So the test is the JWT and nothing else:
--
--   auth.role() = 'authenticated'  a real end user   → enforce
--   auth.role() = 'service_role'   trusted backend   → bypass
--   auth.role() IS NULL            no JWT at all — a migration, the seed, psql
--                                  → bypass
--
-- That is independent of role switching, works identically on pooled and direct
-- connections, and is testable: a session that sets request.jwt.claims with
-- role 'authenticated' is subject to the rules exactly as a browser would be.

CREATE OR REPLACE FUNCTION public.tg_wfh_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
  actor_employee uuid;
  is_requester boolean;
  is_approver boolean;
  overlap_count int;
  remote_punches int;
BEGIN
  jwt_role := auth.role();

  -- No JWT means no end user: a migration, the demo seed, or psql. Trusted.
  -- service_role is the backend acting deliberately. Everything else is a
  -- person, and people are subject to the rules.
  IF jwt_role IS NULL OR jwt_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  actor_employee := public.my_employee_id(auth.uid());

  ---------------------------------------------------------------- INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending' THEN
      RAISE EXCEPTION 'A work-from-home request must start as pending.'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.end_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Work-from-home cannot be requested for dates that have already passed.'
        USING ERRCODE = 'check_violation';
    END IF;

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
    RETURN NEW;
  END IF;

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

  IF OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
    IF NOT (is_requester OR is_approver) THEN
      RAISE EXCEPTION 'Only the requester or an approver can withdraw this request.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
    IF NOT (is_requester OR is_approver) THEN
      RAISE EXCEPTION 'Only the requester or an approver can cancel an approved request.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF is_requester AND NOT is_approver AND OLD.start_date <= CURRENT_DATE THEN
      RAISE EXCEPTION 'This work-from-home period has already started. Ask your manager or HR to revoke it.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Revoking an approval someone has already clocked in under would
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

-- Restore the demo fixture the earlier (unenforced) test runs consumed: Ella's
-- approved window from today is what makes the remote clock-in path walkable.
UPDATE public.wfh_requests w
   SET status = 'approved',
       approved_at = COALESCE(approved_at, now()),
       approved_by = COALESCE(approved_by, (SELECT created_by FROM public.tenants t WHERE t.id = w.tenant_id))
 WHERE w.status = 'cancelled'
   AND w.employee_id IN (
     SELECT id FROM public.employees
      WHERE email IN ('ella.acme@demo.hrppl.test', 'nina.globex@demo.hrppl.test')
   );
