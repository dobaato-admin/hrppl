import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { dueSetupReminder, outstandingSetupSteps } from "@/lib/setup-reminders";

/**
 * T22 · Nudge org admins who left the setup wizard unfinished.
 *
 * Cadence and the decision to send at all live in `src/lib/setup-reminders.ts`
 * so they can be tested without a database: the failures worth catching here
 * are arithmetic — reminding twice in an hour, restarting the ladder, or never
 * stopping.
 *
 * The link lands on `/org/setup`, which already resumes at the first
 * incomplete step, so the reminder and the product agree about where "where
 * you left off" is.
 */
export const Route = createFileRoute("/api/public/hooks/org-setup-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
          const appUrl = process.env.PUBLIC_APP_URL || "https://hrppl.io";

          const { data: rows, error } = await supabaseAdmin
            .from("organization_setup_progress")
            .select("*")
            .is("completed_at", null)
            .limit(500);
          if (error) throw error;

          let sent = 0;
          let skipped = 0;
          for (const row of (rows ?? []) as any[]) {
            const decision = dueSetupReminder(row);
            if (!decision) {
              skipped += 1;
              continue;
            }

            const { data: tenant } = await supabaseAdmin
              .from("tenants")
              .select("name,created_by")
              .eq("id", row.tenant_id)
              .maybeSingle();
            if (!tenant?.created_by) {
              skipped += 1;
              continue;
            }
            const { data: founder } = await supabaseAdmin
              .from("profiles")
              .select("email,full_name")
              .eq("id", tenant.created_by)
              .maybeSingle();
            if (!founder?.email) {
              skipped += 1;
              continue;
            }

            // Counter first. If the send throws, the worst case is one missed
            // reminder; bumping afterwards would risk re-sending the same one
            // on every sweep for an address that keeps failing.
            const { error: bumpErr } = await supabaseAdmin
              .from("organization_setup_progress")
              .update({
                last_reminder_at: new Date().toISOString(),
                reminder_count: decision.sequence,
              })
              .eq("tenant_id", row.tenant_id);
            if (bumpErr) {
              skipped += 1;
              continue;
            }

            await sendInternalEmail({
              templateName: "org-setup-reminder",
              recipientEmail: founder.email,
              idempotencyKey: `org-setup-${row.tenant_id}-${decision.sequence}`,
              templateData: {
                recipientName: founder.full_name ?? undefined,
                organizationName: tenant.name,
                outstandingSteps: outstandingSetupSteps(row),
                daysSinceCreated: decision.daysSinceCreated,
                sequence: decision.sequence,
                resumeUrl: `${appUrl}/org/setup`,
              },
            });
            sent += 1;
          }

          return new Response(JSON.stringify({ ok: true, sent, skipped }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: unknown) {
          return hookFailure("org-setup-reminders", e);
        }
      },
    },
  },
});
