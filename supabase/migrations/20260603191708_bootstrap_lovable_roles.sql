-- ---------------------------------------------------------------------------
-- Bootstrap: roles that later migrations reference but never create.
--
-- Deliberately timestamped one second BEFORE the earliest real migration
-- (20260603191709) so it sorts first and the rest of the history replays
-- unchanged.
--
-- Why this exists
-- ---------------
-- Replaying the full migration history into a fresh Supabase project fails at
-- 20260617090259 with:
--
--     ERROR: 42704: role "sandbox_exec" does not exist
--
-- sandbox_exec is created by the Lovable Cloud platform, not by any migration
-- in this repo. It is present on Lovable-managed projects and absent from a
-- plain Supabase project, so the history was only ever replayable on the
-- former. That is precisely the kind of hidden environment dependency that
-- makes a schema unreproducible, and it stayed invisible until someone tried
-- to rebuild.
--
-- Why create the role rather than patch the two migrations
-- -------------------------------------------------------
-- The two references are a matched pair 43 seconds apart:
--
--     20260617090259  GRANT  INSERT, UPDATE, SELECT ON public.blog_posts TO   sandbox_exec
--     20260617090342  REVOKE INSERT, UPDATE, SELECT ON public.blog_posts FROM sandbox_exec
--
-- Net privilege change: zero. Editing them to be conditional would work, but
-- supabase/migrations is append-only by convention and rewriting applied files
-- diverges this repo from every database already built from it. Creating an
-- inert role costs nothing and leaves the history byte-identical.
--
-- What this grants: nothing. NOLOGIN means no one can authenticate as it, and
-- after 20260617090342 runs it holds no privileges on any object. It exists
-- only so two GRANT/REVOKE statements have a valid target.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sandbox_exec') THEN
    -- NOINHERIT so it cannot pick up privileges by membership either.
    CREATE ROLE sandbox_exec NOLOGIN NOINHERIT;
    COMMENT ON ROLE sandbox_exec IS
      'Placeholder for the Lovable Cloud sandbox role. Created by '
      '20260603191708_bootstrap_lovable_roles.sql so the migration history is '
      'replayable on a plain Supabase project. Holds no privileges.';
  END IF;
END
$$;
