import { createFileRoute } from "@tanstack/react-router";
import { hookFailure, hookErrorRef } from "@/lib/hook-response.server";
import { doReconcile } from "@/lib/geofence-reconciliation.functions";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/hooks/geofence-reconciliation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response("unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as any;

        const { data: tenants, error } = await admin.from("tenants").select("id");
        if (error) return hookFailure("geofence-reconciliation", error);

        const results: any[] = [];
        for (const t of tenants ?? []) {
          try {
            const r = await doReconcile(admin, t.id, 24);
            results.push({ tenant_id: t.id, ...r });
          } catch (e: unknown) {
            // Per-tenant failures are surfaced as a correlation ref, not a
            // message — the array ships to the caller in the 200 body.
            results.push({ tenant_id: t.id, errorRef: hookErrorRef("geofence-reconciliation", e) });
          }
        }
        return new Response(JSON.stringify({ ok: true, results }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
