/**
 * E2E: after a Google-style OAuth sign-in with no tenant and no invitation,
 * the app must route the user to the organization-creation wizard and
 * expose a working "Create organization" option.
 *
 * Why password sign-in stands in for Google: the OAuth callback puts a
 * Supabase session on the client and lands on /dashboard. From that point
 * on, all routing is driven by `getMyOrgStatus` — which only looks at
 * tenant/role/invitation state, not the auth provider. Signing in with
 * password into a seeded user with no tenant produces the identical
 * client state and exercises the same routing contract that a real
 * Google sign-up hits in production.
 */
import { test, expect } from "@playwright/test";
import { createOAuthLikeUser, deleteUser, signInViaUI, uniqueTag, type SeededUser } from "./helpers";

let user: SeededUser;

test.beforeAll(async () => {
  user = await createOAuthLikeUser(uniqueTag("e2e_gsignup"));
});

test.afterAll(async () => {
  if (user?.id) await deleteUser(user.id);
});

test("Google-style sign-in with no tenant routes to /welcome with Create organization option", async ({ page }) => {
  await signInViaUI(page, user);

  // Dashboard loader sees no tenant -> navigates to /welcome
  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /welcome to/i })).toBeVisible();

  // The "Create a new organization" card must be present with a working CTA.
  const createCard = page.locator("div", { hasText: /create a new organization/i }).first();
  await expect(createCard).toBeVisible();
  const cta = page.getByRole("link", { name: /get started/i });
  await expect(cta).toBeVisible();

  await cta.click();
  await page.waitForURL("**/org/setup", { timeout: 15_000 });
  expect(page.url()).toContain("/org/setup");
});

test("Visiting /dashboard directly with no tenant redirects to /welcome", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  // Manually re-enter the post-OAuth landing route — must redirect, not stick.
  await page.goto("/dashboard");
  await page.waitForURL("**/welcome", { timeout: 15_000 });
  await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
});

test("/org empty state also exposes a Create organization button", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/welcome", { timeout: 20_000 });

  await page.goto("/org");
  // Either redirected to /welcome or the empty state surfaces the button — both satisfy the contract.
  await page.waitForLoadState("networkidle");
  const createBtn = page.getByRole("link", { name: /create organization|get started/i }).first();
  await expect(createBtn).toBeVisible();
});
