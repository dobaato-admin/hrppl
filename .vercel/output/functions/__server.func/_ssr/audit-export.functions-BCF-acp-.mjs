import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { z as stringType, a as objectType } from "../_libs/zod.mjs";
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
const DateStr = stringType().regex(/^\d{4}-\d{2}-\d{2}$/);
const RangeInput = objectType({
  start_date: DateStr.optional(),
  end_date: DateStr.optional(),
  assignment_id: stringType().uuid().optional(),
  variation_id: stringType().uuid().optional()
}).partial();
function csvEscape(v) {
  if (v === null || v === void 0) return "";
  const s = typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCsv(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => csvEscape(r[c.key])).join(","));
  return [header, ...body].join("\n");
}
const exportOnboardingAuditCsv_createServerFn_handler = createServerRpc({
  id: "5409fc3027ce24907be574a7969ee418767984441830ecf7309ae9532dbecf89",
  name: "exportOnboardingAuditCsv",
  filename: "src/lib/audit-export.functions.ts"
}, (opts) => exportOnboardingAuditCsv.__executeServer(opts));
const exportOnboardingAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RangeInput.parse(d ?? {})).handler(exportOnboardingAuditCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("onboarding_control_room_audit").select("created_at, action, actor_name, actor_email, assignment_id, task_id, details").order("created_at", {
    ascending: false
  }).limit(5e3);
  if (data.assignment_id) q = q.eq("assignment_id", data.assignment_id);
  if (data.start_date) q = q.gte("created_at", `${data.start_date}T00:00:00Z`);
  if (data.end_date) q = q.lte("created_at", `${data.end_date}T23:59:59Z`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const csv = toCsv(rows ?? [], [{
    key: "created_at",
    label: "Timestamp (UTC)"
  }, {
    key: "action",
    label: "Action"
  }, {
    key: "actor_name",
    label: "Actor name"
  }, {
    key: "actor_email",
    label: "Actor email"
  }, {
    key: "assignment_id",
    label: "Assignment ID"
  }, {
    key: "task_id",
    label: "Task ID"
  }, {
    key: "details",
    label: "Details"
  }]);
  return {
    csv,
    count: rows?.length ?? 0
  };
});
const exportVariationAuditCsv_createServerFn_handler = createServerRpc({
  id: "834dedec00b486acfdf6c5f83f7826440c95170f7a99a65803d23334955bcf2e",
  name: "exportVariationAuditCsv",
  filename: "src/lib/audit-export.functions.ts"
}, (opts) => exportVariationAuditCsv.__executeServer(opts));
const exportVariationAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RangeInput.parse(d ?? {})).handler(exportVariationAuditCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("employment_variation_audit").select("created_at, action, actor_name, actor_email, variation_id, details").order("created_at", {
    ascending: false
  }).limit(5e3);
  if (data.variation_id) q = q.eq("variation_id", data.variation_id);
  if (data.start_date) q = q.gte("created_at", `${data.start_date}T00:00:00Z`);
  if (data.end_date) q = q.lte("created_at", `${data.end_date}T23:59:59Z`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const csv = toCsv(rows ?? [], [{
    key: "created_at",
    label: "Timestamp (UTC)"
  }, {
    key: "action",
    label: "Action"
  }, {
    key: "actor_name",
    label: "Actor name"
  }, {
    key: "actor_email",
    label: "Actor email"
  }, {
    key: "variation_id",
    label: "Variation ID"
  }, {
    key: "details",
    label: "Details"
  }]);
  return {
    csv,
    count: rows?.length ?? 0
  };
});
export {
  exportOnboardingAuditCsv_createServerFn_handler,
  exportVariationAuditCsv_createServerFn_handler
};
