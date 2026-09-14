-- =============================================================================
-- Acting tenant, the RLS half: teach user_tenant_id about the tenant switcher
-- =============================================================================
--
-- Converting the server layer to `requireTenantId` / `getTenantId` fixed the
-- *scoping* but not the *reading*. 262 of 700 policies, across 148 tables, are
-- keyed on `tenant_id = user_tenant_id(auth.uid())`. That function returned
-- `profiles.tenant_id`, which is NULL for a platform account — and `x = NULL`
-- is NULL, not true, so every one of those policies denied. A correctly
-- converted module asked the right question and got nothing back.
--
-- Measured on the setup guide before this change: a super_admin acting as Acme
-- read **0 of its 7 training_courses**, so the guide showed 57% for them and
-- 71% for Acme's own admin — same tenant, same day.
--
-- -----------------------------------------------------------------------------
-- Why this is one function and not 262 policy rewrites
-- -----------------------------------------------------------------------------
--
-- Every policy already asks the right question — "is this row in the caller's
-- tenant?" The only wrong part was the answer for a caller whose tenant is a
-- choice rather than a column. Fixing the answer in one place is a smaller,
-- reviewable change; rewriting 262 policies through a migration runner that is
-- not transactional across statements is a larger and more dangerous one.
--
-- -----------------------------------------------------------------------------
-- Why the blast radius is exactly "platform admins", and provably so
-- -----------------------------------------------------------------------------
--
-- 1. The fallback fires **only when `profiles.tenant_id IS NULL`**. Every
--    ordinary tenant member has one, so nothing about their access changes —
--    and no tenant member can ever be redirected into another tenant, because
--    COALESCE never reaches the second argument for them.
--
-- 2. A row in `platform_acting_tenant` can only exist for a `super_admin` (any
--    tenant) or a `regional_admin` (tenants inside their country scope), and
--    only for themselves. That is enforced by RLS on the table itself
--    (20260824090000), not by convention here.
--
-- 3. No policy in the schema uses `user_tenant_id` negatively — there is no
--    `IS NULL`, no `<>`, no `NOT`. Verified against `pg_policies` before this
--    migration. So this change can only ever widen, never narrow: nobody loses
--    access they had.
--
-- 4. It cannot recurse. `user_tenant_id` is SECURITY DEFINER, so its read of
--    `platform_acting_tenant` bypasses that table's RLS; and those policies are
--    written in terms of `has_role` / `has_country_scope`, never
--    `user_tenant_id`.
--
-- What it does change, deliberately: a platform admin who has chosen a tenant
-- can now WRITE to it through the same policies that let them read it. For
-- `super_admin` this mostly closes gaps — 134 tables already carry a
-- `FOR ALL ... has_role(super_admin)` policy with no tenant predicate at all,
-- so the tighter answer is arguably this one. For `regional_admin`, whose whole
-- definition is cross-tenant work inside a country scope, it is the point.
--
-- -----------------------------------------------------------------------------
-- The name
-- -----------------------------------------------------------------------------
--
-- `user_tenant_id` now means "the tenant this user is operating in", not "the
-- tenant stored on their profile". Renaming it would touch all 262 policies,
-- which is the cost this migration exists to avoid — so the meaning is recorded
-- here and in the function's own comment instead. If you need the raw stored
-- value, read `profiles.tenant_id` directly; `org-signup.functions.ts` does
-- exactly that, on purpose, to answer "do you already belong to an org?".
--
-- Performance: COALESCE does not evaluate its second argument when the first is
-- non-NULL, so a tenant member pays nothing. A platform admin pays one index
-- lookup on `platform_acting_tenant_pkey` (unique on `user_id`). The scalar
-- subqueries keep the hoisting discipline of 20260908090000.
--
-- The only prior definition is 20260603191709; grants come from 20260603191816
-- and 20260607212631 and are re-asserted below because CREATE OR REPLACE keeps
-- them but a future DROP/CREATE would not.

CREATE OR REPLACE FUNCTION public.user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.tenant_id FROM public.profiles p WHERE p.id = _user_id),
    (SELECT a.tenant_id FROM public.platform_acting_tenant a WHERE a.user_id = _user_id)
  );
$$;

COMMENT ON FUNCTION public.user_tenant_id(uuid) IS
  'The tenant this user is OPERATING IN: their profiles.tenant_id, or — only '
  'when that is NULL, i.e. a platform account — the tenant they have selected '
  'in the TenantSwitcher (platform_acting_tenant). Read profiles.tenant_id '
  'directly if you need the raw stored value rather than the effective one. '
  'See 20260914090000.';

REVOKE EXECUTE ON FUNCTION public.user_tenant_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_tenant_id(uuid) TO authenticated, service_role;
