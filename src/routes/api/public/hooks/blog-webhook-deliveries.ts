import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";
import { createHmac } from "crypto";

// Cron-driven webhook dispatcher. Picks up pending/failed-retryable deliveries
// and POSTs them to subscriber URLs with HMAC-SHA256 signature.
export const Route = createFileRoute("/api/public/hooks/blog-webhook-deliveries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();
        const { data: deliveries } = await supabaseAdmin
          .from("blog_webhook_deliveries")
          .select("*")
          .in("status", ["pending", "retrying"])
          .lte("next_retry_at", now)
          .lt("attempts", 6)
          .limit(50);
        if (!deliveries?.length) return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
        const { data: hooks } = await supabaseAdmin.from("blog_webhooks").select("id,url,secret,active");
        const byId = new Map((hooks ?? []).map((h) => [h.id, h]));
        let processed = 0;
        for (const d of deliveries) {
          const hook = byId.get(d.webhook_id);
          if (!hook || !hook.active) {
            await supabaseAdmin.from("blog_webhook_deliveries").update({
              status: "skipped", last_attempted_at: now,
            }).eq("id", d.id);
            continue;
          }
          const bodyText = JSON.stringify(d.payload);
          const signature = createHmac("sha256", hook.secret).update(bodyText).digest("hex");
          let ok = false, respStatus: number | null = null, respBody = "";
          try {
            const r = await fetch(hook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-HRPPL-Event": String(d.event),
                "X-HRPPL-Signature": `sha256=${signature}`,
                "X-HRPPL-Delivery": String(d.id),
              },
              body: bodyText,
              signal: AbortSignal.timeout(10_000),
            });
            respStatus = r.status;
            respBody = (await r.text()).slice(0, 2000);
            ok = r.ok;
          } catch (err) {
            respBody = String((err as Error).message ?? err).slice(0, 2000);
          }
          const attempts = (d.attempts ?? 0) + 1;
          const status = ok ? "delivered" : attempts >= 6 ? "failed" : "retrying";
          const backoffMins = [1, 5, 15, 60, 240, 720][Math.min(attempts - 1, 5)];
          const next_retry_at = ok ? null : new Date(Date.now() + backoffMins * 60_000).toISOString();
          await supabaseAdmin.from("blog_webhook_deliveries").update({
            attempts, status, response_status: respStatus, response_body: respBody,
            last_attempted_at: now, next_retry_at,
          }).eq("id", d.id);
          processed++;
        }
        return new Response(JSON.stringify({ processed }), { status: 200 });
      },
    },
  },
});
