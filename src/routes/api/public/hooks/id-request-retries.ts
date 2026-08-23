import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { processDueRetries } from "@/lib/teams.functions";

// Background retry runner for "Request info" emails.
// Designed to be called every few minutes by pg_cron. The endpoint is idempotent.
// Requires `Authorization: Bearer <CRON_SECRET>` (falls back to the service role key only until CRON_SECRET is configured).

export const Route = createFileRoute("/api/public/hooks/id-request-retries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const result = await processDueRetries(supabaseAdmin, 50);
          return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: unknown) {
          return hookFailure("id-request-retries", e);
        }
      },
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        return new Response("ok");
      },
    },
  },
});
