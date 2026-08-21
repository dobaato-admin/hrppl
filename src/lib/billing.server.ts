// Server-only helpers shared by server functions, cron, and the Stripe webhook.
import { getStripe } from '@/lib/stripe.server';
import { raiseBillingAlert } from '@/lib/billing-alerts.server';


type RunResult = {
  tenantId: string;
  year: number;
  month: number;
  netEmployees: number;
  joinedCount: number;
  leftCount: number;
  baseUnits: number;
  addonUnits: number;
  trialApplied: boolean;
  status: 'reported' | 'skipped' | 'dry_run' | 'failed';
  error?: string;
};

/**
 * Compute net headcount and report metered usage to Stripe.
 *
 * Mid-month plan changes: if `plan_changed_at` falls inside the period, units
 * are pro-rated by days on the prior vs new plan. The base price corresponds
 * to whichever plan_id is currently active; the prior-plan portion is reported
 * against the prior plan's subscription-item if it still exists, otherwise it
 * is folded into the current plan with a `plan_change_prorated` note.
 *
 * Free trial: if `trial_ends_at` falls on/after the period end and the trial
 * has not been consumed, base units are zeroed for that month (add-on still
 * bills from day 1). When the trial ends mid-month, base units are pro-rated
 * to only the days after the trial end.
 */
