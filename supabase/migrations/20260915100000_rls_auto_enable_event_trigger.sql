-- =============================================================================
-- Auto-enable RLS on every new table in `public` — the net that was never in code
-- =============================================================================
--
-- Found on 2026-09-15 while diffing the first production release against dev:
-- prod came out one function short (128 vs 129), and the missing one was
-- `rls_auto_enable`, wired to an event trigger called `ensure_rls`. It exists in
-- the development project and **in no migration** — somebody created it in the
-- dashboard, so every environment built from this repository has been without
-- it, including the production database this migration was written for.
--
-- Every other event trigger on both projects (`pgrst_ddl_watch`,
-- `issue_pg_graphql_access`, and friends) is Supabase's own. This one is ours.
--
-- -----------------------------------------------------------------------------
-- Why it matters more here than almost anywhere
-- -----------------------------------------------------------------------------
--
-- The entire security posture of this product is "RLS is the boundary". 216
-- tables, 708 policies, and a test asserting no table is left without it. All of
-- that depends on each migration remembering to write
-- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
--
-- Forgetting it does not fail. It produces a table that every authenticated
-- caller can read in full, through PostgREST, with no error anywhere — the
-- silent-failure shape this codebase has met repeatedly and now tests for by
-- name. This trigger is the backstop for the one mistake that would be worst.
--
-- It is a backstop, not a substitute: a table with RLS on and no policies denies
-- everyone, which is safe but broken. Migrations must still write their
-- policies. What this guarantees is that the failure is a visible denial rather
-- than an invisible leak.
--
-- -----------------------------------------------------------------------------
-- Notes on the definition
-- -----------------------------------------------------------------------------
--
-- Copied verbatim from the development database rather than rewritten, so the
-- two environments cannot differ in some detail nobody thought to compare.
--
--   * `SECURITY DEFINER` with `search_path = pg_catalog` — it runs as its owner
--     and must not be steerable through a mutable search path.
--   * Failures are logged, not raised. An event trigger that throws would abort
--     the DDL that fired it, so a quirk in one `CREATE TABLE` would block the
--     migration containing it. A missed table is recoverable; a migration runner
--     that cannot get past statement four is not.
--   * `public` only. System schemas are skipped explicitly.

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- `CREATE EVENT TRIGGER` has no IF NOT EXISTS, and this file must stay
-- re-runnable: the migration endpoint is not transactional across statements,
-- so re-running is how a partial apply is recovered.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'ensure_rls') THEN
    CREATE EVENT TRIGGER ensure_rls
      ON ddl_command_end
      WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      EXECUTE FUNCTION public.rls_auto_enable();
  END IF;
END $$;
