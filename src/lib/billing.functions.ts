import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from "@/lib/auth-guard";

const DEBIT_REGIONS = ['ach', 'becs', 'sepa', 'bacs'] as const;

async function loadAdmin() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}

async function callerRoles(supabase: any, userId: string) {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = (data ?? []).map((r: any) => r.role as string);
  return {
    isSuper: roles.includes('super_admin'),
    isOrg: roles.includes('org_admin'),
    isRegional: roles.includes('regional_admin'),
  };
}

// ───────────────────────── Plans + legacy billing UI ─────────────────────────

export const listPlans = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return { plans: data ?? [] };
  });

export const getMyBilling = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: profile } = await supabase
      .from('profiles').select('tenant_id').eq('id', userId).maybeSingle();
    const tenantId = profile?.tenant_id ?? null;
    if (!tenantId) {
      return { tenant: null, subscription: null, plan: null, employeeCount: 0, history: [] };
    }
    const admin = await loadAdmin();
    const [{ data: tenant }, { data: sub }, { count: employeeCount }, { data: history }] = await Promise.all([
      admin.from('tenants').select('id, name, plan, status, country_code, currency_code').eq('id', tenantId).maybeSingle(),
      admin.from('tenant_subscriptions')
        .select('id, status, billing_interval, current_period_start, current_period_end, trial_ends_at, cancel_at_period_end, plan_id, stripe_customer_id, stripe_subscription_id, debit_regions, allow_card_fallback, au_payroll_addon, trial_consumed')
        .eq('tenant_id', tenantId).maybeSingle(),
      admin.from('employees').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      admin.from('subscription_confirmations')
        .select('id, amount, currency_code, bank_reference, period_start, period_end, notes, created_at')
        .eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(20),
    ]);
    let plan: any = null;
    if (sub?.plan_id) {
      const { data } = await admin.from('subscription_plans').select('*').eq('id', sub.plan_id).maybeSingle();
      plan = data;
    }
    return { tenant: tenant ?? null, subscription: sub ?? null, plan, employeeCount: employeeCount ?? 0, history: history ?? [] };
  });

const changePlanSchema = z.object({
  plan_code: z.string().min(1).max(40),
  billing_interval: z.enum(['monthly', 'annual']),
});

export const changeMyPlan = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => changePlanSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await callerRoles(supabase, userId);
    if (!roles.isOrg && !roles.isSuper) throw new Error('Forbidden');
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', userId).maybeSingle();
    const tenantId = profile?.tenant_id;
    if (!tenantId) throw new Error('No organization');
    const admin = await loadAdmin();
    const { data: plan, error: planErr } = await admin
      .from('subscription_plans').select('id, code').eq('code', data.plan_code).eq('is_active', true).maybeSingle();
    if (planErr || !plan) throw new Error('Plan not found');
    const today = new Date();
    const periodEnd = new Date(today);
    if (data.billing_interval === 'annual') periodEnd.setFullYear(today.getFullYear() + 1);
    else periodEnd.setMonth(today.getMonth() + 1);
    const { error: upErr } = await admin.from('tenant_subscriptions').upsert({
      tenant_id: tenantId, plan_id: plan.id, status: 'active' as const, billing_interval: data.billing_interval,
      current_period_start: today.toISOString().slice(0, 10),
      current_period_end: periodEnd.toISOString().slice(0, 10),
      cancel_at_period_end: false,
    }, { onConflict: 'tenant_id' });
    if (upErr) throw new Error(upErr.message);
    await admin.from('tenants').update({ plan: plan.code }).eq('id', tenantId);
    await admin.from('audit_log').insert({
      entity_type: 'tenant_subscription', entity_id: tenantId, action: 'plan_changed',
      actor_id: userId, metadata: { plan_code: plan.code, billing_interval: data.billing_interval },
    });
    return { ok: true };
  });

export const cancelMyPlan = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await callerRoles(supabase, userId);
    if (!roles.isOrg && !roles.isSuper) throw new Error('Forbidden');
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', userId).maybeSingle();
    const tenantId = profile?.tenant_id;
    if (!tenantId) throw new Error('No organization');
    const admin = await loadAdmin();
    const { error } = await admin.from('tenant_subscriptions').update({ cancel_at_period_end: true }).eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
    await admin.from('audit_log').insert({
      entity_type: 'tenant_subscription', entity_id: tenantId, action: 'plan_cancel_scheduled', actor_id: userId, metadata: {},
    });
    return { ok: true };
  });