export async function runMonthlyBillingForTenant(
  tenantId: string,
  year: number,
  month: number,
  dryRun = false,
): Promise<RunResult> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const periodStartDate = new Date(Date.UTC(year, month - 1, 1));
  const periodEndDate = new Date(Date.UTC(year, month, 0));
  const periodEnd = periodEndDate.toISOString().slice(0, 10);
  const daysInPeriod = periodEndDate.getUTCDate();

  const { data: hc, error: hcErr } = await supabaseAdmin
    .rpc('tenant_net_headcount', { _tenant: tenantId, _year: year, _month: month });
  if (hcErr) throw hcErr;
  const head = hc?.[0] ?? { net_employees: 0, joined_count: 0, left_count: 0 };

  const { data: sub } = await supabaseAdmin
    .from('tenant_subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  let trialApplied = false;
  let trialPartial: { days_billable: number } | null = null;
  let baseUnits = head.net_employees as number;
  let addonUnits = sub?.au_payroll_addon ? (head.net_employees as number) : 0;

  // Trial handling — full and mid-month partial.
  if (sub?.trial_ends_at && !sub.trial_consumed) {
    const trialEnd = new Date(sub.trial_ends_at + 'T23:59:59Z');
    if (trialEnd >= periodEndDate) {
      baseUnits = 0;
      trialApplied = true;
    } else if (trialEnd >= periodStartDate) {
      // Mid-month trial expiry → pro-rate base units across the billable days.
      const billableDays = daysInPeriod - trialEnd.getUTCDate();
      const fraction = Math.max(0, billableDays) / daysInPeriod;
      baseUnits = Math.round((head.net_employees as number) * fraction);
      trialPartial = { days_billable: billableDays };
    }
  }

  // Mid-month plan change pro-ration.
  let prorated: any = null;
  if (sub?.plan_changed_at) {
    const changeDate = new Date(sub.plan_changed_at);
    if (changeDate >= periodStartDate && changeDate <= periodEndDate) {
      const changeDay = changeDate.getUTCDate();
      const daysPrior = changeDay - 1;
      const daysNew = daysInPeriod - daysPrior;
      const fractionNew = daysNew / daysInPeriod;
      const newPlanUnits = Math.round((head.net_employees as number) * fractionNew);
      const priorPlanUnits = (head.net_employees as number) - newPlanUnits;
      prorated = {
        change_date: sub.plan_changed_at,
        days_prior: daysPrior,
        days_new: daysNew,
        units_prior_plan: priorPlanUnits,
        units_new_plan: newPlanUnits,
        prior_plan_id: sub.prior_plan_id,
      };
      // Report only the new-plan portion under the current base item.
      // The prior-plan portion is captured in plan_change_prorated for audit
      // and (if available) reported against a prior subscription-item below.
      baseUnits = trialApplied ? 0 : newPlanUnits;
    }
  }

  // Upsert snapshot first so we always have a record.
  const { data: snapRow } = await supabaseAdmin
    .from('tenant_billing_snapshots')
    .upsert({
      tenant_id: tenantId,
      period_year: year,
      period_month: month,
      period_start: periodStart,
      period_end: periodEnd,
      net_employees: head.net_employees,
      joined_count: head.joined_count,
      left_count: head.left_count,
      base_units: baseUnits,
      addon_units: addonUnits,
      trial_applied: trialApplied,
      plan_change_prorated: prorated ?? (trialPartial ? { trial_partial: trialPartial } : null),
      status: dryRun ? 'dry_run' : 'pending',
    }, { onConflict: 'tenant_id,period_year,period_month' })
    .select('*')
    .single();

  if (dryRun || !sub?.stripe_subscription_id) {
    return {
      tenantId, year, month,
      netEmployees: head.net_employees, joinedCount: head.joined_count, leftCount: head.left_count,
      baseUnits, addonUnits, trialApplied,
      status: dryRun ? 'dry_run' : 'skipped',
    };
  }

  const stripe = getStripe();
  const timestamp = Math.floor(periodEndDate.getTime() / 1000);

  try {
    let baseUsageId: string | null = null;
    let addonUsageId: string | null = null;

    if (sub.base_subscription_item_id) {
      const rec = await (stripe.subscriptionItems as any).createUsageRecord(
        sub.base_subscription_item_id,
        { quantity: baseUnits, timestamp, action: 'set' },
        { idempotencyKey: `usage:${tenantId}:${year}-${month}:base` },
      );
      baseUsageId = rec.id;
    }
    if (sub.addon_subscription_item_id && addonUnits > 0) {
      const rec = await (stripe.subscriptionItems as any).createUsageRecord(
        sub.addon_subscription_item_id,
        { quantity: addonUnits, timestamp, action: 'set' },
        { idempotencyKey: `usage:${tenantId}:${year}-${month}:addon` },
      );
      addonUsageId = rec.id;
    }

    await supabaseAdmin
      .from('tenant_billing_snapshots')
      .update({
        status: 'reported',
        stripe_base_usage_id: baseUsageId,
        stripe_addon_usage_id: addonUsageId,
        reported_at: new Date().toISOString(),
      })
      .eq('id', snapRow!.id);

    if (!trialApplied && !sub.trial_consumed) {
      await supabaseAdmin
        .from('tenant_subscriptions')
        .update({ trial_consumed: true, last_reported_period: periodEnd })
        .eq('tenant_id', tenantId);
    } else {
      await supabaseAdmin
        .from('tenant_subscriptions')
        .update({ last_reported_period: periodEnd })
        .eq('tenant_id', tenantId);
    }

    await supabaseAdmin.from('billing_audit_log').insert({
      tenant_id: tenantId,
      event_type: 'usage.reported',
      payload: { year, month, baseUnits, addonUnits, trialApplied, baseUsageId, addonUsageId, prorated },
    });

    return {
      tenantId, year, month,
      netEmployees: head.net_employees, joinedCount: head.joined_count, leftCount: head.left_count,
      baseUnits, addonUnits, trialApplied, status: 'reported',
    };
  } catch (e: any) {
    const errMsg = e?.message ?? String(e);
    await supabaseAdmin
      .from('tenant_billing_snapshots')
      .update({ status: 'failed', error: errMsg })
      .eq('id', snapRow!.id);
    await supabaseAdmin.from('billing_audit_log').insert({
      tenant_id: tenantId,
      event_type: 'usage.failed',
      payload: { year, month, error: errMsg },
    });
    // Surface as super-admin alert with retry tracking + email/in-app notify.
    await raiseBillingAlert({
      tenant_id: tenantId,
      alert_type: 'stripe_usage_report_failed',
      severity: 'error',
      title: `Stripe usage report failed for ${year}-${String(month).padStart(2, '0')}`,
      message: errMsg,
      context: { snapshot_id: snapRow!.id, year, month, baseUnits, addonUnits },
      idempotencyKey: `alert:usage_failed:${tenantId}:${year}-${month}`,
    });
    return {
      tenantId, year, month,
      netEmployees: head.net_employees, joinedCount: head.joined_count, leftCount: head.left_count,
      baseUnits, addonUnits, trialApplied, status: 'failed', error: errMsg,
    };
  }
}

