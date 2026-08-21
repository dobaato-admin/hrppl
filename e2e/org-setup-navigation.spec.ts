/**
 * E2E: The "Create organization" button on /org navigates to /org/setup
 * and the setup wizard renders correctly.
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
  user = await createOAuthLikeUser(uniqueTag("e2e_orgnav"));
  // Grant super_admin so the auth gate allows access to /org without a tenant.
  await admin.from("user_roles").insert({ user_id: user.id, role: "super_admin" });
});

test.afterAll(async () => {
  if (createdTenantIds.length) {
    await admin.from("tenants").delete().in("id", createdTenantIds);
  }
  if (user?.id) {
    await admin.from("user_roles").delete().eq("user_id", user.id);
    await deleteUser(user.id);
  }
});

test("Create organization button on /org navigates to /org/setup and wizard renders", async ({ page }) => {
  await signInViaUI(page, user);

  // Navigate directly to /org (super_admin bypasses the tenantless gate).
  await page.goto("/org");
  await expect(page.getByRole("heading", { name: /let's set up your organization/i })).toBeVisible({ timeout: 15_000 });

  // Click the "Create organization" button (rendered as a Link).
  await page.getByRole("link", { name: /create organization/i }).click();

  // Should land on the setup wizard.
  await page.waitForURL("**/org/setup", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /set up your organization/i })).toBeVisible({ timeout: 15_000 });

  // Verify stepper shows the first step.
  await expect(page.getByText(/organization details/i)).toBeVisible();
  await expect(page.getByText(/name, country, contact/i)).toBeVisible();
});
