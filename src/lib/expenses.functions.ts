import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getEmployee(supabase: any, userId: string) {
  const { data } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data as { id: string; tenant_id: string } | null;
}

// ---------- categories ----------
export const listExpenseCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    // Explicitly tenant-scoped — see src/lib/tenant-scope.ts. Relying on RLS
    // alone leaks every tenant's categories to a super_admin, whose policies
    // carry no tenant predicate.
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { categories: [] };
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return { categories: data ?? [] };
  });

const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  code: z.string().max(40).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  requires_receipt: z.boolean().default(true),
  max_amount: z.number().nonnegative().optional().nullable(),
  daily_limit: z.number().nonnegative().optional().nullable(),
  monthly_limit: z.number().nonnegative().optional().nullable(),
  tax_rate: z.number().min(0).max(1).optional().nullable(),
  tax_code: z.string().max(40).optional().nullable(),
  is_active: z.boolean().default(true),
});

async function requireOrgAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["org_admin", "super_admin"]);
  if (!data || data.length === 0) throw new Error("Only org admins can perform this action");
}

export const upsertExpenseCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CategorySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireOrgAdmin(supabase, userId);
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
    const payload = { ...data, tenant_id: profile.tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("expense_categories").update(payload).eq("id", data.id).select().single()
      : await supabase.from("expense_categories").insert(payload).select().single();
    if (error) throw error;
    return { category: row };
  });

export const deleteExpenseCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireOrgAdmin(supabase, userId);
    // Soft-delete by deactivating to preserve historical claim references.
    const { error } = await supabase.from("expense_categories").update({ is_active: false }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- approval rules ----------
const ApprovalRuleSchema = z.object({
  id: z.string().uuid().optional(),
  department_id: z.string().uuid().nullable().optional(),
  min_amount: z.number().nonnegative().default(0),
  max_amount: z.number().positive().nullable().optional(),
  approver_id: z.string().uuid(),
  priority: z.number().int().min(0).max(1000).default(100),
  is_active: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
});

export const listApprovalRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("expense_approval_rules")
      .select("*, departments(name)")
      .order("priority")
      .order("min_amount");
    if (error) throw error;
    return { rules: data ?? [] };
  });

export const upsertApprovalRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApprovalRuleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireOrgAdmin(supabase, userId);
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
    const payload = { ...data, tenant_id: profile.tenant_id };
    const { data: row, error } = data.id
      ? await supabase.from("expense_approval_rules").update(payload).eq("id", data.id).select().single()
      : await supabase.from("expense_approval_rules").insert(payload).select().single();
    if (error) throw error;
    return { rule: row };
  });

export const deleteApprovalRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireOrgAdmin(supabase, userId);
    const { error } = await supabase.from("expense_approval_rules").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Resolve the approver(s) for a given employee + amount.
async function resolveApprovers(supabase: any, tenantId: string, employeeId: string, amount: number) {
  const { data: emp } = await supabase.from("employees").select("department_id").eq("id", employeeId).maybeSingle();
  const deptId = emp?.department_id ?? null;
  const { data: rules } = await supabase
    .from("expense_approval_rules")
    .select("*, departments(name), approver:approver_id(id,first_name,last_name,job_title)" as any)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("priority")
    .order("min_amount");
  const matched = (rules ?? []).filter((r: any) => {
    if (r.department_id && r.department_id !== deptId) return false;
    if (Number(r.min_amount ?? 0) > amount) return false;
    if (r.max_amount !== null && Number(r.max_amount) < amount) return false;
    return true;
  });
  return matched;
}

export const previewClaimRouting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ amount: z.number().nonnegative() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) return { approvers: [] };
    const approvers = await resolveApprovers(supabase, emp.tenant_id, emp.id, data.amount);
    return { approvers };
  });


// ---------- claims ----------
export const listExpenseClaims = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["mine", "team", "all"]).default("mine"),
    status: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    let q = supabase.from("expense_claims").select("*, employees!inner(first_name,last_name,job_title)").order("created_at", { ascending: false });
    if (data.scope === "mine") {
      const emp = await getEmployee(supabase, userId);
      if (!emp) return { claims: [] };
      q = q.eq("employee_id", emp.id);
    }
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { claims: rows ?? [] };
  });

export const getExpenseClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: claim } = await supabase.from("expense_claims").select("*, employees(first_name,last_name,job_title,email)").eq("id", data.id).single();
    const { data: lines } = await supabase.from("expense_lines").select("*, expense_categories(name,code)").eq("claim_id", data.id).order("expense_date");
    const { data: approvals } = await supabase.from("expense_approvals").select("*").eq("claim_id", data.id).order("created_at", { ascending: false });
    return { claim, lines: lines ?? [], approvals: approvals ?? [] };
  });

const LineSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  expense_date: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("AUD"),
  merchant: z.string().max(200).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  receipt_path: z.string().optional().nullable(),
  mileage_km: z.number().nonnegative().optional().nullable(),
  tax_amount: z.number().nonnegative().optional().nullable(),
});

const ClaimSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  currency: z.string().default("AUD"),
  lines: z.array(LineSchema).min(1).max(100),
  submit: z.boolean().default(false),
});

export const saveExpenseClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ClaimSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("No employee profile");

    // Load category metadata for tax/limit handling.
    const catIds = Array.from(new Set(data.lines.map((l) => l.category_id).filter(Boolean))) as string[];
    let catMap = new Map<string, any>();
    if (catIds.length) {
      const { data: catRows } = await supabase
        .from("expense_categories")
        .select("id,name,tax_rate,max_amount,requires_receipt,is_active")
        .in("id", catIds);
      (catRows ?? []).forEach((c: any) => catMap.set(c.id, c));
    }

    // Validate per-line: per-category cap, required receipt, active.
    for (const l of data.lines) {
      const cat = l.category_id ? catMap.get(l.category_id) : null;
      if (cat) {
        if (cat.is_active === false) throw new Error(`Category "${cat.name}" is no longer accepted`);
        if (cat.max_amount != null && Number(l.amount) > Number(cat.max_amount)) {
          throw new Error(`Line for "${cat.name}" exceeds category limit of ${Number(cat.max_amount).toFixed(2)}`);
        }
        if (data.submit && cat.requires_receipt && !l.receipt_path) {
          throw new Error(`A receipt is required for "${cat.name}"`);
        }
      }
    }

    const admin = await loadAdmin();
    const total = data.lines.reduce((s, l) => s + Number(l.amount), 0);
    const claimPayload: any = {
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      title: data.title,
      description: data.description ?? null,
      currency: data.currency,
      total_amount: total,
      status: data.submit ? "submitted" : "draft",
    };
    if (data.submit) claimPayload.submitted_at = new Date().toISOString();
    let claimId = data.id;
    if (claimId) {
      const { error } = await supabase.from("expense_claims").update(claimPayload).eq("id", claimId);
      if (error) throw error;
      await admin.from("expense_lines").delete().eq("claim_id", claimId);
    } else {
      const { data: created, error } = await supabase.from("expense_claims").insert(claimPayload).select("id").single();
      if (error) throw error;
      claimId = created.id;
    }
    const lineRows = data.lines.map((l) => {
      const cat = l.category_id ? catMap.get(l.category_id) : null;
      // Auto-compute tax from category rate when the caller did not supply one.
      // tax_amount is the tax component included in the gross amount: amount * rate / (1 + rate).
      let tax = l.tax_amount;
      if ((tax == null || tax === 0) && cat && Number(cat.tax_rate) > 0) {
        const rate = Number(cat.tax_rate);
        tax = Number((Number(l.amount) * rate / (1 + rate)).toFixed(2));
      }
      return {
        claim_id: claimId as string, tenant_id: emp.tenant_id,
        category_id: l.category_id ?? null, expense_date: l.expense_date,
        amount: l.amount, currency: l.currency, merchant: l.merchant ?? null,
        description: l.description ?? null, receipt_path: l.receipt_path ?? null,
        mileage_km: l.mileage_km ?? null, tax_amount: tax ?? null,
      };
    });
    await admin.from("expense_lines").insert(lineRows);

    // On submit, log the resolved approver(s) into the audit trail so admins can trace routing.
    if (data.submit) {
      const approvers = await resolveApprovers(supabase, emp.tenant_id, emp.id, total);
      const approverNames = approvers
        .map((a: any) => a.approver ? `${a.approver.first_name ?? ""} ${a.approver.last_name ?? ""}`.trim() : "")
        .filter(Boolean)
        .join(", ");
      await supabase.from("expense_approvals").insert({
        claim_id: claimId as string,
        tenant_id: emp.tenant_id,
        approver_id: userId,
        action: "submitted",
        comment: approverNames ? `Routed to: ${approverNames}` : `No routing rule matched (amount ${total.toFixed(2)})`,
      });
    }

    return { id: claimId, status: claimPayload.status };
  });


const DecisionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["recommend", "withdraw_recommendation", "approve", "reject", "pay"]),
  comment: z.string().max(1000).optional(),
  payment_reference: z.string().max(200).optional(),
});

async function isOrgAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["org_admin", "super_admin"]);
  return (data ?? []).length > 0;
}

