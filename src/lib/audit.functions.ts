import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function assertAdmin(ctx: any) {
  const { data: roles } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  const r = (roles ?? []).map((x: any) => x.role);
  if (!r.some((x: string) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Not authorized to view audit trail");
  }
}

/** Record a view/edit/export event into the access log. */
export const logEventAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        resourceType: z.enum([
          "employee_event",
          "medical_incident",
          "disciplinary_case",
          "timeline",
        ]),
        resourceId: z.string().uuid().optional(),
        employeeId: z.string().uuid().optional(),
        action: z.enum(["view", "edit", "export", "list"]).default("view"),
        wasConfidential: z.boolean().default(false),
        metadata: z.record(z.string(), z.any()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("log_event_access", {
      _resource_type: data.resourceType,
      _resource_id: (data.resourceId ?? null) as any,
      _employee_id: (data.employeeId ?? null) as any,
      _action: data.action,
      _was_confidential: data.wasConfidential,
      _metadata: data.metadata,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** List access log entries — admin only. Filter by employee/resource. */
export const listEventAccessLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employeeId: z.string().uuid().optional(),
        resourceType: z.string().optional(),
        resourceId: z.string().uuid().optional(),
        actorId: z.string().uuid().optional(),
        confidentialOnly: z.boolean().default(false),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("event_access_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    if (data.resourceType) q = q.eq("resource_type", data.resourceType);
    if (data.resourceId) q = q.eq("resource_id", data.resourceId);
    if (data.actorId) q = q.eq("actor_id", data.actorId);
    if (data.confidentialOnly) q = q.eq("was_confidential", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Enrich with actor names
    const actorIds = Array.from(
      new Set((rows ?? []).map((r: any) => r.actor_id).filter(Boolean)),
    );
    let actors: Record<string, { email: string | null; full_name: string | null }> = {};
    if (actorIds.length) {
      const { data: profs } = await context.supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", actorIds);
      for (const p of profs ?? []) {
        actors[(p as any).id] = {
          email: (p as any).email,
          full_name: (p as any).full_name,
        };
      }
    }
    return { entries: rows ?? [], actors };
  });

/** Aggregate counts for a quick dashboard. */
export const accessLogSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ employeeId: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("event_access_log")
      .select("action, was_confidential, resource_type")
      .limit(2000);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const summary = {
      total: rows?.length ?? 0,
      confidential: 0,
      byAction: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
    };
    for (const r of rows ?? []) {
      if ((r as any).was_confidential) summary.confidential++;
      summary.byAction[(r as any).action] =
        (summary.byAction[(r as any).action] ?? 0) + 1;
      summary.byResource[(r as any).resource_type] =
        (summary.byResource[(r as any).resource_type] ?? 0) + 1;
    }
    return summary;
  });
