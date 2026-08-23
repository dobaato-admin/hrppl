/**
 * One inbox for every kind of request.
 *
 * Six tables model "somebody asked for something and somebody has to decide" —
 * `leave_requests`, `wfh_requests`, `expense_claims`, `support_tickets`,
 * `toil_requests` and `grievances` — and until now each had its own page, its
 * own status vocabulary, and no shared history. Answering "what have I asked
 * for and where did it get to?" meant visiting five routes and remembering
 * which ones existed. `/me/requests` was the closest thing to an inbox and it
 * showed support tickets only.
 *
 * This normalises all six into one shape so a single screen can list, filter
 * and group them. It is a read model: creating and deciding still goes through
 * each domain's own server fn, because that is where the domain rules live —
 * an approved WFH day changes what `clockIn` does, and a leave approval touches
 * balances. Nothing here writes.
 *
 * ## Status vocabularies
 *
 * Every table spells its states differently — `pending`/`submitted`/`open`/
 * `new`, `approved`/`resolved`/`paid`, `rejected`/`declined`/`dismissed`. The
 * raw value is preserved for display, but each row also carries a `group` so
 * the UI can count and filter across types without knowing any of them.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyEmployeeId, getTenantId } from "@/lib/tenant-scope";

export type RequestKind = "leave" | "wfh" | "expense" | "ticket" | "toil" | "grievance";
export type StatusGroup = "pending" | "approved" | "rejected" | "cancelled";

export interface InboxRow {
  id: string;
  kind: RequestKind;
  /** What the request is, in one line. */
  title: string;
  /** Supporting detail: the reason, the description, the dates. */
  detail: string | null;
  /** The table's own status word, shown as-is. */
  status: string;
  group: StatusGroup;
  createdAt: string;
  /** `YYYY-MM-DD` or `YYYY-MM-DD → YYYY-MM-DD` where the request covers dates. */
  period: string | null;
  /** Where to go to act on or read more about it. */
  href: string;
  /** Both only populated in the approver queue. */
  employeeName?: string | null;
  employeeId?: string | null;
}

const PENDING = [
  "pending",
  "submitted",
  "open",
  "new",
  "in_review",
  "recommended",
  "awaiting_approval",
];
const APPROVED = ["approved", "resolved", "closed", "paid", "completed", "reimbursed"];
const REJECTED = ["rejected", "declined", "dismissed"];

/**
 * Collapse a table-specific status into one of four groups.
 *
 * Unknown values fall into `pending` rather than being dropped: a request in a
 * state this function has not been taught about is still outstanding, and
 * silently hiding it from the inbox is the one behaviour that would make the
 * whole screen untrustworthy.
 */
export function statusGroup(status: string | null | undefined): StatusGroup {
  const s = (status ?? "").toLowerCase();
  if (APPROVED.includes(s)) return "approved";
  if (REJECTED.includes(s)) return "rejected";
  if (s === "cancelled" || s === "canceled" || s === "withdrawn") return "cancelled";
  if (PENDING.includes(s)) return "pending";
  return "pending";
}

/** `2026-08-23` or `2026-08-23 → 2026-08-25`, or null when the request has no span. */
export function formatPeriod(start?: string | null, end?: string | null): string | null {
  if (!start) return null;
  if (!end || end === start) return start;
  return `${start} → ${end}`;
}

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  leave: "Leave",
  wfh: "Work from home",
  expense: "Expense",
  ticket: "Support",
  toil: "Time off in lieu",
  grievance: "Grievance",
};

/**
 * Query one table and normalise it, tolerating absence.
 *
 * A failure on one source must not blank the whole inbox — a missing table or a
 * policy that refuses a role should cost that row type, not the screen. The
 * error is surfaced per-source so the UI can say which parts are incomplete
 * rather than quietly showing a short list.
 */
/**
 * The row shape is deliberately dynamic *here and only here*.
 *
 * Six tables with six different column sets, several read through PostgREST
 * embeds, are being funnelled into one helper. A generic that threads each
 * table's inferred row type through the builder does not survive the embeds,
 * and forcing it produces worse code than admitting the boundary is dynamic.
 *
 * The important half is still fully typed: every `map` returns `InboxRow`, so
 * everything downstream of this function — the whole UI — is checked.
 */
