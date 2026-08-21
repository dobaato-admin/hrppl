/**
 * Minimal local/CI seed for Playwright E2E.
 *
 * Creates one tenant + one super_admin user using the Supabase admin API,
 * then writes credentials to `.e2e/seeded.json` so Playwright specs and the
 * harness can read them.
 *
 * Usage:
 *   bun run e2e:seed          # uses .env.e2e (loaded by harness) or process env
 *
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY
 *               (or VITE_* equivalents)
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!URL || !SERVICE_KEY || !ANON_KEY) {
  console.error(
    "[e2e-seed] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

const admin = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TAG = `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `${TAG}_admin@example.test`;
const adminPassword = `Test!${TAG}aA1`;

async function main() {
  await admin.from("countries").upsert([
    { code: "AU", name: "Australia", currency_code: "AUD", region_code: "APAC" },
  ]);

  const { data: tenant, error: te } = await admin
    .from("tenants")
    .insert({
      name: `${TAG}-tenant`,
      slug: `${TAG}-tenant`.toLowerCase(),
      country_code: "AU",
      currency_code: "AUD",
      contact_email: `${TAG}@example.test`,
      status: "active",
    })
    .select("id")
    .single();
  if (te || !tenant) throw new Error(`tenant: ${te?.message}`);

  const { data: u, error: ue } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "E2E Admin" },
  });
  if (ue || !u.user) throw new Error(`createUser: ${ue?.message}`);

  // re-insert profile with tenant_id (handle_new_user trigger created one)
  await admin.from("profiles").delete().eq("id", u.user.id);
  await admin.from("profiles").insert({
    id: u.user.id,
    email: adminEmail,
    full_name: "E2E Admin",
    tenant_id: tenant.id,
  });
  await admin.from("user_roles").insert({ user_id: u.user.id, role: "super_admin" });

  const out = {
    tag: TAG,
    tenantId: tenant.id,
    adminEmail,
    adminPassword,
    adminUserId: u.user.id,
  };
  const dir = resolve(process.cwd(), ".e2e");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "seeded.json"), JSON.stringify(out, null, 2));
  console.log(`[e2e-seed] wrote .e2e/seeded.json (tenant=${tenant.id} email=${adminEmail})`);
}

main().catch((err) => {
  console.error("[e2e-seed] failed:", err);
  process.exit(1);
});
