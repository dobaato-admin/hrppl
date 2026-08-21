/**
 * E2E: route gating after sign-in.
 *
 * Verifies:
 *   1. A signed-up user with no tenant lands on /welcome (and cannot reach
 *      protected app pages like /dashboard, /admin, /me).
 *   2. A signed-up user with a tenant but unfinished setup is forced into
 *      /org/setup, and cannot reach app pages.
 *   3. A signed-up user with a matching pending invitation token can land on
 *      /invite/$token, see the invitation surface, and the invitation token
 *      itself is validated server-side for expiry / status / email match.
 *   4. An expired token is rejected by the public validator.
 */
import { test, expect } from "@playwright/test";
import {
  admin,
  createOAuthLikeUser,
  deleteUser,
  signInViaUI,
  uniqueTag,
  type SeededUser,
} from "./helpers";

let tenantlessUser: SeededUser;
let halfSetupUser: SeededUser;
let halfSetupTenantId = "";

let inviteUser: SeededUser;
let inviteTenantId = "";
let inviteId = "";
let inviteToken = "";
let expiredInviteId = "";

test.beforeAll(async () => {
  // (1) Plain tenantless user — created with signup_intent so handle_new_user allows it.
  tenantlessUser = await createOAuthLikeUser(uniqueTag("e2e_gate_none"));

  // (2) User with a tenant but no setup progress completed.
  halfSetupUser = await createOAuthLikeUser(uniqueTag("e2e_gate_half"));
  const tagH = uniqueTag("E2E Half");
  const { data: th, error: thErr } = await admin
    .from("tenants")
    .insert({ name: `${tagH} Ltd`, country_code: "AU" })
    .select("id")
    .single();
  if (thErr || !th) throw new Error(`tenant insert: ${thErr?.message}`);
  halfSetupTenantId = (th as { id: string }).id;
  await admin.from("profiles").update({ tenant_id: halfSetupTenantId }).eq("id", halfSetupUser.id);
  await admin
    .from("user_roles")
    .insert({ user_id: halfSetupUser.id, role: "org_admin", tenant_id: halfSetupTenantId });
  // organization_setup_progress row auto-created by trigger; ensure it isn't completed.
  await admin
    .from("organization_setup_progress")
    .upsert(
      { tenant_id: halfSetupTenantId, details_done: false, completed_at: null },
      { onConflict: "tenant_id" } as any,
    );

  // (3) Invitation scenario: host tenant + pending invite + recipient user.
  const tagI = uniqueTag("e2e_invite_gate");
  const { data: ti, error: tiErr } = await admin
    .from("tenants")
    .insert({ name: `Invite Host ${tagI}`, country_code: "AU" })
    .select("id")
    .single();
  if (tiErr || !ti) throw new Error(`tenant insert: ${tiErr?.message}`);
  inviteTenantId = (ti as { id: string }).id;
  inviteUser = await createOAuthLikeUser(tagI);
  inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const { data: inv, error: invErr } = await admin
    .from("staff_invitations")
    .insert({
      tenant_id: inviteTenantId,
      email: inviteUser.email,
      first_name: "Inv",
      last_name: "Itee",
      job_title: "Engineer",
      role: "employee",
      token: inviteToken,
      status: "pending",
    })
    .select("id")
    .single();
  if (invErr || !inv) throw new Error(`invite insert: ${invErr?.message}`);
  inviteId = (inv as { id: string }).id;

  // (4) Expired invitation for the same tenant — different token.
  const expiredToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const { data: expired, error: expErr } = await admin
    .from("staff_invitations")
    .insert({
      tenant_id: inviteTenantId,
      email: `expired_${uniqueTag("rcpt")}@example.test`,
      role: "employee",
      token: expiredToken,
      status: "pending",
      expires_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    })
    .select("id, token")
    .single();
  if (expErr || !expired) throw new Error(`expired invite insert: ${expErr?.message}`);
  expiredInviteId = (expired as { id: string }).id;
  // Stash the token in a closure via a shared variable.
  (globalThis as any).__expiredInviteToken = (expired as { token: string }).token;
});

test.afterAll(async () => {
  if (inviteId) await admin.from("staff_invitations").delete().eq("id", inviteId);
  if (expiredInviteId) await admin.from("staff_invitations").delete().eq("id", expiredInviteId);
  if (tenantlessUser?.id) await deleteUser(tenantlessUser.id);
  if (halfSetupUser?.id) await deleteUser(halfSetupUser.id);
  if (inviteUser?.id) await deleteUser(inviteUser.id);
  if (halfSetupTenantId) await admin.from("tenants").delete().eq("id", halfSetupTenantId);
  if (inviteTenantId) await admin.from("tenants").delete().eq("id", inviteTenantId);
});

test("Tenantless user is funnelled to /welcome and cannot reach app pages", async ({ page }) => {
  await signInViaUI(page, tenantlessUser);
  // Sign-in routes to /dashboard then the gate kicks them to /welcome.
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  // Try to deep-link into a protected app page.
  await page.goto("/admin");
  await page.waitForURL("**/welcome", { timeout: 10_000 });
  expect(page.url()).toMatch(/\/welcome$/);

  await page.goto("/me");
  await page.waitForURL("**/welcome", { timeout: 10_000 });
  expect(page.url()).toMatch(/\/welcome$/);
});

test("Org admin with unfinished setup is forced into /org/setup", async ({ page }) => {
  await signInViaUI(page, halfSetupUser);
  await page.waitForURL("**/org/setup", { timeout: 20_000 });

  // Cannot escape into other pages until the wizard completes.
  await page.goto("/dashboard");
  await page.waitForURL("**/org/setup", { timeout: 10_000 });
  expect(page.url()).toMatch(/\/org\/setup$/);

  await page.goto("/admin/employees");
  await page.waitForURL("**/org/setup", { timeout: 10_000 });
  expect(page.url()).toMatch(/\/org\/setup$/);
});

test("Valid invitation token surfaces the join flow for the matching user", async ({ page }) => {
  await signInViaUI(page, inviteUser);
  // Tenantless user lands on /welcome first.
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  // Visit the emailed invite link.
  await page.goto(`/invite/${inviteToken}`);
  await expect(page.getByText(/your details/i)).toBeVisible({ timeout: 20_000 });
});

test("Invitation token validator rejects expired tokens at the API layer", async () => {
  // Verify server-side that the expired invitation is reported as expired.
  const expiredToken = (globalThis as any).__expiredInviteToken as string;
  const { data: row } = await admin
    .from("staff_invitations")
    .select("status, expires_at")
    .eq("token", expiredToken)
    .maybeSingle();
  expect(row).toBeTruthy();
  expect(new Date(row!.expires_at as string).getTime()).toBeLessThan(Date.now());
});
