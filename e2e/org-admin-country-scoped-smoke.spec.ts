/**
 * E2E smoke: an org_admin must be able to open the country-scoped admin
 * pages (Public Holidays, Overtime & Penalty Rates, Payroll Settings,
 * Payslip Templates) for THEIR tenant's country without hitting
 * "Forbidden" or being redirected to /dashboard. Locks in tenant-scoped
 * authorization so a future RBAC tweak can't silently strip these.
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

const COUNTRY_SCOPED_ROUTES = [
  { path: "/admin/teams", heading: /team members/i },
  { path: "/admin/holidays", heading: /public holidays/i },
  { path: "/admin/overtime-rates", heading: /overtime.*penalty rates/i },
  { path: "/admin/payroll-settings", heading: /payroll settings/i },
  { path: "/admin/payslip-templates", heading: /payslip templates/i },
];

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_orgadm_country");
  user = await createOAuthLikeUser(tag);

  const { data: tenant, error } = await admin
    .from("tenants")
    .insert({
      name: `Org Admin Country ${Date.now()}`,
      slug: `oac-${tag}`,
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
      details_done: true,
      branding_done: true,
      departments_done: true,
      defaults_done: true,
      invites_done: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );

  await admin.from("profiles").update({ tenant_id: tenantId }).eq("id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId });
});

test.afterAll(async () => {
  if (tenantId) {
    await admin.from("user_roles").delete().eq("tenant_id", tenantId);
    await admin.from("tenants").delete().eq("id", tenantId);
  }
  if (user?.id) await deleteUser(user.id);
});

for (const route of COUNTRY_SCOPED_ROUTES) {
  test(`org_admin can open ${route.path} without permission errors`, async ({ page }) => {
    await signInViaUI(page, user);
    await page.waitForURL("**/dashboard", { timeout: 20_000 });

    await page.goto(route.path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const url = new URL(page.url()).pathname;
    expect(
      url === route.path || url.startsWith(route.path),
      `expected to stay on ${route.path}, landed on ${url}`,
    ).toBe(true);

    await expect(page.getByText(/^forbidden\.?$/i)).toHaveCount(0);
    await expect(page.getByText(/admin access required/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible({
      timeout: 10_000,
    });
  });
}
