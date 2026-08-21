/**
 * E2E: every authed screen (rendered inside AppShell) shows a
 * "Back to dashboard" button, except /dashboard itself.
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
  const tag = uniqueTag("e2e_back_dash");

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Back Dash ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "Back Dash User", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin.from("user_roles").insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId } as any);
});

test.afterAll(async () => {
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("Back-to-dashboard button is hidden on /dashboard and visible elsewhere, and navigates home", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  // 1. On /dashboard the button is hidden.
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("back-to-dashboard")).toHaveCount(0);

  // 2. On other authed screens it is visible.
  for (const path of ["/me", "/leave", "/org", "/settings/profile"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByTestId("back-to-dashboard"),
      `expected back-to-dashboard on ${path}`,
    ).toBeVisible({ timeout: 10_000 });
  }

  // 3. Clicking it returns to /dashboard.
  await page.goto("/settings/profile");
  await page.getByTestId("back-to-dashboard").click();
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe("/dashboard");
});