type SourceRow = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function safeRows(
  label: RequestKind,
  run: () => PromiseLike<{ data: unknown; error: { message: string } | null }>,
  map: (row: SourceRow) => InboxRow,
): Promise<{ rows: InboxRow[]; failed: RequestKind | null }> {
  try {
    const { data, error } = await run();
    if (error) {
      console.error(`[requests-inbox] ${label} failed`, error.message);
      return { rows: [], failed: label };
    }
    return { rows: ((data ?? []) as SourceRow[]).map(map), failed: null };
  } catch (e) {
    console.error(`[requests-inbox] ${label} threw`, e);
    return { rows: [], failed: label };
  }
}

const newestFirst = (a: InboxRow, b: InboxRow) => (a.createdAt < b.createdAt ? 1 : -1);

// ---------------------------------------------------------------- my requests

export const listMyRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const employeeId = await getMyEmployeeId(supabase, userId);
    if (!employeeId) {
      return {
        rows: [] as InboxRow[],
        hasEmployee: false as const,
        incomplete: [] as RequestKind[],
      };
    }

    const results = await Promise.all([
      safeRows(
        "leave",
        () =>
          supabase
            .from("leave_requests")
            .select("id,start_date,end_date,days,reason,status,created_at,leave_types(name)")
            .eq("employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "leave" as const,
          title: `${(r as { leave_types?: { name?: string } }).leave_types?.name ?? "Leave"} — ${r.days} day${Number(r.days) === 1 ? "" : "s"}`,
          detail: (r.reason ?? null) as string | null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: formatPeriod(r.start_date as string, r.end_date as string),
          href: "/leave",
        }),
      ),
      safeRows(
        "wfh",
        () =>
          supabase
            .from("wfh_requests")
            .select("id,start_date,end_date,reason,work_address,status,decision_note,created_at")
            .eq("employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "wfh" as const,
          title: "Work from home",
          detail:
            [r.reason, r.work_address, r.decision_note && `Note: ${r.decision_note}`]
              .filter(Boolean)
              .join(" · ") || null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: formatPeriod(r.start_date as string, r.end_date as string),
          href: "/me/wfh",
        }),
      ),
      safeRows(
        "expense",
        () =>
          supabase
            .from("expense_claims")
            .select("id,title,description,status,created_at")
            .eq("employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "expense" as const,
          title: (r.title as string) || "Expense claim",
          detail: (r.description ?? null) as string | null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: null,
          href: "/me/expenses",
        }),
      ),
      safeRows(
        "ticket",
        () =>
          supabase
            .from("support_tickets")
            .select("id,category,subject,description,status,priority,requested_for_date,created_at")
            .eq("employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "ticket" as const,
          title: (r.subject as string) || "Support request",
          detail:
            [r.category, r.priority && `${r.priority} priority`, r.description]
              .filter(Boolean)
              .join(" · ") || null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: (r.requested_for_date ?? null) as string | null,
          href: "/me/requests",
        }),
      ),
      safeRows(
        "toil",
        () =>
          supabase
            .from("toil_requests")
            .select("id,start_date,end_date,reason,status,created_at")
            .eq("employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "toil" as const,
          title: "Time off in lieu",
          detail: (r.reason ?? null) as string | null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: formatPeriod(r.start_date as string, r.end_date as string),
          href: "/me/toil",
        }),
      ),
      safeRows(
        "grievance",
        () =>
          supabase
            .from("grievances")
            .select("id,subject,category,status,created_at,is_anonymous")
            .eq("filer_employee_id", employeeId)
            .order("created_at", { ascending: false })
            .limit(100),
        (r) => ({
          id: r.id as string,
          kind: "grievance" as const,
          title: (r.subject as string) || "Grievance",
          detail:
            [r.category, r.is_anonymous && "filed anonymously"].filter(Boolean).join(" · ") || null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: null,
          href: "/me/grievances",
        }),
      ),
    ]);

    return {
      hasEmployee: true as const,
      rows: results.flatMap((r) => r.rows).sort(newestFirst),
      incomplete: results.map((r) => r.failed).filter((x): x is RequestKind => x !== null),
    };
  });

// ------------------------------------------------------------ approval queue

const APPROVER_ROLES = ["manager", "hr", "org_admin", "super_admin", "finance", "branch_admin"];