export const resumeMyPlan = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const roles = await callerRoles(supabase, userId);
    if (!roles.isOrg && !roles.isSuper) throw new Error('Forbidden');
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', userId).maybeSingle();
    const tenantId = profile?.tenant_id;
    if (!tenantId) throw new Error('No organization');
    const admin = await loadAdmin();
    const { error } = await admin.from('tenant_subscriptions').update({ cancel_at_period_end: false, status: 'active' }).eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
    await admin.from('audit_log').insert({
      entity_type: 'tenant_subscription', entity_id: tenantId, action: 'plan_resumed', actor_id: userId, metadata: {},
    });
    return { ok: true };
  });

// ───────────────────────── Stripe metered billing ─────────────────────────

/**
 * Start (or update) a Stripe metered subscription for the caller's tenant.
 * - Applies a 1-month free trial on the base plan only
 * - AU Payroll add-on (if selected) is billed from day 1
 * - Enables ACH / BECS / SEPA / BACS direct debit on the subscription
 *   plus optional card fallback
 */
export const startTenantSubscription = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      planCode: z.enum(['starter_v2', 'pro_v2']),
      addAuPayrollAddon: z.boolean().optional().default(false),
      debitRegions: z.array(z.enum(DEBIT_REGIONS)).optional().default([...DEBIT_REGIONS]),
      allowCardFallback: z.boolean().optional().default(true),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const admin = await loadAdmin();
    const { getStripe, paymentMethodTypesFor } = await import('@/lib/stripe.server');

    const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single();
    const tenantId = prof?.tenant_id;
    if (!tenantId) throw new Error('No tenant for current user');

    const { data: isOrgAdmin } = await supabase
      .rpc('is_org_admin', { _user_id: userId, _tenant_id: tenantId });
    if (!isOrgAdmin) throw new Error('Only organization admins can manage billing');

    const { data: plans } = await admin
      .from('subscription_plans').select('*').in('code', [data.planCode, 'au_payroll_addon']);
    const basePlan = plans?.find((p: any) => p.code === data.planCode);
    const addonPlan = plans?.find((p: any) => p.code === 'au_payroll_addon');
    if (!basePlan) throw new Error(`Plan ${data.planCode} not found`);
    if (!basePlan.stripe_price_id) {
      throw new Error('Stripe price not configured for this plan. A super-admin must seed Stripe prices first.');
    }
    if (data.addAuPayrollAddon && !addonPlan?.stripe_price_id) {
      throw new Error('AU Payroll add-on Stripe price not configured.');
    }

    const stripe = getStripe();
    const { data: tenant } = await admin
      .from('tenants').select('id, name, contact_email, country_code').eq('id', tenantId).single();

    const { data: existingSub } = await admin
      .from('tenant_subscriptions').select('*').eq('tenant_id', tenantId).maybeSingle();

    let customerId = existingSub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant?.contact_email ?? undefined,
        name: tenant?.name ?? `Tenant ${tenantId}`,
        metadata: { tenant_id: tenantId },
      });
      customerId = customer.id;
    }

    const pmTypes = paymentMethodTypesFor(data.debitRegions, data.allowCardFallback) as any;

    if (existingSub?.stripe_subscription_id) {
      await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
        payment_settings: { payment_method_types: pmTypes },
        proration_behavior: 'none',
      });
      const wantsAddon = data.addAuPayrollAddon && addonPlan?.stripe_price_id;
      if (wantsAddon && !existingSub.addon_subscription_item_id) {
        const item = await stripe.subscriptionItems.create({
          subscription: existingSub.stripe_subscription_id,
          price: addonPlan!.stripe_price_id!,
        });
        await admin.from('tenant_subscriptions').update({
          addon_subscription_item_id: item.id, au_payroll_addon: true,
          debit_regions: data.debitRegions, allow_card_fallback: data.allowCardFallback,
        }).eq('tenant_id', tenantId);
      } else if (!wantsAddon && existingSub.addon_subscription_item_id) {
        await stripe.subscriptionItems.del(existingSub.addon_subscription_item_id);
        await admin.from('tenant_subscriptions').update({
          addon_subscription_item_id: null, au_payroll_addon: false,
          debit_regions: data.debitRegions, allow_card_fallback: data.allowCardFallback,
        }).eq('tenant_id', tenantId);
      } else {
        await admin.from('tenant_subscriptions').update({
          debit_regions: data.debitRegions, allow_card_fallback: data.allowCardFallback,
        }).eq('tenant_id', tenantId);
      }
      return { ok: true, customerId, subscriptionId: existingSub.stripe_subscription_id, updated: true };
    }

    const items: any[] = [{ price: basePlan.stripe_price_id }];
    if (data.addAuPayrollAddon && addonPlan?.stripe_price_id) {
      items.push({ price: addonPlan.stripe_price_id });
    }
    const trialEnd = Math.floor(Date.now() / 1000) + 31 * 24 * 60 * 60;

    const sub: any = await stripe.subscriptions.create({
      customer: customerId,
      items,
      collection_method: 'charge_automatically',
      payment_settings: { payment_method_types: pmTypes, save_default_payment_method: 'on_subscription' },
      trial_end: trialEnd,
      trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
      proration_behavior: 'none',
      metadata: { tenant_id: tenantId },
    });

    const baseItem = sub.items.data.find((i: any) => i.price.id === basePlan.stripe_price_id);
    const addonItem = sub.items.data.find((i: any) => addonPlan && i.price.id === addonPlan.stripe_price_id);

    await admin.from('tenant_subscriptions').upsert({
      tenant_id: tenantId, plan_id: basePlan.id, status: 'trialing', billing_interval: 'monthly',
      current_period_start: new Date(sub.current_period_start * 1000).toISOString().slice(0, 10),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString().slice(0, 10),
      trial_ends_at: new Date(trialEnd * 1000).toISOString().slice(0, 10),
      stripe_customer_id: customerId, stripe_subscription_id: sub.id,
      base_subscription_item_id: baseItem?.id ?? null,
      addon_subscription_item_id: addonItem?.id ?? null,
      au_payroll_addon: !!addonItem,
      debit_regions: data.debitRegions, allow_card_fallback: data.allowCardFallback,
      trial_consumed: false,
    }, { onConflict: 'tenant_id' });

    await admin.from('billing_audit_log').insert({
      tenant_id: tenantId, event_type: 'subscription.created',
      payload: { subscription_id: sub.id, plan: basePlan.code, addon: !!addonItem, debit_regions: data.debitRegions },
    });

    return { ok: true, customerId, subscriptionId: sub.id, trialEnd };
  });

