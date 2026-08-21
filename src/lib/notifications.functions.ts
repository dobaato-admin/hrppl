import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const ListInput = z.object({
  unreadOnly: z.boolean().optional().default(false),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  search: z.string().trim().max(200).optional().nullable(),
  sortBy: z.enum(["newest", "unread_first", "job_id"]).optional().default("newest"),
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0),
}).partial();

function escLike(s: string) {
  // Escape PostgREST `or` filter metacharacters in the search term.
  return s.replace(/[\\%,()]/g, (m) => `\\${m}`);
}

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const limit = data.limit ?? 25;
    const offset = data.offset ?? 0;

    const sortBy = data.sortBy ?? "newest";
    let q = supabase
      .from("in_app_notifications" as any)
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Ordering. "unread_first" puts read_at NULLs first, then newest within each group.
    // "job_id" sorts by the link (which embeds the job/evidence id for CSV exports),
    // nulls last so non-export notifications fall to the bottom.
    if (sortBy === "unread_first") {
      q = q.order("read_at", { ascending: true, nullsFirst: true }).order("created_at", { ascending: false });
    } else if (sortBy === "job_id") {
      q = q.order("link", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
    } else {
      q = q.order("created_at", { ascending: false });
    }
    q = q.range(offset, offset + limit - 1);

    if (data.unreadOnly) q = q.is("read_at", null);
    if (data.startDate) q = q.gte("created_at", `${data.startDate}T00:00:00Z`);
    if (data.endDate) q = q.lte("created_at", `${data.endDate}T23:59:59Z`);
    if (data.search) {
      const term = `%${escLike(data.search)}%`;
      // Search title, body, kind, and the link (which carries the job id /
      // evidence type for CSV exports). Single PostgREST `or` keeps it one round-trip.
      q = q.or(`title.ilike.${term},body.ilike.${term},kind.ilike.${term},link.ilike.${term}`);
    }

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    // Always-fresh unread total for badge (independent of filter window).
    const { count: unreadCount } = await supabase
      .from("in_app_notifications" as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    return {
      notifications: (rows ?? []) as any[],
      total: count ?? 0,
      unreadTotal: unreadCount ?? 0,
      limit,
      offset,
    };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    ids: z.array(z.string().uuid()).max(200).optional(),
    all: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();
    let q = supabase.from("in_app_notifications" as any).update({ read_at: now } as any).eq("user_id", userId);
    if (data.id) q = q.eq("id", data.id);
    else if (data.ids && data.ids.length > 0) q = q.in("id", data.ids);
    else q = q.is("read_at", null);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Undo for the bulk "mark visible read" action. Resets read_at to NULL for the
 * given ids, scoped to the calling user (RLS also enforces this).
 */
export const markNotificationUnread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    ids: z.array(z.string().uuid()).min(1).max(200),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("in_app_notifications" as any)
      .update({ read_at: null } as any)
      .eq("user_id", userId)
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });
