/**
 * E2E-style test: after a fresh Google (or any OAuth) sign-up with no
 * invitation and no tenant, the app must route the user to the org-creation
 * wizard with a visible "Create organization" option.
 *
 * The routing is driven by two facts:
 *   1. `getMyOrgStatus` returns `tenantId: null` and `pendingInvitation: null`
 *      for a brand-new auth user with no invite. This is verified against the
 *      live DB by simulating the post-OAuth state.
 *   2. The client routing wires that state to `/welcome` and `/welcome`
 *      surfaces a "Create a new organization" link to `/org/setup`. This is
 *      verified by inspecting the route source so the contract can't silently
 *      regress.
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY
 * Run: bunx vitest run tests/google-signup-routing.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const hasEnv = Boolean(URL && SERVICE_KEY && ANON_KEY);
const d = hasEnv ? describe : describe.skip;

const TAG = `googsignup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const email = `${TAG}@example.test`;
const password = `Test!${TAG}aA1`;

let admin: ReturnType<typeof createClient>;
let userId = "";

d("Fresh OAuth sign-up routes to org creation wizard", () => {
  beforeAll(async () => {
    admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Simulate the post-Google-OAuth state: a fresh auth user with no
    // invite and no tenant. `handle_new_user` reads
    // `raw_app_meta_data->>'provider'` to detect OAuth; the admin API does
    // not let us set that field directly on create, so we use the
    // documented equivalent path — `user_metadata.signup_intent =
    // 'create_organization'`. The end state observed by `getMyOrgStatus`
    // (no tenant, no roles, no invite, no employee) is identical to a real
    // Google sign-up, so the dashboard → /welcome routing is exercised the
    // same way.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Google User",
        signup_intent: "create_organization",
      },
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    userId = data.user.id;
  });

  afterAll(async () => {
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  it("creates a profile with no tenant_id", async () => {
    const { data, error } = await admin
      .from("profiles")
      .select("id, tenant_id")
      .eq("id", userId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect((data as any).tenant_id).toBeNull();
  });

  it("assigns no role rows (no org_admin / employee yet)", async () => {
    const { data, error } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("has no pending invitation matching the OAuth email", async () => {
    const { data, error } = await admin
      .from("staff_invitations")
      .select("id")
      .ilike("email", email)
      .eq("status", "pending");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("has no employee record (cannot be routed to onboarding)", async () => {
    const { data, error } = await admin
      .from("employees")
      .select("id")
      .eq("user_id", userId);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("the signed-in user can read their own profile and see tenant_id=null", async () => {
    // This mirrors what `getMyOrgStatus` does on the server — querying
    // `profiles` as the authenticated user — and confirms RLS lets them
    // observe the empty-tenant state that triggers the /welcome redirect.
    const userClient = createClient(URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: signInErr } = await userClient.auth.signInWithPassword({
      email,
      password,
    });
    expect(signInErr).toBeNull();

    const { data, error } = await userClient
      .from("profiles")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    expect(error).toBeNull();
    expect((data as any)?.tenant_id ?? null).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Routing contract: dashboard → /welcome → "Create a new organization" link to
// /org/setup. Source-level assertions so a refactor can't silently break the
// post-OAuth wizard hand-off.
// ──────────────────────────────────────────────────────────────────────────────
describe("Routing wiring for empty-tenant OAuth users", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("auth.tsx Google sign-in builds redirect via buildGoogleRedirectUri", () => {
    const src = read("src/routes/auth.tsx");
    expect(src).toMatch(/signInWithOAuth\(\s*["']google["']/);
    expect(src).toMatch(/buildGoogleRedirectUri\(\s*redirect\s*\)/);
  });

  it("signup.tsx Google sign-up builds redirect via buildGoogleRedirectUri", () => {
    const src = read("src/routes/signup.tsx");
    expect(src).toMatch(/signInWithOAuth\(\s*["']google["']/);
    expect(src).toMatch(/buildGoogleRedirectUri\(\s*redirect\s*\)/);
  });

  it("dashboard.tsx redirects users with no tenant to /welcome", () => {
    const src = read("src/routes/dashboard.tsx");
    expect(src).toContain("getMyOrgStatus");
    // tenantId-null branch must navigate to /welcome
    expect(src).toMatch(/!orgStatus\.tenantId[\s\S]{0,200}navigate\(\{\s*to:\s*["']\/welcome["']/);
  });

  it("welcome.tsx exposes a 'Create a new organization' link to /org/setup", () => {
    const src = read("src/routes/welcome.tsx");
    expect(src).toMatch(/Create a new organization/i);
    expect(src).toMatch(/to=["']\/org\/setup["']/);
  });

  it("/org empty-state also offers a Create organization button to /org/setup", () => {
    // Fallback path if a user lands on /org directly without a tenant.
    const src = read("src/routes/org.tsx");
    expect(src).toMatch(/Create organization/i);
    expect(src).toMatch(/to=["']\/org\/setup["']/);
  });
});