/** Hosted Stripe Checkout (mode=setup) so the admin can attach a debit mandate. */
export const createBillingSetupLink = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const admin = await loadAdmin();
    const { getStripe, paymentMethodTypesFor } = await import('@/lib/stripe.server');
    const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single();
    const tenantId = prof?.tenant_id;
    if (!tenantId) throw new Error('No tenant');
    const { data: sub } = await admin.from('tenant_subscriptions').select('*').eq('tenant_id', tenantId).single();
    if (!sub?.stripe_customer_id) throw new Error('No Stripe customer; start a subscription first');
    const stripe = getStripe();
    const base = process.env.APP_URL ?? '';
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: sub.stripe_customer_id,
      payment_method_types: paymentMethodTypesFor(sub.debit_regions ?? [], sub.allow_card_fallback ?? true) as any,
      success_url: `${base}/settings/billing?setup=success`,
      cancel_url: `${base}/settings/billing?setup=cancelled`,
    });
    return { url: session.url };
  });

export const reportMonthlyUsageForTenant = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      tenantId: z.string().uuid(),
      year: z.number().int().min(2024).max(2100),
      month: z.number().int().min(1).max(12),
      dryRun: z.boolean().optional().default(false),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: isSuper } = await supabase.rpc('has_role', { _user_id: userId, _role: 'super_admin' });
    const { data: isAdmin } = await supabase.rpc('is_org_admin', { _user_id: userId, _tenant_id: data.tenantId });
    if (!isSuper && !isAdmin) throw new Error('Forbidden');
    const { runMonthlyBillingForTenant } = await import('@/lib/billing.server');
    return runMonthlyBillingForTenant(data.tenantId, data.year, data.month, !!data.dryRun);
  });

export const previewTenantHeadcount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ year: z.number().int().optional(), month: z.number().int().min(1).max(12).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single();
    if (!prof?.tenant_id) throw new Error('No tenant');
    const now = new Date();
    const year = data.year ?? now.getUTCFullYear();
    const month = data.month ?? now.getUTCMonth() + 1;
    const { data: rows, error } = await supabase
      .rpc('tenant_net_headcount', { _tenant: prof.tenant_id, _year: year, _month: month });
    if (error) throw error;
    return { year, month, ...(rows?.[0] ?? { net_employees: 0, joined_count: 0, left_count: 0 }) };
  });

export const listTenantBillingSnapshots = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: prof } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single();
    if (!prof?.tenant_id) return { items: [] };
    const { data, error } = await supabase
      .from('tenant_billing_snapshots').select('*')
      .eq('tenant_id', prof.tenant_id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })
      .limit(24);
    if (error) throw error;
    return { items: data ?? [] };
  });
