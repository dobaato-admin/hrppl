import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadMyEmployee(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id,first_name,last_name,email,phone,job_title,department_id,manager_id,employment_type,status,hire_date,base_salary,currency_code,employee_number,user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data as null | {
    id: string; tenant_id: string; first_name: string; last_name: string; email: string;
    phone: string | null; job_title: string | null; department_id: string | null;
    manager_id: string | null; employment_type: string; status: string; hire_date: string;
    base_salary: number | null; currency_code: string | null; employee_number: string;
    user_id: string;
  };
}

// ---------- Overview ----------
export const getMeOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const employee = await loadMyEmployee(supabase, userId);
    if (!employee) return { employee: null };

    const [dept, manager, prof, balances, leaveRecent, payslipRecent, docCount, openLeave, openTasks] = await Promise.all([
      employee.department_id
        ? supabase.from("departments").select("id,name").eq("id", employee.department_id).maybeSingle()
        : Promise.resolve({ data: null }),
      employee.manager_id
        ? supabase.from("employees").select("id,first_name,last_name,email,job_title").eq("id", employee.manager_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", employee.id).maybeSingle(),
      supabase
        .from("leave_balances")
        .select("accrued_days,used_days,pending_days,carried_over_days,year,leave_type:leave_types(id,name,is_paid)")
        .eq("employee_id", employee.id)
        .eq("year", new Date().getUTCFullYear()),
      supabase
        .from("leave_requests")
        .select("id,start_date,end_date,days,status,leave_type:leave_types(name)")
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("payroll_payslips")
        .select("id,run_id,net_pay,currency_code,run:payroll_runs(period_start,period_end,pay_date,status)")
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("employee_documents")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", employee.id),
      supabase
        .from("leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", employee.id)
        .eq("status", "pending"),
      supabase
        .from("onboarding_assignments")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", employee.id)
        .eq("status", "in_progress"),
    ]);

    // Completeness: 12 key personal fields
    const p = (prof as any).data ?? {};
    const requiredKeys = [
      "legal_first_name","legal_last_name","date_of_birth","address_line1","city","country_of_residence",
      "personal_phone","emergency_contact_name","bank_account_number","bank_name","tax_identification_number","national_id_number",
    ];
    const filled = requiredKeys.filter((k) => !!p[k]).length;
    const completeness = Math.round((filled / requiredKeys.length) * 100);

    return {
      employee,
      department: (dept as any).data ?? null,
      manager: (manager as any).data ?? null,
      profile: p,
      profileCompleteness: completeness,
      leaveBalances: (balances as any).data ?? [],
      recentLeave: (leaveRecent as any).data ?? [],
      recentPayslips: (payslipRecent as any).data ?? [],
      documentCount: (docCount as any).count ?? 0,
      pendingLeaveCount: (openLeave as any).count ?? 0,
      openTaskCount: (openTasks as any).count ?? 0,
    };
  });

// ---------- Contact details ----------
const contactSchema = z.object({
  personal_email: z.string().trim().email().max(255).or(z.literal("")).nullable().optional(),
  personal_phone: z.string().trim().max(40).nullable().optional(),
  address_line1: z.string().trim().max(200).nullable().optional(),
  address_line2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  region: z.string().trim().max(120).nullable().optional(),
  postal_code: z.string().trim().max(40).nullable().optional(),
  country_of_residence: z.string().trim().length(2).nullable().optional().or(z.literal("")),
  emergency_contact_name: z.string().trim().max(120).nullable().optional(),
  emergency_contact_phone: z.string().trim().max(40).nullable().optional(),
  emergency_contact_relation: z.string().trim().max(60).nullable().optional(),
  marital_status: z.string().trim().max(40).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(), // work phone on employees row
});

