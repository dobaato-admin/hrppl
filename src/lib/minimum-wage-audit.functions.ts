/**
 * M6 follow-up — Minimum-wage audit (AU).
 *
 * Walks approved AU payroll runs and flags any payslip whose effective
 * hourly rate is below the employee's award rate on the run's pay_date.
 *
 *   runMinimumWageAudit({ tenantId, runIds?, since? })
 *   listUnderpaymentFindings({ tenantId, status? })
 *   updateUnderpaymentFinding({ id, status, notes? })
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { assertAuOrgAdminOrHr } from "@/lib/au-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}


function sumLines(lines: any[] | null | undefined, pred: (l: any) => boolean): number {
  return (lines ?? []).filter(pred).reduce((a, l) => a + Number(l.amount ?? 0), 0);
}

/**
 * Audit approved AU payroll runs for minimum-wage compliance.
 * Creates / refreshes a finding row per offending payslip.
 */
export const runMinimumWageAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    runIds: z.array(z.string().uuid()).optional(),
    since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAuOrgAdminOrHr(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();

    let runsQ = admin.from("payroll_runs")
      .select("id,pay_date,period_start,period_end")
      .eq("tenant_id", data.tenantId)
      .eq("country_code", "AU")
      .eq("status", "approved");
    if (data.runIds?.length) runsQ = runsQ.in("id", data.runIds);
    if (data.since) runsQ = runsQ.gte("pay_date", data.since);
    const { data: runs, error: rErr } = await runsQ;
    if (rErr) throw new Error(rErr.message);
    if (!runs?.length) return { audited: 0, findings: 0, runs: 0 };

    const runIds = runs.map((r: any) => r.id);
    const { data: payslips } = await admin.from("payroll_payslips")
      .select("id,run_id,employee_id,lines")
      .in("run_id", runIds);
    if (!payslips?.length) return { audited: 0, findings: 0, runs: runs.length };

    // Timesheets consumed by these runs (for ordinary-hours basis).
    const { data: timesheets } = await admin.from("timesheets")
      .select("employee_id,consumed_by_run_id,total_hours,overtime_hours")
      .in("consumed_by_run_id", runIds);
    const hoursKey = (empId: string, runId: string) => `${empId}::${runId}`;
    const hoursByEmpRun = new Map<string, number>();
    for (const ts of timesheets ?? []) {
      const k = hoursKey((ts as any).employee_id, (ts as any).consumed_by_run_id);
      const ordinary = Math.max(0, Number((ts as any).total_hours ?? 0) - Number((ts as any).overtime_hours ?? 0));
      hoursByEmpRun.set(k, (hoursByEmpRun.get(k) ?? 0) + ordinary);
    }

    const runById = new Map(runs.map((r: any) => [r.id, r]));
    let findings = 0;
    let cleared = 0;

    for (const ps of payslips) {
      const run = runById.get((ps as any).run_id);
      if (!run) continue;
      const payDate = (run as any).pay_date as string;
      const empId = (ps as any).employee_id as string;
      const psId = (ps as any).id as string;

      // Ordinary hours basis.
      const hours = hoursByEmpRun.get(hoursKey(empId, (ps as any).run_id)) ?? 0;
      if (hours <= 0) continue;

      // Ordinary earnings = BASE lines (exclude overtime/allowances).
      const baseEarnings = sumLines((ps as any).lines, (l) => l.code === "BASE");
      if (baseEarnings <= 0) continue;
      const paidRate = baseEarnings / hours;

      // Resolve the employee's award assignment active on pay_date.
      const { data: asg } = await admin.from("employee_award_assignments")
        .select("classification_id,casual")
        .eq("employee_id", empId)
        .lte("effective_from", payDate)
        .or(`effective_to.is.null,effective_to.gte.${payDate}`)
        .order("effective_from", { ascending: false })
        .limit(1).maybeSingle();
      if (!asg) continue;

      const { data: rateRow } = await admin.rpc("award_rate_on", {
        _classification_id: (asg as any).classification_id, _on: payDate,
      } as any);
      const rate: any = Array.isArray(rateRow) ? rateRow[0] : rateRow;
      const baseHourly = Number(rate?.hourly_rate ?? 0);
      if (!baseHourly) continue;

      const casual = Boolean((asg as any).casual);
      const loadingPct = casual ? Number(rate?.casual_loading_pct ?? 25) : 0;
      const awardRate = baseHourly * (1 + loadingPct / 100);
      const epsilon = 0.0001;

      if (paidRate + epsilon >= awardRate) {
        // No shortfall — clean up any open finding for this payslip.
        const { count } = await admin.from("payroll_underpayment_findings")
          .delete({ count: "exact" }).eq("payslip_id", psId).eq("status", "open");
        cleared += count ?? 0;
        continue;
      }

      const shortfallPerHour = awardRate - paidRate;
      const shortfallTotal = shortfallPerHour * hours;

      const { error: upErr } = await admin.from("payroll_underpayment_findings").upsert({
        tenant_id: data.tenantId,
        run_id: (ps as any).run_id,
        payslip_id: psId,
        employee_id: empId,
        classification_id: (asg as any).classification_id,
        pay_date: payDate,
        ordinary_hours: hours,
        paid_ordinary_earnings: baseEarnings,
        paid_hourly_rate: paidRate,
        award_hourly_rate: awardRate,
        shortfall_per_hour: shortfallPerHour,
        shortfall_total: shortfallTotal,
        casual,
        status: "open",
        created_by: context.userId,
      } as any, { onConflict: "payslip_id" });
      if (upErr) throw new Error(upErr.message);
      findings += 1;
    }

    return { audited: payslips.length, findings, cleared, runs: runs.length };
  });

export const listUnderpaymentFindings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    status: z.enum(["open", "reviewed", "resolved", "waived"]).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAuOrgAdminOrHr(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    let q = admin.from("payroll_underpayment_findings").select("*")
      .eq("tenant_id", data.tenantId);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q.order("pay_date", { ascending: false }).limit(500);
    return { findings: rows ?? [] };
  });

export const updateUnderpaymentFinding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["open", "reviewed", "resolved", "waived"]),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await loadAdmin();
    const { data: row } = await admin.from("payroll_underpayment_findings")
      .select("tenant_id").eq("id", data.id).maybeSingle();
    if (!row) throw new Error("Finding not found");
    await assertAuOrgAdminOrHr(context.supabase, context.userId, (row as any).tenant_id);
    const patch: any = {
      status: data.status,
      notes: data.notes ?? null,
    };
    if (data.status === "resolved" || data.status === "waived") {
      patch.resolved_by = context.userId;
      patch.resolved_at = new Date().toISOString();
    } else {
      patch.resolved_by = null;
      patch.resolved_at = null;
    }
    const { data: updated, error } = await admin.from("payroll_underpayment_findings")
      .update(patch).eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    return { finding: updated };
  });
