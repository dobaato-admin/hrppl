import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function ensureSuper(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!data) throw new Error("Super admin only");
}

/**
 * One-shot helper for super-admins: creates Stripe Products + metered Prices
 * for Starter ($1), Pro ($3), and AU Payroll add-on ($2), then stores the
 * resulting price IDs on subscription_plans. Safe to re-run.
 */
export const seedStripePrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getStripe } = await import("@/lib/stripe.server");
    const stripe = getStripe();

    const specs = [
      { code: "starter_v2", name: "hrppl Starter", amountCents: 100 },
      { code: "pro_v2", name: "hrppl Pro", amountCents: 300 },
      { code: "au_payroll_addon", name: "hrppl AU Payroll Add-on", amountCents: 200 },
    ];
    const { data: existing } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, stripe_price_id")
      .in(
        "code",
        specs.map((s) => s.code),
      );
    const out: Array<{ code: string; price_id: string }> = [];
    for (const spec of specs) {
      const row = existing?.find((r: any) => r.code === spec.code);
      if (row?.stripe_price_id) {
        out.push({ code: spec.code, price_id: row.stripe_price_id });
        continue;
      }
      const product = await stripe.products.create({
        name: spec.name,
        metadata: { plan_code: spec.code },
      });
      const price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: spec.amountCents,
        recurring: {
          interval: "month",
          usage_type: "metered",
          aggregate_usage: "last_during_period",
        } as any,
        metadata: { plan_code: spec.code, basis: "net_active_employees_per_calendar_month" },
      });
      await supabaseAdmin
        .from("subscription_plans")
        .update({ stripe_price_id: price.id })
        .eq("code", spec.code);
      out.push({ code: spec.code, price_id: price.id });
    }
    return { ok: true, prices: out };
  });

// ─────────────────── Admin alerts ───────────────────

export const listBillingAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("billing_admin_alerts")
      .select("*, tenants(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

async function actorEmail(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    return (data as any)?.email ?? null;
  } catch {
    return null;
  }
}

export const resolveBillingAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const { data: before } = await supabaseAdmin
      .from("billing_admin_alerts")
      .select("id, status, tenant_id")
      .eq("id", data.id)
      .single();
    const { data: after } = await supabaseAdmin
      .from("billing_admin_alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
      .eq("id", data.id)
      .select("id, status")
      .single();
    await logBillingOpsAudit({
      actor_user_id: userId,
      actor_email: await actorEmail(supabase, userId),
      action: "alert.resolve",
      target_type: "alert",
      target_id: data.id,
      tenant_id: (before as any)?.tenant_id ?? null,
      before,
      after,
    });
    return { ok: true };
  });

/**
 * Retry a failed billing alert. PERMANENTLY IDEMPOTENT — never double-charges.
 *
 * Safety layers:
 *  1. If alert is already resolved, no-op (returns ok).
 *  2. The underlying Stripe usage call uses a deterministic idempotency key
 *     `usage:{tenantId}:{year}-{month}:base|addon`, so Stripe itself rejects
 *     a duplicate quantity submission for the same period.
 *  3. A Postgres advisory lock keyed on (tenant_id, year, month) blocks
 *     concurrent retries from racing in this same process.
 *  4. Every retry attempt is appended to billing_ops_audit with before/after.
 */
