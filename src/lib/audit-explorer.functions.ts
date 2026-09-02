/**
 * Unified audit explorer + CSV export.
 * Covers onboarding_control_room_audit and offboarding_comms_removal_audit
 * with filters by employee, channel, date range, actor, and free-text search.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireTenantId } from "@/lib/tenant-scope";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforceRateLimit, CSV_MAX_ROWS } from "./rate-limit.functions";

const FilterSchema = z
  .object({
    source: z.enum(["onboarding", "offboarding", "all"]).default("all"),
    employeeId: z.string().uuid().optional().nullable(),
    channel: z.string().trim().max(60).optional().nullable(),
    actorId: z.string().uuid().optional().nullable(),
    actorSearch: z.string().trim().max(200).optional().nullable(),
    action: z.string().trim().max(60).optional().nullable(),
    taskId: z.string().uuid().optional().nullable(),
    assignmentId: z.string().uuid().optional().nullable(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    includeArchive: z.boolean().default(false),
    limit: z.number().int().min(1).max(2000).default(100),
    offset: z.number().int().min(0).max(100000).default(0),
    sortBy: z.enum(["created_at", "action", "source"]).default("created_at"),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
  })
  .partial();

type Filters = z.infer<typeof FilterSchema>;

async function fetchScopedTenant(supabase: any, userId: string) {
  // W5 P0-4 · Reads through tenant-scope so a platform admin acting as a tenant
  // gets that tenant rather than their own NULL. Throws NoTenantScopeError,
  // which the UI can render as an empty state — the plain Error this replaced
  // surfaced as a failure toast on a page that was merely unscoped.
  return requireTenantId(supabase, userId);
}

function applyDateRange(q: any, f: Filters) {
  if (f.startDate) q = q.gte("created_at", `${f.startDate}T00:00:00Z`);
  if (f.endDate) q = q.lte("created_at", `${f.endDate}T23:59:59Z`);
  return q;
}

async function queryOnboarding(
  supabase: any,
  tenantId: string,
  f: Filters,
  table: string,
  fetchLimit: number,
) {
  let q = supabase
    .from(table)
    .select(
      "id, created_at, action, details, actor_id, actor_email, actor_name, tenant_id, employee_id, assignment_id, task_id",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(fetchLimit);
  if (f.employeeId) q = q.eq("employee_id", f.employeeId);
  if (f.taskId) q = q.eq("task_id", f.taskId);
  if (f.assignmentId) q = q.eq("assignment_id", f.assignmentId);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch)
    q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = applyDateRange(q, f);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({ ...r, source: "onboarding" as const, channel: null }));
}

async function queryOffboarding(
  supabase: any,
  tenantId: string,
  f: Filters,
  table: string,
  fetchLimit: number,
) {
  let q = supabase
    .from(table)
    .select(
      "id, created_at, action, before, after, actor_id, actor_email, actor_name, tenant_id, case_id, comms_row_id, channel",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(fetchLimit);
  if (f.channel) q = q.eq("channel", f.channel);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch)
    q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = applyDateRange(q, f);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = (data ?? []).map((r: any) => ({
    ...r,
    source: "offboarding" as const,
    employee_id: null,
    details: r.after,
  }));
  if (f.employeeId) {
    const caseIds = Array.from(new Set(rows.map((r: any) => r.case_id)));
    if (caseIds.length) {
      const { data: cases } = await supabase
        .from("offboarding_cases")
        .select("id, employee_id")
        .in("id", caseIds);
      const allowed = new Set(
        (cases ?? []).filter((c: any) => c.employee_id === f.employeeId).map((c: any) => c.id),
      );
      rows = rows.filter((r: any) => allowed.has(r.case_id));
    }
  }
  return rows;
}

export const exploreAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FilterSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "audit_explorer", 60, 60);
    const tenantId = await fetchScopedTenant(supabase, userId);
    const f = data as Filters;
    const limit = f.limit ?? 100;
    const offset = f.offset ?? 0;
    const sortBy = f.sortBy ?? "created_at";
    const sortDir = f.sortDir ?? "desc";
    // Over-fetch so we can sort + paginate the unified result client-side at the server layer.
    const fetchLimit = Math.min(2000, offset + limit + 200);

    const onbTable = f.includeArchive
      ? "onboarding_control_room_audit_archive"
      : "onboarding_control_room_audit";
    const offTable = f.includeArchive
      ? "offboarding_comms_removal_audit_archive"
      : "offboarding_comms_removal_audit";

    const results: any[] = [];
    if (f.source !== "offboarding")
      results.push(...(await queryOnboarding(supabase, tenantId, f, onbTable, fetchLimit)));
    if (f.source !== "onboarding")
      results.push(...(await queryOffboarding(supabase, tenantId, f, offTable, fetchLimit)));

    const dir = sortDir === "asc" ? 1 : -1;
    results.sort((a, b) => {
      const av = a[sortBy] ?? "";
      const bv = b[sortBy] ?? "";
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
    const total = results.length;
    const page = results.slice(offset, offset + limit);
    return { rows: page, total, limit, offset, hasMore: total > offset + limit };
  });

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const exportAuditCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    FilterSchema.extend({
      limit: z.number().int().min(1).max(CSV_MAX_ROWS).default(CSV_MAX_ROWS),
    }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "audit_export", 5, 60);
    const tenantId = await fetchScopedTenant(supabase, userId);
    const f = data as Filters;

    const onbTable = f.includeArchive
      ? "onboarding_control_room_audit_archive"
      : "onboarding_control_room_audit";
    const offTable = f.includeArchive
      ? "offboarding_comms_removal_audit_archive"
      : "offboarding_comms_removal_audit";

    const rows: any[] = [];
    if (f.source !== "offboarding")
      rows.push(...(await queryOnboarding(supabase, tenantId, f, onbTable, CSV_MAX_ROWS)));
    if (f.source !== "onboarding")
      rows.push(...(await queryOffboarding(supabase, tenantId, f, offTable, CSV_MAX_ROWS)));
    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const capped = rows.slice(0, CSV_MAX_ROWS);

    const header = [
      "timestamp_utc",
      "source",
      "action",
      "actor_name",
      "actor_email",
      "employee_id",
      "channel",
      "assignment_id",
      "task_id",
      "case_id",
      "details",
    ];
    const body = capped.map((r: any) => [
      r.created_at,
      r.source,
      r.action,
      r.actor_name ?? "",
      r.actor_email ?? "",
      r.employee_id ?? "",
      r.channel ?? "",
      r.assignment_id ?? "",
      r.task_id ?? "",
      r.case_id ?? "",
      r.details ?? r.after ?? {},
    ]);
    const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
    return { csv, rowCount: capped.length, truncated: rows.length > CSV_MAX_ROWS };
  });

export const exportOnboardingTrackerAuditCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid().optional().nullable(),
        assignmentId: z.string().uuid().optional().nullable(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable(),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable(),
        includeArchive: z.boolean().default(false),
      })
      .partial()
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "audit_export", 5, 60);
    const tenantId = await fetchScopedTenant(supabase, userId);
    const table = data.includeArchive
      ? "onboarding_control_room_audit_archive"
      : "onboarding_control_room_audit";
    let q = supabase
      .from(table)
      .select(
        "created_at, action, actor_name, actor_email, employee_id, assignment_id, task_id, details",
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(CSV_MAX_ROWS);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    if (data.assignmentId) q = q.eq("assignment_id", data.assignmentId);
    if (data.startDate) q = q.gte("created_at", `${data.startDate}T00:00:00Z`);
    if (data.endDate) q = q.lte("created_at", `${data.endDate}T23:59:59Z`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const header = [
      "timestamp_utc",
      "action",
      "actor_name",
      "actor_email",
      "employee_id",
      "assignment_id",
      "task_id",
      "details",
    ];
    const body = (rows ?? []).map((r: any) => [
      r.created_at,
      r.action,
      r.actor_name ?? "",
      r.actor_email ?? "",
      r.employee_id ?? "",
      r.assignment_id,
      r.task_id ?? "",
      r.details ?? {},
    ]);
    const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
    return { csv, rowCount: body.length };
  });