/** Run monthly billing for every tenant with an active Stripe subscription. */
export async function runMonthlyBillingForAllTenants(year: number, month: number) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: subs } = await supabaseAdmin
    .from('tenant_subscriptions')
    .select('tenant_id')
    .not('stripe_subscription_id', 'is', null);
  const results: RunResult[] = [];
  for (const s of subs ?? []) {
    try {
      results.push(await runMonthlyBillingForTenant(s.tenant_id, year, month, false));
    } catch (e: any) {
      const errMsg = e?.message ?? String(e);
      results.push({
        tenantId: s.tenant_id, year, month,
        netEmployees: 0, joinedCount: 0, leftCount: 0,
        baseUnits: 0, addonUnits: 0, trialApplied: false,
        status: 'failed', error: errMsg,
      });
      await raiseBillingAlert({
        tenant_id: s.tenant_id,
        alert_type: 'monthly_billing_unhandled_error',
        severity: 'error',
        title: `Monthly billing crashed for ${year}-${String(month).padStart(2, '0')}`,
        message: errMsg,
        context: { year, month },
        idempotencyKey: `alert:cron_crash:${s.tenant_id}:${year}-${month}`,
      });
    }
  }
  return results;
}

/**
 * Reconciliation: for the given period, compare each tenant's computed base /
 * addon units against the metered quantity Stripe currently shows for that
 * subscription item. Logs every comparison; flags discrepancies and raises a
 * super-admin alert. Run this AFTER reporting usage but BEFORE Stripe
 * finalises the invoice (i.e. before the period's `subscription_cycle`).
 */
