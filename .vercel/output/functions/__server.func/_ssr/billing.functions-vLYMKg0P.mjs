import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, z as stringType, A as booleanType, D as arrayType, C as numberType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
const DEBIT_REGIONS = ["ach", "becs", "sepa", "bacs"];
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function callerRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  return {
    isSuper: roles.includes("super_admin"),
    isOrg: roles.includes("org_admin"),
    isRegional: roles.includes("regional_admin")
  };
}
const listPlans_createServerFn_handler = createServerRpc({
  id: "4823694e81cc628243ce310a62814ff9f72b20b4e8fa308dbbe9cf84860215c5",
  name: "listPlans",
  filename: "src/lib/billing.functions.ts"
}, (opts) => listPlans.__executeServer(opts));
const listPlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPlans_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    plans: data ?? []
  };
});
const getMyBilling_createServerFn_handler = createServerRpc({
  id: "6bad32af0e31b7572f177d7091dc654cec925dff506e01bc18378bfda76ca5c8",
  name: "getMyBilling",
  filename: "src/lib/billing.functions.ts"
}, (opts) => getMyBilling.__executeServer(opts));
const getMyBilling = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyBilling_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id ?? null;
  if (!tenantId) {
    return {
      tenant: null,
      subscription: null,
      plan: null,
      employeeCount: 0,
      history: []
    };
  }
  const admin = await loadAdmin();
  const [{
    data: tenant
  }, {
    data: sub
  }, {
    count: employeeCount
  }, {
    data: history
  }] = await Promise.all([admin.from("tenants").select("id, name, plan, status, country_code, currency_code").eq("id", tenantId).maybeSingle(), admin.from("tenant_subscriptions").select("id, status, billing_interval, current_period_start, current_period_end, trial_ends_at, cancel_at_period_end, plan_id, stripe_customer_id, stripe_subscription_id, debit_regions, allow_card_fallback, au_payroll_addon, trial_consumed").eq("tenant_id", tenantId).maybeSingle(), admin.from("employees").select("id", {
    count: "exact",
    head: true
  }).eq("tenant_id", tenantId), admin.from("subscription_confirmations").select("id, amount, currency_code, bank_reference, period_start, period_end, notes, created_at").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(20)]);
  let plan = null;
  if (sub?.plan_id) {
    const {
      data
    } = await admin.from("subscription_plans").select("*").eq("id", sub.plan_id).maybeSingle();
    plan = data;
  }
  return {
    tenant: tenant ?? null,
    subscription: sub ?? null,
    plan,
    employeeCount: employeeCount ?? 0,
    history: history ?? []
  };
});
const changePlanSchema = objectType({
  plan_code: stringType().min(1).max(40),
  billing_interval: enumType(["monthly", "annual"])
});
const changeMyPlan_createServerFn_handler = createServerRpc({
  id: "5a84c843e1e0327816d1cd280d2324c703184fe899c526aa06e6294208d7e392",
  name: "changeMyPlan",
  filename: "src/lib/billing.functions.ts"
}, (opts) => changeMyPlan.__executeServer(opts));
const changeMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => changePlanSchema.parse(d)).handler(changeMyPlan_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await callerRoles(supabase, userId);
  if (!roles.isOrg && !roles.isSuper) throw new Error("Forbidden");
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  const admin = await loadAdmin();
  const {
    data: plan,
    error: planErr
  } = await admin.from("subscription_plans").select("id, code").eq("code", data.plan_code).eq("is_active", true).maybeSingle();
  if (planErr || !plan) throw new Error("Plan not found");
  const today = /* @__PURE__ */ new Date();
  const periodEnd = new Date(today);
  if (data.billing_interval === "annual") periodEnd.setFullYear(today.getFullYear() + 1);
  else periodEnd.setMonth(today.getMonth() + 1);
  const {
    error: upErr
  } = await admin.from("tenant_subscriptions").upsert({
    tenant_id: tenantId,
    plan_id: plan.id,
    status: "active",
    billing_interval: data.billing_interval,
    current_period_start: today.toISOString().slice(0, 10),
    current_period_end: periodEnd.toISOString().slice(0, 10),
    cancel_at_period_end: false
  }, {
    onConflict: "tenant_id"
  });
  if (upErr) throw new Error(upErr.message);
  await admin.from("tenants").update({
    plan: plan.code
  }).eq("id", tenantId);
  await admin.from("audit_log").insert({
    entity_type: "tenant_subscription",
    entity_id: tenantId,
    action: "plan_changed",
    actor_id: userId,
    metadata: {
      plan_code: plan.code,
      billing_interval: data.billing_interval
    }
  });
  return {
    ok: true
  };
});
const cancelMyPlan_createServerFn_handler = createServerRpc({
  id: "0fecd8c9bcd50441bd48f1a05583b3ab9a4c5effa14c058075aa600bb39414a0",
  name: "cancelMyPlan",
  filename: "src/lib/billing.functions.ts"
}, (opts) => cancelMyPlan.__executeServer(opts));
const cancelMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(cancelMyPlan_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await callerRoles(supabase, userId);
  if (!roles.isOrg && !roles.isSuper) throw new Error("Forbidden");
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  const admin = await loadAdmin();
  const {
    error
  } = await admin.from("tenant_subscriptions").update({
    cancel_at_period_end: true
  }).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  await admin.from("audit_log").insert({
    entity_type: "tenant_subscription",
    entity_id: tenantId,
    action: "plan_cancel_scheduled",
    actor_id: userId,
    metadata: {}
  });
  return {
    ok: true
  };
});
const resumeMyPlan_createServerFn_handler = createServerRpc({
  id: "220592c9aac99e25d1110a8f24aa98663b19bd1e29a4a7976f4e013429848ab2",
  name: "resumeMyPlan",
  filename: "src/lib/billing.functions.ts"
}, (opts) => resumeMyPlan.__executeServer(opts));
const resumeMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(resumeMyPlan_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await callerRoles(supabase, userId);
  if (!roles.isOrg && !roles.isSuper) throw new Error("Forbidden");
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = profile?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  const admin = await loadAdmin();
  const {
    error
  } = await admin.from("tenant_subscriptions").update({
    cancel_at_period_end: false,
    status: "active"
  }).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  await admin.from("audit_log").insert({
    entity_type: "tenant_subscription",
    entity_id: tenantId,
    action: "plan_resumed",
    actor_id: userId,
    metadata: {}
  });
  return {
    ok: true
  };
});
const startTenantSubscription_createServerFn_handler = createServerRpc({
  id: "0927b2916a315fddf86b55e3fd93ce3f84d757e2936cb3de510f7fe719af3446",
  name: "startTenantSubscription",
  filename: "src/lib/billing.functions.ts"
}, (opts) => startTenantSubscription.__executeServer(opts));
const startTenantSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  planCode: enumType(["starter_v2", "pro_v2"]),
  addAuPayrollAddon: booleanType().optional().default(false),
  debitRegions: arrayType(enumType(DEBIT_REGIONS)).optional().default([...DEBIT_REGIONS]),
  allowCardFallback: booleanType().optional().default(true)
}).parse(input)).handler(startTenantSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    getStripe,
    paymentMethodTypesFor
  } = await import("./stripe.server-C4vshzUl.mjs");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const tenantId = prof?.tenant_id;
  if (!tenantId) throw new Error("No tenant for current user");
  const {
    data: isOrgAdmin
  } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: tenantId
  });
  if (!isOrgAdmin) throw new Error("Only organization admins can manage billing");
  const {
    data: plans
  } = await admin.from("subscription_plans").select("*").in("code", [data.planCode, "au_payroll_addon"]);
  const basePlan = plans?.find((p) => p.code === data.planCode);
  const addonPlan = plans?.find((p) => p.code === "au_payroll_addon");
  if (!basePlan) throw new Error(`Plan ${data.planCode} not found`);
  if (!basePlan.stripe_price_id) {
    throw new Error("Stripe price not configured for this plan. A super-admin must seed Stripe prices first.");
  }
  if (data.addAuPayrollAddon && !addonPlan?.stripe_price_id) {
    throw new Error("AU Payroll add-on Stripe price not configured.");
  }
  const stripe = getStripe();
  const {
    data: tenant
  } = await admin.from("tenants").select("id, name, contact_email, country_code").eq("id", tenantId).single();
  const {
    data: existingSub
  } = await admin.from("tenant_subscriptions").select("*").eq("tenant_id", tenantId).maybeSingle();
  let customerId = existingSub?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant?.contact_email ?? void 0,
      name: tenant?.name ?? `Tenant ${tenantId}`,
      metadata: {
        tenant_id: tenantId
      }
    });
    customerId = customer.id;
  }
  const pmTypes = paymentMethodTypesFor(data.debitRegions, data.allowCardFallback);
  if (existingSub?.stripe_subscription_id) {
    await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
      payment_settings: {
        payment_method_types: pmTypes
      },
      proration_behavior: "none"
    });
    const wantsAddon = data.addAuPayrollAddon && addonPlan?.stripe_price_id;
    if (wantsAddon && !existingSub.addon_subscription_item_id) {
      const item = await stripe.subscriptionItems.create({
        subscription: existingSub.stripe_subscription_id,
        price: addonPlan.stripe_price_id
      });
      await admin.from("tenant_subscriptions").update({
        addon_subscription_item_id: item.id,
        au_payroll_addon: true,
        debit_regions: data.debitRegions,
        allow_card_fallback: data.allowCardFallback
      }).eq("tenant_id", tenantId);
    } else if (!wantsAddon && existingSub.addon_subscription_item_id) {
      await stripe.subscriptionItems.del(existingSub.addon_subscription_item_id);
      await admin.from("tenant_subscriptions").update({
        addon_subscription_item_id: null,
        au_payroll_addon: false,
        debit_regions: data.debitRegions,
        allow_card_fallback: data.allowCardFallback
      }).eq("tenant_id", tenantId);
    } else {
      await admin.from("tenant_subscriptions").update({
        debit_regions: data.debitRegions,
        allow_card_fallback: data.allowCardFallback
      }).eq("tenant_id", tenantId);
    }
    return {
      ok: true,
      customerId,
      subscriptionId: existingSub.stripe_subscription_id,
      updated: true
    };
  }
  const items = [{
    price: basePlan.stripe_price_id
  }];
  if (data.addAuPayrollAddon && addonPlan?.stripe_price_id) {
    items.push({
      price: addonPlan.stripe_price_id
    });
  }
  const trialEnd = Math.floor(Date.now() / 1e3) + 31 * 24 * 60 * 60;
  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items,
    collection_method: "charge_automatically",
    payment_settings: {
      payment_method_types: pmTypes,
      save_default_payment_method: "on_subscription"
    },
    trial_end: trialEnd,
    trial_settings: {
      end_behavior: {
        missing_payment_method: "pause"
      }
    },
    proration_behavior: "none",
    metadata: {
      tenant_id: tenantId
    }
  });
  const baseItem = sub.items.data.find((i) => i.price.id === basePlan.stripe_price_id);
  const addonItem = sub.items.data.find((i) => addonPlan && i.price.id === addonPlan.stripe_price_id);
  await admin.from("tenant_subscriptions").upsert({
    tenant_id: tenantId,
    plan_id: basePlan.id,
    status: "trialing",
    billing_interval: "monthly",
    current_period_start: new Date(sub.current_period_start * 1e3).toISOString().slice(0, 10),
    current_period_end: new Date(sub.current_period_end * 1e3).toISOString().slice(0, 10),
    trial_ends_at: new Date(trialEnd * 1e3).toISOString().slice(0, 10),
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    base_subscription_item_id: baseItem?.id ?? null,
    addon_subscription_item_id: addonItem?.id ?? null,
    au_payroll_addon: !!addonItem,
    debit_regions: data.debitRegions,
    allow_card_fallback: data.allowCardFallback,
    trial_consumed: false
  }, {
    onConflict: "tenant_id"
  });
  await admin.from("billing_audit_log").insert({
    tenant_id: tenantId,
    event_type: "subscription.created",
    payload: {
      subscription_id: sub.id,
      plan: basePlan.code,
      addon: !!addonItem,
      debit_regions: data.debitRegions
    }
  });
  return {
    ok: true,
    customerId,
    subscriptionId: sub.id,
    trialEnd
  };
});
const createBillingSetupLink_createServerFn_handler = createServerRpc({
  id: "acec9810c09fe9304bcd76ddcb4ea35d766b86016561451ef285d48d7f7ee1ab",
  name: "createBillingSetupLink",
  filename: "src/lib/billing.functions.ts"
}, (opts) => createBillingSetupLink.__executeServer(opts));
const createBillingSetupLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createBillingSetupLink_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    getStripe,
    paymentMethodTypesFor
  } = await import("./stripe.server-C4vshzUl.mjs");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const tenantId = prof?.tenant_id;
  if (!tenantId) throw new Error("No tenant");
  const {
    data: sub
  } = await admin.from("tenant_subscriptions").select("*").eq("tenant_id", tenantId).single();
  if (!sub?.stripe_customer_id) throw new Error("No Stripe customer; start a subscription first");
  const stripe = getStripe();
  const base = process.env.APP_URL ?? "";
  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: sub.stripe_customer_id,
    payment_method_types: paymentMethodTypesFor(sub.debit_regions ?? [], sub.allow_card_fallback ?? true),
    success_url: `${base}/settings/billing?setup=success`,
    cancel_url: `${base}/settings/billing?setup=cancelled`
  });
  return {
    url: session.url
  };
});
const reportMonthlyUsageForTenant_createServerFn_handler = createServerRpc({
  id: "e24c5fc507076f6fa09115878246ddf7f869912451c6f62ba1139e8077f3169d",
  name: "reportMonthlyUsageForTenant",
  filename: "src/lib/billing.functions.ts"
}, (opts) => reportMonthlyUsageForTenant.__executeServer(opts));
const reportMonthlyUsageForTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  dryRun: booleanType().optional().default(false)
}).parse(input)).handler(reportMonthlyUsageForTenant_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: isSuper
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  });
  const {
    data: isAdmin
  } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: data.tenantId
  });
  if (!isSuper && !isAdmin) throw new Error("Forbidden");
  const {
    runMonthlyBillingForTenant
  } = await import("./billing.server-BzOVdJud.mjs");
  return runMonthlyBillingForTenant(data.tenantId, data.year, data.month, !!data.dryRun);
});
const previewTenantHeadcount_createServerFn_handler = createServerRpc({
  id: "d93e92de1459204136fbc82c7513cd6b8173025afea2fe04d3d02d4ba55e0d73",
  name: "previewTenantHeadcount",
  filename: "src/lib/billing.functions.ts"
}, (opts) => previewTenantHeadcount.__executeServer(opts));
const previewTenantHeadcount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  year: numberType().int().optional(),
  month: numberType().int().min(1).max(12).optional()
}).parse(input)).handler(previewTenantHeadcount_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const now = /* @__PURE__ */ new Date();
  const year = data.year ?? now.getUTCFullYear();
  const month = data.month ?? now.getUTCMonth() + 1;
  const {
    data: rows,
    error
  } = await supabase.rpc("tenant_net_headcount", {
    _tenant: prof.tenant_id,
    _year: year,
    _month: month
  });
  if (error) throw error;
  return {
    year,
    month,
    ...rows?.[0] ?? {
      net_employees: 0,
      joined_count: 0,
      left_count: 0
    }
  };
});
const listTenantBillingSnapshots_createServerFn_handler = createServerRpc({
  id: "13aa229a7d5ca150d6b72f2da8147624eb2e3430f362730f013eaddc7f0cfa8e",
  name: "listTenantBillingSnapshots",
  filename: "src/lib/billing.functions.ts"
}, (opts) => listTenantBillingSnapshots.__executeServer(opts));
const listTenantBillingSnapshots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantBillingSnapshots_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  if (!prof?.tenant_id) return {
    items: []
  };
  const {
    data,
    error
  } = await supabase.from("tenant_billing_snapshots").select("*").eq("tenant_id", prof.tenant_id).order("period_year", {
    ascending: false
  }).order("period_month", {
    ascending: false
  }).limit(24);
  if (error) throw error;
  return {
    items: data ?? []
  };
});
export {
  cancelMyPlan_createServerFn_handler,
  changeMyPlan_createServerFn_handler,
  createBillingSetupLink_createServerFn_handler,
  getMyBilling_createServerFn_handler,
  listPlans_createServerFn_handler,
  listTenantBillingSnapshots_createServerFn_handler,
  previewTenantHeadcount_createServerFn_handler,
  reportMonthlyUsageForTenant_createServerFn_handler,
  resumeMyPlan_createServerFn_handler,
  startTenantSubscription_createServerFn_handler
};
