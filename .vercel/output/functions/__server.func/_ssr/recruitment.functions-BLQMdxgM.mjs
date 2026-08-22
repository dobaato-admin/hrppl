import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { s as src_default } from "../_libs/isomorphic-dompurify.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, z as stringType, C as numberType, D as arrayType, E as recordType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/jsdom.mjs";
import "path";
import "url";
import "fs";
import "vm";
import "node:vm";
import "node:fs";
import "zlib";
import "../_libs/tough-cookie.mjs";
import "../_libs/tldts.mjs";
import "../_libs/tldts-core.mjs";
import "../_libs/html-encoding-sniffer.mjs";
import "../_libs/exodus__bytes.mjs";
import "node:buffer";
import "../_libs/whatwg-url.mjs";
import "../_libs/webidl-conversions.mjs";
import "../_libs/tr46.mjs";
import "../_libs/punycode.mjs";
import "../_libs/whatwg-mimetype.mjs";
import "../_libs/undici.mjs";
import "node:assert";
import "node:net";
import "node:querystring";
import "node:events";
import "node:diagnostics_channel";
import "node:util";
import "node:tls";
import "node:zlib";
import "node:perf_hooks";
import "node:util/types";
import "node:sqlite";
import "node:worker_threads";
import "node:url";
import "node:console";
import "node:fs/promises";
import "node:path";
import "node:timers";
import "node:dns";
import "node:http";
import "node:stream";
import "node:crypto";
import "node:async_hooks";
import "events";
import "util";
import "../_libs/symbol-tree.mjs";
import "../_libs/is-potential-custom-element-name+[...].mjs";
import "../_libs/xml-name-validator.mjs";
import "../_libs/saxes.mjs";
import "../_libs/xmlchars.mjs";
import "../_libs/parse5.mjs";
import "../_libs/entities.mjs";
import "../_libs/w3c-xmlserializer.mjs";
import "../_libs/asamuzakjp__css-color.mjs";
import "../_libs/asamuzakjp__generational-cache.mjs";
import "../_libs/csstools__css-tokenizer.mjs";
import "../_libs/csstools__css-calc.mjs";
import "../_libs/@csstools/css-parser-algorithms+[...].mjs";
import "../_libs/csstools__css-color-parser.mjs";
import "../_libs/csstools__color-helpers.mjs";
import "../_libs/@csstools/css-syntax-patches-for-csstree+[...].mjs";
import "../_libs/css-tree.mjs";
import "../_libs/source-map-js.mjs";
import "../_libs/mdn-data.mjs";
import "module";
import "../_libs/lru-cache.mjs";
import "../_libs/bramus__specificity.mjs";
import "../_libs/asamuzakjp__dom-selector.mjs";
import "../_libs/asamuzakjp__nwsapi.mjs";
import "../_libs/bidi-js.mjs";
import "stream";
import "../_libs/data-urls.mjs";
import "../_libs/decimal.js.mjs";
import "os";
import "crypto";
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
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/isbot.mjs";
const JOB_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "strong", "em", "b", "i", "u", "br", "hr", "ul", "ol", "li", "blockquote", "a", "code", "pre"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
};
function sanitizeJobHtml(html) {
  if (!html) return "";
  return src_default.sanitize(html, JOB_HTML_SANITIZE_CONFIG);
}
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "job";
}
const DEFAULT_STAGES = [{
  name: "Applied",
  kind: "applied"
}, {
  name: "Screen",
  kind: "screen"
}, {
  name: "Interview",
  kind: "interview"
}, {
  name: "Offer",
  kind: "offer"
}, {
  name: "Hired",
  kind: "hired",
  is_terminal: true
}, {
  name: "Rejected",
  kind: "rejected",
  is_terminal: true
}];
const listRecruitmentJobs_createServerFn_handler = createServerRpc({
  id: "ab612d28a0939aea6573fe025a8d037a1567f58ba732845fd363e12eaef0ac9b",
  name: "listRecruitmentJobs",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => listRecruitmentJobs.__executeServer(opts));
const listRecruitmentJobs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listRecruitmentJobs_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("recruitment_jobs").select("*, departments(name)").order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    jobs: data ?? []
  };
});
const JobSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  slug: stringType().max(80).optional(),
  department_id: stringType().uuid().nullable().optional(),
  location: stringType().max(200).optional().nullable(),
  employment_type: stringType().max(80).optional().nullable(),
  description_html: stringType().max(2e4).optional().nullable(),
  requirements_html: stringType().max(2e4).optional().nullable(),
  salary_min: numberType().nonnegative().nullable().optional(),
  salary_max: numberType().nonnegative().nullable().optional(),
  currency: stringType().default("AUD"),
  hiring_manager_id: stringType().uuid().nullable().optional(),
  status: enumType(["draft", "open", "paused", "closed", "filled"]).default("draft")
});
const upsertRecruitmentJob_createServerFn_handler = createServerRpc({
  id: "84f4baed7babb8083bd777c31ad28ae0ed84ae4ac12d33b51834da09fa25193a",
  name: "upsertRecruitmentJob",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => upsertRecruitmentJob.__executeServer(opts));
const upsertRecruitmentJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => JobSchema.parse(d)).handler(upsertRecruitmentJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const slug = data.slug || slugify(data.title);
  const payload = {
    ...data,
    description_html: sanitizeJobHtml(data.description_html),
    requirements_html: sanitizeJobHtml(data.requirements_html),
    slug,
    tenant_id: profile.tenant_id
  };
  if (data.status === "open" && !data.id) payload.published_at = (/* @__PURE__ */ new Date()).toISOString();
  let row;
  if (data.id) {
    const {
      data: r,
      error
    } = await supabase.from("recruitment_jobs").update(payload).eq("id", data.id).select().single();
    if (error) throw error;
    row = r;
  } else {
    payload.created_by = userId;
    const {
      data: r,
      error
    } = await supabase.from("recruitment_jobs").insert(payload).select().single();
    if (error) throw error;
    row = r;
    const stagePayload = DEFAULT_STAGES.map((s, i) => ({
      tenant_id: profile.tenant_id,
      job_id: r.id,
      name: s.name,
      kind: s.kind,
      sort_order: i,
      is_terminal: s.is_terminal ?? false
    }));
    await admin.from("recruitment_stages").insert(stagePayload);
  }
  return {
    job: row
  };
});
const getRecruitmentJob_createServerFn_handler = createServerRpc({
  id: "e1fd3afd430a3723ba43e557df9fce741508965ce16019c7f0be2fc949929031",
  name: "getRecruitmentJob",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => getRecruitmentJob.__executeServer(opts));
const getRecruitmentJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getRecruitmentJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: job
  } = await supabase.from("recruitment_jobs").select("*, departments(name)").eq("id", data.id).single();
  const {
    data: stages
  } = await supabase.from("recruitment_stages").select("*").eq("job_id", data.id).order("sort_order");
  const {
    data: candidates
  } = await supabase.from("recruitment_candidates").select("*").eq("job_id", data.id).order("applied_at", {
    ascending: false
  });
  return {
    job,
    stages: stages ?? [],
    candidates: candidates ?? []
  };
});
const moveCandidate_createServerFn_handler = createServerRpc({
  id: "8221ef19dfc9eb4e38fd3541f0af0de9c2f8fc21c5b247e656ec7895d4432599",
  name: "moveCandidate",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => moveCandidate.__executeServer(opts));
const moveCandidate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  stage_id: stringType().uuid(),
  status: enumType(["active", "hired", "rejected", "withdrawn"]).optional(),
  rejected_reason: stringType().max(500).optional()
}).parse(d)).handler(moveCandidate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const update = {
    stage_id: data.stage_id
  };
  if (data.status) update.status = data.status;
  if (data.rejected_reason) update.rejected_reason = data.rejected_reason;
  const {
    error
  } = await supabase.from("recruitment_candidates").update(update).eq("id", data.candidate_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const getCandidate_createServerFn_handler = createServerRpc({
  id: "cae1ef93884eaa7c7fe8c80981346dfa1f25adca59b3aab25eb574e494055325",
  name: "getCandidate",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => getCandidate.__executeServer(opts));
const getCandidate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getCandidate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: candidate
  } = await supabase.from("recruitment_candidates").select("*, recruitment_jobs(title,slug,job_id:id)").eq("id", data.id).single();
  const {
    data: interviews
  } = await supabase.from("recruitment_interviews").select("*").eq("candidate_id", data.id).order("scheduled_at", {
    ascending: false
  });
  const {
    data: scorecards
  } = await supabase.from("recruitment_scorecards").select("*").eq("candidate_id", data.id).order("created_at", {
    ascending: false
  });
  const {
    data: offers
  } = await supabase.from("recruitment_offers").select("*").eq("candidate_id", data.id).order("created_at", {
    ascending: false
  });
  const {
    data: notes
  } = await supabase.from("recruitment_notes").select("*").eq("candidate_id", data.id).order("created_at", {
    ascending: false
  });
  let stages = [];
  if (candidate?.job_id) {
    const {
      data: st
    } = await supabase.from("recruitment_stages").select("*").eq("job_id", candidate.job_id).order("sort_order");
    stages = st ?? [];
  }
  let resumeUrl = null;
  if (candidate?.resume_path) {
    const admin = await loadAdmin();
    const {
      data: signed
    } = await admin.storage.from("candidate-resumes").createSignedUrl(candidate.resume_path, 600);
    resumeUrl = signed?.signedUrl ?? null;
  }
  return {
    candidate,
    interviews: interviews ?? [],
    scorecards: scorecards ?? [],
    offers: offers ?? [],
    notes: notes ?? [],
    stages,
    resumeUrl
  };
});
const scheduleInterview_createServerFn_handler = createServerRpc({
  id: "dd86218314eba30393572665a141c445e1b9a77f81aa9076ca6470934d752aee",
  name: "scheduleInterview",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => scheduleInterview.__executeServer(opts));
const scheduleInterview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  title: stringType().min(1).max(200),
  scheduled_at: stringType(),
  duration_minutes: numberType().int().positive().max(480).default(45),
  mode: enumType(["video", "phone", "onsite"]).default("video"),
  location: stringType().max(500).optional().nullable(),
  interviewer_ids: arrayType(stringType().uuid()).default([]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(scheduleInterview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: c
  } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
  const {
    error
  } = await supabase.from("recruitment_interviews").insert({
    ...data,
    tenant_id: c.tenant_id,
    created_by: userId
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const submitScorecard_createServerFn_handler = createServerRpc({
  id: "738ef682d21527af956233c5a9bff52a5f0110ad5e2a6e863790d798d0170f2d",
  name: "submitScorecard",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => submitScorecard.__executeServer(opts));
const submitScorecard = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  interview_id: stringType().uuid().nullable().optional(),
  overall_rating: numberType().int().min(1).max(5),
  recommendation: enumType(["strong_yes", "yes", "neutral", "no", "strong_no"]),
  strengths: stringType().max(2e3).optional().nullable(),
  concerns: stringType().max(2e3).optional().nullable(),
  scores: recordType(stringType(), numberType()).default({})
}).parse(d)).handler(submitScorecard_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: c
  } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
  const {
    error
  } = await supabase.from("recruitment_scorecards").insert({
    ...data,
    tenant_id: c.tenant_id,
    reviewer_id: userId
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const addCandidateNote_createServerFn_handler = createServerRpc({
  id: "e7f94d82bba143fc66ab87696442edfec378050fda9418387802034d6e913719",
  name: "addCandidateNote",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => addCandidateNote.__executeServer(opts));
const addCandidateNote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  body: stringType().min(1).max(4e3)
}).parse(d)).handler(addCandidateNote_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: c
  } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
  const {
    error
  } = await supabase.from("recruitment_notes").insert({
    ...data,
    tenant_id: c.tenant_id,
    author_id: userId
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const createOffer_createServerFn_handler = createServerRpc({
  id: "45962f5bc935a649b706b9a2c8d118c79accf6533a39ab45f7c274cf8f63a6e8",
  name: "createOffer",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => createOffer.__executeServer(opts));
const createOffer = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  job_title: stringType().min(1).max(200),
  base_salary: numberType().positive(),
  currency: stringType().default("AUD"),
  start_date: stringType().optional().nullable(),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createOffer_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: c
  } = await supabase.from("recruitment_candidates").select("tenant_id").eq("id", data.candidate_id).single();
  const {
    data: row,
    error
  } = await supabase.from("recruitment_offers").insert({
    ...data,
    tenant_id: c.tenant_id,
    created_by: userId,
    status: "draft"
  }).select().single();
  if (error) throw error;
  return {
    offer: row
  };
});
const upsertStage_createServerFn_handler = createServerRpc({
  id: "83153de83d0fd15b8697875634355ad591891675dea405914042bdac8ee05492",
  name: "upsertStage",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => upsertStage.__executeServer(opts));
const upsertStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  job_id: stringType().uuid(),
  name: stringType().min(1).max(80),
  kind: enumType(["applied", "screen", "interview", "offer", "hired", "rejected", "custom"]).default("custom"),
  sort_order: numberType().int().min(0).max(99),
  is_terminal: booleanType().default(false)
}).parse(d)).handler(upsertStage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  if (data.id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("recruitment_stages").update({
      name: data.name,
      kind: data.kind,
      sort_order: data.sort_order,
      is_terminal: data.is_terminal
    }).eq("id", data.id).select().single();
    if (error2) throw error2;
    return {
      stage: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("recruitment_stages").insert({
    tenant_id: profile.tenant_id,
    job_id: data.job_id,
    name: data.name,
    kind: data.kind,
    sort_order: data.sort_order,
    is_terminal: data.is_terminal
  }).select().single();
  if (error) throw error;
  return {
    stage: row
  };
});
const deleteStage_createServerFn_handler = createServerRpc({
  id: "cf6da4080ee10ec8ebc212fa4642df7a3d6885baf5647601b1e36f25a82dfa50",
  name: "deleteStage",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => deleteStage.__executeServer(opts));
const deleteStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteStage_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    count
  } = await supabase.from("recruitment_candidates").select("id", {
    count: "exact",
    head: true
  }).eq("stage_id", data.id);
  if ((count ?? 0) > 0) throw new Error("Move candidates out of this stage first");
  const {
    error
  } = await supabase.from("recruitment_stages").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const reorderStages_createServerFn_handler = createServerRpc({
  id: "5bcf5f8a16911c894f6f16fff451e31e32164845dff8ecc26e2e5ea2731158a0",
  name: "reorderStages",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => reorderStages.__executeServer(opts));
const reorderStages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  job_id: stringType().uuid(),
  order: arrayType(objectType({
    id: stringType().uuid(),
    sort_order: numberType().int().min(0).max(99)
  })).min(1).max(30)
}).parse(d)).handler(reorderStages_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  for (const o of data.order) {
    await supabase.from("recruitment_stages").update({
      sort_order: o.sort_order
    }).eq("id", o.id).eq("job_id", data.job_id);
  }
  return {
    ok: true
  };
});
const updateOfferStatus_createServerFn_handler = createServerRpc({
  id: "92b3ce5771408400e653f61f63dc4669afd568ba2be9be1f120050c7ba3ff3db",
  name: "updateOfferStatus",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => updateOfferStatus.__executeServer(opts));
const updateOfferStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["draft", "sent", "accepted", "declined", "expired"])
}).parse(d)).handler(updateOfferStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const patch = {
    status: data.status
  };
  if (data.status === "sent") patch.sent_at = (/* @__PURE__ */ new Date()).toISOString();
  if (data.status === "accepted" || data.status === "declined") patch.responded_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: row,
    error
  } = await supabase.from("recruitment_offers").update(patch).eq("id", data.id).select().single();
  if (error) throw error;
  return {
    offer: row
  };
});
const convertCandidateToEmployee_createServerFn_handler = createServerRpc({
  id: "3134946837fa4d46683f9f11b5e6a27ff96114bdc2a8dbc1f065d05e669dc4bb",
  name: "convertCandidateToEmployee",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => convertCandidateToEmployee.__executeServer(opts));
const convertCandidateToEmployee = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  candidate_id: stringType().uuid(),
  employee_number: stringType().min(1).max(40),
  job_title: stringType().min(1).max(200),
  department_id: stringType().uuid().nullable().optional(),
  employment_type: enumType(["full_time", "part_time", "casual", "contractor", "intern"]).default("full_time"),
  hire_date: stringType(),
  base_salary: numberType().positive().optional().nullable(),
  currency_code: stringType().max(3).default("AUD")
}).parse(d)).handler(convertCandidateToEmployee_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const {
    data: cand,
    error: cErr
  } = await supabase.from("recruitment_candidates").select("*").eq("id", data.candidate_id).single();
  if (cErr) throw cErr;
  if (cand.hired_employee_id) throw new Error("Candidate already converted");
  const {
    data: emp,
    error: eErr
  } = await supabase.from("employees").insert({
    tenant_id: profile.tenant_id,
    employee_number: data.employee_number,
    first_name: cand.first_name,
    last_name: cand.last_name,
    email: cand.email,
    phone: cand.phone ?? null,
    job_title: data.job_title,
    department_id: data.department_id ?? null,
    employment_type: data.employment_type,
    status: "active",
    hire_date: data.hire_date,
    base_salary: data.base_salary ?? null,
    currency_code: data.currency_code
  }).select().single();
  if (eErr) throw eErr;
  await supabase.from("recruitment_candidates").update({
    status: "hired",
    hired_employee_id: emp.id
  }).eq("id", data.candidate_id);
  return {
    employee: emp
  };
});
const listPublicJobs_createServerFn_handler = createServerRpc({
  id: "0dbaea053e1757a7ed534558b46f709096b537ce85b9316c9e12ca8c44cede59",
  name: "listPublicJobs",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => listPublicJobs.__executeServer(opts));
const listPublicJobs = createServerFn({
  method: "GET"
}).handler(listPublicJobs_createServerFn_handler, async () => {
  const admin = await loadAdmin();
  const {
    data
  } = await admin.from("recruitment_jobs").select("id,slug,title,location,employment_type,department_id,published_at,tenant_id, departments(name), tenants(name)").eq("status", "open").order("published_at", {
    ascending: false
  }).limit(200);
  return {
    jobs: data ?? []
  };
});
const getPublicJob_createServerFn_handler = createServerRpc({
  id: "266a84cb8be8fd5f3d0394e2a852a4280d8f37ab35b06290d4bdaf36d30a6e78",
  name: "getPublicJob",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => getPublicJob.__executeServer(opts));
const getPublicJob = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(120)
}).parse(d)).handler(getPublicJob_createServerFn_handler, async ({
  data
}) => {
  const admin = await loadAdmin();
  const {
    data: job
  } = await admin.from("recruitment_jobs").select("id,slug,title,location,employment_type,description_html,requirements_html,salary_min,salary_max,currency,tenant_id,published_at,tenants(name)").eq("slug", data.slug).eq("status", "open").maybeSingle();
  return {
    job
  };
});
const SAFE_NAME_RE = /^[A-Za-z0-9._-]{1,200}$/;
const createResumeUploadUrl_createServerFn_handler = createServerRpc({
  id: "6871539cf2fe3cbe36116161a1ee62649eb6413b2c9eb70353578984a87fcfbc",
  name: "createResumeUploadUrl",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => createResumeUploadUrl.__executeServer(opts));
const createResumeUploadUrl = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  job_id: stringType().uuid(),
  filename: stringType().min(1).max(200)
}).parse(d)).handler(createResumeUploadUrl_createServerFn_handler, async ({
  data
}) => {
  const safe = data.filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 200);
  if (!SAFE_NAME_RE.test(safe)) throw new Error("Invalid filename");
  const admin = await loadAdmin();
  const {
    data: job
  } = await admin.from("recruitment_jobs").select("id,tenant_id,status").eq("id", data.job_id).maybeSingle();
  if (!job || job.status !== "open") {
    throw new Error("This role is no longer accepting applications");
  }
  const path = `${job.tenant_id}/${job.id}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
  const {
    data: signed,
    error
  } = await admin.storage.from("candidate-resumes").createSignedUploadUrl(path);
  if (error || !signed) throw new Error(error?.message ?? "Could not create upload URL");
  return {
    path: signed.path,
    token: signed.token
  };
});
const ApplySchema = objectType({
  job_id: stringType().uuid(),
  first_name: stringType().min(1).max(80),
  last_name: stringType().min(1).max(80),
  email: stringType().email().max(200),
  phone: stringType().max(40).optional().nullable(),
  current_company: stringType().max(200).optional().nullable(),
  current_title: stringType().max(200).optional().nullable(),
  linkedin_url: stringType().url().max(500).optional().nullable(),
  cover_letter: stringType().max(8e3).optional().nullable(),
  resume_path: stringType().max(500).optional().nullable()
});
const applyToJob_createServerFn_handler = createServerRpc({
  id: "e3d42cf1c4c9fa18afd76285dd595efd035d2102ffd2c44a0d97b27dd0d687b2",
  name: "applyToJob",
  filename: "src/lib/recruitment.functions.ts"
}, (opts) => applyToJob.__executeServer(opts));
const applyToJob = createServerFn({
  method: "POST"
}).inputValidator((d) => ApplySchema.parse(d)).handler(applyToJob_createServerFn_handler, async ({
  data
}) => {
  const admin = await loadAdmin();
  const {
    data: job
  } = await admin.from("recruitment_jobs").select("id,tenant_id,status").eq("id", data.job_id).single();
  if (!job || job.status !== "open") throw new Error("This role is no longer accepting applications");
  const {
    data: firstStage
  } = await admin.from("recruitment_stages").select("id").eq("job_id", job.id).order("sort_order").limit(1).maybeSingle();
  const {
    error
  } = await admin.from("recruitment_candidates").insert({
    tenant_id: job.tenant_id,
    job_id: job.id,
    stage_id: firstStage?.id ?? null,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone ?? null,
    current_company: data.current_company ?? null,
    current_title: data.current_title ?? null,
    linkedin_url: data.linkedin_url ?? null,
    cover_letter: data.cover_letter ?? null,
    resume_path: data.resume_path ?? null,
    source: "careers_page"
  });
  if (error) {
    if (error.code === "23505") throw new Error("You've already applied to this role");
    throw error;
  }
  return {
    ok: true
  };
});
export {
  addCandidateNote_createServerFn_handler,
  applyToJob_createServerFn_handler,
  convertCandidateToEmployee_createServerFn_handler,
  createOffer_createServerFn_handler,
  createResumeUploadUrl_createServerFn_handler,
  deleteStage_createServerFn_handler,
  getCandidate_createServerFn_handler,
  getPublicJob_createServerFn_handler,
  getRecruitmentJob_createServerFn_handler,
  listPublicJobs_createServerFn_handler,
  listRecruitmentJobs_createServerFn_handler,
  moveCandidate_createServerFn_handler,
  reorderStages_createServerFn_handler,
  scheduleInterview_createServerFn_handler,
  submitScorecard_createServerFn_handler,
  updateOfferStatus_createServerFn_handler,
  upsertRecruitmentJob_createServerFn_handler,
  upsertStage_createServerFn_handler
};
