/**
 * E2E: A signed-in employee without admin privileges must not be able to reach
 * any of the representative /admin/* admin routes. Each route should either
 * redirect to /dashboard (AdminGate) or render a Forbidden state.
 *
 * Complements the static admin-routes-block.test.ts vitest suite.
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

const ROUTES = [
  "/admin/assets",
  "/admin/biometric",
  "/admin/geofences",
  "/admin/medical",
  "/admin/security",
];

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_adminblock");
  user = await createOAuthLikeUser(tag);

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({
      name: `Admin Block Test Org ${Date.now()}`,
      slug: `adminblock-${tag}`,
      country_code: "AU",
      currency_code: "AUD",
      contact_email: user.email,
      status: "active",
    })
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = tenant.id;

  await admin.from("organization_setup_progress").upsert(
    {
      tenant_id: tenantId,
      details_done: true, branding_done: true, departments_done: true,
      defaults_done: true, invites_done: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );

  await admin.from("profiles").update({ tenant_id: tenantId }).eq("id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin.from("user_roles").insert({ user_id: user.id, role: "employee", tenant_id: tenantId });
});

test.afterAll(async () => {
  if (tenantId) {
    await admin.from("user_roles").delete().eq("tenant_id", tenantId);
    await admin.from("tenants").delete().eq("id", tenantId);
  }
  if (user?.id) await deleteUser(user.id);
});

test("employee user is blocked from every representative /admin/* route", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800); // allow AdminGate's effect-driven redirect to fire

    const path = new URL(page.url()).pathname;
    const redirected = path === "/dashboard" || path === "/auth";
    const forbiddenVisible = await page
      .getByText(/forbidden|not authorized|super admin only/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(
      redirected || forbiddenVisible,
      `expected ${route} to redirect or show forbidden — landed on ${path}`,
    ).toBe(true);
  }
});
