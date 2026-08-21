/**
 * E2E: After a fresh signup, walking through /org/setup must persist
 * organization details, address, tax identifiers, and the creator's
 * owner/admin role in the database.
 *
 * Contract verified end-to-end:
 *   1. Sign in as a tenantless user → /welcome
 *   2. Click "Get started" → /org/setup
 *   3. Fill step 0 (Organization details) including:
 *        - name, legal name, primary contact name, owner job title
 *        - country, contact email, contact phone
 *        - registration number, tax id number
 *      → tenants row created with all those fields populated
 *      → profiles.tenant_id linked
 *      → user_roles has org_admin for the new tenant
 *      → employees row created for the creator (owner record)
 *   4. Fill step 1 (Address & branding):
 *        - address_line1/2, city, region, postal_code, website, tagline
 *      → tenants row updated with the address + branding fields
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
  user = await createOAuthLikeUser(uniqueTag("e2e_orgpersist"));
});

test.afterAll(async () => {
  if (createdTenantIds.length) {
    await admin.from("tenants").delete().in("id", createdTenantIds);
  }
  if (user?.id) await deleteUser(user.id);
});

test("org setup persists details, address, tax, and owner/admin role", async ({ page }) => {
  const orgName = `E2E Persist Org ${Date.now()}`;
  const legalName = `${orgName} Pty Ltd`;
  const primaryContact = "Jane Owner";
  const ownerTitle = "Managing Director";
  const contactPhone = "+61400111222";
  const registrationNumber = "REG-1234567";
  const taxId = "ABN-98765432101";

  const address1 = "123 Test Lane";
  const address2 = "Suite 5";
  const city = "Sydney";
  const region = "NSW";
  const postal = "2000";
  const website = "https://example.test";
  const tagline = "Testing persistence end-to-end";

  await signInViaUI(page, user);

  // No tenant → /welcome → click into setup
  await page.waitForURL("**/welcome", { timeout: 20_000 });
  await page.getByRole("link", { name: /get started/i }).click();
  await page.waitForURL("**/org/setup", { timeout: 15_000 });

  // ---------- Step 0: Organization details ----------
  await page.getByLabel(/^organization name$/i).fill(orgName);
  await page.getByLabel(/legal business name/i).fill(legalName);
  await page.getByLabel(/primary contact name/i).fill(primaryContact);

  // Country select (Radix) — pick the first available country
  await page.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();

  await page.getByLabel(/contact phone/i).fill(contactPhone);
  await page.getByLabel(/your title/i).fill(ownerTitle);
  // contact email is pre-filled; leave it as-is.
  await page.getByLabel(/business registration number/i).fill(registrationNumber);
  await page.getByLabel(/tax id/i).fill(taxId);

  await page.getByRole("button", { name: /save & continue/i }).click();

  // Advanced to step 1
  await expect(
    page.getByRole("heading", { name: /address & branding/i }),
  ).toBeVisible({ timeout: 20_000 });

  // ---------- Assert step 0 persistence ----------
  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  expect(profile?.tenant_id).toBeTruthy();
  const tenantId = profile!.tenant_id as string;
  createdTenantIds.push(tenantId);

  const { data: tenant } = await admin
    .from("tenants")
    .select(
      "id,name,legal_name,primary_contact_name,country_code,currency_code,contact_email,contact_phone,registration_number,tax_id_number,status",
    )
    .eq("id", tenantId)
    .single();
  expect(tenant?.name).toBe(orgName);
  expect(tenant?.legal_name).toBe(legalName);
  expect(tenant?.primary_contact_name).toBe(primaryContact);
  expect(tenant?.contact_phone).toBe(contactPhone);
  expect(tenant?.registration_number).toBe(registrationNumber);
  expect(tenant?.tax_id_number).toBe(taxId);
  expect(tenant?.country_code).toBeTruthy();
  expect(tenant?.currency_code).toBeTruthy();
  expect(tenant?.contact_email).toBeTruthy();
  expect(tenant?.status).toBe("active");

  // Owner/admin role assigned for this tenant
  const { data: roles } = await admin
    .from("user_roles")
    .select("role,tenant_id")
    .eq("user_id", user.id);
  expect(
    roles?.some((r) => r.role === "org_admin" && r.tenant_id === tenantId),
  ).toBe(true);

  // Creator's employee record exists
  const { data: employee } = await admin
    .from("employees")
    .select("id,tenant_id,user_id,job_title,status")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  expect(employee).toBeTruthy();
  expect(employee?.status).toBe("active");
  expect(employee?.job_title).toBe(ownerTitle);

  // ---------- Step 1: Address & branding ----------
  await page.getByLabel(/street address/i).fill(address1);
  await page.getByLabel(/address line 2/i).fill(address2);
  await page.getByLabel(/^city$/i).fill(city);
  await page.getByLabel(/state \/ region/i).fill(region);
  await page.getByLabel(/postal code/i).fill(postal);
  await page.getByLabel(/website/i).fill(website);
  await page.getByLabel(/short tagline/i).fill(tagline);

  await page.getByRole("button", { name: /save & continue/i }).click();

  // Advanced to step 2 (Departments)
  await expect(
    page.getByRole("heading", { name: /departments/i }),
  ).toBeVisible({ timeout: 20_000 });

  // ---------- Assert step 1 persistence ----------
  const { data: tenantAfter } = await admin
    .from("tenants")
    .select("address_line1,address_line2,city,region,postal_code,website,tagline")
    .eq("id", tenantId)
    .single();
  expect(tenantAfter?.address_line1).toBe(address1);
  expect(tenantAfter?.address_line2).toBe(address2);
  expect(tenantAfter?.city).toBe(city);
  expect(tenantAfter?.region).toBe(region);
  expect(tenantAfter?.postal_code).toBe(postal);
  expect(tenantAfter?.website).toBe(website);
  expect(tenantAfter?.tagline).toBe(tagline);

  // Setup progress reflects completed steps
  const { data: progress } = await admin
    .from("organization_setup_progress")
    .select("details_done,branding_done")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  expect(progress?.details_done).toBe(true);
  expect(progress?.branding_done).toBe(true);
});
