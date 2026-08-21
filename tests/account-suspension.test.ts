import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Finalization Plan §1 #4 / §5 "Day 1 - Critical":
 * "Suspended accounts retain full working access. Must be enforced server-side
 *  on every authenticated request, not only checked at login."
 *
 * Three layers are asserted here:
 *   1. behaviour  — getAccountStatus / assertAccountActive decide correctly;
 *   2. wiring     — every server fn actually inherits the guard;
 *   3. schema     — the migration blocks self-un-suspension and revokes RLS.
 */

const root = process.cwd();

// ---------------------------------------------------------------- 1. behaviour

const { getAccountStatus, assertAccountActive, AccountSuspendedError, __resetMigrationWarning } =
  await import("../src/lib/account-status.server");

/**
 * Fake caller client. Deliberately NOT the service-role client: the guard runs
 * on every authenticated request and must work with the caller's own token.
 */
function client(opts: {
  active?: boolean;
  rpcError?: { code?: string; message?: string };
  profile?: Record<string, unknown> | null;
}) {
  return {
    rpc: async () => ({
      data: opts.rpcError ? null : (opts.active ?? true),
      error: opts.rpcError ?? null,
    }),
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: opts.profile ?? null, error: null }),
        }),
      }),
    }),
  } as never;
}

describe("getAccountStatus", () => {
  beforeEach(() => __resetMigrationWarning());

  it("reports an active account as active", async () => {
    expect((await getAccountStatus(client({ active: true }), "u1")).active).toBe(true);
  });

  it("reports a suspended profile as inactive and surfaces the reason", async () => {
    const s = await getAccountStatus(
      client({
        active: false,
        profile: { status: "suspended", suspension_reason: "Policy breach", tenant_id: "t1" },
      }),
      "u1",
    );
    expect(s.active).toBe(false);
    expect(s.status).toBe("suspended");
    expect(s.reason).toBe("Policy breach");
  });

  it("attributes an inactive result to the tenant when the profile is fine", async () => {
    const s = await getAccountStatus(
      client({
        active: false,
        profile: { status: "active", suspension_reason: null, tenant_id: "t1" },
      }),
      "u1",
    );
    expect(s.active).toBe(false);
    expect(s.tenantStatus).toBe("suspended");
  });

  it("does not need the service-role key — uses the caller's own client", async () => {
    // Regression: the first implementation imported the service-role client,
    // which THROWS ON CONSTRUCTION when SUPABASE_SERVICE_ROLE_KEY is absent.
    // Because this guard fronts ~92 server fns, that turned one missing env var
    // into a full outage plus a react-query retry storm.
    const src = readFileSync(join(root, "src/lib/account-status.server.ts"), "utf8");
    expect(src).not.toMatch(/client\.server/);
    expect(src).not.toMatch(/supabaseAdmin/);
  });

  it("tolerates the RPC not existing before the migration is applied", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = await getAccountStatus(
      client({ rpcError: { code: "42883", message: "function does not exist" } }),
      "u1",
    );
    expect(s.active).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("tolerates PostgREST's own missing-function code", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = await getAccountStatus(
      client({ rpcError: { code: "PGRST202", message: "not found in schema cache" } }),
      "u1",
    );
    expect(s.active).toBe(true);
    warn.mockRestore();
  });

  it("tolerates the column not existing before the migration is applied", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = await getAccountStatus(
      client({ rpcError: { code: "42703", message: "column does not exist" } }),
      "u1",
    );
    expect(s.active).toBe(true);
    warn.mockRestore();
  });

  it("warns only once per process, not once per request", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = client({ rpcError: { code: "42883" } });
    await getAccountStatus(c, "u1");
    await getAccountStatus(c, "u1");
    await getAccountStatus(c, "u1");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("still fails closed for every other database error", async () => {
    // A permissions error or an outage must not be mistaken for "not migrated".
    await expect(
      getAccountStatus(client({ rpcError: { code: "42501", message: "permission denied" } }), "u1"),
    ).rejects.toThrow(/Account status check failed/);
  });
});

