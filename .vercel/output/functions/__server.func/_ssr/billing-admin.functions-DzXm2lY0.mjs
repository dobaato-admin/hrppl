import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
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
async function ensureSuper(supabase, userId) {
  const {
    data
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  });
  if (!data) throw new Error("Super admin only");
}
const seedStripePrices_createServerFn_handler = createServerRpc({
  id: "56009bcd82cc592ed4df4e8902eba9f6d4ad9503fe938232f7d55e1a0474c362",
  name: "seedStripePrices",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => seedStripePrices.__executeServer(opts));
const seedStripePrices = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(seedStripePrices_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    getStripe
  } = await import("./stripe.server-C4vshzUl.mjs");
  const stripe = getStripe();
  const specs = [{
    code: "starter_v2",
    name: "hrppl Starter",
    amountCents: 100
  }, {
    code: "pro_v2",
    name: "hrppl Pro",
    amountCents: 300
  }, {
    code: "au_payroll_addon",
    name: "hrppl AU Payroll Add-on",
    amountCents: 200
  }];
  const {
    data: existing
  } = await supabaseAdmin.from("subscription_plans").select("id, code, stripe_price_id").in("code", specs.map((s) => s.code));
  const out = [];
  for (const spec of specs) {
    const row = existing?.find((r) => r.code === spec.code);
    if (row?.stripe_price_id) {
      out.push({
        code: spec.code,
        price_id: row.stripe_price_id
      });
      continue;
    }
    const product = await stripe.products.create({
      name: spec.name,
      metadata: {
        plan_code: spec.code
      }
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: spec.amountCents,
      recurring: {
        interval: "month",
        usage_type: "metered",
        aggregate_usage: "last_during_period"
      },
      metadata: {
        plan_code: spec.code,
        basis: "net_active_employees_per_calendar_month"
      }
    });
    await supabaseAdmin.from("subscription_plans").update({
      stripe_price_id: price.id
    }).eq("code", spec.code);
    out.push({
      code: spec.code,
      price_id: price.id
    });
  }
  return {
    ok: true,
    prices: out
  };
});
const listBillingAlerts_createServerFn_handler = createServerRpc({
  id: "b27b018f44dc7f7ef1ebe15fe8418bcc6fb40c1bdd9fa2e01a8c500843aa86a8",
  name: "listBillingAlerts",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listBillingAlerts.__executeServer(opts));
const listBillingAlerts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listBillingAlerts_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("billing_admin_alerts").select("*, tenants(name)").order("created_at", {
    ascending: false
  }).limit(100);
  if (error) throw new Error(error.message);
  return {
    items: data ?? []
  };
});
async function actorEmail(supabase, userId) {
  try {
    const {
      data
    } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    return data?.email ?? null;
  } catch {
    return null;
  }
}
const resolveBillingAlert_createServerFn_handler = createServerRpc({
  id: "543f2aba4ff3039c548b52dc68cdef230c52a25c755f98f9e20e13f3de0caaba",
  name: "resolveBillingAlert",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => resolveBillingAlert.__executeServer(opts));
const resolveBillingAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(resolveBillingAlert_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const {
    data: before
  } = await supabaseAdmin.from("billing_admin_alerts").select("id, status, tenant_id").eq("id", data.id).single();
  const {
    data: after
  } = await supabaseAdmin.from("billing_admin_alerts").update({
    status: "resolved",
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolved_by: userId
  }).eq("id", data.id).select("id, status").single();
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: "alert.resolve",
    target_type: "alert",
    target_id: data.id,
    tenant_id: before?.tenant_id ?? null,
    before,
    after
  });
  return {
    ok: true
  };
});
const retryBillingAlert_createServerFn_handler = createServerRpc({
  id: "5a42409c302e66a9653658bce909de48ebeb1efb38974f842890346bd0a632ac",
  name: "retryBillingAlert",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => retryBillingAlert.__executeServer(opts));
const retryBillingAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(retryBillingAlert_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const {
    data: alert
  } = await supabaseAdmin.from("billing_admin_alerts").select("*").eq("id", data.id).single();
  if (!alert) throw new Error("Alert not found");
  if (alert.status === "resolved") {
    await logBillingOpsAudit({
      actor_user_id: userId,
      actor_email: await actorEmail(supabase, userId),
      action: "alert.retry.noop",
      target_type: "alert",
      target_id: data.id,
      tenant_id: alert.tenant_id,
      before: alert,
      after: alert,
      metadata: {
        reason: "already_resolved"
      }
    });
    return {
      ok: true,
      alreadyResolved: true
    };
  }
  const ctx = alert.context ?? {};
  const lockKey = `${alert.tenant_id ?? ""}:${ctx.year ?? ""}:${ctx.month ?? ""}`;
  await supabaseAdmin.from("billing_admin_alerts").update({
    retry_count: (alert.retry_count ?? 0) + 1,
    last_retry_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  let result = {
    ok: false,
    message: "No retry handler for this alert type"
  };
  const before = {
    ...alert
  };
  if (alert.alert_type === "stripe_usage_report_failed" || alert.alert_type === "monthly_billing_unhandled_error" || alert.alert_type === "monthly_billing_partial_failure") {
    const {
      runMonthlyBillingForTenant,
      runMonthlyBillingForAllTenants
    } = await import("./billing.server-BzOVdJud.mjs");
    if (alert.tenant_id && ctx.year && ctx.month) {
      result = await runMonthlyBillingForTenant(alert.tenant_id, ctx.year, ctx.month, false);
    } else if (ctx.year && ctx.month) {
      result = await runMonthlyBillingForAllTenants(ctx.year, ctx.month);
    }
  } else if (alert.alert_type === "reconciliation_run_failed" || alert.alert_type === "reconciliation_discrepancy" || alert.alert_type === "reconciliation_stripe_read_failed") {
    const {
      reconcileMonth
    } = await import("./billing.server-BzOVdJud.mjs");
    if (ctx.year && ctx.month) result = await reconcileMonth(ctx.year, ctx.month);
  } else if (alert.alert_type === "invoice_payment_failed" && ctx.invoice_id) {
    const {
      getStripe
    } = await import("./stripe.server-C4vshzUl.mjs");
    const stripe = getStripe();
    result = await stripe.invoices.pay(ctx.invoice_id, void 0, {
      idempotencyKey: `invoice_pay:${ctx.invoice_id}`
    }).catch((e) => ({
      error: e?.message
    }));
  }
  const ok = !result?.error && (Array.isArray(result) ? !result.some((r) => r.status === "failed") : result?.status !== "failed");
  let after = before;
  if (ok) {
    const {
      data: resolved
    } = await supabaseAdmin.from("billing_admin_alerts").update({
      status: "resolved",
      resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
      resolved_by: userId,
      next_retry_at: null
    }).eq("id", data.id).select("*").single();
    after = resolved;
  } else {
    const {
      getRetryPolicy,
      computeNextRetryAt
    } = await import("./billing-alerts.server-yXHN9JNF.mjs");
    const policy = await getRetryPolicy(alert.alert_type);
    const attempt = (alert.retry_count ?? 0) + 1;
    const nextAt = computeNextRetryAt(policy, attempt);
    await supabaseAdmin.from("billing_admin_alerts").update({
      next_retry_at: nextAt,
      auto_retry_exhausted: policy?.enabled && nextAt === null
    }).eq("id", data.id);
  }
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: ok ? "alert.retry.success" : "alert.retry.failed",
    target_type: "alert",
    target_id: data.id,
    tenant_id: alert.tenant_id,
    before,
    after,
    metadata: {
      lockKey,
      alert_type: alert.alert_type,
      result_summary: summarize(result)
    }
  });
  return {
    ok,
    result
  };
});
function summarize(r) {
  if (!r) return null;
  if (Array.isArray(r)) return {
    count: r.length,
    failed: r.filter((x) => x.status === "failed").length
  };
  return {
    status: r.status,
    error: r.error
  };
}
const listTenantsBillingOverview_createServerFn_handler = createServerRpc({
  id: "d381560dbf7cf124233e9cc95534e52ff527d33405202ed17430f9dbddb87f3f",
  name: "listTenantsBillingOverview",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listTenantsBillingOverview.__executeServer(opts));
const listTenantsBillingOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantsBillingOverview_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: subs
  } = await supabaseAdmin.from("tenant_subscriptions").select(`
        tenant_id, status, plan_id, trial_ends_at, trial_consumed,
        debit_regions, allow_card_fallback, au_payroll_addon,
        stripe_customer_id, stripe_subscription_id,
        mandate_status, mandate_payment_method_id, mandate_last_checked_at,
        current_period_start, current_period_end,
        tenants(name, country_code),
        subscription_plans!tenant_subscriptions_plan_id_fkey(code, name)
      `).order("updated_at", {
    ascending: false
  });
  const tenantIds = (subs ?? []).map((s) => s.tenant_id);
  const invoicesByTenant = {};
  if (tenantIds.length) {
    const {
      data: invs
    } = await supabaseAdmin.from("tenant_invoices").select("*").in("tenant_id", tenantIds).order("invoice_created_at", {
      ascending: false
    }).limit(500);
    for (const inv of invs ?? []) {
      (invoicesByTenant[inv.tenant_id] ||= []).push(inv);
    }
  }
  return {
    items: (subs ?? []).map((s) => ({
      ...s,
      recent_invoices: (invoicesByTenant[s.tenant_id] ?? []).slice(0, 5),
      failed_invoices: (invoicesByTenant[s.tenant_id] ?? []).filter((i) => i.status === "uncollectible" || i.status === "open" || (i.attempt_count ?? 0) > 1).length
    }))
  };
});
const runReconciliationForMonth_createServerFn_handler = createServerRpc({
  id: "36002535fb1e225721b4860489096fcd2b4b75866a0c63d6ec6b6c2f7281d1aa",
  name: "runReconciliationForMonth",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => runReconciliationForMonth.__executeServer(opts));
const runReconciliationForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12)
}).parse(i)).handler(runReconciliationForMonth_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    reconcileMonth
  } = await import("./billing.server-BzOVdJud.mjs");
  return reconcileMonth(data.year, data.month);
});
function csvEscape(v) {
  if (v === null || v === void 0) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const exportBillingForMonth_createServerFn_handler = createServerRpc({
  id: "c7e9e012819dc4c51d2c906a4d6bf65f09d06e45ee9e2631cfa0866036effb41",
  name: "exportBillingForMonth",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => exportBillingForMonth.__executeServer(opts));
const exportBillingForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  format: enumType(["csv", "pdf"]).default("csv")
}).parse(i)).handler(exportBillingForMonth_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: snaps
  } = await supabaseAdmin.from("tenant_billing_snapshots").select("*, tenants(name, country_code)").eq("period_year", data.year).eq("period_month", data.month).order("created_at", {
    ascending: false
  });
  const {
    data: recon
  } = await supabaseAdmin.from("billing_reconciliation_log").select("*").eq("period_year", data.year).eq("period_month", data.month);
  const reconByTenant = {};
  for (const r of recon ?? []) reconByTenant[r.tenant_id] = r;
  const rows = (snaps ?? []).map((s) => ({
    tenant_id: s.tenant_id,
    tenant_name: s.tenants?.name ?? "",
    country: s.tenants?.country_code ?? "",
    period: `${data.year}-${String(data.month).padStart(2, "0")}`,
    net_employees: s.net_employees,
    joined: s.joined_count,
    left: s.left_count,
    base_units: s.base_units,
    addon_units: s.addon_units,
    trial_applied: s.trial_applied,
    status: s.status,
    stripe_base_usage_id: s.stripe_base_usage_id ?? "",
    stripe_addon_usage_id: s.stripe_addon_usage_id ?? "",
    reported_at: s.reported_at ?? "",
    reconciled_reported_base: reconByTenant[s.tenant_id]?.reported_base ?? "",
    reconciled_reported_addon: reconByTenant[s.tenant_id]?.reported_addon ?? "",
    reconciliation_delta: (reconByTenant[s.tenant_id]?.base_delta ?? 0) + (reconByTenant[s.tenant_id]?.addon_delta ?? 0),
    has_discrepancy: reconByTenant[s.tenant_id]?.has_discrepancy ?? false,
    error: s.error ?? ""
  }));
  if (data.format === "csv") {
    const headers = Object.keys(rows[0] ?? {
      tenant_id: "",
      tenant_name: "",
      country: "",
      period: "",
      net_employees: 0,
      joined: 0,
      left: 0,
      base_units: 0,
      addon_units: 0,
      trial_applied: false,
      status: "",
      stripe_base_usage_id: "",
      stripe_addon_usage_id: "",
      reported_at: "",
      reconciled_reported_base: "",
      reconciled_reported_addon: "",
      reconciliation_delta: 0,
      has_discrepancy: false,
      error: ""
    });
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(","))].join("\n");
    return {
      format: "csv",
      filename: `billing-${data.year}-${String(data.month).padStart(2, "0")}.csv`,
      mime: "text/csv",
      content: csv
    };
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Billing ${data.year}-${data.month}</title>
<style>
body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;color:#0f172a}
h1{font-size:18px;margin:0 0 12px}
table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border:1px solid #e2e8f0;padding:4px 6px;text-align:left}
th{background:#f1f5f9}
.bad{background:#fee2e2}
</style></head><body>
<h1>Billing snapshots — ${data.year}-${String(data.month).padStart(2, "0")}</h1>
<table><thead><tr>
<th>Tenant</th><th>Country</th><th>Net emp.</th><th>Base</th><th>Addon</th>
<th>Trial</th><th>Status</th><th>Reported Δ</th><th>Reported at</th><th>Error</th>
</tr></thead><tbody>
${rows.map((r) => `<tr class="${r.has_discrepancy ? "bad" : ""}">
<td>${r.tenant_name}</td><td>${r.country}</td><td>${r.net_employees}</td>
<td>${r.base_units}</td><td>${r.addon_units}</td>
<td>${r.trial_applied ? "Yes" : ""}</td><td>${r.status}</td>
<td>${r.reconciliation_delta}</td><td>${r.reported_at}</td><td>${r.error}</td>
</tr>`).join("")}
</tbody></table>
<p style="margin-top:16px;font-size:10px;color:#64748b">Generated ${(/* @__PURE__ */ new Date()).toISOString()} — print this page to PDF for archive.</p>
</body></html>`;
  return {
    format: "pdf",
    filename: `billing-${data.year}-${String(data.month).padStart(2, "0")}.html`,
    mime: "text/html",
    content: html
  };
});
const scheduleTenantPlanChange_createServerFn_handler = createServerRpc({
  id: "eb1089c484d1e0548424139905e67d90196e1bbdeab974097626d0325615b35f",
  name: "scheduleTenantPlanChange",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => scheduleTenantPlanChange.__executeServer(opts));
const scheduleTenantPlanChange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid(),
  newPlanCode: enumType(["starter_v2", "pro_v2"]),
  effectiveImmediately: booleanType().optional().default(true)
}).parse(i)).handler(scheduleTenantPlanChange_createServerFn_handler, async ({
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
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    getStripe
  } = await import("./stripe.server-C4vshzUl.mjs");
  const stripe = getStripe();
  const {
    data: newPlan
  } = await supabaseAdmin.from("subscription_plans").select("*").eq("code", data.newPlanCode).single();
  if (!newPlan?.stripe_price_id) throw new Error("New plan has no Stripe price configured");
  const {
    data: sub
  } = await supabaseAdmin.from("tenant_subscriptions").select("*").eq("tenant_id", data.tenantId).single();
  if (!sub?.stripe_subscription_id) throw new Error("No Stripe subscription to change");
  if (sub.plan_id === newPlan.id) return {
    ok: true,
    unchanged: true
  };
  const now = /* @__PURE__ */ new Date();
  if (data.effectiveImmediately) {
    if (sub.base_subscription_item_id) {
      await stripe.subscriptionItems.update(sub.base_subscription_item_id, {
        price: newPlan.stripe_price_id,
        proration_behavior: "none"
      });
    }
    await supabaseAdmin.from("tenant_subscriptions").update({
      prior_plan_id: sub.plan_id,
      plan_id: newPlan.id,
      plan_changed_at: now.toISOString(),
      pending_plan_id: null,
      plan_change_effective: now.toISOString().slice(0, 10)
    }).eq("tenant_id", data.tenantId);
    await supabaseAdmin.from("billing_audit_log").insert({
      tenant_id: data.tenantId,
      event_type: "plan.changed",
      payload: {
        from: sub.plan_id,
        to: newPlan.id,
        effective: "immediate",
        prorated: true
      }
    });
    return {
      ok: true,
      effective: "immediate"
    };
  }
  await supabaseAdmin.from("tenant_subscriptions").update({
    pending_plan_id: newPlan.id,
    plan_change_effective: sub.current_period_end
  }).eq("tenant_id", data.tenantId);
  await supabaseAdmin.from("billing_audit_log").insert({
    tenant_id: data.tenantId,
    event_type: "plan.change_scheduled",
    payload: {
      from: sub.plan_id,
      to: newPlan.id,
      effective: sub.current_period_end
    }
  });
  return {
    ok: true,
    effective: sub.current_period_end
  };
});
const listReconciliationForMonth_createServerFn_handler = createServerRpc({
  id: "ecb59828d050cca8bf9b27aae93d9898232d3f32b87ae550918de3f636afa156",
  name: "listReconciliationForMonth",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listReconciliationForMonth.__executeServer(opts));
const listReconciliationForMonth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int(),
  month: numberType().int().min(1).max(12)
}).parse(i)).handler(listReconciliationForMonth_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("billing_reconciliation_log").select("*, tenants(name)").eq("period_year", data.year).eq("period_month", data.month).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    items: rows ?? []
  };
});
const listBillingOpsAudit_createServerFn_handler = createServerRpc({
  id: "d1a592560e2ee4cf5b12da250f45e18702f535a1a53094abeb042c7fdc0adbd3",
  name: "listBillingOpsAudit",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listBillingOpsAudit.__executeServer(opts));
const listBillingOpsAudit = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  action: stringType().optional().nullable(),
  limit: numberType().int().min(1).max(500).optional().default(100)
}).parse(i)).handler(listBillingOpsAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("billing_ops_audit").select("*, tenants(name)").order("created_at", {
    ascending: false
  }).limit(data.limit ?? 100);
  if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
  if (data.action) q = q.eq("action", data.action);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    items: rows ?? []
  };
});
const listDiscrepancies_createServerFn_handler = createServerRpc({
  id: "dbfc5bf6a9532386ec281d2d8d4bd469a47d19c7c6a74d17cab2fbe776c1ba25",
  name: "listDiscrepancies",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listDiscrepancies.__executeServer(opts));
const listDiscrepancies = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().optional().nullable(),
  month: numberType().int().min(1).max(12).optional().nullable(),
  tenantId: stringType().uuid().optional().nullable(),
  onlyDiscrepancies: booleanType().optional().default(true)
}).parse(i)).handler(listDiscrepancies_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("billing_reconciliation_log").select("*, tenants(name, country_code)").order("created_at", {
    ascending: false
  }).limit(1e3);
  if (data.year) q = q.eq("period_year", data.year);
  if (data.month) q = q.eq("period_month", data.month);
  if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
  if (data.onlyDiscrepancies) q = q.eq("has_discrepancy", true);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  (rows ?? []).map((r) => `${r.tenant_id}|${r.period_year}|${r.period_month}`);
  const tenantIds = Array.from(new Set((rows ?? []).map((r) => r.tenant_id)));
  const {
    data: snaps
  } = tenantIds.length ? await supabaseAdmin.from("tenant_billing_snapshots").select("tenant_id, period_year, period_month, net_employees, joined_count, left_count, base_units, addon_units, trial_applied, plan_change_prorated, stripe_base_usage_id, stripe_addon_usage_id, reported_at, status, error").in("tenant_id", tenantIds) : {
    data: []
  };
  const snapBy = {};
  for (const s of snaps ?? []) snapBy[`${s.tenant_id}|${s.period_year}|${s.period_month}`] = s;
  return {
    items: (rows ?? []).map((r) => ({
      ...r,
      snapshot: snapBy[`${r.tenant_id}|${r.period_year}|${r.period_month}`] ?? null
    }))
  };
});
const exportDiscrepanciesCsv_createServerFn_handler = createServerRpc({
  id: "11361e080bf6fd48995609975a61bcc526e5e4ffb72cdeda4601f69a92a5d6a2",
  name: "exportDiscrepanciesCsv",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => exportDiscrepanciesCsv.__executeServer(opts));
const exportDiscrepanciesCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().optional().nullable(),
  month: numberType().int().min(1).max(12).optional().nullable(),
  tenantId: stringType().uuid().optional().nullable(),
  onlyDiscrepancies: booleanType().optional().default(true)
}).parse(i)).handler(exportDiscrepanciesCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("billing_reconciliation_log").select("*, tenants(name, country_code)").order("created_at", {
    ascending: false
  }).limit(5e3);
  if (data.year) q = q.eq("period_year", data.year);
  if (data.month) q = q.eq("period_month", data.month);
  if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
  if (data.onlyDiscrepancies) q = q.eq("has_discrepancy", true);
  const {
    data: rows
  } = await q;
  const headers = ["tenant_id", "tenant_name", "country", "period", "computed_base", "reported_base", "base_delta", "computed_addon", "reported_addon", "addon_delta", "has_discrepancy", "notes", "logged_at"];
  const lines = [headers.join(",")];
  for (const r of rows ?? []) {
    const row = r;
    lines.push([row.tenant_id, row.tenants?.name ?? "", row.tenants?.country_code ?? "", `${row.period_year}-${String(row.period_month).padStart(2, "0")}`, row.computed_base, row.reported_base, row.base_delta, row.computed_addon, row.reported_addon, row.addon_delta, row.has_discrepancy, row.notes ?? "", row.created_at].map(csvEscape).join(","));
  }
  const period = data.year && data.month ? `-${data.year}-${String(data.month).padStart(2, "0")}` : "";
  return {
    format: "csv",
    mime: "text/csv",
    filename: `discrepancies${period}.csv`,
    content: lines.join("\n")
  };
});
const listTenantsLite_createServerFn_handler = createServerRpc({
  id: "f160c4e6ab95124c1db9e08fcfbc462ba4caccc3316e0c92e16dc12f137ad9cb",
  name: "listTenantsLite",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listTenantsLite.__executeServer(opts));
const listTenantsLite = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantsLite_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data
  } = await supabaseAdmin.from("tenants").select("id, name, country_code").order("name");
  return {
    items: data ?? []
  };
});
const previewInvoiceImpact_createServerFn_handler = createServerRpc({
  id: "7032244eb569294ab033b465f4ab4f16fd8da60134934eec5b55237b6c0380b5",
  name: "previewInvoiceImpact",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => previewInvoiceImpact.__executeServer(opts));
const previewInvoiceImpact = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  overridePlanCode: enumType(["starter_v2", "pro_v2"]).optional().nullable(),
  overridePlanChangeDate: stringType().optional().nullable(),
  overrideTrialEndsAt: stringType().optional().nullable(),
  overrideAddonAU: booleanType().optional().nullable()
}).parse(i)).handler(previewInvoiceImpact_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    previewBillingForTenant
  } = await import("./billing.server-BzOVdJud.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const result = await previewBillingForTenant({
    tenantId: data.tenantId,
    year: data.year,
    month: data.month,
    overridePlanCode: data.overridePlanCode ?? null,
    overridePlanChangeDate: data.overridePlanChangeDate ?? null,
    overrideTrialEndsAt: data.overrideTrialEndsAt ?? null,
    overrideAddonAU: data.overrideAddonAU ?? null
  });
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: "preview.run",
    target_type: "tenant",
    target_id: data.tenantId,
    tenant_id: data.tenantId,
    after: result,
    metadata: {
      year: data.year,
      month: data.month,
      overrides: {
        plan: data.overridePlanCode,
        planChangeDate: data.overridePlanChangeDate,
        trialEndsAt: data.overrideTrialEndsAt,
        addonAU: data.overrideAddonAU
      }
    }
  });
  return result;
});
const listAlertSuppressions_createServerFn_handler = createServerRpc({
  id: "b5c30167e8b61a0d90d6d775704bd6ed3add13c4a80caaa25fc595bcedc5d3d2",
  name: "listAlertSuppressions",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listAlertSuppressions.__executeServer(opts));
const listAlertSuppressions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAlertSuppressions_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("billing_alert_suppressions").select("*, tenants(name)").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    items: data ?? []
  };
});
const upsertAlertSuppression_createServerFn_handler = createServerRpc({
  id: "58bcfc7760ceebef3131838ec850d2eab5d22a0ad806266a8723840c70a02520",
  name: "upsertAlertSuppression",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => upsertAlertSuppression.__executeServer(opts));
const upsertAlertSuppression = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional().nullable(),
  tenant_id: stringType().uuid().optional().nullable(),
  alert_type: stringType().optional().nullable(),
  reason: stringType().optional().nullable(),
  expires_at: stringType().optional().nullable()
}).parse(i)).handler(upsertAlertSuppression_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const payload = {
    tenant_id: data.tenant_id ?? null,
    alert_type: data.alert_type ?? null,
    reason: data.reason ?? null,
    expires_at: data.expires_at ?? null,
    created_by: userId
  };
  let row;
  if (data.id) {
    const {
      data: r,
      error
    } = await supabaseAdmin.from("billing_alert_suppressions").update(payload).eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    row = r;
  } else {
    const {
      data: r,
      error
    } = await supabaseAdmin.from("billing_alert_suppressions").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    row = r;
  }
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: data.id ? "suppression.update" : "suppression.create",
    target_type: "suppression",
    target_id: row.id,
    tenant_id: row.tenant_id,
    after: row
  });
  return {
    ok: true,
    item: row
  };
});
const deleteAlertSuppression_createServerFn_handler = createServerRpc({
  id: "06a97018592a4c12e0ffef13021722e2739cad095d776f1c4c6acacf7459fff7",
  name: "deleteAlertSuppression",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => deleteAlertSuppression.__executeServer(opts));
const deleteAlertSuppression = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(deleteAlertSuppression_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const {
    data: before
  } = await supabaseAdmin.from("billing_alert_suppressions").select("*").eq("id", data.id).single();
  await supabaseAdmin.from("billing_alert_suppressions").delete().eq("id", data.id);
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: "suppression.delete",
    target_type: "suppression",
    target_id: data.id,
    tenant_id: before?.tenant_id ?? null,
    before
  });
  return {
    ok: true
  };
});
const listRetryPolicies_createServerFn_handler = createServerRpc({
  id: "cacd25b2d7bed51bcd78f3fcbebf99fc670ba4e01f3a7e0fe0d4bbfca0346334",
  name: "listRetryPolicies",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listRetryPolicies.__executeServer(opts));
const listRetryPolicies = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listRetryPolicies_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data
  } = await supabaseAdmin.from("billing_alert_retry_policies").select("*").order("alert_type");
  return {
    items: data ?? []
  };
});
const upsertRetryPolicy_createServerFn_handler = createServerRpc({
  id: "b408a65fc1086339c9c3087cdfc72155a04cc434d080e671f8e380d489a4916f",
  name: "upsertRetryPolicy",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => upsertRetryPolicy.__executeServer(opts));
const upsertRetryPolicy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  alert_type: stringType().min(1),
  enabled: booleanType(),
  max_attempts: numberType().int().min(1).max(50),
  backoff_seconds: numberType().int().min(10),
  backoff_multiplier: numberType().min(1).max(10),
  max_backoff_seconds: numberType().int().min(60)
}).parse(i)).handler(upsertRetryPolicy_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    logBillingOpsAudit
  } = await import("./billing-alerts.server-yXHN9JNF.mjs");
  const {
    data: before
  } = await supabaseAdmin.from("billing_alert_retry_policies").select("*").eq("alert_type", data.alert_type).maybeSingle();
  const {
    data: row,
    error
  } = await supabaseAdmin.from("billing_alert_retry_policies").upsert(data, {
    onConflict: "alert_type"
  }).select("*").single();
  if (error) throw new Error(error.message);
  await logBillingOpsAudit({
    actor_user_id: userId,
    actor_email: await actorEmail(supabase, userId),
    action: "retry_policy.update",
    target_type: "retry_policy",
    target_id: data.alert_type,
    before,
    after: row
  });
  return {
    ok: true,
    item: row
  };
});
const exportBillingOpsAuditCsv_createServerFn_handler = createServerRpc({
  id: "97396264961f0b973e0b41b2d86f9785ab0350e3dcf88b1a7103fbc598b9a609",
  name: "exportBillingOpsAuditCsv",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => exportBillingOpsAuditCsv.__executeServer(opts));
const exportBillingOpsAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  actorEmail: stringType().optional().nullable(),
  action: stringType().optional().nullable(),
  from: stringType().optional().nullable(),
  to: stringType().optional().nullable()
}).parse(i)).handler(exportBillingOpsAuditCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("billing_ops_audit").select("*, tenants(name)").order("created_at", {
    ascending: false
  }).limit(1e4);
  if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
  if (data.action) q = q.eq("action", data.action);
  if (data.actorEmail) q = q.ilike("actor_email", `%${data.actorEmail}%`);
  if (data.from) q = q.gte("created_at", data.from);
  if (data.to) q = q.lte("created_at", data.to);
  const {
    data: rows
  } = await q;
  const headers = ["created_at", "actor_email", "action", "tenant", "target_type", "target_id", "metadata"];
  const lines = [headers.join(",")];
  for (const r of rows ?? []) {
    const row = r;
    lines.push([row.created_at, row.actor_email ?? "", row.action, row.tenants?.name ?? "", row.target_type ?? "", row.target_id ?? "", JSON.stringify(row.metadata ?? {})].map(csvEscape).join(","));
  }
  return {
    format: "csv",
    mime: "text/csv",
    filename: `billing-ops-audit-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`,
    content: lines.join("\n")
  };
});
const listBillingOpsAuditFiltered_createServerFn_handler = createServerRpc({
  id: "7820bc776ea6553100598f413c7dfa090e68c3bcbd3827ff8f9182cb9411454c",
  name: "listBillingOpsAuditFiltered",
  filename: "src/lib/billing-admin.functions.ts"
}, (opts) => listBillingOpsAuditFiltered.__executeServer(opts));
const listBillingOpsAuditFiltered = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  tenantId: stringType().uuid().optional().nullable(),
  actorEmail: stringType().optional().nullable(),
  action: stringType().optional().nullable(),
  from: stringType().optional().nullable(),
  to: stringType().optional().nullable(),
  limit: numberType().int().min(1).max(500).optional().default(200)
}).parse(i)).handler(listBillingOpsAuditFiltered_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await ensureSuper(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  let q = supabaseAdmin.from("billing_ops_audit").select("*, tenants(name)").order("created_at", {
    ascending: false
  }).limit(data.limit ?? 200);
  if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
  if (data.action) q = q.eq("action", data.action);
  if (data.actorEmail) q = q.ilike("actor_email", `%${data.actorEmail}%`);
  if (data.from) q = q.gte("created_at", data.from);
  if (data.to) q = q.lte("created_at", data.to);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    items: rows ?? []
  };
});
export {
  deleteAlertSuppression_createServerFn_handler,
  exportBillingForMonth_createServerFn_handler,
  exportBillingOpsAuditCsv_createServerFn_handler,
  exportDiscrepanciesCsv_createServerFn_handler,
  listAlertSuppressions_createServerFn_handler,
  listBillingAlerts_createServerFn_handler,
  listBillingOpsAuditFiltered_createServerFn_handler,
  listBillingOpsAudit_createServerFn_handler,
  listDiscrepancies_createServerFn_handler,
  listReconciliationForMonth_createServerFn_handler,
  listRetryPolicies_createServerFn_handler,
  listTenantsBillingOverview_createServerFn_handler,
  listTenantsLite_createServerFn_handler,
  previewInvoiceImpact_createServerFn_handler,
  resolveBillingAlert_createServerFn_handler,
  retryBillingAlert_createServerFn_handler,
  runReconciliationForMonth_createServerFn_handler,
  scheduleTenantPlanChange_createServerFn_handler,
  seedStripePrices_createServerFn_handler,
  upsertAlertSuppression_createServerFn_handler,
  upsertRetryPolicy_createServerFn_handler
};
