/**
 * Daily cron: sends reminders for missing attestation/evidence on onboarding
 * control-room tasks AND for unverified offboarding comms-removal channels.
 * Honours per-step reminder_interval_days; escalates to the line manager
 * after escalate_after_days. Emits an in-app notification + email per recipient
 * and bumps last_reminder_at + reminder_count so we never double-send.
 */
import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/hooks/compliance-attestation-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        try {
          const url = new URL(request.url);
          // Optional override: ?hour=9 forces a specific local hour; otherwise
          // each tenant's configured reminder_local_hour gates work.
          const forceHour = url.searchParams.get("hour");
          const targetHour = forceHour !== null ? Number(forceHour) : null;

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          let onboardingSent = 0;
          let offboardingSent = 0;
          let tenantsConsidered = 0;

          // Per-tenant timezone gate: only tenants whose local hour matches
          // their configured reminder_local_hour receive notifications this run.
          const { data: dueTenants, error: tzErr } = await supabaseAdmin.rpc(
            "tenants_due_for_reminder_now",
            targetHour !== null ? { _target_hour: targetHour } : {},
          );

          if (tzErr) throw new Error(tzErr.message);
          const allowedTenantIds = new Set<string>((dueTenants ?? []).map((t: any) => t.tenant_id));
          tenantsConsidered = allowedTenantIds.size;
          if (allowedTenantIds.size === 0) {
            return new Response(JSON.stringify({ ok: true, skipped: "no tenants in their local reminder hour" }), {
              status: 200, headers: { "Content-Type": "application/json" },
            });
          }

          let sendInternalEmail: any = null;
          try {
            const mod: any = await import("@/lib/email/send-internal.server");
            sendInternalEmail = mod.sendInternalEmail;
          } catch { /* email infra not present yet */ }

          const recordLog = async (tenant_id: string, scope: string, ref_id: string, user_id: string | null, channel: string, escalated: boolean) => {
            await supabaseAdmin.from("compliance_reminder_log").insert({ tenant_id, scope, ref_id, user_id, channel, escalated });
          };
          const notify = async (user_id: string | null, tenant_id: string, title: string, body: string, link: string) => {
            if (!user_id) return;
            await supabaseAdmin.from("in_app_notifications").insert({ user_id, tenant_id, kind: "attestation_reminder", title, body, link });
          };

          // -------- Onboarding tracker / control-room attestation reminders --------
          const { data: onbRows } = await supabaseAdmin.rpc("list_onboarding_tasks_due_reminder");
          for (const row of (onbRows ?? []) as any[]) {
            if (!allowedTenantIds.has(row.tenant_id)) continue;

            const link = `/org/onboarding/control-room/${row.assignment_id}`;
            const title = row.escalate ? `Escalated: ${row.title} overdue ${row.days_overdue}d` : `Reminder: ${row.title} due`;
            const body = row.escalate
              ? `This onboarding step is ${row.days_overdue} days overdue and has been escalated to the line manager.`
              : `Please complete this onboarding step (attestation or evidence is still missing).`;

            // Primary assignee
            await notify(row.assignee_user_id, row.tenant_id, title, body, link);
            await recordLog(row.tenant_id, "onboarding_task", row.task_id, row.assignee_user_id, "in_app", row.escalate);

            // Email primary assignee
            if (sendInternalEmail && row.assignee_user_id) {
              const { data: u } = await supabaseAdmin.from("profiles").select("email").eq("id", row.assignee_user_id).maybeSingle();
              if ((u as any)?.email) {
                try {
                  await sendInternalEmail({ to: (u as any).email, subject: title, html: `<p>${body}</p><p><a href="${link}">Open task</a></p>` });
                  await recordLog(row.tenant_id, "onboarding_task", row.task_id, row.assignee_user_id, "email", row.escalate);
                } catch { /* swallow per-row */ }
              }
            }

            // Escalation: manager
            if (row.escalate) {
              const { data: emp } = await supabaseAdmin.from("employees").select("manager_id").eq("id", row.employee_id).maybeSingle();
              if ((emp as any)?.manager_id) {
                const { data: mgr } = await supabaseAdmin.from("employees").select("user_id, email").eq("id", (emp as any).manager_id).maybeSingle();
                if ((mgr as any)?.user_id) {
                  await notify((mgr as any).user_id, row.tenant_id, `[Escalation] ${title}`, body, link);
                  await recordLog(row.tenant_id, "onboarding_task", row.task_id, (mgr as any).user_id, "in_app", true);
                }
                if (sendInternalEmail && (mgr as any)?.email) {
                  try {
                    await sendInternalEmail({ to: (mgr as any).email, subject: `[Escalation] ${title}`, html: `<p>${body}</p><p><a href="${link}">Open task</a></p>` });
                    await recordLog(row.tenant_id, "onboarding_task", row.task_id, (mgr as any).user_id ?? null, "email", true);
                  } catch { /* */ }
                }
              }
            }

            await supabaseAdmin.from("onboarding_control_room_tasks").update({
              last_reminder_at: new Date().toISOString(),
              reminder_count: ((row as any).reminder_count ?? 0) + 1,
            }).eq("id", row.task_id);
            onboardingSent++;
          }

          // -------- Offboarding comms-removal reminders --------
          const { data: offRows } = await supabaseAdmin.rpc("list_offboarding_comms_due_reminder");
          for (const row of (offRows ?? []) as any[]) {
            if (!allowedTenantIds.has(row.tenant_id)) continue;
            const { data: c } = await supabaseAdmin.from("offboarding_cases").select("hr_owner_id, manager_id, employee_id").eq("id", row.case_id).maybeSingle();

            const link = `/admin/offboarding?case=${row.case_id}`;
            const title = row.escalate
              ? `Escalated: ${row.channel_label} removal overdue ${row.days_overdue}d`
              : `Reminder: verify ${row.channel_label} removal`;
            const body = `Offboarding case requires evidence + attestation that the employee was removed from ${row.channel_label}.`;

            const recipients = new Set<string>();
            if ((c as any)?.hr_owner_id) recipients.add((c as any).hr_owner_id);
            if (row.escalate && (c as any)?.manager_id) recipients.add((c as any).manager_id);

            for (const uid of recipients) {
              await notify(uid, row.tenant_id, title, body, link);
              await recordLog(row.tenant_id, "offboarding_comms", row.row_id, uid, "in_app", row.escalate);
              if (sendInternalEmail) {
                const { data: u } = await supabaseAdmin.from("profiles").select("email").eq("id", uid).maybeSingle();
                if ((u as any)?.email) {
                  try {
                    await sendInternalEmail({ to: (u as any).email, subject: title, html: `<p>${body}</p><p><a href="${link}">Open case</a></p>` });
                    await recordLog(row.tenant_id, "offboarding_comms", row.row_id, uid, "email", row.escalate);
                  } catch { /* */ }
                }
              }
            }

            await supabaseAdmin.from("offboarding_comms_removal").update({
              last_reminder_at: new Date().toISOString(),
              reminder_count: ((row as any).reminder_count ?? 0) + 1,
            }).eq("id", row.row_id);
            offboardingSent++;
          }

          return new Response(JSON.stringify({ ok: true, onboardingSent, offboardingSent, tenantsConsidered }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });

        } catch (e: unknown) {
          return hookFailure("compliance-attestation-reminders", e);
        }
      },
    },
  },
});
