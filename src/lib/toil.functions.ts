import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function getEmployee(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data as { id: string; tenant_id: string } | null;
}

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["org_admin", "super_admin", "hr"]);
  return (data ?? []).length > 0;
}

// ---------- settings ----------
export const getToilSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    const callerTenantId = await getTenantId(supabase, userId);
    const tenantId = emp?.tenant_id ?? callerTenantId;
    if (!tenantId) return { settings: null };
    const { data } = await supabase
      .from("toil_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    return { settings: data ?? { tenant_id: tenantId } };
  });

const SettingsSchema = z.object({
  enabled: z.boolean().default(true),
  overtime_multiplier: z.number().min(0).default(1),
  shift_swap_multiplier: z.number().min(0).default(1),
  penalty_multiplier: z.number().min(0).default(1.5),
  max_balance_hours: z.number().min(0).nullable().optional(),
  expiry_months: z.number().int().min(0).default(12),
  allow_overtime_to_toil: z.boolean().default(true),
  allow_toil_to_overtime: z.boolean().default(false),
  min_request_hours: z.number().min(0).default(1),
  require_approval: z.boolean().default(true),
});

export const updateToilSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    if (!(await isAdmin(supabase, userId))) throw new Error("Forbidden");
    const tenantId = await requireTenantId(supabase, userId);
    const payload = { ...data, tenant_id: tenantId };
    const { data: row, error } = await supabase
      .from("toil_settings")
      .upsert(payload, { onConflict: "tenant_id" })
      .select()
      .single();
    if (error) throw error;
    return { settings: row };
  });

// ---------- employee balance ----------
export const getMyToilBalance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) return { balance: null, accruals: [], requests: [] };
    const [bal, acc, req] = await Promise.all([
      supabase.from("toil_balances").select("*").eq("employee_id", emp.id).maybeSingle(),
      supabase
        .from("toil_accruals")
        .select("*")
        .eq("employee_id", emp.id)
        .order("accrued_on", { ascending: false })
        .limit(100),
      supabase
        .from("toil_requests")
        .select("*")
        .eq("employee_id", emp.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    return {
      balance: bal.data,
      accruals: acc.data ?? [],
      requests: req.data ?? [],
    };
  });

// ---------- request lifecycle ----------
const RequestSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  hours: z.number().positive(),
  reason: z.string().max(500).optional().nullable(),
});

export const submitToilRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RequestSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const { data: row, error } = await supabase
      .from("toil_requests")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        start_date: data.start_date,
        end_date: data.end_date,
        hours: data.hours,
        reason: data.reason ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return { request: row };
  });

export const cancelToilRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase
      .from("toil_requests")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw error;
    return { ok: true };
  });

// ---------- approvals ----------
export const listPendingToilApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data } = await supabase
      .from("toil_requests")
      .select("*, employees(id, first_name, last_name, employee_code)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    return { requests: data ?? [] };
  });

const DecisionSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional().nullable(),
});

export const decideToilRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DecisionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase
      .from("toil_requests")
      .update({
        status: data.decision,
        decision_notes: data.notes ?? null,
        approver_id: userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return { request: row };
  });

// ---------- admin: accruals & reporting ----------
const AccrualSchema = z.object({
  employee_id: z.string().uuid(),
  source: z.enum(["overtime", "shift_swap", "penalty", "manual", "adjustment"]),
  hours: z.number(),
  accrued_on: z.string().optional(),
  expires_on: z.string().nullable().optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const addToilAccrual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AccrualSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    if (!(await isAdmin(supabase, userId))) throw new Error("Forbidden");
    const { data: emp } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("id", data.employee_id)
      .single();
    const { data: settings } = await supabase
      .from("toil_settings")
      .select("expiry_months")
      .eq("tenant_id", emp.tenant_id)
      .maybeSingle();
    let expires = data.expires_on ?? null;
    if (!expires && settings?.expiry_months) {
      const d = new Date(data.accrued_on ?? new Date().toISOString().slice(0, 10));
      d.setMonth(d.getMonth() + settings.expiry_months);
      expires = d.toISOString().slice(0, 10);
    }
    const { data: row, error } = await supabase
      .from("toil_accruals")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: data.employee_id,
        source: data.source,
        hours: data.hours,
        accrued_on: data.accrued_on ?? new Date().toISOString().slice(0, 10),
        expires_on: expires,
        notes: data.notes ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return { accrual: row };
  });

export const getToilReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const [balances, pending, recent] = await Promise.all([
      supabase
        .from("toil_balances")
        .select("*, employees!inner(id, first_name, last_name, employee_code, tenant_id)")
        .order("available_hours", { ascending: false })
        .limit(200),
      supabase
        .from("toil_requests")
        .select("*, employees(first_name, last_name, employee_code)")
        .eq("status", "pending"),
      supabase
        .from("toil_accruals")
        .select("*, employees(first_name, last_name, employee_code)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    return {
      balances: balances.data ?? [],
      pending: pending.data ?? [],
      recent: recent.data ?? [],
    };
  });
