import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { e as enforceRateLimit, v as validateEvidenceUrl, C as CSV_MAX_ROWS } from "./rate-limit.functions-CFVeXiWs.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, B as enumType } from "../_libs/zod.mjs";
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
const listCommsRemoval_createServerFn_handler = createServerRpc({
  id: "c9f805d45d3e154e1e767cf4bdd15bbf7b164d2494a0b25d87c8f051571bee4e",
  name: "listCommsRemoval",
  filename: "src/lib/offboarding-comms.functions.ts"
}, (opts) => listCommsRemoval.__executeServer(opts));
const listCommsRemoval = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid()
}).parse(d)).handler(listCommsRemoval_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("offboarding_comms_removal").select("*").eq("case_id", data.caseId).order("is_mandatory", {
    ascending: false
  }).order("channel_label");
  if (error) throw new Error(error.message);
  const total = (rows ?? []).length;
  const verified = (rows ?? []).filter((r) => r.removed && r.attested_at).length;
  return {
    rows: rows ?? [],
    total,
    verified,
    complete: total > 0 && verified === total
  };
});
const updateCommsRemoval_createServerFn_handler = createServerRpc({
  id: "07fa5ac2761abe5c6217fa395ab0fc1612414652211b10c693020811c07ed840",
  name: "updateCommsRemoval",
  filename: "src/lib/offboarding-comms.functions.ts"
}, (opts) => updateCommsRemoval.__executeServer(opts));
const updateCommsRemoval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  removed: booleanType(),
  evidence_url: stringType().url().max(1e3).optional().nullable(),
  attestation_signature: stringType().trim().max(200).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable(),
  due_date: stringType().optional().nullable(),
  reminder_interval_days: numberType().int().min(1).max(30).optional(),
  escalate_after_days: numberType().int().min(1).max(60).optional()
}).parse(d)).handler(updateCommsRemoval_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "comms_evidence_update", 60, 60);
  if (data.evidence_url) validateEvidenceUrl(data.evidence_url);
  const patch = {
    removed: data.removed,
    removed_at: data.removed ? (/* @__PURE__ */ new Date()).toISOString() : null,
    evidence_url: data.evidence_url ?? null,
    notes: data.notes ?? null
  };
  if (data.due_date !== void 0) patch.due_date = data.due_date ?? null;
  if (data.reminder_interval_days !== void 0) patch.reminder_interval_days = data.reminder_interval_days;
  if (data.escalate_after_days !== void 0) patch.escalate_after_days = data.escalate_after_days;
  if (data.attestation_signature) {
    patch.attestation_signature = data.attestation_signature;
    patch.attested_by = userId;
    patch.attested_at = (/* @__PURE__ */ new Date()).toISOString();
  } else if (!data.removed) {
    patch.attestation_signature = null;
    patch.attested_by = null;
    patch.attested_at = null;
  }
  const {
    error
  } = await supabase.from("offboarding_comms_removal").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const addCustomCommsChannel_createServerFn_handler = createServerRpc({
  id: "a35eb3b0fbfecb75753e7c3decdeed9b71e4a80bb942421020811ff7112b28fe",
  name: "addCustomCommsChannel",
  filename: "src/lib/offboarding-comms.functions.ts"
}, (opts) => addCustomCommsChannel.__executeServer(opts));
const addCustomCommsChannel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid(),
  channel: stringType().trim().min(2).max(60),
  label: stringType().trim().min(2).max(200)
}).parse(d)).handler(addCustomCommsChannel_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: c
  } = await supabase.from("offboarding_cases").select("tenant_id").eq("id", data.caseId).maybeSingle();
  if (!c) throw new Error("Case not found");
  const {
    error
  } = await supabase.from("offboarding_comms_removal").insert({
    tenant_id: c.tenant_id,
    case_id: data.caseId,
    channel: data.channel.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    channel_label: data.label,
    is_mandatory: false
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listCommsAudit_createServerFn_handler = createServerRpc({
  id: "429b635747bcebe1d45776ee16e57dfa2c4f582ce221126b041564d93fbe1cab",
  name: "listCommsAudit",
  filename: "src/lib/offboarding-comms.functions.ts"
}, (opts) => listCommsAudit.__executeServer(opts));
const listCommsAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  caseId: stringType().uuid()
}).parse(d)).handler(listCommsAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("offboarding_comms_removal_audit").select("*").eq("case_id", data.caseId).order("created_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  return {
    rows: rows ?? []
  };
});
function toCsv(rows) {
  const esc = (v) => {
    if (v === null || v === void 0) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}
const exportCommsRemovalCsv_createServerFn_handler = createServerRpc({
  id: "5275e39443dabbb0dd5530019a8375daceb07d802938a3eccf8c3a49b726313a",
  name: "exportCommsRemovalCsv",
  filename: "src/lib/offboarding-comms.functions.ts"
}, (opts) => exportCommsRemovalCsv.__executeServer(opts));
const exportCommsRemovalCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["all", "gaps"]).default("all"),
  caseId: stringType().uuid().optional()
}).parse(d ?? {})).handler(exportCommsRemovalCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "audit_export", 5, 60);
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) throw new Error("No tenant");
  let query = supabase.from("offboarding_comms_removal").select("id, case_id, channel, channel_label, is_mandatory, removed, removed_at, evidence_url, attestation_signature, attested_at, due_date, notes, case:case_id(employee_id, status, last_working_day, employee:employee_id(first_name, last_name, employee_number))").eq("tenant_id", me.tenant_id).limit(CSV_MAX_ROWS);
  if (data.caseId) query = query.eq("case_id", data.caseId);
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  let filtered = rows ?? [];
  if (data.scope === "gaps") {
    filtered = filtered.filter((r) => !r.removed || !r.attested_at || !r.evidence_url);
  }
  const header = ["employee_number", "employee_name", "case_id", "case_status", "last_working_day", "channel", "channel_label", "mandatory", "removed", "removed_at", "evidence_url", "attestation_signature", "attested_at", "due_date", "notes"];
  const body = filtered.map((r) => {
    const e = r.case?.employee ?? {};
    return [e.employee_number ?? "", [e.first_name, e.last_name].filter(Boolean).join(" "), r.case_id, r.case?.status ?? "", r.case?.last_working_day ?? "", r.channel, r.channel_label, r.is_mandatory, r.removed, r.removed_at ?? "", r.evidence_url ?? "", r.attestation_signature ?? "", r.attested_at ?? "", r.due_date ?? "", r.notes ?? ""];
  });
  return {
    csv: toCsv([header, ...body]),
    rowCount: body.length
  };
});
export {
  addCustomCommsChannel_createServerFn_handler,
  exportCommsRemovalCsv_createServerFn_handler,
  listCommsAudit_createServerFn_handler,
  listCommsRemoval_createServerFn_handler,
  updateCommsRemoval_createServerFn_handler
};
