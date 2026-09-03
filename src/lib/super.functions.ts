/**
 * Payday Super (M4) — server functions.
 *
 * Generates per-payslip SG contribution rows from approved AU payroll runs,
 * groups them into SuperStream remittance batches with a Payday Super–aligned
 * due date (≤7 calendar days after pay date once the reform is in force),
 * and submits the batch through a configured clearing-house gateway.
 *
 * Gateways supported:
 *   - "manual"  — flips to awaiting_manual_lodgement and surfaces the payload
 *                 for export to the SBSCH / commercial clearing house.
 *   - "sandbox" — synthetic acknowledgement (used in tests / dev).
 *   - other     — throws "not implemented" until a real adapter lands.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireTenantId } from "@/lib/tenant-scope";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { assertAuPayroll, assertAuPayrollOrHr } from "@/lib/au-guard";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Funds ────────────────────────────────────────────────────────────────
const FundInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  fund_type: z.enum(["apra", "smsf"]).default("apra"),
  abn: z.string().max(20).nullish(),
  usi: z.string().max(20).nullish(),
  smsf_esa: z.string().max(40).nullish(),
  smsf_bsb: z.string().max(10).nullish(),
  smsf_account_number: z.string().max(40).nullish(),
  smsf_account_name: z.string().max(200).nullish(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const upsertSuperFund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => FundInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertAuPayrollOrHr(supabase, userId, tenant_id);
    const row = { ...data, tenant_id };
    const q = data.id
      ? supabase.from("super_funds").update(row).eq("id", data.id).select("*").maybeSingle()
      : supabase.from("super_funds").insert(row).select("*").maybeSingle();
    const { data: out, error } = await q;
    if (error) throw new Error(error.message);
    return out;
  });

export const listSuperFunds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertAuPayrollOrHr(supabase, userId, tenant_id);
    // The tenant filter is this query's own responsibility, not RLS's:
    // "super_funds tenant read" also passes for any super_admin with no tenant
    // predicate at all, so trusting the policy would return every tenant's
    // funds to that caller. See the Tenant scoping section in CLAUDE.md.
    const { data, error } = await supabase
      .from("super_funds")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("name");
    if (error) throw new Error(error.message);
    return { funds: data ?? [] };
  });

// ── Employee fund choice ─────────────────────────────────────────────────
const ChoiceInput = z.object({
  employee_id: z.string().uuid(),
  super_fund_id: z.string().uuid(),
  member_number: z.string().max(60).nullish(),
  effective_from: z.string().regex(ISO_DATE).optional(),
});

export const setEmployeeSuperChoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ChoiceInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("id", data.employee_id)
      .maybeSingle();
    const tenant_id = (emp as any)?.tenant_id;
    if (!tenant_id) throw new Error("Employee not found");
    // Derived from the employee, then checked — so a caller cannot nominate a
    // fund for someone in another tenant by passing that employee's id.
    await assertAuPayrollOrHr(supabase, userId, tenant_id);
    const { data: row, error } = await supabase
      .from("employee_super_choices")
      .insert({
        ...data,
        tenant_id,
        effective_from: data.effective_from ?? new Date().toISOString().slice(0, 10),
      })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ── Generate contributions from an approved run ─────────────────────────
const GenInput = z.object({ runId: z.string().uuid() });

export const generateSuperContributionsForRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => GenInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: run } = await supabase
      .from("payroll_runs")
      .select("id,tenant_id,country_code,status,pay_date,period_start,period_end")
      .eq("id", data.runId)
      .maybeSingle();
    if (!run) throw new Error("Run not found");
    if ((run as any).country_code !== "AU") throw new Error("Run is not AU");
    if ((run as any).status !== "approved") throw new Error("Run is not approved");

    const tenant_id = (run as any).tenant_id;
    await assertAuPayrollOrHr(supabase, userId, tenant_id);
    const pay_date = (run as any).pay_date as string;
    // Payday Super: payment due within 7 days of pay date (from 1 Jul 2026).
    const payment_due_date = addDays(pay_date, 7);

    // Pull payslips for the run with their SG line totals.
    const { data: payslips } = await supabase
      .from("payroll_payslips")
      .select("id,employee_id,components")
      .eq("run_id", data.runId);

    // Fund choices for everyone in this run, in ONE query.
    //
    // This used to run a `.limit(1).maybeSingle()` lookup per payslip, inside
    // the loop below. A 500-employee run therefore made 500 sequential round
    // trips to resolve 500 rows that one `.in()` returns at once — and payroll
    // is the hottest path in the product, so it was the worst place for it.
    //
    // Ordered newest-first and reduced to the first row per employee, which
    // reproduces the per-employee `order by effective_from desc limit 1`
    // exactly: the choice in force on the pay date.
    const employeeIds = [
      ...new Set((payslips ?? []).map((p: any) => p.employee_id).filter(Boolean)),
    ];
    const choiceByEmployee = new Map<string, any>();
    if (employeeIds.length) {
      const { data: choices } = await supabase
        .from("employee_super_choices")
        .select("employee_id,super_fund_id,member_number,effective_from,effective_to")
        .in("employee_id", employeeIds)
        .lte("effective_from", pay_date)
        .order("effective_from", { ascending: false });
      for (const c of choices ?? []) {
        if (!choiceByEmployee.has((c as any).employee_id)) {
          choiceByEmployee.set((c as any).employee_id, c);
        }
      }
    }

    const rows: any[] = [];
    for (const p of payslips ?? []) {
      const components = ((p as any).components ?? {}) as Record<string, any>;
      // Engine emits SUPER_SG with { amount, base } for AU; salary-sacrifice/RESC remain optional add-ons.
      const sg = components.SUPER_SG ?? components.sg ?? null;
      const sgAmount = Number(sg?.amount ?? sg ?? 0);
      const sgBase = Number(sg?.base ?? sg?.ote ?? 0);
      if (!sgAmount) continue;

      const choice = choiceByEmployee.get((p as any).employee_id);
      if (!choice) {
        // No nominated fund — caller must set default before remittance.
        continue;
      }

      rows.push({
        tenant_id,
        employee_id: (p as any).employee_id,
        run_id: data.runId,
        payslip_id: (p as any).id,
        super_fund_id: (choice as any).super_fund_id,
        member_number: (choice as any).member_number,
        contribution_type: "SG",
        ote_base: sgBase || null,
        amount: sgAmount,
        pay_date,
        payment_due_date,
        status: "pending",
      });
    }

    if (rows.length === 0) return { inserted: 0 };

    const { error } = await supabase.from("super_contributions").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

// ── Build / submit batch ────────────────────────────────────────────────
const BatchInput = z.object({
  periodStart: z.string().regex(ISO_DATE),
  periodEnd: z.string().regex(ISO_DATE),
  contributionIds: z.array(z.string().uuid()).min(1).max(5000).optional(),
});

export const buildSuperBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => BatchInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertAuPayroll(supabase, userId, tenant_id);

    // Tenant settings for clearing-house gateway.
    const { data: settings } = await supabase
      .from("tenant_payroll_settings")
      .select("stp_gateway,stp_gateway_config")
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    const gateway = ((settings as any)?.stp_gateway as string) ?? "manual";

    let q = supabase
      .from("super_contributions")
      .select(
        "id,amount,pay_date,payment_due_date,super_fund_id,employee_id,member_number,contribution_type,ote_base,status",
      )
      .eq("tenant_id", tenant_id)
      .eq("status", "pending")
      .gte("pay_date", data.periodStart)
      .lte("pay_date", data.periodEnd);
    if (data.contributionIds) q = q.in("id", data.contributionIds);
    const { data: contribs, error: cerr } = await q;
    if (cerr) throw new Error(cerr.message);
    if (!contribs || contribs.length === 0) throw new Error("No pending contributions in period");

    const total = contribs.reduce((a: number, r: any) => a + Number(r.amount), 0);
    const dueDate = contribs.reduce(
      (min: string, r: any) =>
        r.payment_due_date && r.payment_due_date < min ? r.payment_due_date : min,
      contribs[0].payment_due_date ?? data.periodEnd,
    );

    // Build SuperStream-shaped payload (simplified; real adapter expands to SAFF).
    const payload = {
      schemaVersion: "SuperStream-Contributions-v1",
      tenant_id,
      period: { start: data.periodStart, end: data.periodEnd },
      payment_due_date: dueDate,
      contributions: contribs.map((c: any) => ({
        employee_id: c.employee_id,
        super_fund_id: c.super_fund_id,
        member_number: c.member_number,
        contribution_type: c.contribution_type,
        ote_base: c.ote_base,
        amount: Number(c.amount),
        pay_date: c.pay_date,
      })),
      totals: { amount: total, count: contribs.length },
    };

    const { data: batch, error: berr } = await supabase
      .from("super_batches")
      .insert({
        tenant_id,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        payment_due_date: dueDate,
        total_amount: total,
        contribution_count: contribs.length,
        status: "draft",
        gateway,
        payload,
        created_by: userId,
      })
      .select("*")
      .maybeSingle();
    if (berr) throw new Error(berr.message);

    const ids = contribs.map((c: any) => c.id);
    await supabase
      .from("super_contributions")
      .update({ batch_id: (batch as any).id, status: "queued" })
      .in("id", ids);

    return batch;
  });

const SubmitInput = z.object({ batchId: z.string().uuid() });

export const submitSuperBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => SubmitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: batch } = await supabase
      .from("super_batches")
      .select("*")
      .eq("id", data.batchId)
      .maybeSingle();
    if (!batch) throw new Error("Batch not found");
    await assertAuPayroll(supabase, userId, (batch as any).tenant_id);
    if ((batch as any).status !== "draft") throw new Error(`Batch is ${(batch as any).status}`);

    const gw = (batch as any).gateway as string;
    let update: Record<string, any>;
    if (gw === "manual") {
      update = {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        response: { mode: "manual_export" },
      };
    } else if (gw === "sandbox") {
      update = {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        gateway_message_id: `SBX-SUPER-${Date.now()}`,
        response: { ack: "ok", clearingHouse: "sandbox" },
      };
    } else {
      throw new Error(`Super gateway "${gw}" not implemented`);
    }

    const { data: updated, error } = await supabase
      .from("super_batches")
      .update(update as any)
      .eq("id", data.batchId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);

    await supabase
      .from("super_contributions")
      .update({ status: "sent" })
      .eq("batch_id", data.batchId);

    return updated;
  });

const MarkPaidInput = z.object({
  batchId: z.string().uuid(),
  paymentReference: z.string().max(120).optional(),
});

export const markSuperBatchPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => MarkPaidInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("super_batches")
      .select("tenant_id,status")
      .eq("id", data.batchId)
      .maybeSingle();
    if (!existing) throw new Error("Batch not found");
    await assertAuPayroll(supabase, userId, (existing as any).tenant_id);
    // A batch has to have been lodged before it can be reconciled as paid.
    // Without this a draft could be marked paid directly, which would mark its
    // contributions "paid" while nothing was ever sent to the clearing house —
    // the one state that makes the SLA sweep report a false all-clear.
    if ((existing as any).status !== "submitted") {
      throw new Error(
        `Batch is ${(existing as any).status}; only a submitted batch can be marked paid`,
      );
    }
    const { data: batch, error } = await supabase
      .from("super_batches")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        response: { paymentReference: data.paymentReference ?? null },
      })
      .eq("id", data.batchId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await supabase
      .from("super_contributions")
      .update({ status: "paid" })
      .eq("batch_id", data.batchId);
    return batch;
  });

export const listSuperBatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const tenant_id = await requireTenantId(supabase, userId);
    await assertAuPayroll(supabase, userId, tenant_id);
    // Scoped here for the same reason as listSuperFunds: "super_batches tenant
    // read" passes unconditionally for super_admin.
    const { data, error } = await supabase
      .from("super_batches")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("period_end", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { batches: data ?? [] };
  });
