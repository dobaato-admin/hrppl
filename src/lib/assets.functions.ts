import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function tenantId(ctx: any): Promise<string> {
  const tenantId = await requireTenantId(ctx.supabase, ctx.userId);
  return tenantId as string;
}

export const listAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { assets: data ?? [] };
  });

export const createAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assetTag: z.string().min(1).max(80),
      name: z.string().min(1).max(255),
      category: z.enum(["laptop","phone","tablet","monitor","peripheral","vehicle","access_card","sim","uniform","tool","other"]).default("other"),
      brand: z.string().max(120).optional(),
      model: z.string().max(120).optional(),
      serialNumber: z.string().max(160).optional(),
      description: z.string().max(2000).optional(),
      purchaseDate: z.string().optional(),
      purchaseCost: z.number().nonnegative().optional(),
      currencyCode: z.string().max(8).optional(),
      warrantyExpiresOn: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const t = await tenantId(context);
    const { data: row, error } = await context.supabase.from("assets").insert({
      tenant_id: t,
      asset_tag: data.assetTag,
      name: data.name,
      category: data.category as any,
      brand: data.brand,
      model: data.model,
      serial_number: data.serialNumber,
      description: data.description,
      purchase_date: data.purchaseDate || null,
      purchase_cost: data.purchaseCost ?? null,
      currency_code: data.currencyCode || null,
      warranty_expires_on: data.warrantyExpiresOn || null,
      created_by: context.userId,
    }).select().single();
    if (error) throw new Error(error.message);
    return { asset: row };
  });

async function userIsAdmin(ctx: any): Promise<boolean> {
  const { data } = await ctx.supabase
    .from("user_roles").select("role").eq("user_id", ctx.userId);
  const roles = (data ?? []).map((r: any) => r.role);
  return roles.includes("org_admin") || roles.includes("super_admin");
}

export const assignAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assetId: z.string().uuid(),
      employeeId: z.string().uuid(),
      expectedReturnOn: z.string().optional(),
      conditionOnIssue: z.string().max(500).optional(),
      conditionNotes: z.string().max(1000).optional(),
      quantityIssued: z.number().int().min(1).max(999).default(1),
      notes: z.string().max(1000).optional(),
      context: z.enum(["onboarding","employment","offboarding"]).default("employment"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: emp } = await context.supabase.from("employees").select("tenant_id").eq("id", data.employeeId).single();
    if (!emp) throw new Error("Employee not found");
    const admin = await userIsAdmin(context);
    const approvalStatus = admin ? "approved" : "pending";
    const { data: row, error } = await context.supabase.from("asset_assignments").insert({
      tenant_id: (emp as any).tenant_id,
      asset_id: data.assetId,
      employee_id: data.employeeId,
      expected_return_on: data.expectedReturnOn || null,
      condition_on_issue: data.conditionOnIssue,
      condition_notes: data.conditionNotes,
      quantity_issued: data.quantityIssued,
      notes: data.notes,
      context: data.context,
      assigned_by: context.userId,
      approval_status: approvalStatus,
      approved_by: admin ? context.userId : null,
      approved_at: admin ? new Date().toISOString() : null,
    }).select().single();
    if (error) throw new Error(error.message);
    return { assignment: row, requiresApproval: !admin };
  });

export const approveAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assignmentId: z.string().uuid(),
      decision: z.enum(["approved","rejected"]),
      notes: z.string().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await userIsAdmin(context))) throw new Error("Not authorized to approve assignments");
    const { error } = await context.supabase.from("asset_assignments").update({
      approval_status: data.decision,
      approved_by: context.userId,
      approved_at: new Date().toISOString(),
      approval_notes: data.notes ?? null,
    }).eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Employee-side: report what was returned (partial/full) with condition notes.
