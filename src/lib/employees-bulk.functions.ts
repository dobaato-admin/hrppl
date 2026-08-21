import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const RowSchema = z.object({
  employee_number: z.string().trim().max(50).optional().nullable(),
  first_name: z.string().trim().min(1).max(120),
  last_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  job_title: z.string().trim().max(150).optional().nullable(),
  department_name: z.string().trim().max(150).optional().nullable(),
  manager_email: z.string().trim().email().max(255).optional().nullable(),
  employment_type: z.enum(["full_time", "part_time", "contract", "intern"]).default("full_time"),
  hire_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  base_salary: z.coerce.number().nonnegative().optional().nullable(),
  hourly_rate: z.coerce.number().nonnegative().optional().nullable(),
  pay_frequency: z.string().trim().max(20).optional().nullable(),
  currency_code: z.string().trim().length(3).optional().nullable(),
  tax_treatment_code: z.string().trim().max(6).optional().nullable(),
  income_type: z.string().trim().max(20).optional().nullable(),
  employment_basis: z.string().trim().max(20).optional().nullable(),
  tfn: z.string().trim().max(20).optional().nullable(),
  tfn_status: z.string().trim().max(20).optional().nullable(),
  super_fund_name: z.string().trim().max(150).optional().nullable(),
  super_member_number: z.string().trim().max(60).optional().nullable(),
  bank_name: z.string().trim().max(120).optional().nullable(),
  bank_bsb: z.string().trim().max(10).optional().nullable(),
  bank_account_number: z.string().trim().max(30).optional().nullable(),
  bank_account_name: z.string().trim().max(120).optional().nullable(),
  next_of_kin_name: z.string().trim().max(120).optional().nullable(),
  next_of_kin_relationship: z.string().trim().max(60).optional().nullable(),
  next_of_kin_phone: z.string().trim().max(40).optional().nullable(),
  // Leave opening balances — by leave_type code
  leave_balances: z.record(z.string().min(1).max(40), z.coerce.number()).default({}),
  // YTD opening
  ytd_financial_year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  ytd_gross: z.coerce.number().optional().nullable(),
  ytd_taxable: z.coerce.number().optional().nullable(),
  ytd_paye_tax: z.coerce.number().optional().nullable(),
  ytd_super_guarantee: z.coerce.number().optional().nullable(),
  ytd_super_salary_sacrifice: z.coerce.number().optional().nullable(),
  ytd_super_employee_voluntary: z.coerce.number().optional().nullable(),
  ytd_allowances: z.coerce.number().optional().nullable(),
  ytd_deductions: z.coerce.number().optional().nullable(),
  ytd_reportable_fringe_benefits: z.coerce.number().optional().nullable(),
});

const InputSchema = z.object({
  tenant_id: z.string().uuid(),
  rows: z.array(z.unknown()).min(1).max(2000),
});

type RowResult = { row: number; status: "created" | "updated" | "skipped" | "error"; email?: string; error?: string };

