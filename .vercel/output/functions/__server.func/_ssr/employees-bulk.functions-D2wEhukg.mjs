import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, I as coerce, E as recordType, z as stringType, B as enumType, D as arrayType, J as unknownType } from "../_libs/zod.mjs";
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
const RowSchema = objectType({
  employee_number: stringType().trim().max(50).optional().nullable(),
  first_name: stringType().trim().min(1).max(120),
  last_name: stringType().trim().min(1).max(120),
  email: stringType().trim().email().max(255),
  phone: stringType().trim().max(40).optional().nullable(),
  job_title: stringType().trim().max(150).optional().nullable(),
  department_name: stringType().trim().max(150).optional().nullable(),
  manager_email: stringType().trim().email().max(255).optional().nullable(),
  employment_type: enumType(["full_time", "part_time", "contract", "intern"]).default("full_time"),
  hire_date: stringType().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  base_salary: coerce.number().nonnegative().optional().nullable(),
  hourly_rate: coerce.number().nonnegative().optional().nullable(),
  pay_frequency: stringType().trim().max(20).optional().nullable(),
  currency_code: stringType().trim().length(3).optional().nullable(),
  tax_treatment_code: stringType().trim().max(6).optional().nullable(),
  income_type: stringType().trim().max(20).optional().nullable(),
  employment_basis: stringType().trim().max(20).optional().nullable(),
  tfn: stringType().trim().max(20).optional().nullable(),
  tfn_status: stringType().trim().max(20).optional().nullable(),
  super_fund_name: stringType().trim().max(150).optional().nullable(),
  super_member_number: stringType().trim().max(60).optional().nullable(),
  bank_name: stringType().trim().max(120).optional().nullable(),
  bank_bsb: stringType().trim().max(10).optional().nullable(),
  bank_account_number: stringType().trim().max(30).optional().nullable(),
  bank_account_name: stringType().trim().max(120).optional().nullable(),
  next_of_kin_name: stringType().trim().max(120).optional().nullable(),
  next_of_kin_relationship: stringType().trim().max(60).optional().nullable(),
  next_of_kin_phone: stringType().trim().max(40).optional().nullable(),
  // Leave opening balances — by leave_type code
  leave_balances: recordType(stringType().min(1).max(40), coerce.number()).default({}),
  // YTD opening
  ytd_financial_year: coerce.number().int().min(2e3).max(2100).optional().nullable(),
  ytd_gross: coerce.number().optional().nullable(),
  ytd_taxable: coerce.number().optional().nullable(),
  ytd_paye_tax: coerce.number().optional().nullable(),
  ytd_super_guarantee: coerce.number().optional().nullable(),
  ytd_super_salary_sacrifice: coerce.number().optional().nullable(),
  ytd_super_employee_voluntary: coerce.number().optional().nullable(),
  ytd_allowances: coerce.number().optional().nullable(),
  ytd_deductions: coerce.number().optional().nullable(),
  ytd_reportable_fringe_benefits: coerce.number().optional().nullable()
});
const InputSchema = objectType({
  tenant_id: stringType().uuid(),
  rows: arrayType(unknownType()).min(1).max(2e3)
});
const bulkImportEmployees_createServerFn_handler = createServerRpc({
  id: "2ad2ea71ca3de95eac6d4bf941d8c88af99c042fb6606997b9ca7ff117309c90",
  name: "bulkImportEmployees",
  filename: "src/lib/employees-bulk.functions.ts"
}, (opts) => bulkImportEmployees.__executeServer(opts));
const bulkImportEmployees = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => InputSchema.parse(d)).handler(bulkImportEmployees_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId,
    supabase
  } = context;
  const tenantId = data.tenant_id;
  const {
    data: isSuper
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  });
  const {
    data: isOrgAdmin
  } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: tenantId
  });
  const {
    data: isHr
  } = await supabase.rpc("is_hr", {
    _user_id: userId,
    _tenant_id: tenantId
  });
  if (!isSuper && !isOrgAdmin && !isHr) throw new Error("Forbidden");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const [{
    data: tenant
  }, {
    data: deps
  }, {
    data: leaveTypes
  }, {
    data: existingEmps
  }] = await Promise.all([supabaseAdmin.from("tenants").select("id, currency_code").eq("id", tenantId).maybeSingle(), supabaseAdmin.from("departments").select("id,name").eq("tenant_id", tenantId), supabaseAdmin.from("leave_types").select("id,code").eq("tenant_id", tenantId), supabaseAdmin.from("employees").select("id,email,employee_number").eq("tenant_id", tenantId)]);
  if (!tenant) throw new Error("Tenant not found");
  const depByName = new Map((deps ?? []).map((d) => [d.name.toLowerCase(), d.id]));
  const leaveTypeByCode = new Map((leaveTypes ?? []).map((l) => [l.code.toLowerCase(), l.id]));
  const empByEmail = new Map((existingEmps ?? []).map((e) => [e.email.toLowerCase(), e.id]));
  const results = [];
  let nextSeq = (existingEmps?.length ?? 0) + 1;
  for (let i = 0; i < data.rows.length; i++) {
    const rowNum = i + 2;
    try {
      const parsed = RowSchema.parse(data.rows[i]);
      const email = parsed.email.toLowerCase();
      let managerId = null;
      if (parsed.manager_email) {
        const mgrId = empByEmail.get(parsed.manager_email.toLowerCase());
        if (mgrId) managerId = mgrId;
      }
      const departmentId = parsed.department_name ? depByName.get(parsed.department_name.toLowerCase()) ?? null : null;
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
        status: "active",
        hire_date: parsed.hire_date,
        base_salary: parsed.base_salary ?? null,
        hourly_rate: parsed.hourly_rate ?? null,
        pay_frequency: parsed.pay_frequency ?? null,
        currency_code: parsed.currency_code ?? tenant.currency_code,
        tax_treatment_code: parsed.tax_treatment_code ?? null,
        income_type: parsed.income_type ?? null,
        employment_basis: parsed.employment_basis ?? null,
        tfn_status: parsed.tfn_status ?? null
      };
      let employeeId = empByEmail.get(email) ?? null;
      let resultStatus = "created";
      if (employeeId) {
        const {
          error
        } = await supabaseAdmin.from("employees").update(empPayload).eq("id", employeeId);
        if (error) throw error;
        resultStatus = "updated";
      } else {
        const {
          data: ins,
          error
        } = await supabaseAdmin.from("employees").insert(empPayload).select("id").single();
        if (error) throw error;
        employeeId = ins.id;
        empByEmail.set(email, employeeId);
      }
      const hasPayrollDetails = parsed.tfn || parsed.super_fund_name || parsed.super_member_number || parsed.bank_name || parsed.bank_bsb || parsed.bank_account_number || parsed.bank_account_name || parsed.next_of_kin_name || parsed.next_of_kin_phone || parsed.next_of_kin_relationship || parsed.phone;
      if (hasPayrollDetails) {
        const {
          error
        } = await supabaseAdmin.from("employee_payroll_details").upsert({
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
          next_of_kin_phone: parsed.next_of_kin_phone ?? null
        }, {
          onConflict: "employee_id"
        });
        if (error) throw error;
      }
      const year = new Date(parsed.hire_date).getFullYear();
      for (const [code, openVal] of Object.entries(parsed.leave_balances || {})) {
        if (openVal == null || Number.isNaN(openVal)) continue;
        const ltId = leaveTypeByCode.get(code.toLowerCase());
        if (!ltId) continue;
        const {
          error
        } = await supabaseAdmin.from("leave_balances").upsert({
          tenant_id: tenantId,
          employee_id: employeeId,
          leave_type_id: ltId,
          year,
          opening_balance: Number(openVal),
          accrued_days: Number(openVal),
          used_days: 0,
          pending_days: 0,
          carried_over_days: 0
        }, {
          onConflict: "employee_id,leave_type_id,year"
        });
        if (error) throw error;
      }
      if (parsed.ytd_financial_year) {
        const {
          error
        } = await supabaseAdmin.from("employee_ytd_opening").upsert({
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
          reportable_fringe_benefits: parsed.ytd_reportable_fringe_benefits ?? 0
        }, {
          onConflict: "employee_id,financial_year"
        });
        if (error) throw error;
      }
      results.push({
        row: rowNum,
        status: resultStatus,
        email
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      results.push({
        row: rowNum,
        status: "error",
        error: msg
      });
    }
  }
  const summary = {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    errors: results.filter((r) => r.status === "error").length
  };
  return {
    summary,
    results
  };
});
const listLeaveTypeCodes_createServerFn_handler = createServerRpc({
  id: "fe7786212f284b2b294f32afa9244aa6e7409f93ff699c0acafe71edf273f0e6",
  name: "listLeaveTypeCodes",
  filename: "src/lib/employees-bulk.functions.ts"
}, (opts) => listLeaveTypeCodes.__executeServer(opts));
const listLeaveTypeCodes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenant_id: stringType().uuid()
}).parse(d)).handler(listLeaveTypeCodes_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: types
  } = await context.supabase.from("leave_types").select("code,name").eq("tenant_id", data.tenant_id).order("code");
  return {
    leave_types: types ?? []
  };
});
export {
  bulkImportEmployees_createServerFn_handler,
  listLeaveTypeCodes_createServerFn_handler
};
