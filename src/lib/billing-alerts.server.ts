// Server-only helper to raise a billing-ops alert and fan out notifications
// (email + in-app) to super admins. Idempotent on `idempotencyKey`.
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendInternalEmail } from '@/lib/email/send-internal.server';

export interface RaiseAlertInput {
  tenant_id?: string | null;
  alert_type: string;
  severity?: 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  context?: Record<string, any>;
  /** Permanent dedupe key. If a row exists, returns existing id without re-notifying. */
  idempotencyKey?: string;
}

const BILLING_OPS_URL = 'https://hrppl.io/admin/billing-ops';

/**
 * Insert a billing_admin_alerts row and notify super admins (email + in-app).
 * Returns the alert id. Safe to call repeatedly with the same idempotencyKey —
 * subsequent calls become a no-op (no duplicate notifications, no double-counts).
 */
export async function raiseBillingAlert(input: RaiseAlertInput): Promise<{ id: string; created: boolean; suppressed: boolean }> {
  const severity = input.severity ?? 'error';

  if (input.idempotencyKey) {
    const { data: existing } = await supabaseAdmin
      .from('billing_admin_alerts')
      .select('id, suppressed')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();
    if (existing) return { id: (existing as any).id, created: false, suppressed: !!(existing as any).suppressed };
  }

  const suppressed = await isAlertSuppressed(input.tenant_id ?? null, input.alert_type);
  const policy = await getRetryPolicy(input.alert_type);
  const nextRetryAt = policy?.enabled
    ? new Date(Date.now() + (policy.backoff_seconds ?? 300) * 1000).toISOString()
    : null;

  const { data: row, error } = await supabaseAdmin
    .from('billing_admin_alerts')
    .insert({
      tenant_id: input.tenant_id ?? null,
      alert_type: input.alert_type,
      severity,
      title: input.title,
      message: input.message ?? null,
      context: input.context ?? {},
      idempotency_key: input.idempotencyKey ?? null,
      suppressed,
      next_retry_at: nextRetryAt,
    } as any)
    .select('id')
    .single();

  if (error || !row) {
    console.error('[raiseBillingAlert] insert failed', error);
    throw error ?? new Error('failed to insert alert');
  }
  const alertId = (row as any).id as string;

  // Notify only when not suppressed. Auto-retries still run regardless.
  if (!suppressed) {
    try { await notifySuperAdminsForAlert(alertId, input); }
    catch (e) { console.error('[raiseBillingAlert] notify failed', e); }
  }
  return { id: alertId, created: true, suppressed };
}

async function isAlertSuppressed(tenantId: string | null, alertType: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from('billing_alert_suppressions')
    .select('tenant_id, alert_type, expires_at');
  for (const r of (data as any[]) ?? []) {
    const typeMatch = !r.alert_type || r.alert_type === alertType;
    const tenantMatch = !r.tenant_id || r.tenant_id === tenantId;
    const notExpired = !r.expires_at || r.expires_at > nowIso;
    if (typeMatch && tenantMatch && notExpired) return true;
  }
  return false;
}

export async function getRetryPolicy(alertType: string): Promise<any | null> {
  const { data } = await supabaseAdmin
    .from('billing_alert_retry_policies')
    .select('*')
    .eq('alert_type', alertType)
    .maybeSingle();
  return data ?? null;
}

/** Exponential backoff: delay = min(max, base * mult^attempt). Returns null when exhausted. */
export function computeNextRetryAt(policy: any, attempt: number): string | null {
  if (!policy?.enabled) return null;
  if (attempt >= (policy.max_attempts ?? 3)) return null;
  const base = policy.backoff_seconds ?? 300;
  const mult = Number(policy.backoff_multiplier ?? 2.0);
  const max = policy.max_backoff_seconds ?? 86400;
  const delay = Math.min(max, Math.round(base * Math.pow(mult, Math.max(0, attempt))));
  return new Date(Date.now() + delay * 1000).toISOString();
}

async function notifySuperAdminsForAlert(alertId: string, input: RaiseAlertInput) {
  // Resolve tenant name if any
  let tenantName: string | undefined;
  if (input.tenant_id) {
    const { data: t } = await supabaseAdmin
      .from('tenants').select('name').eq('id', input.tenant_id).maybeSingle();
    tenantName = (t as any)?.name;
  }

  const { data: roles } = await supabaseAdmin
    .from('user_roles').select('user_id').eq('role', 'super_admin');
  const ids = (roles ?? []).map((r: any) => r.user_id as string);
  if (!ids.length) return;

  const { data: profiles } = await supabaseAdmin
    .from('profiles').select('id, email, full_name').in('id', ids);

  const retryUrl = `${BILLING_OPS_URL}?alert=${alertId}`;
  const period = input.context?.year && input.context?.month
    ? `${input.context.year}-${String(input.context.month).padStart(2, '0')}`
    : undefined;

  // In-app notifications for every super admin
  const inAppRows = ids.map((uid) => ({
    user_id: uid,
    kind: 'billing_alert',
    title: input.title,
    body: input.message ?? '',
    link: retryUrl,
    metadata: { alert_id: alertId, alert_type: input.alert_type, severity: input.severity ?? 'error' },
  }));
  await supabaseAdmin.from('in_app_notifications').insert(inAppRows as any).then(
    () => undefined,
    (e) => console.error('[notifySuperAdmins] in-app insert failed', e),
  );

  // Emails
  for (const p of profiles ?? []) {
    const email = (p as any).email as string | undefined;
    if (!email) continue;
    await sendInternalEmail({
      templateName: 'billing-ops-alert',
      recipientEmail: email,
      idempotencyKey: `billing-alert:${alertId}:${(p as any).id}`,
      templateData: {
        recipientName: (p as any).full_name ?? 'Admin',
        tenantName,
        alertType: input.alert_type,
        severity: input.severity ?? 'error',
        title: input.title,
        message: input.message,
        failureReason: input.message,
        retryUrl,
        occurredAt: new Date().toISOString(),
        period,
      },
    });
  }

  await supabaseAdmin.from('billing_admin_alerts')
    .update({ notified_at: new Date().toISOString() } as any)
    .eq('id', alertId);
}

/** Append a billing-ops audit row. Never throws. */
export async function logBillingOpsAudit(input: {
  actor_user_id?: string | null;
  actor_email?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  tenant_id?: string | null;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await supabaseAdmin.from('billing_ops_audit').insert({
      actor_user_id: input.actor_user_id ?? null,
      actor_email: input.actor_email ?? null,
      action: input.action,
      target_type: input.target_type ?? null,
      target_id: input.target_id ?? null,
      tenant_id: input.tenant_id ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? {},
    } as any);
  } catch (e) {
    console.error('[logBillingOpsAudit] failed', e);
  }
}
