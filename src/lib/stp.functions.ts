/**
 * STP Phase 2 server functions (M3).
 *
 * `buildStpPayEvent` assembles a Phase 2 pay-event payload from an
 * approved/computed payroll run and persists it to `stp_pay_events`.
 * `submitStpPayEvent` POSTs the payload to the configured gateway
 * (currently `manual` returns the payload for download; `sandbox`
 * simulates an ATO acknowledgement). Real gateway adapters (Ozedi,
 * SuperChoice, Beam) plug in via the `gateway` field.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { assertAuOrgAdmin } from "@/lib/au-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}


function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/**
 * Build a Phase 2 pay-event payload from a payroll run.
 * Idempotent: re-running for the same run replaces the prior draft event.
 */
export const buildStpPayEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    runId: z.string().uuid(),
    runType: z.enum(["normal", "update", "ffr"]).default("normal"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: run } = await admin.from("payroll_runs")
      .select("*").eq("id", data.runId).maybeSingle();
    if (!run) throw new Error("Run not found");
    await assertAuOrgAdmin(context.supabase, context.userId, (run as any).tenant_id);
    if ((run as any).country_code !== "AU") throw new Error("Run is not an AU run");
    if (!["computed", "approved"].includes((run as any).status)) {
      throw new Error("Run must be computed or approved before STP build");
    }

    const { data: settings } = await admin.from("tenant_payroll_settings")
      .select("abn,branch_code,bms_id,stp_gateway,stp_gateway_config")
      .eq("tenant_id", (run as any).tenant_id).maybeSingle();
    const abn = (settings as any)?.abn as string | null;
    const bmsId = (settings as any)?.bms_id as string | null;
    if (!abn) throw new Error("Tenant ABN not configured (tenant_payroll_settings.abn)");
    if (!bmsId) throw new Error("BMS ID not configured (tenant_payroll_settings.bms_id)");

    const { data: payslips } = await admin.from("payroll_payslips")
      .select("*").eq("run_id", data.runId);
    const empIds = (payslips ?? []).map((p: any) => p.employee_id);
    const { data: employees } = empIds.length
      ? await admin.from("employees")
          .select("id,first_name,last_name,email,hire_date,termination_date,tfn_status,tax_treatment_code,income_type,employment_basis,cessation_reason_code")
          .in("id", empIds)
      : { data: [] as any[] };
    const empById = new Map<string, any>();
    for (const e of employees ?? []) empById.set((e as any).id, e);

    const payees = (payslips ?? []).map((ps: any) => {
      const emp = empById.get(ps.employee_id) ?? {};
      const ote = (ps.lines ?? []).filter((l: any) => l.code === "BASE")
        .reduce((a: number, l: any) => a + Number(l.amount ?? 0), 0);
      const overtime = (ps.lines ?? [])
        .filter((l: any) => l.code === "OVERTIME" || (l.code as string).startsWith("OT_"))
        .reduce((a: number, l: any) => a + Number(l.amount ?? 0), 0);
      const allowances = (ps.lines ?? [])
        .filter((l: any) => l.category === "allowance")
        .map((l: any) => ({ code: l.code, label: l.label, amount: Number(l.amount ?? 0) }));
      const sg = (ps.lines ?? []).find((l: any) => l.code === "SUPER_SG");
      return {
        payee_ref: ps.employee_id,
        name: { given: emp.first_name ?? "", family: emp.last_name ?? "" },
        email: emp.email ?? null,
        commencement_date: emp.hire_date ?? null,
        cessation_date: emp.termination_date ?? null,
        cessation_reason_code: emp.cessation_reason_code ?? null,
        tfn_status: emp.tfn_status ?? "provided",
        tax_treatment_code: emp.tax_treatment_code ?? "RTNRT", // regular, tax-free, no STSL, no Medicare variation
        income_type: emp.income_type ?? "SAW",
        employment_basis: emp.employment_basis ?? "F",
        gross: Number(ps.gross ?? 0),
        ote, overtime, allowances,
        bonuses_commissions: 0,
        directors_fees: 0,
        lump_sums: {},
        salary_sacrifice: { super_S: 0, other_O: 0 },
        payg_w: Number(ps.income_tax ?? 0),
        super_liability_sg: Number(sg?.amount ?? 0),
        resc: 0,
        deductions: { child_support_D: 0, child_support_G: 0 },
        net_pay: Number(ps.net_pay ?? 0),
      };
    });

    const payload = {
      schema: "STP2.v1",
      payer: { abn, branch_code: (settings as any)?.branch_code ?? null, bms_id: bmsId },
      pay_event: {
        run_id: (run as any).id,
        run_type: data.runType,
        period_start: (run as any).period_start,
        period_end: (run as any).period_end,
        payment_date: (run as any).pay_date,
        currency: (run as any).currency_code ?? "AUD",
      },
      totals: {
        gross: payees.reduce((a, p) => a + p.gross, 0),
        payg_w: payees.reduce((a, p) => a + p.payg_w, 0),
        super_sg: payees.reduce((a, p) => a + p.super_liability_sg, 0),
        net: payees.reduce((a, p) => a + p.net_pay, 0),
        payee_count: payees.length,
      },
      payees,
    };
    const payloadStr = JSON.stringify(payload);
    const hash = sha256(payloadStr);

    // Upsert draft event for this run.
    await admin.from("stp_pay_events").delete()
      .eq("run_id", (run as any).id).eq("status", "draft");
    const { data: row, error } = await admin.from("stp_pay_events").insert({
      tenant_id: (run as any).tenant_id,
      run_id: (run as any).id,
      period_start: (run as any).period_start,
      period_end: (run as any).period_end,
      payment_date: (run as any).pay_date,
      run_type: data.runType,
      status: "draft",
      gateway: (settings as any)?.stp_gateway ?? "manual",
      payload, payload_hash: hash,
      created_by: context.userId,
    } as any).select("id").single();
    if (error) throw new Error(error.message);
    return { eventId: (row as any).id, hash, totals: payload.totals };
  });

