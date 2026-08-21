import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Called by pg_cron daily. Sends in-app notifications for overdue cases
// and approaching appeal deadlines. Idempotent per case per day via
// public.disciplinary_overdue_state.last_alert_date.
export const Route = createFileRoute("/api/public/hooks/discipline-due-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = new Date().toISOString().slice(0, 10);
        const in3 = new Date(); in3.setDate(in3.getDate() + 3);
        const horizon = in3.toISOString().slice(0, 10);

        // Cases that are overdue OR approaching appeal deadline
        const { data: cases } = await supabaseAdmin
          .from("disciplinary_cases")
          .select("id,tenant_id,case_number,assigned_to,employee_id,due_date,appeal_deadline,status,category")
          .not("status", "in", "(closed,withdrawn)");

        let sent = 0;
        for (const c of cases ?? []) {
          const overdue = c.due_date && c.due_date < today;
          const appealSoon = c.appeal_deadline && c.appeal_deadline >= today && c.appeal_deadline <= horizon;
          if (!overdue && !appealSoon) continue;

          const { data: state } = await supabaseAdmin
            .from("disciplinary_overdue_state").select("last_alert_date,alert_count").eq("case_id", c.id).maybeSingle();
          if (state?.last_alert_date === today) continue;

          const targets = [c.assigned_to].filter(Boolean) as string[];
          // Notify employee about their own appeal deadline window
          if (appealSoon) {
            const { data: emp } = await supabaseAdmin.from("employees").select("user_id").eq("id", c.employee_id).maybeSingle();
            if (emp?.user_id) targets.push(emp.user_id);
          }
          const unique = Array.from(new Set(targets));
          if (!unique.length) continue;

          const rows = unique.map((user_id) => ({
            tenant_id: c.tenant_id, user_id,
            kind: overdue ? "discipline_overdue" : "discipline_appeal_window",
            title: overdue ? "Disciplinary case overdue" : "Appeal window closing soon",
            body: overdue
              ? `Case ${c.case_number ?? c.id.slice(0,8)} passed its due date (${c.due_date}).`
              : `Appeal deadline for case ${c.case_number ?? c.id.slice(0,8)} is ${c.appeal_deadline}.`,
            link: "/admin/discipline",
            metadata: { case_id: c.id },
          }));
          await supabaseAdmin.from("in_app_notifications").insert(rows);

          await supabaseAdmin.from("disciplinary_overdue_state").upsert({
            case_id: c.id, tenant_id: c.tenant_id,
            last_alert_date: today, alert_count: (state?.alert_count ?? 0) + 1,
          });
          sent += rows.length;
        }
        return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
