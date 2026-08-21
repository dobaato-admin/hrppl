-- Repair the service_role escape hatch on the audit-immutability trigger.
--
-- tg_block_modify_audit makes the four audit tables append-only, which is
-- correct. It is supposed to exempt trusted server-side work:
--
--   IF current_setting('request.jwt.claim.role', true) = 'service_role'
--      OR session_user IN ('postgres','supabase_admin') THEN ...
--
-- That first test never passes. `request.jwt.claim.<name>` is the LEGACY
-- per-claim GUC; current PostgREST sets a single JSON GUC, `request.jwt.claims`.
-- current_setting(..., true) returns NULL for the old name rather than erroring,
-- so the branch silently falls through to RAISE EXCEPTION and the escape hatch
-- has never worked. `session_user` is `authenticator` under PostgREST, so the
-- second test does not save it either.
--
-- Two things were broken by this, both silently:
--
--   1. Audit retention. src/lib/audit-retention.functions.ts:10 archives and
--      hard-deletes from onboarding_control_room_audit and
--      offboarding_comms_removal_audit. Every one of those writes was rejected,
--      so nothing has ever been archived or purged.
--
--   2. User deletion. offboarding_comms_removal_audit.actor_id is
--      ON DELETE SET NULL, so removing a user makes Postgres UPDATE the audit
--      row -- which this trigger blocks. The referential action and the trigger
--      deadlock, and GoTrue reports only "Database error deleting user". Any
--      account that touched an offboarding case became undeletable.
--
-- The fix reads the claim the way the rest of this schema does -- auth.role(),
-- which is already the accepted service_role test here (see
-- 20260604004659_email_infra.sql) -- and keeps both legacy tests so nothing that
-- worked before stops working.
--
-- Immutability for ordinary callers is unchanged: authenticated and anon still
-- hit the exception.

CREATE OR REPLACE FUNCTION public.tg_block_modify_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role'
     -- Legacy GUC, kept so any caller still setting it keeps working.
     OR current_setting('request.jwt.claim.role', true) = 'service_role'
     -- Direct SQL sessions: migrations, psql, the SQL editor.
     OR session_user IN ('postgres', 'supabase_admin')
  THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  RAISE EXCEPTION 'Audit log rows are immutable';
END $function$;
