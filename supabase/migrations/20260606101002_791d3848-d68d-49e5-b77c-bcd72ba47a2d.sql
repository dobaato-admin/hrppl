
-- ============ Asset assignment: returns + approvals ============
ALTER TABLE public.asset_assignments
  ADD COLUMN IF NOT EXISTS quantity_issued integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quantity_returned integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS return_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS employee_return_reported_at timestamptz,
  ADD COLUMN IF NOT EXISTS employee_return_notes text,
  ADD COLUMN IF NOT EXISTS return_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_confirmed_by uuid,
  ADD COLUMN IF NOT EXISTS return_confirmation_notes text,
  ADD COLUMN IF NOT EXISTS condition_notes text,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_notes text;

ALTER TABLE public.asset_assignments
  DROP CONSTRAINT IF EXISTS asset_assignments_return_status_chk;
ALTER TABLE public.asset_assignments
  ADD CONSTRAINT asset_assignments_return_status_chk
  CHECK (return_status IN ('pending','reported_partial','reported_full','confirmed','disputed'));

ALTER TABLE public.asset_assignments
  DROP CONSTRAINT IF EXISTS asset_assignments_approval_status_chk;
ALTER TABLE public.asset_assignments
  ADD CONSTRAINT asset_assignments_approval_status_chk
  CHECK (approval_status IN ('pending','approved','rejected'));

-- Existing rows: approved by default; if returned_at set, mark confirmed.
UPDATE public.asset_assignments
  SET approved_at = COALESCE(approved_at, assigned_at),
      approved_by = COALESCE(approved_by, assigned_by)
  WHERE approval_status = 'approved' AND approved_at IS NULL;

UPDATE public.asset_assignments
  SET return_status = 'confirmed',
      return_confirmed_at = COALESCE(return_confirmed_at, returned_at),
      return_confirmed_by = COALESCE(return_confirmed_by, returned_to),
      quantity_returned = GREATEST(quantity_returned, quantity_issued)
  WHERE returned_at IS NOT NULL AND return_status = 'pending';

-- Replace status-sync trigger: only flip asset to 'assigned' when approved,
-- and only flip back to available when return is confirmed.
CREATE OR REPLACE FUNCTION public.tg_asset_sync_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.approval_status = 'approved' THEN
      UPDATE public.assets SET status = 'assigned', current_assignment_id = NEW.id WHERE id = NEW.asset_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Newly approved
    IF NEW.approval_status = 'approved' AND OLD.approval_status <> 'approved' THEN
      UPDATE public.assets SET status = 'assigned', current_assignment_id = NEW.id WHERE id = NEW.asset_id;
    END IF;
    -- Rejected -> release asset
    IF NEW.approval_status = 'rejected' AND OLD.approval_status <> 'rejected' THEN
      UPDATE public.assets SET status = 'available', current_assignment_id = NULL
        WHERE id = NEW.asset_id AND current_assignment_id = NEW.id;
    END IF;
    -- Return confirmed by HR
    IF NEW.return_confirmed_at IS NOT NULL AND OLD.return_confirmed_at IS NULL THEN
      UPDATE public.assets
        SET status = CASE WHEN NEW.return_condition = 'lost' THEN 'lost'::asset_status
                          WHEN NEW.return_condition = 'damaged' THEN 'damaged'::asset_status
                          ELSE 'available'::asset_status END,
            current_assignment_id = NULL
        WHERE id = NEW.asset_id;
    END IF;
  END IF;
  RETURN NEW;
END $fn$;

