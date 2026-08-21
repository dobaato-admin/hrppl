/**
 * E2E Phase 4: org admin can configure pay period & working hours, then add
 * a payroll component (PF 8%) and toggle/show it on payslip.
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
  const tag = uniqueTag("e2e_payroll_setup");
  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Payroll ${tag}`, country_code: "AU", setup_completed: true } as any)
    .select("id")
    .single();
  if (tErr || !tenant) throw new Error(`tenant insert: ${tErr?.message}`);
  tenantId = (tenant as { id: string }).id;

  user = await createOAuthLikeUser(tag);
  await admin.from("profiles").upsert(
    { id: user.id, email: user.email, full_name: "Payroll Admin", tenant_id: tenantId } as any,
    { onConflict: "id" } as any,
  );
  await admin.from("user_roles").insert({ user_id: user.id, role: "org_admin", tenant_id: tenantId } as any);
});

test.afterAll(async () => {
  await admin.from("payroll_components").delete().eq("tenant_id", tenantId);
  await admin.from("tenant_payroll_settings").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("save settings + add PF component (8% pct_of_basic)", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  await page.goto("/admin/payroll-setup");
  await page.waitForLoadState("networkidle");

  // Save default settings (fortnightly).
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Fortnightly" }).click();
  await page.getByTestId("save-payroll-settings").click();
  await expect(page.getByText("Settings saved")).toBeVisible({ timeout: 8_000 });

  const { data: settings } = await admin
    .from("tenant_payroll_settings").select("pay_period").eq("tenant_id", tenantId).maybeSingle();
  expect(settings?.pay_period).toBe("fortnightly");

  // Switch to components tab and add one
  await page.getByRole("tab", { name: /Components/ }).click();
  await page.getByTestId("add-component").click();

  await page.getByLabel("Code").fill("PF");
  await page.getByLabel("Label").fill("Provident Fund");
  // Kind defaults to allowance; pick PF
  const kindCombo = page.getByRole("combobox").nth(0); // Kind in dialog
  await kindCombo.click();
  await page.getByRole("option", { name: "Provident fund" }).click();
  // Calc -> pct_of_basic
  const calcCombo = page.getByRole("combobox").nth(1);
  await calcCombo.click();
  await page.getByRole("option", { name: "% of basic" }).click();
  await page.getByLabel(/Rate/).fill("8");

  await page.getByTestId("save-component").click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 8_000 });
  await expect(page.getByTestId("component-row").filter({ hasText: "Provident Fund" })).toBeVisible();

  const { data: comps } = await admin
    .from("payroll_components").select("code, rate, calc_type, kind, is_active, show_on_payslip")
    .eq("tenant_id", tenantId);
  expect(comps?.length).toBe(1);
  expect(comps![0].code).toBe("PF");
  expect(Number(comps![0].rate)).toBeCloseTo(8, 5);
  expect(comps![0].calc_type).toBe("pct_of_basic");
  expect(comps![0].kind).toBe("pf");
  expect(comps![0].is_active).toBe(true);
  expect(comps![0].show_on_payslip).toBe(true);
});
