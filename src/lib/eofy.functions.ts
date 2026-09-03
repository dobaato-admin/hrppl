/**
 * STP Phase 2 EOFY finalisation (M5).
 *
 * Builds and submits per-employee finalisation declarations for an
 * Australian financial year (1 Jul → 30 Jun). YTD totals are summed
 * from approved payslips with a pay_date inside the FY.
 *
 *   buildEofyFinalisation({ tenantId, financialYear })
 *   submitEofyFinalisation({ eventId })
 *   listEofyFinalisations({ tenantId, financialYear })
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

/** FY label `2026` → period 2025-07-01 .. 2026-06-30. */
export function fyRange(fy: number): { start: string; end: string } {
  return { start: `${fy - 1}-07-01`, end: `${fy}-06-30` };
}

function sumLines(lines: any[] | null | undefined, pred: (l: any) => boolean): number {
  return (lines ?? []).filter(pred).reduce((a, l) => a + Number(l.amount ?? 0), 0);
}

/**
 * Aggregate YTD totals per employee from approved payslips for the FY and
 * upsert one draft finalisation event per employee.
 */
export const buildEofyFinalisation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    financialYear: z.number().int().min(2020).max(2100),
    runType: z.enum(["final", "amendment"]).default("final"),
    employeeIds: z.array(z.string().uuid()).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAuOrgAdmin(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    const { start, end } = fyRange(data.financialYear);

    const { data: settings } = await admin.from("tenant_payroll_settings")
      .select("abn,branch_code,bms_id")
      .eq("tenant_id", data.tenantId).maybeSingle();
    const abn = (settings as any)?.abn;
    const bmsId = (settings as any)?.bms_id;
    if (!abn) throw new Error("Tenant ABN not configured");
    if (!bmsId) throw new Error("BMS ID not configured");

    // Approved AU runs within the FY (by pay_date).
    let runsQ = admin.from("payroll_runs")
      .select("id,country_code,status,pay_date")
      .eq("tenant_id", data.tenantId)
      .eq("country_code", "AU")
      .eq("status", "approved")
      .gte("pay_date", start).lte("pay_date", end);
    const { data: runs } = await runsQ;
    const runIds = (runs ?? []).map((r: any) => r.id);
    if (runIds.length === 0) {
      return { events: [], message: "No approved AU runs in this financial year" };
    }

    const { data: payslips } = await admin.from("payroll_payslips")
      .select("employee_id,gross,income_tax,net_pay,lines,run_id")
      .in("run_id", runIds);

    const byEmp = new Map<string, any[]>();
    for (const ps of payslips ?? []) {
      if (data.employeeIds && !data.employeeIds.includes((ps as any).employee_id)) continue;
      const arr = byEmp.get((ps as any).employee_id) ?? [];
      arr.push(ps);
      byEmp.set((ps as any).employee_id, arr);
    }

    const empIds = Array.from(byEmp.keys());
    const { data: emps } = empIds.length
      ? await admin.from("employees")
          .select("id,first_name,last_name,email,hire_date,termination_date,tfn_status,tax_treatment_code,income_type,employment_basis,cessation_reason_code")
          .in("id", empIds)
      : { data: [] as any[] };
    const empById = new Map<string, any>();
    for (const e of emps ?? []) empById.set((e as any).id, e);

    const out: any[] = [];
    for (const [employeeId, slips] of byEmp) {
      const emp = empById.get(employeeId) ?? {};
      const gross = slips.reduce((a, p) => a + Number(p.gross ?? 0), 0);
      const payg = slips.reduce((a, p) => a + Number(p.income_tax ?? 0), 0);
      const net = slips.reduce((a, p) => a + Number(p.net_pay ?? 0), 0);
      const ote = slips.reduce((a, p) => a + sumLines(p.lines, (l) => l.code === "BASE"), 0);
      const overtime = slips.reduce((a, p) => a + sumLines(p.lines,
        (l) => l.code === "OVERTIME" || String(l.code).startsWith("OT_")), 0);
      const allowances = slips.reduce((a, p) => a + sumLines(p.lines,
        (l) => l.category === "allowance"), 0);
      const superSg = slips.reduce((a, p) => a + sumLines(p.lines, (l) => l.code === "SUPER_SG"), 0);

      const payload = {
        schema: "STP2.finalisation.v1",
        payer: { abn, branch_code: (settings as any)?.branch_code ?? null, bms_id: bmsId },
        financial_year: data.financialYear,
        period: { start, end },
        run_type: data.runType,
        is_final: data.runType === "final",
        payee: {
          payee_ref: employeeId,
          name: { given: emp.first_name ?? "", family: emp.last_name ?? "" },
          email: emp.email ?? null,
          commencement_date: emp.hire_date ?? null,
          cessation_date: emp.termination_date ?? null,
          cessation_reason_code: emp.cessation_reason_code ?? null,
          tfn_status: emp.tfn_status ?? "provided",
          tax_treatment_code: emp.tax_treatment_code ?? "RTNRT",
          income_type: emp.income_type ?? "SAW",
          employment_basis: emp.employment_basis ?? "F",
        },
        ytd: {
          gross, ote, overtime, allowances,
          payg_w: payg, super_liability_sg: superSg, net,
          payslip_count: slips.length,
        },
      };
      const payloadStr = JSON.stringify(payload);
      const hash = sha256(payloadStr);

      // Replace any prior draft for this (tenant, fy, employee, run_type).
      await admin.from("stp_finalisation_events").delete()
        .eq("tenant_id", data.tenantId)
        .eq("financial_year", data.financialYear)
        .eq("employee_id", employeeId)
        .eq("run_type", data.runType)
        .eq("status", "draft");

      const { data: row, error } = await admin.from("stp_finalisation_events").insert({
        tenant_id: data.tenantId,
        financial_year: data.financialYear,
        employee_id: employeeId,
        run_type: data.runType,
        status: "draft",
        gateway: "manual",
        payload, payload_hash: hash,
        created_by: context.userId,
      } as any).select("id").single();
      if (error) throw new Error(error.message);
      out.push({ eventId: (row as any).id, employeeId, hash, ytd: payload.ytd });
    }

    return { events: out, count: out.length };
  });

