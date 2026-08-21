import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { runMonthlyAccrualSystem } from "@/lib/leave-accruals.functions";

export const Route = createFileRoute("/api/public/hooks/leave-accrual")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const body = await request.json().catch(() => ({}));
          const now = new Date();
          const year = Number(body?.year) || now.getUTCFullYear();
          const month = Number(body?.month) || (now.getUTCMonth() + 1);
          const summary = await runMonthlyAccrualSystem(year, month);
          return new Response(JSON.stringify({ ok: true, year, month, ...summary }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("[leave-accrual] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
