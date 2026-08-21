/**
 * Daily retention cron — invoked by pg_cron / external scheduler.
 * Runs `public.run_audit_retention()` which archives aged audit rows and
 * hard-deletes from the archive after each tenant's deletion window.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/audit-retention-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const secret = process.env.AUDIT_RETENTION_SECRET;
        if (secret && auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("run_audit_retention");
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
        return new Response(JSON.stringify({ ok: true, summary: data ?? [] }), { headers: { "content-type": "application/json" } });
      },
      GET: async ({ request }) => {
        return new Response("Use POST", { status: 405 });
      },
    },
  },
});
