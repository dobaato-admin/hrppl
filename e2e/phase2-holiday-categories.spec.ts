/**
 * E2E: org admin can create a tenant-scoped holiday category, add observed
 * dates to it, and the category is wired through the database for use in
 * payroll (employees / departments / tenant can reference it).
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
  const tag = uniqueTag("e2e_hcat");
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E HolCat ${tag}`, country_code: "AU", setup_completed: true } as any)
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
  await admin.from("public_holiday_categories").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("org admin can create a holiday category and add observed dates", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  const catName = `Nepal-${Date.now().toString().slice(-6)}`;

  await page.goto("/admin/holiday-categories");
  await page.waitForLoadState("networkidle");

  await page.getByTestId("add-category").click();
  // The country selector is pre-populated via the countries query; pick the first option.
  await page.getByTestId("category-name").fill(catName);
  await page.getByTestId("category-save").click();
  await expect(page.getByText(catName)).toBeVisible({ timeout: 10_000 });

  // Add an observed date.
  const row = page.getByTestId("category-row").filter({ hasText: catName });
  await row.getByTestId("add-date").click();
  const dateStr = `${new Date().getFullYear() + 1}-08-15`;
  await page.getByTestId("date-date").fill(dateStr);
  await page.getByTestId("date-name").fill("Test Holiday");
  await page.getByTestId("date-save").click();
  await expect(page.getByText("Test Holiday")).toBeVisible({ timeout: 10_000 });

  // DB assertions: category + date row exist and are tenant-scoped.
  const { data: cats } = await admin
    .from("public_holiday_categories")
    .select("id, tenant_id, name")
    .eq("tenant_id", tenantId)
    .eq("name", catName);
  expect(cats?.length).toBe(1);
  expect(cats![0].tenant_id).toBe(tenantId);

  const { data: catDates } = await admin
    .from("holiday_category_dates")
    .select("category_id, holiday_date, name")
    .eq("category_id", cats![0].id);
  expect(catDates?.length).toBe(1);
  expect(catDates![0].holiday_date).toBe(dateStr);
});
