/**
 * T1–T5, T10, T11 — one queue of everything awaiting this person's action.
 *
 * ---------------------------------------------------------------------------
 * Why a queue rather than three pages
 * ---------------------------------------------------------------------------
 *
 * Approvers were visiting /org/leave, /org/expenses and /org/timesheets in turn
 * to find out whether anything needed them, and each of those pages is built
 * around administering its own domain rather than around "what is waiting for
 * me". Nothing told them a claim had been sitting for nine days.
 *
 * Everything here is filtered through `resolveApprovalScope` (T6), so the queue
 * shows only what the caller can actually action — a queue containing items you
 * are refused on is worse than no queue, because the refusal arrives after you
 * have read the request and formed a view.
 *
 * The detail views deliberately reuse the existing approve/reject server
 * functions rather than reimplementing the rules: approving leave touches
 * balances, approving WFH changes what `clockIn` accepts, and a second copy of
 * those rules would drift.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";
import { resolveApprovalScope, type ApprovalKind } from "@/lib/approval-scope";

export type ActionItem = {
  id: string;
  kind: ApprovalKind;
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  /** When the employee submitted it. */
  submittedAt: string | null;
  /** Whole days it has been waiting — the number that makes a queue actionable. */
  daysPending: number | null;
  /** The period the request covers, pre-formatted for a table cell. */
  period: string;
  /** Days for leave, hours for a timesheet, money for a claim. */
  amount: string;
  status: string;
  /** Set when this reached the caller because somebody else was unavailable. */
  escalated: boolean;
  escalationReason: string | null;
  branchId: string | null;
};

function wholeDaysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

const FiltersSchema = z.object({
  kinds: z.array(z.enum(["leave", "expense", "timesheet"])).optional(),
  branchId: z.string().uuid().optional().nullable(),
  employeeId: z.string().uuid().optional().nullable(),
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
});

/**
 * Everything awaiting this caller's decision, across all three kinds.
 *
 * Returns each kind's scope alongside the rows so the page can explain an empty
 * tab — "you have no direct reports" is a different answer from "nothing is
 * pending", and a queue that cannot tell them apart is the empty-state problem
 * this codebase keeps rediscovering.
 */