export const reportReturn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assignmentId: z.string().uuid(),
      quantityReturned: z.number().int().min(0).max(999),
      conditionNotes: z.string().max(2000).optional(),
      returnNotes: z.string().max(2000).optional(),
      returnCondition: z.enum(["good","damaged","lost"]).default("good"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Resolve caller's employee record and require ownership of the assignment.
    const { data: emp } = await context.supabase
      .from("employees")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!emp) throw new Error("Forbidden");

    const { data: a, error: e1 } = await context.supabase
      .from("asset_assignments")
      .select("quantity_issued, employee_id")
      .eq("id", data.assignmentId)
      .eq("employee_id", (emp as any).id)
      .single();
    if (e1 || !a) throw new Error("Assignment not found");
    const issued = (a as any).quantity_issued ?? 1;
    if (data.quantityReturned > issued) throw new Error("Returned quantity exceeds issued");
    const status = data.quantityReturned >= issued ? "reported_full" : "reported_partial";
    const { error } = await context.supabase.from("asset_assignments").update({
      quantity_returned: data.quantityReturned,
      employee_return_reported_at: new Date().toISOString(),
      employee_return_notes: data.returnNotes ?? null,
      condition_notes: data.conditionNotes ?? null,
      return_condition: data.returnCondition,
      return_status: status,
    })
      .eq("id", data.assignmentId)
      .eq("employee_id", (emp as any).id);
    if (error) throw new Error(error.message);
    return { ok: true, status };
  });


// HR-side: confirm return (final). Locks the asset back to available/damaged/lost.
export const confirmReturn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assignmentId: z.string().uuid(),
      returnCondition: z.enum(["good","damaged","lost"]).optional(),
      confirmationNotes: z.string().max(2000).optional(),
      disputed: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await userIsAdmin(context))) throw new Error("Only HR can confirm returns");
    const patch: any = { return_confirmation_notes: data.confirmationNotes ?? null };
    if (data.disputed) {
      patch.return_status = "disputed";
    } else {
      patch.return_status = "confirmed";
      patch.return_confirmed_at = new Date().toISOString();
      patch.return_confirmed_by = context.userId;
      patch.returned_at = new Date().toISOString();
      patch.returned_to = context.userId;
      if (data.returnCondition) patch.return_condition = data.returnCondition;
    }
    const { error } = await context.supabase.from("asset_assignments").update(patch).eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Legacy one-shot return (kept for backward compatibility).
// Now requires the caller to either be the assignee OR hold an HR/admin role.
export const returnAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      assignmentId: z.string().uuid(),
      returnCondition: z.enum(["good","damaged","lost"]).default("good"),
      notes: z.string().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Authorization: must be the assignee OR an org_admin/super_admin.
    const { data: emp } = await context.supabase
      .from("employees").select("id").eq("user_id", context.userId).maybeSingle();
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId)
      .in("role", ["org_admin", "super_admin"]);
    const isAdmin = (roles ?? []).length > 0;
    const { data: assignment } = await context.supabase
      .from("asset_assignments").select("id, employee_id").eq("id", data.assignmentId).maybeSingle();
    if (!assignment) throw new Error("Assignment not found");
    const isOwner = !!emp && emp.id === assignment.employee_id;
    if (!isAdmin && !isOwner) throw new Error("Forbidden");

    const { error } = await context.supabase.from("asset_assignments").update({
      returned_at: new Date().toISOString(),
      returned_to: context.userId,
      return_condition: data.returnCondition,
      return_confirmed_at: new Date().toISOString(),
      return_confirmed_by: context.userId,
      return_status: "confirmed",
      return_confirmation_notes: data.notes,
    }).eq("id", data.assignmentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acknowledgeAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ assignmentId: z.string().uuid(), notes: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Caller must be the assignee of this assignment.
    const { data: emp } = await context.supabase
      .from("employees")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!emp) throw new Error("Forbidden");

    const { data: existing } = await context.supabase
      .from("asset_assignments")
      .select("id")
      .eq("id", data.assignmentId)
      .eq("employee_id", (emp as any).id)
      .maybeSingle();
    if (!existing) throw new Error("Assignment not found");

    const { error } = await context.supabase.from("asset_assignments").update({
      acknowledged_at: new Date().toISOString(),
      acknowledgement_notes: data.notes,
    })
      .eq("id", data.assignmentId)
      .eq("employee_id", (emp as any).id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });



export const listAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ employeeId: z.string().uuid().optional(), openOnly: z.boolean().default(false) }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("asset_assignments")
      .select("*, assets:asset_id(name,asset_tag,category,brand,model)")
      .order("assigned_at", { ascending: false })
      .limit(500);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    if (data.openOnly) q = q.is("returned_at", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { assignments: rows ?? [] };
  });

export const myAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: emp } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
    if (!emp) return { assignments: [] };
    const { data, error } = await context.supabase
      .from("asset_assignments")
      .select("*, assets:asset_id(name,asset_tag,category,brand,model,serial_number)")
      .eq("employee_id", (emp as any).id)
      .order("assigned_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { assignments: data ?? [] };
  });
