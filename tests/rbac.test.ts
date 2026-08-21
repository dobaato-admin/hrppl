/**
 * RBAC integration tests for taxes, holidays, leave types, and overtime/penalty rates.
 *
 * Roles covered:
 *   - super_admin: full global manage
 *   - regional_admin (scoped AU): manage country-scoped resources for AU only
 *   - org_admin (tenant A in AU): manage tenant-level (leave_types) only;
 *     read-only on country-level rules
 *   - employee (tenant A / tenant B): read-only on their country/tenant scope
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY
 * Run: bunx vitest run
 */
import { beforeAll, afterAll, describe, it } from 'vitest';
import {
  setupRBAC,
  teardownRBAC,
  users,
  ctx,
  expectAllowed,
  expectDenied,
} from './helpers/rbac-setup';

beforeAll(async () => {
  await setupRBAC();
});

afterAll(async () => {
  await teardownRBAC();
});

// ─── tax_brackets (country-scoped) ────────────────────────────────────────────
describe('tax_brackets', () => {
  const row = (country: string, name: string) => ({
    country_code: country,
    name,
    effective_from: '2026-01-01',
    bracket_order: 1,
    min_income: 0,
    rate_percent: 10,
  });

  it('super_admin can insert for any country', async () => {
    const r = await users.superAdmin.client
      .from('tax_brackets')
      .insert(row('AU', `${ctx.tag}-sa-tax`))
      .select();
    expectAllowed(r, 'super_admin insert tax_brackets');
  });

  it('regional_admin (AU) can insert AU but NOT NZ', async () => {
    const ok = await users.regionalAU.client
      .from('tax_brackets')
      .insert(row('AU', `${ctx.tag}-ra-tax-ok`))
      .select();
    expectAllowed(ok, 'regional_admin insert AU tax');

    const denied = await users.regionalAU.client
      .from('tax_brackets')
      .insert(row('NZ', `${ctx.tag}-ra-tax-deny`))
      .select();
    expectDenied(denied, 'regional_admin insert NZ tax (out of scope)');
  });

  it('org_admin cannot insert tax (read-only on country rules)', async () => {
    const r = await users.orgAdminA.client
      .from('tax_brackets')
      .insert(row('AU', `${ctx.tag}-org-tax`))
      .select();
    expectDenied(r, 'org_admin insert tax_brackets');
  });

  it('employee cannot insert tax', async () => {
    const r = await users.employeeA.client
      .from('tax_brackets')
      .insert(row('AU', `${ctx.tag}-emp-tax`))
      .select();
    expectDenied(r, 'employee insert tax_brackets');
  });

  it('employee in tenant A (AU) can READ AU tax brackets', async () => {
    const r = await users.employeeA.client
      .from('tax_brackets')
      .select('id')
      .eq('country_code', 'AU')
      .limit(1);
    expectAllowed(r, 'employee A read AU tax');
  });

  it('employee in tenant B (NZ) CANNOT read AU tax brackets', async () => {
    const r = await users.employeeB.client
      .from('tax_brackets')
      .select('id')
      .ilike('name', `${ctx.tag}-%`)
      .eq('country_code', 'AU');
    // RLS filters silently — expect empty
    if ((r.data ?? []).length > 0) {
      throw new Error('employee B should not see AU tax rows');
    }
  });
});

// ─── public_holidays (country-scoped) ─────────────────────────────────────────
describe('public_holidays', () => {
  const row = (country: string, name: string) => ({
    country_code: country,
    name,
    holiday_date: '2026-12-25',
    is_paid: true,
    is_recurring: true,
  });

  it('super_admin can insert', async () => {
    const r = await users.superAdmin.client
      .from('public_holidays')
      .insert(row('AU', `${ctx.tag}-sa-hol`))
      .select();
    expectAllowed(r, 'super_admin insert holiday');
  });

  it('regional_admin (AU) can insert AU, denied NZ', async () => {
    expectAllowed(
      await users.regionalAU.client
        .from('public_holidays')
        .insert(row('AU', `${ctx.tag}-ra-hol-ok`))
        .select(),
      'regional AU insert holiday AU',
    );
    expectDenied(
      await users.regionalAU.client
        .from('public_holidays')
        .insert(row('NZ', `${ctx.tag}-ra-hol-deny`))
        .select(),
      'regional AU insert holiday NZ',
    );
  });

  it('org_admin can insert holidays for their own tenant country', async () => {
    expectAllowed(
      await users.orgAdminA.client
        .from('public_holidays')
        .insert(row('AU', `${ctx.tag}-org-hol`))
        .select(),
      'org_admin insert holiday in own country',
    );
  });

  it('employee can read own-country holidays', async () => {
    expectAllowed(
      await users.employeeA.client
        .from('public_holidays')
        .select('id')
        .eq('country_code', 'AU')
        .limit(1),
      'employee read AU holidays',
    );
  });
});

