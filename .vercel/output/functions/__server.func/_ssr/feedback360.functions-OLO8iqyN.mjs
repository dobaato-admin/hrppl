import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, D as arrayType, A as booleanType, B as enumType } from "../_libs/zod.mjs";
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
async function getRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
const ResponseSchema = objectType({
  questionId: stringType().min(1).max(64),
  rating: numberType().int().min(0).max(10).nullable().optional(),
  text: stringType().max(5e3).nullable().optional()
});
const QuestionSchema = objectType({
  id: stringType().min(1).max(64),
  label: stringType().min(1).max(500),
  type: enumType(["rating", "text"]),
  required: booleanType().default(false),
  scaleMin: numberType().int().min(0).max(10).optional(),
  scaleMax: numberType().int().min(1).max(10).optional(),
  scaleLabels: arrayType(stringType().max(100)).max(11).optional()
});
const upsertFeedbackTemplate_createServerFn_handler = createServerRpc({
  id: "8a3cbd0762c649d4c9c8f45bce36c03bf340a5100f3d9913e98bfd84758bddf4",
  name: "upsertFeedbackTemplate",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => upsertFeedbackTemplate.__executeServer(opts));
const upsertFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).optional(),
  isDefault: booleanType().default(false),
  questions: arrayType(QuestionSchema).min(1).max(30),
  changeNote: stringType().max(500).optional()
}).parse(d)).handler(upsertFeedbackTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  if (data.id) {
    const {
      data: existing,
      error: eErr
    } = await supabase.from("feedback_question_templates").select("id,parent_template_id,tenant_id").eq("id", data.id).maybeSingle();
    if (eErr || !existing) throw new Error("Template not found");
    if (existing.tenant_id !== profile.tenant_id) throw new Error("Forbidden");
    const familyRoot = existing.parent_template_id ?? existing.id;
    const {
      data: maxRow
    } = await supabase.from("feedback_question_templates").select("version").eq("parent_template_id", familyRoot).order("version", {
      ascending: false
    }).limit(1).maybeSingle();
    const nextVersion = (maxRow?.version ?? 1) + 1;
    const {
      error: cErr
    } = await supabase.from("feedback_question_templates").update({
      is_current: false
    }).eq("parent_template_id", familyRoot);
    if (cErr) throw new Error(cErr.message);
    if (data.isDefault) {
      await supabase.from("feedback_question_templates").update({
        is_default: false
      }).eq("tenant_id", profile.tenant_id);
    }
    const {
      data: ins2,
      error: iErr
    } = await supabase.from("feedback_question_templates").insert({
      tenant_id: profile.tenant_id,
      name: data.name,
      description: data.description ?? null,
      is_default: data.isDefault,
      questions: data.questions,
      created_by: userId,
      updated_by: userId,
      parent_template_id: familyRoot,
      version: nextVersion,
      is_current: true,
      change_note: data.changeNote ?? null
    }).select("id,version").single();
    if (iErr) throw new Error(iErr.message);
    return {
      ok: true,
      id: ins2.id,
      version: ins2.version
    };
  }
  if (data.isDefault) {
    await supabase.from("feedback_question_templates").update({
      is_default: false
    }).eq("tenant_id", profile.tenant_id);
  }
  const {
    data: ins,
    error
  } = await supabase.from("feedback_question_templates").insert({
    tenant_id: profile.tenant_id,
    name: data.name,
    description: data.description ?? null,
    is_default: data.isDefault,
    questions: data.questions,
    created_by: userId,
    updated_by: userId,
    version: 1,
    is_current: true,
    change_note: data.changeNote ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabase.from("feedback_question_templates").update({
    parent_template_id: ins.id
  }).eq("id", ins.id);
  return {
    ok: true,
    id: ins.id,
    version: 1
  };
});
const deleteFeedbackTemplate_createServerFn_handler = createServerRpc({
  id: "8e4f128091dcce2cca9cc436de545dbb196b9571375614b6433ff8b3ae8ceced",
  name: "deleteFeedbackTemplate",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => deleteFeedbackTemplate.__executeServer(opts));
const deleteFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteFeedbackTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: row
  } = await supabase.from("feedback_question_templates").select("id,parent_template_id").eq("id", data.id).maybeSingle();
  if (!row) return {
    ok: true
  };
  const familyRoot = row.parent_template_id ?? row.id;
  const {
    error
  } = await supabase.from("feedback_question_templates").delete().or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getFeedbackTemplateHistory_createServerFn_handler = createServerRpc({
  id: "c1912505b88cbebe86baabd274aac8518d17029053430a81d32c7ddb0b7fe392",
  name: "getFeedbackTemplateHistory",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => getFeedbackTemplateHistory.__executeServer(opts));
const getFeedbackTemplateHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid()
}).parse(d)).handler(getFeedbackTemplateHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  const {
    data: row
  } = await supabase.from("feedback_question_templates").select("id,parent_template_id,tenant_id").eq("id", data.templateId).maybeSingle();
  if (!row || row.tenant_id !== profile.tenant_id) throw new Error("Not found");
  const familyRoot = row.parent_template_id ?? row.id;
  const {
    data: versions,
    error
  } = await supabase.from("feedback_question_templates").select("id,version,name,description,questions,is_current,is_default,change_note,created_at,created_by,updated_by").or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`).order("version", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    versions: versions ?? []
  };
});
const archiveFeedbackTemplate_createServerFn_handler = createServerRpc({
  id: "e2a9650cd2539a7bd9e8d26e5c179a67bbb29f89b118a4485c23eea7a8508ee2",
  name: "archiveFeedbackTemplate",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => archiveFeedbackTemplate.__executeServer(opts));
const archiveFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(archiveFeedbackTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  const {
    data: row
  } = await supabase.from("feedback_question_templates").select("id,parent_template_id,tenant_id").eq("id", data.id).maybeSingle();
  if (!row || row.tenant_id !== profile.tenant_id) throw new Error("Not found");
  const familyRoot = row.parent_template_id ?? row.id;
  const {
    error
  } = await supabase.from("feedback_question_templates").update({
    is_current: false,
    is_default: false
  }).or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`).eq("tenant_id", profile.tenant_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const restoreFeedbackTemplate_createServerFn_handler = createServerRpc({
  id: "de8015cbeb820e5fdb1746d4e31234cfff692d66d49ee49d44e0e1a9a4f92c33",
  name: "restoreFeedbackTemplate",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => restoreFeedbackTemplate.__executeServer(opts));
const restoreFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(restoreFeedbackTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  const {
    data: row
  } = await supabase.from("feedback_question_templates").select("id,parent_template_id,tenant_id").eq("id", data.id).maybeSingle();
  if (!row || row.tenant_id !== profile.tenant_id) throw new Error("Not found");
  const familyRoot = row.parent_template_id ?? row.id;
  const {
    data: latest
  } = await supabase.from("feedback_question_templates").select("id").or(`id.eq.${familyRoot},parent_template_id.eq.${familyRoot}`).eq("tenant_id", profile.tenant_id).order("version", {
    ascending: false
  }).limit(1).maybeSingle();
  if (!latest) throw new Error("No versions found");
  const {
    error
  } = await supabase.from("feedback_question_templates").update({
    is_current: true
  }).eq("id", latest.id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: latest.id
  };
});
const listArchivedFeedbackTemplates_createServerFn_handler = createServerRpc({
  id: "730de2529e1bdb63993805f5f3e041f8e65dc8130d29d45476d76a3b42f53a6b",
  name: "listArchivedFeedbackTemplates",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => listArchivedFeedbackTemplates.__executeServer(opts));
const listArchivedFeedbackTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listArchivedFeedbackTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  const {
    data: rows
  } = await supabase.from("feedback_question_templates").select("id,parent_template_id,name,description,version,questions,created_at").eq("tenant_id", profile.tenant_id).eq("is_current", false).order("created_at", {
    ascending: false
  });
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const r of rows ?? []) {
    const fam = r.parent_template_id ?? r.id;
    if (seen.has(fam)) continue;
    seen.add(fam);
    out.push(r);
  }
  return {
    templates: out
  };
});
const requestFeedback360_createServerFn_handler = createServerRpc({
  id: "256610d3536a5f0fe3cec696bac0039169d045fdd3e6d7aed93433501349521a",
  name: "requestFeedback360",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => requestFeedback360.__executeServer(opts));
const requestFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  requestedUserIds: arrayType(stringType().uuid()).min(1).max(20),
  kind: enumType(["peer", "upward"]).default("peer"),
  message: stringType().max(1e3).optional(),
  templateId: stringType().uuid().optional(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).parse(d)).handler(requestFeedback360_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: review,
    error: rErr
  } = await supabase.from("performance_reviews").select("id,tenant_id,employee_id").eq("id", data.reviewId).maybeSingle();
  if (rErr || !review) throw new Error("Review not found");
  const roles = await getRoles(supabase, userId);
  const isAdmin = roles.some((r) => ["org_admin", "super_admin"].includes(r));
  let allowed = isAdmin;
  if (!allowed) {
    const {
      data: emp
    } = await supabase.from("employees").select("id,user_id,manager_id").eq("id", review.employee_id).maybeSingle();
    if (emp?.user_id === userId) allowed = true;
    else if (emp?.manager_id) {
      const {
        data: mgr
      } = await supabase.from("employees").select("user_id").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.user_id === userId) allowed = true;
    }
  }
  if (!allowed) throw new Error("Not authorized to request feedback for this review");
  let templateVersion = null;
  if (data.templateId) {
    const {
      data: t
    } = await supabase.from("feedback_question_templates").select("version,tenant_id").eq("id", data.templateId).maybeSingle();
    if (!t || t.tenant_id !== review.tenant_id) throw new Error("Template not in tenant");
    templateVersion = t.version ?? null;
  }
  const rows = data.requestedUserIds.filter((u) => u !== userId).map((u) => ({
    tenant_id: review.tenant_id,
    review_id: review.id,
    subject_employee_id: review.employee_id,
    requester_id: userId,
    requested_user_id: u,
    kind: data.kind,
    message: data.message ?? null,
    template_id: data.templateId ?? null,
    template_version: templateVersion,
    due_date: data.dueDate ?? null
  }));
  if (rows.length === 0) return {
    ok: true,
    inserted: 0
  };
  const {
    error
  } = await supabase.from("review_feedback_requests").upsert(rows, {
    onConflict: "review_id,requested_user_id,kind",
    ignoreDuplicates: true
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    inserted: rows.length
  };
});
const submitFeedback360_createServerFn_handler = createServerRpc({
  id: "cc922d2989421e98b065febdf00ca598b5ac90fddb1c459193baa081ac8d532d",
  name: "submitFeedback360",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => submitFeedback360.__executeServer(opts));
const submitFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  text: stringType().max(5e3).optional(),
  responses: arrayType(ResponseSchema).max(30).optional()
}).parse(d)).handler(submitFeedback360_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: req,
    error: qErr
  } = await supabase.from("review_feedback_requests").select("id,tenant_id,review_id,kind,requested_user_id,status,template_id,template_version").eq("id", data.requestId).maybeSingle();
  if (qErr || !req) throw new Error("Request not found");
  if (req.requested_user_id !== userId) throw new Error("Not your feedback request");
  if (req.status !== "pending") throw new Error("Request is no longer open");
  const responses = data.responses ?? [];
  const ratings = responses.map((r) => r.rating).filter((v) => typeof v === "number");
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const textFallback = data.text ?? responses.filter((r) => r.text).map((r) => `${r.questionId}: ${r.text}`).join("\n\n");
  if (!textFallback && responses.length === 0) throw new Error("Provide a response");
  const {
    data: fb,
    error: fbErr
  } = await supabase.from("review_feedback").insert({
    tenant_id: req.tenant_id,
    review_id: req.review_id,
    author_id: userId,
    kind: req.kind,
    text: textFallback || "(structured response)",
    template_id: req.template_id,
    template_version: req.template_version ?? null,
    responses,
    avg_rating: avgRating
  }).select("id").single();
  if (fbErr) throw new Error(fbErr.message);
  const {
    error: uErr
  } = await supabase.from("review_feedback_requests").update({
    status: "submitted",
    responded_at: (/* @__PURE__ */ new Date()).toISOString(),
    feedback_id: fb.id
  }).eq("id", req.id);
  if (uErr) throw new Error(uErr.message);
  return {
    ok: true
  };
});
const declineFeedback360_createServerFn_handler = createServerRpc({
  id: "9ce21da18b3903926da35447be9545ce4b4c628dbf53926af8df8014a24cab66",
  name: "declineFeedback360",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => declineFeedback360.__executeServer(opts));
const declineFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(declineFeedback360_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: req
  } = await supabase.from("review_feedback_requests").select("id,requested_user_id,status").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  if (req.requested_user_id !== userId) throw new Error("Not your feedback request");
  if (req.status !== "pending") throw new Error("Request is no longer open");
  const {
    error
  } = await supabase.from("review_feedback_requests").update({
    status: "declined",
    responded_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", req.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const sendFeedbackReminders_createServerFn_handler = createServerRpc({
  id: "8d97518090a7ed3678536574eb4f24bc35f04fd4088aa680f1874fbeda8a2780",
  name: "sendFeedbackReminders",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => sendFeedbackReminders.__executeServer(opts));
const sendFeedbackReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(sendFeedbackReminders_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
    throw new Error("Not authorized");
  }
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: pending
  } = await supabase.from("review_feedback_requests").select("id,due_date,reminder_count,last_reminder_at").eq("tenant_id", profile.tenant_id).eq("status", "pending");
  let bumped = 0;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
  for (const r of pending ?? []) {
    const overdueOrUpcoming = !r.due_date || r.due_date <= today;
    if (!overdueOrUpcoming) continue;
    if (r.last_reminder_at && r.last_reminder_at > cutoff) continue;
    const {
      error
    } = await supabase.from("review_feedback_requests").update({
      last_reminder_at: (/* @__PURE__ */ new Date()).toISOString(),
      reminder_count: (r.reminder_count ?? 0) + 1
    }).eq("id", r.id);
    if (!error) bumped += 1;
  }
  return {
    ok: true,
    reminded: bumped
  };
});
const getFeedback360Analytics_createServerFn_handler = createServerRpc({
  id: "88a18470a3068bf022f3cb35cfe7da43e3a6b3492b9ab6a3cf421906f9f3037e",
  name: "getFeedback360Analytics",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => getFeedback360Analytics.__executeServer(opts));
const getFeedback360Analytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid().optional()
}).parse(d ?? {})).handler(getFeedback360Analytics_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
    throw new Error("Not authorized");
  }
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  let reviewIds = null;
  if (data.cycleId) {
    const {
      data: revs
    } = await supabase.from("performance_reviews").select("id").eq("cycle_id", data.cycleId);
    reviewIds = (revs ?? []).map((r) => r.id);
    if (reviewIds.length === 0) {
      return {
        totals: {
          requested: 0,
          submitted: 0,
          declined: 0,
          pending: 0,
          overdue: 0
        },
        avgRating: null,
        byKind: {
          peer: 0,
          upward: 0
        },
        perEmployee: []
      };
    }
  }
  let reqQuery = supabase.from("review_feedback_requests").select("id,status,kind,due_date,subject_employee_id,review_id").eq("tenant_id", profile.tenant_id);
  if (reviewIds) reqQuery = reqQuery.in("review_id", reviewIds);
  const {
    data: requests
  } = await reqQuery;
  let fbQuery = supabase.from("review_feedback").select("id,avg_rating,kind,review_id").eq("tenant_id", profile.tenant_id).not("avg_rating", "is", null);
  if (reviewIds) fbQuery = fbQuery.in("review_id", reviewIds);
  const {
    data: feedbacks
  } = await fbQuery;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const totals = {
    requested: 0,
    submitted: 0,
    declined: 0,
    pending: 0,
    overdue: 0
  };
  const byKind = {
    peer: 0,
    upward: 0
  };
  const perEmpMap = {};
  for (const r of requests ?? []) {
    totals.requested += 1;
    if (r.status === "submitted") totals.submitted += 1;
    else if (r.status === "declined") totals.declined += 1;
    else {
      totals.pending += 1;
      if (r.due_date && r.due_date < today) totals.overdue += 1;
    }
    if (r.kind === "peer" || r.kind === "upward") byKind[r.kind] += 1;
    const k = r.subject_employee_id;
    perEmpMap[k] ||= {
      submitted: 0,
      pending: 0,
      declined: 0
    };
    if (r.status === "submitted") perEmpMap[k].submitted += 1;
    else if (r.status === "declined") perEmpMap[k].declined += 1;
    else perEmpMap[k].pending += 1;
  }
  const ratings = (feedbacks ?? []).map((f) => Number(f.avg_rating)).filter((n) => Number.isFinite(n));
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const responseRate = totals.requested > 0 ? totals.submitted / totals.requested : null;
  return {
    totals,
    avgRating,
    responseRate,
    byKind,
    perEmployee: Object.entries(perEmpMap).map(([employeeId, v]) => ({
      employeeId,
      ...v
    }))
  };
});
const getFeedback360AuditTrail_createServerFn_handler = createServerRpc({
  id: "ea0fcce4b3530f296c16700d87f16700c1cab5b2bef072a5383f3c53c027efc2",
  name: "getFeedback360AuditTrail",
  filename: "src/lib/feedback360.functions.ts"
}, (opts) => getFeedback360AuditTrail.__executeServer(opts));
const getFeedback360AuditTrail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(100)
}).parse(d ?? {})).handler(getFeedback360AuditTrail_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
    throw new Error("Not authorized");
  }
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No tenant");
  let q = supabase.from("audit_log").select("id,entity_type,entity_id,action,actor_id,metadata,created_at").eq("entity_type", "review_feedback_request").order("created_at", {
    ascending: false
  }).limit(data.limit);
  const {
    data: rows
  } = await q;
  const filtered = (rows ?? []).filter((r) => {
    const meta = r.metadata ?? {};
    if (meta.tenant_id && meta.tenant_id !== profile.tenant_id) return false;
    if (data.reviewId && meta.review_id && meta.review_id !== data.reviewId) return false;
    return true;
  });
  return {
    entries: filtered
  };
});
export {
  archiveFeedbackTemplate_createServerFn_handler,
  declineFeedback360_createServerFn_handler,
  deleteFeedbackTemplate_createServerFn_handler,
  getFeedback360Analytics_createServerFn_handler,
  getFeedback360AuditTrail_createServerFn_handler,
  getFeedbackTemplateHistory_createServerFn_handler,
  listArchivedFeedbackTemplates_createServerFn_handler,
  requestFeedback360_createServerFn_handler,
  restoreFeedbackTemplate_createServerFn_handler,
  sendFeedbackReminders_createServerFn_handler,
  submitFeedback360_createServerFn_handler,
  upsertFeedbackTemplate_createServerFn_handler
};
