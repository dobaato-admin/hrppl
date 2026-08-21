import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

const DOC_TYPES = [
  "national_id",
  "passport",
  "drivers_license",
  "tax_id",
  "social_security",
  "bank_details",
  "next_of_kin",
  "address_proof",
  "other",
] as const;

const DOC_LABELS: Record<string, string> = {
  national_id: "National ID / Passport",
  passport: "Passport",
  drivers_license: "Driver's license",
  tax_id: "Tax ID / TFN",
  social_security: "Social security number",
  bank_details: "Bank account details",
  next_of_kin: "Next of kin / emergency contact",
  address_proof: "Proof of address",
  other: "Other document",
};

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_MIN = [1, 5, 15, 60, 240]; // minutes per attempt

/**
 * Role guard for HR/manager-only document-request and team-view endpoints.
 * Any employee-level caller is rejected with Forbidden.
 */
async function assertHrOrAdmin(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role as string);
  // 'hr' belongs here despite having been missing: these are the HR-facing
  // document-request and team-record endpoints, and RLS already grants hr full
  // tenant access to employees ("hr manages tenant employees",
  // 20260613140101:7-10). Omitting it meant HR got Forbidden from the very
  // screens built for them. Matches the guard in timeline.functions.ts.
  if (!roles.some((r: string) => ["manager", "org_admin", "super_admin", "hr"].includes(r))) {
    throw new Error("Forbidden");
  }
  return roles;
}


export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { supabase } = context;
    // Explicitly tenant-scoped — see src/lib/tenant-scope.ts. This one matters
    // more than most: it enriches every row with onboarding-profile presence
    // flags read via the SERVICE-ROLE client below, which bypasses RLS
    // entirely. Unscoped, a super_admin caller got PII completeness flags for
    // every employee in every tenant.
    const tenantId = await getTenantId(supabase, context.userId);
    if (!tenantId) return { employees: [], departments: [], pendingByEmployee: {} };

    const { data: employees, error } = await supabase
      .from("employees")
      .select(
        "id,first_name,last_name,email,phone,job_title,employment_type,status,hire_date,department_id,manager_id",
      )
      .eq("tenant_id", tenantId)
      .order("first_name");
    if (error) throw new Error(error.message);

    const ids = (employees ?? []).map((e) => e.id);
    if (ids.length === 0) return { employees: [], departments: [], pendingByEmployee: {} };

    // Profile presence flags are computed server-side; use admin client so we do
    // not require managers/HR to have row-level read access to sensitive PII columns
    // (national ID, bank, tax, SSN). Raw values are never returned to the client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: deps }, { data: profiles }, { data: pending }] = await Promise.all([
      supabase.from("departments").select("id,name").eq("tenant_id", tenantId),
      supabaseAdmin
        .from("staff_onboarding_profiles")
        .select(
          "employee_id,national_id_number,tax_identification_number,emergency_contact_name,emergency_contact_phone,bank_account_number,address_line1,date_of_birth",
        )
        .in("employee_id", ids),
      supabase
        .from("id_document_requests")
        .select("id,employee_id,document_type,status,requested_at")
        .in("employee_id", ids)
        .eq("status", "pending"),
    ]);

    const profileByEmp = new Map((profiles ?? []).map((p) => [p.employee_id as string, p]));
    const pendingByEmp: Record<string, any[]> = {};
    (pending ?? []).forEach((r) => {
      const k = r.employee_id as string;
      (pendingByEmp[k] ||= []).push(r);
    });

    const enriched = (employees ?? []).map((e) => {
      const p: any = profileByEmp.get(e.id) ?? {};
      const missing: string[] = [];
      if (!p.national_id_number && !p.tax_identification_number) missing.push("national_id");
      if (!p.emergency_contact_name || !p.emergency_contact_phone) missing.push("next_of_kin");
      if (!p.bank_account_number) missing.push("bank_details");
      if (!p.address_line1) missing.push("address_proof");
      if (!p.date_of_birth) missing.push("date_of_birth");
      return { ...e, missing };
    });

    return {
      employees: enriched,
      departments: deps ?? [],
      pendingByEmployee: pendingByEmp,
    };
  });

const recordFiltersSchema = z.object({
  employeeId: z.string().uuid(),
  categories: z.array(z.string().min(1).max(40)).max(30).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.number().int().min(1).max(1000).optional(),
  pageSize: z.number().int().min(5).max(200).optional(),
});

