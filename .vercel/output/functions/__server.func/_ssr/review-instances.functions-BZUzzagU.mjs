import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { D as arrayType, a as objectType, z as stringType, C as numberType, B as enumType, F as anyType } from "../_libs/zod.mjs";
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
function defaultPeriodLabels(type) {
  switch (type) {
    case "monthly":
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    case "quarterly":
      return ["Q1", "Q2", "Q3", "Q4"];
    case "half_yearly":
      return ["H1", "H2"];
    case "annual":
      return ["Annual"];
    default:
      return [];
  }
}
function expandSchedule(s, from, to) {
  if (!s) return [];
  const out = [];
  const startBase = s.startDate ? /* @__PURE__ */ new Date(s.startDate + "T00:00:00Z") : from;
  if (s.type === "custom") {
    for (const p of s.periods ?? []) {
      const d = /^\d{4}-\d{2}(-\d{2})?$/.test(p) ? /* @__PURE__ */ new Date((p.length === 7 ? p + "-01" : p) + "T00:00:00Z") : startBase;
      if (d >= from && d <= to) out.push({ period: p, date: d });
    }
    return out;
  }
  const cadenceMonths = {
    monthly: 1,
    quarterly: 3,
    half_yearly: 6,
    annual: 12
  };
  const step = cadenceMonths[s.type] ?? 0;
  if (!step) return out;
  const labels = s.periods ?? defaultPeriodLabels(s.type);
  const year = (s.startDate ? new Date(s.startDate) : from).getUTCFullYear();
  for (let i = 0; i < labels.length; i += 1) {
    const monthIdx = i * step;
    const d = new Date(Date.UTC(year, monthIdx, 1));
    if (d >= from && d <= to) out.push({ period: labels[i], date: d });
  }
  return out;
}
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function getRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
async function requireAdmin(supabase, userId) {
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
    throw new Error("Not authorized");
  }
}
const URL_RE = /^(https?:\/\/|data:|blob:)[^\s]+$/i;
function validateEvidence(comp, evidence) {
  const minCount = comp?.evidenceEnabled ? comp.minEvidenceCount ?? 0 : 0;
  const required = comp?.evidenceEnabled ? comp.requiredEvidenceTypes ?? [] : [];
  const haveTypes = new Set(evidence.map((e) => e.type));
  const missingTypes = required.filter((t) => !haveTypes.has(t));
  const invalidUrls = evidence.map((e, i) => ({
    index: i,
    name: e.name,
    url: e.url
  })).filter((e) => !URL_RE.test(e.url ?? ""));
  const lacking = evidence.length < minCount;
  const ok = !lacking && missingTypes.length === 0 && invalidUrls.length === 0;
  let message;
  if (!ok) {
    const parts = [];
    if (lacking) parts.push(`Need at least ${minCount} evidence item(s) (have ${evidence.length}).`);
    if (missingTypes.length) parts.push(`Missing required type(s): ${missingTypes.join(", ")}.`);
    if (invalidUrls.length) parts.push(`Invalid URL on: ${invalidUrls.map((x) => x.name || `#${x.index + 1}`).join(", ")}.`);
    message = parts.join(" ");
  }
  return {
    ok,
    missingTypes,
    minCount,
    haveCount: evidence.length,
    invalidUrls: invalidUrls.map(({
      index,
      name
    }) => ({
      index,
      name
    })),
    message
  };
}
const evidenceSchema = arrayType(objectType({
  type: enumType(["document", "url", "social", "screenshot"]),
  name: stringType().max(300),
  url: stringType().max(2e3),
  size: numberType().optional(),
  mime: stringType().max(120).optional()
})).max(20).default([]);
const generateReviewInstances_createServerFn_handler = createServerRpc({
  id: "790a65af93936e0b362a1c57b42f24cbd2a28bb583684e9d39b15093108a8301",
  name: "generateReviewInstances",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => generateReviewInstances.__executeServer(opts));
const generateReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid(),
  employeeIds: arrayType(stringType().uuid()).min(1).max(2e3).optional(),
  horizonDays: numberType().int().min(7).max(730).default(365),
  dueOffsetDays: numberType().int().min(0).max(60).default(7)
}).parse(d)).handler(generateReviewInstances_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context.supabase, context.userId);
  const admin = await loadAdmin();
  const {
    data: tpl
  } = await admin.from("review_templates").select("id,tenant_id,version,competencies").eq("id", data.templateId).maybeSingle();
  if (!tpl) throw new Error("Template not found");
  const t = tpl;
  let empIds = data.employeeIds;
  if (!empIds) {
    const {
      data: emps
    } = await admin.from("employees").select("id").eq("tenant_id", t.tenant_id).eq("status", "active");
    empIds = (emps ?? []).map((e) => e.id);
  }
  if (!empIds.length) return {
    ok: true,
    created: 0
  };
  const today = /* @__PURE__ */ new Date();
  today.setUTCHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + data.horizonDays * 864e5);
  const rows = [];
  for (const comp of t.competencies ?? []) {
    const periods = expandSchedule(comp.schedule, today, horizon);
    if (!periods.length) continue;
    for (const eid of empIds) {
      for (const {
        period,
        date
      } of periods) {
        const due = new Date(date.getTime() + data.dueOffsetDays * 864e5);
        rows.push({
          tenant_id: t.tenant_id,
          template_id: t.id,
          template_version: t.version ?? 1,
          employee_id: eid,
          item_id: comp.id,
          period_label: period,
          scheduled_for: date.toISOString().slice(0, 10),
          due_date: due.toISOString().slice(0, 10),
          status: "pending"
        });
      }
    }
  }
  if (!rows.length) return {
    ok: true,
    created: 0
  };
  const {
    error
  } = await admin.from("review_instances").upsert(rows, {
    onConflict: "template_id,employee_id,item_id,period_label",
    ignoreDuplicates: true
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    created: rows.length
  };
});
const listMyReviewInstances_createServerFn_handler = createServerRpc({
  id: "e996aa2e4316979c321bbbfecc52d2f7df38d77c7078925d12722dbe15b6955a",
  name: "listMyReviewInstances",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => listMyReviewInstances.__executeServer(opts));
const listMyReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["pending", "submitted", "approved", "rejected", "all"]).default("all")
}).parse(d)).handler(listMyReviewInstances_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    instances: [],
    templates: []
  };
  let q = supabase.from("review_instances").select("*").eq("employee_id", emp.id).order("due_date", {
    ascending: true
  });
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const ids = Array.from(new Set((rows ?? []).map((r) => r.template_id)));
  let templates = [];
  if (ids.length) {
    const {
      data: t
    } = await supabase.from("review_templates").select("id,name,scale_min,scale_max,scale_labels,competencies").in("id", ids);
    templates = t ?? [];
  }
  return {
    instances: rows ?? [],
    templates
  };
});
const submitInput = objectType({
  id: stringType().uuid(),
  score: anyType(),
  evidence: evidenceSchema,
  comments: stringType().max(2e3).optional()
});
async function performSubmit(supabase, userId, data, isResubmit) {
  const {
    data: inst
  } = await supabase.from("review_instances").select("id,employee_id,template_id,item_id,status,version,tenant_id,score,evidence,reviewer_comments,submitted_at,reviewed_at").eq("id", data.id).maybeSingle();
  if (!inst) throw new Error("Not found");
  const i = inst;
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp || emp.id !== i.employee_id) throw new Error("Not your scorecard");
  if (isResubmit && i.status !== "rejected") throw new Error("Only rejected scorecards can be resubmitted");
  if (!isResubmit && !["pending", "rejected"].includes(i.status)) {
    throw new Error("This scorecard has already been submitted");
  }
  const {
    data: tpl
  } = await supabase.from("review_templates").select("competencies").eq("id", i.template_id).maybeSingle();
  const comp = (tpl?.competencies ?? []).find((c) => c.id === i.item_id);
  const validation = validateEvidence(comp, data.evidence);
  if (!validation.ok) {
    const err = new Error(validation.message || "Evidence requirements not met");
    err.validation = validation;
    throw err;
  }
  if (isResubmit) {
    await supabase.from("review_instance_versions").insert({
      tenant_id: i.tenant_id,
      instance_id: i.id,
      version: i.version ?? 1,
      status: i.status,
      score: i.score,
      evidence: i.evidence ?? [],
      reviewer_comments: i.reviewer_comments,
      submitted_at: i.submitted_at,
      reviewed_at: i.reviewed_at,
      snapshot_reason: "resubmit",
      actor_id: userId
    });
  }
  const newVersion = isResubmit ? (i.version ?? 1) + 1 : i.version ?? 1;
  const {
    error
  } = await supabase.from("review_instances").update({
    status: "submitted",
    score: data.score ?? null,
    evidence: data.evidence,
    reviewer_comments: isResubmit ? null : i.reviewer_comments,
    submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
    resubmitted_at: isResubmit ? (/* @__PURE__ */ new Date()).toISOString() : null,
    version: newVersion,
    reminder_sent_at: null,
    reminder_count: 0
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    version: newVersion
  };
}
const submitReviewInstance_createServerFn_handler = createServerRpc({
  id: "989dff55afece2dac071e6fc2b6dbfd75e637ee622dad10d1281b880f8f0a8bd",
  name: "submitReviewInstance",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => submitReviewInstance.__executeServer(opts));
const submitReviewInstance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => submitInput.parse(d)).handler(submitReviewInstance_createServerFn_handler, async ({
  data,
  context
}) => performSubmit(context.supabase, context.userId, data, false));
const resubmitReviewInstance_createServerFn_handler = createServerRpc({
  id: "e57535bb30a65d6eaac70f0ea3b7c8267d2e12d99fef3cf0203b66c9cf73ac39",
  name: "resubmitReviewInstance",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => resubmitReviewInstance.__executeServer(opts));
const resubmitReviewInstance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => submitInput.parse(d)).handler(resubmitReviewInstance_createServerFn_handler, async ({
  data,
  context
}) => performSubmit(context.supabase, context.userId, data, true));
const reviewReviewInstance_createServerFn_handler = createServerRpc({
  id: "88c80a0f3ead8fc28b622d847b3487e84a01eeaa27208108ed13ce6fa572744c",
  name: "reviewReviewInstance",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => reviewReviewInstance.__executeServer(opts));
const reviewReviewInstance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  comments: stringType().max(2e3).optional()
}).parse(d)).handler(reviewReviewInstance_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context.supabase, context.userId);
  const {
    data: inst
  } = await context.supabase.from("review_instances").select("id,tenant_id,version,status,score,evidence,reviewer_comments,submitted_at").eq("id", data.id).maybeSingle();
  if (inst) {
    const i = inst;
    await context.supabase.from("review_instance_versions").insert({
      tenant_id: i.tenant_id,
      instance_id: i.id,
      version: i.version ?? 1,
      status: data.decision,
      score: i.score,
      evidence: i.evidence ?? [],
      reviewer_comments: data.comments ?? null,
      submitted_at: i.submitted_at,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
      snapshot_reason: `reviewer_${data.decision}`,
      actor_id: context.userId
    });
  }
  const {
    error
  } = await context.supabase.from("review_instances").update({
    status: data.decision,
    reviewer_id: context.userId,
    reviewer_comments: data.comments ?? null,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    rejected_at: data.decision === "rejected" ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listInstanceVersions_createServerFn_handler = createServerRpc({
  id: "d31900949f8a8524ca890cf6f7cbaf57d06a718d67e63a2e7cc42f8e9e34eeb2",
  name: "listInstanceVersions",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => listInstanceVersions.__executeServer(opts));
const listInstanceVersions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  instanceId: stringType().uuid()
}).parse(d)).handler(listInstanceVersions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("review_instance_versions").select("*").eq("instance_id", data.instanceId).order("version", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    versions: rows ?? []
  };
});
const logTemplateAuditEvent_createServerFn_handler = createServerRpc({
  id: "71319c89323470fef0e46513cdfe7b21575e069016f5e259f98f750d7e35b8c8",
  name: "logTemplateAuditEvent",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => logTemplateAuditEvent.__executeServer(opts));
const logTemplateAuditEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid().nullable(),
  templateName: stringType().min(1).max(200),
  action: enumType(["export", "import"]),
  fileName: stringType().max(300).optional(),
  snapshot: anyType().optional()
}).parse(d)).handler(logTemplateAuditEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id,email").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    error
  } = await supabase.from("review_template_audit_log").insert({
    tenant_id: prof.tenant_id,
    template_id: data.templateId,
    template_name: data.templateName,
    action: data.action,
    file_name: data.fileName ?? null,
    actor_id: userId,
    actor_email: prof.email ?? null,
    snapshot: data.snapshot ?? null
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listTemplateAuditLog_createServerFn_handler = createServerRpc({
  id: "5ced16b0fc5af624ecf22b1105836c4abecf92a5913257253c6701da875a0277",
  name: "listTemplateAuditLog",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => listTemplateAuditLog.__executeServer(opts));
const listTemplateAuditLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  limit: numberType().int().min(1).max(500).default(100),
  action: enumType(["export", "import", "all"]).default("all")
}).parse(d)).handler(listTemplateAuditLog_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  let q = supabase.from("review_template_audit_log").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.action !== "all") q = q.eq("action", data.action);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    entries: rows ?? []
  };
});
const reviewDashboardSummary_createServerFn_handler = createServerRpc({
  id: "fbfbc94005c6d2ccaea1bd22b821c5d1a6ea0fd0b3844729a0979fcff25be5e3",
  name: "reviewDashboardSummary",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => reviewDashboardSummary.__executeServer(opts));
const reviewDashboardSummary = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: stringType().uuid().optional()
}).parse(d)).handler(reviewDashboardSummary_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context.supabase, context.userId);
  const {
    data: prof
  } = await context.supabase.from("profiles").select("tenant_id").eq("id", context.userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  let q = context.supabase.from("review_instances").select("*").eq("tenant_id", prof.tenant_id).gte("scheduled_for", data.from).lte("scheduled_for", data.to);
  if (data.templateId) q = q.eq("template_id", data.templateId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const list = rows ?? [];
  const tplIds = Array.from(new Set(list.map((r) => r.template_id)));
  const {
    data: tpls
  } = tplIds.length ? await context.supabase.from("review_templates").select("id,name,competencies").in("id", tplIds) : {
    data: []
  };
  const tplMap = new Map((tpls ?? []).map((t) => [t.id, t]));
  const total = list.length;
  const byStatus = {
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };
  list.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  });
  const completionRate = total ? (byStatus.approved + byStatus.submitted) / total : 0;
  const byTemplate = /* @__PURE__ */ new Map();
  const byItem = /* @__PURE__ */ new Map();
  let evidenceRequiredTotal = 0;
  let evidenceCompliantTotal = 0;
  for (const r of list) {
    const tpl = tplMap.get(r.template_id);
    const tplName = tpl?.name ?? "Unknown";
    const tBucket = byTemplate.get(r.template_id) ?? {
      templateId: r.template_id,
      name: tplName,
      total: 0,
      approved: 0,
      submitted: 0,
      pending: 0,
      rejected: 0,
      avgScore: null,
      scoreCount: 0
    };
    tBucket.total += 1;
    tBucket[r.status] = (tBucket[r.status] ?? 0) + 1;
    const comp = (tpl?.competencies ?? []).find((c) => c.id === r.item_id);
    const numScore = typeof r.score === "number" ? r.score : typeof r.score === "boolean" ? r.score ? 1 : 0 : null;
    if (numScore != null) {
      tBucket.avgScore = ((tBucket.avgScore ?? 0) * tBucket.scoreCount + numScore) / (tBucket.scoreCount + 1);
      tBucket.scoreCount += 1;
    }
    byTemplate.set(r.template_id, tBucket);
    const key = `${r.template_id}:${r.item_id}`;
    const iBucket = byItem.get(key) ?? {
      templateId: r.template_id,
      itemId: r.item_id,
      label: comp?.label ?? r.item_id,
      total: 0,
      approved: 0,
      avgScore: null,
      scoreCount: 0,
      evidenceCompliant: 0,
      evidenceRequired: 0
    };
    iBucket.total += 1;
    if (r.status === "approved") iBucket.approved += 1;
    if (numScore != null) {
      iBucket.avgScore = ((iBucket.avgScore ?? 0) * iBucket.scoreCount + numScore) / (iBucket.scoreCount + 1);
      iBucket.scoreCount += 1;
    }
    if (comp?.evidenceEnabled) {
      iBucket.evidenceRequired += 1;
      evidenceRequiredTotal += 1;
      const validation = validateEvidence(comp, r.evidence ?? []);
      if (validation.ok && (r.evidence ?? []).length > 0) {
        iBucket.evidenceCompliant += 1;
        evidenceCompliantTotal += 1;
      }
    }
    byItem.set(key, iBucket);
  }
  return {
    range: {
      from: data.from,
      to: data.to
    },
    total,
    byStatus,
    completionRate,
    evidenceCompliance: evidenceRequiredTotal ? evidenceCompliantTotal / evidenceRequiredTotal : null,
    evidenceRequiredTotal,
    evidenceCompliantTotal,
    byTemplate: Array.from(byTemplate.values()),
    byItem: Array.from(byItem.values()).sort((a, b) => b.total - a.total).slice(0, 50)
  };
});
const exportReviewInstances_createServerFn_handler = createServerRpc({
  id: "c5e9858e62caea92711f01160a6acc47174fb636c65eb4657096541c43fe6ea5",
  name: "exportReviewInstances",
  filename: "src/lib/review-instances.functions.ts"
}, (opts) => exportReviewInstances.__executeServer(opts));
const exportReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: stringType().uuid().optional(),
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(exportReviewInstances_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireAdmin(context.supabase, context.userId);
  const {
    data: prof
  } = await context.supabase.from("profiles").select("tenant_id").eq("id", context.userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  let q = context.supabase.from("review_instances").select("*").eq("tenant_id", prof.tenant_id).gte("scheduled_for", data.from).lte("scheduled_for", data.to).order("scheduled_for", {
    ascending: true
  });
  if (data.templateId) q = q.eq("template_id", data.templateId);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const empIds = Array.from(new Set((rows ?? []).map((r) => r.employee_id)));
  const tplIds = Array.from(new Set((rows ?? []).map((r) => r.template_id)));
  const [empRes, tplRes] = await Promise.all([empIds.length ? context.supabase.from("employees").select("id,first_name,last_name,employee_number").in("id", empIds) : Promise.resolve({
    data: []
  }), tplIds.length ? context.supabase.from("review_templates").select("id,name,competencies").in("id", tplIds) : Promise.resolve({
    data: []
  })]);
  const empMap = new Map((empRes.data ?? []).map((e) => [e.id, e]));
  const tplMap = new Map((tplRes.data ?? []).map((t) => [t.id, t]));
  const out = (rows ?? []).map((r) => {
    const e = empMap.get(r.employee_id) ?? {};
    const t = tplMap.get(r.template_id) ?? {};
    const comp = (t.competencies ?? []).find((c) => c.id === r.item_id);
    return {
      instance_id: r.id,
      employee_number: e.employee_number ?? "",
      employee_name: [e.first_name, e.last_name].filter(Boolean).join(" "),
      template: t.name ?? "",
      item: comp?.label ?? r.item_id,
      item_type: comp?.type ?? "",
      period: r.period_label,
      scheduled_for: r.scheduled_for,
      due_date: r.due_date ?? "",
      status: r.status,
      version: r.version ?? 1,
      score: r.score == null ? "" : typeof r.score === "object" ? JSON.stringify(r.score) : String(r.score),
      evidence_count: (r.evidence ?? []).length,
      evidence_types: Array.from(new Set((r.evidence ?? []).map((x) => x.type))).join("|"),
      evidence_urls: (r.evidence ?? []).map((x) => x.url).join("|"),
      submitted_at: r.submitted_at ?? "",
      reviewed_at: r.reviewed_at ?? "",
      reviewer_comments: r.reviewer_comments ?? ""
    };
  });
  return {
    rows: out
  };
});
export {
  exportReviewInstances_createServerFn_handler,
  generateReviewInstances_createServerFn_handler,
  listInstanceVersions_createServerFn_handler,
  listMyReviewInstances_createServerFn_handler,
  listTemplateAuditLog_createServerFn_handler,
  logTemplateAuditEvent_createServerFn_handler,
  resubmitReviewInstance_createServerFn_handler,
  reviewDashboardSummary_createServerFn_handler,
  reviewReviewInstance_createServerFn_handler,
  submitReviewInstance_createServerFn_handler
};