export const updateMyContactDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const admin = await loadAdmin();
    const profilePayload: any = { ...data };
    const workPhone = profilePayload.phone;
    delete profilePayload.phone;
    if (profilePayload.personal_email === "") profilePayload.personal_email = null;
    if (profilePayload.country_of_residence === "") profilePayload.country_of_residence = null;
    profilePayload.employee_id = emp.id;
    profilePayload.tenant_id = emp.tenant_id;
    const { error } = await admin
      .from("staff_onboarding_profiles")
      .upsert(profilePayload, { onConflict: "employee_id" } as any);
    if (error) throw new Error(error.message);
    if (workPhone !== undefined) {
      await admin.from("employees").update({ phone: workPhone || null }).eq("id", emp.id);
    }
    await admin.from("audit_log").insert({
      entity_type: "staff_onboarding_profile",
      entity_id: emp.id,
      action: "self_service_contact_updated",
      actor_id: userId,
      metadata: { tenant_id: emp.tenant_id, fields: Object.keys(data) },
    });
    return { ok: true };
  });

// ---------- Banking & tax ----------
const bankTaxSchema = z.object({
  bank_name: z.string().trim().max(120).nullable().optional(),
  bank_account_holder: z.string().trim().max(160).nullable().optional(),
  bank_account_number: z.string().trim().max(60).nullable().optional(),
  bank_branch_code: z.string().trim().max(40).nullable().optional(),
  bank_iban: z.string().trim().max(60).nullable().optional(),
  bank_swift: z.string().trim().max(20).nullable().optional(),
  tax_identification_number: z.string().trim().max(60).nullable().optional(),
  social_security_number: z.string().trim().max(60).nullable().optional(),
  provident_fund_number: z.string().trim().max(60).nullable().optional(),
  pension_fund_number: z.string().trim().max(60).nullable().optional(),
  national_id_number: z.string().trim().max(60).nullable().optional(),
});

export const updateMyBankingTax = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bankTaxSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const admin = await loadAdmin();
    const payload: any = { ...data, employee_id: emp.id, tenant_id: emp.tenant_id };
    const { error } = await admin
      .from("staff_onboarding_profiles")
      .upsert(payload, { onConflict: "employee_id" } as any);
    if (error) throw new Error(error.message);
    // Audit — never log full account numbers; mask
    const masked = (v: string | null | undefined) => (v ? `••••${v.slice(-4)}` : null);
    await admin.from("audit_log").insert({
      entity_type: "staff_onboarding_profile",
      entity_id: emp.id,
      action: "self_service_banking_tax_updated",
      actor_id: userId,
      metadata: {
        tenant_id: emp.tenant_id,
        changed: Object.keys(data),
        bank_account_number_mask: masked(data.bank_account_number ?? null),
        bank_iban_mask: masked(data.bank_iban ?? null),
        has_tax_id: !!data.tax_identification_number,
      },
    });
    return { ok: true };
  });

// ---------- Documents ----------
const DOC_TYPES = ["contract","id","passport","visa","certificate","tax_form","citizenship_certificate","drivers_license","other"] as const;

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) return { documents: [], employeeId: null, tenantId: null };
    const { data } = await supabase
      .from("employee_documents")
      .select("id,doc_type,file_path,file_name,mime_type,size_bytes,visibility,notes,created_at")
      .eq("employee_id", emp.id)
      .eq("visibility", "employee")
      .order("created_at", { ascending: false });
    return { documents: data ?? [], employeeId: emp.id, tenantId: emp.tenant_id };
  });

export const registerMyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      doc_type: z.enum(DOC_TYPES),
      file_path: z.string().min(3).max(500),
      file_name: z.string().min(1).max(255),
      mime_type: z.string().max(100).optional(),
      size_bytes: z.number().int().nonnegative().max(50 * 1024 * 1024).optional(),
      notes: z.string().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    // Enforce path prefix: tenant_id/employee_id/...
    const expected = `${emp.tenant_id}/${emp.id}/`;
    if (!data.file_path.startsWith(expected)) throw new Error("Invalid storage path");
    const admin = await loadAdmin();
    const { data: row, error } = await admin
      .from("employee_documents")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        doc_type: data.doc_type,
        file_path: data.file_path,
        file_name: data.file_name,
        mime_type: data.mime_type ?? null,
        size_bytes: data.size_bytes ?? null,
        uploaded_by: userId,
        visibility: "employee",
        notes: data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (row as any).id };
  });

