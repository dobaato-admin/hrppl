import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-guard";

/**
 * Role-aware dashboard snapshot.
 *
 * Returns whatever buckets the signed-in user is entitled to:
 *   - me      : always (personal pending items, balances, completeness)
 *   - manager : if user has direct reports (or 'manager' role)
 *   - hr      : if user has 'hr' / 'org_admin' / 'super_admin' / 'regional_admin' role
 *   - finance : if user has 'finance' role
 *
 * No mutations. Reads only via tenant-scoped queries.
 */

type RoleSet = Set<string>;

async function loadRoles(supabase: any, userId: string): Promise<RoleSet> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return new Set(((data ?? []) as Array<{ role: string }>).map((r) => r.role));
}

async function loadEmployee(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select(
      "id,tenant_id,first_name,last_name,email,phone,job_title,department_id,branch_id,manager_id,status,hire_date,base_salary,user_id",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return data as any;
}

function daysFromNow(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return null;
  return Math.floor((d - Date.now()) / 86_400_000);
}

// ------------------- ME bucket -------------------
async function buildMe(supabase: any, emp: any) {
  if (!emp) return null;
  const year = new Date().getUTCFullYear();
  const [profile, balances, nextHoliday, openLeave, openTasks, trainingDue, signaturesPending, latestPayslip, draftTs] =
    await Promise.all([
      supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", emp.id).maybeSingle(),
      supabase
        .from("leave_balances")
        .select("accrued_days,used_days,pending_days,carried_over_days,leave_type:leave_types(name)")
        .eq("employee_id", emp.id)
        .eq("year", year),
      // The column is holiday_date, not date. Selecting a column that does not
      // exist is a PostgREST 42703, so the "next holiday" tile has never
      // resolved — it failed silently behind the ?? [] fallback below.
      supabase
        .from("public_holidays")
        .select("holiday_date,name")
        .gte("holiday_date", new Date().toISOString().slice(0, 10))
        .order("holiday_date", { ascending: true })
        .limit(1),
      supabase
        .from("leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
        .eq("status", "pending"),
      supabase
        .from("onboarding_assignments")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
        .in("status", ["assigned", "in_progress"]),
      supabase
        .from("training_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
        .in("status", ["assigned", "in_progress"]),
      supabase
        .from("document_signers")
        .select("id", { count: "exact", head: true })
        .eq("signer_user_id", emp.user_id ?? "00000000-0000-0000-0000-000000000000")
        .eq("status", "pending"),
      supabase
        .from("payroll_payslips")
        .select("id,net_pay,currency_code,run:payroll_runs(period_start,period_end,pay_date,status)")
        .eq("employee_id", emp.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("timesheets")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
        .eq("status", "draft"),
    ]);

  const p = (profile as any).data ?? {};
  const requiredKeys = [
    "legal_first_name", "legal_last_name", "date_of_birth", "address_line1", "city",
    "country_of_residence", "personal_phone", "emergency_contact_name",
    "bank_account_number", "bank_name", "tax_identification_number", "national_id_number",
  ];
  const filled = requiredKeys.filter((k) => !!p[k]).length;
  const completeness = Math.round((filled / requiredKeys.length) * 100);
  const missingProfileFields = requiredKeys.filter((k) => !p[k]);

  return {
    completeness,
    missingProfileFields,
    balances: (balances as any).data ?? [],
    nextHoliday: ((nextHoliday as any).data ?? [])[0] ?? null,
    pendingLeaveCount: (openLeave as any).count ?? 0,
    onboardingOpenCount: (openTasks as any).count ?? 0,
    trainingDueCount: (trainingDue as any).count ?? 0,
    signaturesPendingCount: (signaturesPending as any).count ?? 0,
    draftTimesheetCount: (draftTs as any).count ?? 0,
    latestPayslip: ((latestPayslip as any).data ?? [])[0] ?? null,
  };
}

// ------------------- MANAGER bucket -------------------
async function buildManager(supabase: any, emp: any) {
  if (!emp) return null;
  const { count: reportsCount } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("manager_id", emp.id)
    .eq("status", "active");
  if (!reportsCount) return null;

  // get report ids
  const { data: reports } = await supabase
    .from("employees")
    .select("id,first_name,last_name,job_title,hire_date")
    .eq("manager_id", emp.id)
    .eq("status", "active");
  const reportIds: string[] = (reports ?? []).map((r: any) => r.id);

  const [pendLeave, pendExpense, pendTs, overdueReviews] = await Promise.all([
    supabase
      .from("leave_requests")
      .select("id,employee:employees(first_name,last_name),start_date,end_date,days,leave_type:leave_types(name)")
      .in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("expense_claims")
      .select("id,title,total_amount,currency,employee:employees(first_name,last_name)")
      .in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("status", "submitted")
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("timesheets")
      .select("id,period_start,period_end,employee:employees(first_name,last_name)")
      .in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("status", "submitted")
      .order("period_end", { ascending: true })
      .limit(10),
    supabase
      .from("performance_reviews")
      .select("id,status,employee:employees(first_name,last_name)")
      .in("employee_id", reportIds.length ? reportIds : ["00000000-0000-0000-0000-000000000000"])
      .in("status", ["self_submitted", "draft"])
      .limit(20),
  ]);

  return {
    reportsCount: reportsCount ?? 0,
    pendingLeave: (pendLeave as any).data ?? [],
    pendingExpense: (pendExpense as any).data ?? [],
    pendingTimesheets: (pendTs as any).data ?? [],
    overdueReviews: (overdueReviews as any).data ?? [],
  };
}

// ------------------- HR bucket (org-wide anomalies) -------------------
async function buildHr(supabase: any, tenantId: string) {
  if (!tenantId) return null;
  // Active employees
  const { data: emps } = await supabase
    .from("employees")
    .select("id,first_name,last_name,job_title,designation_id,department_id,branch_id,phone,base_salary,hire_date")
    .eq("tenant_id", tenantId)
    .eq("status", "active");
  const empIds: string[] = (emps ?? []).map((e: any) => e.id);

  const [payRows, profRows, leaveTypes, leaveBalances, expiringCerts, pendingOnboarding] = await Promise.all([
    empIds.length
      ? supabase
          .from("pay_rate_changes")
          .select("employee_id,effective_date,to_amount,status")
          .in("employee_id", empIds)
          .eq("status", "approved")
          .lte("effective_date", new Date().toISOString().slice(0, 10))
      : Promise.resolve({ data: [] }),
    empIds.length
      ? (await import("@/integrations/supabase/client.server")).supabaseAdmin
          .from("staff_onboarding_profiles")
          .select("employee_id,address_line1,emergency_contact_name,date_of_birth,bank_account_number,personal_phone,national_id_number")
          .in("employee_id", empIds)
      : Promise.resolve({ data: [] }),
    supabase.from("leave_types").select("id,name").eq("tenant_id", tenantId).eq("is_active", true),
    empIds.length
      ? supabase
          .from("leave_balances")
          .select("employee_id,leave_type_id,opening_balance")
          .in("employee_id", empIds)
          .eq("year", new Date().getUTCFullYear())
      : Promise.resolve({ data: [] }),
    empIds.length
      ? supabase
          .from("certifications")
          .select("id,employee_id,name,expiry_date,employee:employees(first_name,last_name)")
          .in("employee_id", empIds)
          .not("expiry_date", "is", null)
          .lte("expiry_date", new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10))
          .order("expiry_date", { ascending: true })
          .limit(20)
      : Promise.resolve({ data: [] }),
    supabase
      .from("onboarding_assignments")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .in("status", ["assigned", "in_progress"]),
  ]);

  const payByEmp = new Map<string, boolean>();
  for (const row of ((payRows as any).data ?? []) as any[]) payByEmp.set(row.employee_id, true);
  const profByEmp = new Map<string, any>();
  for (const row of ((profRows as any).data ?? []) as any[]) profByEmp.set(row.employee_id, row);

  const missingPay: any[] = [];
  const missingDesignation: any[] = [];
  const missingDepartment: any[] = [];
  const missingBranch: any[] = [];
  const missingProfile: any[] = [];
  const missingOpeningBalance: any[] = [];

  const leaveTypeIds = ((leaveTypes as any).data ?? []).map((t: any) => t.id);
  const balKey = (e: string, t: string) => `${e}::${t}`;
  const haveOpening = new Set<string>();
  for (const b of ((leaveBalances as any).data ?? []) as any[]) {
    if (b.opening_balance !== null && b.opening_balance !== undefined) haveOpening.add(balKey(b.employee_id, b.leave_type_id));
  }

  for (const e of (emps ?? []) as any[]) {
    if (!payByEmp.has(e.id) && !e.base_salary) missingPay.push(e);
    if (!e.designation_id && !e.job_title) missingDesignation.push(e);
    if (!e.department_id) missingDepartment.push(e);
    if (!e.branch_id) missingBranch.push(e);
    const p = profByEmp.get(e.id) ?? {};
    const missingFields = [
      !p.address_line1 && "address",
      !p.emergency_contact_name && "emergency contact",
      !p.date_of_birth && "DOB",
      !p.personal_phone && "personal phone",
      !p.bank_account_number && "bank account",
    ].filter(Boolean) as string[];
    if (missingFields.length >= 2) missingProfile.push({ ...e, missing: missingFields });
    if (leaveTypeIds.length > 0) {
      const missingLt = leaveTypeIds.filter((t: string) => !haveOpening.has(balKey(e.id, t)));
      if (missingLt.length > 0) missingOpeningBalance.push({ ...e, missing_leave_type_ids: missingLt });
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
    expiringCertifications: ((expiringCerts as any).data ?? []) as any[],
    pendingOnboardingCount: (pendingOnboarding as any).count ?? 0,
  };
}

// ------------------- FINANCE bucket -------------------
async function buildFinance(supabase: any, tenantId: string) {
  if (!tenantId) return null;
  const [draftRuns, pendingClaims, staleFx] = await Promise.all([
    supabase
      .from("payroll_runs")
      .select("id,period_start,period_end,pay_date,status,totals")
      .eq("tenant_id", tenantId)
      .in("status", ["draft", "calculated", "submitted"])
      .order("pay_date", { ascending: true })
      .limit(10),
    supabase
      .from("expense_claims")
      .select("id,title,total_amount,currency,submitted_at,employee:employees(first_name,last_name,job_title)")
      .eq("tenant_id", tenantId)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: true })
      .limit(10),
    supabase
      .from("fx_rates")
      .select("id,base_currency,quote_currency,rate,as_of_date")
      .order("as_of_date", { ascending: false })
      .limit(1),
  ]);
  const newestFx = ((staleFx as any).data ?? [])[0] ?? null;
  const fxAgeDays = newestFx ? daysFromNow(newestFx.as_of_date) : null;
  const claims = (pendingClaims as any).data ?? [];
  return {
    draftRuns: (draftRuns as any).data ?? [],
    pendingExpenseClaims: claims.length,
    pendingExpenseList: claims,
    fxAgeDays: fxAgeDays === null ? null : Math.abs(fxAgeDays),
    fxStale: fxAgeDays !== null && Math.abs(fxAgeDays) > 7,
  };
}

export const getDashboardSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const [roles, emp] = await Promise.all([loadRoles(supabase, userId), loadEmployee(supabase, userId)]);

    const isManager = roles.has("manager");
    const isHr =
      roles.has("hr") ||
      roles.has("org_admin") ||
      roles.has("branch_admin") ||
      roles.has("regional_admin") ||
      roles.has("super_admin");
    const isFinance = roles.has("finance") || roles.has("org_admin") || roles.has("super_admin");

    const [me, manager, hr, finance] = await Promise.all([
      buildMe(supabase, emp),
      isManager || (emp && true)
        ? buildManager(supabase, emp).catch(() => null)
        : Promise.resolve(null),
      isHr && emp?.tenant_id ? buildHr(supabase, emp.tenant_id).catch(() => null) : Promise.resolve(null),
      isFinance && emp?.tenant_id ? buildFinance(supabase, emp.tenant_id).catch(() => null) : Promise.resolve(null),
    ]);

    return {
      employee: emp
        ? {
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            job_title: emp.job_title,
            tenant_id: emp.tenant_id,
          }
        : null,
      roles: Array.from(roles),
      me,
      manager,
      hr,
      finance,
      generatedAt: new Date().toISOString(),
    };
  });
