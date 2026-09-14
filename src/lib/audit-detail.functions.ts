/**
 * Single-row audit detail fetch + diff summarization.
 * Returns before/after JSON plus a human-readable "what changed" summary
 * (added / removed / changed keys). Used by the audit history detail dialog.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

const Input = z.object({
  source: z.enum(["onboarding", "offboarding"]),
  id: z.string().uuid(),
  includeArchive: z.boolean().default(false),
});

export function summarizeDiff(before: any, after: any): { key: string; from: any; to: any; kind: "added" | "removed" | "changed" }[] {
  const b = (before && typeof before === "object") ? before : {};
  const a = (after && typeof after === "object") ? after : {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  const out: any[] = [];
  for (const k of keys) {
    const bv = (b as any)[k]; const av = (a as any)[k];
    const bs = JSON.stringify(bv); const as = JSON.stringify(av);
    if (bs === as) continue;
    if (bv === undefined) out.push({ key: k, from: null, to: av, kind: "added" });
    else if (av === undefined) out.push({ key: k, from: bv, to: null, kind: "removed" });
    else out.push({ key: k, from: bv, to: av, kind: "changed" });
  }
  return out;
}

export const getAuditDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);

    if (data.source === "onboarding") {
      const table = data.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
      const { data: row, error } = await supabase.from(table).select("*").eq("id", data.id).eq("tenant_id", tenantId).maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) throw new Error("Audit entry not found.");
      const details = (row as any).details ?? {};
      const before = (details as any)?.before ?? null;
      const after = (details as any)?.after ?? details ?? null;
      return { row, before, after, diff: summarizeDiff(before, after) };
    } else {
      const table = data.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";
      const { data: row, error } = await supabase.from(table).select("*").eq("id", data.id).eq("tenant_id", tenantId).maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) throw new Error("Audit entry not found.");
      return { row, before: (row as any).before ?? null, after: (row as any).after ?? null, diff: summarizeDiff((row as any).before, (row as any).after) };
    }
  });