// ─── overtime_penalty_rates (country-scoped) ──────────────────────────────────
describe('overtime_penalty_rates', () => {
  const row = (country: string, code: string) => ({
    country_code: country,
    code,
    name: `${ctx.tag}-${code}`,
    applies_to: 'overtime',
    rate_multiplier: 1.5,
    effective_from: '2026-01-01',
  });

  it('super_admin can insert any country', async () => {
    expectAllowed(
      await users.superAdmin.client
        .from('overtime_penalty_rates')
        .insert(row('AU', `SA-${ctx.tag.slice(-6)}`))
        .select(),
      'super_admin insert rate',
    );
  });

  it('regional_admin (AU) can insert AU, denied NZ', async () => {
    expectAllowed(
      await users.regionalAU.client
        .from('overtime_penalty_rates')
        .insert(row('AU', `RAOK-${ctx.tag.slice(-6)}`))
        .select(),
      'regional AU insert rate AU',
    );
    expectDenied(
      await users.regionalAU.client
        .from('overtime_penalty_rates')
        .insert(row('NZ', `RADN-${ctx.tag.slice(-6)}`))
        .select(),
      'regional AU insert rate NZ',
    );
  });

  it('org_admin can insert rates for their own tenant country, employee cannot', async () => {
    expectAllowed(
      await users.orgAdminA.client
        .from('overtime_penalty_rates')
        .insert(row('AU', `ORG-${ctx.tag.slice(-6)}`))
        .select(),
      'org_admin insert rate in own country',
    );
    expectDenied(
      await users.employeeA.client
        .from('overtime_penalty_rates')
        .insert(row('AU', `EMP-${ctx.tag.slice(-6)}`))
        .select(),
      'employee insert rate',
    );
  });

  it('employee can read own-country rates', async () => {
    expectAllowed(
      await users.employeeA.client
        .from('overtime_penalty_rates')
        .select('id')
        .eq('country_code', 'AU')
        .limit(1),
      'employee read AU rates',
    );
  });
});

// ─── leave_types (tenant-scoped) ──────────────────────────────────────────────
describe('leave_types', () => {
  const row = (tenantId: string, code: string) => ({
    tenant_id: tenantId,
    code,
    name: `${ctx.tag}-${code}`,
    annual_quota_days: 20,
  });

  it('super_admin can insert for any tenant', async () => {
    expectAllowed(
      await users.superAdmin.client
        .from('leave_types')
        .insert(row(ctx.tenantA, `SA${ctx.tag.slice(-4)}`))
        .select(),
      'super_admin insert leave_type',
    );
  });

  it('org_admin (tenant A) can insert leave_type for tenant A', async () => {
    expectAllowed(
      await users.orgAdminA.client
        .from('leave_types')
        .insert(row(ctx.tenantA, `OA${ctx.tag.slice(-4)}`))
        .select(),
      'org_admin insert leave_type tenant A',
    );
  });

  it('org_admin (tenant A) CANNOT insert leave_type for tenant B', async () => {
    expectDenied(
      await users.orgAdminA.client
        .from('leave_types')
        .insert(row(ctx.tenantB, `OAX${ctx.tag.slice(-4)}`))
        .select(),
      'org_admin insert leave_type tenant B',
    );
  });

  it('regional_admin cannot insert leave_type (tenant-scoped, not country)', async () => {
    expectDenied(
      await users.regionalAU.client
        .from('leave_types')
        .insert(row(ctx.tenantA, `RA${ctx.tag.slice(-4)}`))
        .select(),
      'regional_admin insert leave_type',
    );
  });

  it('employee cannot insert leave_type', async () => {
    expectDenied(
      await users.employeeA.client
        .from('leave_types')
        .insert(row(ctx.tenantA, `EM${ctx.tag.slice(-4)}`))
        .select(),
      'employee insert leave_type',
    );
  });

  it('employee in tenant A can read tenant A leave_types', async () => {
    expectAllowed(
      await users.employeeA.client
        .from('leave_types')
        .select('id')
        .eq('tenant_id', ctx.tenantA)
        .limit(1),
      'employee read leave_types tenant A',
    );
  });

  it('employee in tenant B cannot see tenant A leave_types', async () => {
    const r = await users.employeeB.client
      .from('leave_types')
      .select('id')
      .eq('tenant_id', ctx.tenantA);
    if ((r.data ?? []).length > 0) {
      throw new Error('cross-tenant leave_types leak');
    }
  });
});
