import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getMyEmployeeId, isNoTenantScope, requireTenantId } from "@/lib/tenant-scope";

const ListInput = z.object({
  employeeId: z.string().uuid(),
  categories: z.array(z.string()).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(200),
});

export const listEmployeeTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("employee_events")
      .select("*")
      .eq("employee_id", data.employeeId)
      .order("occurred_at", { ascending: false })
      .limit(data.limit);
    if (data.categories?.length) q = q.in("category", data.categories as any);
    if (data.from) q = q.gte("occurred_at", data.from);
    if (data.to) q = q.lte("occurred_at", data.to);
    const { data: events, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (events ?? []).map((e: any) => e.id);
    let links: any[] = [];
    if (ids.length) {
      const { data: l } = await supabase
        .from("employee_event_links")
        .select("*")
        .in("from_event_id", ids);
      links = l ?? [];
    }
    // Audit: log this timeline view
    const hasConfidential = (events ?? []).some(
      (e: any) => e.visibility === "confidential" || e.visibility === "hr",
    );
    try {
      await supabase.rpc("log_event_access", {
        _resource_type: "timeline",
        _resource_id: null as any,
        _employee_id: data.employeeId as any,
        _action: "list",
        _was_confidential: hasConfidential,
        _metadata: { count: events?.length ?? 0, categories: data.categories ?? null },
      });
    } catch {
      // never fail the read because of audit logging
    }
    return { events: events ?? [], links };
  });

/**
 * Guard for HR/manager-only employee-record endpoints.
 *
 * `hr` was missing from this list despite the function's name, so HR users got
 * "Forbidden" from every endpoint behind it — including the employee picker on
 * /admin/offboarding, which rendered empty for them.
 *
 * This grants nothing new at the database level: RLS already gives `hr` full
 * tenant access to `employees` ("hr manages tenant employees",
 * 20260613140101:7-10). The guard was simply narrower than the policy it fronts.
 *
 * `finance` and `branch_admin` are deliberately excluded — finance holds
 * read-only access to employees and branch_admin is scoped to a branch, neither
 * of which matches what these endpoints do.
 */
async function assertHrOrAdmin(supabase: any, userId: string) {
  const { data: roles } = await supabase
    .from("user_roles").select("role").eq("user_id", userId)
    .in("role", ["manager", "org_admin", "super_admin", "hr"]);
  if (!roles?.length) throw new Error("Forbidden");
}

export const linkEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        fromEventId: z.string().uuid(),
        toEventId: z.string().uuid(),
        relation: z.string().min(1).max(50).default("related"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("employee_event_links").insert({
      from_event_id: data.fromEventId,
      to_event_id: data.toEventId,
      relation: data.relation,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordCustomEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid(),
        category: z.string().min(1),
        eventType: z.string().min(1).max(100),
        title: z.string().min(1).max(255),
        summary: z.string().max(2000).optional(),
        severity: z.string().max(50).optional(),
        visibility: z.enum(["employee", "manager", "hr", "confidential"]).default("employee"),
        occurredAt: z.string().optional(),
        metadata: z.record(z.string(), z.any()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);
    const { supabase } = context;
    const { data: emp, error: e1 } = await supabase
      .from("employees")
      .select("tenant_id")
      .eq("id", data.employeeId)
      .single();
    if (e1 || !emp) throw new Error("Employee not found");
    const { data: ev, error } = await supabase
      .from("employee_events")
      .insert({
        tenant_id: (emp as any).tenant_id,
        employee_id: data.employeeId,
        category: data.category as any,
        event_type: data.eventType,
        title: data.title,
        summary: data.summary,
        severity: data.severity,
        visibility: data.visibility,
        occurred_at: data.occurredAt ?? new Date().toISOString(),
        metadata: data.metadata,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { event: ev };
  });

/**
 * Employee picker for HR/admin screens (offboarding, assets, medical).
 *
 * Scoped explicitly rather than leaning on RLS. `super_admin`'s policy on
 * `employees` has no tenant predicate, so the unscoped version of this query
 * returned every employee in every tenant — see src/lib/tenant-scope.ts for
 * why that also broke the offboarding insert.
 *
 * Returns `{ employees: [], noTenantScope: true }` for a platform account with
 * no tenant, so the caller can render "pick a tenant first" instead of an
 * error. Silently returning an unscoped list is the behaviour being fixed.
 */
export const listEmployeesForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        // Off by default only where selecting yourself is meaningful. The
        // callers that must never offer self (offboarding, discipline) leave
        // this alone.
        includeSelf: z.boolean().default(false),
        includeInactive: z.boolean().default(false),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertHrOrAdmin(context.supabase, context.userId);

    let tenantId: string;
    try {
      tenantId = await requireTenantId(context.supabase, context.userId);
    } catch (e) {
      if (isNoTenantScope(e)) return { employees: [], noTenantScope: true as const };
      throw e;
    }

    let q = context.supabase
      .from("employees")
      .select("id, first_name, last_name, email, job_title, department_id, status")
      .eq("tenant_id", tenantId)
      .order("first_name", { ascending: true });
    if (!data.includeInactive) q = q.eq("status", "active");

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let employees = rows ?? [];
    if (!data.includeSelf) {
      const meId = await getMyEmployeeId(context.supabase, context.userId);
      if (meId) employees = employees.filter((e: { id: string }) => e.id !== meId);
    }
    return { employees, noTenantScope: false as const };
  });

export const myEmployeeId = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("employees")
      .select("id, tenant_id, first_name, last_name")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { employee: data };
  });
