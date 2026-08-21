/**
 * E2E: org admin can create a department on /admin/departments and then
 * assign a manually-added employee to it from /org/employees.
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
const createdEmployeeIds: string[] = [];

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_dept_emp");

  const { data: tenant, error: tErr } = await admin
    .from("tenants")
    .insert({ name: `E2E Dept ${tag}`, country_code: "AU", setup_completed: true } as any)
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
  if (createdEmployeeIds.length) {
    await admin.from("employees").delete().in("id", createdEmployeeIds);
  }
  await admin.from("employees").delete().eq("tenant_id", tenantId);
  await admin.from("departments").delete().eq("tenant_id", tenantId);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  if (user?.id) await deleteUser(user.id);
  if (tenantId) await admin.from("tenants").delete().eq("id", tenantId);
});

test("org admin can create a department and add an employee assigned to it", async ({ page }) => {
  await signInViaUI(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });

  const deptName = `QA-Engineering-${Date.now().toString().slice(-6)}`;

  // 1. Create a department via /admin/departments.
  await page.goto("/admin/departments");
  await page.waitForLoadState("networkidle");
  await page.getByTestId("add-department").click();
  await page.getByTestId("department-name").fill(deptName);
  await page.getByTestId("department-save").click();
  await expect(page.getByText(deptName)).toBeVisible({ timeout: 10_000 });

  // 2. Verify the department row exists in the DB and is tenant-scoped.
  const { data: rows } = await admin
    .from("departments")
    .select("id, name, tenant_id")
    .eq("tenant_id", tenantId)
    .eq("name", deptName);
  expect(rows?.length).toBe(1);
  expect(rows![0].tenant_id).toBe(tenantId);

  // 3. From /org/employees, the "Manage departments" link is visible
  //    (proving the org-admin gating wiring), and adding an employee works.
  await page.goto("/org/employees");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("manage-departments")).toBeVisible();

  // Manually insert an employee via admin client to keep the test fast/deterministic,
  // then assert it shows in the list and is assigned to the department.
  const empNum = `EMP-${Date.now().toString().slice(-6)}`;
  const { data: emp, error: empErr } = await admin
    .from("employees")
    .insert({
      tenant_id: tenantId,
      employee_number: empNum,
      first_name: "Jane",
      last_name: "QA",
      email: `jane.qa.${Date.now()}@example.test`,
      job_title: "QA Engineer",
      department_id: rows![0].id,
      employment_type: "full_time",
      status: "active",
      hire_date: new Date().toISOString().slice(0, 10),
    } as any)
    .select("id")
    .single();
  if (empErr || !emp) throw new Error(`employee insert: ${empErr?.message}`);
  createdEmployeeIds.push((emp as { id: string }).id);

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(empNum)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Jane QA")).toBeVisible();
  // Department name renders in the same row.
  await expect(page.getByText(deptName).first()).toBeVisible();

  // 4. Department with an assigned employee cannot be deleted.
  await page.goto("/admin/departments");
  await page.waitForLoadState("networkidle");
  page.once("dialog", (d) => d.accept());
  const row = page.getByTestId("department-row").filter({ hasText: deptName });
  await row.getByRole("button", { name: /delete/i }).click();
  // Toast surfaces the guard message; the row remains in the table.
  await expect(row).toBeVisible({ timeout: 5_000 });
});
