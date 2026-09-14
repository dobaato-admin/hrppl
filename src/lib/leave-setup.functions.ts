import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function assertOrgAdmin(context: any) {
  const { supabase, userId } = context;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (!r.some((x: string) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const callerTenantId = await requireTenantId(supabase, userId);
  return { tenantId: callerTenantId as string, userId: userId as string };
}

export type LeaveReadinessSteps = {
  leaveTypes: boolean;
  accruals: boolean;
  approvalRouting: boolean;
};

/**
 * Leave setup readiness — hard-block gate for employee invitations.
 *
 *  1. leaveTypes:       ≥ 1 active leave type configured
 *  2. accruals:         every active type either has a non-zero annual quota
 *                       OR a non-zero monthly accrual (so balances can grow)
 *  3. approvalRouting:  at least one approver exists in the tenant
 *                       (role manager / hr / branch_admin / org_admin / super_admin)
 */
export async function checkLeaveReadiness(
  supabase: any,
  tenantId: string,
): Promise<{ steps: LeaveReadinessSteps; allComplete: boolean }> {
  const [{ data: types }, { data: approvers }] = await Promise.all([
    supabase
      .from("leave_types")
      .select("id, annual_quota_days, accrual_per_month, requires_approval")
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
    supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("tenant_id", tenantId)
      .in("role", ["manager", "hr", "branch_admin", "org_admin", "super_admin"])
      .limit(1),
  ]);
  const activeTypes = (types ?? []) as Array<{ annual_quota_days: number; accrual_per_month: number; requires_approval: boolean }>;
  const leaveTypes = activeTypes.length > 0;
  const accruals = leaveTypes && activeTypes.every((t) =>
    Number(t.annual_quota_days) > 0 || Number(t.accrual_per_month) > 0,
  );
  const needsApprover = activeTypes.some((t) => t.requires_approval);
  const approvalRouting = !needsApprover || (approvers ?? []).length > 0;
  return {
    steps: { leaveTypes, accruals, approvalRouting },
    allComplete: leaveTypes && accruals && approvalRouting,
  };
}

export const getLeaveReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const readiness = await checkLeaveReadiness(supabase, tenantId as string);
    // The wizard shows what already exists at each step rather than only a
    // count — an admin returning to "leave types configured" cannot otherwise
    // tell whether the one they meant to add is among them, and the safe move
    // is to add it again.
    const { data: types } = await supabase
      .from("leave_types")
      .select("id, code, name, annual_quota_days, accrual_per_month, is_paid, requires_approval, is_active")
      .eq("tenant_id", tenantId)
      .order("name");
    return { ...readiness, types: types ?? [] };
  });

const QuickLeaveTypeSchema = z.object({
  code: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(1).max(120),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
  annual_quota_days: z.number().min(0).max(366),
  accrual_per_month: z.number().min(0).max(31),
  requires_approval: z.boolean().default(true),
  is_paid: z.boolean().default(true),
  allow_half_day: z.boolean().default(true),
  allow_carry_over: z.boolean().default(true),
  max_carry_over_days: z.number().min(0).max(366).default(0),
});

export const upsertLeaveTypeQuick = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => QuickLeaveTypeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: row, error } = await supabase
      .from("leave_types")
      .upsert(
        { tenant_id: tenantId, is_active: true, ...data },
        { onConflict: "tenant_id,code" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { leaveType: row };
  });

// ---------------- Leave approval routing ----------------
//
// `leave_approval_routes` encodes per-tenant ordered approver chains.
// Each row = one tier in the chain. A request escalates to the next tier
// when the current approver does not act within `escalate_after_hours`.

const APPROVER_ROLES = ["manager", "hr", "branch_admin", "org_admin", "super_admin"] as const;

const RouteSchema = z.object({
  id: z.string().uuid().optional(),
  leave_type_id: z.string().uuid().nullable().optional(),
  tier: z.number().int().min(1).max(10),
  approver_role: z.enum(APPROVER_ROLES).nullable().optional(),
  approver_user_id: z.string().uuid().nullable().optional(),
  escalate_after_hours: z.number().int().min(0).max(720).default(48),
  is_active: z.boolean().default(true),
  notes: z.string().trim().max(500).nullable().optional(),
}).refine((v) => !!v.approver_role || !!v.approver_user_id, {
  message: "Pick either an approver role or a specific user",
  path: ["approver_role"],
});

export const listLeaveApprovalRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("leave_approval_routes")
      .select("id,leave_type_id,tier,approver_role,approver_user_id,escalate_after_hours,is_active,notes,created_at,updated_at")
      .eq("tenant_id", tenantId)
      .order("leave_type_id", { ascending: true, nullsFirst: true })
      .order("tier", { ascending: true });
    if (error) throw new Error(error.message);
    return { routes: data ?? [] };
  });

export const upsertLeaveApprovalRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RouteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const payload = {
      tenant_id: tenantId,
      leave_type_id: data.leave_type_id ?? null,
      tier: data.tier,
      approver_role: data.approver_role ?? null,
      approver_user_id: data.approver_user_id ?? null,
      escalate_after_hours: data.escalate_after_hours,
      is_active: data.is_active,
      notes: data.notes ?? null,
    };
    const q = data.id
      ? supabase.from("leave_approval_routes").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : supabase.from("leave_approval_routes").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return { route: row };
  });

export const deleteLeaveApprovalRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { error } = await supabase
      .from("leave_approval_routes").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Returns the list of tenant users with approver roles (for selector UIs).
export const listTenantApprovers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId } = await assertOrgAdmin(context);
    const { supabase } = context as any;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("tenant_id", tenantId)
      .in("role", APPROVER_ROLES as unknown as string[]);
    const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
    if (ids.length === 0) return { approvers: [] };
    const { data: profiles } = await supabase
      .from("profiles").select("id,full_name,email").in("id", ids);
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    });
    return {
      approvers: (profiles ?? []).map((p: any) => ({
        id: p.id, full_name: p.full_name, email: p.email, roles: roleMap.get(p.id) ?? [],
      })),
    };
  });
