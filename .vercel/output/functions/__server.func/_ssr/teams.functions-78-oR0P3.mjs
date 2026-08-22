import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { a as getTenantId } from "./tenant-scope-BlIr6GnF.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType, D as arrayType, B as enumType } from "../_libs/zod.mjs";
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
const DOC_TYPES = ["national_id", "passport", "drivers_license", "tax_id", "social_security", "bank_details", "next_of_kin", "address_proof", "other"];
const DOC_LABELS = {
  national_id: "National ID / Passport",
  passport: "Passport",
  drivers_license: "Driver's license",
  tax_id: "Tax ID / TFN",
  social_security: "Social security number",
  bank_details: "Bank account details",
  next_of_kin: "Next of kin / emergency contact",
  address_proof: "Proof of address",
  other: "Other document"
};
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_MIN = [1, 5, 15, 60, 240];
async function assertHrOrAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => ["manager", "org_admin", "super_admin", "hr"].includes(r))) {
    throw new Error("Forbidden");
  }
  return roles;
}
const listTeamMembers_createServerFn_handler = createServerRpc({
  id: "46c8b615d0fc64d22a6adb7ad83a15fff13302ed7ecdea0a63c8184afdfa0548",
  name: "listTeamMembers",
  filename: "src/lib/teams.functions.ts"
}, (opts) => listTeamMembers.__executeServer(opts));
const listTeamMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTeamMembers_createServerFn_handler, async ({
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    supabase
  } = context;
  const tenantId = await getTenantId(supabase, context.userId);
  if (!tenantId) return {
    employees: [],
    departments: [],
    pendingByEmployee: {}
  };
  const {
    data: employees,
    error
  } = await supabase.from("employees").select("id,first_name,last_name,email,phone,job_title,employment_type,status,hire_date,department_id,manager_id").eq("tenant_id", tenantId).order("first_name");
  if (error) throw new Error(error.message);
  const ids = (employees ?? []).map((e) => e.id);
  if (ids.length === 0) return {
    employees: [],
    departments: [],
    pendingByEmployee: {}
  };
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const [{
    data: deps
  }, {
    data: profiles
  }, {
    data: pending
  }] = await Promise.all([supabase.from("departments").select("id,name").eq("tenant_id", tenantId), supabaseAdmin.from("staff_onboarding_profiles").select("employee_id,national_id_number,tax_identification_number,emergency_contact_name,emergency_contact_phone,bank_account_number,address_line1,date_of_birth").in("employee_id", ids), supabase.from("id_document_requests").select("id,employee_id,document_type,status,requested_at").in("employee_id", ids).eq("status", "pending")]);
  const profileByEmp = new Map((profiles ?? []).map((p) => [p.employee_id, p]));
  const pendingByEmp = {};
  (pending ?? []).forEach((r) => {
    const k = r.employee_id;
    (pendingByEmp[k] ||= []).push(r);
  });
  const enriched = (employees ?? []).map((e) => {
    const p = profileByEmp.get(e.id) ?? {};
    const missing = [];
    if (!p.national_id_number && !p.tax_identification_number) missing.push("national_id");
    if (!p.emergency_contact_name || !p.emergency_contact_phone) missing.push("next_of_kin");
    if (!p.bank_account_number) missing.push("bank_details");
    if (!p.address_line1) missing.push("address_proof");
    if (!p.date_of_birth) missing.push("date_of_birth");
    return {
      ...e,
      missing
    };
  });
  return {
    employees: enriched,
    departments: deps ?? [],
    pendingByEmployee: pendingByEmp
  };
});
const recordFiltersSchema = objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType().min(1).max(40)).max(30).optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  search: stringType().trim().max(200).optional(),
  page: numberType().int().min(1).max(1e3).optional(),
  pageSize: numberType().int().min(5).max(200).optional()
});
const listEmployeeRecord_createServerFn_handler = createServerRpc({
  id: "31511fa15cd52d112388b324e6d3598afc46e9e92ddc5524b2950e7e96f22d87",
  name: "listEmployeeRecord",
  filename: "src/lib/teams.functions.ts"
}, (opts) => listEmployeeRecord.__executeServer(opts));
const listEmployeeRecord = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => recordFiltersSchema.parse(d)).handler(listEmployeeRecord_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    supabase
  } = context;
  const page = data.page ?? 1;
  const pageSize = data.pageSize ?? 25;
  const offset = (page - 1) * pageSize;
  let eventsQ = supabase.from("employee_events").select("id,category,event_type,title,summary,occurred_at,severity,visibility,metadata", {
    count: "exact"
  }).eq("employee_id", data.employeeId);
  if (data.categories?.length) eventsQ = eventsQ.in("category", data.categories);
  if (data.from) eventsQ = eventsQ.gte("occurred_at", data.from);
  if (data.to) eventsQ = eventsQ.lte("occurred_at", data.to);
  if (data.search) eventsQ = eventsQ.ilike("title", `%${data.search}%`);
  const [emp, profile, eventsRes, pending, categoryCounts] = await Promise.all([supabase.from("employees").select("*").eq("id", data.employeeId).maybeSingle(), supabase.from("staff_onboarding_profiles").select("*").eq("employee_id", data.employeeId).maybeSingle(), eventsQ.order("occurred_at", {
    ascending: false
  }).range(offset, offset + pageSize - 1), supabase.from("id_document_requests").select("*").eq("employee_id", data.employeeId).order("requested_at", {
    ascending: false
  }), supabase.from("employee_events").select("category").eq("employee_id", data.employeeId)]);
  const counts = {};
  (categoryCounts.data ?? []).forEach((r) => {
    counts[r.category] = (counts[r.category] ?? 0) + 1;
  });
  return {
    employee: emp.data,
    profile: profile.data,
    events: eventsRes.data ?? [],
    totalEvents: eventsRes.count ?? 0,
    categoryCounts: counts,
    requests: pending.data ?? [],
    page,
    pageSize
  };
});
async function writeAudit(supabase, tenantId, requestId, actorId, action, fromStatus, toStatus, metadata = {}) {
  try {
    await supabase.from("id_request_audit_log").insert({
      tenant_id: tenantId,
      request_id: requestId,
      actor_id: actorId,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      metadata
    });
  } catch {
  }
}
async function sendRequestEmailWithRetry(supabase, request, emp) {
  if (!emp.email) {
    await supabase.from("id_document_requests").update({
      last_send_status: "failed",
      last_send_error: "Employee has no email on file",
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: request.send_attempts + 1,
      next_retry_at: null
    }).eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_failed", null, null, {
      reason: "no_email"
    });
    return {
      ok: false,
      error: "no_email"
    };
  }
  try {
    const {
      data: tenant
    } = await supabase.from("tenants").select("name").eq("id", emp.tenant_id).maybeSingle();
    const docLabel = DOC_LABELS[request.document_type] ?? request.document_type.replace(/_/g, " ");
    const subject = `Action required: please provide ${docLabel}`;
    const html = `
      <p>Hi ${emp.first_name ?? ""},</p>
      <p>${tenant?.name ?? "Your organisation"} needs you to provide the following information:
      <strong>${docLabel}</strong>.</p>
      ${request.notes ? `<p>Notes from your admin: ${request.notes}</p>` : ""}
      <p>Please log in to your account and upload this information at your earliest convenience.</p>
    `.trim();
    const {
      error: enqErr
    } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: emp.email,
        subject,
        html,
        template_name: "id_document_request",
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        request_id: request.id
      }
    });
    if (enqErr) throw new Error(enqErr.message);
    await supabase.from("id_document_requests").update({
      last_send_status: "sent",
      last_send_error: null,
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: request.send_attempts + 1,
      next_retry_at: null
    }).eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_succeeded", null, null, {
      attempt: request.send_attempts + 1
    });
    return {
      ok: true
    };
  } catch (e) {
    const attempt = request.send_attempts + 1;
    const giveUp = attempt >= MAX_RETRY_ATTEMPTS;
    const delay = RETRY_BACKOFF_MIN[Math.min(attempt - 1, RETRY_BACKOFF_MIN.length - 1)];
    const nextRetry = giveUp ? null : new Date(Date.now() + delay * 6e4).toISOString();
    await supabase.from("id_document_requests").update({
      last_send_status: giveUp ? "failed" : "retrying",
      last_send_error: String(e?.message ?? e),
      last_attempted_at: (/* @__PURE__ */ new Date()).toISOString(),
      send_attempts: attempt,
      next_retry_at: nextRetry
    }).eq("id", request.id);
    await writeAudit(supabase, request.tenant_id, request.id, null, "send_failed", null, null, {
      error: String(e?.message ?? e),
      attempt,
      next_retry_at: nextRetry
    });
    return {
      ok: false,
      error: String(e?.message ?? e)
    };
  }
}
const requestMissingDocument_createServerFn_handler = createServerRpc({
  id: "c9c31c2df543d8bfc60477a1aa8dff113e67e5a66a27e0198f54e6af2c89e06f",
  name: "requestMissingDocument",
  filename: "src/lib/teams.functions.ts"
}, (opts) => requestMissingDocument.__executeServer(opts));
const requestMissingDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  documentType: enumType(DOC_TYPES),
  notes: stringType().trim().max(1e3).optional()
}).parse(d)).handler(requestMissingDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertHrOrAdmin(supabase, userId);
  const {
    data: emp,
    error: empErr
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email").eq("id", data.employeeId).maybeSingle();
  if (empErr || !emp) throw new Error("Employee not found");
  const {
    data: row,
    error
  } = await supabase.from("id_document_requests").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    document_type: data.documentType,
    notes: data.notes ?? null,
    requested_by: userId,
    status: "pending",
    last_send_status: "queued"
  }).select().single();
  if (error) throw new Error(error.message);
  await writeAudit(supabase, emp.tenant_id, row.id, userId, "created", null, "pending", {
    document_type: data.documentType
  });
  await sendRequestEmailWithRetry(supabase, {
    ...row,
    send_attempts: 0
  }, emp);
  return {
    request: row
  };
});
async function transitionRequest(supabase, userId, id, toStatus, action) {
  const {
    data: existing,
    error: readErr
  } = await supabase.from("id_document_requests").select("id,tenant_id,status").eq("id", id).maybeSingle();
  if (readErr || !existing) throw new Error("Request not found");
  if (existing.status !== "pending") {
    return {
      id,
      skipped: true,
      reason: `status_${existing.status}`
    };
  }
  const update = {
    status: toStatus
  };
  if (toStatus === "submitted") update.fulfilled_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await supabase.from("id_document_requests").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  await writeAudit(supabase, existing.tenant_id, id, userId, action, existing.status, toStatus);
  return {
    id,
    ok: true
  };
}
const cancelDocumentRequest_createServerFn_handler = createServerRpc({
  id: "a6cb68553cf517c858c7ad571f392fd06ce54f5d8218d9b58044f44293034b88",
  name: "cancelDocumentRequest",
  filename: "src/lib/teams.functions.ts"
}, (opts) => cancelDocumentRequest.__executeServer(opts));
const cancelDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(cancelDocumentRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  return await transitionRequest(context.supabase, context.userId, data.id, "cancelled", "cancelled");
});
const approveDocumentRequest_createServerFn_handler = createServerRpc({
  id: "30df93f3498b9334a5651e2e9281a235bf9f7388a90d6906c85adcbc252cd68d",
  name: "approveDocumentRequest",
  filename: "src/lib/teams.functions.ts"
}, (opts) => approveDocumentRequest.__executeServer(opts));
const approveDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(approveDocumentRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  return await transitionRequest(context.supabase, context.userId, data.id, "submitted", "approved");
});
async function resendOne(supabase, userId, id) {
  const {
    data: req,
    error
  } = await supabase.from("id_document_requests").select("id,tenant_id,employee_id,document_type,notes,status,send_attempts").eq("id", id).maybeSingle();
  if (error || !req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be resent");
  const {
    data: emp
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name,email").eq("id", req.employee_id).maybeSingle();
  if (!emp) throw new Error("Employee not found");
  await supabase.from("id_document_requests").update({
    requested_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", req.id);
  await writeAudit(supabase, req.tenant_id, req.id, userId, "resent", "pending", "pending");
  const out = await sendRequestEmailWithRetry(supabase, {
    id: req.id,
    tenant_id: req.tenant_id,
    document_type: req.document_type,
    notes: req.notes,
    send_attempts: req.send_attempts ?? 0
  }, emp);
  if (!out.ok) {
    await writeAudit(supabase, req.tenant_id, req.id, userId, "send_retried", "pending", "pending", {
      error: out.error
    });
  }
  return out;
}
const resendDocumentRequest_createServerFn_handler = createServerRpc({
  id: "39dec211cd382844785c2f202405400fcbf326401b6e68136a0d1b7bef881032",
  name: "resendDocumentRequest",
  filename: "src/lib/teams.functions.ts"
}, (opts) => resendDocumentRequest.__executeServer(opts));
const resendDocumentRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(resendDocumentRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  return await resendOne(context.supabase, context.userId, data.id);
});
const bulkSchema = objectType({
  ids: arrayType(stringType().uuid()).min(1).max(200)
});
const bulkApproveDocumentRequests_createServerFn_handler = createServerRpc({
  id: "9f956a5b8665c04f5d1dcd861eabe996a1578383afb8939260c5e710c64f959a",
  name: "bulkApproveDocumentRequests",
  filename: "src/lib/teams.functions.ts"
}, (opts) => bulkApproveDocumentRequests.__executeServer(opts));
const bulkApproveDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(bulkApproveDocumentRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const results = [];
  for (const id of data.ids) {
    try {
      results.push(await transitionRequest(context.supabase, context.userId, id, "submitted", "approved"));
    } catch (e) {
      results.push({
        id,
        error: String(e?.message ?? e)
      });
    }
  }
  return {
    results
  };
});
const bulkCancelDocumentRequests_createServerFn_handler = createServerRpc({
  id: "d42e8026e584921cd288473bb6579d169c454e46704fd05b1c4dacddda698b17",
  name: "bulkCancelDocumentRequests",
  filename: "src/lib/teams.functions.ts"
}, (opts) => bulkCancelDocumentRequests.__executeServer(opts));
const bulkCancelDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(bulkCancelDocumentRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const results = [];
  for (const id of data.ids) {
    try {
      results.push(await transitionRequest(context.supabase, context.userId, id, "cancelled", "cancelled"));
    } catch (e) {
      results.push({
        id,
        error: String(e?.message ?? e)
      });
    }
  }
  return {
    results
  };
});
const bulkResendDocumentRequests_createServerFn_handler = createServerRpc({
  id: "a32e063520edc4817837f5df6e4419e71f39cc385dbe0857e81b0847ab2538ea",
  name: "bulkResendDocumentRequests",
  filename: "src/lib/teams.functions.ts"
}, (opts) => bulkResendDocumentRequests.__executeServer(opts));
const bulkResendDocumentRequests = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bulkSchema.parse(d)).handler(bulkResendDocumentRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const results = [];
  for (const id of data.ids) {
    try {
      results.push({
        id,
        ...await resendOne(context.supabase, context.userId, id)
      });
    } catch (e) {
      results.push({
        id,
        error: String(e?.message ?? e)
      });
    }
  }
  return {
    results
  };
});
const listAllDocumentRequests_createServerFn_handler = createServerRpc({
  id: "1bb86553dfedc144d277c249795c3740bcb07e30a2bc3824ccdf7aaf2fd1e50e",
  name: "listAllDocumentRequests",
  filename: "src/lib/teams.functions.ts"
}, (opts) => listAllDocumentRequests.__executeServer(opts));
const listAllDocumentRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["pending", "submitted", "cancelled", "all"]).optional()
}).parse(d ?? {})).handler(listAllDocumentRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    supabase
  } = context;
  let q = supabase.from("id_document_requests").select("id,employee_id,document_type,notes,status,requested_at,fulfilled_at,requested_by,last_send_status,last_send_error,send_attempts,next_retry_at,last_attempted_at").order("requested_at", {
    ascending: false
  }).limit(500);
  if (data.status && data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const empIds = Array.from(new Set((rows ?? []).map((r) => r.employee_id)));
  let employees = [];
  if (empIds.length) {
    const {
      data: emps
    } = await supabase.from("employees").select("id,first_name,last_name,email,job_title").in("id", empIds);
    employees = emps ?? [];
  }
  const empById = new Map(employees.map((e) => [e.id, e]));
  return {
    requests: (rows ?? []).map((r) => ({
      ...r,
      employee: empById.get(r.employee_id) ?? null
    }))
  };
});
const listRequestAudit_createServerFn_handler = createServerRpc({
  id: "936931105481384f5d3d2bc133bc714a987ed5cb30c7ae96ee618d49bdc09e94",
  name: "listRequestAudit",
  filename: "src/lib/teams.functions.ts"
}, (opts) => listRequestAudit.__executeServer(opts));
const listRequestAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(listRequestAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("id_request_audit_log").select("id,action,from_status,to_status,metadata,created_at,actor_id").eq("request_id", data.requestId).order("created_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    entries: rows ?? []
  };
});
const exportEmployeeHistoryCsv_createServerFn_handler = createServerRpc({
  id: "7d1f87e6d832cd0d18219102c01098a8e39c8d1c2410f9e0fbf164fce23841b1",
  name: "exportEmployeeHistoryCsv",
  filename: "src/lib/teams.functions.ts"
}, (opts) => exportEmployeeHistoryCsv.__executeServer(opts));
const exportEmployeeHistoryCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType()).max(30).optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  search: stringType().trim().max(200).optional()
}).parse(d)).handler(exportEmployeeHistoryCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertHrOrAdmin(context.supabase, context.userId);
  const {
    supabase
  } = context;
  let q = supabase.from("employee_events").select("occurred_at,category,event_type,title,summary,severity,visibility").eq("employee_id", data.employeeId);
  if (data.categories?.length) q = q.in("category", data.categories);
  if (data.from) q = q.gte("occurred_at", data.from);
  if (data.to) q = q.lte("occurred_at", data.to);
  if (data.search) q = q.ilike("title", `%${data.search}%`);
  const {
    data: rows,
    error
  } = await q.order("occurred_at", {
    ascending: false
  }).limit(5e3);
  if (error) throw new Error(error.message);
  const {
    data: emp
  } = await supabase.from("employees").select("first_name,last_name,email,job_title,phone,hire_date,employment_type,status").eq("id", data.employeeId).maybeSingle();
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const meta = [`# Team history export`, `# Employee: ${esc(`${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim())}`, `# Email: ${esc(emp?.email ?? "")}`, `# Job title: ${esc(emp?.job_title ?? "")}`, `# Status: ${esc(emp?.status ?? "")}`, `# Filters — categories: ${esc((data.categories ?? []).join("|") || "all")}, from: ${esc(data.from ?? "")}, to: ${esc(data.to ?? "")}, search: ${esc(data.search ?? "")}`, `# Exported at: ${esc((/* @__PURE__ */ new Date()).toISOString())}`, ``];
  const header = ["Occurred at", "Category", "Event type", "Title", "Summary", "Severity", "Visibility"];
  const byCat = {};
  for (const r of rows ?? []) {
    (byCat[r.category] ||= []).push(r);
  }
  const lines = [...meta, header.join(",")];
  for (const cat of Object.keys(byCat).sort()) {
    lines.push(`# Category: ${cat} (${byCat[cat].length})`);
    for (const r of byCat[cat]) {
      lines.push([r.occurred_at, r.category, r.event_type, r.title, r.summary, r.severity, r.visibility].map(esc).join(","));
    }
  }
  return {
    filename: `team-history-${(emp?.first_name ?? "employee").toLowerCase()}-${(emp?.last_name ?? "").toLowerCase()}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`,
    csv: lines.join("\n"),
    employee: emp ?? null,
    grouped: byCat,
    filters: {
      categories: data.categories ?? [],
      from: data.from ?? null,
      to: data.to ?? null,
      search: data.search ?? null
    }
  };
});
export {
  approveDocumentRequest_createServerFn_handler,
  bulkApproveDocumentRequests_createServerFn_handler,
  bulkCancelDocumentRequests_createServerFn_handler,
  bulkResendDocumentRequests_createServerFn_handler,
  cancelDocumentRequest_createServerFn_handler,
  exportEmployeeHistoryCsv_createServerFn_handler,
  listAllDocumentRequests_createServerFn_handler,
  listEmployeeRecord_createServerFn_handler,
  listRequestAudit_createServerFn_handler,
  listTeamMembers_createServerFn_handler,
  requestMissingDocument_createServerFn_handler,
  resendDocumentRequest_createServerFn_handler
};
