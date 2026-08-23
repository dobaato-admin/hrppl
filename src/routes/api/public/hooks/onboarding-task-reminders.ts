import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Daily cron. Scans onboarding control-room tasks that are still open (pending or
// in_progress) and either due within the next 2 days or already overdue. Sends a
// reminder email to the assigned owner (and to the new hire's manager when no
// assignee), throttled to once every 24h per task.
export const Route = createFileRoute("/api/public/hooks/onboarding-task-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { sendInternalEmail } = await import("@/lib/email/send-internal.server");

          const DAY_MS = 86_400_000;
          const now = new Date();
          const todayIso = now.toISOString().slice(0, 10);
          const cutoffIso = new Date(now.getTime() + 2 * DAY_MS).toISOString().slice(0, 10);

          const { data: tasks } = await supabaseAdmin
            .from("onboarding_control_room_tasks")
            .select("id,assignment_id,assigned_to,owner_role,title,due_date,status,last_reminder_at")
            .in("status", ["pending", "in_progress"])
            .not("due_date", "is", null)
            .lte("due_date", cutoffIso);

          let sent = 0;
          for (const t of ((tasks ?? []) as any[])) {
            if (t.last_reminder_at) {
              const since = now.getTime() - new Date(t.last_reminder_at).getTime();
              if (since < DAY_MS) continue;
            }

            const due = new Date(t.due_date + "T00:00:00Z").getTime();
            const diffDays = Math.floor((due - now.getTime()) / DAY_MS);
            const isOverdue = due < now.getTime();

            const { data: a } = await supabaseAdmin
              .from("onboarding_assignments")
              .select("employee_id")
              .eq("id", t.assignment_id)
              .maybeSingle();
            if (!a?.employee_id) continue;

            const { data: emp } = await supabaseAdmin
              .from("employees")
              .select("first_name,last_name,email,manager_id")
              .eq("id", a.employee_id)
              .maybeSingle();
            if (!emp) continue;
            const employeeName = `${(emp as any).first_name ?? ""} ${(emp as any).last_name ?? ""}`.trim();

            // Resolve recipient
            const recipients = new Set<string>();
            if (t.assigned_to) {
              const { data: u } = await supabaseAdmin
                .from("profiles").select("email").eq("id", t.assigned_to).maybeSingle();
              if ((u as any)?.email) recipients.add((u as any).email);
            }
            // Fallback: manager when unassigned
            if (recipients.size === 0 && (emp as any).manager_id) {
              const { data: mgr } = await supabaseAdmin
                .from("employees").select("email").eq("id", (emp as any).manager_id).maybeSingle();
              if ((mgr as any)?.email) recipients.add((mgr as any).email);
            }
            // Self-task fallback to the new hire
            if (recipients.size === 0 && t.owner_role === "employee" && (emp as any).email) {
              recipients.add((emp as any).email);
            }
            if (recipients.size === 0) continue;

            for (const to of recipients) {
              await sendInternalEmail({
                templateName: "onboarding-task-reminder",
                recipientEmail: to,
                preferenceKey: "notify_onboarding_task",
                idempotencyKey: `onboarding-task-reminder-${t.id}-${todayIso}`,
                templateData: {
                  employeeName,
                  taskTitle: t.title,
                  ownerRole: t.owner_role,
                  dueDate: t.due_date,
                  daysUntilDue: Math.max(0, diffDays),
                  isOverdue,
                },
              });
              sent++;
            }

            await supabaseAdmin
              .from("onboarding_control_room_tasks")
              .update({ last_reminder_at: now.toISOString() })
              .eq("id", t.id);
          }

          return new Response(JSON.stringify({ ok: true, sent }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: unknown) {
          return hookFailure("onboarding-task-reminders", e);
        }
      },
    },
  },
});
