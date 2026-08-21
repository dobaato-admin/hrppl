/**
 * E2E: A user WITH the super_admin role can access all org-admin pages
 * without being redirected or shown an access-denied state.
 *
 * Setup:
 *   - Seed a confirmed user and grant the `super_admin` role.
 *   - Create a tenant and link the user's profile so data-loading pages
 *     have a tenant_id to work with.
 *   - Mark org setup as completed so AuthRouteGate doesn't funnel the
 *     user through /org/setup (even though platform admins bypass gating,
 *     this keeps the DB state consistent).
 *
 * Asserts:
 *   - /dashboard renders without redirect.
 *   - /org/analytics, /org/reports, /org/invitations render the real
 *     admin UI, not "Forbidden."
 *   - /admin/leave-types renders with the "New leave type" control visible.
 *   - /admin (super-admin console) renders the platform admin UI.
 *   - has_role(user, 'super_admin') returns true at the DB level.
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
  const tag = uniqueTag("e2e_su");
  user = await createOAuthLikeUser(tag);

  // Create a tenant so data-scoped pages have a tenant_id to query.
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({
      name: `Super Admin Test Org ${Date.now()}`,
      slug: `su-${tag}`,
      country_code: "AU",
      currency_code: "AUD",
      contact_email: user.email,
      status: "active",
    })
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = tenant.id;

  // Mark org setup as completed.
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

  // Link user to tenant and grant ONLY super_admin.
  await admin
    .from("profiles")
    .update({ tenant_id: tenantId })
    .eq("id", user.id);

  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "super_admin", tenant_id: tenantId });
});

test.afterAll(async () => {
  if (tenantId) {
    await admin.from("user_roles").delete().eq("tenant_id", tenantId);
    await admin.from("tenants").delete().eq("id", tenantId);
  }
  if (user?.id) await deleteUser(user.id);
});

test("super_admin can access all org admin pages", async ({ page }) => {
  await signInViaUI(page, user);

  // Platform admin should land on dashboard (or stay if already there).
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe("/dashboard");

  // DB-level role check
  const { data: hasSuperAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "super_admin",
  });
  expect(hasSuperAdmin).toBe(true);

  // Verify the user does NOT have org_admin (this test is specifically
  // about super_admin privilege, not org_admin).
  const { data: hasOrgAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "org_admin",
  });
  expect(hasOrgAdmin).toBe(false);

  // ---- /org/analytics: renders real UI, NOT Forbidden ----
  await page.goto("/org/analytics");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: /analytics/i }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/forbidden/i).first()).toHaveCount(0);

  // ---- /org/reports: renders real UI, NOT Forbidden ----
  await page.goto("/org/reports");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: /reports/i }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/forbidden/i).first()).toHaveCount(0);

  // ---- /org/invitations: renders invite UI, NOT redirect to /dashboard ----
  await page.goto("/org/invitations");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  expect(new URL(page.url()).pathname).toBe("/org/invitations");
  await expect(page.getByText(/forbidden/i).first()).toHaveCount(0);
  // The "send invitation" admin control should be present.
  await expect(
    page.getByRole("button", { name: /send invitation/i }),
  ).toBeVisible({ timeout: 10_000 });

  // ---- /admin/leave-types: renders config UI with create control ----
  await page.goto("/admin/leave-types");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: /leave types/i }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/forbidden/i).first()).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /new leave type/i }),
  ).toBeVisible({ timeout: 10_000 });

  // ---- /admin: super-admin console renders ----
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: /super admin/i }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/forbidden/i).first()).toHaveCount(0);
});
