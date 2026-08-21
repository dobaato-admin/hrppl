/**
 * E2E Phase 3: org admin can start a 360 review template from a recommended
 * preset, save it, archive it (removes from active list), and restore it.
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
  const tag = uniqueTag("e2e_fbtpl");
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E FbTpl ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "Org Admin", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin.from("user_roles").insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId } as any);
});

test.afterAll(async () => {
  await admin.from("feedback_question_templates").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("recommended preset → save → archive → restore", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  await page.goto("/admin/feedback-templates");
  await page.waitForLoadState("networkidle");

  // Start from a recommended preset
  await page.getByTestId("start-from-recommended").click();
  await expect(page.getByTestId("preset-card").first()).toBeVisible();
  await page.getByTestId("use-preset-peer-collaboration").click();

  // The editor should pre-populate; save with a unique name.
  const tplName = `E2E Peer ${Date.now().toString().slice(-6)}`;
  const nameField = page.getByLabel("Name");
  await nameField.fill(tplName);
  await page.getByRole("button", { name: "Save template" }).click();

  await expect(page.getByText(tplName)).toBeVisible({ timeout: 10_000 });

  // Confirm DB row is current and tenant-scoped with questions
  const { data: rows } = await admin
    .from("feedback_question_templates")
    .select("id, tenant_id, is_current, questions, name")
    .eq("tenant_id", tenantId)
    .eq("name", tplName);
  expect(rows?.length).toBe(1);
  expect(rows![0].is_current).toBe(true);
  expect(Array.isArray(rows![0].questions) && (rows![0].questions as any[]).length).toBeGreaterThan(3);

  // Archive it
  page.once("dialog", (d) => d.accept());
  await page.getByTestId("archive-template").first().click();
  await expect(page.getByText(tplName)).toHaveCount(0, { timeout: 10_000 });

  const { data: archivedRows } = await admin
    .from("feedback_question_templates")
    .select("is_current")
    .eq("tenant_id", tenantId)
    .eq("name", tplName);
  expect(archivedRows?.every((r) => r.is_current === false)).toBe(true);

  // Restore via the archived dialog
  await page.getByTestId("view-archived").click();
  await expect(page.getByTestId("archived-row").filter({ hasText: tplName })).toBeVisible();
  await page
    .getByTestId("archived-row")
    .filter({ hasText: tplName })
    .getByTestId("restore-template")
    .click();

  // Close dialog and verify back in active list
  await page.keyboard.press("Escape");
  await expect(page.getByText(tplName)).toBeVisible({ timeout: 10_000 });
});