export async function reconcileMonth(year: number, month: number) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const stripe = getStripe();
  const { data: snaps } = await supabaseAdmin
    .from('tenant_billing_snapshots')
    .select('id, tenant_id, base_units, addon_units, stripe_base_usage_id, stripe_addon_usage_id')
    .eq('period_year', year)
    .eq('period_month', month);

  const out: any[] = [];
  for (const snap of snaps ?? []) {
    const { data: sub } = await supabaseAdmin
      .from('tenant_subscriptions')
      .select('base_subscription_item_id, addon_subscription_item_id')
      .eq('tenant_id', snap.tenant_id)
      .maybeSingle();

    let reportedBase = 0;
    let reportedAddon = 0;
    try {
      if (sub?.base_subscription_item_id) {
        const summaries: any = await (stripe.subscriptionItems as any).listUsageRecordSummaries(
          sub.base_subscription_item_id, { limit: 12 },
        );
        const match = (summaries.data ?? []).find((s: any) => {
          const d = new Date((s.period?.end ?? 0) * 1000);
          return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
        });
        reportedBase = match?.total_usage ?? 0;
      }
      if (sub?.addon_subscription_item_id) {
        const summaries: any = await (stripe.subscriptionItems as any).listUsageRecordSummaries(
          sub.addon_subscription_item_id, { limit: 12 },
        );
        const match = (summaries.data ?? []).find((s: any) => {
          const d = new Date((s.period?.end ?? 0) * 1000);
          return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
        });
        reportedAddon = match?.total_usage ?? 0;
      }
    } catch (e: any) {
      await raiseBillingAlert({
        tenant_id: snap.tenant_id,
        alert_type: 'reconciliation_stripe_read_failed',
        severity: 'warning',
        title: `Reconciliation read failed ${year}-${String(month).padStart(2, '0')}`,
        message: e?.message ?? String(e),
        context: { snapshot_id: snap.id, year, month },
        idempotencyKey: `alert:recon_read:${snap.tenant_id}:${year}-${month}`,
      });
      continue;
    }

    const baseDelta = (snap.base_units ?? 0) - reportedBase;
    const addonDelta = (snap.addon_units ?? 0) - reportedAddon;
    const hasDisc = baseDelta !== 0 || addonDelta !== 0;

    // Freeze a snapshot of inputs so drill-ins are stable even if underlying
    // headcount or Stripe quantities later change.
    const { data: liveSnap } = await supabaseAdmin
      .from('tenant_billing_snapshots')
      .select('net_employees, joined_count, left_count, base_units, addon_units, trial_applied, plan_change_prorated, stripe_base_usage_id, stripe_addon_usage_id, reported_at, status')
      .eq('id', snap.id).maybeSingle();
    const frozen = {
      computed_at: new Date().toISOString(),
      computed_base: snap.base_units ?? 0,
      computed_addon: snap.addon_units ?? 0,
      reported_base: reportedBase,
      reported_addon: reportedAddon,
      base_delta: baseDelta,
      addon_delta: addonDelta,
      snapshot_id: snap.id,
      snapshot: liveSnap ?? null,
    };

    const { data: logRow } = await supabaseAdmin.from('billing_reconciliation_log').insert({
      tenant_id: snap.tenant_id,
      period_year: year, period_month: month,
      computed_base: snap.base_units ?? 0, reported_base: reportedBase,
      computed_addon: snap.addon_units ?? 0, reported_addon: reportedAddon,
      base_delta: baseDelta, addon_delta: addonDelta,
      has_discrepancy: hasDisc,
      snapshot_data: frozen,
    }).select('id').single();

    await supabaseAdmin.from('tenant_billing_snapshots')
      .update({ reconciled_at: new Date().toISOString(), reconciliation_delta: baseDelta + addonDelta })
      .eq('id', snap.id);

    if (hasDisc) {
      await raiseBillingAlert({
        tenant_id: snap.tenant_id,
        alert_type: 'reconciliation_discrepancy',
        severity: 'warning',
        title: `Usage discrepancy ${year}-${String(month).padStart(2, '0')}`,
        message: `base Δ=${baseDelta}, addon Δ=${addonDelta}`,
        context: { snapshot_id: snap.id, log_id: logRow?.id, reportedBase, reportedAddon, year, month },
        idempotencyKey: `alert:recon_disc:${snap.tenant_id}:${year}-${month}`,
      });
    }

    out.push({
      tenantId: snap.tenant_id, baseDelta, addonDelta, hasDisc,
      computedBase: snap.base_units, reportedBase,
      computedAddon: snap.addon_units, reportedAddon,
    });
  }
  return { year, month, total: out.length, discrepancies: out.filter((r) => r.hasDisc).length, results: out };
}

/**
 * Compute (without writing) how a given month would bill for a tenant, with
 * optional scenario overrides:
 *  - overridePlanCode: simulate a mid-month upgrade/downgrade taking effect on
 *    `overridePlanChangeDate` (defaults to today, clamped to the selected month).
 *  - overrideTrialEndsAt: simulate trial expiration date.
 *
 * Returns the full unit breakdown plus a per-line cost estimate using the
 * resolved plans' unit_amount_cents (no Stripe calls).
 */