describe("assertAccountActive", () => {
  beforeEach(() => __resetMigrationWarning());

  it("resolves silently for an active account", async () => {
    await expect(assertAccountActive(client({ active: true }), "u1")).resolves.toBeUndefined();
  });

  it("throws AccountSuspendedError carrying a stable machine code", async () => {
    await expect(
      assertAccountActive(client({ active: false, profile: { status: "suspended" } }), "u1"),
    ).rejects.toMatchObject({ code: "ACCOUNT_SUSPENDED" });
  });

  it("names the organisation when the tenant is the thing suspended", async () => {
    await expect(
      assertAccountActive(client({ active: false, profile: { status: "active" } }), "u1"),
    ).rejects.toThrow(/organisation/);
  });

  it("includes the admin's reason when one was given", async () => {
    await expect(
      assertAccountActive(
        client({
          active: false,
          profile: { status: "suspended", suspension_reason: "Offboarded" },
        }),
        "u1",
      ),
    ).rejects.toThrow(/Offboarded/);
  });

  it("does not leak AccountSuspendedError for a genuine outage", async () => {
    await expect(
      assertAccountActive(
        client({ rpcError: { code: "08006", message: "connection failure" } }),
        "u1",
      ),
    ).rejects.not.toBeInstanceOf(AccountSuspendedError);
  });
});

// ------------------------------------------------------------------ 2. wiring

