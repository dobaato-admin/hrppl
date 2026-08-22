import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
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
const listHolidayOverrideAudit_createServerFn_handler = createServerRpc({
  id: "d6f0c07183a83b2b3ddcfe1ff63683404163a04d558f4ab1103417468861b11e",
  name: "listHolidayOverrideAudit",
  filename: "src/lib/holiday-override-audit.functions.ts"
}, (opts) => listHolidayOverrideAudit.__executeServer(opts));
const listHolidayOverrideAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(listHolidayOverrideAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) return {
    rows: []
  };
  let q = supabase.from("employee_holiday_override_audit").select("id, employee_id, action, changed_by, changed_at, before_data, after_data, employee_overrides_before, employee_overrides_after").eq("tenant_id", prof.tenant_id).order("changed_at", {
    ascending: false
  }).limit(200);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const userIds = Array.from(new Set((rows ?? []).map((r) => r.changed_by).filter(Boolean)));
  let userMap = {};
  if (userIds.length) {
    const {
      data: profs
    } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
    for (const p of profs ?? []) userMap[p.id] = p.full_name || p.email || p.id;
  }
  return {
    rows: (rows ?? []).map((r) => ({
      ...r,
      changed_by_name: userMap[r.changed_by] ?? r.changed_by
    }))
  };
});
export {
  listHolidayOverrideAudit_createServerFn_handler
};