export const submitEofyFinalisation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: ev } = await admin.from("stp_finalisation_events")
      .select("*").eq("id", data.eventId).maybeSingle();
    if (!ev) throw new Error("Event not found");
    await assertAuOrgAdmin(context.supabase, context.userId, (ev as any).tenant_id);
    if ((ev as any).status !== "draft") {
      throw new Error(`Event is ${(ev as any).status}; only draft can be submitted`);
    }
    const now = new Date().toISOString();
    const gateway = (ev as any).gateway as string;
    if (gateway === "manual") {
      await admin.from("stp_finalisation_events").update({
        status: "awaiting_manual_lodgement", submitted_at: now,
      } as any).eq("id", data.eventId);
      return { status: "awaiting_manual_lodgement", payload: (ev as any).payload };
    }
    if (gateway === "sandbox") {
      const messageId = `SBX-EOFY-${(ev as any).payload_hash?.slice(0, 12)}-${Date.now()}`;
      await admin.from("stp_finalisation_events").update({
        status: "acknowledged", submitted_at: now, acknowledged_at: now,
        gateway_message_id: messageId,
        ato_response: { status: "accepted", message_id: messageId, simulated: true },
      } as any).eq("id", data.eventId);
      return { status: "acknowledged", messageId };
    }
    await admin.from("stp_finalisation_events").update({
      status: "error",
      error_message: `Gateway "${gateway}" not implemented`,
    } as any).eq("id", data.eventId);
    throw new Error(`Gateway "${gateway}" not implemented yet`);
  });

export const listEofyFinalisations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    financialYear: z.number().int().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAuOrgAdmin(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    let q = admin.from("stp_finalisation_events")
      .select("id,financial_year,employee_id,run_type,status,gateway,payload_hash,gateway_message_id,submitted_at,acknowledged_at,error_message,created_at")
      .eq("tenant_id", data.tenantId);
    if (data.financialYear) q = q.eq("financial_year", data.financialYear);
    const { data: rows } = await q.order("created_at", { ascending: false }).limit(500);
    return { events: rows ?? [] };
  });
