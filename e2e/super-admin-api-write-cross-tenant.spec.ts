/**
 * E2E: A super_admin scoped to tenant A cannot mutate tenant B's data via
 * direct Data API write requests against the "leave types", "taxes", and
 * "holidays" tables.
 *
 * Strategy: snapshot tenant B's rows before any write, run the writes
 * against the Data API using the signed-in super_admin's bearer token,
 * then re-snapshot and assert nothing about tenant B changed. We attempt
 * INSERT, UPDATE, and DELETE in turn. The writes are expected to be
 * rejected (RLS denial) or, in the worst case, simply not affect any row
 * — never to mutate tenant B's seeded data.
 *
 * Tables under test:
 *   - leave_types        (tenant-scoped)
 *   - public_holidays    (country-scoped; tenants A/B in different countries)
 *   - tax_brackets       (country-scoped; tenants A/B in different countries)
 */
import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

const COUNTRY_A = "AU";
const COUNTRY_B = "NZ";

let user: SeededUser;
let tenantA: string | null = null;
let tenantB: string | null = null;
let leaveTypeBId = "";
let leaveTypeBCode = "";
let leaveTypeBName = "";
let holidayBId = "";
let holidayBName = "";
let holidayBDate = "2025-02-06";
let taxBracketBId = "";
let taxBracketBName = "";

async function ensureCountry(code: string) {
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

test.beforeAll(async () => {
  const tag = uniqueTag("e2e_w");
  user = await createOAuthLikeUser(tag);

  await ensureCountry(COUNTRY_A);
  await ensureCountry(COUNTRY_B);

  tenantA = await createTenant("TenantA", tag, COUNTRY_A);
  tenantB = await createTenant("TenantB", tag, COUNTRY_B);

  leaveTypeBCode = `LB_${tag}`.slice(0, 20);
  leaveTypeBName = `LeaveTypeB ${tag}`;
  {
    const { data, error } = await admin
      .from("leave_types")
      .insert({
        tenant_id: tenantB,
        code: leaveTypeBCode,
        name: leaveTypeBName,
        annual_quota_days: 20,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`leave_type B: ${error?.message}`);
    leaveTypeBId = data.id;
  }

  holidayBName = `HolidayB_${tag}`;
  {
    const { data, error } = await admin
      .from("public_holidays")
      .insert({
        country_code: COUNTRY_B,
        holiday_date: holidayBDate,
        name: holidayBName,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`holiday B: ${error?.message}`);
    holidayBId = data.id;
  }

  taxBracketBName = `TaxB_${tag}`;
  {
    const { data, error } = await admin
      .from("tax_brackets")
      .insert({
        country_code: COUNTRY_B,
        name: taxBracketBName,
        effective_from: "2025-01-01",
        bracket_order: 99,
        min_income: 0,
        max_income: 10000,
        rate_percent: 10,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`tax_bracket B: ${error?.message}`);
    taxBracketBId = data.id;
  }

  await admin.from("profiles").update({ tenant_id: tenantA }).eq("id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin
    .from("user_roles")
    .insert({ user_id: user.id, role: "super_admin", tenant_id: tenantA });
});

test.afterAll(async () => {
  for (const t of [tenantA, tenantB]) {
    if (!t) continue;
    await admin.from("leave_types").delete().eq("tenant_id", t);
    await admin.from("user_roles").delete().eq("tenant_id", t);
    await admin.from("tenants").delete().eq("id", t);
  }
  await admin.from("public_holidays").delete().eq("id", holidayBId).then(() => {}).catch(() => {});
  await admin.from("tax_brackets").delete().eq("id", taxBracketBId).then(() => {}).catch(() => {});
  if (user?.id) await deleteUser(user.id);
});

async function snapshotById(table: string, id: string) {
  const { data } = await admin.from(table).select("*").eq("id", id).maybeSingle();
  return data;
}

async function tryWrite(
  label: string,
  fn: () => Promise<{ error: { message: string } | null }>,
) {
  const { error } = await fn();
  // Either RLS denies the write (error) or the write affects zero rows
  // (no error but the row stays unchanged — verified by snapshot below).
  if (error) {
    expect(error.message, `${label} unexpected error shape`).toBeTruthy();
  }
}

test("super_admin Data API writes cannot modify tenant B leave/tax/holiday rows", async ({
  page,
}) => {
  await signInViaUI(page, user);
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  const userClient: SupabaseClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  expect(signInErr).toBeNull();

  // ---- Snapshot tenant B's rows BEFORE any write attempt ----
  const ltBefore = await snapshotById("leave_types", leaveTypeBId);
  const holBefore = await snapshotById("public_holidays", holidayBId);
  const taxBefore = await snapshotById("tax_brackets", taxBracketBId);
  expect(ltBefore).not.toBeNull();
  expect(holBefore).not.toBeNull();
  expect(taxBefore).not.toBeNull();

  // ---------------- leave_types ----------------
  // UPDATE tenant B's leave type via tenant_id filter.
  await tryWrite("update leave_types tenant B", () =>
    userClient
      .from("leave_types")
      .update({ name: "HACKED", annual_quota_days: 999 })
      .eq("id", leaveTypeBId),
  );
  // DELETE tenant B's leave type.
  await tryWrite("delete leave_types tenant B", () =>
    userClient.from("leave_types").delete().eq("id", leaveTypeBId),
  );
  // INSERT a new leave type CLAIMING tenant B's tenant_id.
  await tryWrite("insert leave_types tenant B", () =>
    userClient.from("leave_types").insert({
      tenant_id: tenantB,
      code: `INJ_${Date.now()}`.slice(0, 20),
      name: "Injected B",
      annual_quota_days: 5,
    }),
  );

  // ---------------- public_holidays (country B) ----------------
  await tryWrite("update public_holidays country B", () =>
    userClient
      .from("public_holidays")
      .update({ name: "HACKED_HOLIDAY" })
      .eq("id", holidayBId),
  );
  await tryWrite("delete public_holidays country B", () =>
    userClient.from("public_holidays").delete().eq("id", holidayBId),
  );

  // ---------------- tax_brackets (country B) ----------------
  await tryWrite("update tax_brackets country B", () =>
    userClient
      .from("tax_brackets")
      .update({ rate_percent: 99, name: "HACKED_TAX" })
      .eq("id", taxBracketBId),
  );
  await tryWrite("delete tax_brackets country B", () =>
    userClient.from("tax_brackets").delete().eq("id", taxBracketBId),
  );

  await userClient.auth.signOut();

  // ---- Verify tenant B rows are IDENTICAL to their pre-test state ----
  const ltAfter = await snapshotById("leave_types", leaveTypeBId);
  expect(ltAfter, "tenant B leave_type was deleted").not.toBeNull();
  expect(ltAfter).toEqual(ltBefore);

  const holAfter = await snapshotById("public_holidays", holidayBId);
  expect(holAfter, "country B holiday was deleted").not.toBeNull();
  expect(holAfter).toEqual(holBefore);

  const taxAfter = await snapshotById("tax_brackets", taxBracketBId);
  expect(taxAfter, "country B tax bracket was deleted").not.toBeNull();
  expect(taxAfter).toEqual(taxBefore);

  // Confirm the test did not accidentally inject extra rows under tenant B.
  const { data: tBLeaveTypes } = await admin
    .from("leave_types")
    .select("id")
    .eq("tenant_id", tenantB!);
  expect(tBLeaveTypes?.length ?? 0).toBe(1);
});
