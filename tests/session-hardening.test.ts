import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Finalization Plan §1 #5 — "Unexpected session logout; risk that a
 * captured/stored token could be replayed later."
 *
 * The fix is split by design:
 *   - idle timeout and absolute cap are enforced by GoTrue via
 *     supabase/config.toml (see tests/session-policy.test.ts). Server-side, so
 *     unlike a client timer it cannot be bypassed by ignoring the UI.
 *   - permission changes force re-authentication, covered here.
 *
 * Explicitly NOT fixed: the session still lives in localStorage, so an XSS can
 * still read the token. That is the cookie migration, deliberately out of scope
 * for this pass — the last test records the gap so it is not mistaken for done.
 */

const root = process.cwd();
const ROLE_MGMT = readFileSync(join(root, "src/lib/role-management.functions.ts"), "utf8");

describe("permission changes terminate existing sessions", () => {
  it("exposes one shared helper rather than ad-hoc revocation per call site", () => {
    expect(ROLE_MGMT).toMatch(/async function revokeSessionsForRoleChange/);
    expect(ROLE_MGMT).toMatch(/revoke_user_sessions/);
  });

  it("revokes on grant, revoke and branch-scope change alike", () => {
    const calls = ROLE_MGMT.match(/await revokeSessionsForRoleChange\(/g) ?? [];
    // grantRole, revokeRole, setBranchScope — narrowing a scope reduces
    // permissions just as revoking a role does.
    expect(calls.length).toBe(3);
  });

  it("reports how many sessions were ended so the UI can say so", () => {
    const returns = ROLE_MGMT.match(/return \{ ok: true, sessionsRevoked \}/g) ?? [];
    expect(returns.length).toBe(3);
  });

  it("never lets a revocation failure roll back the permission change", () => {
    // The role row is committed first; this is a best-effort follow-up.
    const helper = ROLE_MGMT.slice(
      ROLE_MGMT.indexOf("async function revokeSessionsForRoleChange"),
      ROLE_MGMT.indexOf("async function assertOrgAdmin"),
    );
    expect(helper).toMatch(/catch\s*\{\s*return 0;\s*\}/);
    expect(helper).not.toMatch(/throw/);
  });

  it("does not claim to be the authorization boundary", () => {
    // Roles are read live from user_roles on every request, so server-side
    // authorization was never stale. Overstating this invites someone to
    // rely on it as the gate.
    expect(ROLE_MGMT).toMatch(/NOT closing an authorization hole/);
  });
});

describe("known remaining gap", () => {
  it("session storage is still localStorage — the replay vector is narrowed, not closed", () => {
    const client = readFileSync(join(root, "src/integrations/supabase/client.ts"), "utf8");
    // Asserting the CURRENT state deliberately. When the cookie migration
    // lands this test should fail, prompting whoever does it to delete this
    // block rather than silently leaving the gap undocumented.
    expect(client).toMatch(/storage:\s*typeof window !== 'undefined' \? localStorage : undefined/);
  });
});