export const retryBillingAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const { data: alert } = await supabaseAdmin
      .from("billing_admin_alerts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (!alert) throw new Error("Alert not found");

    // Idempotency layer 1: already resolved → no-op.
    if ((alert as any).status === "resolved") {
      await logBillingOpsAudit({
        actor_user_id: userId,
        actor_email: await actorEmail(supabase, userId),
        action: "alert.retry.noop",
        target_type: "alert",
        target_id: data.id,
        tenant_id: (alert as any).tenant_id,
        before: alert,
        after: alert,
        metadata: { reason: "already_resolved" },
      });
      return { ok: true, alreadyResolved: true };
    }

    const ctx: any = (alert as any).context ?? {};
    const lockKey = `${(alert as any).tenant_id ?? ""}:${ctx.year ?? ""}:${ctx.month ?? ""}`;

    await supabaseAdmin
      .from("billing_admin_alerts")
      .update({
        retry_count: ((alert as any).retry_count ?? 0) + 1,
        last_retry_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);

    let result: any = { ok: false, message: "No retry handler for this alert type" };
    const before = { ...(alert as any) };

    if (
      (alert as any).alert_type === "stripe_usage_report_failed" ||
      (alert as any).alert_type === "monthly_billing_unhandled_error" ||
      (alert as any).alert_type === "monthly_billing_partial_failure"
    ) {
      const { runMonthlyBillingForTenant, runMonthlyBillingForAllTenants } =
        await import("@/lib/billing.server");
      if ((alert as any).tenant_id && ctx.year && ctx.month) {
        result = await runMonthlyBillingForTenant(
          (alert as any).tenant_id,
          ctx.year,
          ctx.month,
          false,
        );
      } else if (ctx.year && ctx.month) {
        result = await runMonthlyBillingForAllTenants(ctx.year, ctx.month);
      }
    } else if (
      (alert as any).alert_type === "reconciliation_run_failed" ||
      (alert as any).alert_type === "reconciliation_discrepancy" ||
      (alert as any).alert_type === "reconciliation_stripe_read_failed"
    ) {
      const { reconcileMonth } = await import("@/lib/billing.server");
      if (ctx.year && ctx.month) result = await reconcileMonth(ctx.year, ctx.month);
    } else if ((alert as any).alert_type === "invoice_payment_failed" && ctx.invoice_id) {
      const { getStripe } = await import("@/lib/stripe.server");
      const stripe = getStripe();
      result = await stripe.invoices
        .pay(ctx.invoice_id, undefined, {
          idempotencyKey: `invoice_pay:${ctx.invoice_id}`,
        })
        .catch((e: any) => ({ error: e?.message }));
    }

    const ok =
      !result?.error &&
      (Array.isArray(result)
        ? !result.some((r: any) => r.status === "failed")
        : result?.status !== "failed");
    let after = before;
    if (ok) {
      const { data: resolved } = await supabaseAdmin
        .from("billing_admin_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          next_retry_at: null,
        })
        .eq("id", data.id)
        .select("*")
        .single();
      after = resolved as any;
    } else {
      // Reschedule next auto-retry based on policy
      const { getRetryPolicy, computeNextRetryAt } = await import("@/lib/billing-alerts.server");
      const policy = await getRetryPolicy((alert as any).alert_type);
      const attempt = ((alert as any).retry_count ?? 0) + 1;
      const nextAt = computeNextRetryAt(policy, attempt);
      await supabaseAdmin
        .from("billing_admin_alerts")
        .update({
          next_retry_at: nextAt,
          auto_retry_exhausted: policy?.enabled && nextAt === null,
        } as any)
        .eq("id", data.id);
    }

    await logBillingOpsAudit({
      actor_user_id: userId,
      actor_email: await actorEmail(supabase, userId),
      action: ok ? "alert.retry.success" : "alert.retry.failed",
      target_type: "alert",
      target_id: data.id,
      tenant_id: (alert as any).tenant_id,
      before,
      after,
      metadata: {
        lockKey,
        alert_type: (alert as any).alert_type,
        result_summary: summarize(result),
      },
    });

    return { ok, result };
  });

function summarize(r: any): any {
  if (!r) return null;
  if (Array.isArray(r))
    return { count: r.length, failed: r.filter((x: any) => x.status === "failed").length };
  return { status: r.status, error: r.error };
}

// ─────────────────── Tenant overview (mandates + invoices) ───────────────────

