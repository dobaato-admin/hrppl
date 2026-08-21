/**
 * Verifies the audit_timesheet_overtime_breakdown trigger fires on every path
 * that can change timesheets.overtime_breakdown:
 *   - direct DB update (service role / admin client)
 *   - user-scoped update (org_admin via PostgREST — same path the UI and
 *     server functions use)
 *   - INSERT with a non-empty breakdown
 *   - no-op update (must NOT produce a new audit entry)
 *
 * Run: bunx vitest run tests/audit-overtime.test.ts
 */
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { setupRBAC, teardownRBAC, users, ctx } from './helpers/rbac-setup';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let employeeId: string;
let rateCode: string;

beforeAll(async () => {
  await setupRBAC();

  // Active overtime penalty rate for AU (tenantA's country) so the
  // validate_timesheet_overtime_breakdown trigger accepts the code.
  rateCode = `OT_AUDIT_${ctx.tag}`.toUpperCase().slice(0, 30);
  const { error: rateErr } = await admin.from('overtime_penalty_rates').insert({
    country_code: 'AU',
    code: rateCode,
    name: `Audit test rate ${ctx.tag}`,
    rate_multiplier: 1.5,
    applies_to: 'overtime',
    effective_from: '2020-01-01',
    is_active: true,
  });
  if (rateErr) throw new Error(`rate insert: ${rateErr.message}`);

  // Employee in tenantA linked to the org_admin user so RLS lets the
  // org_admin update their timesheet via the user-scoped client.
  const { data: emp, error: empErr } = await admin
    .from('employees')
    .insert({
      tenant_id: ctx.tenantA,
      user_id: users.orgAdminA.id,
      employee_number: `E-${ctx.tag}`,
      first_name: 'Audit',
      last_name: 'Tester',
      email: `${ctx.tag}-audit@example.test`,
      hire_date: '2024-01-01',
    })
    .select('id')
    .single();
  if (empErr) throw new Error(`employee insert: ${empErr.message}`);
  employeeId = emp.id;
});

afterAll(async () => {
  await admin.from('timesheets').delete().eq('employee_id', employeeId);
  await admin.from('employees').delete().eq('id', employeeId);
  await admin.from('overtime_penalty_rates').delete().eq('code', rateCode);
  await teardownRBAC();
});

async function readAudit(timesheetId: string) {
  const { data, error } = await admin
    .from('audit_log')
    .select('action, actor_id, metadata, created_at')
    .eq('entity_type', 'timesheet')
    .eq('entity_id', timesheetId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`audit read: ${error.message}`);
  return data ?? [];
}

async function makeTimesheet(period: [string, string], overtime = 0, breakdown: Record<string, number> = {}) {
  const { data, error } = await admin
    .from('timesheets')
    .insert({
      tenant_id: ctx.tenantA,
      employee_id: employeeId,
      period_start: period[0],
      period_end: period[1],
      total_hours: 40 + overtime,
      overtime_hours: overtime,
      overtime_breakdown: breakdown,
      status: 'draft',
    })
    .select('id')
    .single();
  if (error) throw new Error(`timesheet insert: ${error.message}`);
  return data.id as string;
}

describe('audit_timesheet_overtime_breakdown trigger', () => {
  it('INSERT with non-empty breakdown logs "overtime_breakdown_set"', async () => {
    const tsId = await makeTimesheet(['2026-01-05', '2026-01-11'], 4, { [rateCode]: 4 });
    const entries = await readAudit(tsId);
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('overtime_breakdown_set');
    expect(entries[0].metadata.before).toEqual({});
    expect(entries[0].metadata.after).toEqual({ [rateCode]: 4 });
  });

  it('INSERT with empty breakdown logs nothing', async () => {
    const tsId = await makeTimesheet(['2026-01-12', '2026-01-18']);
    expect(await readAudit(tsId)).toHaveLength(0);
  });

  it('direct DB update logs "overtime_breakdown_changed" with no actor', async () => {
    const tsId = await makeTimesheet(['2026-01-19', '2026-01-25'], 2, { [rateCode]: 2 });
    const { error } = await admin
      .from('timesheets')
      .update({ overtime_hours: 5, overtime_breakdown: { [rateCode]: 5 } })
      .eq('id', tsId);
    expect(error).toBeNull();
    const entries = await readAudit(tsId);
    expect(entries).toHaveLength(2);
    expect(entries[1].action).toBe('overtime_breakdown_changed');
    expect(entries[1].metadata.before).toEqual({ [rateCode]: 2 });
    expect(entries[1].metadata.after).toEqual({ [rateCode]: 5 });
    // service role: auth.uid() is null
    expect(entries[1].actor_id).toBeNull();
  });

  it('user-scoped update (UI / server-fn path) records actor_id', async () => {
    const tsId = await makeTimesheet(['2026-01-26', '2026-02-01']);
    const { error } = await users.orgAdminA.client
      .from('timesheets')
      .update({ overtime_hours: 3, overtime_breakdown: { [rateCode]: 3 } })
      .eq('id', tsId);
    expect(error).toBeNull();
    const entries = await readAudit(tsId);
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('overtime_breakdown_changed');
    expect(entries[0].actor_id).toBe(users.orgAdminA.id);
    expect(entries[0].metadata.after).toEqual({ [rateCode]: 3 });
  });

  it('no-op update (breakdown unchanged) does NOT add an audit entry', async () => {
    const tsId = await makeTimesheet(['2026-02-02', '2026-02-08'], 2, { [rateCode]: 2 });
    const before = await readAudit(tsId);
    const { error } = await admin
      .from('timesheets')
      .update({ notes: 'unrelated change' })
      .eq('id', tsId);
    expect(error).toBeNull();
    const after = await readAudit(tsId);
    expect(after).toHaveLength(before.length);
  });
});