export const listApprovalQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ group: z.enum(["pending", "all"]).default("pending") }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = ((roleRows ?? []) as { role: string }[]).map((r) => r.role);
    if (!roles.some((r) => APPROVER_ROLES.includes(r))) {
      return {
        rows: [] as InboxRow[],
        canApprove: false as const,
        noTenantScope: false,
        incomplete: [],
      };
    }

    // Scoped explicitly, never left to RLS. super_admin's policies carry no
    // tenant predicate, so an unscoped read here would merge every tenant's
    // requests into one queue — the exact leak the offboarding picker had.
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) {
      return {
        rows: [] as InboxRow[],
        canApprove: true as const,
        noTenantScope: true,
        incomplete: [],
      };
    }
    const myEmployeeId = await getMyEmployeeId(supabase, userId);

    const pendingOnly = data.group === "pending";
    const withStatus = <T>(q: T, statuses: string[]): T =>
      pendingOnly ? ((q as { in: (c: string, v: string[]) => T }).in("status", statuses) as T) : q;

    const name = (e: SourceRow | null | undefined) =>
      `${e?.first_name ?? ""} ${e?.last_name ?? ""}`.trim() || null;

    const results = await Promise.all([
      safeRows(
        "leave",
        () =>
          withStatus(
            supabase
              .from("leave_requests")
              .select(
                "id,start_date,end_date,days,reason,status,created_at,employee_id,employees(first_name,last_name),leave_types(name)",
              )
              .eq("tenant_id", tenantId)
              .order("created_at", { ascending: false })
              .limit(200),
            ["pending"],
          ),
        (r) => ({
          id: r.id as string,
          kind: "leave" as const,
          title: `${(r as { leave_types?: { name?: string } }).leave_types?.name ?? "Leave"} — ${r.days} day${Number(r.days) === 1 ? "" : "s"}`,
          detail: (r.reason ?? null) as string | null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: formatPeriod(r.start_date as string, r.end_date as string),
          href: "/org/leave",
          employeeId: r.employee_id as string,
          employeeName: name(r.employees),
        }),
      ),
      safeRows(
        "wfh",
        () =>
          withStatus(
            supabase
              .from("wfh_requests")
              .select(
                "id,start_date,end_date,reason,work_address,status,created_at,employee_id,employees(first_name,last_name)",
              )
              .eq("tenant_id", tenantId)
              .order("created_at", { ascending: false })
              .limit(200),
            ["pending"],
          ),
        (r) => ({
          id: r.id as string,
          kind: "wfh" as const,
          title: "Work from home",
          detail: [r.reason, r.work_address].filter(Boolean).join(" · ") || null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: formatPeriod(r.start_date as string, r.end_date as string),
          href: "/admin/wfh",
          employeeId: r.employee_id as string,
          employeeName: name(r.employees),
        }),
      ),
      safeRows(
        "expense",
        () =>
          withStatus(
            supabase
              .from("expense_claims")
              .select(
                "id,title,description,status,created_at,employee_id,employees(first_name,last_name)",
              )
              .eq("tenant_id", tenantId)
              .order("created_at", { ascending: false })
              .limit(200),
            ["submitted", "recommended", "pending"],
          ),
        (r) => ({
          id: r.id as string,
          kind: "expense" as const,
          title: (r.title as string) || "Expense claim",
          detail: (r.description ?? null) as string | null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: null,
          href: "/admin/expenses",
          employeeId: r.employee_id as string,
          employeeName: name(r.employees),
        }),
      ),
      safeRows(
        "ticket",
        () =>
          withStatus(
            supabase
              .from("support_tickets")
              .select(
                "id,category,subject,status,priority,created_at,employee_id,employees(first_name,last_name)",
              )
              .eq("tenant_id", tenantId)
              .order("created_at", { ascending: false })
              .limit(200),
            ["open", "new", "pending", "in_review"],
          ),
        (r) => ({
          id: r.id as string,
          kind: "ticket" as const,
          title: (r.subject as string) || "Support request",
          detail:
            [r.category, r.priority && `${r.priority} priority`].filter(Boolean).join(" · ") ||
            null,
          status: r.status as string,
          group: statusGroup(r.status as string),
          createdAt: r.created_at as string,
          period: null,
          href: "/admin/requests",
          employeeId: r.employee_id as string,
          employeeName: name(r.employees),
        }),
      ),
    ]);

    let rows = results.flatMap((r) => r.rows).sort(newestFirst);
    // Your own requests are hidden from the *actionable queue* — you cannot
    // decide them, so offering them there is an invitation to try. They stay in
    // the "all" view, which is a repository rather than a work list: a record of
    // everything the organisation has asked for is wrong if it omits yours, and
    // seeing a row is not the same as being able to act on it. Self-decision is
    // refused by the wfh_requests lifecycle trigger and by RLS regardless of
    // what any list shows.
    if (myEmployeeId && pendingOnly) {
      rows = rows.filter((r) => r.employeeId !== myEmployeeId);
    }

    return {
      canApprove: true as const,
      noTenantScope: false,
      rows,
      incomplete: results.map((r) => r.failed).filter((x): x is RequestKind => x !== null),
    };
  });
