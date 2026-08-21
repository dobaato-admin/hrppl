
-- Helper: branch access via employee row
-- (we inline EXISTS where needed)

-- LEAVE_REQUESTS
CREATE POLICY "hr manages tenant leave_requests" ON public.leave_requests
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant leave_requests" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch leave_requests" ON public.leave_requests
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_requests.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- LEAVE_BALANCES
CREATE POLICY "hr manages tenant leave_balances" ON public.leave_balances
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch leave_balances" ON public.leave_balances
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_balances.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = leave_balances.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- LEAVE_TYPES
CREATE POLICY "hr manages tenant leave_types" ON public.leave_types
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant leave_types" ON public.leave_types
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));

-- TIMESHEETS
CREATE POLICY "hr manages tenant timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = timesheets.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- TIME_ENTRIES
CREATE POLICY "hr manages tenant time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant time_entries" ON public.time_entries
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch time_entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = time_entries.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = time_entries.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- ATTENDANCE_ENTRIES
CREATE POLICY "hr manages tenant attendance_entries" ON public.attendance_entries
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "finance reads tenant attendance_entries" ON public.attendance_entries
  FOR SELECT TO authenticated
  USING (public.is_finance(auth.uid(), tenant_id));

CREATE POLICY "branch admin manages branch attendance_entries" ON public.attendance_entries
  FOR ALL TO authenticated
  USING (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = attendance_entries.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  )
  WITH CHECK (
    public.is_branch_admin(auth.uid(), tenant_id)
    AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = attendance_entries.employee_id AND public.has_branch_access(auth.uid(), e.branch_id))
  );

-- BIOMETRIC_DEVICES
CREATE POLICY "hr manages tenant biometric_devices" ON public.biometric_devices
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant biometric_devices" ON public.biometric_devices
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));

-- SIGN_GEOFENCES
CREATE POLICY "hr manages tenant sign_geofences" ON public.sign_geofences
  FOR ALL TO authenticated
  USING (public.is_hr(auth.uid(), tenant_id))
  WITH CHECK (public.is_hr(auth.uid(), tenant_id));

CREATE POLICY "branch admin reads tenant sign_geofences" ON public.sign_geofences
  FOR SELECT TO authenticated
  USING (public.is_branch_admin(auth.uid(), tenant_id));
