/**
 * E2E: A super_admin user signed into the app sees data scoped to their
 * own tenant on tenant-scoped admin pages, and does NOT see another
 * tenant's data leak through.
 *
 * Even though the `super_admin` role grants broad platform privileges,
 * tenant-scoped UI pages (e.g. /org/employees) load data via the user's
 * profile.tenant_id. This test guards against accidental cross-tenant
 * data exposure on those pages.
 *
 * Setup:
 *   - Seed two tenants (A and B) with one uniquely-named employee each.
 *   - Seed a confirmed user, link profiles.tenant_id to tenant A, and
 *     grant the `super_admin` role scoped to tenant A.
 *   - Mark org setup completed on tenant A so AuthRouteGate does not
 *     funnel the user through /org/setup.
 *
 * Asserts:
 *   - /org/employees lists tenant A's employee.
 *   - /org/employees does NOT list tenant B's employee.
 *   - The org header / context on /org/employees identifies tenant A,
 *     not tenant B.
 *   - DB-level employee SELECT through the user's session is filtered
 *     to tenant A only (verified via the publishable-key client with
 *     the user's bearer token).
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
let employeeAFirst = "";
let employeeBFirst = "";

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
  const last = `${label}Last`;
  const { error } = await admin.from("employees").insert({
    tenant_id: tenantId,
    employee_number: `EMP-${label}-${tag}`,
    first_name: first,
    last_name: last,
    email: `${first.toLowerCase()}@example.test`,
    employment_type: "full_time",
    status: "active",
    hire_date: new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(`employee ${label} insert: ${error.message}`);
  return first;
}

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_sus");
  user = await createOAuthLikeUser(tag);

  const a = await createTenant("TenantA", tag);
  const b = await createTenant("TenantB", tag);
  tenantA = a.id;
  tenantB = b.id;
  tenantAName = a.name;
  tenantBName = b.name;

  employeeAFirst = await seedEmployee(tenantA, "Alpha", tag);
  employeeBFirst = await seedEmployee(tenantB, "Bravo", tag);

  // Link the super_admin user ONLY to tenant A.
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
    await admin.from("tenants").delete().eq("id", t);
  }
  if (user?.id) await deleteUser(user.id);
});

test("super_admin sees only their own tenant's data on tenant-scoped pages", async ({
  page,
}) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  // Sanity: role is super_admin.
  const { data: hasSuperAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "super_admin",
  });
  expect(hasSuperAdmin).toBe(true);

  // ---- /org/employees: tenant A employee visible, tenant B employee NOT ----
  await page.goto("/org/employees");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(employeeAFirst).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(employeeBFirst)).toHaveCount(0);

  // Tenant identification on the page should reference tenant A, not B.
  await expect(page.getByText(tenantBName)).toHaveCount(0);

  // ---- DB-level check using the signed-in user's bearer token ----
  // Confirms RLS + tenant scoping: the user's session can only see
  // tenant A employees, never tenant B's.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(signInErr).toBeNull();

  const { data: aRows, error: aErr } = await userClient
    .from("employees")
    .select("id, first_name, tenant_id")
    .eq("tenant_id", tenantA!);
  expect(aErr).toBeNull();
  expect(aRows?.some((r) => r.first_name === employeeAFirst)).toBe(true);

  const { data: bRows } = await userClient
    .from("employees")
    .select("id, first_name, tenant_id")
    .eq("tenant_id", tenantB!);
  // The user's profile.tenant_id is tenant A, so a tenant-B-scoped query
  // through the app's normal data path must return zero rows for them.
  expect(bRows?.length ?? 0).toBe(0);

  await userClient.auth.signOut();
});
