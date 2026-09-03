import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const listSecurityFindings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("security_findings_log")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const userIds = Array.from(
      new Set(
        rows
          .flatMap((r: any) => [r.resolved_by, r.recorded_by])
          .filter(Boolean),
      ),
    );
    let userMap: Record<string, string> = {};
    if (userIds.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);
      userMap = Object.fromEntries(
        (profs ?? []).map((p: any) => [p.user_id, p.full_name || p.email || p.user_id]),
      );
    }
    return {
      findings: rows.map((r: any) => ({
        ...r,
        resolved_by_name: r.resolved_by ? userMap[r.resolved_by] ?? null : null,
        recorded_by_name: r.recorded_by ? userMap[r.recorded_by] ?? null : null,
      })),
    };
  });

const RecordSchema = z.object({
  scanner_name: z.string().min(1).max(80),
  internal_id: z.string().min(1).max(200),
  title: z.string().min(1).max(255),
  severity: z.enum(["error", "warn", "info"]),
  status: z.enum(["open", "fixed", "ignored", "accepted_risk"]).default("open"),
  description: z.string().max(8000).optional(),
  remediation: z.string().max(8000).optional(),
  scanned_at: z.string().optional(),
});

export const recordSecurityFinding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecordSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("security_findings_log")
      .insert({
        ...data,
        scanned_at: data.scanned_at ?? new Date().toISOString(),
        recorded_by: context.userId,
        resolved_at: data.status !== "open" ? new Date().toISOString() : null,
        resolved_by: data.status !== "open" ? context.userId : null,
      })
      .select().single();
    if (error) throw new Error(error.message);
    return { finding: row };
  });

const UpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "fixed", "ignored", "accepted_risk"]),
  remediation: z.string().max(8000).optional(),
  ticket_url: z.string().url().max(500).optional().or(z.literal("")),
  fixed_in_commit: z.string().max(500).optional().or(z.literal("")),
});

export const updateSecurityFindingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const patch: any = { status: data.status };
    if (data.remediation !== undefined) patch.remediation = data.remediation;
    if (data.ticket_url !== undefined) patch.ticket_url = data.ticket_url || null;
    if (data.fixed_in_commit !== undefined) patch.fixed_in_commit = data.fixed_in_commit || null;
    if (data.status !== "open") {
      patch.resolved_at = new Date().toISOString();
      patch.resolved_by = context.userId;
    } else {
      patch.resolved_at = null;
      patch.resolved_by = null;
    }
    const { error } = await context.supabase
      .from("security_findings_log").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Public gate used by CI: returns count of OPEN ERROR-level findings
 * across all scanners. CI workflow fails the build when this is > 0.
 */
/**
 * How many open high/critical security findings the platform is carrying.
 *
 * SECURITY (2026-09-03 audit): this shipped with **no `.middleware()` at all**
 * and read through the service-role client, so it authenticated nobody and
 * bypassed RLS. Every other function in this module gates on `assertSuperAdmin`;
 * this one did not, and the page that renders it (/admin/security) is gated —
 * which is exactly why the hole was invisible from the app.
 *
 * A TanStack server fn is a public HTTP endpoint. Anyone who could reach the
 * site could call it and read back a live count of the platform's open critical
 * security findings — a reconnaissance signal that says "this deployment has
 * seven unfixed criticals right now", with no login required. It leaked a
 * number rather than the findings themselves, which is why it rates as
 * information disclosure rather than data exposure, but the number is the part
 * an attacker wants first.
 *
 * Now gated exactly like its siblings, and reading through the CALLER's client
 * so RLS applies as a second layer rather than being bypassed.
 */
export const countOpenHighSeverityFindings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { count, error } = await context.supabase
      .from("security_findings_log")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .eq("severity", "error");
    if (error) throw new Error(error.message);
    return { open_high_critical: count ?? 0 };
  });

