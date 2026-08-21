import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/hooks/feedback-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const today = new Date().toISOString().slice(0, 10);
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: pending } = await supabaseAdmin
            .from("review_feedback_requests")
            .select("id,due_date,reminder_count,last_reminder_at")
            .eq("status", "pending");
          let bumped = 0;
          for (const r of (pending ?? []) as any[]) {
            const ok = !r.due_date || r.due_date <= today;
            if (!ok) continue;
            if (r.last_reminder_at && r.last_reminder_at > cutoff) continue;
            const { error } = await supabaseAdmin
              .from("review_feedback_requests")
              .update({
                last_reminder_at: new Date().toISOString(),
                reminder_count: (r.reminder_count ?? 0) + 1,
              })
              .eq("id", r.id);
            if (!error) bumped += 1;
          }
          return new Response(JSON.stringify({ ok: true, reminded: bumped }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("[feedback-reminders] failed", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