/**
 * Submit a previously-built STP event. Behaviour depends on `gateway`:
 *   - manual:  marks `awaiting_manual_lodgement`; payload returned for download.
 *   - sandbox: simulates a successful ATO ack synchronously.
 *   - <real>:  stub — extend with a real gateway client.
 */
export const submitStpPayEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: ev } = await admin.from("stp_pay_events")
      .select("*").eq("id", data.eventId).maybeSingle();
    if (!ev) throw new Error("Event not found");
    await assertAuOrgAdmin(context.supabase, context.userId, (ev as any).tenant_id);
    if ((ev as any).status !== "draft") {
      throw new Error(`Event is ${(ev as any).status}; only draft events can be submitted`);
    }

    const now = new Date().toISOString();
    const gateway = (ev as any).gateway as string;
    if (gateway === "manual") {
      await admin.from("stp_pay_events").update({
        status: "awaiting_manual_lodgement", submitted_at: now,
      } as any).eq("id", data.eventId);
      return { status: "awaiting_manual_lodgement", payload: (ev as any).payload };
    }
    if (gateway === "sandbox") {
      const messageId = `SBX-${(ev as any).payload_hash?.slice(0, 12)}-${Date.now()}`;
      await admin.from("stp_pay_events").update({
        status: "acknowledged",
        submitted_at: now,
        acknowledged_at: now,
        gateway_message_id: messageId,
        ato_response: { status: "accepted", message_id: messageId, simulated: true },
      } as any).eq("id", data.eventId);
      return { status: "acknowledged", messageId };
    }

    await admin.from("stp_pay_events").update({
      status: "error",
      error_message: `Gateway "${gateway}" not implemented — extend src/lib/stp.functions.ts`,
    } as any).eq("id", data.eventId);
    throw new Error(`Gateway "${gateway}" not implemented yet`);
  });

export const listStpPayEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAuOrgAdmin(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    const { data: rows } = await admin.from("stp_pay_events")
      .select("id,run_id,period_start,period_end,payment_date,run_type,status,gateway,payload_hash,gateway_message_id,submitted_at,acknowledged_at,error_message,created_at")
      .eq("tenant_id", data.tenantId)
      .order("payment_date", { ascending: false })
      .limit(100);
    return { events: rows ?? [] };
  });