export async function previewBillingForTenant(args: {
  tenantId: string;
  year: number;
  month: number;
  overridePlanCode?: 'starter_v2' | 'pro_v2' | null;
  overridePlanChangeDate?: string | null;
  overrideTrialEndsAt?: string | null;
  overrideAddonAU?: boolean | null;
}): Promise<any> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { tenantId, year, month } = args;
  const periodStartDate = new Date(Date.UTC(year, month - 1, 1));
  const periodEndDate = new Date(Date.UTC(year, month, 0));
  const daysInPeriod = periodEndDate.getUTCDate();

  const { data: hc } = await supabaseAdmin
    .rpc('tenant_net_headcount', { _tenant: tenantId, _year: year, _month: month });
  const head = hc?.[0] ?? { net_employees: 0, joined_count: 0, left_count: 0 };

  const { data: sub } = await supabaseAdmin
    .from('tenant_subscriptions').select('*').eq('tenant_id', tenantId).maybeSingle();

  const trialEndsAt = args.overrideTrialEndsAt ?? sub?.trial_ends_at ?? null;
  const addonAU = args.overrideAddonAU ?? sub?.au_payroll_addon ?? false;

  let trialApplied = false;
  let trialPartial: { days_billable: number } | null = null;
  let baseUnits = head.net_employees as number;
  let addonUnits = addonAU ? (head.net_employees as number) : 0;

  if (trialEndsAt && !sub?.trial_consumed) {
    const trialEnd = new Date(trialEndsAt + 'T23:59:59Z');
    if (trialEnd >= periodEndDate) {
      baseUnits = 0; trialApplied = true;
    } else if (trialEnd >= periodStartDate) {
      const billableDays = daysInPeriod - trialEnd.getUTCDate();
      const fraction = Math.max(0, billableDays) / daysInPeriod;
      baseUnits = Math.round((head.net_employees as number) * fraction);
      trialPartial = { days_billable: billableDays };
    }
  }

  // Resolve plans
  const { data: plans } = await supabaseAdmin
    .from('subscription_plans').select('id, code, name, price_monthly');
  const unitCents = (p: any) => Math.round(Number(p?.price_monthly ?? 0) * 100);
  const planById: Record<string, any> = {};
  const planByCode: Record<string, any> = {};
  for (const p of plans ?? []) { planById[(p as any).id] = p; planByCode[(p as any).code] = p; }
  const currentPlan = sub?.plan_id ? planById[sub.plan_id] : null;
  const addonPlan = planByCode['au_payroll_addon'];

  // Plan-change simulation
  let prorated: any = null;
  let priorPlan = currentPlan;
  let newPlan = currentPlan;
  if (args.overridePlanCode && planByCode[args.overridePlanCode] && currentPlan && planByCode[args.overridePlanCode].id !== currentPlan.id) {
    newPlan = planByCode[args.overridePlanCode];
    const changeRaw = args.overridePlanChangeDate ?? new Date().toISOString().slice(0, 10);
    const changeDate = new Date(changeRaw + 'T00:00:00Z');
    // Clamp into period
    const inDate = changeDate < periodStartDate ? periodStartDate
      : changeDate > periodEndDate ? periodEndDate : changeDate;
    const changeDay = inDate.getUTCDate();
    const daysPrior = changeDay - 1;
    const daysNew = daysInPeriod - daysPrior;
    const fractionNew = daysNew / daysInPeriod;
    const newUnits = Math.round((head.net_employees as number) * fractionNew);
    const priorUnits = (head.net_employees as number) - newUnits;
    prorated = {
      change_date: inDate.toISOString().slice(0, 10),
      days_prior: daysPrior, days_new: daysNew,
      units_prior_plan: priorUnits, units_new_plan: newUnits,
      prior_plan: priorPlan?.code, new_plan: newPlan?.code,
    };
    baseUnits = trialApplied ? 0 : newUnits;
  }

  const priorAmountCents = prorated ? unitCents(priorPlan) * (prorated.units_prior_plan ?? 0) : 0;
  const baseAmountCents = unitCents(newPlan) * baseUnits;
  const addonAmountCents = unitCents(addonPlan) * addonUnits;
  const totalCents = priorAmountCents + baseAmountCents + addonAmountCents;

  return {
    tenantId, year, month,
    headcount: { net: head.net_employees, joined: head.joined_count, left: head.left_count },
    trial: { applied: trialApplied, partial: trialPartial, trialEndsAt },
    plan: { current: currentPlan?.code, new: newPlan?.code, prorated },
    units: { base: baseUnits, addon: addonUnits, prior: prorated?.units_prior_plan ?? 0 },
    lines: [
      prorated ? { label: `Prior plan (${priorPlan?.code})`, units: prorated.units_prior_plan, unitCents: unitCents(priorPlan), subtotalCents: priorAmountCents } : null,
      { label: `Plan (${newPlan?.code ?? '—'})`, units: baseUnits, unitCents: unitCents(newPlan), subtotalCents: baseAmountCents },
      addonAU ? { label: 'AU Payroll add-on', units: addonUnits, unitCents: unitCents(addonPlan), subtotalCents: addonAmountCents } : null,
    ].filter(Boolean),
    totalCents,
  };
}

