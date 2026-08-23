-- Attendance: honest timestamps, honest geofencing, and work-from-home.
--
-- Three related gaps, all of which show up as wrong pay:
--
-- 1. `work_date` was derived in UTC, so a shift was filed against the wrong
--    calendar day for every tenant off the prime meridian. There was nowhere to
--    record which zone a punch was interpreted in, so old rows cannot be told
--    apart from new ones.
-- 2. The clock-in coordinates were stored, but not the GPS *accuracy* that
--    qualifies them. `sign_geofences.min_accuracy_meters` has existed since
--    20260619132140 and nothing has ever read it — a 2 km wifi-derived fix was
--    treated exactly like a 5 m satellite fix.
-- 3. There is no work-from-home concept at all, so a remote employee inside a
--    tenant that runs geofences simply cannot clock in, and the attempt leaves
--    no trace anywhere for HR to act on.

-- ---------------------------------------------------------------------------
-- 1. Attendance: time provenance, location quality, work location
-- ---------------------------------------------------------------------------

ALTER TABLE public.attendance_entries
  -- The IANA zone `work_date` was computed in. Stored per row rather than read
  -- back from the tenant, because a tenant that corrects its timezone setting
  -- must not silently re-interpret every historical shift.
  ADD COLUMN IF NOT EXISTS work_timezone text,

  -- When the server received each punch, as distinct from when it happened.
  -- `clock_in`/`clock_out` now hold the moment the employee pressed the button;
  -- these hold the moment the request landed. The gap is network latency plus
  -- handler work, and it used to be silently charged to the employee.
  ADD COLUMN IF NOT EXISTS clock_in_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS clock_out_recorded_at timestamptz,

  -- Signed device-minus-server difference in seconds. Non-null means the device
  -- clock disagreed; large values mean it was disbelieved and server time used.
  ADD COLUMN IF NOT EXISTS clock_in_skew_seconds integer,
  ADD COLUMN IF NOT EXISTS clock_out_skew_seconds integer,

  -- GPS accuracy radius reported by the device, in metres (95% confidence).
  ADD COLUMN IF NOT EXISTS clock_in_accuracy_meters numeric(8,2),

  -- Clock-out was entirely unvalidated while clock-in was fenced, which is a
  -- gap you can drive a shift through: punch in on site, leave, punch out from
  -- anywhere. Recording the same fields on the way out makes the asymmetry
  -- visible even before anything enforces it.
  ADD COLUMN IF NOT EXISTS clock_out_latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS clock_out_longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS clock_out_accuracy_meters numeric(8,2),
  ADD COLUMN IF NOT EXISTS clock_out_geofence_id uuid REFERENCES public.sign_geofences(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clock_out_distance_meters numeric,

  -- Where the work happened. Payroll, timesheets and reporting all need to keep
  -- remote days distinguishable downstream.
  ADD COLUMN IF NOT EXISTS work_location text,

  -- Set when the punch was accepted but something about it needs a human:
  -- an approved-WFH punch outside every fence, a low-accuracy fix, a device
  -- clock that had to be overridden.
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.attendance_entries'::regclass
      AND conname = 'attendance_entries_work_location_check'
  ) THEN
    ALTER TABLE public.attendance_entries
      ADD CONSTRAINT attendance_entries_work_location_check
      CHECK (work_location IS NULL OR work_location IN ('office','remote','field','unknown'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS attendance_entries_needs_review_idx
  ON public.attendance_entries (tenant_id, work_date DESC)
  WHERE needs_review;

COMMENT ON COLUMN public.attendance_entries.work_timezone IS
  'IANA zone work_date was computed in. NULL on rows written before 20260823060000, which used UTC.';
COMMENT ON COLUMN public.attendance_entries.clock_in_skew_seconds IS
  'Device clock minus server clock, in seconds, at clock-in. Beyond the tolerance the device value was discarded and server time stored.';

-- ---------------------------------------------------------------------------
-- 2. Work-from-home requests
-- ---------------------------------------------------------------------------
--
-- Modelled on leave_requests deliberately: same request → approve → notify
-- shape, same RLS structure, so approvers learn one pattern rather than two.
-- The difference is what an approval *does* — an approved WFH day is the thing
-- clockIn consults before enforcing the geofence.

CREATE TABLE IF NOT EXISTS public.wfh_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  work_address text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by uuid,
  approved_at timestamptz,
  decision_note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS wfh_requests_employee_range_idx
  ON public.wfh_requests (employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS wfh_requests_tenant_status_idx
  ON public.wfh_requests (tenant_id, status, start_date DESC);

-- One approved WFH window per employee per day. A partial unique index cannot
-- express range overlap, so overlap is enforced in the server fn; this index
-- exists for the lookup clockIn does on every punch.
CREATE INDEX IF NOT EXISTS wfh_requests_approved_lookup_idx
  ON public.wfh_requests (employee_id, start_date, end_date)
  WHERE status = 'approved';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wfh_requests TO authenticated;
GRANT ALL ON public.wfh_requests TO service_role;
ALTER TABLE public.wfh_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wfh employee reads own" ON public.wfh_requests;
CREATE POLICY "wfh employee reads own" ON public.wfh_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = wfh_requests.employee_id AND e.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "wfh employee creates own" ON public.wfh_requests;
CREATE POLICY "wfh employee creates own" ON public.wfh_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = wfh_requests.employee_id
        AND e.user_id = auth.uid()
        AND e.tenant_id = wfh_requests.tenant_id
    )
  );

-- Withdrawing your own request is allowed; approving it is not. Without the
-- status predicate on both sides this policy would let an employee approve
-- themselves, which is the whole point of the module.
DROP POLICY IF EXISTS "wfh employee cancels own pending" ON public.wfh_requests;
CREATE POLICY "wfh employee cancels own pending" ON public.wfh_requests
  FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = wfh_requests.employee_id AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (status = 'cancelled');

-- Approvers. Tenant-scoped on both USING and WITH CHECK: the tenant predicate
-- on USING alone would still let a row be moved to another tenant on update.
DROP POLICY IF EXISTS "wfh tenant approver manages" ON public.wfh_requests;
CREATE POLICY "wfh tenant approver manages" ON public.wfh_requests
  FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'manager'::app_role)
      OR public.has_role(auth.uid(), 'hr'::app_role)
      OR public.has_role(auth.uid(), 'org_admin'::app_role)
    )
  );

