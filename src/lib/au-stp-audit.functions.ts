/**
 * AU STP Phase 2 + Payday Super audit/readiness server fn.
 * Surfaces employer-level + per-employee gaps before STP build/export.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

export const getAuStpAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const { data: tenant } = await supabase.from("tenants").select("id, name, country_code").eq("id", tenantId).maybeSingle();
    if (!tenant) throw new Error("Tenant not found");
    if (tenant.country_code !== "AU") {
      return { ok: false, reason: "Tenant is not configured for Australia", tenant };
    }
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { _user_id: userId, _tenant_id: tenant.id } as any);
    if (!isAdmin) throw new Error("Forbidden: org admin required");

    // Employer readiness
    const { data: settings } = await supabase
      .from("tenant_payroll_settings")
      .select("abn, branch_code, bms_id, stp_gateway, stp_gateway_config, payday_super_enabled, default_super_fund_id")
      .eq("tenant_id", tenant.id).maybeSingle();
    const s = (settings as any) ?? {};
    const employer = {
      abn: { value: s.abn ?? null, ok: !!s.abn, label: "ABN" },
      branch_code: { value: s.branch_code ?? null, ok: !!s.branch_code, label: "Branch code (default 001)" },
      bms_id: { value: s.bms_id ?? null, ok: !!s.bms_id, label: "BMS ID (Business Management Software ID)" },
      stp_gateway: { value: s.stp_gateway ?? "manual", ok: !!s.stp_gateway && s.stp_gateway !== "manual", label: "STP submission gateway" },
      default_super_fund: { value: s.default_super_fund_id ?? null, ok: !!s.default_super_fund_id, label: "Default super fund (stapled fallback)" },
    };
    const employerReady = Object.values(employer).every((v: any) => v.ok);

    // Per-employee readiness
    const { data: emps } = await supabase
      .from("employees")
      .select("id, first_name, last_name, employee_number, status, hire_date, tfn_status, income_type, employment_basis, tax_treatment_code, cessation_reason_code")
      .eq("tenant_id", tenant.id)
      .neq("status", "terminated")
      .limit(2000);

    const empGaps = (emps ?? []).map((e: any) => {
      const missing: string[] = [];
      if (!e.tfn_status || e.tfn_status === "unknown") missing.push("TFN status");
      if (!e.income_type) missing.push("Income type (SAW/CHP/WHM/SWP/VOL)");
      if (!e.employment_basis) missing.push("Employment basis (F/P/C/L/N/D)");
      if (!e.tax_treatment_code) missing.push("Tax treatment code (6-char)");
      return { id: e.id, name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(), employee_number: e.employee_number, missing };
    });
    const empWithGaps = empGaps.filter((e: any) => e.missing.length > 0);

    // Super choice
    const empIds = (emps ?? []).map((e: any) => e.id);
    const { data: choices } = empIds.length
      ? await supabase.from("employee_super_choices").select("employee_id, fund_id").in("employee_id", empIds)
      : { data: [] };
    const haveChoice = new Set((choices ?? []).map((c: any) => c.employee_id));
    const empMissingSuper = (emps ?? []).filter((e: any) => !haveChoice.has(e.id))
      .map((e: any) => ({ id: e.id, name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(), employee_number: e.employee_number }));

    // Payday Super readiness (effective from 1 July 2026: SG must reach fund within 7 calendar days of payday)
    const { data: obligations } = await supabase
      .from("au_payday_super_obligations")
      .select("id, pay_date, due_date, status, amount_due, amount_paid")
      .eq("tenant_id", tenant.id)
      .order("pay_date", { ascending: false })
      .limit(20);
    const today = new Date().toISOString().slice(0, 10);
    const overdueSuper = (obligations ?? []).filter((o: any) => o.due_date < today && o.status !== "paid").length;

    return {
      ok: true,
      tenant: { id: tenant.id, name: tenant.name },
      employer,
      employerReady,
      employees: {
        total: (emps ?? []).length,
        with_gaps: empWithGaps.length,
        gaps: empWithGaps.slice(0, 200),
        missing_super_choice: empMissingSuper.slice(0, 200),
        missing_super_count: empMissingSuper.length,
      },
      paydaySuper: {
        enabled: !!s.payday_super_enabled,
        overdue: overdueSuper,
        recent: obligations ?? [],
        sevenDayRuleAchievable: !!s.payday_super_enabled && !!s.default_super_fund_id && employerReady,
      },
      exportBlocked: !employerReady || empWithGaps.length > 0,
    };
  });
