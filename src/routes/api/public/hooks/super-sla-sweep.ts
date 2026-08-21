/**
 * Payday Super SLA sweep — invoked by pg_cron daily.
 *
 * Auth: shared cron authorization (Authorization: Bearer <CRON_SECRET>). The
 * Supabase publishable key is NOT accepted — it is embedded in the browser
 * bundle and would let any visitor trigger payroll writes.
 *
 * Side effect: flips `super_contributions.status` to `overdue` for any
 * contribution whose `payment_due_date < today` and is still pending.
 */
import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

const PENDING_STATUSES = ["pending", "queued", "scheduled", "draft"];

export const Route = createFileRoute("/api/public/hooks/super-sla-sweep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401, headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabaseAdmin.from("super_contributions")
          .update({ status: "overdue" })
          .lt("payment_due_date", today)
          .in("status", PENDING_STATUSES)
          .select("id,tenant_id");
        if (error) {
          console.error("super-sla-sweep error", error);
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({
          ok: true, swept: data?.length ?? 0, at: new Date().toISOString(),
        }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
