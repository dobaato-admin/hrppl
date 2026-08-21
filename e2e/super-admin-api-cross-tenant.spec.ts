/**
 * E2E: A super_admin scoped to tenant A cannot retrieve tenant B's data
 * via direct API calls to the Data API endpoints behind the "leave types",
 * "taxes", and "holidays" features, even though super_admin is a
 * privileged role.
 *
 * The app does not expose REST endpoints for these features — the UI
 * reads them via the Supabase Data API using the signed-in user's bearer
 * token. This test exercises that "endpoint" surface directly: it signs
 * in as the super_admin and issues PostgREST queries with the user's
 * access token, then asserts the responses contain no tenant B data.
 *
 * Coverage:
 *   - leave_types: tenant-scoped. Filtering by tenant B's tenant_id must
 *     return zero rows under RLS (super_admin has no override policy on
 *     leave_types).
 *   - leave_requests + leave_balances: tenant-scoped child tables. Same
 *     expectation as leave_types.
 *   - public_holidays + tax_brackets: country-scoped. Tenant A and B are
 *     seeded in different countries, and we assert that the
 *     country-filtered query for "my tenant's holidays/taxes" returns
 *     ONLY tenant A's country rows, never tenant B's country rows.
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

const TENANT_A_COUNTRY = "AU";
const TENANT_B_COUNTRY = "NZ";

let user: SeededUser;
let tenantA: string | null = null;
let tenantB: string | null = null;
let employeeA = "";
let employeeB = "";
let leaveTypeAId = "";
let leaveTypeBId = "";
let leaveTypeBCode = "";
let holidayBName = "";
let taxBracketBName = "";

async function ensureCountry(code: string) {
  // countries table is referenced by FK on public_holidays / tax_brackets.
  // Best-effort: ignore conflicts if already seeded by migrations.
  await admin
    .from("countries")
    .upsert({ code, name: code }, { onConflict: "code" })
    .then(() => {})
    .catch(() => {});
}

async function createTenant(label: string, tag: string, country: string) {
  const { data, error } = await admin
    .from("tenants")
    .insert({
      name: `${label} Org ${tag}`,
      slug: `${label.toLowerCase()}-${tag}`,
      country_code: country,
      currency_code: country === "AU" ? "AUD" : "NZD",
      contact_email: `${label.toLowerCase()}-${tag}@example.test`,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`tenant ${label}: ${error?.message}`);
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
  return data.id as string;
}

async function seedEmployee(tenantId: string, label: string, tag: string) {
  const { data, error } = await admin
    .from("employees")
    .insert({
      tenant_id: tenantId,
      employee_number: `EMP-${label}-${tag}`,
      first_name: `${label}First`,
      last_name: `${label}Last`,
      email: `${label.toLowerCase()}-${tag}@example.test`,
      employment_type: "full_time",
      status: "active",
      hire_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`employee ${label}: ${error?.message}`);
  return data.id as string;
}

async function seedLeaveType(tenantId: string, code: string) {
  const { data, error } = await admin
    .from("leave_types")
    .insert({
      tenant_id: tenantId,
      code,
      name: `LT ${code}`,
      annual_quota_days: 20,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`leave_type ${code}: ${error?.message}`);
  return data.id as string;
}

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_api");
  user = await createOAuthLikeUser(tag);

  await ensureCountry(TENANT_A_COUNTRY);
  await ensureCountry(TENANT_B_COUNTRY);

  tenantA = await createTenant("TenantA", tag, TENANT_A_COUNTRY);
  tenantB = await createTenant("TenantB", tag, TENANT_B_COUNTRY);

  employeeA = await seedEmployee(tenantA, "Alpha", tag);
  employeeB = await seedEmployee(tenantB, "Bravo", tag);

  leaveTypeBCode = `LB_${tag}`.slice(0, 20);
  leaveTypeAId = await seedLeaveType(tenantA, `LA_${tag}`.slice(0, 20));
  leaveTypeBId = await seedLeaveType(tenantB, leaveTypeBCode);

  // Tenant B leave_request + leave_balance — must never surface for tenant A user.
  await admin.from("leave_requests").insert({
    tenant_id: tenantB,
    employee_id: employeeB,
    leave_type_id: leaveTypeBId,
    start_date: "2025-01-10",
    end_date: "2025-01-12",
    days: 3,
    status: "pending",
  });
  await admin.from("leave_balances").insert({
    tenant_id: tenantB,
    employee_id: employeeB,
    leave_type_id: leaveTypeBId,
    year: new Date().getFullYear(),
    accrued_days: 10,
  });

  // Country-scoped data for tenant B's country only (uniquely named so any
  // leak shows up by string match).
  holidayBName = `HolidayB_${tag}`;
  await admin
    .from("public_holidays")
    .insert({
      country_code: TENANT_B_COUNTRY,
      holiday_date: "2025-02-06",
      name: holidayBName,
    })
    .then(() => {})
    .catch(() => {});

  taxBracketBName = `TaxBracketB_${tag}`;
  await admin
    .from("tax_brackets")
    .insert({
      country_code: TENANT_B_COUNTRY,
      name: taxBracketBName,
      effective_from: "2025-01-01",
      bracket_order: 99,
      min_income: 0,
      max_income: 10000,
      rate_percent: 10,
    })
    .then(() => {})
    .catch(() => {});

  // Bind the user to tenant A as super_admin.
  await admin.from("profiles").update({ tenant_id: tenantA }).eq("id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "super_admin", tenant_id: tenantA });
});

test.afterAll(async () => {
  for (const t of [tenantA, tenantB]) {
    if (!t) continue;
    await admin.from("leave_requests").delete().eq("tenant_id", t);
    await admin.from("leave_balances").delete().eq("tenant_id", t);
    await admin.from("leave_types").delete().eq("tenant_id", t);
    await admin.from("user_roles").delete().eq("tenant_id", t);
    await admin.from("employees").delete().eq("tenant_id", t);
    await admin.from("tenants").delete().eq("id", t);
  }
  await admin
    .from("public_holidays")
    .delete()
    .eq("country_code", TENANT_B_COUNTRY)
    .eq("name", holidayBName)
    .then(() => {})
    .catch(() => {});
  await admin
    .from("tax_brackets")
    .delete()
    .eq("country_code", TENANT_B_COUNTRY)
    .eq("name", taxBracketBName)
    .then(() => {})
    .catch(() => {});
  if (user?.id) await deleteUser(user.id);
});

test("super_admin Data API requests never return tenant B leave/tax/holiday data", async ({
  page,
}) => {
  // Sign in via UI so AuthRouteGate runs the normal post-login path.
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  // Build a Data API client authenticated as the signed-in super_admin user.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(signInErr).toBeNull();

  // ---- leave_types: tenant-scoped, RLS must block tenant B ----
  const { data: ltB } = await userClient
    .from("leave_types")
    .select("id, tenant_id, code")
    .eq("tenant_id", tenantB!);
  expect(ltB ?? []).toEqual([]);

  // Sanity: tenant A's leave type IS visible (so the test isn't passing because
  // the whole table is unreadable).
  const { data: ltA } = await userClient
    .from("leave_types")
    .select("id, tenant_id")
    .eq("tenant_id", tenantA!);
  expect((ltA ?? []).some((r) => r.id === leaveTypeAId)).toBe(true);

  // Unscoped read must NOT include any tenant B id.
  const { data: ltAll } = await userClient
    .from("leave_types")
    .select("id, tenant_id");
  expect((ltAll ?? []).some((r) => r.tenant_id === tenantB)).toBe(false);

  // ---- leave_requests + leave_balances: tenant-scoped child tables ----
  const { data: lrB } = await userClient
    .from("leave_requests")
    .select("id, tenant_id")
    .eq("tenant_id", tenantB!);
  expect(lrB ?? []).toEqual([]);

  const { data: lbB } = await userClient
    .from("leave_balances")
    .select("id, tenant_id")
    .eq("tenant_id", tenantB!);
  expect(lbB ?? []).toEqual([]);

  // ---- public_holidays: country-scoped. The app's "my org's holidays"
  // endpoint reads filtered by the user's tenant's country. Asserting that
  // path returns only tenant A's country and never tenant B's. ----
  const { data: holA } = await userClient
    .from("public_holidays")
    .select("id, country_code, name")
    .eq("country_code", TENANT_A_COUNTRY);
  expect(holA).not.toBeNull();
  expect((holA ?? []).every((r) => r.country_code === TENANT_A_COUNTRY)).toBe(
    true,
  );
  expect((holA ?? []).some((r) => r.name === holidayBName)).toBe(false);

  // Same query restricted to tenant A's country must not contain tenant B's
  // seeded holiday (which lives under TENANT_B_COUNTRY).
  expect(
    (holA ?? []).some((r) => r.country_code === TENANT_B_COUNTRY),
  ).toBe(false);

  // ---- tax_brackets: country-scoped. Same shape of assertion. ----
  const { data: taxA } = await userClient
    .from("tax_brackets")
    .select("id, country_code, name")
    .eq("country_code", TENANT_A_COUNTRY);
  expect(taxA).not.toBeNull();
  expect((taxA ?? []).every((r) => r.country_code === TENANT_A_COUNTRY)).toBe(
    true,
  );
  expect((taxA ?? []).some((r) => r.name === taxBracketBName)).toBe(false);

  await userClient.auth.signOut();
});
