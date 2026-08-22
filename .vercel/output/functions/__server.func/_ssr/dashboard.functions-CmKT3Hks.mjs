import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
async function loadRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.role));
}
async function loadEmployee(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email,phone,job_title,department_id,branch_id,manager_id,status,hire_date,base_salary,user_id").eq("user_id", userId).maybeSingle();
  return data;
}
function daysFromNow(iso) {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return null;
  return Math.floor((d - Date.now()) / 864e5);
}
async function buildMe(supabase, emp) {
  if (!emp) return null;
  const year = (/* @__PURE__ */ new Date()).getUTCFullYear();
  const [profile, balances, nextHoliday, openLeave, openTasks, trainingDue, signaturesPending, latestPayslip, draftTs] = await Promise.all([
    supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle(),
    supabase.from("leave_balances").select("accrued_days,used_days,pending_days,carried_over_days,leave_type:leave_types(name)").eq("employee_id", emp.id).eq("year", year),
    // The column is holiday_date, not date. Selecting a column that does not
    // exist is a PostgREST 42703, so the "next holiday" tile has never
    // resolved — it failed silently behind the ?? [] fallback below.
    supabase.from("public_holidays").select("holiday_date,name").gte("holiday_date", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).order("holiday_date", {
      ascending: true
    }).limit(1),
    supabase.from("leave_requests").select("id", {
      count: "exact",
      head: true
    }).eq("employee_id", emp.id).eq("status", "pending"),
    supabase.from("onboarding_assignments").select("id", {
      count: "exact",
      head: true
    }).eq("employee_id", emp.id).in("status", ["assigned", "in_progress"]),
    supabase.from("training_enrollments").select("id", {
      count: "exact",
      head: true
    }).eq("employee_id", emp.id).in("status", ["assigned", "in_progress"]),
    supabase.from("document_signers").select("id", {
      count: "exact",
      head: true
    }).eq("signer_user_id", emp.user_id ?? "00000000-0000-0000-0000-000000000000").eq("status", "pending"),
    supabase.from("payroll_payslips").select("id,net_pay,currency_code,run:payroll_runs(period_start,period_end,pay_date,status)").eq("employee_id", emp.id).order("created_at", {
      ascending: false
    }).limit(1),
    supabase.from("timesheets").select("id", {
      count: "exact",
      head: true
    }).eq("employee_id", emp.id).eq("status", "draft")
  ]);
  const p = profile.data ?? {};
  const requiredKeys = ["legal_first_name", "legal_last_name", "date_of_birth", "address_line1", "city", "country_of_residence", "personal_phone", "emergency_contact_name", "bank_account_number", "bank_name", "tax_identification_number", "national_id_number"];
  const filled = requiredKeys.filter((k) => !!p[k]).length;
  const completeness = Math.round(filled / requiredKeys.length * 100);
  const missingProfileFields = requiredKeys.filter((k) => !p[k]);
  return {
    completeness,
    missingProfileFields,
    balances: balances.data ?? [],
    nextHoliday: (nextHoliday.data ?? [])[0] ?? null,
    pendingLeaveCount: openLeave.count ?? 0,
    onboardingOpenCount: openTasks.count ?? 0,
    trainingDueCount: trainingDue.count ?? 0,
    signaturesPendingCount: signaturesPending.count ?? 0,
    draftTimesheetCount: draftTs.count ?? 0,
    latestPayslip: (latestPayslip.data ?? [])[0] ?? null
  };
}
async function buildManager(supabase, emp) {
  if (!emp) return null;
  const {
    count: reportsCount
  } = await supabase.from("employees").select("id", {
    count: "exact",
    head: true
  }).eq("manager_id", emp.id).eq("status", "active");
  if (!reportsCount) return null;
  const {
    data: reports
  } = await supabase.from("employees").select("id,first_name,last_name,job_title,hire_date").eq("manager_id", emp.id).eq("status", "active");
  const reportIds = (reports ?? []).map((r) => r.id);
  const [pendLeave, pendExpense, pendTs, overdueReviews] = await Promise.all([supabase.from("leave_requests").select("id,employee:employees(first_name,last_name),start_date,end_date,days,leave_type:leave_types(name)").in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"]).eq("status", "pending").order("created_at", {
    ascending: true
  }).limit(10), supabase.from("expense_claims").select("id,title,total_amount,currency,employee:employees(first_name,last_name)").in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"]).eq("status", "submitted").order("created_at", {
    ascending: true
  }).limit(10), supabase.from("timesheets").select("id,period_start,period_end,employee:employees(first_name,last_name)").in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"]).eq("status", "submitted").order("period_end", {
    ascending: true
  }).limit(10), supabase.from("performance_reviews").select("id,status,employee:employees(first_name,last_name)").in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"]).in("status", ["self_submitted", "draft"]).limit(20)]);
  return {
    reportsCount: reportsCount ?? 0,
    pendingLeave: pendLeave.data ?? [],
    pendingExpense: pendExpense.data ?? [],
    pendingTimesheets: pendTs.data ?? [],
    overdueReviews: overdueReviews.data ?? []
  };
}
async function buildHr(supabase, tenantId) {
  if (!tenantId) return null;
  const {
    data: emps
  } = await supabase.from("employees").select("id,first_name,last_name,job_title,designation_id,department_id,branch_id,phone,base_salary,hire_date").eq("tenant_id", tenantId).eq("status", "active");
  const empIds = (emps ?? []).map((e) => e.id);
  const [payRows, profRows, leaveTypes, leaveBalances, expiringCerts, pendingOnboarding] = await Promise.all([empIds.length ? supabase.from("pay_rate_changes").select("employee_id,effective_date,to_amount,status").in("employee_id", empIds).eq("status", "approved").lte("effective_date", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) : Promise.resolve({
    data: []
  }), empIds.length ? (await import("./client.server-D5ro3rAQ.mjs")).supabaseAdmin.from("staff_onboarding_profiles").select("employee_id,address_line1,emergency_contact_name,date_of_birth,bank_account_number,personal_phone,national_id_number").in("employee_id", empIds) : Promise.resolve({
    data: []
  }), supabase.from("leave_types").select("id,name").eq("tenant_id", tenantId).eq("is_active", true), empIds.length ? supabase.from("leave_balances").select("employee_id,leave_type_id,opening_balance").in("employee_id", empIds).eq("year", (/* @__PURE__ */ new Date()).getUTCFullYear()) : Promise.resolve({
    data: []
  }), empIds.length ? supabase.from("certifications").select("id,employee_id,name,expiry_date,employee:employees(first_name,last_name)").in("employee_id", empIds).not("expiry_date", "is", null).lte("expiry_date", new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10)).order("expiry_date", {
    ascending: true
  }).limit(20) : Promise.resolve({
    data: []
  }), supabase.from("onboarding_assignments").select("id", {
    count: "exact",
    head: true
  }).eq("tenant_id", tenantId).in("status", ["assigned", "in_progress"])]);
  const payByEmp = /* @__PURE__ */ new Map();
  for (const row of payRows.data ?? []) payByEmp.set(row.employee_id, true);
  const profByEmp = /* @__PURE__ */ new Map();
  for (const row of profRows.data ?? []) profByEmp.set(row.employee_id, row);
  const missingPay = [];
  const missingDesignation = [];
  const missingDepartment = [];
  const missingBranch = [];
  const missingProfile = [];
  const missingOpeningBalance = [];
  const leaveTypeIds = (leaveTypes.data ?? []).map((t) => t.id);
  const balKey = (e, t) => `${e}::${t}`;
  const haveOpening = /* @__PURE__ */ new Set();
  for (const b of leaveBalances.data ?? []) {
    if (b.opening_balance !== null && b.opening_balance !== void 0) haveOpening.add(balKey(b.employee_id, b.leave_type_id));
  }
  for (const e of emps ?? []) {
    if (!payByEmp.has(e.id) && !e.base_salary) missingPay.push(e);
    if (!e.designation_id && !e.job_title) missingDesignation.push(e);
    if (!e.department_id) missingDepartment.push(e);
    if (!e.branch_id) missingBranch.push(e);
    const p = profByEmp.get(e.id) ?? {};
    const missingFields = [!p.address_line1 && "address", !p.emergency_contact_name && "emergency contact", !p.date_of_birth && "DOB", !p.personal_phone && "personal phone", !p.bank_account_number && "bank account"].filter(Boolean);
    if (missingFields.length >= 2) missingProfile.push({
      ...e,
      missing: missingFields
    });
    if (leaveTypeIds.length > 0) {
      const missingLt = leaveTypeIds.filter((t) => !haveOpening.has(balKey(e.id, t)));
      if (missingLt.length > 0) missingOpeningBalance.push({
        ...e,
        missing_leave_type_ids: missingLt
      });
    }
  }
  return {
    activeEmployeeCount: (emps ?? []).length,
    leaveTypesConfigured: leaveTypeIds.length,
    missingPay: missingPay.slice(0, 50),
    missingDesignation: missingDesignation.slice(0, 50),
    missingDepartment: missingDepartment.slice(0, 50),
    missingBranch: missingBranch.slice(0, 50),
    missingProfile: missingProfile.slice(0, 50),
    missingOpeningBalance: missingOpeningBalance.slice(0, 50),
    expiringCertifications: expiringCerts.data ?? [],
    pendingOnboardingCount: pendingOnboarding.count ?? 0
  };
}
async function buildFinance(supabase, tenantId) {
  if (!tenantId) return null;
  const [draftRuns, pendingClaims, staleFx] = await Promise.all([supabase.from("payroll_runs").select("id,period_start,period_end,pay_date,status,totals").eq("tenant_id", tenantId).in("status", ["draft", "calculated", "submitted"]).order("pay_date", {
    ascending: true
  }).limit(10), supabase.from("expense_claims").select("id,title,total_amount,currency,submitted_at,employee:employees(first_name,last_name,job_title)").eq("tenant_id", tenantId).eq("status", "submitted").order("submitted_at", {
    ascending: true
  }).limit(10), supabase.from("fx_rates").select("id,base_currency,quote_currency,rate,as_of_date").order("as_of_date", {
    ascending: false
  }).limit(1)]);
  const newestFx = (staleFx.data ?? [])[0] ?? null;
  const fxAgeDays = newestFx ? daysFromNow(newestFx.as_of_date) : null;
  const claims = pendingClaims.data ?? [];
  return {
    draftRuns: draftRuns.data ?? [],
    pendingExpenseClaims: claims.length,
    pendingExpenseList: claims,
    fxAgeDays: fxAgeDays === null ? null : Math.abs(fxAgeDays),
    fxStale: fxAgeDays !== null && Math.abs(fxAgeDays) > 7
  };
}
const getDashboardSnapshot_createServerFn_handler = createServerRpc({
  id: "60c5af065f2e24e05251b8b13c57837f280fae8daf2d36b7aa7b8c24ec18e1af",
  name: "getDashboardSnapshot",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getDashboardSnapshot.__executeServer(opts));
const getDashboardSnapshot = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getDashboardSnapshot_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const [roles, emp] = await Promise.all([loadRoles(supabase, userId), loadEmployee(supabase, userId)]);
  const isManager = roles.has("manager");
  const isHr = roles.has("hr") || roles.has("org_admin") || roles.has("branch_admin") || roles.has("regional_admin") || roles.has("super_admin");
  const isFinance = roles.has("finance") || roles.has("org_admin") || roles.has("super_admin");
  const [me, manager, hr, finance] = await Promise.all([buildMe(supabase, emp), isManager || emp && true ? buildManager(supabase, emp).catch(() => null) : Promise.resolve(null), isHr && emp?.tenant_id ? buildHr(supabase, emp.tenant_id).catch(() => null) : Promise.resolve(null), isFinance && emp?.tenant_id ? buildFinance(supabase, emp.tenant_id).catch(() => null) : Promise.resolve(null)]);
  return {
    employee: emp ? {
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      job_title: emp.job_title,
      tenant_id: emp.tenant_id
    } : null,
    roles: Array.from(roles),
    me,
    manager,
    hr,
    finance,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
});
export {
  getDashboardSnapshot_createServerFn_handler
};