DROP POLICY IF EXISTS "wfh super admin all" ON public.wfh_requests;
CREATE POLICY "wfh super admin all" ON public.wfh_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "wfh regional reads scoped" ON public.wfh_requests;
CREATE POLICY "wfh regional reads scoped" ON public.wfh_requests
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'regional_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = wfh_requests.tenant_id
        AND public.has_country_scope(auth.uid(), t.country_code)
    )
  );

DROP TRIGGER IF EXISTS trg_wfh_requests_updated ON public.wfh_requests;
CREATE TRIGGER trg_wfh_requests_updated
  BEFORE UPDATE ON public.wfh_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Is this employee approved to work remotely on this date?
-- ---------------------------------------------------------------------------
--
-- SECURITY DEFINER because clockIn runs as the employee, and the employee can
-- read their own wfh_requests anyway — this exists so the check is one indexed
-- lookup expressible from SQL (and from RLS, later) rather than a round trip.

CREATE OR REPLACE FUNCTION public.has_approved_wfh(_employee_id uuid, _work_date date)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wfh_requests w
    WHERE w.employee_id = _employee_id
      AND w.status = 'approved'
      AND _work_date BETWEEN w.start_date AND w.end_date
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_approved_wfh(uuid, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_approved_wfh(uuid, date) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. Let the reconciliation queue describe WFH and clock-skew anomalies
-- ---------------------------------------------------------------------------
--
-- geofence_reconciliation already has a review UI (admin.geofences.tsx) and a
-- resolve workflow, so the WFH review queue the product needs is this table
-- with two more members on its CHECK — not a second queue nobody opens.
--
-- Recreated rather than edited because a CHECK constraint has no ALTER form.

ALTER TABLE public.geofence_reconciliation
  DROP CONSTRAINT IF EXISTS geofence_reconciliation_mismatch_type_check;

ALTER TABLE public.geofence_reconciliation
  ADD CONSTRAINT geofence_reconciliation_mismatch_type_check
  CHECK (mismatch_type IN (
    'no_attendance_for_enter',
    'no_geofence_for_punch',
    'outside_window',
    'accuracy_low',
    'permission_anomaly',
    -- New: an approved-WFH employee punched in from outside every fence. Not a
    -- violation — it is the exception working — but it is the record HR reviews
    -- with priority, which is the whole reason the exception is safe to grant.
    'wfh_outside_fence',
    -- New: an employee with no approved WFH day was refused. Previously this
    -- threw and left no trace anywhere, so nobody could see who was blocked or
    -- how often.
    'outside_fence_blocked',
    -- New: the device clock was too far out to believe and server time was
    -- substituted.
    'clock_skew'
  ));
