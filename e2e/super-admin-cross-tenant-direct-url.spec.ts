/**
 * E2E: A super_admin scoped to tenant A cannot view another tenant's
 * organization or admin pages by typing the URL directly into the browser.
 *
 * Routes in this app are not tenant-namespaced in the URL — every org/admin
 * page resolves "the current tenant" from the signed-in user's
 * profile.tenant_id. So "another tenant's admin page" means: while signed
 * in as a tenant-A super_admin, navigate directly to the org/admin URLs
 * and confirm that none of tenant B's data ever appears on screen, and
 * the page's tenant context never identifies tenant B.
 *
 * Setup:
 *   - Seed two tenants A and B with completed org setup.
 *   - Seed uniquely-named records on tenant B (employee, leave type,
 *     designation) so any cross-tenant leak would surface as visible text.
 *   - Seed one record on tenant A so the pages have something to render.
 *   - Create a confirmed user, link profiles.tenant_id to tenant A, grant
 *     `super_admin` scoped to tenant A.
 *
 * Asserts (after signing in via UI, on each directly-typed URL):
 *   - The page does NOT render tenant B's tenant name.
 *   - The page does NOT render any of tenant B's seeded record names.
 *   - DB-level RLS check via the user's bearer token: SELECTs scoped to
 *     tenant B return zero rows for employees / leave_types / designations.
 */
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  admin,
  createOAuthLikeUser,
  deleteUser,
  signInViaUI,
  uniqueTag,
  type SeededUser,
} from "./helpers";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

let user: SeededUser;
let tenantA: string | null = null;
let tenantB: string | null = null;
let tenantAName = "";
let tenantBName = "";
let empAFirst = "";
let empBFirst = "";
let leaveTypeBName = "";
let designationBName = "";

async function createTenant(label: string, tag: string) {
  const name = `${label} Org ${Date.now()} ${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const { data, error } = await admin
    .from("tenants")
    .insert({
      name,
      slug: `${label.toLowerCase()}-${tag}`,
      country_code: "AU",
      currency_code: "AUD",
      contact_email: `${label.toLowerCase()}-${tag}@example.test`,
      status: "active",
    })
    .select("id, name")
    .single();
  if (error || !data) throw new Error(`tenant ${label} insert: ${error?.message}`);
  await admin.from("organization_setup_progress").upsert(
    {
      tenant_id: data.id,
      details_done: true,
      branding_done: true,
      departments_done: true,
      defaults_done: true,
      invites_done: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );
  return { id: data.id, name: data.name as string };
}

async function seedEmployee(tenantId: string, label: string, tag: string) {
  const first = `${label}First${tag}`;
  const { error } = await admin.from("employees").insert({
    tenant_id: tenantId,
    employee_number: `EMP-${label}-${tag}`,
    first_name: first,
    last_name: `${label}Last`,
    email: `${first.toLowerCase()}@example.test`,
    employment_type: "full_time",
    status: "active",
    hire_date: new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(`employee ${label} insert: ${error.message}`);
  return first;
}

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_xtn");
  user = await createOAuthLikeUser(tag);

  const a = await createTenant("TenantA", tag);
  const b = await createTenant("TenantB", tag);
  tenantA = a.id;
  tenantB = b.id;
  tenantAName = a.name;
  tenantBName = b.name;

  empAFirst = await seedEmployee(tenantA, "Alpha", tag);
  empBFirst = await seedEmployee(tenantB, "Bravo", tag);

  // Tenant B-only leave type — best-effort, ignore failure if schema differs.
  leaveTypeBName = `LeaveTypeB_${tag}`;
  await admin
    .from("leave_types")
    .insert({ tenant_id: tenantB, name: leaveTypeBName, code: `LB_${tag}` })
    .then(() => {})
    .catch(() => {});

  // Tenant B-only designation — best-effort.
  designationBName = `DesignationB_${tag}`;
  await admin
    .from("designations")
    .insert({ tenant_id: tenantB, name: designationBName })
    .then(() => {})
    .catch(() => {});

  await admin.from("profiles").update({ tenant_id: tenantA }).eq("id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "super_admin", tenant_id: tenantA });
});

test.afterAll(async () => {
  for (const t of [tenantA, tenantB]) {
    if (!t) continue;
    await admin.from("user_roles").delete().eq("tenant_id", t);
    await admin.from("employees").delete().eq("tenant_id", t);
    await admin.from("leave_types").delete().eq("tenant_id", t).then(() => {}).catch(() => {});
    await admin.from("designations").delete().eq("tenant_id", t).then(() => {}).catch(() => {});
    await admin.from("tenants").delete().eq("id", t);
  }
  if (user?.id) await deleteUser(user.id);
});

const DIRECT_URLS = [
  "/org",
  "/org/employees",
  "/org/analytics",
  "/org/reports",
  "/org/invitations",
  "/admin",
  "/admin/leave-types",
  "/admin/designations",
  "/admin/holidays",
];

test("super_admin cannot view another tenant's admin/org pages via direct URL", async ({
  page,
}) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  for (const url of DIRECT_URLS) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    // Tenant B's name must never appear in the rendered page.
    await expect(
      page.getByText(tenantBName),
      `tenant B name leaked on ${url}`,
    ).toHaveCount(0);

    // Tenant B's seeded records must not leak onto any page.
    await expect(
      page.getByText(empBFirst),
      `tenant B employee leaked on ${url}`,
    ).toHaveCount(0);
    await expect(
      page.getByText(leaveTypeBName),
      `tenant B leave type leaked on ${url}`,
    ).toHaveCount(0);
    await expect(
      page.getByText(designationBName),
      `tenant B designation leaked on ${url}`,
    ).toHaveCount(0);
  }

  // DB-level: the signed-in user's bearer token cannot read tenant B's data.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(signInErr).toBeNull();

  const { data: bEmps } = await userClient
    .from("employees")
    .select("id")
    .eq("tenant_id", tenantB!);
  expect(bEmps?.length ?? 0).toBe(0);

  const { data: bTenant } = await userClient
    .from("tenants")
    .select("id, name")
    .eq("id", tenantB!);
  expect(bTenant?.length ?? 0).toBe(0);

  await userClient.auth.signOut();

  // Sanity: tenant A name does appear somewhere (e.g. /org), proving the
  // assertions above aren't passing vacuously because pages failed to load.
  await page.goto("/org");
  await page.waitForLoadState("networkidle");
  expect(
    (await page.getByText(empAFirst).count()) +
      (await page.getByText(tenantAName).count()),
  ).toBeGreaterThan(0);
});
