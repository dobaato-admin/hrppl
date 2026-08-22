import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, B as enumType } from "../_libs/zod.mjs";
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
const Input = objectType({
  source: enumType(["onboarding", "offboarding"]),
  id: stringType().uuid(),
  includeArchive: booleanType().default(false)
});
function summarizeDiff(before, after) {
  const b = before && typeof before === "object" ? before : {};
  const a = after && typeof after === "object" ? after : {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(b), ...Object.keys(a)]);
  const out = [];
  for (const k of keys) {
    const bv = b[k];
    const av = a[k];
    const bs = JSON.stringify(bv);
    const as = JSON.stringify(av);
    if (bs === as) continue;
    if (bv === void 0) out.push({
      key: k,
      from: null,
      to: av,
      kind: "added"
    });
    else if (av === void 0) out.push({
      key: k,
      from: bv,
      to: null,
      kind: "removed"
    });
    else out.push({
      key: k,
      from: bv,
      to: av,
      kind: "changed"
    });
  }
  return out;
}
const getAuditDetail_createServerFn_handler = createServerRpc({
  id: "69999f72a81b4de818dd9a4661f95bb166df8c521bce4bce601ccd2d2e99db5b",
  name: "getAuditDetail",
  filename: "src/lib/audit-detail.functions.ts"
}, (opts) => getAuditDetail.__executeServer(opts));
const getAuditDetail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => Input.parse(d)).handler(getAuditDetail_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) throw new Error("No tenant scope");
  if (data.source === "onboarding") {
    const table = data.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
    const {
      data: row,
      error
    } = await supabase.from(table).select("*").eq("id", data.id).eq("tenant_id", me.tenant_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Audit entry not found.");
    const details = row.details ?? {};
    const before = details?.before ?? null;
    const after = details?.after ?? details ?? null;
    return {
      row,
      before,
      after,
      diff: summarizeDiff(before, after)
    };
  } else {
    const table = data.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";
    const {
      data: row,
      error
    } = await supabase.from(table).select("*").eq("id", data.id).eq("tenant_id", me.tenant_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Audit entry not found.");
    return {
      row,
      before: row.before ?? null,
      after: row.after ?? null,
      diff: summarizeDiff(row.before, row.after)
    };
  }
});
export {
  getAuditDetail_createServerFn_handler
};