export const listEmployeeRecord = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => recordFiltersSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { supabase } = context;
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 25;
    const offset = (page - 1) * pageSize;

    let eventsQ = supabase
      .from("employee_events")
      .select(
        "id,category,event_type,title,summary,occurred_at,severity,visibility,metadata",
        { count: "exact" },
      )
      .eq("employee_id", data.employeeId);

    if (data.categories?.length) eventsQ = eventsQ.in("category", data.categories as any);
    if (data.from) eventsQ = eventsQ.gte("occurred_at", data.from);
    if (data.to) eventsQ = eventsQ.lte("occurred_at", data.to);
    if (data.search) eventsQ = eventsQ.ilike("title", `%${data.search}%`);

    const [emp, profile, eventsRes, pending, categoryCounts] = await Promise.all([
      supabase.from("employees").select("*").eq("id", data.employeeId).maybeSingle(),
      supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", data.employeeId).maybeSingle(),
      eventsQ.order("occurred_at", { ascending: false }).range(offset, offset + pageSize - 1),
      supabase.from("id_document_requests").select("*").eq("employee_id", data.employeeId).order("requested_at", { ascending: false }),
      supabase.from("employee_events").select("category").eq("employee_id", data.employeeId),
    ]);

    const counts: Record<string, number> = {};
    (categoryCounts.data ?? []).forEach((r: any) => {
      counts[r.category] = (counts[r.category] ?? 0) + 1;
    });

    return {
      employee: emp.data,
      profile: profile.data,
      events: eventsRes.data ?? [],
      totalEvents: eventsRes.count ?? 0,
      categoryCounts: counts,
      requests: pending.data ?? [],
      page,
      pageSize,
    };
  });

async function writeAudit(
  supabase: any,
  tenantId: string,
  requestId: string,
  actorId: string | null,
  action: string,
  fromStatus: string | null,
  toStatus: string | null,
  metadata: Record<string, any> = {},
) {
  try {
    await supabase.from("id_request_audit_log").insert({
      tenant_id: tenantId,
      request_id: requestId,
      actor_id: actorId,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      metadata,
    });
  } catch {
    // never block the user action on audit
  }
}

async function sendRequestEmailWithRetry(
  supabase: any,
  request: { id: string; tenant_id: string; document_type: string; notes?: string | null; send_attempts: number },
  emp: { id: string; tenant_id: string; first_name?: string | null; email?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  if (!emp.email) {
    await supabase
      .from("id_document_requests")
      .update({
        last_send_status: "failed",
        last_send_error: "Employee has no email on file",
        last_attempted_at: new Date().toISOString(),
        send_attempts: request.send_attempts + 1,
        next_retry_at: null,
      })
      .eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_failed", null, null, {
      reason: "no_email",
    });
    return { ok: false, error: "no_email" };
  }

  try {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", emp.tenant_id)
      .maybeSingle();
    const docLabel = DOC_LABELS[request.document_type] ?? request.document_type.replace(/_/g, " ");
    const subject = `Action required: please provide ${docLabel}`;
    const html = `
      <p>Hi ${emp.first_name ?? ""},</p>
      <p>${tenant?.name ?? "Your organisation"} needs you to provide the following information:
      <strong>${docLabel}</strong>.</p>
      ${request.notes ? `<p>Notes from your admin: ${request.notes}</p>` : ""}
      <p>Please log in to your account and upload this information at your earliest convenience.</p>
    `.trim();
    const { error: enqErr } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: emp.email,
        subject,
        html,
        template_name: "id_document_request",
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        request_id: request.id,
      } as any,
    });
    if (enqErr) throw new Error(enqErr.message);

    await supabase
      .from("id_document_requests")
      .update({
        last_send_status: "sent",
        last_send_error: null,
        last_attempted_at: new Date().toISOString(),
        send_attempts: request.send_attempts + 1,
        next_retry_at: null,
      })
      .eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_succeeded", null, null, {
      attempt: request.send_attempts + 1,
    });
    return { ok: true };
  } catch (e: any) {
    const attempt = request.send_attempts + 1;
    const giveUp = attempt >= MAX_RETRY_ATTEMPTS;
    const delay = RETRY_BACKOFF_MIN[Math.min(attempt - 1, RETRY_BACKOFF_MIN.length - 1)];
    const nextRetry = giveUp ? null : new Date(Date.now() + delay * 60_000).toISOString();
    await supabase
      .from("id_document_requests")
      .update({
        last_send_status: giveUp ? "failed" : "retrying",
        last_send_error: String(e?.message ?? e),
        last_attempted_at: new Date().toISOString(),
        send_attempts: attempt,
        next_retry_at: nextRetry,
      })
      .eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_failed", null, null, {
      error: String(e?.message ?? e),
      attempt,
      next_retry_at: nextRetry,
    });
    return { ok: false, error: String(e?.message ?? e) };
  }
}