export const bulkImportEmployees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const tenantId = data.tenant_id;

    // Authorize: org_admin / hr / super_admin
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
    const { data: isOrgAdmin } = await supabase.rpc("is_org_admin", { _user_id: userId, _tenant_id: tenantId });
    const { data: isHr } = await supabase.rpc("is_hr", { _user_id: userId, _tenant_id: tenantId });
    if (!isSuper && !isOrgAdmin && !isHr) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load existing org context for resolutions
    const [{ data: tenant }, { data: deps }, { data: leaveTypes }, { data: existingEmps }] = await Promise.all([
      supabaseAdmin.from("tenants").select("id, currency_code").eq("id", tenantId).maybeSingle(),
      supabaseAdmin.from("departments").select("id,name").eq("tenant_id", tenantId),
      supabaseAdmin.from("leave_types").select("id,code").eq("tenant_id", tenantId),
      supabaseAdmin.from("employees").select("id,email,employee_number").eq("tenant_id", tenantId),
    ]);
    if (!tenant) throw new Error("Tenant not found");

    const depByName = new Map((deps ?? []).map((d) => [d.name.toLowerCase(), d.id]));
    const leaveTypeByCode = new Map((leaveTypes ?? []).map((l) => [l.code.toLowerCase(), l.id]));
    const empByEmail = new Map((existingEmps ?? []).map((e) => [e.email.toLowerCase(), e.id]));

    const results: RowResult[] = [];
    let nextSeq = (existingEmps?.length ?? 0) + 1;

    for (let i = 0; i < data.rows.length; i++) {
      const rowNum = i + 2; // header is row 1
      try {
        const parsed = RowSchema.parse(data.rows[i]);
        const email = parsed.email.toLowerCase();

        // Resolve manager id by email (within tenant)
        let managerId: string | null = null;
        if (parsed.manager_email) {
          const mgrId = empByEmail.get(parsed.manager_email.toLowerCase());
          if (mgrId) managerId = mgrId;
        }
        const departmentId = parsed.department_name
          ? depByName.get(parsed.department_name.toLowerCase()) ?? null
          : null;

        const empNumber = parsed.employee_number?.trim() || `EMP-${String(nextSeq).padStart(4, "0")}`;
        nextSeq += 1;

        const empPayload = {
          tenant_id: tenantId,
          employee_number: empNumber,
          first_name: parsed.first_name,
          last_name: parsed.last_name,
          email,
          phone: parsed.phone ?? null,
          job_title: parsed.job_title ?? null,
          department_id: departmentId,
          manager_id: managerId,
          employment_type: parsed.employment_type,
          status: "active" as const,
          hire_date: parsed.hire_date,
          base_salary: parsed.base_salary ?? null,
          hourly_rate: parsed.hourly_rate ?? null,
          pay_frequency: parsed.pay_frequency ?? null,
          currency_code: parsed.currency_code ?? tenant.currency_code,
          tax_treatment_code: parsed.tax_treatment_code ?? null,
          income_type: parsed.income_type ?? null,
          employment_basis: parsed.employment_basis ?? null,
          tfn_status: parsed.tfn_status ?? null,
        };

        let employeeId = empByEmail.get(email) ?? null;
        let resultStatus: RowResult["status"] = "created";

        if (employeeId) {
          const { error } = await supabaseAdmin
            .from("employees")
            .update(empPayload)
            .eq("id", employeeId);
          if (error) throw error;
          resultStatus = "updated";
        } else {
          const { data: ins, error } = await supabaseAdmin
            .from("employees")
            .insert(empPayload)
            .select("id")
            .single();
          if (error) throw error;
          employeeId = ins.id;
          empByEmail.set(email, employeeId);
        }

        // Payroll details (TFN/super/bank/next of kin)
        const hasPayrollDetails =
          parsed.tfn || parsed.super_fund_name || parsed.super_member_number ||
          parsed.bank_name || parsed.bank_bsb || parsed.bank_account_number ||
          parsed.bank_account_name || parsed.next_of_kin_name ||
          parsed.next_of_kin_phone || parsed.next_of_kin_relationship || parsed.phone;
        if (hasPayrollDetails) {
          const { error } = await supabaseAdmin.from("employee_payroll_details").upsert({
            employee_id: employeeId,
            tenant_id: tenantId,
            contact_number: parsed.phone ?? null,
            tfn: parsed.tfn ?? null,
            super_fund_name: parsed.super_fund_name ?? null,
            super_member_number: parsed.super_member_number ?? null,
            bank_name: parsed.bank_name ?? null,
            bank_bsb: parsed.bank_bsb ?? null,
            bank_account_number: parsed.bank_account_number ?? null,
            bank_account_name: parsed.bank_account_name ?? null,
            next_of_kin_name: parsed.next_of_kin_name ?? null,
            next_of_kin_relationship: parsed.next_of_kin_relationship ?? null,
            next_of_kin_phone: parsed.next_of_kin_phone ?? null,
          }, { onConflict: "employee_id" });
          if (error) throw error;
        }

        // Leave opening balances
        const year = new Date(parsed.hire_date).getFullYear();
        for (const [code, openVal] of Object.entries(parsed.leave_balances || {})) {
          if (openVal == null || Number.isNaN(openVal)) continue;
          const ltId = leaveTypeByCode.get(code.toLowerCase());
          if (!ltId) continue;
          const { error } = await supabaseAdmin.from("leave_balances").upsert({
            tenant_id: tenantId,
            employee_id: employeeId,
            leave_type_id: ltId,
            year,
            opening_balance: Number(openVal),
            accrued_days: Number(openVal),
            used_days: 0,
            pending_days: 0,
            carried_over_days: 0,
          }, { onConflict: "employee_id,leave_type_id,year" });
          if (error) throw error;
        }

        // YTD opening
        if (parsed.ytd_financial_year) {
          const { error } = await supabaseAdmin.from("employee_ytd_opening").upsert({
            tenant_id: tenantId,
            employee_id: employeeId,
            financial_year: parsed.ytd_financial_year,
            currency_code: parsed.currency_code ?? tenant.currency_code,
            gross_earnings: parsed.ytd_gross ?? 0,
            taxable_earnings: parsed.ytd_taxable ?? 0,
            paye_tax: parsed.ytd_paye_tax ?? 0,
            super_guarantee: parsed.ytd_super_guarantee ?? 0,
            super_salary_sacrifice: parsed.ytd_super_salary_sacrifice ?? 0,
            super_employee_voluntary: parsed.ytd_super_employee_voluntary ?? 0,
            allowances: parsed.ytd_allowances ?? 0,
            deductions: parsed.ytd_deductions ?? 0,
            reportable_fringe_benefits: parsed.ytd_reportable_fringe_benefits ?? 0,
          }, { onConflict: "employee_id,financial_year" });
          if (error) throw error;
        }

        results.push({ row: rowNum, status: resultStatus, email });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.push({ row: rowNum, status: "error", error: msg });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      errors: results.filter((r) => r.status === "error").length,
    };
    return { summary, results };
  });

export const listLeaveTypeCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tenant_id: string }) => z.object({ tenant_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: types } = await context.supabase
      .from("leave_types")
      .select("code,name")
      .eq("tenant_id", data.tenant_id)
      .order("code");
    return { leave_types: types ?? [] };
  });
