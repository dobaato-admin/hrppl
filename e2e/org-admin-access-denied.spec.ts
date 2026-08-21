/**
 * E2E: A signed-in user WITHOUT the org_admin role must not be able to use
 * org-admin features. Visiting org-admin routes should either redirect them
 * away or render the "Forbidden" access-denied state instead of the real page.
 *
 * Setup:
 *   - Seed a tenant in `active` status with a completed
 *     organization_setup_progress row, so AuthRouteGate does NOT funnel the
 *     user through /welcome or /org/setup.
 *   - Seed a confirmed user, link their profile to the tenant, and grant
 *     ONLY the `employee` role (no org_admin, no super_admin).
 *
 * Asserts:
 *   - /dashboard is reachable (the user is allowed in the app).
 *   - /org/analytics renders "Forbidden." instead of the analytics UI.
 *   - /org/invitations either redirects to /dashboard or shows Forbidden.
 *   - At no point is the unauthorized user able to see org-admin-only UI
 *     (e.g. the "Invite teammate" / "New leave type" admin controls).
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

let user: SeededUser;
let tenantId: string | null = null;

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_denied");
  user = await createOAuthLikeUser(tag);

  // Create a fully set-up tenant so the gate doesn't shove us into /org/setup.
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({
      name: `Denied Test Org ${Date.now()}`,
      slug: `denied-${tag}`,
      country_code: "AU",
      currency_code: "AUD",
      contact_email: user.email,
      status: "active",
    })
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = tenant.id;

  // Mark org setup as completed so AuthRouteGate lets the user through.
  await admin.from("organization_setup_progress").upsert(
    {
      tenant_id: tenantId,
      details_done: true,
      branding_done: true,
      departments_done: true,
      defaults_done: true,
      invites_done: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );

  // Attach user to the tenant via profile and grant ONLY the employee role.
  await admin
    .from("profiles")
    .update({ tenant_id: tenantId })
    .eq("id", user.id);

  await admin
    .from("user_roles")
    .delete()
    .eq("user_id", user.id); // wipe any defaults
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "employee", tenant_id: tenantId });
});

test.afterAll(async () => {
  if (tenantId) {
    await admin.from("user_roles").delete().eq("tenant_id", tenantId);
    await admin.from("tenants").delete().eq("id", tenantId);
  }
  if (user?.id) await deleteUser(user.id);
});

test("non-admin user is blocked from org admin features", async ({ page }) => {
  await signInViaUI(page, user);

  // The user has a tenant and setup is done — they should land on /dashboard.
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe("/dashboard");

  // Sanity: confirm at the DB level the user does NOT have org_admin.
  const { data: hasOrgAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "org_admin",
  });
  expect(hasOrgAdmin).toBe(false);

  // ---- /org/analytics: renders Forbidden, NOT the analytics dashboard ----
  await page.goto("/org/analytics");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/forbidden/i).first()).toBeVisible({
    timeout: 10_000,
  });
  // The real analytics page heading must not be visible.
  await expect(
    page.getByRole("heading", { name: /analytics|overview/i }),
  ).toHaveCount(0);

  // ---- /org/reports: same access-denied state ----
  await page.goto("/org/reports");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/forbidden/i).first()).toBeVisible({
    timeout: 10_000,
  });

  // ---- /org/invitations: this route redirects non-admins to /dashboard ----
  await page.goto("/org/invitations");
  // Wait for either redirect or forbidden render.
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  const path = new URL(page.url()).pathname;
  const onDashboard = path === "/dashboard";
  const stillOnInvitationsButForbidden =
    path === "/org/invitations" &&
    (await page.getByText(/forbidden|org admin/i).first().isVisible().catch(() => false));
  expect(
    onDashboard || stillOnInvitationsButForbidden,
    `expected redirect to /dashboard or forbidden state, got ${path}`,
  ).toBe(true);

  // The admin-only "send invitation" / role select UI must not be reachable.
  await expect(page.getByRole("button", { name: /send invitation/i })).toHaveCount(
    0,
  );

  // ---- /admin/leave-types: admin-only configuration screen ----
  await page.goto("/admin/leave-types");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/forbidden/i).first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole("button", { name: /new leave type/i }),
  ).toHaveCount(0);
});