export const createMyDocumentDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const { data: doc } = await supabase
      .from("employee_documents")
      .select("id,file_path,visibility,employee_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!doc || (doc as any).employee_id !== emp.id) throw new Error("Document not found");
    const admin = await loadAdmin();
    const { data: signed, error } = await admin.storage
      .from("employee-documents")
      .createSignedUrl((doc as any).file_path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl, expiresInSeconds: 600 };
  });

export const deleteMyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await loadMyEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const { data: doc } = await supabase
      .from("employee_documents")
      .select("id,file_path,employee_id,visibility")
      .eq("id", data.id)
      .maybeSingle();
    if (!doc || (doc as any).employee_id !== emp.id || (doc as any).visibility !== "employee") {
      throw new Error("Document not found or not deletable");
    }
    const admin = await loadAdmin();
    await admin.storage.from("employee-documents").remove([(doc as any).file_path]);
    await admin.from("employee_documents").delete().eq("id", data.id);
    return { ok: true };
  });

// ---------- Directory ----------
export const getCompanyDirectory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      search: z.string().trim().max(120).optional(),
      departmentId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(200).default(100),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // The caller's OWN client for their own row — "employee reads own record"
    // covers that, and it establishes which tenant they belong to. Never trust
    // a tenant id from the request.
    const me = await loadMyEmployee(supabase, userId);
    if (!me) return { employees: [], departments: [] };

    // The directory listing goes through the service-role client, deliberately.
    //
    // There is no RLS policy letting a plain `employee` read a colleague:
    // "employee reads own record" is `user_id = auth.uid()`, and every broader
    // policy requires hr / finance / manager / org_admin / super_admin. So with
    // the caller's own client this returned exactly one row — themselves — and
    // the company directory was empty for the very people it exists for. Same
    // for the colleague picker on /recognition.
    //
    // The alternative, a tenant-wide SELECT policy on `employees`, would expose
    // every column including base_salary. This mirrors the approach already
    // taken in teams.functions.ts: use the admin client and hand back only a
    // directory-safe projection. No compensation, identifiers or bank details.
    //
    // tenant_id is pinned to the caller's own tenant, so this cannot read
    // across tenants. tenant-scope-exempt: scoped via me.tenant_id below.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("employees")
      .select("id,first_name,last_name,job_title,email,phone,department_id,manager_id,status")
      .eq("tenant_id", me.tenant_id)
      .eq("status", "active")
      .order("first_name");
    if (data.departmentId) q = q.eq("department_id", data.departmentId);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},job_title.ilike.${s}`);
    }
    const { data: emps } = await q.limit(data.limit);
    const { data: depts } = await supabaseAdmin
      .from("departments").select("id,name").eq("tenant_id", me.tenant_id).order("name");
    return { employees: emps ?? [], departments: depts ?? [] };
  });

// ---------- Team (manager + reports) ----------
export const getMyTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const me = await loadMyEmployee(supabase, userId);
    if (!me) return { manager: null, peers: [], reports: [] };
    const [{ data: manager }, { data: reports }, peersRes] = await Promise.all([
      me.manager_id
        ? supabase.from("employees").select("id,first_name,last_name,email,job_title").eq("id", me.manager_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("employees")
        .select("id,first_name,last_name,email,job_title,status")
        .eq("manager_id", me.id)
        .eq("status", "active")
        .order("first_name"),
      me.manager_id
        ? supabase
            .from("employees")
            .select("id,first_name,last_name,email,job_title,status")
            .eq("manager_id", me.manager_id)
            .neq("id", me.id)
            .eq("status", "active")
            .order("first_name")
        : Promise.resolve({ data: [] }),
    ]);
    return { manager, peers: (peersRes as any).data ?? [], reports: reports ?? [] };
  });
