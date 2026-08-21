import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { runCarryOverSystem } from "@/lib/leave-accruals.functions";

export const Route = createFileRoute("/api/public/hooks/leave-carry-over")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const body = await request.json().catch(() => ({}));
          const fromYear = Number(body?.fromYear) || (new Date().getUTCFullYear() - 1);
          const summary = await runCarryOverSystem(fromYear);
          return new Response(JSON.stringify({ ok: true, fromYear, ...summary }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("[leave-carry-over] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
