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
async function getTenant(supabase, userId) {
  const {
    data
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  return data?.tenant_id;
}
async function notify(opts) {
  if (!opts.user_ids.length) return;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const rows = opts.user_ids.filter(Boolean).map((user_id) => ({
    tenant_id: opts.tenant_id,
    user_id,
    kind: opts.kind,
    title: opts.title,
    body: opts.body ?? null,
    link: opts.link ?? null,
    metadata: opts.metadata ?? {}
  }));
  if (rows.length) await supabaseAdmin.from("in_app_notifications").insert(rows);
}
const TRANSITIONS = {
  draft: ["open", "withdrawn"],
  open: ["investigation", "hearing_scheduled", "decision_pending", "closed", "withdrawn"],
  investigation: ["hearing_scheduled", "decision_pending", "closed", "withdrawn"],
  hearing_scheduled: ["hearing_held", "investigation", "withdrawn"],
  hearing_held: ["decision_pending", "investigation"],
  decision_pending: ["decision_issued", "investigation"],
  decision_issued: ["appeal_open", "closed"],
  appeal_open: ["under_review", "closed"],
  under_review: ["closed", "appealed"],
  appealed: ["closed"],
  closed: [],
  withdrawn: []
};
const CaseSchema = objectType({
  id: stringType().uuid().optional(),
  employee_id: stringType().uuid(),
  case_number: stringType().max(60).optional().nullable(),
  category: enumType(["verbal_warning", "written_warning", "final_warning", "suspension", "termination", "pip", "investigation", "other"]),
  severity: enumType(["low", "medium", "high", "critical"]).default("low"),
  incident_date: stringType().optional().nullable(),
  description: stringType().min(1).max(5e3),
  status: enumType(["draft", "open", "investigation", "hearing_scheduled", "hearing_held", "decision_pending", "decision_issued", "appeal_open", "under_review", "appealed", "closed", "withdrawn"]).default("draft"),
  outcome: stringType().max(2e3).optional().nullable(),
  assigned_to: stringType().uuid().optional().nullable(),
  due_date: stringType().optional().nullable(),
  appeal_deadline: stringType().optional().nullable(),
  confidential: booleanType().default(false)
});
const listCases_createServerFn_handler = createServerRpc({
  id: "1588f6379566ed5fe0712c28cb8a7cddc11a6c7353a22b745c0edf1f1d3cd13a",
  name: "listCases",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listCases.__executeServer(opts));
const listCases = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid().optional(),
  assigned_to_me: booleanType().optional(),
  status: stringType().optional()
}).parse(d ?? {})).handler(listCases_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("disciplinary_cases").select("*, employees:employee_id(id,first_name,last_name,job_title)").order("created_at", {
    ascending: false
  });
  if (data.employee_id) q = q.eq("employee_id", data.employee_id);
  if (data.assigned_to_me) q = q.eq("assigned_to", userId);
  if (data.status) q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    cases: rows ?? []
  };
});
const upsertCase_createServerFn_handler = createServerRpc({
  id: "e92e3ff542436bd5a061f4f4873d70c7317486ddf595e4dea5e241b5c7fad5c4",
  name: "upsertCase",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => upsertCase.__executeServer(opts));
const upsertCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CaseSchema.parse(d)).handler(upsertCase_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const payload = {
    ...data,
    tenant_id
  };
  if (!data.id) payload.opened_by = userId;
  if (data.status === "closed") {
    payload.closed_at = (/* @__PURE__ */ new Date()).toISOString();
    payload.closed_by = userId;
  }
  if (data.status === "withdrawn") payload.withdrawn_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: row,
    error
  } = data.id ? await supabase.from("disciplinary_cases").update(payload).eq("id", data.id).select().single() : await supabase.from("disciplinary_cases").insert(payload).select().single();
  if (error) throw error;
  if (!data.id && row.assigned_to) {
    await notify({
      tenant_id,
      user_ids: [row.assigned_to],
      kind: "discipline_case_assigned",
      title: "Disciplinary case assigned",
      body: `Case ${row.case_number ?? row.id.slice(0, 8)} (${row.category}) was assigned to you.`,
      link: "/admin/discipline",
      metadata: {
        case_id: row.id
      }
    });
  }
  return {
    case: row
  };
});
const deleteCase_createServerFn_handler = createServerRpc({
  id: "2085180efdf4b63b2cbef0a425c5b0c12d34f15acbd4afd46315ac36ab18d26e",
  name: "deleteCase",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => deleteCase.__executeServer(opts));
const deleteCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCase_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("disciplinary_cases").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const assignCase_createServerFn_handler = createServerRpc({
  id: "ae727b651f3ebb7883ee1bda085d09af9c6bf362fef5982c5c5cdfab91752fe8",
  name: "assignCase",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => assignCase.__executeServer(opts));
const assignCase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  assigned_to: stringType().uuid().nullable(),
  due_date: stringType().optional().nullable(),
  appeal_deadline: stringType().optional().nullable(),
  confidential: booleanType().optional()
}).parse(d)).handler(assignCase_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const update = {
    assigned_to: data.assigned_to
  };
  if (data.due_date !== void 0) update.due_date = data.due_date;
  if (data.appeal_deadline !== void 0) update.appeal_deadline = data.appeal_deadline;
  if (data.confidential !== void 0) update.confidential = data.confidential;
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_cases").update(update).eq("id", data.case_id).select().single();
  if (error) throw error;
  await supabase.from("disciplinary_actions").insert({
    case_id: data.case_id,
    tenant_id,
    performed_by: userId,
    action_type: "status_changed",
    notes: `Reassigned${data.assigned_to ? "" : " (unassigned)"}${data.due_date ? `; due ${data.due_date}` : ""}`
  });
  if (data.assigned_to) {
    await notify({
      tenant_id,
      user_ids: [data.assigned_to],
      kind: "discipline_case_assigned",
      title: "Disciplinary case assigned",
      body: `Case ${row.case_number ?? row.id.slice(0, 8)} assigned to you${data.due_date ? `, due ${data.due_date}` : ""}.`,
      link: "/admin/discipline",
      metadata: {
        case_id: row.id
      }
    });
  }
  return {
    case: row
  };
});
const transitionCaseStatus_createServerFn_handler = createServerRpc({
  id: "3a73a63b8d7e00023b41a53569f5fedb498f4ed5a5a4a7a932e2a06d099414f2",
  name: "transitionCaseStatus",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => transitionCaseStatus.__executeServer(opts));
const transitionCaseStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  to_status: stringType(),
  notes: stringType().max(2e3).optional()
}).parse(d)).handler(transitionCaseStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: current,
    error: e1
  } = await supabase.from("disciplinary_cases").select("*").eq("id", data.case_id).single();
  if (e1) throw e1;
  const allowed = TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(data.to_status)) {
    throw new Error(`Cannot transition from ${current.status} to ${data.to_status}`);
  }
  if (data.to_status === "decision_issued") {
    const {
      data: approvals
    } = await supabase.from("disciplinary_approvals").select("decision").eq("case_id", data.case_id);
    const approved = (approvals ?? []).some((a) => a.decision === "approved");
    if (!approved) throw new Error("At least one approval must be granted before issuing the decision.");
  }
  const update = {
    status: data.to_status
  };
  if (data.to_status === "closed") {
    update.closed_at = (/* @__PURE__ */ new Date()).toISOString();
    update.closed_by = userId;
  }
  if (data.to_status === "withdrawn") update.withdrawn_at = (/* @__PURE__ */ new Date()).toISOString();
  if (data.to_status === "decision_issued" && !current.appeal_deadline) {
    const dl = /* @__PURE__ */ new Date();
    dl.setDate(dl.getDate() + 14);
    update.appeal_deadline = dl.toISOString().slice(0, 10);
  }
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_cases").update(update).eq("id", data.case_id).select().single();
  if (error) throw error;
  await supabase.from("disciplinary_actions").insert({
    case_id: data.case_id,
    tenant_id,
    performed_by: userId,
    action_type: "status_changed",
    notes: `${current.status} → ${data.to_status}${data.notes ? `: ${data.notes}` : ""}`
  });
  const notable = ["hearing_scheduled", "decision_issued", "closed"];
  if (notable.includes(data.to_status)) {
    const {
      data: emp
    } = await supabase.from("employees").select("user_id").eq("id", current.employee_id).maybeSingle();
    if (emp?.user_id) {
      await notify({
        tenant_id,
        user_ids: [emp.user_id],
        kind: `discipline_${data.to_status}`,
        title: data.to_status === "hearing_scheduled" ? "Disciplinary hearing scheduled" : data.to_status === "decision_issued" ? "Disciplinary decision issued" : "Disciplinary case closed",
        body: `Your case ${current.case_number ?? current.id.slice(0, 8)} is now ${data.to_status.replace(/_/g, " ")}.`,
        link: "/me/grievances",
        metadata: {
          case_id: current.id
        }
      });
    }
  }
  return {
    case: row
  };
});
const ActionSchema = objectType({
  id: stringType().uuid().optional(),
  case_id: stringType().uuid(),
  action_type: enumType(["warning_issued", "hearing_scheduled", "hearing_held", "appeal_filed", "outcome_recorded", "note", "document_attached", "status_changed"]),
  action_date: stringType().optional(),
  notes: stringType().max(4e3).optional().nullable(),
  document_url: stringType().url().max(500).optional().nullable()
});
const listActions_createServerFn_handler = createServerRpc({
  id: "7d41a8a207444a57a9cdd9405fe9022468edde413499c8c17cacb653878c0b2a",
  name: "listActions",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listActions.__executeServer(opts));
const listActions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid()
}).parse(d)).handler(listActions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("disciplinary_actions").select("*").eq("case_id", data.case_id).order("action_date", {
    ascending: false
  }).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    actions: rows ?? []
  };
});
const addAction_createServerFn_handler = createServerRpc({
  id: "204761bffb91fef0a2583828d5e098518b3ecfd200a5cd402f02207232746fc6",
  name: "addAction",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => addAction.__executeServer(opts));
const addAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ActionSchema.parse(d)).handler(addAction_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_actions").insert({
    ...data,
    tenant_id,
    performed_by: userId,
    action_date: data.action_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  }).select().single();
  if (error) throw error;
  return {
    action: row
  };
});
const deleteAction_createServerFn_handler = createServerRpc({
  id: "a0df176bc0b2ffcd80083a4307aa3aaf1b172b11c3ff547553db43d4c0183499",
  name: "deleteAction",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => deleteAction.__executeServer(opts));
const deleteAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteAction_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("disciplinary_actions").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listApprovals_createServerFn_handler = createServerRpc({
  id: "38f15c59de22297c225c51c19ce6f80f81999ac95fe0b0761af9d828a3788bf4",
  name: "listApprovals",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listApprovals.__executeServer(opts));
const listApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid().optional(),
  pending_for_me: booleanType().optional()
}).parse(d ?? {})).handler(listApprovals_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("disciplinary_approvals").select("*, case:case_id(id,case_number,category,employee_id,employees:employee_id(first_name,last_name)), approver:approver_id(full_name,email)").order("requested_at", {
    ascending: false
  });
  if (data.case_id) q = q.eq("case_id", data.case_id);
  if (data.pending_for_me) q = q.eq("approver_id", userId).is("decided_at", null);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    approvals: rows ?? []
  };
});
const requestApproval_createServerFn_handler = createServerRpc({
  id: "598c872155879b7ce24f12c04b13c84d5726c1a7c37b4a32f7e7204917bc215f",
  name: "requestApproval",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => requestApproval.__executeServer(opts));
const requestApproval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  approver_id: stringType().uuid(),
  approver_role: enumType(["manager", "hr", "legal", "org_admin"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(requestApproval_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_approvals").insert({
    case_id: data.case_id,
    tenant_id,
    approver_id: data.approver_id,
    approver_role: data.approver_role,
    requested_by: userId,
    notes: data.notes ?? null
  }).select().single();
  if (error) throw error;
  await supabase.from("disciplinary_actions").insert({
    case_id: data.case_id,
    tenant_id,
    performed_by: userId,
    action_type: "note",
    notes: `Approval requested from ${data.approver_role}`
  });
  await notify({
    tenant_id,
    user_ids: [data.approver_id],
    kind: "discipline_approval_requested",
    title: "Disciplinary approval needed",
    body: `Your approval is requested as ${data.approver_role}.`,
    link: "/admin/discipline",
    metadata: {
      case_id: data.case_id,
      approval_id: row.id
    }
  });
  return {
    approval: row
  };
});
const decideApproval_createServerFn_handler = createServerRpc({
  id: "b599389b700411d5326a882095d49132be54a1a71575b1dcc0198b1fe56d66cb",
  name: "decideApproval",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => decideApproval.__executeServer(opts));
const decideApproval = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  approval_id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(decideApproval_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: approval,
    error: e1
  } = await supabase.from("disciplinary_approvals").select("*").eq("id", data.approval_id).single();
  if (e1) throw e1;
  if (approval.approver_id !== userId) throw new Error("Only the assigned approver can decide.");
  if (approval.decided_at) throw new Error("Already decided.");
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_approvals").update({
    decision: data.decision,
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    notes: data.notes ?? approval.notes
  }).eq("id", data.approval_id).select().single();
  if (error) throw error;
  await supabase.from("disciplinary_actions").insert({
    case_id: approval.case_id,
    tenant_id: approval.tenant_id,
    performed_by: userId,
    action_type: "note",
    notes: `Approval ${data.decision} by ${approval.approver_role}${data.notes ? `: ${data.notes}` : ""}`
  });
  await notify({
    tenant_id: approval.tenant_id,
    user_ids: [approval.requested_by],
    kind: "discipline_approval_decided",
    title: `Approval ${data.decision}`,
    body: `${approval.approver_role} ${data.decision} the disciplinary case approval.`,
    link: "/admin/discipline",
    metadata: {
      case_id: approval.case_id
    }
  });
  return {
    approval: row
  };
});
const recordCaseAttachment_createServerFn_handler = createServerRpc({
  id: "450c2850d094d4deeb12475a25fa4d62ce8ce454eff78dd7b2f3d4c40f67098c",
  name: "recordCaseAttachment",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => recordCaseAttachment.__executeServer(opts));
const recordCaseAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid(),
  storage_path: stringType().min(1).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(120).optional().nullable(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional().nullable()
}).parse(d)).handler(recordCaseAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: row,
    error
  } = await supabase.from("disciplinary_attachments").insert({
    ...data,
    tenant_id,
    uploaded_by: userId
  }).select().single();
  if (error) throw error;
  await supabase.from("disciplinary_actions").insert({
    case_id: data.case_id,
    tenant_id,
    performed_by: userId,
    action_type: "document_attached",
    notes: `Attached: ${data.file_name}`
  });
  return {
    attachment: row
  };
});
const listCaseAttachments_createServerFn_handler = createServerRpc({
  id: "3626d58098700108e1af2e20841b5c131acf906f4795180c4a2ae74b3bf163f9",
  name: "listCaseAttachments",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listCaseAttachments.__executeServer(opts));
const listCaseAttachments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  case_id: stringType().uuid()
}).parse(d)).handler(listCaseAttachments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("disciplinary_attachments").select("*").eq("case_id", data.case_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    attachments: rows ?? []
  };
});
const deleteCaseAttachment_createServerFn_handler = createServerRpc({
  id: "bc712b193130f003731961ea9744f78e2c38f9eb06d9d8058aade9a3a369e653",
  name: "deleteCaseAttachment",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => deleteCaseAttachment.__executeServer(opts));
const deleteCaseAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCaseAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: row
  } = await supabase.from("disciplinary_attachments").select("storage_path").eq("id", data.id).single();
  if (row?.storage_path) await supabase.storage.from("disciplinary-files").remove([row.storage_path]);
  const {
    error
  } = await supabase.from("disciplinary_attachments").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const getAttachmentDownloadUrl_createServerFn_handler = createServerRpc({
  id: "8475f2eb35958e96d327092198cf7e3face4314ce3647d04ec4f59eaa13efefb",
  name: "getAttachmentDownloadUrl",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => getAttachmentDownloadUrl.__executeServer(opts));
const getAttachmentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  storage_path: stringType().min(1).max(500)
}).parse(d)).handler(getAttachmentDownloadUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: signed,
    error
  } = await supabase.storage.from("disciplinary-files").createSignedUrl(data.storage_path, 60 * 10);
  if (error) throw error;
  return {
    url: signed.signedUrl
  };
});
const GrievanceSchema = objectType({
  id: stringType().uuid().optional(),
  against_employee_id: stringType().uuid().optional().nullable(),
  category: enumType(["harassment", "discrimination", "workplace", "pay", "management", "safety", "other"]),
  subject: stringType().min(1).max(200),
  description: stringType().min(1).max(5e3),
  is_anonymous: booleanType().default(false),
  severity: enumType(["low", "medium", "high", "critical"]).default("medium")
});
const GrievanceUpdateSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["submitted", "acknowledged", "investigating", "resolved", "dismissed"]).optional(),
  assigned_to: stringType().uuid().optional().nullable(),
  resolution: stringType().max(4e3).optional().nullable(),
  severity: enumType(["low", "medium", "high", "critical"]).optional()
});
const listGrievances_createServerFn_handler = createServerRpc({
  id: "3a438b4a0d2d96312e1412c80cd1a42846047e9ae6afe8fe934ae87621f257a8",
  name: "listGrievances",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listGrievances.__executeServer(opts));
const listGrievances = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all"]).default("all")
}).parse(d ?? {})).handler(listGrievances_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("grievances").select("*, against:against_employee_id(id,first_name,last_name), filer:filer_employee_id(id,first_name,last_name)").order("created_at", {
    ascending: false
  });
  if (data.scope === "me") q = q.eq("filer_user_id", userId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    grievances: rows ?? []
  };
});
const fileGrievance_createServerFn_handler = createServerRpc({
  id: "744cb23bdc1c0d5915d9b3c715b338e6bdb151e44020b749709875c8ef08032c",
  name: "fileGrievance",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => fileGrievance.__executeServer(opts));
const fileGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => GrievanceSchema.parse(d)).handler(fileGrievance_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  const {
    data: row,
    error
  } = await supabase.from("grievances").insert({
    ...data,
    tenant_id,
    filer_user_id: userId,
    filer_employee_id: emp?.id ?? null
  }).select().single();
  if (error) throw error;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: admins
  } = await supabaseAdmin.from("profiles").select("id").eq("tenant_id", tenant_id);
  const {
    data: roles
  } = await supabaseAdmin.from("user_roles").select("user_id").in("role", ["org_admin", "manager"]);
  const adminIds = (admins ?? []).map((a) => a.id);
  const roleIds = new Set((roles ?? []).map((r) => r.user_id));
  const targets = adminIds.filter((id) => roleIds.has(id));
  await notify({
    tenant_id,
    user_ids: targets,
    kind: "grievance_filed",
    title: "New grievance filed",
    body: `${row.is_anonymous ? "Anonymous" : "An employee"} filed: ${row.subject}`,
    link: "/admin/discipline",
    metadata: {
      grievance_id: row.id,
      severity: row.severity
    }
  });
  return {
    grievance: row
  };
});
const updateGrievance_createServerFn_handler = createServerRpc({
  id: "dc94ab1ddd11d3d0b8dd832a4e5327a85d026039c7aa2ac95c3b5e8199ca90e6",
  name: "updateGrievance",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => updateGrievance.__executeServer(opts));
const updateGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => GrievanceUpdateSchema.parse(d)).handler(updateGrievance_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    id,
    ...rest
  } = data;
  const payload = {
    ...rest
  };
  if (rest.status === "resolved" || rest.status === "dismissed") {
    payload.resolved_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const {
    data: row,
    error
  } = await supabase.from("grievances").update(payload).eq("id", id).select().single();
  if (error) throw error;
  if (rest.status) {
    const targets = [row.filer_user_id, row.assigned_to].filter(Boolean);
    await notify({
      tenant_id: row.tenant_id,
      user_ids: Array.from(new Set(targets)),
      kind: `grievance_${rest.status}`,
      title: `Grievance ${rest.status}`,
      body: `"${row.subject}" is now ${rest.status}.`,
      link: "/me/grievances",
      metadata: {
        grievance_id: row.id
      }
    });
  }
  if (rest.assigned_to) {
    await notify({
      tenant_id: row.tenant_id,
      user_ids: [rest.assigned_to],
      kind: "grievance_assigned",
      title: "Grievance assigned to you",
      body: `"${row.subject}" — please review.`,
      link: "/admin/discipline",
      metadata: {
        grievance_id: row.id
      }
    });
  }
  return {
    grievance: row
  };
});
const withdrawGrievance_createServerFn_handler = createServerRpc({
  id: "fcec3e78436396cc4a06fae10c266dce20d3882812c5f688238fbb402849288a",
  name: "withdrawGrievance",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => withdrawGrievance.__executeServer(opts));
const withdrawGrievance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(withdrawGrievance_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("grievances").update({
    status: "dismissed",
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolution: "Withdrawn by filer"
  }).eq("id", data.id).eq("filer_user_id", userId).select().single();
  if (error) throw error;
  return {
    grievance: row
  };
});
const listGrievanceComments_createServerFn_handler = createServerRpc({
  id: "757f0ee24b32e336dd618a12769e63e6b042a752af2ac7688c83bdb7465ea5c2",
  name: "listGrievanceComments",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listGrievanceComments.__executeServer(opts));
const listGrievanceComments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid()
}).parse(d)).handler(listGrievanceComments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("grievance_comments").select("*, profiles:author_id(full_name,email)").eq("grievance_id", data.grievance_id).order("created_at", {
    ascending: true
  });
  if (error) throw error;
  return {
    comments: rows ?? []
  };
});
const addGrievanceComment_createServerFn_handler = createServerRpc({
  id: "f8e3bded2e85be19044a01c21ccaaa46c9af56cb2329cc7be4c47cf49cc67772",
  name: "addGrievanceComment",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => addGrievanceComment.__executeServer(opts));
const addGrievanceComment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid(),
  comment: stringType().min(1).max(4e3),
  is_internal: booleanType().default(false)
}).parse(d)).handler(addGrievanceComment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: row,
    error
  } = await supabase.from("grievance_comments").insert({
    ...data,
    tenant_id,
    author_id: userId
  }).select().single();
  if (error) throw error;
  if (!data.is_internal) {
    const {
      data: g
    } = await supabase.from("grievances").select("filer_user_id,assigned_to,subject").eq("id", data.grievance_id).single();
    if (g) {
      const targets = [g.filer_user_id, g.assigned_to].filter((u) => u && u !== userId);
      await notify({
        tenant_id,
        user_ids: Array.from(new Set(targets)),
        kind: "grievance_comment",
        title: "New grievance comment",
        body: `New comment on "${g.subject}".`,
        link: "/me/grievances",
        metadata: {
          grievance_id: data.grievance_id
        }
      });
    }
  }
  return {
    comment: row
  };
});
const recordGrievanceAttachment_createServerFn_handler = createServerRpc({
  id: "5f63873bc3979e64b4a61a6beed91fb184d9a5afb659c9a00f3d0c9d8a93c3d5",
  name: "recordGrievanceAttachment",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => recordGrievanceAttachment.__executeServer(opts));
const recordGrievanceAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid(),
  storage_path: stringType().min(1).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(120).optional().nullable(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional().nullable()
}).parse(d)).handler(recordGrievanceAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: row,
    error
  } = await supabase.from("grievance_attachments").insert({
    ...data,
    tenant_id,
    uploaded_by: userId
  }).select().single();
  if (error) throw error;
  return {
    attachment: row
  };
});
const listGrievanceAttachments_createServerFn_handler = createServerRpc({
  id: "01b8467da135182d02b4c1e430e784aafeba1fee2ec28a2aa300c85146bfa5f3",
  name: "listGrievanceAttachments",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listGrievanceAttachments.__executeServer(opts));
const listGrievanceAttachments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  grievance_id: stringType().uuid()
}).parse(d)).handler(listGrievanceAttachments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("grievance_attachments").select("*").eq("grievance_id", data.grievance_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    attachments: rows ?? []
  };
});
const deleteGrievanceAttachment_createServerFn_handler = createServerRpc({
  id: "b0a27f2d10824671bbac900bf31e8d2589d40e45e4469cd29a8aa86a0b6f32c5",
  name: "deleteGrievanceAttachment",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => deleteGrievanceAttachment.__executeServer(opts));
const deleteGrievanceAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGrievanceAttachment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: row
  } = await supabase.from("grievance_attachments").select("storage_path").eq("id", data.id).single();
  if (row?.storage_path) await supabase.storage.from("disciplinary-files").remove([row.storage_path]);
  const {
    error
  } = await supabase.from("grievance_attachments").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listHrUsers_createServerFn_handler = createServerRpc({
  id: "cb5d34f0a4888e01931179354c19068d89b2637fc45396fb4bf55f91e4e57e91",
  name: "listHrUsers",
  filename: "src/lib/discipline.functions.ts"
}, (opts) => listHrUsers.__executeServer(opts));
const listHrUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listHrUsers_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: profs
  } = await supabaseAdmin.from("profiles").select("id,full_name,email").eq("tenant_id", tenant_id);
  const ids = (profs ?? []).map((p) => p.id);
  if (!ids.length) return {
    users: []
  };
  const {
    data: roles
  } = await supabaseAdmin.from("user_roles").select("user_id,role").in("user_id", ids).in("role", ["manager", "org_admin", "super_admin"]);
  const allowed = new Set((roles ?? []).map((r) => r.user_id));
  return {
    users: (profs ?? []).filter((p) => allowed.has(p.id))
  };
});
export {
  addAction_createServerFn_handler,
  addGrievanceComment_createServerFn_handler,
  assignCase_createServerFn_handler,
  decideApproval_createServerFn_handler,
  deleteAction_createServerFn_handler,
  deleteCaseAttachment_createServerFn_handler,
  deleteCase_createServerFn_handler,
  deleteGrievanceAttachment_createServerFn_handler,
  fileGrievance_createServerFn_handler,
  getAttachmentDownloadUrl_createServerFn_handler,
  listActions_createServerFn_handler,
  listApprovals_createServerFn_handler,
  listCaseAttachments_createServerFn_handler,
  listCases_createServerFn_handler,
  listGrievanceAttachments_createServerFn_handler,
  listGrievanceComments_createServerFn_handler,
  listGrievances_createServerFn_handler,
  listHrUsers_createServerFn_handler,
  recordCaseAttachment_createServerFn_handler,
  recordGrievanceAttachment_createServerFn_handler,
  requestApproval_createServerFn_handler,
  transitionCaseStatus_createServerFn_handler,
  updateGrievance_createServerFn_handler,
  upsertCase_createServerFn_handler,
  withdrawGrievance_createServerFn_handler
};