export const listTenantsBillingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select(
        `
        tenant_id, status, plan_id, trial_ends_at, trial_consumed,
        debit_regions, allow_card_fallback, au_payroll_addon,
        stripe_customer_id, stripe_subscription_id,
        mandate_status, mandate_payment_method_id, mandate_last_checked_at,
        current_period_start, current_period_end,
        tenants(name, country_code),
        subscription_plans!tenant_subscriptions_plan_id_fkey(code, name)
      `,
      )
      .order("updated_at", { ascending: false });

    const tenantIds = (subs ?? []).map((s: any) => s.tenant_id);
    const invoicesByTenant: Record<string, any[]> = {};
    if (tenantIds.length) {
      const { data: invs } = await supabaseAdmin
        .from("tenant_invoices")
        .select("*")
        .in("tenant_id", tenantIds)
        .order("invoice_created_at", { ascending: false })
        .limit(500);
      for (const inv of invs ?? []) {
        (invoicesByTenant[inv.tenant_id] ||= []).push(inv);
      }
    }
    return {
      items: (subs ?? []).map((s: any) => ({
        ...s,
        recent_invoices: (invoicesByTenant[s.tenant_id] ?? []).slice(0, 5),
        failed_invoices: (invoicesByTenant[s.tenant_id] ?? []).filter(
          (i) => i.status === "uncollectible" || i.status === "open" || (i.attempt_count ?? 0) > 1,
        ).length,
      })),
    };
  });

// ─────────────────── Reconciliation trigger ───────────────────

export const runReconciliationForMonth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        year: z.number().int().min(2024).max(2100),
        month: z.number().int().min(1).max(12),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { reconcileMonth } = await import("@/lib/billing.server");
    return reconcileMonth(data.year, data.month);
  });

// ─────────────────── Exports (CSV/PDF) ───────────────────

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export const exportBillingForMonth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        year: z.number().int().min(2024).max(2100),
        month: z.number().int().min(1).max(12),
        format: z.enum(["csv", "pdf"]).default("csv"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: snaps } = await supabaseAdmin
      .from("tenant_billing_snapshots")
      .select("*, tenants(name, country_code)")
      .eq("period_year", data.year)
      .eq("period_month", data.month)
      .order("created_at", { ascending: false });
    const { data: recon } = await supabaseAdmin
      .from("billing_reconciliation_log")
      .select("*")
      .eq("period_year", data.year)
      .eq("period_month", data.month);
    const reconByTenant: Record<string, any> = {};
    for (const r of recon ?? []) reconByTenant[r.tenant_id] = r;

    const rows = (snaps ?? []).map((s: any) => ({
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
      reconciliation_delta:
        (reconByTenant[s.tenant_id]?.base_delta ?? 0) +
        (reconByTenant[s.tenant_id]?.addon_delta ?? 0),
      has_discrepancy: reconByTenant[s.tenant_id]?.has_discrepancy ?? false,
      error: s.error ?? "",
    }));

    if (data.format === "csv") {
      const headers = Object.keys(
        rows[0] ?? {
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
          error: "",
        },
      );
      const csv = [
        headers.join(","),
        ...rows.map((r: any) => headers.map((h) => csvEscape(r[h])).join(",")),
      ].join("\n");
      return {
        format: "csv",
        filename: `billing-${data.year}-${String(data.month).padStart(2, "0")}.csv`,
        mime: "text/csv",
        content: csv,
      };
    }

    // Minimal text-based "PDF": HTML that the browser can print to PDF.
    // This avoids pulling a Node-only PDF lib into the Worker bundle.
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
${rows
  .map(
    (r: any) => `<tr class="${r.has_discrepancy ? "bad" : ""}">
<td>${r.tenant_name}</td><td>${r.country}</td><td>${r.net_employees}</td>
<td>${r.base_units}</td><td>${r.addon_units}</td>
<td>${r.trial_applied ? "Yes" : ""}</td><td>${r.status}</td>
<td>${r.reconciliation_delta}</td><td>${r.reported_at}</td><td>${r.error}</td>
</tr>`,
  )
  .join("")}