export const decideExpenseClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DecisionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: claim } = await supabase.from("expense_claims").select("*").eq("id", data.id).single();
    if (!claim) throw new Error("Claim not found");
    const admin = await isOrgAdmin(supabase, userId);
    const updates: any = {};
    const now = new Date().toISOString();
    let auditAction: string = data.action;

    if (data.action === "recommend") {
      if (claim.status !== "submitted") throw new Error("Only submitted claims can be recommended");
      updates.status = "recommended";
      updates.recommended_at = now;
      updates.recommended_by = userId;
      updates.recommendation_note = data.comment ?? null;
      auditAction = "recommended";
    } else if (data.action === "withdraw_recommendation") {
      if (claim.status !== "recommended") throw new Error("Claim is not in recommended state");
      updates.status = "submitted";
      updates.recommended_at = null;
      updates.recommended_by = null;
      updates.recommendation_note = null;
      auditAction = "recommendation_withdrawn";
    } else if (data.action === "approve") {
      if (!["submitted", "recommended"].includes(claim.status)) throw new Error("Only submitted or recommended claims can be approved");
      if (!admin) throw new Error("Only org admins can approve");
      updates.status = "approved"; updates.approved_at = now; updates.approved_by = userId;
      auditAction = "approved";
    } else if (data.action === "reject") {
      if (!["submitted", "recommended", "approved"].includes(claim.status)) throw new Error("Cannot reject from this status");
      if (!admin) throw new Error("Only org admins can reject");
      updates.status = "rejected"; updates.rejected_reason = data.comment ?? null;
      auditAction = "rejected";
    } else if (data.action === "pay") {
      if (claim.status !== "approved") throw new Error("Only approved claims can be paid");
      if (!admin) throw new Error("Only org admins can mark as paid");
      updates.status = "paid"; updates.paid_at = now; updates.paid_by = userId;
      updates.payment_reference = data.payment_reference ?? null;
      auditAction = "paid";
    }
    const { error } = await supabase.from("expense_claims").update(updates).eq("id", data.id);
    if (error) throw error;
    await supabase.from("expense_approvals").insert({
      claim_id: data.id, tenant_id: claim.tenant_id, approver_id: userId,
      action: auditAction,
      comment: data.action === "pay" ? `Marked paid (${data.payment_reference ?? "no ref"})` : (data.comment ?? null),
    });
    return { ok: true };
  });

export const deleteExpenseClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // Server-side ownership/role guard (defense in depth on top of RLS).
    const { data: claim } = await supabase.from("expense_claims").select("id,employee_id,status,tenant_id").eq("id", data.id).maybeSingle();
    if (!claim) throw new Error("Claim not found");
    const emp = await getEmployee(supabase, userId);
    const admin = await isOrgAdmin(supabase, userId);
    const isOwner = !!emp && emp.id === claim.employee_id;
    if (!admin && !(isOwner && claim.status === "draft")) {
      throw new Error("Forbidden");
    }
    const { error } = await supabase.from("expense_claims").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getReceiptSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    // Verify the caller is entitled to this receipt path BEFORE asking the admin client to sign.
    // Path convention: <tenant_id>/<employee_id>/<filename>
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("Forbidden");
    const segs = data.path.split("/");
    if (segs.length < 2) throw new Error("Invalid path");
    const pathTenant = segs[0];
    if (pathTenant !== emp.tenant_id) throw new Error("Forbidden");
    // Confirm the file is actually attached to an expense the caller can read via RLS.
    const { data: line } = await supabase
      .from("expense_lines")
      .select("id, expense_claims!inner(employee_id, tenant_id)")
      .eq("receipt_path", data.path)
      .maybeSingle();
    if (!line) {
      // Allow admins to fetch any receipt in their tenant; otherwise deny.
      const admin = await isOrgAdmin(supabase, userId);
      if (!admin) throw new Error("Forbidden");
    }
    const adminClient = await loadAdmin();
    const { data: signed, error } = await adminClient.storage.from("expense-receipts").createSignedUrl(data.path, 600);
    if (error) throw error;
    return { url: signed.signedUrl };
  });

// ---------- Reimbursement summary ----------
export const getReimbursementSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    const admin = await isOrgAdmin(supabase, userId);

    let targetEmpId: string | null = data.employeeId ?? emp?.id ?? null;
    if (data.employeeId && data.employeeId !== emp?.id && !admin) {
      throw new Error("Forbidden");
    }
    if (!targetEmpId) return { summary: null, claims: [] };

    let q = supabase
      .from("expense_claims")
      .select("id,title,reference_code,currency,total_amount,status,submitted_at,approved_at,paid_at,payment_reference,created_at")
      .eq("employee_id", targetEmpId)
      .order("created_at", { ascending: false });
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);

    const { data: rows, error } = await q;
    if (error) throw error;
    const claims = rows ?? [];

    let approved = 0, paid = 0, pending = 0, rejected = 0;
    for (const c of claims) {
      const t = Number(c.total_amount) || 0;
      if (c.status === "approved") approved += t;
      else if (c.status === "paid") paid += t;
      else if (c.status === "submitted" || c.status === "recommended") pending += t;
      else if (c.status === "rejected") rejected += t;
    }
    return {
      claims,
      summary: {
        approvedTotal: approved,
        paidTotal: paid,
        pendingTotal: pending,
        rejectedTotal: rejected,
        outstandingTotal: approved, // approved but not yet paid
        currency: claims[0]?.currency ?? "AUD",
        employeeId: targetEmpId,
      },
    };
  });
