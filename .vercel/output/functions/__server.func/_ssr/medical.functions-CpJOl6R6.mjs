import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, B as enumType, C as numberType } from "../_libs/zod.mjs";
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
const RecordInput = objectType({
  employeeId: stringType().uuid(),
  incidentType: stringType().min(1).max(120),
  severity: enumType(["low", "medium", "high", "critical"]).default("low"),
  occurredAt: stringType().optional(),
  location: stringType().max(255).optional(),
  description: stringType().min(1).max(5e3),
  treatmentNotes: stringType().max(5e3).optional(),
  requiresCase: booleanType().default(false),
  reportedToAuthority: booleanType().default(false),
  confidential: booleanType().default(true)
});
async function assertHr(ctx) {
  const {
    data: roles
  } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin", "manager"].includes(x))) {
    throw new Error("Not authorized");
  }
}
const recordMedicalIncident_createServerFn_handler = createServerRpc({
  id: "6d053a7324b3229fd357eb2200d4e929050f07784edd62a37f60c3b2ae052a62",
  name: "recordMedicalIncident",
  filename: "src/lib/medical.functions.ts"
}, (opts) => recordMedicalIncident.__executeServer(opts));
const recordMedicalIncident = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RecordInput.parse(d)).handler(recordMedicalIncident_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHr(context);
  const {
    data: emp
  } = await context.supabase.from("employees").select("tenant_id").eq("id", data.employeeId).single();
  if (!emp) throw new Error("Employee not found");
  const {
    data: row,
    error
  } = await context.supabase.from("medical_incidents").insert({
    tenant_id: emp.tenant_id,
    employee_id: data.employeeId,
    incident_type: data.incidentType,
    severity: data.severity,
    occurred_at: data.occurredAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    location: data.location,
    description: data.description,
    treatment_notes: data.treatmentNotes,
    requires_case: data.requiresCase,
    reported_to_authority: data.reportedToAuthority,
    confidential: data.confidential,
    created_by: context.userId
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    incident: row
  };
});
const listMedicalIncidents_createServerFn_handler = createServerRpc({
  id: "15c96a750ac4fc96e36ff3ba32847f33a7fc66ea4a1cae45eacd88282ec379b3",
  name: "listMedicalIncidents",
  filename: "src/lib/medical.functions.ts"
}, (opts) => listMedicalIncidents.__executeServer(opts));
const listMedicalIncidents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(listMedicalIncidents_createServerFn_handler, async ({
  data,
  context
}) => {
  let q = context.supabase.from("medical_incidents").select("*").order("occurred_at", {
    ascending: false
  }).limit(200);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const hadConfidential = (rows ?? []).some((r) => r.confidential);
  try {
    await context.supabase.rpc("log_event_access", {
      _resource_type: "medical_incident",
      _resource_id: null,
      _employee_id: data.employeeId ?? null,
      _action: "list",
      _was_confidential: hadConfidential,
      _metadata: {
        count: rows?.length ?? 0
      }
    });
  } catch {
  }
  return {
    incidents: rows ?? []
  };
});
const recordMedicalAttachment_createServerFn_handler = createServerRpc({
  id: "39aeff4e2611fc143be73278f5d7e07327dd3155f3b5e4cc2b368e62ef3d1a65",
  name: "recordMedicalAttachment",
  filename: "src/lib/medical.functions.ts"
}, (opts) => recordMedicalAttachment.__executeServer(opts));
const recordMedicalAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  incident_id: stringType().uuid(),
  storage_path: stringType().min(1).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(120).optional().nullable(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional().nullable()
}).parse(d)).handler(recordMedicalAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: inc
  } = await supabase.from("medical_incidents").select("tenant_id").eq("id", data.incident_id).single();
  if (!inc) throw new Error("Incident not found");
  const {
    data: row,
    error
  } = await supabase.from("medical_attachments").insert({
    ...data,
    tenant_id: inc.tenant_id,
    uploaded_by: userId
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    attachment: row
  };
});
const listMedicalAttachments_createServerFn_handler = createServerRpc({
  id: "2ce322121f455bee9c2df39a0b6468b8b9ae3910e40315941cb52e8844b4d068",
  name: "listMedicalAttachments",
  filename: "src/lib/medical.functions.ts"
}, (opts) => listMedicalAttachments.__executeServer(opts));
const listMedicalAttachments = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  incident_id: stringType().uuid()
}).parse(d)).handler(listMedicalAttachments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("medical_attachments").select("*").eq("incident_id", data.incident_id).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    attachments: rows ?? []
  };
});
const deleteMedicalAttachment_createServerFn_handler = createServerRpc({
  id: "aa6bee4a72a6050a03c8671dd36a24013cfcd7e1e9eb43208b73e984800c7339",
  name: "deleteMedicalAttachment",
  filename: "src/lib/medical.functions.ts"
}, (opts) => deleteMedicalAttachment.__executeServer(opts));
const deleteMedicalAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMedicalAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: row
  } = await supabase.from("medical_attachments").select("storage_path").eq("id", data.id).single();
  if (row?.storage_path) await supabase.storage.from("medical-files").remove([row.storage_path]);
  const {
    error
  } = await supabase.from("medical_attachments").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMedicalAttachmentUrl_createServerFn_handler = createServerRpc({
  id: "f1c1854887716d667c7f2aa6fc5fdcf5a6bccaede801c62fd070b67d2e52f1f7",
  name: "getMedicalAttachmentUrl",
  filename: "src/lib/medical.functions.ts"
}, (opts) => getMedicalAttachmentUrl.__executeServer(opts));
const getMedicalAttachmentUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  storage_path: stringType().min(1).max(500)
}).parse(d)).handler(getMedicalAttachmentUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: signed,
    error
  } = await supabase.storage.from("medical-files").createSignedUrl(data.storage_path, 60 * 10);
  if (error) throw new Error(error.message);
  return {
    url: signed.signedUrl
  };
});
export {
  deleteMedicalAttachment_createServerFn_handler,
  getMedicalAttachmentUrl_createServerFn_handler,
  listMedicalAttachments_createServerFn_handler,
  listMedicalIncidents_createServerFn_handler,
  recordMedicalAttachment_createServerFn_handler,
  recordMedicalIncident_createServerFn_handler
};
