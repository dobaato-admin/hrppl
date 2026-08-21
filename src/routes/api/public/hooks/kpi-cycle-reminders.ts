import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

/**
 * Daily cron: for each open KPI review cycle that ends within
 * `reminder_days_before` days, send a reminder to every employee with
 * active duties who hasn't completed every self-review. Reminder is sent
 * at most once per day per cycle (guarded by `last_reminder_sent_at`).
 */
export const Route = createFileRoute("/api/public/hooks/kpi-cycle-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }


        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
        const admin = supabaseAdmin;

        const todayIso = new Date().toISOString().slice(0, 10);
        const todayStart = new Date(todayIso + "T00:00:00Z").toISOString();

        const { data: cycles } = await admin
          .from("kpi_review_cycles")
          .select("id, tenant_id, label, starts_on, ends_on, reminder_days_before, last_reminder_sent_at")
          .eq("status", "open");

        let totalSent = 0;
        const summary: any[] = [];

        for (const c of (cycles ?? []) as any[]) {
          // Skip if already reminded today
          if (c.last_reminder_sent_at && new Date(c.last_reminder_sent_at).toISOString() >= todayStart) continue;
          const ends = new Date(c.ends_on);
          const today = new Date(todayIso);
          const daysRemaining = Math.ceil((ends.getTime() - today.getTime()) / 86400000);
          if (daysRemaining < 0) continue;
          if (daysRemaining > Number(c.reminder_days_before ?? 3)) continue;

          // Recipients = employees in tenant with active duties.
          const { data: duties } = await admin
            .from("employee_duties")
            .select("employee_id, employees!inner(id, tenant_id, user_id, email, first_name)")
            .eq("tenant_id", c.tenant_id).eq("is_active", true);

          const byEmp = new Map<string, any>();
          for (const d of (duties ?? []) as any[]) {
            const e = d.employees;
            if (!e || byEmp.has(e.id)) continue;
            byEmp.set(e.id, e);
          }
          const employeeIds = Array.from(byEmp.keys());
          if (employeeIds.length === 0) continue;

          // Skip employees who already submitted self-scores for every duty.
          const { data: counts } = await admin
            .from("employee_duties").select("employee_id").eq("tenant_id", c.tenant_id).eq("is_active", true).in("employee_id", employeeIds);
          const totalByEmp = new Map<string, number>();
          for (const r of (counts ?? []) as any[]) totalByEmp.set(r.employee_id, (totalByEmp.get(r.employee_id) ?? 0) + 1);

          const { data: subs } = await admin
            .from("duty_review_scores")
            .select("employee_id").eq("tenant_id", c.tenant_id).eq("cycle_label", c.label).eq("submitter_kind", "self")
            .in("employee_id", employeeIds);
          const subByEmp = new Map<string, number>();
          for (const r of (subs ?? []) as any[]) subByEmp.set(r.employee_id, (subByEmp.get(r.employee_id) ?? 0) + 1);

          let sent = 0;
          const inAppRows: any[] = [];
          for (const [empId, emp] of byEmp) {
            const have = subByEmp.get(empId) ?? 0;
            const need = totalByEmp.get(empId) ?? 0;
            if (need > 0 && have >= need) continue; // already submitted everything

            if (emp.user_id) {
              inAppRows.push({
                tenant_id: c.tenant_id,
                user_id: emp.user_id,
                kind: "kpi_cycle_reminder",
                title: `Reminder: KPI self-review for ${c.label} (${daysRemaining}d left)`,
                body: `Submit your duty self-scores before ${c.ends_on}.`,
                link: "/me/duty-self-review",
                metadata: { cycle_id: c.id, cycle_label: c.label, days_remaining: daysRemaining },
              });
            }
            if (emp.email) {
              try {
                await sendInternalEmail({
                  templateName: "kpi-cycle-status",
                  recipientEmail: emp.email,
                  idempotencyKey: `kpi-${c.id}-reminder-${todayIso}-${emp.email}`,
                  templateData: {
                    kind: "reminder",
                    recipientName: emp.first_name || undefined,
                    cycleName: c.label,
                    startsOn: c.starts_on,
                    endsOn: c.ends_on,
                    daysRemaining,
                    appUrl: (process.env.PUBLIC_APP_URL || "https://hrppl.io") + "/me/duty-self-review",
                  },
                });
                sent += 1;
              } catch (e) {
                console.error("[kpi-cycle-reminders] email failed", e);
              }
            }
          }

          if (inAppRows.length) await admin.from("in_app_notifications" as any).insert(inAppRows as any);
          await admin.from("kpi_review_cycles").update({ last_reminder_sent_at: new Date().toISOString() }).eq("id", c.id);
          totalSent += sent;
          summary.push({ cycle: c.label, tenant_id: c.tenant_id, sent });
        }

        return new Response(JSON.stringify({ ok: true, totalSent, cycles: summary }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
