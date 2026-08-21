import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Daily cron. For each in-progress onboarding assignment with a due date in the past,
// send an overdue reminder to the employee and to their manager. Rate-limited to once
// every 3 days per assignment via onboarding_assignments.last_reminder_at.
export const Route = createFileRoute("/api/public/hooks/onboarding-overdue-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { sendInternalEmail } = await import("@/lib/email/send-internal.server");

          const DAY_MS = 24 * 60 * 60 * 1000;
          const INTERVAL_DAYS = 3;
          const now = new Date();
          const todayIso = now.toISOString().slice(0, 10);

          let sent = 0;
          let inAppCreated = 0;

          const { data: assignments } = await supabaseAdmin
            .from("onboarding_assignments")
            .select("id,tenant_id,employee_id,checklist_id,due_date,status,signed_off_at,last_reminder_at,reminder_count")
            .eq("status", "in_progress")
            .is("signed_off_at", null)
            .not("due_date", "is", null)
            .lt("due_date", todayIso);

          for (const a of ((assignments ?? []) as any[])) {
            // Throttle
            if (a.last_reminder_at) {
              const since = now.getTime() - new Date(a.last_reminder_at).getTime();
              if (since < INTERVAL_DAYS * DAY_MS) continue;
            }

            const { data: emp } = await supabaseAdmin
              .from("employees")
              .select("id,user_id,first_name,last_name,manager_id")
              .eq("id", a.employee_id)
              .maybeSingle();
            if (!emp) continue;
            const employeeName = `${(emp as any).first_name ?? ""} ${(emp as any).last_name ?? ""}`.trim() || undefined;

            const { data: checklist } = await supabaseAdmin
              .from("onboarding_checklists")
              .select("name")
              .eq("id", a.checklist_id)
              .maybeSingle();
            const checklistName: string | undefined = (checklist as any)?.name;

            const dueDate: string = a.due_date;
            const daysOverdue = Math.max(
              0,
              Math.floor((now.getTime() - new Date(dueDate + "T00:00:00Z").getTime()) / DAY_MS),
            );

            // ---- Employee reminder ----
            if ((emp as any).user_id) {
              await supabaseAdmin.from("in_app_notifications" as any).insert({
                tenant_id: a.tenant_id,
                user_id: (emp as any).user_id,
                kind: "onboarding_overdue",
                title: "Onboarding task overdue",
                body: checklistName ? `Checklist: ${checklistName}` : "An onboarding task is overdue.",
                link: "/onboarding",
                metadata: { assignment_id: a.id, checklist_id: a.checklist_id, due_date: dueDate, days_overdue: daysOverdue },
              } as any);
              inAppCreated += 1;

              const { data: prof } = await supabaseAdmin
                .from("profiles").select("email,full_name").eq("id", (emp as any).user_id).maybeSingle();
              if ((prof as any)?.email) {
                await sendInternalEmail({
                  templateName: "onboarding-overdue",
                  recipientEmail: (prof as any).email,
                  idempotencyKey: `onboarding-overdue-emp-${a.id}-${(a.reminder_count ?? 0) + 1}`,
                  preferenceKey: "notify_onboarding_overdue",
                  templateData: {
                    audience: "employee",
                    recipientName: (prof as any).full_name ?? undefined,
                    employeeName,
                    checklistName,
                    dueDate,
                    daysOverdue,
                  },
                });
                sent += 1;
              }
            }

            // ---- Manager reminder ----
            if ((emp as any).manager_id) {
              const { data: mgr } = await supabaseAdmin
                .from("employees")
                .select("user_id,first_name,last_name")
                .eq("id", (emp as any).manager_id)
                .maybeSingle();
              const mgrUserId = (mgr as any)?.user_id;
              if (mgrUserId) {
                await supabaseAdmin.from("in_app_notifications" as any).insert({
                  tenant_id: a.tenant_id,
                  user_id: mgrUserId,
                  kind: "onboarding_overdue_manager",
                  title: `Onboarding overdue${employeeName ? `: ${employeeName}` : ""}`,
                  body: checklistName ? `Checklist: ${checklistName}` : "A direct report's onboarding task is overdue.",
                  link: "/org/onboarding",
                  metadata: { assignment_id: a.id, employee_id: a.employee_id, checklist_id: a.checklist_id, due_date: dueDate, days_overdue: daysOverdue },
                } as any);
                inAppCreated += 1;

                const { data: mgrProf } = await supabaseAdmin
                  .from("profiles").select("email,full_name").eq("id", mgrUserId).maybeSingle();
                if ((mgrProf as any)?.email) {
                  await sendInternalEmail({
                    templateName: "onboarding-overdue",
                    recipientEmail: (mgrProf as any).email,
                    idempotencyKey: `onboarding-overdue-mgr-${a.id}-${(a.reminder_count ?? 0) + 1}`,
                    preferenceKey: "notify_onboarding_overdue",
                    templateData: {
                      audience: "manager",
                      recipientName: (mgrProf as any).full_name ?? undefined,
                      employeeName,
                      checklistName,
                      dueDate,
                      daysOverdue,
                    },
                  });
                  sent += 1;
                }
              }
            }

            await supabaseAdmin
              .from("onboarding_assignments")
              .update({
                last_reminder_at: now.toISOString(),
                reminder_count: (a.reminder_count ?? 0) + 1,
              } as any)
              .eq("id", a.id);
          }

          return new Response(
            JSON.stringify({ ok: true, processed: (assignments ?? []).length, emailsSent: sent, inAppCreated }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (e: any) {
          console.error("onboarding-overdue-reminders error", e);
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
