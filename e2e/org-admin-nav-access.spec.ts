/**
 * E2E: An org_admin user must be able to reach every Organization-section
 * route from the sidebar without seeing a "Forbidden" state or being
 * redirected away. Locks in nav-level access so a future RBAC tweak can't
 * silently strip an org_admin's customization screens.
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

const ORG_ROUTES = [
  "/org",
  "/org/invitations",
  "/admin/teams",
  "/admin/team-assignments",
  "/admin/departments",
  "/org/setup",
  "/org/documents",
  "/org/expenses",
  "/org/recruitment",
  "/admin/designations",
  "/admin/leave-types",
  "/admin/holiday-categories",
  "/admin/holidays",
  "/org/promotions",
  "/org/pay-rates",
  "/admin/overtime-rates",
  "/admin/payroll-setup",
  "/admin/payroll-settings",
  "/admin/payslip-templates",
  "/org/training",
  "/admin/training",
  "/admin/feedback-templates",
  "/admin/review-templates",
  "/admin/discipline",
  "/admin/medical",
  "/admin/assets",
  "/admin/offboarding",
  "/admin/biometric",
  "/admin/geofences",
];

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_orgadmnav");
  user = await createOAuthLikeUser(tag);

  const { data: tenant, error } = await admin
    .from("tenants")
    .insert({
      name: `Org Admin Nav ${Date.now()}`,
      slug: `oan-${tag}`,
      country_code: "AU",
      currency_code: "AUD",
      contact_email: user.email,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !tenant) throw new Error(`tenant insert: ${error?.message}`);
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
  await admin.from("user_roles").insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId });
});

test.afterAll(async () => {
  if (tenantId) {
    await admin.from("user_roles").delete().eq("tenant_id", tenantId);
    await admin.from("tenants").delete().eq("id", tenantId);
  }
  if (user?.id) await deleteUser(user.id);
});

test("org_admin can reach every Organization route", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  for (const path of ORG_ROUTES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    const url = new URL(page.url()).pathname;
    expect(
      url === path || url.startsWith(path),
      `expected to stay on ${path}, landed on ${url}`,
    ).toBe(true);
    await expect(page.getByText(/^forbidden\.?$/i)).toHaveCount(0);
  }
});

test("organization navigation is grouped and stays within grouped flyout sections", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  await page.getByRole("button", { name: /organization/i }).click();

  await expect(page.getByText(/^team$/i)).toBeVisible();
  await expect(page.getByText(/^leave$/i)).toBeVisible();
  await expect(page.getByText(/^payroll$/i)).toBeVisible();
  await expect(page.getByText(/^operations$/i)).toBeVisible();
  await expect(page.getByText(/^compliance$/i)).toBeVisible();

  await page.getByText(/^payroll$/i).click();
  await expect(page.getByRole("link", { name: /payroll setup/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /payslip templates/i })).toBeVisible();
});
