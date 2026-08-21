import { createFileRoute } from "@tanstack/react-router";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Daily cron: nudges employees whose review instances are due within 3 days
// (or overdue) and approvers when scorecards are submitted but awaiting decision.
// Rate-limited to one reminder every 2 days per instance via reminder_sent_at.
export const Route = createFileRoute("/api/public/hooks/review-instance-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401, headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { sendInternalEmail } = await import("@/lib/email/send-internal.server");

          const DAY_MS = 86_400_000;
          const now = new Date();
          const horizon = new Date(now.getTime() + 3 * DAY_MS).toISOString().slice(0, 10);

          // Pending instances approaching due date or already overdue
          const { data: pending } = await supabaseAdmin
            .from("review_instances" as any)
            .select("id,tenant_id,template_id,item_id,employee_id,due_date,scheduled_for,period_label,reminder_sent_at,reminder_count,status")
            .eq("status", "pending")
            .lte("due_date", horizon);

          // Submitted instances waiting on an approver
          const { data: submitted } = await supabaseAdmin
            .from("review_instances" as any)
            .select("id,tenant_id,template_id,item_id,employee_id,due_date,scheduled_for,period_label,reminder_sent_at,reminder_count,status")
            .eq("status", "submitted");

          let emailSent = 0;
          let inAppCreated = 0;

          const tplCache = new Map<string, any>();
          async function getTpl(id: string) {
            if (tplCache.has(id)) return tplCache.get(id);
            const { data } = await supabaseAdmin.from("review_templates" as any)
              .select("id,name,competencies").eq("id", id).maybeSingle();
            tplCache.set(id, data); return data;
          }

          async function notify(inst: any, recipientUserId: string, kind: "employee" | "approver") {
            const sinceMs = inst.reminder_sent_at
              ? now.getTime() - new Date(inst.reminder_sent_at).getTime() : Infinity;
            if (sinceMs < 2 * DAY_MS) return;

            const tpl = await getTpl(inst.template_id);
            const comp = ((tpl as any)?.competencies ?? []).find((c: any) => c.id === inst.item_id);
            const itemLabel = comp?.label ?? inst.item_id;
            const dueLabel = inst.due_date ?? inst.scheduled_for;
            const overdue = inst.due_date && inst.due_date < now.toISOString().slice(0, 10);

            const title = kind === "employee"
              ? (overdue ? `Overdue scorecard: ${itemLabel}` : `Scorecard due soon: ${itemLabel}`)
              : `Awaiting your review: ${itemLabel}`;
            const body = kind === "employee"
              ? `${tpl?.name ?? "Review"} • ${inst.period_label} • Due ${dueLabel}`
              : `${tpl?.name ?? "Review"} • ${inst.period_label} • Submitted by employee`;

            await supabaseAdmin.from("in_app_notifications" as any).insert({
              tenant_id: inst.tenant_id,
              user_id: recipientUserId,
              kind: kind === "employee" ? "review_instance_due" : "review_instance_awaiting_approval",
              title, body,
              link: kind === "employee" ? "/me/reviews" : "/admin/review-analytics",
              metadata: { instance_id: inst.id, template_id: inst.template_id, item_id: inst.item_id, overdue },
            } as any);
            inAppCreated += 1;

            const { data: prof } = await supabaseAdmin
              .from("profiles").select("email,full_name").eq("id", recipientUserId).maybeSingle();
            if ((prof as any)?.email) {
              await sendInternalEmail({
                templateName: "review-reminder",
                recipientEmail: (prof as any).email,
                idempotencyKey: `ri-${inst.id}-${(inst.reminder_count ?? 0) + 1}-${kind}`,
                templateData: {
                  kind: kind === "employee" ? "self" : "manager",
                  recipientName: (prof as any).full_name ?? undefined,
                  cycleName: `${tpl?.name ?? "Review"} — ${itemLabel}`,
                  dueDate: dueLabel,
                },
              });
              emailSent += 1;
            }

            await supabaseAdmin.from("review_instances" as any)
              .update({
                reminder_sent_at: now.toISOString(),
                reminder_count: (inst.reminder_count ?? 0) + 1,
              })
              .eq("id", inst.id);
          }

          for (const inst of ((pending ?? []) as any[])) {
            const { data: emp } = await supabaseAdmin
              .from("employees").select("user_id").eq("id", inst.employee_id).maybeSingle();
            const uid = (emp as any)?.user_id;
            if (uid) await notify(inst, uid, "employee");
          }

          // Notify org_admins + managers per tenant for awaiting approvals
          const adminCache = new Map<string, string[]>();
          async function getApprovers(tenantId: string) {
            if (adminCache.has(tenantId)) return adminCache.get(tenantId)!;
            const { data: roles } = await supabaseAdmin
              .from("user_roles").select("user_id,role").in("role", ["org_admin", "manager"]);
            const ids = (roles ?? []).map((r: any) => r.user_id);
            const { data: profs } = ids.length
              ? await supabaseAdmin.from("profiles").select("id").eq("tenant_id", tenantId).in("id", ids)
              : { data: [] as any[] };
            const list = ((profs as any) ?? []).map((p: any) => p.id);
            adminCache.set(tenantId, list); return list;
          }

          for (const inst of ((submitted ?? []) as any[])) {
            const approvers = await getApprovers(inst.tenant_id);
            for (const uid of approvers) await notify(inst, uid, "approver");
          }

          return new Response(JSON.stringify({ ok: true, emailSent, inAppCreated }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ ok: false, error: e.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