export const listActionItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FiltersSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const kinds = (data.kinds ?? ["leave", "expense", "timesheet"]) as ApprovalKind[];

    const scopes = Object.fromEntries(
      await Promise.all(
        (["leave", "expense", "timesheet"] as const).map(async (k) => [
          k,
          await resolveApprovalScope(supabase, userId, tenantId, k),
        ]),
      ),
    ) as Record<ApprovalKind, Awaited<ReturnType<typeof resolveApprovalScope>>>;

    /** Employee ids this caller may action for `kind`, or null for "all". */
    const allowFor = (kind: ApprovalKind): string[] | null | "none" => {
      const s = scopes[kind];
      if (!s.canApprove) return "none";
      return s.employeeIds;
    };

    // One employee lookup for every row across every kind, rather than an
    // embed per table — three of the five request tables have no foreign key to
    // `employees`, which is what silently emptied both requests inboxes before.
    const { data: employeeRows } = await supabase
      .from("employees")
      .select("id, first_name, last_name, employee_number, branch_id")
      .eq("tenant_id", tenantId);
    const byId = new Map(
      ((employeeRows ?? []) as any[]).map((e) => [e.id, e]),
    );

    const items: ActionItem[] = [];
    const errors: string[] = [];

    // Which items arrived here by escalation (T9), so the row can say so.
    const { data: escalations } = await supabase
      .from("approval_actions")
      .select("item_type,item_id,escalation_reason")
      .eq("tenant_id", tenantId)
      .eq("action", "escalated");
    const escalatedBy = new Map(
      ((escalations ?? []) as any[]).map((e) => [`${e.item_type}:${e.item_id}`, e.escalation_reason]),
    );

    const decorate = (
      kind: ApprovalKind,
      row: any,
      period: string,
      amount: string,
      submittedAt: string | null,
    ): ActionItem | null => {
      const emp = byId.get(row.employee_id);
      const scope = scopes[kind];
      // Never surface the caller's own request, whatever their role.
      if (scope.selfEmployeeId && scope.selfEmployeeId === row.employee_id) return null;
      const key = `${kind}:${row.id}`;
      return {
        id: row.id,
        kind,
        employeeId: row.employee_id,
        employeeName: emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : "Unknown",
        employeeNumber: emp?.employee_number ?? null,
        submittedAt,
        daysPending: wholeDaysSince(submittedAt),
        period,
        amount,
        status: row.status,
        escalated: escalatedBy.has(key),
        escalationReason: escalatedBy.get(key) ?? null,
        branchId: emp?.branch_id ?? null,
      };
    };

    const applyScope = (q: any, allow: string[] | null) =>
      allow === null ? q : q.in("employee_id", allow.length ? allow : ["00000000-0000-0000-0000-000000000000"]);

    // ---- Leave -------------------------------------------------------------
    if (kinds.includes("leave")) {
      const allow = allowFor("leave");
      if (allow !== "none") {
        let q = supabase
          .from("leave_requests")
          .select("id,employee_id,start_date,end_date,days,status,created_at,leave_type_id")
          .eq("tenant_id", tenantId)
          .eq("status", "pending");
        q = applyScope(q, allow);
        if (data.from) q = q.gte("start_date", data.from);
        if (data.to) q = q.lte("end_date", data.to);
        const { data: rows, error } = await q;
        if (error) errors.push(`leave: ${error.message}`);
        for (const r of (rows ?? []) as any[]) {
          const it = decorate(
            "leave",
            r,
            r.start_date === r.end_date ? r.start_date : `${r.start_date} → ${r.end_date}`,
            `${r.days} day${Number(r.days) === 1 ? "" : "s"}`,
            r.created_at,
          );
          if (it) items.push(it);
        }
      }
    }

    // ---- Expense claims ----------------------------------------------------
    if (kinds.includes("expense")) {
      const allow = allowFor("expense");
      if (allow !== "none") {
        let q = supabase
          .from("expense_claims")
          .select("id,employee_id,title,status,total_amount,currency,submitted_at,created_at")
          .eq("tenant_id", tenantId)
          .in("status", ["submitted", "recommended"]);
        q = applyScope(q, allow);
        const { data: rows, error } = await q;
        if (error) errors.push(`expense: ${error.message}`);
        for (const r of (rows ?? []) as any[]) {
          const it = decorate(
            "expense",
            r,
            r.title ?? "Expense claim",
            `${r.currency ?? ""} ${Number(r.total_amount ?? 0).toFixed(2)}`.trim(),
            r.submitted_at ?? r.created_at,
          );
          if (it) items.push(it);
        }
      }
    }

    // ---- Timesheets --------------------------------------------------------
    if (kinds.includes("timesheet")) {
      const allow = allowFor("timesheet");
      if (allow !== "none") {
        let q = supabase
          .from("timesheets")
          .select("id,employee_id,period_start,period_end,total_hours,overtime_hours,status,submitted_at,created_at")
          .eq("tenant_id", tenantId)
          .eq("status", "submitted");
        q = applyScope(q, allow);
        if (data.from) q = q.gte("period_start", data.from);
        if (data.to) q = q.lte("period_end", data.to);
        const { data: rows, error } = await q;
        if (error) errors.push(`timesheet: ${error.message}`);
        for (const r of (rows ?? []) as any[]) {
          const ot = Number(r.overtime_hours ?? 0);
          const it = decorate(
            "timesheet",
            r,
            `${r.period_start} → ${r.period_end}`,
            ot > 0 ? `${r.total_hours}h (${ot}h OT)` : `${r.total_hours}h`,
            r.submitted_at ?? r.created_at,
          );
          if (it) items.push(it);
        }
      }
    }

    const filtered = items.filter((i) => {
      if (data.employeeId && i.employeeId !== data.employeeId) return false;
      if (data.branchId && i.branchId !== data.branchId) return false;
      return true;
    });

    // Oldest first: a queue exists to surface what has been waiting longest.
    filtered.sort((a, b) => (b.daysPending ?? 0) - (a.daysPending ?? 0));

    return {
      items: filtered,
      counts: {
        leave: filtered.filter((i) => i.kind === "leave").length,
        expense: filtered.filter((i) => i.kind === "expense").length,
        timesheet: filtered.filter((i) => i.kind === "timesheet").length,
      },
      scopes: Object.fromEntries(
        Object.entries(scopes).map(([k, v]) => [k, { canApprove: v.canApprove, scope: v.scope, roleUsed: v.roleUsed }]),
      ),
      /**
       * Non-empty when a kind failed to load. The page says so rather than
       * drawing an empty tab — "nothing pending" and "we could not ask" must
       * not look the same in an approvals queue.
       */
      incomplete: errors,
    };
  });

