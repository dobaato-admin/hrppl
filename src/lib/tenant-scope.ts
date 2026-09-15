/**
 * Tenant scoping for server functions.
 *
 * RLS is the security boundary, but it is not a *scoping* boundary for every
 * role. `super_admin` holds policies with no tenant predicate at all — e.g.
 * "super admin all employees" (20260603213444:100-103) is
 * `FOR ALL USING has_role(uid,'super_admin')` — so a query that omits
 * `.eq("tenant_id", …)` and trusts RLS to narrow it returns **every tenant's
 * rows** for that caller. `regional_admin` is the same within its scope
 * countries.
 *
 * That is not a theoretical gap. It shipped: the offboarding employee picker
 * listed all 15 employees across all 3 tenants, and because
 * `createOffboarding` copied `tenant_id` from the *selected employee*, choosing
 * any of them built a row whose tenant did not match
 * `user_tenant_id(auth.uid())` — which `WITH CHECK` then rejected with
 * "new row violates row-level security policy". The leak and the failure were
 * the same bug.
 *
 * So: scope defensively in the query, and let RLS be the backstop rather than
 * the mechanism.
 *
 * This helper replaces ~40 hand-rolled copies of the same `profiles` lookup
 * scattered through src/lib and src/routes. Migrating the rest is incremental;
 * new code should start here.
 */

import { requestMemo } from "@/lib/request-cache";

/** Minimal shape we need — avoids importing the generated client types here. */
export type AnySupabase = {
  from: (table: string) => any;
};

/**
 * Thrown when the caller has no tenant. Typed so callers can distinguish
 * "platform account with nothing selected" from a genuine failure and render an
 * empty state instead of an error toast.
 */
export class NoTenantScopeError extends Error {
  readonly code = "NO_TENANT_SCOPE" as const;
  constructor(message = "Your account is not attached to an organization.") {
    super(message);
    this.name = "NoTenantScopeError";
  }
}

export function isNoTenantScope(e: unknown): e is NoTenantScopeError {
  return (
    e instanceof NoTenantScopeError ||
    (typeof e === "object" && e !== null && (e as { code?: string }).code === "NO_TENANT_SCOPE")
  );
}

/**
 * The tenant a platform admin (`super_admin` / `regional_admin`) has chosen to
 * act as, or `null` if none is set. Set via `setActingTenant`
 * (`platform-tenant.functions.ts`) into `platform_acting_tenant`
 * (20260824090000). RLS on that table already restricts a row to its owner
 * and to tenants they're allowed to act on — `has_role` for super_admin,
 * `has_role` + `has_country_scope` for regional_admin — so no role check is
 * needed here; querying it for an ordinary tenant employee just returns
 * nothing.
 *
 * Exported separately from {@link getTenantId} because `getMyOrgStatus` and
 * `getMyGateStatus` already have the caller's `profiles.tenant_id` in hand
 * from their own query and only need this as a fallback, not a second
 * `profiles` round trip.
 */
export async function getActingTenantId(
  supabase: AnySupabase,
  userId: string,
): Promise<string | null> {
  return requestMemo(supabase, `acting:${userId}`, async () => {
    const { data } = await supabase
      .from("platform_acting_tenant")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();
    return (data?.tenant_id as string | undefined) ?? null;
  });
}

/**
 * The caller's tenant, or `null` if they have none.
 *
 * Platform accounts (`super_admin` / `regional_admin`) legitimately have
 * `profiles.tenant_id = NULL`. For those, falls back to
 * {@link getActingTenantId}. Absence is still a normal state, not an error —
 * use {@link requireTenantId} when the caller must have one.
 */
export async function getTenantId(supabase: AnySupabase, userId: string): Promise<string | null> {
  // T13 · Memoised per request. `profiles` carried 912,884 sequential scans
  // over twenty rows because nearly every server fn opens by resolving the
  // caller's tenant, and several do it more than once. No index helps a
  // twenty-row table; not asking twice does. See src/lib/request-cache.ts for
  // why the cache is keyed on the per-request client.
  return requestMemo(supabase, `tenant:${userId}`, async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.tenant_id) return profile.tenant_id as string;
    return getActingTenantId(supabase, userId);
  });
}

/**
 * The caller's tenant, throwing {@link NoTenantScopeError} when absent.
 *
 * Use this in any server fn that reads or writes tenant-owned rows. Do not fall
 * back to "no filter" when it throws — that is precisely the leak this exists
 * to close.
 */
export async function requireTenantId(
  supabase: AnySupabase,
  userId: string,
): Promise<string> {
  const tenantId = await getTenantId(supabase, userId);
  if (!tenantId) throw new NoTenantScopeError();
  return tenantId;
}

