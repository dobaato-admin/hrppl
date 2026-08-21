/**
 * E2E: tab focus and back-navigation never re-blocks the UI.
 *
 * Regression coverage for "pages take time to load when switching back to
 * the tab". After AuthRouteGate cached org status, returning to the tab or
 * navigating Back should restore the previous view instantly, not blank
 * out on a spinner.
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
let tenantId = "";

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_focus");
  const { data: tenant, error } = await admin
    .from("tenants")
    .insert({ name: `Focus Org ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (error || !tenant) throw new Error(`tenant: ${error?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "Focus Admin", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId } as any);
});

test.afterAll(async () => {
  if (user) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("returning to tab does not re-block the UI", async ({ page, context }) => {
  await signInViaUI(page, user);
  await page.waitForURL(/\/(dashboard|me\/security)/, { timeout: 15_000 });

  // Force MFA-allowed state by navigating to dashboard (gate caches status).
  await page.goto("/dashboard");
  // Allow gate to cache.
  await page.waitForLoadState("networkidle");

  // Simulate tab blur + focus through visibilitychange.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  // Open a second tab to truly background the first.
  const other = await context.newPage();
  await other.goto("about:blank");
  await page.waitForTimeout(1000);
  await page.bringToFront();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  // After returning, the main app shell must remain visible — no full-screen
  // spinner replaces it. The blocked-gate UI uses an animated Loader2 that
  // occupies the full viewport; assert it does NOT appear.
  const blockedGate = page.locator("div.min-h-screen >> svg.animate-spin");
  await expect(blockedGate).toHaveCount(0, { timeout: 2_000 });

  await other.close();
});

test("back navigation restores the previous view instantly", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL(/\/(dashboard|me\/security)/, { timeout: 15_000 });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");

  const start = Date.now();
  await page.goBack();
  // The previous /dashboard view should be visible quickly via cached match.
  await page.waitForURL(/\/dashboard/, { timeout: 5_000 });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(3000);

  const blockedGate = page.locator("div.min-h-screen >> svg.animate-spin");
  await expect(blockedGate).toHaveCount(0, { timeout: 1_500 });
});
