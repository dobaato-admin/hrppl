import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const RangeInput = z.object({
  start_date: DateStr.optional(),
  end_date: DateStr.optional(),
  assignment_id: z.string().uuid().optional(),
  variation_id: z.string().uuid().optional(),
}).partial();

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : (typeof v === "object" ? JSON.stringify(v) : String(v));
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: any[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((r) =>
    columns.map((c) => csvEscape((r as any)[c.key])).join(","),
  );
  return [header, ...body].join("\n");
}

export const exportOnboardingAuditCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase
      .from("onboarding_control_room_audit")
      .select("created_at, action, actor_name, actor_email, assignment_id, task_id, details")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (data.assignment_id) q = q.eq("assignment_id", data.assignment_id);
    if (data.start_date) q = q.gte("created_at", `${data.start_date}T00:00:00Z`);
    if (data.end_date) q = q.lte("created_at", `${data.end_date}T23:59:59Z`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const csv = toCsv((rows ?? []) as any[], [
      { key: "created_at", label: "Timestamp (UTC)" },
      { key: "action", label: "Action" },
      { key: "actor_name", label: "Actor name" },
      { key: "actor_email", label: "Actor email" },
      { key: "assignment_id", label: "Assignment ID" },
      { key: "task_id", label: "Task ID" },
      { key: "details", label: "Details" },
    ]);
    return { csv, count: rows?.length ?? 0 };
  });

export const exportVariationAuditCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    let q = supabase
      .from("employment_variation_audit")
      .select("created_at, action, actor_name, actor_email, variation_id, details")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (data.variation_id) q = q.eq("variation_id", data.variation_id);
    if (data.start_date) q = q.gte("created_at", `${data.start_date}T00:00:00Z`);
    if (data.end_date) q = q.lte("created_at", `${data.end_date}T23:59:59Z`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const csv = toCsv((rows ?? []) as any[], [
      { key: "created_at", label: "Timestamp (UTC)" },
      { key: "action", label: "Action" },
      { key: "actor_name", label: "Actor name" },
      { key: "actor_email", label: "Actor email" },
      { key: "variation_id", label: "Variation ID" },
      { key: "details", label: "Details" },
    ]);
    return { csv, count: rows?.length ?? 0 };
  });
