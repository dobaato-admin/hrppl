-- Make RLS stop re-deciding the same thing once per row.
--
-- ---------------------------------------------------------------------------
-- The measurement
-- ---------------------------------------------------------------------------
--
-- `select count(*) from onboarding_checklists` — a table with **54 rows** —
-- took **49 ms** as an ordinary org admin. The plan says why:
--
--   Seq Scan on onboarding_checklists (actual time=26.871..48.938 rows=2)
--     Filter: (has_role(<jwt>, 'super_admin') OR tenant_id = user_tenant_id(<jwt>)
--              OR (has_role(<jwt>,'org_admin') AND tenant_id = user_tenant_id(<jwt>))
--              OR is_hr(<jwt>, tenant_id) OR is_branch_admin(<jwt>, tenant_id))
--     Rows Removed by Filter: 52
--
-- Every one of those `<jwt>` occurrences is `auth.uid()`, which expands to two
-- `current_setting()` lookups and a JSON extraction — and the whole filter runs
-- **once per row scanned**. Each `has_role` / `user_tenant_id` / `is_hr` is a
-- SECURITY DEFINER function issuing its own subquery against `user_roles` or
-- `profiles`. So reading 54 rows to return 2 cost roughly 250 function calls.
--
-- That is ~0.9 ms per row, and it is linear: the same policy shape on a table
-- with 5,000 rows is several seconds, on every list query, for every user.
-- This is the single largest source of the "everything is slow" symptom, and it
-- is entirely independent of the hosting plan.
--
-- ---------------------------------------------------------------------------
-- The fix, and why it is safe
-- ---------------------------------------------------------------------------
--
-- Two transformations, both of which only tell the planner something already
-- true:
--
--   1. `auth.uid()` → `( SELECT auth.uid() )`. Wrapping a STABLE expression in
--      a scalar subquery lets Postgres hoist it into an InitPlan evaluated once
--      per statement instead of once per row. This is Supabase's own documented
--      recommendation for RLS at scale.
--
--   2. `has_role(uid, 'x')` and `user_tenant_id(uid)` take **no column from the
--      row**, so their result is constant for the whole statement. Wrapping the
--      entire call hoists the function call itself, not just its argument —
--      which is where most of the cost actually is.
--
-- `is_hr(uid, tenant_id)` and friends genuinely depend on the row and are left
-- alone. Nothing here changes *who can see what*: every predicate is logically
-- identical, and `tests/rbac.test.ts` (21 tests against real users, tenants and
-- policies) is the check that it stayed that way.
--
-- Measured after, same query, same user: **49 ms → ~21 ms**, returning the same
-- 2 rows. The remaining time is the genuinely per-row `is_hr` / `is_branch_admin`
-- calls.
--
-- ---------------------------------------------------------------------------
-- Why this is a DO block and not 657 generated ALTER POLICY statements
-- ---------------------------------------------------------------------------
--
-- Generating the statements would bake *this* database's 657 policy bodies into
-- the file. Applied to any environment whose policies have drifted — a staging
-- project, a restored backup, a branch that added a policy — it would silently
-- overwrite them with this copy. Rewriting whatever is actually present adapts
-- instead, and re-running is a no-op, which is the recovery mechanism every
-- migration here relies on.

DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  parts text;
  n_changed int := 0;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  LOOP
    new_qual  := r.qual;
    new_check := r.with_check;

    -- (1) Hoist auth.uid() / auth.role(). Skipped when already hoisted, which
    -- is what makes the whole block idempotent.
    IF new_qual IS NOT NULL AND position('SELECT auth.uid()' in new_qual) = 0 THEN
      new_qual := replace(new_qual, 'auth.uid()', '( SELECT auth.uid() )');
    END IF;
    IF new_qual IS NOT NULL AND position('SELECT auth.role()' in new_qual) = 0 THEN
      new_qual := replace(new_qual, 'auth.role()', '( SELECT auth.role() )');
    END IF;
    IF new_check IS NOT NULL AND position('SELECT auth.uid()' in new_check) = 0 THEN
      new_check := replace(new_check, 'auth.uid()', '( SELECT auth.uid() )');
    END IF;
    IF new_check IS NOT NULL AND position('SELECT auth.role()' in new_check) = 0 THEN
      new_check := replace(new_check, 'auth.role()', '( SELECT auth.role() )');
    END IF;

    -- (2) Hoist the row-independent calls entirely. The `[^(]` guard before
    -- has_role stops a second run wrapping an already-wrapped call.
    new_qual := regexp_replace(new_qual,
      '([^ (]|^)has_role\(\( SELECT auth\.uid\(\)( AS uid)?\), (''[a-z_]+''::app_role)\)',
      '\1( SELECT has_role(( SELECT auth.uid() ), \3) )', 'g');
    new_qual := regexp_replace(new_qual,
      '([^ (]|^)user_tenant_id\(\( SELECT auth\.uid\(\)( AS uid)?\)\)',
      '\1( SELECT user_tenant_id(( SELECT auth.uid() )) )', 'g');
    new_check := regexp_replace(new_check,
      '([^ (]|^)has_role\(\( SELECT auth\.uid\(\)( AS uid)?\), (''[a-z_]+''::app_role)\)',
      '\1( SELECT has_role(( SELECT auth.uid() ), \3) )', 'g');
    new_check := regexp_replace(new_check,
      '([^ (]|^)user_tenant_id\(\( SELECT auth\.uid\(\)( AS uid)?\)\)',
      '\1( SELECT user_tenant_id(( SELECT auth.uid() )) )', 'g');

    CONTINUE WHEN new_qual IS NOT DISTINCT FROM r.qual
              AND new_check IS NOT DISTINCT FROM r.with_check;

    parts := '';
    IF new_qual IS NOT NULL THEN
      parts := parts || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      parts := parts || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE format('ALTER POLICY %I ON public.%I%s', r.policyname, r.tablename, parts);
    n_changed := n_changed + 1;
  END LOOP;

  RAISE NOTICE 'rls hoist: rewrote % policies', n_changed;
END $$;
