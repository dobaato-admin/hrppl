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

/** Minimal shape we need — avoids importing the generated client types here. */
type AnySupabase = {
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
 * The caller's tenant, or `null` if they have none.
 *
 * Platform accounts (`super_admin` / `regional_admin`) legitimately have
 * `profiles.tenant_id = NULL`, so absence is a normal state, not an error —
 * use {@link requireTenantId} when the caller must have one.
 */
export async function getTenantId(
  supabase: AnySupabase,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", userId)
    .maybeSingle();
  return (data?.tenant_id as string | undefined) ?? null;
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
  const { data } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}