/**
 * The caller's own `employees.id`, or `null` if they have no employee record.
 *
 * Used to keep people out of their own pickers — you should not be able to
 * offboard, discipline or approve your own expenses from a dropdown.
 */
export async function getMyEmployeeId(
  supabase: AnySupabase,
  userId: string,
): Promise<string | null> {
  return requestMemo(supabase, `employee:${userId}`, async () => {
    const { data } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  });
}

/**
 * The caller's roles, resolved once per request.
 *
 * T13 · `user_roles` carried 183,207 sequential scans over twenty-eight rows
 * for the same reason `profiles` did: every module has its own `assertAdmin`
 * and each one re-reads. Modules keep their own guards — the check is theirs
 * to make — but they no longer each pay for the read.
 *
 * Returns a plain array so existing `roles.some(...)` / `roles.includes(...)`
 * call sites work unchanged.
 */
export async function getMyRoles(
  supabase: AnySupabase,
  userId: string,
): Promise<string[]> {
  return requestMemo(supabase, `roles:${userId}`, async () => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return ((data ?? []) as Array<{ role: string }>).map((r) => r.role);
  });
}

/**
 * Tenant and roles together, in parallel.
 *
 * The two reads are independent, and thirteen modules were doing them one
 * after the other — `await assertAdmin(...)` then `await getTenant(...)` —
 * which is two sequential round trips where one round trip's worth of latency
 * would do. Both are memoised, so calling this after something else has
 * already resolved either costs nothing.
 */
export async function getTenantAndRoles(
  supabase: AnySupabase,
  userId: string,
): Promise<{ tenantId: string | null; roles: string[] }> {
  const [tenantId, roles] = await Promise.all([
    getTenantId(supabase, userId),
    getMyRoles(supabase, userId),
  ]);
  return { tenantId, roles };
}

/**
 * The branches a caller may see, or `null` when they may see the whole tenant.
 *
 * ---------------------------------------------------------------------------
 * Why a server-side mirror of `has_branch_access`
 * ---------------------------------------------------------------------------
 *
 * `branch_admin` is admitted by `org.teams`, `org.idRequests`, `org.assets` and
 * `org.employees`, and was refused by every one of those pages' first read.
 * `timeline.functions.ts` explains why: those endpoints are **tenant-wide by
 * construction**, and a branch admin is not.
 *
 * So the answer is not to widen them but to narrow the rows. This resolves the
 * same question `has_branch_access` answers in SQL, once per request, so a
 * query can express it as a filter:
 *
 *   - `super_admin` / `org_admin` — the whole tenant, as before.
 *   - `hr` / `manager` / `finance` — the whole tenant. These roles are not
 *     branch-scoped in this product; their limits are which COLUMNS and which
 *     surfaces they get, not which branches.
 *   - `branch_admin` — the branches named in `role_scope`, unless a row there
 *     has `branch_id IS NULL`, which grants the whole tenant exactly as the SQL
 *     function treats it.
 *
 * **Callers must include rows whose `branch_id` is NULL.** `has_branch_access`
 * returns true for an untagged row — "row not yet branch-tagged; defer to the
 * tenant check" — and most rows in this database are untagged. A plain
 * `.in("branch_id", ids)` drops every one of them and would turn a scoping fix
 * into an empty page, which is the defect this whole exercise is about. Use
 * {@link branchFilter}.
 */
export async function resolveBranchScope(
  supabase: AnySupabase,
  userId: string,
  tenantId: string,
): Promise<string[] | null> {
  const roles = await getMyRoles(supabase, userId);
  const unrestricted = ["super_admin", "org_admin", "hr", "manager", "finance"];
  if (roles.some((r) => unrestricted.includes(r))) return null;
  if (!roles.includes("branch_admin")) return null;

  const { data } = await supabase
    .from("role_scope")
    .select("branch_id")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId);
  const rows = (data ?? []) as Array<{ branch_id: string | null }>;
  // A tenant-wide scope row is the SQL function's `rs.branch_id IS NULL` case.
  if (rows.some((r) => r.branch_id === null)) return null;
  return rows.map((r) => r.branch_id as string);
}

/**
 * PostgREST `.or()` filter for a branch scope, or `null` when unrestricted.
 *
 * Kept beside {@link resolveBranchScope} because the NULL case is the whole
 * subtlety: `branch_id.is.null` has to be in the filter or every untagged row
 * disappears.
 */
export function branchFilter(branchIds: string[] | null): string | null {
  if (branchIds === null) return null;
  if (branchIds.length === 0) return "branch_id.is.null";
  return `branch_id.is.null,branch_id.in.(${branchIds.join(",")})`;
}