/**
 * T3 — the employee's leave position, for the approver deciding a request.
 *
 * ---------------------------------------------------------------------------
 * As at the leave start date, not today
 * ---------------------------------------------------------------------------
 *
 * Accrual continues between now and the first day of leave, so for a request
 * booked months ahead today's figure understates what they will actually hold —
 * and an approver refusing on that basis refuses wrongly. The projection is
 * therefore taken to the **start date**, with today's figure shown beside it so
 * the two are never confused.
 *
 * Every leave type the employee holds is returned, not only the one requested:
 * approvers routinely ask "do they have annual left instead?" and leaving the
 * screen to find out is what this whole view exists to avoid.
 */
export const getLeaveDecisionContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ requestId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);

    const { data: req, error: reqErr } = await supabase
      .from("leave_requests")
      .select("id,employee_id,leave_type_id,start_date,end_date,days,status,reason,created_at")
      .eq("id", data.requestId)
      .maybeSingle();
    if (reqErr) throw new Error(reqErr.message);
    if (!req) throw new Error("Request not found");

    const scope = await resolveApprovalScope(supabase, userId, tenantId, "leave");
    if (!scope.canApprove) throw new Error("Your role does not include approving leave.");

    const year = new Date(req.start_date).getUTCFullYear();
    const [{ data: types }, { data: balances }, { data: pending }, { data: emp }] = await Promise.all([
      supabase.from("leave_types").select("id,name,code,annual_quota_days,accrual_per_month,is_paid").eq("tenant_id", tenantId).eq("is_active", true),
      supabase.from("leave_balances").select("*").eq("employee_id", req.employee_id).eq("year", year),
      supabase
        .from("leave_requests")
        .select("id,leave_type_id,days,start_date,end_date")
        .eq("employee_id", req.employee_id)
        .eq("status", "pending")
        .neq("id", req.id),
      supabase.from("employees").select("id,first_name,last_name,employee_number,hire_date").eq("id", req.employee_id).maybeSingle(),
    ]);

    const balanceByType = new Map(((balances ?? []) as any[]).map((b) => [b.leave_type_id, b]));
    const otherPendingByType = new Map<string, number>();
    for (const p of (pending ?? []) as any[]) {
      otherPendingByType.set(p.leave_type_id, (otherPendingByType.get(p.leave_type_id) ?? 0) + Number(p.days ?? 0));
    }

    // Months between today and the leave start, floored — accrual credited
    // monthly, so a partial month has not been earned yet.
    const start = new Date(req.start_date);
    const now = new Date();
    const monthsToStart = Math.max(
      0,
      (start.getUTCFullYear() - now.getUTCFullYear()) * 12 + (start.getUTCMonth() - now.getUTCMonth()),
    );

    const rows = ((types ?? []) as any[]).map((t) => {
      const b = balanceByType.get(t.id);
      const accrued = Number(b?.accrued_days ?? 0) + Number(b?.carried_over_days ?? 0) + Number(b?.opening_balance ?? 0);
      const taken = Number(b?.used_days ?? 0);
      const otherPending = otherPendingByType.get(t.id) ?? 0;
      const thisRequest = t.id === req.leave_type_id ? Number(req.days ?? 0) : 0;
      const accrualPerMonth = Number(t.accrual_per_month ?? 0);
      const accruedByStart = accrued + accrualPerMonth * monthsToStart;
      return {
        leaveTypeId: t.id,
        name: t.name,
        code: t.code,
        isPaid: t.is_paid,
        isRequested: t.id === req.leave_type_id,
        accruedToday: accrued,
        accruedByStart,
        takenYtd: taken,
        otherPending,
        thisRequest,
        // What they would have left if this were approved, taken to the start
        // date for the reason in the doc comment above.
        projected: accruedByStart - taken - otherPending - thisRequest,
      };
    });

    const requested = rows.find((r) => r.isRequested) ?? null;
    return {
      request: req,
      employee: emp ?? null,
      year,
      monthsToStart,
      types: rows,
      requested,
      // Surfaced rather than left for the reader to compute: this is the one
      // thing an approver must not miss.
      wouldGoNegative: !!requested && requested.projected < 0,
      canDecide: scope.canApprove,
    };
  });