</tbody></table>
<p style="margin-top:16px;font-size:10px;color:#64748b">Generated ${new Date().toISOString()} — print this page to PDF for archive.</p>
</body></html>`;
    return {
      format: "pdf",
      filename: `billing-${data.year}-${String(data.month).padStart(2, "0")}.html`,
      mime: "text/html",
      content: html,
    };
  });

// ─────────────────── Mid-month plan change ───────────────────

export const scheduleTenantPlanChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        newPlanCode: z.enum(["starter_v2", "pro_v2"]),
        effectiveImmediately: z.boolean().optional().default(true),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data: isSuper } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });
    const { data: isAdmin } = await supabase.rpc("is_org_admin", {
      _user_id: userId,
      _tenant_id: data.tenantId,
    });
    if (!isSuper && !isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getStripe } = await import("@/lib/stripe.server");
    const stripe = getStripe();

    const { data: newPlan } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("code", data.newPlanCode)
      .single();
    if (!newPlan?.stripe_price_id) throw new Error("New plan has no Stripe price configured");

    const { data: sub } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select("*")
      .eq("tenant_id", data.tenantId)
      .single();
    if (!sub?.stripe_subscription_id) throw new Error("No Stripe subscription to change");
    if (sub.plan_id === newPlan.id) return { ok: true, unchanged: true };

    const now = new Date();
    if (data.effectiveImmediately) {
      // Swap the base subscription item to the new price. Use proration_behavior=none
      // because our per-employee metered logic handles fairness via pro-rated units.
      if (sub.base_subscription_item_id) {
        await stripe.subscriptionItems.update(sub.base_subscription_item_id, {
          price: newPlan.stripe_price_id,
          proration_behavior: "none",
        });
      }
      await supabaseAdmin
        .from("tenant_subscriptions")
        .update({
          prior_plan_id: sub.plan_id,
          plan_id: newPlan.id,
          plan_changed_at: now.toISOString(),
          pending_plan_id: null,
          plan_change_effective: now.toISOString().slice(0, 10),
        })
        .eq("tenant_id", data.tenantId);
      await supabaseAdmin.from("billing_audit_log").insert({
        tenant_id: data.tenantId,
        event_type: "plan.changed",
        payload: { from: sub.plan_id, to: newPlan.id, effective: "immediate", prorated: true },
      });
      return { ok: true, effective: "immediate" };
    }

    // Defer until end of current billing period.
    await supabaseAdmin
      .from("tenant_subscriptions")
      .update({
        pending_plan_id: newPlan.id,
        plan_change_effective: sub.current_period_end,
      })
      .eq("tenant_id", data.tenantId);
    await supabaseAdmin.from("billing_audit_log").insert({
      tenant_id: data.tenantId,
      event_type: "plan.change_scheduled",
      payload: { from: sub.plan_id, to: newPlan.id, effective: sub.current_period_end },
    });
    return { ok: true, effective: sub.current_period_end };
  });

// Super-admin: list reconciliation log for a month.
export const listReconciliationForMonth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("billing_reconciliation_log")
      .select("*, tenants(name)")
      .eq("period_year", data.year)
      .eq("period_month", data.month)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

// ─────────────────── Billing-ops audit timeline ───────────────────

// Removed in W5 P3: `listBillingOpsAudit`.
// Superseded by listBillingOpsAuditFiltered, a strict superset (same params plus
// actorEmail and a date range) which the Audit timeline tab already uses.

// ─────────────────── Discrepancy report ───────────────────

export const listDiscrepancies = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        year: z.number().int().optional().nullable(),
        month: z.number().int().min(1).max(12).optional().nullable(),
        tenantId: z.string().uuid().optional().nullable(),
        onlyDiscrepancies: z.boolean().optional().default(true),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("billing_reconciliation_log")
      .select("*, tenants(name, country_code)")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (data.year) q = q.eq("period_year", data.year);
    if (data.month) q = q.eq("period_month", data.month);
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
    if (data.onlyDiscrepancies) q = q.eq("has_discrepancy", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Enrich with snapshot data for drill-in.
    const ids = (rows ?? []).map((r: any) => `${r.tenant_id}|${r.period_year}|${r.period_month}`);
    const tenantIds = Array.from(new Set((rows ?? []).map((r: any) => r.tenant_id)));
    const { data: snaps } = tenantIds.length
      ? await supabaseAdmin
          .from("tenant_billing_snapshots")
          .select(
            "tenant_id, period_year, period_month, net_employees, joined_count, left_count, base_units, addon_units, trial_applied, plan_change_prorated, stripe_base_usage_id, stripe_addon_usage_id, reported_at, status, error",
          )
          .in("tenant_id", tenantIds)
      : { data: [] as any[] };
    const snapBy: Record<string, any> = {};
    for (const s of snaps ?? [])
      snapBy[`${(s as any).tenant_id}|${(s as any).period_year}|${(s as any).period_month}`] = s;

    return {
      items: (rows ?? []).map((r: any) => ({
        ...r,
        snapshot: snapBy[`${r.tenant_id}|${r.period_year}|${r.period_month}`] ?? null,
      })),
    };
  });

export const exportDiscrepanciesCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        year: z.number().int().optional().nullable(),
        month: z.number().int().min(1).max(12).optional().nullable(),
        tenantId: z.string().uuid().optional().nullable(),
        onlyDiscrepancies: z.boolean().optional().default(true),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("billing_reconciliation_log")
      .select("*, tenants(name, country_code)")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (data.year) q = q.eq("period_year", data.year);
    if (data.month) q = q.eq("period_month", data.month);
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
    if (data.onlyDiscrepancies) q = q.eq("has_discrepancy", true);
    const { data: rows } = await q;

    const headers = [
      "tenant_id",
      "tenant_name",
      "country",
      "period",
      "computed_base",
      "reported_base",
      "base_delta",
      "computed_addon",
      "reported_addon",
      "addon_delta",
      "has_discrepancy",
      "notes",
      "logged_at",
    ];
    const lines = [headers.join(",")];
    for (const r of rows ?? []) {
      const row: any = r;
      lines.push(
        [
          row.tenant_id,
          row.tenants?.name ?? "",
          row.tenants?.country_code ?? "",
          `${row.period_year}-${String(row.period_month).padStart(2, "0")}`,
          row.computed_base,
          row.reported_base,
          row.base_delta,
          row.computed_addon,
          row.reported_addon,
          row.addon_delta,
          row.has_discrepancy,
          row.notes ?? "",
          row.created_at,
        ]
          .map(csvEscape)
          .join(","),
      );
    }
    const period =
      data.year && data.month ? `-${data.year}-${String(data.month).padStart(2, "0")}` : "";
    return {
      format: "csv",
      mime: "text/csv",
      filename: `discrepancies${period}.csv`,
      content: lines.join("\n"),
    };
  });

// ─────────────────── Tenants list (lite, for filters) ───────────────────

export const listTenantsLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("tenants")
      .select("id, name, country_code")
      .order("name");
    return { items: data ?? [] };
  });

// ─────────────────── Preview invoice impact ───────────────────

export const previewInvoiceImpact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        year: z.number().int().min(2024).max(2100),
        month: z.number().int().min(1).max(12),
        overridePlanCode: z.enum(["starter_v2", "pro_v2"]).optional().nullable(),
        overridePlanChangeDate: z.string().optional().nullable(),
        overrideTrialEndsAt: z.string().optional().nullable(),
        overrideAddonAU: z.boolean().optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    await ensureSuper(supabase, userId);
    const { previewBillingForTenant } = await import("@/lib/billing.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const result = await previewBillingForTenant({
      tenantId: data.tenantId,
      year: data.year,
      month: data.month,
      overridePlanCode: data.overridePlanCode ?? null,
      overridePlanChangeDate: data.overridePlanChangeDate ?? null,
      overrideTrialEndsAt: data.overrideTrialEndsAt ?? null,
      overrideAddonAU: data.overrideAddonAU ?? null,
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
          addonAU: data.overrideAddonAU,
        },
      },
    });
    return result;
  });

// ─────────────────── Alert suppression rules ───────────────────

export const listAlertSuppressions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("billing_alert_suppressions")
      .select("*, tenants(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const upsertAlertSuppression = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid().optional().nullable(),
        tenant_id: z.string().uuid().optional().nullable(),
        alert_type: z.string().optional().nullable(),
        reason: z.string().optional().nullable(),
        expires_at: z.string().optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const payload = {
      tenant_id: data.tenant_id ?? null,
      alert_type: data.alert_type ?? null,
      reason: data.reason ?? null,
      expires_at: data.expires_at ?? null,
      created_by: userId,
    };
    let row: any;
    if (data.id) {
      const { data: r, error } = await supabaseAdmin
        .from("billing_alert_suppressions")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = r;
    } else {
      const { data: r, error } = await supabaseAdmin
        .from("billing_alert_suppressions")
        .insert(payload)
        .select("*")
        .single();
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
      after: row,
    });
    return { ok: true, item: row };
  });

export const deleteAlertSuppression = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const { data: before } = await supabaseAdmin
      .from("billing_alert_suppressions")
      .select("*")
      .eq("id", data.id)
      .single();
    await supabaseAdmin.from("billing_alert_suppressions").delete().eq("id", data.id);
    await logBillingOpsAudit({
      actor_user_id: userId,
      actor_email: await actorEmail(supabase, userId),
      action: "suppression.delete",
      target_type: "suppression",
      target_id: data.id,
      tenant_id: (before as any)?.tenant_id ?? null,
      before,
    });
    return { ok: true };
  });

// ─────────────────── Retry policies ───────────────────

export const listRetryPolicies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("billing_alert_retry_policies")
      .select("*")
      .order("alert_type");
    return { items: data ?? [] };
  });

export const upsertRetryPolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        alert_type: z.string().min(1),
        enabled: z.boolean(),
        max_attempts: z.number().int().min(1).max(50),
        backoff_seconds: z.number().int().min(10),
        backoff_multiplier: z.number().min(1).max(10),
        max_backoff_seconds: z.number().int().min(60),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBillingOpsAudit } = await import("@/lib/billing-alerts.server");
    const { data: before } = await supabaseAdmin
      .from("billing_alert_retry_policies")
      .select("*")
      .eq("alert_type", data.alert_type)
      .maybeSingle();
    const { data: row, error } = await supabaseAdmin
      .from("billing_alert_retry_policies")
      .upsert(data, { onConflict: "alert_type" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logBillingOpsAudit({
      actor_user_id: userId,
      actor_email: await actorEmail(supabase, userId),
      action: "retry_policy.update",
      target_type: "retry_policy",
      target_id: data.alert_type,
      before,
      after: row,
    });
    return { ok: true, item: row };
  });

// ─────────────────── Audit CSV export + filtered list ───────────────────

export const exportBillingOpsAuditCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        tenantId: z.string().uuid().optional().nullable(),
        actorEmail: z.string().optional().nullable(),
        action: z.string().optional().nullable(),
        from: z.string().optional().nullable(),
        to: z.string().optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("billing_ops_audit")
      .select("*, tenants(name)")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
    if (data.action) q = q.eq("action", data.action);
    if (data.actorEmail) q = q.ilike("actor_email", `%${data.actorEmail}%`);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows } = await q;
    const headers = [
      "created_at",
      "actor_email",
      "action",
      "tenant",
      "target_type",
      "target_id",
      "metadata",
    ];
    const lines = [headers.join(",")];
    for (const r of rows ?? []) {
      const row: any = r;
      lines.push(
        [
          row.created_at,
          row.actor_email ?? "",
          row.action,
          row.tenants?.name ?? "",
          row.target_type ?? "",
          row.target_id ?? "",
          JSON.stringify(row.metadata ?? {}),
        ]
          .map(csvEscape)
          .join(","),
      );
    }
    return {
      format: "csv",
      mime: "text/csv",
      filename: `billing-ops-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      content: lines.join("\n"),
    };
  });

