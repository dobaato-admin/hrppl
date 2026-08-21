/**
 * Payday Super SLA monitor.
 *
 * Flips `super_contributions.status` from `pending` to `overdue` when
 * `payment_due_date < today` (and not paid/cancelled). Surfaces counts
 * for dashboards.
 *
 *   runSuperSlaSweep({ tenantId? })   — service or org admin
 *   getSuperSlaSummary({ tenantId })  — org admin / HR
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertOrgAdminOrHr(supabase: any, userId: string, tenantId: string) {
  const { data: isAdmin } = await supabase.rpc("is_org_admin",
    { _user_id: userId, _tenant_id: tenantId } as any);
  const { data: isHr } = await supabase.rpc("is_hr",
    { _user_id: userId, _tenant_id: tenantId } as any);
  if (!isAdmin && !isHr) throw new Error("Forbidden");
}

/** Active-set statuses that still owe payment. */
const PENDING_STATUSES = ["pending", "queued", "scheduled", "draft"] as const;

/**
 * Mark contributions overdue when payment_due_date has passed.
 * Idempotent. Restrict to `tenantId` when provided.
 */
export const runSuperSlaSweep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.tenantId) {
      await assertOrgAdminOrHr(context.supabase, context.userId, data.tenantId);
    } else {
      const { data: isSuper } = await context.supabase.rpc("has_role",
        { _user_id: context.userId, _role: "super_admin" } as any);
      if (!isSuper) throw new Error("Forbidden: super_admin required for global sweep");
    }
    const admin = await loadAdmin();
    const today = new Date().toISOString().slice(0, 10);

    let q = admin.from("super_contributions")
      .update({ status: "overdue" } as any)
      .lt("payment_due_date", today)
      .in("status", PENDING_STATUSES as unknown as string[]);
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);

    const { data: rows, error } = await q.select("id,tenant_id,employee_id,pay_date,payment_due_date,amount");
    if (error) throw new Error(error.message);
    return { swept: rows?.length ?? 0, rows: rows ?? [], at: new Date().toISOString() };
  });

/** Dashboard summary for a tenant: due soon, overdue, and totals. */
export const getSuperSlaSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tenantId: z.string().uuid(),
    horizonDays: z.number().int().min(1).max(60).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOrgAdminOrHr(context.supabase, context.userId, data.tenantId);
    const admin = await loadAdmin();
    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date();
    horizon.setUTCDate(horizon.getUTCDate() + (data.horizonDays ?? 7));
    const horizonStr = horizon.toISOString().slice(0, 10);

    const baseQ = () => admin.from("super_contributions")
      .select("id,status,amount,payment_due_date,pay_date,employee_id", { count: "exact" })
      .eq("tenant_id", data.tenantId);

    const [{ data: overdue, count: overdueCount }, { data: dueSoon, count: dueSoonCount }] = await Promise.all([
      baseQ().eq("status", "overdue"),
      baseQ().in("status", PENDING_STATUSES as unknown as string[])
        .gte("payment_due_date", today).lte("payment_due_date", horizonStr),
    ]);

    const sumAmt = (rows: any[] | null | undefined) =>
      (rows ?? []).reduce((a, r) => a + Number(r.amount ?? 0), 0);

    return {
      today,
      horizon: horizonStr,
      overdue: { count: overdueCount ?? 0, total: sumAmt(overdue), rows: overdue ?? [] },
      dueSoon: { count: dueSoonCount ?? 0, total: sumAmt(dueSoon), rows: dueSoon ?? [] },
    };
  });