/** T10 — what this approver has actioned recently. Read-only by design. */
export const listMyRecentDecisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      days: z.number().int().min(1).max(365).default(30),
      kind: z.enum(["leave", "expense", "timesheet", "all"]).default("all"),
      outcome: z.enum(["approved", "rejected", "all"]).default("all"),
    }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const since = new Date(Date.now() - data.days * 86_400_000).toISOString();

    let q = supabase
      .from("approval_actions")
      .select("*, employees:employee_id(first_name,last_name,employee_number)")
      .eq("tenant_id", tenantId)
      .eq("approver_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.kind !== "all") q = q.eq("item_type", data.kind);
    if (data.outcome !== "all") q = q.eq("action", data.outcome);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { decisions: rows ?? [] };
  });

/**
 * T11 — every decision within the caller's scope, not just their own.
 *
 * Same rows as T10, wider lens. Org admins and HR hold organisation-wide scope
 * and need to see what everyone approved; the personal log cannot answer "who
 * signed off on this" when four people could have.
 */
export const listApprovalActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      days: z.number().int().min(1).max(730).default(90),
      kind: z.enum(["leave", "expense", "timesheet", "all"]).default("all"),
      outcome: z.enum(["approved", "rejected", "escalated", "reversed", "all"]).default("all"),
      employeeId: z.string().uuid().optional().nullable(),
      approverId: z.string().uuid().optional().nullable(),
    }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const scope = await resolveApprovalScope(supabase, userId, tenantId, "leave");
    if (!scope.canApprove) throw new Error("Your role does not include viewing approval activity.");

    const since = new Date(Date.now() - data.days * 86_400_000).toISOString();
    let q = supabase
      .from("approval_actions")
      .select("*, employees:employee_id(first_name,last_name,employee_number)")
      .eq("tenant_id", tenantId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (data.kind !== "all") q = q.eq("item_type", data.kind);
    if (data.outcome !== "all") q = q.eq("action", data.outcome);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    if (data.approverId) q = q.eq("approver_id", data.approverId);
    // Narrower roles see only their own scope's employees. RLS permits a
    // manager to read rows about their reports; this keeps the page consistent
    // with that rather than showing a partial org-wide list.
    if (scope.employeeIds !== null) {
      q = q.in("employee_id", scope.employeeIds.length ? scope.employeeIds : ["00000000-0000-0000-0000-000000000000"]);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Approver names, resolved in one lookup rather than per row.
    const approverIds = [...new Set(((rows ?? []) as any[]).map((r) => r.approver_id))];
    const { data: profs } = approverIds.length
      ? await supabase.from("profiles").select("id,full_name").in("id", approverIds)
      : { data: [] };
    const nameById = new Map(((profs ?? []) as any[]).map((p) => [p.id, p.full_name]));

    return {
      rows: ((rows ?? []) as any[]).map((r) => ({
        ...r,
        approverName: nameById.get(r.approver_id) ?? "—",
      })),
      scope: scope.scope,
    };
  });

