/**
 * E2E: signing in as a tenantless user, creating an organization through
 * the welcome → /org/setup wizard, and asserting the user lands on the
 * org setup route with the wizard advanced past "Organization details".
 *
 * This guards the happy-path contract:
 *   /auth (sign in) → /welcome (no tenant) → /org/setup (Create org CTA)
 *   → fill details → submit → still on /org/setup, step "Address & branding"
 *   active and "Organization details" marked complete.
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
let createdTenantIds: string[] = [];

test.beforeAll(async () => {
  user = await createOAuthLikeUser(uniqueTag("e2e_orgcreate"));
});

test.afterAll(async () => {
  // Best-effort cleanup of any tenants the test created.
  if (createdTenantIds.length) {
    await admin.from("tenants").delete().in("id", createdTenantIds);
  }
  if (user?.id) await deleteUser(user.id);
});

test("sign-in → create organization → redirected to /org/setup wizard next step", async ({ page }) => {
  await signInViaUI(page, user);

  // No tenant → /welcome
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  // Click "Get started" on the Create organization card
  await page.getByRole("link", { name: /get started/i }).click();
  await page.waitForURL("**/org/setup", { timeout: 15_000 });

  // Fill in organization details (step 0)
  const orgName = `E2E Test Org ${Date.now()}`;
  await page.getByLabel(/organization name/i).fill(orgName);

  // Country select (Radix Select) — open and pick the first option
  await page.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();

  // Contact email is pre-filled from the auth user; leave it.
  await page.getByRole("button", { name: /save & continue/i }).click();

  // Still on /org/setup, advanced to next step.
  await expect(page).toHaveURL(/\/org\/setup/, { timeout: 20_000 });

  // The "Address & branding" step heading must now be visible (step 1 active).
  await expect(
    page.getByRole("heading", { name: /address & branding/i }),
  ).toBeVisible({ timeout: 15_000 });

  // Track the created tenant for cleanup.
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  expect(profile?.tenant_id).toBeTruthy();
  if (profile?.tenant_id) createdTenantIds.push(profile.tenant_id);

  // The user must now have the org_admin role for this tenant.
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  expect(roles?.some((r) => r.role === "org_admin")).toBe(true);

  // Re-visiting /dashboard should not bounce them back to /welcome anymore —
  // they have a tenant and an in-progress setup, so /org/setup is the home.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/org\/setup|\/dashboard/, { timeout: 15_000 });
  expect(page.url()).not.toContain("/welcome");
});
