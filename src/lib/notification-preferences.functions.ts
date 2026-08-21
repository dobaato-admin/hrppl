import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const BOOL_COLUMNS = [
  "notify_leave_submitted",
  "notify_leave_decision",
  "notify_leave_cancelled",
  "notify_review_self_pending",
  "notify_review_manager_pending",
  "notify_review_acknowledgment",
  "notify_review_calibration",
  "notify_onboarding_overdue",
  "notify_onboarding_task",
  "notify_timesheet",
  "review_reminder_business_days_only",
] as const;

export type PreferenceKey = typeof BOOL_COLUMNS[number] | "review_reminder_min_interval_days";

export const getNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const d: any = data ?? {};
    return {
      notify_leave_submitted: d.notify_leave_submitted ?? true,
      notify_leave_decision: d.notify_leave_decision ?? true,
      notify_leave_cancelled: d.notify_leave_cancelled ?? true,
      notify_review_self_pending: d.notify_review_self_pending ?? true,
      notify_review_manager_pending: d.notify_review_manager_pending ?? true,
      notify_review_acknowledgment: d.notify_review_acknowledgment ?? true,
      notify_review_calibration: d.notify_review_calibration ?? true,
      notify_onboarding_overdue: d.notify_onboarding_overdue ?? true,
      notify_onboarding_task: d.notify_onboarding_task ?? true,
      notify_timesheet: d.notify_timesheet ?? true,
      review_reminder_min_interval_days: (d.review_reminder_min_interval_days ?? null) as number | null,
      review_reminder_business_days_only: d.review_reminder_business_days_only ?? false,
    };
  });

export const updateNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      notify_leave_submitted: z.boolean().optional(),
      notify_leave_decision: z.boolean().optional(),
      notify_leave_cancelled: z.boolean().optional(),
      notify_review_self_pending: z.boolean().optional(),
      notify_review_manager_pending: z.boolean().optional(),
      notify_review_acknowledgment: z.boolean().optional(),
      notify_review_calibration: z.boolean().optional(),
      notify_onboarding_overdue: z.boolean().optional(),
      notify_onboarding_task: z.boolean().optional(),
      notify_timesheet: z.boolean().optional(),
      review_reminder_business_days_only: z.boolean().optional(),
      review_reminder_min_interval_days: z.number().int().min(1).max(60).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload: Record<string, any> = { user_id: userId };
    for (const k of BOOL_COLUMNS) if ((data as any)[k] !== undefined) payload[k] = (data as any)[k];
    if ((data as any).review_reminder_min_interval_days !== undefined) {
      payload.review_reminder_min_interval_days = (data as any).review_reminder_min_interval_days;
    }
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error("Failed to update preferences");
    return { ok: true };
  });
