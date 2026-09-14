// Account status checks (Finalization Plan §1 #4 / §5 "Day 1 - Critical").
//
// Runs on every authenticated request via requireActiveUser, so it must be
// cheap and must not depend on anything optional.
//
// Deliberately uses the CALLER'S OWN Supabase client, not the service-role
// client. Two reasons:
//   1. Correctness — the service-role client throws on construction when
//      SUPABASE_SERVICE_ROLE_KEY is absent (local dev, preview builds). Because
//      this guard sits in front of ~92 server fns, that turned one missing env
//      var into a total app outage plus a retry storm.
//   2. Least privilege — a per-request suspension check has no business
//      wielding a key that bypasses all RLS.
//
// It works without elevation because:
//   - `is_account_active()` is SECURITY DEFINER and granted to `authenticated`,
//     so it sees both the profile and the tenant regardless of the caller's RLS;
//   - the "users read own profile" policy matches on `id = auth.uid()`, which
//     still holds for a suspended user whose has_role() access was revoked.

export class AccountSuspendedError extends Error {
  readonly code = "ACCOUNT_SUSPENDED";
  constructor(message = "Your account has been suspended. Contact your administrator.") {
    super(message);
    this.name = "AccountSuspendedError";
  }
}

export type AccountStatus = {
  active: boolean;
  status: "active" | "suspended";
  tenantStatus: string | null;
  reason: string | null;
};

/** Postgres/PostgREST codes that mean "the migration has not been applied". */
const UNDEFINED_COLUMN = "42703";
const UNDEFINED_FUNCTION = "42883";
const PGRST_NO_SUCH_FUNCTION = "PGRST202";

let warnedMigrationPending = false;
function warnMigrationPending() {
  if (warnedMigrationPending) return;
  warnedMigrationPending = true;
  console.warn(
    "[account-status] The account-suspension migration has not been applied to " +
      "this database. Suspension is NOT being enforced. Apply " +
      "supabase/migrations/20260818090000_account_suspension.sql.",
  );
}

/** Exposed for tests — resets the once-per-process warning latch. */
export function __resetMigrationWarning() {
  warnedMigrationPending = false;
}

function isPreMigration(error: { code?: string } | null | undefined): boolean {
  const code = error?.code;
  return (
    code === UNDEFINED_COLUMN || code === UNDEFINED_FUNCTION || code === PGRST_NO_SUCH_FUNCTION
  );
}

const ACTIVE: AccountStatus = {
  active: true,
  status: "active",
  tenantStatus: null,
  reason: null,
};

type Client = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * Resolve whether an account may act right now.
 *
 * Uncached and re-run on every authenticated request by design: the Critical
 * finding is precisely that suspension was only ever evaluated at login. It is
 * one indexed lookup.
 */
export async function getAccountStatus(supabase: Client, userId: string): Promise<AccountStatus> {
  const { data: active, error } = await supabase.rpc("is_account_active", {
    _user_id: userId,
  });

  if (error) {
    // Pre-migration there is nowhere to record a suspension, so nobody can be
    // suspended and treating everyone as active matches current behaviour.
    // This is the ONLY case that fails open.
    if (isPreMigration(error as { code?: string })) {
      warnMigrationPending();
      return ACTIVE;
    }
    // Anything else fails closed — an unreadable status is not a licence.
    const message = (error as { message?: string }).message ?? "unknown error";
    throw new Error(`Account status check failed: ${message}`);
  }

  if (active === true) return ACTIVE;

  // Inactive. Work out why, so the user gets a useful message rather than a
  // blank wall. Reading one's own profile row is always permitted.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, suspension_reason")
    .eq("id", userId)
    .maybeSingle();

  const row = (profile ?? null) as {
    status?: "active" | "suspended";
    suspension_reason?: string | null;
  } | null;

  // If the profile itself is active, the tenant is what blocked them.
  const selfSuspended = row?.status === "suspended";

  return {
    active: false,
    status: selfSuspended ? "suspended" : "active",
    tenantStatus: selfSuspended ? null : "suspended",
    reason: row?.suspension_reason ?? null,
  };
}

/** Throws AccountSuspendedError unless the account is active. */
export async function assertAccountActive(supabase: Client, userId: string): Promise<void> {
  const status = await getAccountStatus(supabase, userId);
  if (status.active) return;

  if (status.status !== "suspended") {
    throw new AccountSuspendedError(
      "Your organisation's account is suspended. Contact your administrator.",
    );
  }
  throw new AccountSuspendedError(
    status.reason
      ? `Your account has been suspended: ${status.reason}`
      : "Your account has been suspended. Contact your administrator.",
  );
}