export const requestMissingDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid(),
        documentType: z.enum(DOC_TYPES),
        notes: z.string().trim().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertHrOrAdmin(supabase, userId);
    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("id,tenant_id,first_name,last_name,email")
      .eq("id", data.employeeId)
      .maybeSingle();
    if (empErr || !emp) throw new Error("Employee not found");

    const { data: row, error } = await supabase
      .from("id_document_requests")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        document_type: data.documentType,
        notes: data.notes ?? null,
        requested_by: userId,
        status: "pending",
        last_send_status: "queued",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await writeAudit(supabase, emp.tenant_id, row.id, userId, "created", null, "pending", {
      document_type: data.documentType,
    });
    await sendRequestEmailWithRetry(supabase, { ...row, send_attempts: 0 }, emp);
    return { request: row };
  });

async function transitionRequest(
  supabase: any,
  userId: string,
  id: string,
  toStatus: "submitted" | "cancelled",
  action: "approved" | "cancelled",
) {
  const { data: existing, error: readErr } = await supabase
    .from("id_document_requests")
    .select("id,tenant_id,status")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !existing) throw new Error("Request not found");
  if (existing.status !== "pending") {
    return { id, skipped: true, reason: `status_${existing.status}` };
  }
  const update: any = { status: toStatus };
  if (toStatus === "submitted") update.fulfilled_at = new Date().toISOString();
  const { error } = await supabase.from("id_document_requests").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit(supabase, existing.tenant_id, id, userId, action, existing.status, toStatus);
  return { id, ok: true };
}

export const cancelDocumentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    return await transitionRequest(context.supabase, context.userId, data.id, "cancelled", "cancelled");
  });

export const approveDocumentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    return await transitionRequest(context.supabase, context.userId, data.id, "submitted", "approved");
  });

async function resendOne(supabase: any, userId: string, id: string) {
  const { data: req, error } = await supabase
    .from("id_document_requests")
    .select("id,tenant_id,employee_id,document_type,notes,status,send_attempts")
    .eq("id", id)
    .maybeSingle();
  if (error || !req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be resent");

  const { data: emp } = await supabase
    .from("employees")
    .select("id,tenant_id,first_name,last_name,email")
    .eq("id", req.employee_id)
    .maybeSingle();
  if (!emp) throw new Error("Employee not found");

  await supabase
    .from("id_document_requests")
    .update({ requested_at: new Date().toISOString() })
    .eq("id", req.id);
  await writeAudit(supabase, req.tenant_id, req.id, userId, "resent", "pending", "pending");

  const out = await sendRequestEmailWithRetry(
    supabase,
    { id: req.id, tenant_id: req.tenant_id, document_type: req.document_type, notes: req.notes, send_attempts: req.send_attempts ?? 0 },
    emp,
  );
  if (!out.ok) {
    await writeAudit(supabase, req.tenant_id, req.id, userId, "send_retried", "pending", "pending", {
      error: out.error,
    });
  }
  return out;
}

export const resendDocumentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    return await resendOne(context.supabase, context.userId, data.id);
  });

// Bulk endpoints — accept up to 200 IDs
const bulkSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(200) });

export const bulkApproveDocumentRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bulkSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const results: any[] = [];
    for (const id of data.ids) {
      try {
        results.push(await transitionRequest(context.supabase, context.userId, id, "submitted", "approved"));
      } catch (e: any) {
        results.push({ id, error: String(e?.message ?? e) });
      }
    }
    return { results };
  });

export const bulkCancelDocumentRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bulkSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const results: any[] = [];
    for (const id of data.ids) {
      try {
        results.push(await transitionRequest(context.supabase, context.userId, id, "cancelled", "cancelled"));
      } catch (e: any) {
        results.push({ id, error: String(e?.message ?? e) });
      }
    }
    return { results };
  });

export const bulkResendDocumentRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bulkSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const results: any[] = [];
    for (const id of data.ids) {
      try {
        results.push({ id, ...(await resendOne(context.supabase, context.userId, id)) });
      } catch (e: any) {
        results.push({ id, error: String(e?.message ?? e) });
      }
    }
    return { results };
  });

