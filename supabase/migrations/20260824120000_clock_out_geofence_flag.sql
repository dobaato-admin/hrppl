-- clockOut recorded a punch's distance/fence columns but never flagged it —
-- needs_review stayed false and nothing was queued to geofence_reconciliation
-- regardless of the outcome, unlike clockIn's equivalent case. An
-- out-of-fence clock-out is still never blocked (someone who already started
-- a shift should not be trapped on site to end it), but it is now flagged
-- and queued exactly like the clock-in case it mirrors — reusing
-- wfh_outside_fence when an approved WFH day covers it, and this new value
-- otherwise, since none of the existing mismatch types describe an
-- unapproved, unblocked, out-of-fence *closing* punch.
ALTER TABLE public.geofence_reconciliation
  DROP CONSTRAINT IF EXISTS geofence_reconciliation_mismatch_type_check;
ALTER TABLE public.geofence_reconciliation
  ADD CONSTRAINT geofence_reconciliation_mismatch_type_check
  CHECK (mismatch_type = ANY (ARRAY[
    'no_attendance_for_enter', 'no_geofence_for_punch', 'outside_window',
    'accuracy_low', 'permission_anomaly', 'wfh_outside_fence',
    'outside_fence_blocked', 'clock_skew', 'clock_out_outside_fence'
  ]));