const AUTH_GUARD_IMPORT = /from\s+["']@\/lib\/auth-guard["']/;
const RAW_MIDDLEWARE_IMPORT = /from\s+["']@\/integrations\/supabase\/auth-middleware["']/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const sourceFiles = walk("src");

describe("auth guard wiring", () => {
  it("routes every consumer through auth-guard, not the generated middleware", () => {
    const offenders = sourceFiles.filter(
      (f) =>
        f !== "src/lib/auth-guard.ts" &&
        RAW_MIDDLEWARE_IMPORT.test(readFileSync(join(root, f), "utf8")),
    );
    // auth-guard.ts is the single sanctioned importer — it wraps it.
    expect(offenders).toEqual([]);
  });

  it("actually applies the guard at a meaningful number of call sites", () => {
    const guarded = sourceFiles.filter((f) =>
      AUTH_GUARD_IMPORT.test(readFileSync(join(root, f), "utf8")),
    );
    // The audit counted 92 inheritors of requireSupabaseAuth.
    expect(guarded.length).toBeGreaterThanOrEqual(90);
  });

  it("checks suspension inside the guard on every request, with no cache", () => {
    const src = readFileSync(join(root, "src/lib/auth-guard.ts"), "utf8");
    expect(src).toMatch(/assertAccountActive/);
    // A TTL cache here would reintroduce exactly the "only checked at login"
    // bug the plan flags as Critical.
    expect(src).not.toMatch(/cacheMs|ttl|new Map\(/i);
  });

  it("keeps the unguarded escape hatch to a single, deliberate endpoint", () => {
    const users = sourceFiles.filter(
      (f) =>
        /requireAuthAllowSuspended/.test(readFileSync(join(root, f), "utf8")) &&
        f !== "src/lib/auth-guard.ts",
    );
    expect(users).toEqual(["src/lib/org-signup.functions.ts"]);
  });

  it("still reports suspension to the route gate so it can redirect", () => {
    const src = readFileSync(join(root, "src/lib/org-signup.functions.ts"), "utf8");
    expect(src).toMatch(/suspended:\s*true/);
    const gate = readFileSync(join(root, "src/components/AuthRouteGate.tsx"), "utf8");
    expect(gate).toMatch(/SUSPENDED_ROUTE/);
  });
});

// ------------------------------------------------------------------ 3. schema

const MIGRATION = readFileSync(
  join(root, "supabase/migrations/20260818090000_account_suspension.sql"),
  "utf8",
);

describe("account suspension migration", () => {
  it("adds a user-level status column, which the schema previously lacked", () => {
    expect(MIGRATION).toMatch(
      /ALTER TABLE public\.profiles[\s\S]*ADD COLUMN status public\.account_status/,
    );
    expect(MIGRATION).toMatch(/DEFAULT 'active'/);
  });

  it("folds the active check into has_role so all RLS policies inherit it", () => {
    const hasRole = MIGRATION.slice(MIGRATION.indexOf("FUNCTION public.has_role"));
    expect(hasRole).toMatch(/is_account_active\(_user_id\)/);
  });

  it("blocks a suspended user from un-suspending their own profile", () => {
    // "users update own profile" is USING (id = auth.uid()), so the trigger is
    // the only thing between a suspended user and self-reinstatement.
    expect(MIGRATION).toMatch(/NEW\.status IS DISTINCT FROM OLD\.status/);
    expect(MIGRATION).toMatch(/Changing account suspension state is not allowed/);
    // Service-role is the only permitted writer, using the same idiom the
    // tenant_id rule already uses.
    expect(MIGRATION).toMatch(/auth\.role\(\) IS DISTINCT FROM 'service_role'/);
  });

  it("preserves the service_role escape on the tenant_id rule", () => {
    // Regression guard: this migration CREATE OR REPLACEs a function that has
    // been revised four times. Rebuilding it from the original 20260604013651
    // body would silently revert 20260606132210 and break acceptInvitation.
    expect(MIGRATION).toMatch(
      /NEW\.tenant_id IS DISTINCT FROM OLD\.tenant_id[\s\S]*auth\.role\(\) = 'service_role'/,
    );
  });

  it("treats pending tenants as active and suspended/cancelled as blocked", () => {
    expect(MIGRATION).toMatch(/NOT IN \('suspended', 'cancelled'\)/);
  });

  it("provides session revocation that only service_role may call", () => {
    expect(MIGRATION).toMatch(/FUNCTION public\.revoke_user_sessions/);
    expect(MIGRATION).toMatch(/DELETE FROM auth\.refresh_tokens/);
    expect(MIGRATION).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.revoke_user_sessions\(UUID\) FROM PUBLIC, anon, authenticated/,
    );
  });

  it("does not expose is_account_active to anonymous callers", () => {
    expect(MIGRATION).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.is_account_active\(UUID\) FROM PUBLIC, anon/,
    );
  });
});

describe("suspension admin functions", () => {
  const SRC = readFileSync(join(root, "src/lib/account-suspension.functions.ts"), "utf8");

  it("revokes live sessions rather than waiting for token expiry", () => {
    expect(SRC).toMatch(/revoke_user_sessions/);
  });

  it("refuses self-suspension so the last admin cannot lock themselves out", () => {
    expect(SRC).toMatch(/cannot change your own account status/);
  });

  it("scopes org_admin to their own tenant", () => {
    expect(SRC).toMatch(/different organisation/);
  });

  it("stops an org_admin suspending a platform administrator", () => {
    expect(SRC).toMatch(/cannot change a platform administrator/);
  });

  it("writes an audit trail for both directions", () => {
    expect(SRC).toMatch(/account\.suspended/);
    expect(SRC).toMatch(/account\.reinstated/);
  });
});

// ------------------------------------------------------------------- 4. admin UI

describe("suspension admin surface", () => {
  it("gates the control behind a dedicated, narrow rbac feature", async () => {
    const { can } = await import("../src/lib/rbac");
    expect(can("account.suspend", ["org_admin"])).toBe(true);
    expect(can("account.suspend", ["super_admin"])).toBe(true);
    // Deliberately excluded — hr and manager administer people, not access.
    expect(can("account.suspend", ["hr"])).toBe(false);
    expect(can("account.suspend", ["manager"])).toBe(false);
    expect(can("account.suspend", ["branch_admin"])).toBe(false);
    expect(can("account.suspend", ["employee"])).toBe(false);
  });

  it("keys suspension on the auth user id, never the employee id", () => {
    // employees.status is an HR employment state; profiles.id is the auth
    // identity. Conflating them would suspend the wrong thing.
    const src = readFileSync(join(root, "src/routes/org.employees.tsx"), "utf8");
    expect(src).toMatch(/userId:\s*e\.user_id!/);
    const dialog = readFileSync(
      join(root, "src/components/security/AccountSuspensionDialog.tsx"),
      "utf8",
    );
    expect(dialog).toMatch(/NOT the employee id/);
  });

  it("requires a reason before suspending", () => {
    const dialog = readFileSync(
      join(root, "src/components/security/AccountSuspensionDialog.tsx"),
      "utf8",
    );
    expect(dialog).toMatch(/A reason is required/);
    expect(dialog).toMatch(/disabled=\{working \|\| \(!isSuspended && !reason\.trim\(\)\)\}/);
  });

  it("warns that suspending a tenant blocks everyone in it", () => {
    // tenants.status became a live gate via is_account_active(); before this
    // migration it set a label and nothing else.
    const src = readFileSync(join(root, "src/routes/admin.index.tsx"), "utf8");
    expect(src).toMatch(/blocked from all pages and API calls/);
  });

  it("marks the governance health label as advisory, not an access gate", () => {
    // platform.tenants.tsx has its own "suspended" that grants/revokes nothing.
    const src = readFileSync(join(root, "src/routes/platform.tenants.tsx"), "utf8");
    expect(src).toMatch(/does not block access/);
  });
});