export const listAllDocumentRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.enum(["pending", "submitted", "cancelled", "all"]).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { supabase } = context;
    let q = supabase
      .from("id_document_requests")
      .select(
        "id,employee_id,document_type,notes,status,requested_at,fulfilled_at,requested_by,last_send_status,last_send_error,send_attempts,next_retry_at,last_attempted_at",
      )
      .order("requested_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const empIds = Array.from(new Set((rows ?? []).map((r) => r.employee_id)));
    let employees: any[] = [];
    if (empIds.length) {
      const { data: emps } = await supabase
        .from("employees")
        .select("id,first_name,last_name,email,job_title")
        .in("id", empIds);
      employees = emps ?? [];
    }
    const empById = new Map(employees.map((e) => [e.id, e]));
    return {
      requests: (rows ?? []).map((r) => ({ ...r, employee: empById.get(r.employee_id) ?? null })),
    };
  });

export const listRequestAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ requestId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("id_request_audit_log")
      .select("id,action,from_status,to_status,metadata,created_at,actor_id")
      .eq("request_id", data.requestId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });

export const exportEmployeeHistoryCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid(),
        categories: z.array(z.string()).max(30).optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        search: z.string().trim().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { supabase } = context;
    let q = supabase
      .from("employee_events")
      .select("occurred_at,category,event_type,title,summary,severity,visibility")
      .eq("employee_id", data.employeeId);
    if (data.categories?.length) q = q.in("category", data.categories as any);
    if (data.from) q = q.gte("occurred_at", data.from);
    if (data.to) q = q.lte("occurred_at", data.to);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    const { data: rows, error } = await q.order("occurred_at", { ascending: false }).limit(5000);
    if (error) throw new Error(error.message);

    const { data: emp } = await supabase
      .from("employees")
      .select("first_name,last_name,email,job_title,phone,hire_date,employment_type,status")
      .eq("id", data.employeeId)
      .maybeSingle();

    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const meta: string[] = [
      `# Team history export`,
      `# Employee: ${esc(`${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim())}`,
      `# Email: ${esc(emp?.email ?? "")}`,
      `# Job title: ${esc(emp?.job_title ?? "")}`,
      `# Status: ${esc(emp?.status ?? "")}`,
      `# Filters — categories: ${esc((data.categories ?? []).join("|") || "all")}, from: ${esc(data.from ?? "")}, to: ${esc(data.to ?? "")}, search: ${esc(data.search ?? "")}`,
      `# Exported at: ${esc(new Date().toISOString())}`,
      ``,
    ];
    const header = ["Occurred at", "Category", "Event type", "Title", "Summary", "Severity", "Visibility"];

    // Group by category for clarity
    const byCat: Record<string, any[]> = {};
    for (const r of rows ?? []) {
      (byCat[r.category as string] ||= []).push(r);
    }
    const lines = [...meta, header.join(",")];
    for (const cat of Object.keys(byCat).sort()) {
      lines.push(`# Category: ${cat} (${byCat[cat].length})`);
      for (const r of byCat[cat]) {
        lines.push(
          [r.occurred_at, r.category, r.event_type, r.title, r.summary, r.severity, r.visibility]
            .map(esc)
            .join(","),
        );
      }
    }
    return {
      filename: `team-history-${(emp?.first_name ?? "employee").toLowerCase()}-${(emp?.last_name ?? "").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv: lines.join("\n"),
      employee: emp ?? null,
      grouped: byCat,
      filters: {
        categories: data.categories ?? [],
        from: data.from ?? null,
        to: data.to ?? null,
        search: data.search ?? null,
      },
    };
  });

// Background retry: process due retries for failed/retrying sends.
// Idempotent; meant to be called by the cron hook.
export async function processDueRetries(supabaseAdmin: any, limit = 50) {
  const nowIso = new Date().toISOString();
  const { data: due } = await supabaseAdmin
    .from("id_document_requests")
    .select("id,tenant_id,employee_id,document_type,notes,status,send_attempts")
    .eq("status", "pending")
    .in("last_send_status", ["failed", "retrying"])
    .lte("next_retry_at", nowIso)
    .order("next_retry_at", { ascending: true })
    .limit(limit);
  let processed = 0;
  for (const req of due ?? []) {
    const { data: emp } = await supabaseAdmin
      .from("employees")
      .select("id,tenant_id,first_name,last_name,email")
      .eq("id", req.employee_id)
      .maybeSingle();
    if (!emp) continue;
    await sendRequestEmailWithRetry(supabaseAdmin, req as any, emp);
    processed++;
  }
  return { processed, found: due?.length ?? 0 };
}