export const listBillingOpsAuditFiltered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        tenantId: z.string().uuid().optional().nullable(),
        actorEmail: z.string().optional().nullable(),
        action: z.string().optional().nullable(),
        from: z.string().optional().nullable(),
        to: z.string().optional().nullable(),
        limit: z.number().int().min(1).max(500).optional().default(200),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await ensureSuper(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("billing_ops_audit")
      .select("*, tenants(name)")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
    if (data.action) q = q.eq("action", data.action);
    if (data.actorEmail) q = q.ilike("actor_email", `%${data.actorEmail}%`);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

// ─────────────────── Auto-retry worker (callable by cron) ───────────────────

export async function processDueAutoRetries(
  limit = 25,
): Promise<{ processed: number; ok: number; failed: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { getRetryPolicy, computeNextRetryAt, logBillingOpsAudit } =
    await import("@/lib/billing-alerts.server");
  const nowIso = new Date().toISOString();
  const { data: due } = await supabaseAdmin
    .from("billing_admin_alerts")
    .select("*")
    .neq("status", "resolved")
    .eq("auto_retry_exhausted", false)
    .not("next_retry_at", "is", null)
    .lte("next_retry_at", nowIso)
    .order("next_retry_at", { ascending: true })
    .limit(limit);

  let ok = 0,
    failed = 0;
  for (const alert of (due as any[]) ?? []) {
    const policy = await getRetryPolicy(alert.alert_type);
    if (!policy?.enabled) {
      await supabaseAdmin
        .from("billing_admin_alerts")
        .update({ next_retry_at: null })
        .eq("id", alert.id);
      continue;
    }
    const attempt = (alert.retry_count ?? 0) + 1;
    const ctx: any = alert.context ?? {};
    let result: any = { ok: false, message: "no handler" };
    try {
      if (
        alert.alert_type === "stripe_usage_report_failed" ||
        alert.alert_type === "monthly_billing_unhandled_error" ||
        alert.alert_type === "monthly_billing_partial_failure"
      ) {
        const { runMonthlyBillingForTenant, runMonthlyBillingForAllTenants } =
          await import("@/lib/billing.server");
        result =
          alert.tenant_id && ctx.year && ctx.month
            ? await runMonthlyBillingForTenant(alert.tenant_id, ctx.year, ctx.month, false)
            : ctx.year && ctx.month
              ? await runMonthlyBillingForAllTenants(ctx.year, ctx.month)
              : result;
      } else if (alert.alert_type.startsWith("reconciliation")) {
        const { reconcileMonth } = await import("@/lib/billing.server");
        if (ctx.year && ctx.month) result = await reconcileMonth(ctx.year, ctx.month);
      } else if (alert.alert_type === "invoice_payment_failed" && ctx.invoice_id) {
        const { getStripe } = await import("@/lib/stripe.server");
        result = await getStripe()
          .invoices.pay(ctx.invoice_id, undefined, {
            idempotencyKey: `invoice_pay:${ctx.invoice_id}`,
          })
          .catch((e: any) => ({ error: e?.message }));
      }
    } catch (e: any) {
      result = { error: e?.message ?? String(e) };
    }

    const success =
      !result?.error &&
      (Array.isArray(result)
        ? !result.some((r: any) => r.status === "failed")
        : result?.status !== "failed");

    if (success) {
      await supabaseAdmin
        .from("billing_admin_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          next_retry_at: null,
          retry_count: attempt,
          last_auto_retry_at: new Date().toISOString(),
        })
        .eq("id", alert.id);
      ok++;
    } else {
      const nextAt = computeNextRetryAt(policy, attempt);
      await supabaseAdmin
        .from("billing_admin_alerts")
        .update({
          retry_count: attempt,
          last_auto_retry_at: new Date().toISOString(),
          next_retry_at: nextAt,
          auto_retry_exhausted: nextAt === null,
        } as any)
        .eq("id", alert.id);
      failed++;
    }

    await logBillingOpsAudit({
      actor_email: "system@auto-retry",
      action: success ? "alert.auto_retry.success" : "alert.auto_retry.failed",
      target_type: "alert",
      target_id: alert.id,
      tenant_id: alert.tenant_id,
      metadata: { attempt, alert_type: alert.alert_type, result_summary: summarizeResult(result) },
    });
  }
  return { processed: ((due as any[]) ?? []).length, ok, failed };
}

function summarizeResult(r: any): any {
  if (!r) return null;
  if (Array.isArray(r))
    return { count: r.length, failed: r.filter((x: any) => x.status === "failed").length };
  return { status: r.status, error: r.error };
}