/**
 * T9 — the ageing sweep.
 *
 * Handles the case submission-time routing cannot: the approver was there when
 * the request arrived and went away afterwards, or simply has not looked.
 * Without this, a request submitted the day before a fortnight's leave sits for
 * a fortnight, which is the failure the whole feature exists to prevent.
 *
 * Idempotent — an item already carrying `escalated_at` is skipped, so running
 * this hourly does not re-notify anybody.
 *
 * The threshold is `tenants.approval_escalation_days`, defaulting to 3: short
 * enough that a forgotten claim surfaces inside a working week, long enough
 * that a normal weekend does not escalate everything on Monday morning. Set 0
 * to switch ageing off and rely on availability-based escalation alone.
 */
export const escalateStaleApprovals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ dryRun: z.boolean().default(false) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const scope = await resolveApprovalScope(supabase, userId, tenantId, "leave");
    if (scope.scope !== "tenant") {
      throw new Error("Only an organisation-wide role can run the escalation sweep.");
    }

    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { resolveEscalation, applyEscalation } = await import("@/lib/approval-escalation");

    const { data: tenant } = await admin
      .from("tenants")
      .select("approval_escalation_days")
      .eq("id", tenantId)
      .maybeSingle();
    const days = Number((tenant as any)?.approval_escalation_days ?? 3);
    if (days <= 0) return { ok: true, escalated: 0, disabled: true as const };

    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data: employees } = await admin
      .from("employees")
      .select("id,first_name,last_name,manager_id")
      .eq("tenant_id", tenantId);
    const empById = new Map(((employees ?? []) as any[]).map((e) => [e.id, e]));
    const managerUserId = async (employeeId: string): Promise<string | null> => {
      const emp = empById.get(employeeId);
      if (!emp?.manager_id) return null;
      const { data: mgr } = await admin
        .from("employees").select("user_id").eq("id", emp.manager_id).maybeSingle();
      return (mgr as any)?.user_id ?? null;
    };

    const sources = [
      { table: "leave_requests" as const, itemType: "leave", statuses: ["pending"], dateCol: "created_at", link: "/approvals" },
      { table: "expense_claims" as const, itemType: "expense", statuses: ["submitted", "recommended"], dateCol: "submitted_at", link: "/approvals" },
      { table: "timesheets" as const, itemType: "timesheet", statuses: ["submitted"], dateCol: "submitted_at", link: "/approvals" },
    ];

    let escalated = 0;
    const details: { itemType: string; itemId: string; reason: string; tier: string }[] = [];

    for (const src of sources) {
      const { data: rows, error } = await (admin as any)
        .from(src.table)
        .select(`id, employee_id, status, escalated_at, ${src.dateCol}`)
        .eq("tenant_id", tenantId)
        .in("status", src.statuses as string[])
        .is("escalated_at", null)
        .lte(src.dateCol, cutoff)
        .limit(500);
      if (error) { console.error("[escalation] scan failed", src.table, error); continue; }

      for (const row of (rows ?? []) as any[]) {
        const target = await resolveEscalation(admin, tenantId, row.employee_id, new Date().toISOString().slice(0, 10));
        if (!target) continue;
        const emp = empById.get(row.employee_id);
        const employeeName = emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : "An employee";
        details.push({ itemType: src.itemType, itemId: row.id, reason: target.reason, tier: target.tier });
        if (data.dryRun) { escalated++; continue; }
        await applyEscalation(admin, {
          table: src.table,
          itemType: src.itemType,
          itemId: row.id,
          tenantId,
          employeeId: row.employee_id,
          employeeName,
          target,
          originalApproverUserId: await managerUserId(row.employee_id),
          link: src.link,
        });
        escalated++;
      }
    }

    return { ok: true, escalated, thresholdDays: days, dryRun: data.dryRun, details };
  });
