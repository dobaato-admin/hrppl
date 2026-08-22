import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { runMonthlyAccrualSystem } from "@/lib/leave-accruals.functions";

/**
 * Monthly leave accrual sweep.
 *
 * POST accepts an optional {year, month} body for backfills. GET takes no body and
 * always runs the current UTC period — that is the shape Vercel Cron uses, since it
 * issues a GET with `Authorization: Bearer $CRON_SECRET` and no request body.
 *
 * Running this daily is safe: runMonthlyAccrualImpl inserts into leave_accrual_log
 * keyed on period_key and treats a 23505 unique violation as "already accrued", so
 * repeat runs inside the same month skip rather than double-credit.
 */
async function runAccrual(year: number, month: number) {
  const summary = await runMonthlyAccrualSystem(year, month);
  return new Response(JSON.stringify({ ok: true, year, month, ...summary }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function failed(e: unknown) {
  console.error("[leave-accrual] failed", e);
  const message = e instanceof Error ? e.message : String(e);
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/hooks/leave-accrual")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) return unauthorized();
        try {
          const body = await request.json().catch(() => ({}));
          const now = new Date();
          const year = Number(body?.year) || now.getUTCFullYear();
          const month = Number(body?.month) || now.getUTCMonth() + 1;
          return await runAccrual(year, month);
        } catch (e: unknown) {
          return failed(e);
        }
      },
      // Vercel Cron entry point — GET only, no body.
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) return unauthorized();
        try {
          const now = new Date();
          return await runAccrual(now.getUTCFullYear(), now.getUTCMonth() + 1);
        } catch (e: unknown) {
          return failed(e);
        }
      },
    },
  },
});
