/**
 * E2E: Completing the org setup wizard creates the organization and
 * redirects the user to /dashboard.
 *
 * Walks all 5 steps (details → branding → departments → defaults →
 * invites/skip), then asserts:
 *   - URL is /dashboard
 *   - The tenant exists for the signed-in user
 *   - organization_setup_progress.completed_at is set
 *   - AuthRouteGate does NOT bounce the user back to /org/setup
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
  user = await createOAuthLikeUser(uniqueTag("e2e_orgcomplete"));
});

test.afterAll(async () => {
  if (createdTenantIds.length) {
    await admin.from("tenants").delete().in("id", createdTenantIds);
  }
  if (user?.id) await deleteUser(user.id);
});

test("completing org setup wizard creates org and redirects to /dashboard", async ({ page }) => {
  const orgName = `E2E Complete Org ${Date.now()}`;

  await signInViaUI(page, user);

  // Tenantless → /welcome → setup
  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await page.getByRole("link", { name: /get started/i }).click();
  await page.waitForURL("**/org/setup", { timeout: 15_000 });

  // ---------- Step 0: details ----------
  await page.getByLabel(/^organization name$/i).fill(orgName);
  await page.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();
  await page.getByLabel(/your title/i).fill("Founder");
  await page.getByRole("button", { name: /save & continue/i }).click();

  // ---------- Step 1: address & branding ----------
  await expect(page.getByRole("heading", { name: /address & branding/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByLabel(/street address/i).fill("1 Test St");
  await page.getByLabel(/^city$/i).fill("Testville");
  await page.getByRole("button", { name: /save & continue/i }).click();

  // ---------- Step 2: departments ----------
  await expect(page.getByRole("heading", { name: /^departments$/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /create & continue/i }).click();

  // ---------- Step 3: leave & payroll defaults ----------
  await expect(page.getByRole("heading", { name: /leave & payroll defaults/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /save & continue/i }).click();

  // ---------- Step 4: invites — skip & finish ----------
  await expect(page.getByRole("heading", { name: /invite your team/i }))
    .toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /skip & finish/i }).click();

  // ---------- Should land on /dashboard ----------
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe("/dashboard");

  // ---------- DB assertions ----------
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  const tenantId = profile?.tenant_id as string | undefined;
  expect(tenantId).toBeTruthy();
  createdTenantIds.push(tenantId!);

  const { data: tenant } = await admin
    .from("tenants")
    .select("id,name,status")
    .eq("id", tenantId!)
    .single();
  expect(tenant?.name).toBe(orgName);
  expect(tenant?.status).toBe("active");

  const { data: progress } = await admin
    .from("organization_setup_progress")
    .select("details_done,branding_done,departments_done,defaults_done,invites_done,completed_at")
    .eq("tenant_id", tenantId!)
    .maybeSingle();
  expect(progress?.details_done).toBe(true);
  expect(progress?.branding_done).toBe(true);
  expect(progress?.departments_done).toBe(true);
  expect(progress?.defaults_done).toBe(true);
  expect(progress?.invites_done).toBe(true);
  expect(progress?.completed_at).toBeTruthy();

  // ---------- AuthRouteGate must not bounce back to /org/setup ----------
  await page.waitForTimeout(1500);
  expect(new URL(page.url()).pathname).toBe("/dashboard");
});
