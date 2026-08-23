/**
 * Daily retention cron — invoked by Vercel Cron (GET) or an external scheduler (POST).
 * Runs `public.run_audit_retention()` which archives aged audit rows and
 * hard-deletes from the archive after each tenant's deletion window.
 *
 * Auth is fail-closed. It previously read `if (secret && auth !== ...)`, which left the
 * endpoint fully open whenever AUDIT_RETENTION_SECRET was unset — and unset is the
 * default. Either AUDIT_RETENTION_SECRET or the shared CRON_SECRET is accepted, so a
 * Vercel cron (which sends `Authorization: Bearer $CRON_SECRET`) works without giving
 * this endpoint its own credential.
 */
import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

function isAuthorized(request: Request): boolean {
  const secret = process.env.AUDIT_RETENTION_SECRET;
  if (secret && secret.length > 0) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth === `Bearer ${secret}`) return true;
  }
  return isAuthorizedCronRequest(request);
}

async function runRetention() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("run_audit_retention");
  // Redacted on purpose: this endpoint is internet-reachable and the raw
  // Postgres message would name tables and constraints.
  if (error) return hookFailure("audit-retention", error);
  return new Response(JSON.stringify({ ok: true, summary: data ?? [] }), {
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/hooks/audit-retention-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
        return runRetention();
      },
      // Vercel Cron entry point — GET only, no body.
      GET: async ({ request }) => {
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
        return runRetention();
      },
    },
  },
});
