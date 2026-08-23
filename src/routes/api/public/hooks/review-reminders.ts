import { createFileRoute } from "@tanstack/react-router";
import { hookFailure } from "@/lib/hook-response.server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth.server";

// Daily cron hits this route. For each active cycle in each tenant, finds reviews in
// states needing nudges (self-pending, manager-pending, acknowledgment-pending) and
// for each cycle pings org_admins about calibration when manager reviews are in.
// Rate-limited: at most one reminder every 3 days per review (24h for calibration digest).
export const Route = createFileRoute("/api/public/hooks/review-reminders")({
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
          const now = new Date();
          const todayIso = now.toISOString().slice(0, 10);
          const todayMonthDay = todayIso.slice(5); // MM-DD
          const dow = now.getUTCDay(); // 0=Sun .. 6=Sat
          const isWeekendToday = dow === 0 || dow === 6;

          // Per-country holiday cache: country_code -> boolean (today is holiday)
          const holidayCache = new Map<string, boolean>();
          async function isHolidayToday(countryCode: string | null | undefined) {
            if (!countryCode) return false;
            if (holidayCache.has(countryCode)) return holidayCache.get(countryCode)!;
            const { data } = await supabaseAdmin
              .from("public_holidays")
              .select("holiday_date,is_recurring")
              .eq("country_code", countryCode);
            const hit = ((data ?? []) as any[]).some((h) => {
              if (h.holiday_date === todayIso) return true;
              if (h.is_recurring && typeof h.holiday_date === "string"
                && h.holiday_date.slice(5) === todayMonthDay) return true;
              return false;
            });
            holidayCache.set(countryCode, hit);
            return hit;
          }

          // Tenant -> country lookup
          const tenantCountryCache = new Map<string, string | null>();
          async function tenantCountry(tenantId: string) {
            if (tenantCountryCache.has(tenantId)) return tenantCountryCache.get(tenantId)!;
            const { data } = await supabaseAdmin
              .from("tenants").select("country_code").eq("id", tenantId).maybeSingle();
            const cc = (data as any)?.country_code ?? null;
            tenantCountryCache.set(tenantId, cc);
            return cc;
          }

          async function isBusinessDayFor(tenantId: string) {
            if (isWeekendToday) return false;
            const cc = await tenantCountry(tenantId);
            return !(await isHolidayToday(cc));
          }

          let sent = 0;
          let inAppCreated = 0;

          // Active cycles only
          const { data: cycles } = await supabaseAdmin
            .from("review_cycles")
            .select("id,tenant_id,name,period_start,period_end,status,reminders_enabled,reminder_interval_days,reminder_start_offset_days,reminder_business_days_only,reminder_max_count")
            .eq("status", "active");

          // Cache user prefs to avoid re-fetching for each review
          const prefCache = new Map<string, any>();
          async function loadPref(userId: string) {
            if (prefCache.has(userId)) return prefCache.get(userId);
            const { data } = await supabaseAdmin
              .from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
            prefCache.set(userId, data ?? null);
            return data ?? null;
          }

          for (const cycle of (cycles ?? []) as any[]) {
            if (cycle.reminders_enabled === false) continue;
            // Cycle-level business-days gate (weekends + country holidays)
            if (cycle.reminder_business_days_only && !(await isBusinessDayFor(cycle.tenant_id))) continue;
            // Start offset (T+N days from period_start)
            if (cycle.period_start && cycle.reminder_start_offset_days > 0) {
              const startMs = new Date(cycle.period_start + "T00:00:00Z").getTime()
                + cycle.reminder_start_offset_days * DAY_MS;
              if (now.getTime() < startMs) continue;
            }

            const intervalDaysCycle: number = cycle.reminder_interval_days ?? 3;
            const maxCount: number | null = cycle.reminder_max_count ?? null;

            // Reviews needing self/manager/acknowledge reminders
            const { data: reviews } = await supabaseAdmin
              .from("performance_reviews")
              .select("id,tenant_id,employee_id,reviewer_id,status,last_reminder_at,reminder_count")
              .eq("cycle_id", cycle.id)
              .in("status", ["draft", "self_submitted", "finalized"]);

            for (const r of (reviews ?? []) as any[]) {
              if (maxCount != null && (r.reminder_count ?? 0) >= maxCount) continue;


              let kind: "self" | "manager" | "acknowledgment" | null = null;
              let targetUserId: string | null = null;
              let prefKey: string | null = null;
              if (r.status === "draft") {
                kind = "self";
                prefKey = "notify_review_self_pending";
                const { data: emp } = await supabaseAdmin
                  .from("employees").select("user_id").eq("id", r.employee_id).maybeSingle();
                targetUserId = (emp as any)?.user_id ?? null;
              } else if (r.status === "self_submitted") {
                kind = "manager";
                prefKey = "notify_review_manager_pending";
                targetUserId = r.reviewer_id;
              } else if (r.status === "finalized") {
                kind = "acknowledgment";
                prefKey = "notify_review_acknowledgment";
                const { data: emp } = await supabaseAdmin
                  .from("employees").select("user_id").eq("id", r.employee_id).maybeSingle();
                targetUserId = (emp as any)?.user_id ?? null;
              }
              if (!kind || !targetUserId) continue;

              // Per-user overrides
              const userPref = await loadPref(targetUserId);
              const userInterval: number | null = userPref?.review_reminder_min_interval_days ?? null;
              const userBizOnly: boolean = !!userPref?.review_reminder_business_days_only;
              if (userBizOnly && !(await isBusinessDayFor(r.tenant_id))) continue;

              const effectiveIntervalDays = Math.max(
                intervalDaysCycle,
                userInterval ?? 0,
              );
              if (r.last_reminder_at) {
                const sinceMs = now.getTime() - new Date(r.last_reminder_at).getTime();
                if (sinceMs < effectiveIntervalDays * DAY_MS) continue;
              }


              const { data: prof } = await supabaseAdmin
                .from("profiles").select("email,full_name").eq("id", targetUserId).maybeSingle();
              const { data: empRow } = await supabaseAdmin
                .from("employees").select("first_name,last_name").eq("id", r.employee_id).maybeSingle();
              const employeeName = empRow
                ? `${(empRow as any).first_name ?? ""} ${(empRow as any).last_name ?? ""}`.trim()
                : undefined;

              // In-app notification (always created so users see it even with email off)
              await supabaseAdmin.from("in_app_notifications" as any).insert({
                tenant_id: r.tenant_id,
                user_id: targetUserId,
                kind: `review_${kind}_pending`,
                title:
                  kind === "self" ? "Self-review pending"
                  : kind === "manager" ? `Review pending${employeeName ? ` for ${employeeName}` : ""}`
                  : "Acknowledge your finalized review",
                body: `Cycle: ${cycle.name}`,
                link: "/performance",
                metadata: { cycle_id: cycle.id, review_id: r.id, kind },
              } as any);
              inAppCreated += 1;

              // Email — respect preferences
              if ((prof as any)?.email) {
                await sendInternalEmail({
                  templateName: "review-reminder",
                  recipientEmail: (prof as any).email,
                  idempotencyKey: `review-reminder-${r.id}-${(r.reminder_count ?? 0) + 1}`,
                  preferenceKey: prefKey as any,
                  templateData: {
                    kind,
                    recipientName: (prof as any).full_name ?? undefined,
                    cycleName: cycle.name,
                    employeeName,
                    dueDate: cycle.period_end,
                  },
                });
                sent += 1;
              }

              await supabaseAdmin
                .from("performance_reviews")
                .update({
                  last_reminder_at: now.toISOString(),
                  reminder_count: (r.reminder_count ?? 0) + 1,
                } as any)
                .eq("id", r.id);
            }

            // Calibration digest — once per day per cycle to org_admins if there are
            // manager-submitted reviews waiting for calibration.
            const { count: awaitingCalibration } = await supabaseAdmin
              .from("performance_reviews")
              .select("id", { count: "exact", head: true })
              .eq("cycle_id", cycle.id)
              .eq("status", "manager_submitted");

            if ((awaitingCalibration ?? 0) > 0) {
              const { data: admins } = await supabaseAdmin
                .from("user_roles")
                .select("user_id")
                .in("role", ["org_admin", "super_admin"]);
              const adminIds = Array.from(new Set(((admins ?? []) as any[]).map((a) => a.user_id)));
              if (adminIds.length) {
                const { data: adminProfs } = await supabaseAdmin
                  .from("profiles")
                  .select("id,email,full_name,tenant_id")
                  .in("id", adminIds);
                for (const a of (adminProfs ?? []) as any[]) {
                  if (a.tenant_id && a.tenant_id !== cycle.tenant_id) continue;
                  await supabaseAdmin.from("in_app_notifications" as any).insert({
                    tenant_id: cycle.tenant_id,
                    user_id: a.id,
                    kind: "review_calibration_pending",
                    title: `${awaitingCalibration} review${awaitingCalibration === 1 ? "" : "s"} ready for calibration`,
                    body: `Cycle: ${cycle.name}`,
                    link: "/org/performance",
                    metadata: { cycle_id: cycle.id, count: awaitingCalibration },
                  } as any);
                  inAppCreated += 1;
                  if (a.email) {
                    await sendInternalEmail({
                      templateName: "review-reminder",
                      recipientEmail: a.email,
                      idempotencyKey: `review-calibration-${cycle.id}-${now.toISOString().slice(0, 10)}`,
                      preferenceKey: "notify_review_calibration" as any,
                      templateData: {
                        kind: "calibration",
                        recipientName: a.full_name ?? undefined,
                        cycleName: cycle.name,
                        dueDate: cycle.period_end,
                      },
                    });
                    sent += 1;
                  }
                }
              }
            }
          }

          return new Response(JSON.stringify({ ok: true, sent, inAppCreated }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        } catch (e: unknown) {
          return hookFailure("review-reminders", e);
        }
      },
    },
  },
});
