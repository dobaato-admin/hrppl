import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, B as enumType, G as literalType } from "../_libs/zod.mjs";
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
async function assertSuperAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}
const listSecurityFindings_createServerFn_handler = createServerRpc({
  id: "84b76b421f303fd36d3d8516f553cae1c66717315aa2640e650c474426069888",
  name: "listSecurityFindings",
  filename: "src/lib/security-findings.functions.ts"
}, (opts) => listSecurityFindings.__executeServer(opts));
const listSecurityFindings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSecurityFindings_createServerFn_handler, async ({
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const {
    data,
    error
  } = await context.supabase.from("security_findings_log").select("*").order("scanned_at", {
    ascending: false
  }).limit(1e3);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.flatMap((r) => [r.resolved_by, r.recorded_by]).filter(Boolean)));
  let userMap = {};
  if (userIds.length) {
    const {
      supabaseAdmin
    } = await import("./client.server-D5ro3rAQ.mjs");
    const {
      data: profs
    } = await supabaseAdmin.from("profiles").select("user_id, email, full_name").in("user_id", userIds);
    userMap = Object.fromEntries((profs ?? []).map((p) => [p.user_id, p.full_name || p.email || p.user_id]));
  }
  return {
    findings: rows.map((r) => ({
      ...r,
      resolved_by_name: r.resolved_by ? userMap[r.resolved_by] ?? null : null,
      recorded_by_name: r.recorded_by ? userMap[r.recorded_by] ?? null : null
    }))
  };
});
const RecordSchema = objectType({
  scanner_name: stringType().min(1).max(80),
  internal_id: stringType().min(1).max(200),
  title: stringType().min(1).max(255),
  severity: enumType(["error", "warn", "info"]),
  status: enumType(["open", "fixed", "ignored", "accepted_risk"]).default("open"),
  description: stringType().max(8e3).optional(),
  remediation: stringType().max(8e3).optional(),
  scanned_at: stringType().optional()
});
const recordSecurityFinding_createServerFn_handler = createServerRpc({
  id: "55630717fb199814372660828ad3f15c4fe1d56499e6def30733cbfd09634f2c",
  name: "recordSecurityFinding",
  filename: "src/lib/security-findings.functions.ts"
}, (opts) => recordSecurityFinding.__executeServer(opts));
const recordSecurityFinding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RecordSchema.parse(d)).handler(recordSecurityFinding_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const {
    data: row,
    error
  } = await context.supabase.from("security_findings_log").insert({
    ...data,
    scanned_at: data.scanned_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    recorded_by: context.userId,
    resolved_at: data.status !== "open" ? (/* @__PURE__ */ new Date()).toISOString() : null,
    resolved_by: data.status !== "open" ? context.userId : null
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    finding: row
  };
});
const UpdateSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["open", "fixed", "ignored", "accepted_risk"]),
  remediation: stringType().max(8e3).optional(),
  ticket_url: stringType().url().max(500).optional().or(literalType("")),
  fixed_in_commit: stringType().max(500).optional().or(literalType(""))
});
const updateSecurityFindingStatus_createServerFn_handler = createServerRpc({
  id: "48eff560eb518d23570caa8ae0919e66e0b297193a894a546a7f0ebe69b501c5",
  name: "updateSecurityFindingStatus",
  filename: "src/lib/security-findings.functions.ts"
}, (opts) => updateSecurityFindingStatus.__executeServer(opts));
const updateSecurityFindingStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateSchema.parse(d)).handler(updateSecurityFindingStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.supabase, context.userId);
  const patch = {
    status: data.status
  };
  if (data.remediation !== void 0) patch.remediation = data.remediation;
  if (data.ticket_url !== void 0) patch.ticket_url = data.ticket_url || null;
  if (data.fixed_in_commit !== void 0) patch.fixed_in_commit = data.fixed_in_commit || null;
  if (data.status !== "open") {
    patch.resolved_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.resolved_by = context.userId;
  } else {
    patch.resolved_at = null;
    patch.resolved_by = null;
  }
  const {
    error
  } = await context.supabase.from("security_findings_log").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const countOpenHighSeverityFindings_createServerFn_handler = createServerRpc({
  id: "d940dd41ade46aca14a26c02992a9fe9c02a4433ad6aa71c9748f62fd2099049",
  name: "countOpenHighSeverityFindings",
  filename: "src/lib/security-findings.functions.ts"
}, (opts) => countOpenHighSeverityFindings.__executeServer(opts));
const countOpenHighSeverityFindings = createServerFn({
  method: "GET"
}).handler(countOpenHighSeverityFindings_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    count,
    error
  } = await supabaseAdmin.from("security_findings_log").select("id", {
    count: "exact",
    head: true
  }).eq("status", "open").eq("severity", "error");
  if (error) throw new Error(error.message);
  return {
    open_high_critical: count ?? 0
  };
});
export {
  countOpenHighSeverityFindings_createServerFn_handler,
  listSecurityFindings_createServerFn_handler,
  recordSecurityFinding_createServerFn_handler,
  updateSecurityFindingStatus_createServerFn_handler
};
