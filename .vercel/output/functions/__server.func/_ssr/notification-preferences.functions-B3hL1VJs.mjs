import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
const BOOL_COLUMNS = ["notify_leave_submitted", "notify_leave_decision", "notify_leave_cancelled", "notify_review_self_pending", "notify_review_manager_pending", "notify_review_acknowledgment", "notify_review_calibration", "notify_onboarding_overdue", "notify_onboarding_task", "notify_timesheet", "review_reminder_business_days_only"];
const getNotificationPreferences_createServerFn_handler = createServerRpc({
  id: "2b5dfb231c0dc54b0ab84412468065d222f8d3344fc10e785336ea2782d1bf27",
  name: "getNotificationPreferences",
  filename: "src/lib/notification-preferences.functions.ts"
}, (opts) => getNotificationPreferences.__executeServer(opts));
const getNotificationPreferences = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getNotificationPreferences_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
  const d = data ?? {};
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
    review_reminder_min_interval_days: d.review_reminder_min_interval_days ?? null,
    review_reminder_business_days_only: d.review_reminder_business_days_only ?? false
  };
});
const updateNotificationPreferences_createServerFn_handler = createServerRpc({
  id: "84e1b1e044857d5f61116fec8e7ddb247da6b777f1f970a1289518301a3a45ba",
  name: "updateNotificationPreferences",
  filename: "src/lib/notification-preferences.functions.ts"
}, (opts) => updateNotificationPreferences.__executeServer(opts));
const updateNotificationPreferences = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  notify_leave_submitted: booleanType().optional(),
  notify_leave_decision: booleanType().optional(),
  notify_leave_cancelled: booleanType().optional(),
  notify_review_self_pending: booleanType().optional(),
  notify_review_manager_pending: booleanType().optional(),
  notify_review_acknowledgment: booleanType().optional(),
  notify_review_calibration: booleanType().optional(),
  notify_onboarding_overdue: booleanType().optional(),
  notify_onboarding_task: booleanType().optional(),
  notify_timesheet: booleanType().optional(),
  review_reminder_business_days_only: booleanType().optional(),
  review_reminder_min_interval_days: numberType().int().min(1).max(60).nullable().optional()
}).parse(d)).handler(updateNotificationPreferences_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payload = {
    user_id: userId
  };
  for (const k of BOOL_COLUMNS) if (data[k] !== void 0) payload[k] = data[k];
  if (data.review_reminder_min_interval_days !== void 0) {
    payload.review_reminder_min_interval_days = data.review_reminder_min_interval_days;
  }
  const {
    error
  } = await supabase.from("notification_preferences").upsert(payload, {
    onConflict: "user_id"
  });
  if (error) throw new Error("Failed to update preferences");
  return {
    ok: true
  };
});
export {
  getNotificationPreferences_createServerFn_handler,
  updateNotificationPreferences_createServerFn_handler
};
