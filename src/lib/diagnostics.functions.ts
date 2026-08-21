import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertSuperAdmin(userId: string) {
  const admin = await loadAdmin();
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r: any) => r.role === "super_admin")) {
    throw new Error("Forbidden");
  }
  return admin;
}

/**
 * Recent email_send_log rows. Super-admin only. Used by the diagnostics page
 * and E2E email-flow tests to verify invitation/notification emails reached
 * the queue.
 */
export const getRecentEmailLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        recipientEmail: z.string().email().optional(),
        templateName: z.string().max(120).optional(),
        sinceMinutes: z.number().int().min(1).max(1440).default(60),
        limit: z.number().int().min(1).max(100).default(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertSuperAdmin(context.userId as string);
    const since = new Date(Date.now() - data.sinceMinutes * 60_000).toISOString();
    let q = admin
      .from("email_send_log")
      .select("id, recipient_email, template_name, status, error_message, created_at, message_id")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.recipientEmail) q = q.eq("recipient_email", data.recipientEmail);
    if (data.templateName) q = q.eq("template_name", data.templateName);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
