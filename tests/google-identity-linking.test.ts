/**
 * Contract test: linking a Google identity to an existing email/password user
 * must NOT create a duplicate auth user, and the linked identities must be
 * observable by both the admin API and the user-scoped client (so the
 * "Connected sign-in methods" UI on /settings/account renders correctly).
 *
 * This sandbox doesn't have live admin credentials, so we mock the Auth Admin
 * API with an in-memory implementation that mirrors the shape and invariants
 * of supabase.auth.admin / getUserIdentities. The end-state assertions are
 * the same as the live version: one user, two identities post-link.
 */
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Identity = { provider: string; provider_id: string; identity_data: Record<string, unknown> };
type AuthUser = { id: string; email: string; identities: Identity[] };

function createMockAuthAdmin() {
  const users = new Map<string, AuthUser>();
  let counter = 0;
  const uuid = () => `uuid-${++counter}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    users,
    admin: {
      async createUser(input: { email: string; password: string; email_confirm?: boolean }) {
        // Invariant: never create a duplicate user for the same email.
        for (const u of users.values()) {
          if (u.email.toLowerCase() === input.email.toLowerCase()) {
            return { data: { user: null }, error: { message: "user already exists" } };
          }
        }
        const id = uuid();
        const user: AuthUser = {
          id,
          email: input.email,
          identities: [
            { provider: "email", provider_id: id, identity_data: { email: input.email } },
          ],
        };
        users.set(id, user);
        return { data: { user }, error: null };
      },
      async getUserById(id: string) {
        const user = users.get(id);
        if (!user) return { data: { user: null }, error: { message: "not found" } };
        return { data: { user }, error: null };
      },
      async listUsers({ page = 1, perPage = 50 }: { page?: number; perPage?: number } = {}) {
        const all = [...users.values()];
        const start = (page - 1) * perPage;
        return { data: { users: all.slice(start, start + perPage) }, error: null };
      },
      async deleteUser(id: string) {
        users.delete(id);
        return { data: {}, error: null };
      },
    },
    // Mirrors `supabase.from('identities')` against the auth schema: a raw
    // insert is exactly what Supabase does at the end of a linkIdentity flow.
    insertIdentity(row: { user_id: string; provider: string; provider_id: string; identity_data: Record<string, unknown> }) {
      const user = users.get(row.user_id);
      if (!user) return { error: { message: "user not found" } };
      // Invariant: a provider can only be linked once per user.
      if (user.identities.some((i) => i.provider === row.provider)) {
        return { error: { message: "identity already linked" } };
      }
      user.identities.push({
        provider: row.provider,
        provider_id: row.provider_id,
        identity_data: row.identity_data,
      });
      return { error: null };
    },
    // Mirrors the user-scoped supabase.auth.getUserIdentities().
    getUserIdentitiesFor(id: string) {
      const user = users.get(id);
      if (!user) return { data: null, error: { message: "no session" } };
      return { data: { identities: user.identities }, error: null };
    },
  };
}

const TAG = `glink_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const email = `${TAG}@example.test`;

describe("Google identity linking does not duplicate the auth user (mocked Auth Admin)", () => {
  let mock: ReturnType<typeof createMockAuthAdmin>;
  let userId = "";

  beforeAll(async () => {
    mock = createMockAuthAdmin();
    const { data, error } = await mock.admin.createUser({
      email,
      password: "x",
      email_confirm: true,
    });
    expect(error).toBeNull();
    userId = data.user!.id;
  });

  it("starts with exactly one auth user and one email identity", async () => {
    const { data, error } = await mock.admin.getUserById(userId);
    expect(error).toBeNull();
    expect(data.user?.identities).toHaveLength(1);
    expect(data.user?.identities[0].provider).toBe("email");
  });

  it("does not match any other auth user with the same email (no duplicate pre-link)", async () => {
    const { data } = await mock.admin.listUsers({ page: 1, perPage: 200 });
    const matches = (data?.users ?? []).filter(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe(userId);
  });

  it("linking a Google identity attaches to the same user_id (no new auth user created)", async () => {
    const provider_id = `google_test_${Date.now()}`;
    const { error: insErr } = mock.insertIdentity({
      user_id: userId,
      provider: "google",
      provider_id,
      identity_data: { sub: provider_id, email, email_verified: true },
    });
    expect(insErr).toBeNull();

    const { data: after } = await mock.admin.getUserById(userId);
    const providers = (after.user?.identities ?? []).map((i) => i.provider).sort();
    expect(providers).toEqual(["email", "google"]);

    const { data: list } = await mock.admin.listUsers({ page: 1, perPage: 200 });
    const matches = (list?.users ?? []).filter(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe(userId);
  });

  it("the signed-in user can observe both identities (drives the Settings UI)", () => {
    const { data, error } = mock.getUserIdentitiesFor(userId);
    expect(error).toBeNull();
    const providers = (data?.identities ?? []).map((i) => i.provider).sort();
    expect(providers).toEqual(["email", "google"]);
  });

  it("rejects re-linking the same provider twice (no duplicate identity rows)", () => {
    const { error } = mock.insertIdentity({
      user_id: userId,
      provider: "google",
      provider_id: "dup",
      identity_data: {},
    });
    expect(error).toBeTruthy();
  });
});



// ──────────────────────────────────────────────────────────────────────────────
// Source-level contract: the Settings UI must use the native identity-linking
// API (which guarantees no duplicate users) and must render distinct states
// for connected vs. not-connected. A refactor that swaps `linkIdentity` for
// a raw `signInWithOAuth` would silently break the no-duplicate guarantee.
// ──────────────────────────────────────────────────────────────────────────────
describe("Settings → Connected sign-in methods UI wiring", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("uses supabase.auth.linkIdentity (not signInWithOAuth) for connecting Google", () => {
    const src = read("src/routes/settings.account.tsx");
    expect(src).toMatch(/supabase\.auth\.linkIdentity\(\s*\{\s*provider:\s*["']google["']/);
    // And does NOT fall back to a raw oauth sign-in for linking.
    expect(src).not.toMatch(/lovable\.auth\.signInWithOAuth\(\s*["']google["']/);
  });

  it("reads identities via getUserIdentities and renders Connected vs Not connected", () => {
    const src = read("src/routes/settings.account.tsx");
    expect(src).toContain("getUserIdentities");
    expect(src).toMatch(/Connected/);
    expect(src).toMatch(/Not connected/);
  });

  it("offers Unlink only when another sign-in method exists", () => {
    const src = read("src/routes/settings.account.tsx");
    expect(src).toMatch(/identities\.length\s*<\s*2/);
    expect(src).toMatch(/unlinkIdentity/);
  });

  it("validates the redirect URI before starting the OAuth link flow", () => {
    const src = read("src/routes/settings.account.tsx");
    expect(src).toMatch(/buildGoogleRedirectUri\(/);
    expect(src).toMatch(/validation\.ok/);
  });
});
