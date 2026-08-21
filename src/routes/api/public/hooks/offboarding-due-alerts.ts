import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Daily cron. Notifies HR owner / manager / employee about:
//  - Approaching last working day (within 7 days)
//  - Overdue blocking checklist items
//  - Pending asset returns not yet confirmed
// Idempotent per-day via offboarding_reminder_state.
export const Route = createFileRoute("/api/public/hooks/offboarding-due-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = new Date().toISOString().slice(0, 10);
        const in7 = new Date(); in7.setDate(in7.getDate() + 7);
        const horizon = in7.toISOString().slice(0, 10);

        const { data: cases } = await supabaseAdmin
          .from("offboarding_cases")
          .select("id,tenant_id,employee_id,manager_id,hr_owner_id,last_working_day,status,reason")
          .not("status", "in", "(completed,cancelled)");

        let sent = 0;
        for (const c of cases ?? []) {
          const { data: state } = await supabaseAdmin
            .from("offboarding_reminder_state")
            .select("last_alert_date,alert_count").eq("case_id", c.id).maybeSingle();
          if (state?.last_alert_date === today) continue;

          // Approaching / past LWD
          const lwd = c.last_working_day as string | null;
          const lwdSoon = lwd && lwd >= today && lwd <= horizon;
          const lwdOverdue = lwd && lwd < today;

          // Overdue blocking items
          const { data: overdueItems } = await supabaseAdmin
            .from("offboarding_checklist_items")
            .select("id,title,due_date,is_blocking,completed")
            .eq("case_id", c.id)
            .eq("completed", false)
            .eq("is_blocking", true)
            .lt("due_date", today);

          // Asset returns not yet confirmed
          const { data: pendingReturns } = await supabaseAdmin
            .from("asset_assignments")
            .select("id, return_status, assets:asset_id(name,asset_tag)")
            .eq("employee_id", c.employee_id)
            .is("return_confirmed_at", null)
            .neq("return_status", "confirmed");

          const flags: string[] = [];
          if (lwdSoon) flags.push(`Last working day ${lwd} approaching`);
          if (lwdOverdue) flags.push(`Last working day ${lwd} has passed`);
          if ((overdueItems ?? []).length) flags.push(`${overdueItems!.length} overdue blocking task(s)`);
          if ((pendingReturns ?? []).length) flags.push(`${pendingReturns!.length} asset return(s) pending confirmation`);
          if (!flags.length) continue;

          const { data: emp } = await supabaseAdmin.from("employees").select("user_id").eq("id", c.employee_id).maybeSingle();
          const targets = new Set<string>();
          if (c.hr_owner_id) targets.add(c.hr_owner_id);
          if (c.manager_id) targets.add(c.manager_id);
          if (emp?.user_id) targets.add(emp.user_id);
          if (!targets.size) continue;

          const body = flags.join(" • ");
          const rows = Array.from(targets).map((user_id) => ({
            tenant_id: c.tenant_id, user_id,
            kind: "offboarding_reminder",
            title: lwdOverdue ? "Offboarding overdue" : "Offboarding reminder",
            body,
            link: "/admin/offboarding",
            metadata: { case_id: c.id, last_working_day: lwd, overdue_items: overdueItems?.length ?? 0, pending_returns: pendingReturns?.length ?? 0 },
          }));
          await supabaseAdmin.from("in_app_notifications").insert(rows);

          await supabaseAdmin.from("offboarding_reminder_state").upsert({
            case_id: c.id, tenant_id: c.tenant_id,
            last_alert_date: today, alert_count: (state?.alert_count ?? 0) + 1,
            updated_at: new Date().toISOString(),
          });
          sent += rows.length;
        }
        return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
