/**
 * Test helpers for RBAC integration tests.
 *
 * Requires env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY
 *   (or VITE_* equivalents)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!URL || !SERVICE_KEY || !ANON_KEY) {
  throw new Error(
    'Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY required for RBAC tests',
  );
}

export const admin = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type AppRole = 'super_admin' | 'regional_admin' | 'org_admin' | 'manager' | 'employee';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient;
}

const TAG = `rbac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const ctx = {
  tag: TAG,
  countryA: 'AU', // assigned to regional admin
  countryB: 'NZ',
  tenantA: '' as string, // country AU
  tenantB: '' as string, // country NZ
};

async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const c = createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return c;
}

async function createUser(
  role: AppRole,
  opts: { tenantId?: string; countryScope?: string; suffix?: string },
): Promise<TestUser> {
  const email = `${TAG}_${role}${opts.suffix ?? ''}@example.test`;
  const password = `Test!${TAG}aA1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${role} test user`,
      signup_intent: 'create_organization',
    },
  });
  if (error || !data.user) throw new Error(`createUser ${role}: ${error?.message}`);
  const uid = data.user.id;

  // profile is auto-created by handle_new_user trigger; tenant_id changes are
  // blocked by prevent_profile_privileged_changes for non-super-admin (service
  // role has auth.uid()=NULL). Bypass by delete+reinsert (trigger is UPDATE-only).
  if (opts.tenantId) {
    const { error: de } = await admin.from('profiles').delete().eq('id', uid);
    if (de) throw new Error(`profile delete: ${de.message}`);
    const { error: pe } = await admin
      .from('profiles')
      .insert({ id: uid, email, full_name: email, tenant_id: opts.tenantId });
    if (pe) throw new Error(`profile insert: ${pe.message}`);
  }

  const { error: re } = await admin.from('user_roles').insert({ user_id: uid, role });
  if (re) throw new Error(`role insert: ${re.message}`);

  if (opts.countryScope) {
    const { error: se } = await admin
      .from('role_scope')
      .insert({ user_id: uid, country_code: opts.countryScope });
    if (se) throw new Error(`scope insert: ${se.message}`);
  }

  const client = await signedInClient(email, password);
  return { id: uid, email, password, client };
}

export const users: Record<string, TestUser> = {} as any;

export async function setupRBAC() {
  // Ensure countries exist
  await admin.from('countries').upsert([
    { code: 'AU', name: 'Australia', currency_code: 'AUD', region_code: 'APAC' },
    { code: 'NZ', name: 'New Zealand', currency_code: 'NZD', region_code: 'APAC' },
  ]);

  // Create two tenants in different countries
  const mkTenant = (suffix: string, country: string, currency: string) => ({
    name: `${TAG}-${suffix}`,
    slug: `${TAG}-${suffix}`.toLowerCase(),
    country_code: country,
    currency_code: currency,
    contact_email: `${TAG}-${suffix}@example.test`,
    status: 'active' as const,
  });
  const { data: tA, error: eA } = await admin
    .from('tenants')
    .insert(mkTenant('tenantA', 'AU', 'AUD'))
    .select('id')
    .single();
  if (eA) throw new Error(`tenantA: ${eA.message}`);
  const { data: tB, error: eB } = await admin
    .from('tenants')
    .insert(mkTenant('tenantB', 'NZ', 'NZD'))
    .select('id')
    .single();
  if (eB) throw new Error(`tenantB: ${eB.message}`);
  ctx.tenantA = tA.id;
  ctx.tenantB = tB.id;

  users.superAdmin = await createUser('super_admin', {});
  users.regionalAU = await createUser('regional_admin', { countryScope: 'AU' });
  users.orgAdminA = await createUser('org_admin', { tenantId: ctx.tenantA });
  users.employeeA = await createUser('employee', { tenantId: ctx.tenantA, suffix: '_A' });
  users.employeeB = await createUser('employee', { tenantId: ctx.tenantB, suffix: '_B' });
}

export async function teardownRBAC() {
  // Sign out clients
  for (const u of Object.values(users)) {
    try {
      await u.client.auth.signOut();
    } catch {}
  }
  // Delete users (cascades roles/scope/profile via FK)
  for (const u of Object.values(users)) {
    try {
      await admin.auth.admin.deleteUser(u.id);
    } catch {}
  }
  // Delete tenants
  try {
    await admin.from('tenants').delete().in('id', [ctx.tenantA, ctx.tenantB]);
  } catch {}
  // Cleanup any rows tagged with our tag
  for (const tbl of ['public_holidays', 'overtime_penalty_rates', 'tax_brackets', 'leave_types']) {
    try {
      await admin.from(tbl).delete().ilike('name', `%${TAG}%`);
    } catch {}
  }
}

/** Assert an operation was DENIED by RLS (error returned OR zero rows affected). */
export function expectDenied(result: { data: unknown; error: unknown }, label: string) {
  const hasError = !!result.error;
  const hasData =
    Array.isArray(result.data) ? result.data.length > 0 : result.data != null;
  if (!hasError && hasData) {
    throw new Error(`Expected DENY for ${label}, but operation succeeded`);
  }
}

/** Assert an operation was ALLOWED (no error, and data returned for write/select). */
export function expectAllowed(result: { data: unknown; error: unknown }, label: string) {
  if (result.error) {
    throw new Error(`Expected ALLOW for ${label}, got error: ${JSON.stringify(result.error)}`);
  }
}
