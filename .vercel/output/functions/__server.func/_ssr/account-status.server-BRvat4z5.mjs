class AccountSuspendedError extends Error {
  code = "ACCOUNT_SUSPENDED";
  constructor(message = "Your account has been suspended. Contact your administrator.") {
    super(message);
    this.name = "AccountSuspendedError";
  }
}
const UNDEFINED_COLUMN = "42703";
const UNDEFINED_FUNCTION = "42883";
const PGRST_NO_SUCH_FUNCTION = "PGRST202";
let warnedMigrationPending = false;
function warnMigrationPending() {
  if (warnedMigrationPending) return;
  warnedMigrationPending = true;
  console.warn(
    "[account-status] The account-suspension migration has not been applied to this database. Suspension is NOT being enforced. Apply supabase/migrations/20260818090000_account_suspension.sql."
  );
}
function isPreMigration(error) {
  const code = error?.code;
  return code === UNDEFINED_COLUMN || code === UNDEFINED_FUNCTION || code === PGRST_NO_SUCH_FUNCTION;
}
const ACTIVE = {
  active: true,
  status: "active",
  tenantStatus: null,
  reason: null
};
async function getAccountStatus(supabase, userId) {
  const { data: active, error } = await supabase.rpc("is_account_active", {
    _user_id: userId
  });
  if (error) {
    if (isPreMigration(error)) {
      warnMigrationPending();
      return ACTIVE;
    }
    const message = error.message ?? "unknown error";
    throw new Error(`Account status check failed: ${message}`);
  }
  if (active === true) return ACTIVE;
  const { data: profile } = await supabase.from("profiles").select("status, suspension_reason, tenant_id").eq("id", userId).maybeSingle();
  const row = profile ?? null;
  const selfSuspended = row?.status === "suspended";
  return {
    active: false,
    status: selfSuspended ? "suspended" : "active",
    tenantStatus: selfSuspended ? null : "suspended",
    reason: row?.suspension_reason ?? null
  };
}
async function assertAccountActive(supabase, userId) {
  const status = await getAccountStatus(supabase, userId);
  if (status.active) return;
  if (status.status !== "suspended") {
    throw new AccountSuspendedError(
      "Your organisation's account is suspended. Contact your administrator."
    );
  }
  throw new AccountSuspendedError(
    status.reason ? `Your account has been suspended: ${status.reason}` : "Your account has been suspended. Contact your administrator."
  );
}
export {
  AccountSuspendedError,
  assertAccountActive,
  getAccountStatus
};
