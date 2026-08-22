import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, E as recordType, z as stringType, F as anyType, B as enumType, C as numberType } from "../_libs/zod.mjs";
const EventType = enumType(["site_view", "job_view", "apply_start", "apply_submit"]);
const trackCareersEvent = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120),
  job_id: stringType().uuid().optional(),
  event_type: EventType,
  session_id: stringType().max(80).optional(),
  referrer: stringType().max(500).optional(),
  user_agent: stringType().max(500).optional(),
  metadata: recordType(stringType(), anyType()).optional()
}).parse(d)).handler(createSsrRpc("42d3e0a1777d41a78dcc6600255e69510ae86dc08fd86634c62cf6d6ce66d79c"));
const getCareersAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  days: numberType().int().min(1).max(365).default(30)
}).partial().parse(d ?? {})).handler(createSsrRpc("4a60a5f8bb3db34352b3f00ea34128a5f19f42dc0e04ee585fd0b3482ed3a077"));
export {
  getCareersAnalytics as g,
  trackCareersEvent as t
};
