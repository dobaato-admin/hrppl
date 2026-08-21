import { createFileRoute } from "@tanstack/react-router";
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
        if (error) return new Response(error.message, { status: 500 });

        const results: any[] = [];
        for (const t of tenants ?? []) {
          try {
            const r = await doReconcile(admin, t.id, 24);
            results.push({ tenant_id: t.id, ...r });
          } catch (e: any) {
            results.push({ tenant_id: t.id, error: e.message });
          }
        }
        return new Response(JSON.stringify({ ok: true, results }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
