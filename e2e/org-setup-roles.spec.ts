/**
 * E2E: Completing the org setup wizard provisions the correct roles
 * (org_admin scoped to the new tenant) and grants access to the
 * dashboard and org-admin pages with the expected permissions.
 *
 * Asserts:
 *   - A user_roles row with role='org_admin' + tenant_id=<new tenant>
 *     is created for the signing-in user.
 *   - No unexpected platform roles (super_admin / regional_admin) are
 *     granted by the wizard.
 *   - profiles.tenant_id is linked to the new tenant.
 *   - /dashboard renders without being bounced back to /org/setup or /auth.
 *   - At least one org-admin-only route (/org) is reachable.
 *   - has_role(user, 'org_admin') returns true at the DB level.
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
const createdTenantIds: string[] = [];

test.beforeAll(async () => {
  user = await createOAuthLikeUser(uniqueTag("e2e_orgroles"));
});

test.afterAll(async () => {
  if (createdTenantIds.length) {
    await admin.from("tenants").delete().in("id", createdTenantIds);
  }
  if (user?.id) await deleteUser(user.id);
});

test("org setup grants org_admin role and dashboard access", async ({ page }) => {
  const orgName = `E2E Roles Org ${Date.now()}`;

  await signInViaUI(page, user);

  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await page.getByRole("link", { name: /get started/i }).click();
  await page.waitForURL("**/org/setup", { timeout: 15_000 });

  // Step 0: details
  await page.getByLabel(/^organization name$/i).fill(orgName);
  await page.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();
  await page.getByLabel(/your title/i).fill("Founder");
  await page.getByRole("button", { name: /save & continue/i }).click();

  // Step 1: branding
  await expect(page.getByRole("heading", { name: /address & branding/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByLabel(/street address/i).fill("1 Test St");
  await page.getByLabel(/^city$/i).fill("Testville");
  await page.getByRole("button", { name: /save & continue/i }).click();

  // Step 2: departments
  await expect(page.getByRole("heading", { name: /^departments$/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /create & continue/i }).click();

  // Step 3: defaults
  await expect(page.getByRole("heading", { name: /leave & payroll defaults/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /save & continue/i }).click();

  // Step 4: invites
  await expect(page.getByRole("heading", { name: /invite your team/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /skip & finish/i }).click();

  // Landed on dashboard
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe("/dashboard");

  // Profile + tenant linkage
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  const tenantId = profile?.tenant_id as string | undefined;
  expect(tenantId).toBeTruthy();
  createdTenantIds.push(tenantId!);

  // ---------- Role assertions ----------
  const { data: roles } = await admin
    .from("user_roles")
    .select("role,tenant_id")
    .eq("user_id", user.id);

  const roleList = roles ?? [];
  const orgAdminRow = roleList.find(
    (r: any) => r.role === "org_admin" && r.tenant_id === tenantId,
  );
  expect(orgAdminRow, "expected org_admin role scoped to new tenant").toBeTruthy();

  // No platform escalation from the wizard
  expect(roleList.some((r: any) => r.role === "super_admin")).toBe(false);
  expect(roleList.some((r: any) => r.role === "regional_admin")).toBe(false);

  // DB-side has_role check
  const { data: hasOrgAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "org_admin",
  });
  expect(hasOrgAdmin).toBe(true);

  // ---------- Permission smoke: org_admin can reach /org ----------
  await page.goto("/org");
  await page.waitForLoadState("networkidle");
  // Must not be bounced to /auth or back through /org/setup
  const path = new URL(page.url()).pathname;
  expect(path.startsWith("/org")).toBe(true);
  expect(path).not.toBe("/org/setup");

  // ---------- Permission smoke: /dashboard stays accessible ----------
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  expect(new URL(page.url()).pathname).toBe("/dashboard");
});