-- Event timeline trigger: extend with report/confirm/approval events
CREATE OR REPLACE FUNCTION public.tg_event_asset_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_asset RECORD;
BEGIN
  SELECT name, asset_tag, category INTO v_asset FROM public.assets WHERE id = NEW.asset_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_employee_event(
      NEW.tenant_id, NEW.employee_id, 'asset','asset_assigned',
      'Asset issued: ' || COALESCE(v_asset.name,'(asset)') || ' [' || COALESCE(v_asset.asset_tag,'') || ']',
      NEW.notes, 'asset_assignments', NEW.id, NEW.assigned_at, NULL, 'employee',
      jsonb_build_object('asset_id', NEW.asset_id, 'category', v_asset.category, 'context', NEW.context,
                         'expected_return_on', NEW.expected_return_on, 'approval_status', NEW.approval_status)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status AND NEW.approval_status IN ('approved','rejected') THEN
      PERFORM public.record_employee_event(
        NEW.tenant_id, NEW.employee_id, 'asset','asset_assignment_' || NEW.approval_status,
        'Asset assignment ' || NEW.approval_status || ': ' || COALESCE(v_asset.name,'(asset)'),
        NEW.approval_notes, 'asset_assignments', NEW.id, now(), NULL, 'employee',
        jsonb_build_object('asset_id', NEW.asset_id, 'approved_by', NEW.approved_by));
    END IF;
    IF NEW.employee_return_reported_at IS NOT NULL AND OLD.employee_return_reported_at IS NULL THEN
      PERFORM public.record_employee_event(
        NEW.tenant_id, NEW.employee_id, 'asset','asset_return_reported',
        'Return reported by employee: ' || COALESCE(v_asset.name,'(asset)') ||
          ' (' || NEW.return_status || ')',
        NEW.employee_return_notes, 'asset_assignments', NEW.id, NEW.employee_return_reported_at,
        NULL, 'employee',
        jsonb_build_object('asset_id', NEW.asset_id, 'quantity_returned', NEW.quantity_returned,
                           'quantity_issued', NEW.quantity_issued, 'condition_notes', NEW.condition_notes));
    END IF;
    IF NEW.return_confirmed_at IS NOT NULL AND OLD.return_confirmed_at IS NULL THEN
      PERFORM public.record_employee_event(
        NEW.tenant_id, NEW.employee_id, 'asset','asset_return_confirmed',
        'Return confirmed by HR: ' || COALESCE(v_asset.name,'(asset)'),
        NEW.return_confirmation_notes, 'asset_assignments', NEW.id, NEW.return_confirmed_at,
        NEW.return_condition, 'employee',
        jsonb_build_object('asset_id', NEW.asset_id, 'condition', NEW.return_condition,
                           'confirmed_by', NEW.return_confirmed_by));
    END IF;
    IF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
      PERFORM public.record_employee_event(
        NEW.tenant_id, NEW.employee_id, 'asset','asset_acknowledged',
        'Asset receipt acknowledged: ' || COALESCE(v_asset.name,'(asset)'),
        NEW.acknowledgement_notes, 'asset_assignments', NEW.id, NEW.acknowledged_at, NULL, 'employee',
        jsonb_build_object('asset_id', NEW.asset_id));
    END IF;
  END IF;
  RETURN NEW;
END $fn$;

-- ============ Offboarding reminder state ============
CREATE TABLE IF NOT EXISTS public.offboarding_reminder_state (
  case_id uuid PRIMARY KEY REFERENCES public.offboarding_cases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  last_alert_date date,
  alert_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offboarding_reminder_state TO authenticated;
GRANT ALL ON public.offboarding_reminder_state TO service_role;
ALTER TABLE public.offboarding_reminder_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offb_reminder tenant read" ON public.offboarding_reminder_state;
CREATE POLICY "offb_reminder tenant read" ON public.offboarding_reminder_state
  FOR SELECT TO authenticated
  USING (tenant_id = public.user_tenant_id(auth.uid())
         AND (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')));

-- ============ Cron: daily offboarding reminders ============
DO $$ BEGIN
  PERFORM cron.unschedule('offboarding-due-alerts');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'offboarding-due-alerts',
  '15 7 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--f06aef21-42c8-48e8-9ebf-b8eec9b4098d.lovable.app/api/public/hooks/offboarding-due-alerts',
    headers := jsonb_build_object('Content-Type','application/json','apikey','sb_publishable_OBG86LiuqXVciMeu-bVSBQ_EPE4OIpL')
  );
  $cron$
);
