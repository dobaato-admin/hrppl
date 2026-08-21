/**
 * E2E: the Connected sign-in methods UI on /settings/account must accurately
 * reflect the identities attached to the signed-in user. The OAuth round-trip
 * to Google itself cannot be driven from Playwright, so we attach the Google
 * identity via the admin API (the same end-state Supabase reaches at the end
 * of a successful link) and assert the UI updates correctly.
 *
 * The "no duplicate auth user" contract is covered at the data layer by
 * tests/google-identity-linking.test.ts. This spec covers the UI surface.
 */
import { test, expect } from "@playwright/test";
import { admin, createOAuthLikeUser, deleteUser, signInViaUI, uniqueTag, type SeededUser } from "./helpers";

let user: SeededUser;

test.beforeAll(async () => {
  user = await createOAuthLikeUser(uniqueTag("e2e_glink"));
});

test.afterAll(async () => {
  if (user?.id) await deleteUser(user.id);
});

test("settings/account shows Google as Not connected before linking", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await page.goto("/settings/account");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(/connected sign-in methods/i)).toBeVisible();
  // Google row exists and shows "Not connected" + a "Connect Google" button.
  const googleRow = page.locator("div", { hasText: /^Google$/ }).first();
  await expect(googleRow).toBeVisible();
  await expect(page.getByText(/not connected/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /connect google/i })).toBeVisible();
});

test("after a Google identity is attached, the UI shows Connected and an Unlink action", async ({ page }) => {
  // Simulate the end-state of a successful `linkIdentity` flow.
  const providerId = `google_e2e_${Date.now()}`;
  const { error } = await admin
    // @ts-expect-error - auth schema is not in generated types
    .schema("auth")
    .from("identities")
    .insert({
      user_id: user.id,
      provider: "google",
      provider_id: providerId,
      identity_data: {
        sub: providerId,
        email: user.email,
        email_verified: true,
        full_name: "Google E2E User",
      },
      last_sign_in_at: new Date().toISOString(),
    });
  expect(error).toBeNull();

  // Crucial: still exactly one auth user with this email after linking.
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const matches = (list?.users ?? []).filter(
    (u) => (u.email ?? "").toLowerCase() === user.email.toLowerCase(),
  );
  expect(matches).toHaveLength(1);
  expect(matches[0].id).toBe(user.id);

  await signInViaUI(page, user);
  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await page.goto("/settings/account");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(/^Connected$/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /unlink/i })).toBeVisible();
  // The "Connect Google" CTA must be gone now that it's connected.
  await expect(page.getByRole("button", { name: /connect google/i })).toHaveCount(0);
});
