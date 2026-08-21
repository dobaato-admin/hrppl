/**
 * E2E: forced token refresh does not blank the UI.
 *
 * Expires the Supabase access token in localStorage and triggers a
 * navigation. The session should auto-refresh; the page must not show a
 * full-screen spinner or redirect to /auth.
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
  const tag = uniqueTag("e2e_refresh");
  const { data: tenant, error } = await admin
    .from("tenants")
    .insert({ name: `Refresh Org ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (error || !tenant) throw new Error(`tenant: ${error?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "Refresh Admin", tenant_id: tenantId } as any,
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

test("expired access token: session refresh keeps user signed in", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL(/\/(dashboard|me\/security)/, { timeout: 15_000 });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  // Tamper with the supabase session token so the next call must refresh.
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          parsed.expires_at = Math.floor(Date.now() / 1000) - 60;
          parsed.expires_in = -60;
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {}
      }
    }
  });

  // Navigate to another protected route. We must NOT end up at /auth.
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");
  expect(page.url()).not.toMatch(/\/auth(\?|$)/);

  const blockedGate = page.locator("div.min-h-screen >> svg.animate-spin");
  await expect(blockedGate).toHaveCount(0, { timeout: 3_000 });
});
