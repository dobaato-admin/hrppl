import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, B as enumType, D as arrayType, H as unionType } from "../_libs/zod.mjs";
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
async function getEmployeeForUser(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}
const createReviewCycle_createServerFn_handler = createServerRpc({
  id: "81f9295736b3c453103be20a3fc9373ce07a214d9364585ed3e8684d39880ef4",
  name: "createReviewCycle",
  filename: "src/lib/performance.functions.ts"
}, (opts) => createReviewCycle.__executeServer(opts));
const createReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(120),
  periodStart: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: stringType().regex(/^\d{4}-\d{2}-\d{2}$/)
}).parse(d)).handler(createReviewCycle_createServerFn_handler, async ({
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
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    data: row,
    error
  } = await supabase.from("review_cycles").insert({
    tenant_id: prof.tenant_id,
    name: data.name,
    period_start: data.periodStart,
    period_end: data.periodEnd,
    status: "draft",
    created_by: userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const activateReviewCycle_createServerFn_handler = createServerRpc({
  id: "bbc5738d190c0fb308efac1c1c35d4a53b0e8673989cb3a3bafed876a82a49b8",
  name: "activateReviewCycle",
  filename: "src/lib/performance.functions.ts"
}, (opts) => activateReviewCycle.__executeServer(opts));
const activateReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(activateReviewCycle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const admin = await loadAdmin();
  const {
    data: cycle
  } = await admin.from("review_cycles").select("*").eq("id", data.cycleId).maybeSingle();
  if (!cycle) throw new Error("Cycle not found");
  let templateVersion = cycle.template_version ?? null;
  if (cycle.template_id && templateVersion == null) {
    const {
      data: tpl
    } = await admin.from("review_templates").select("version").eq("id", cycle.template_id).maybeSingle();
    templateVersion = tpl?.version ?? 1;
  }
  await admin.from("review_cycles").update({
    status: "active",
    template_version: templateVersion
  }).eq("id", cycle.id);
  const {
    data: emps
  } = await admin.from("employees").select("id,manager_id").eq("tenant_id", cycle.tenant_id).eq("status", "active");
  if (emps?.length) {
    const rows = emps.map((e) => ({
      tenant_id: cycle.tenant_id,
      employee_id: e.id,
      cycle_id: cycle.id,
      reviewer_id: e.manager_id,
      status: "draft",
      template_id: cycle.template_id ?? null,
      template_version: templateVersion
    }));
    await admin.from("performance_reviews").upsert(rows, {
      onConflict: "cycle_id,employee_id"
    });
  }
  return {
    ok: true
  };
});
const updateReviewCycleTemplate_createServerFn_handler = createServerRpc({
  id: "f01eaf4907d4c5e2c5646434b017611ffe4ceef186b2faa4a33c73dca5cc6d2a",
  name: "updateReviewCycleTemplate",
  filename: "src/lib/performance.functions.ts"
}, (opts) => updateReviewCycleTemplate.__executeServer(opts));
const updateReviewCycleTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid(),
  templateId: stringType().uuid().nullable()
}).parse(d)).handler(updateReviewCycleTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const patch = {
    template_id: data.templateId,
    template_version: null
  };
  if (data.templateId) {
    const {
      data: tpl
    } = await supabase.from("review_templates").select("version").eq("id", data.templateId).maybeSingle();
    patch.template_version = tpl?.version ?? 1;
  }
  const {
    error
  } = await supabase.from("review_cycles").update(patch).eq("id", data.cycleId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const closeReviewCycle_createServerFn_handler = createServerRpc({
  id: "563a0f16affb0fab026212d2c0cb5910d775243c9ef9fbbb7f099fbdf78d3efd",
  name: "closeReviewCycle",
  filename: "src/lib/performance.functions.ts"
}, (opts) => closeReviewCycle.__executeServer(opts));
const closeReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(closeReviewCycle_createServerFn_handler, async ({
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
    error
  } = await supabase.from("review_cycles").update({
    status: "closed"
  }).eq("id", data.cycleId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateReviewCycleReminders_createServerFn_handler = createServerRpc({
  id: "ca529b66da01d8b1561e05958cde8e1818a8fc2ca4ce7cbc677a4422a44829ba",
  name: "updateReviewCycleReminders",
  filename: "src/lib/performance.functions.ts"
}, (opts) => updateReviewCycleReminders.__executeServer(opts));
const updateReviewCycleReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid(),
  remindersEnabled: booleanType(),
  intervalDays: numberType().int().min(1).max(60),
  startOffsetDays: numberType().int().min(0).max(365),
  businessDaysOnly: booleanType(),
  maxCount: numberType().int().min(1).max(50).nullable()
}).parse(d)).handler(updateReviewCycleReminders_createServerFn_handler, async ({
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
    error
  } = await supabase.from("review_cycles").update({
    reminders_enabled: data.remindersEnabled,
    reminder_interval_days: data.intervalDays,
    reminder_start_offset_days: data.startOffsetDays,
    reminder_business_days_only: data.businessDaysOnly,
    reminder_max_count: data.maxCount
  }).eq("id", data.cycleId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const previewReviewReminderSchedule_createServerFn_handler = createServerRpc({
  id: "8d07a91bc0ade26baede2753764241626582e36df26ec22c0eaf0b82ae2eac3e",
  name: "previewReviewReminderSchedule",
  filename: "src/lib/performance.functions.ts"
}, (opts) => previewReviewReminderSchedule.__executeServer(opts));
const previewReviewReminderSchedule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid(),
  horizonDays: numberType().int().min(1).max(180).default(30),
  overrides: objectType({
    remindersEnabled: booleanType(),
    intervalDays: numberType().int().min(1).max(60),
    startOffsetDays: numberType().int().min(0).max(365),
    businessDaysOnly: booleanType(),
    maxCount: numberType().int().min(1).max(50).nullable()
  }).optional()
}).parse(d)).handler(previewReviewReminderSchedule_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const admin = await loadAdmin();
  const {
    data: cycle
  } = await admin.from("review_cycles").select("id,tenant_id,name,period_start,reminders_enabled,reminder_interval_days,reminder_start_offset_days,reminder_business_days_only,reminder_max_count").eq("id", data.cycleId).maybeSingle();
  if (!cycle) throw new Error("Cycle not found");
  const cfg = data.overrides ?? {
    remindersEnabled: cycle.reminders_enabled ?? true,
    intervalDays: cycle.reminder_interval_days ?? 3,
    startOffsetDays: cycle.reminder_start_offset_days ?? 0,
    businessDaysOnly: cycle.reminder_business_days_only ?? false,
    maxCount: cycle.reminder_max_count ?? null
  };
  const {
    data: tenant
  } = await admin.from("tenants").select("country_code").eq("id", cycle.tenant_id).maybeSingle();
  const countryCode = tenant?.country_code ?? null;
  const holidays = [];
  if (countryCode) {
    const {
      data: hs
    } = await admin.from("public_holidays").select("holiday_date,name,is_recurring").eq("country_code", countryCode);
    for (const h of hs ?? []) {
      holidays.push({
        date: h.holiday_date,
        name: h.name,
        recurring: !!h.is_recurring
      });
    }
  }
  function holidayOn(iso) {
    const md = iso.slice(5);
    for (const h of holidays) {
      if (h.date === iso) return h.name;
      if (h.recurring && h.date.slice(5) === md) return h.name;
    }
    return null;
  }
  const DAY_MS = 24 * 60 * 60 * 1e3;
  const today = /* @__PURE__ */ new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDate = cycle.period_start ? /* @__PURE__ */ new Date(cycle.period_start + "T00:00:00Z") : today;
  const firstEligible = new Date(startDate.getTime() + cfg.startOffsetDays * DAY_MS);
  const days = [];
  let scheduledCount = 0;
  let lastScheduledMs = null;
  for (let i = 0; i < data.horizonDays; i += 1) {
    const d = new Date(today.getTime() + i * DAY_MS);
    const iso = d.toISOString().slice(0, 10);
    if (!cfg.remindersEnabled) {
      days.push({
        date: iso,
        status: "disabled"
      });
      continue;
    }
    if (d.getTime() < firstEligible.getTime()) {
      days.push({
        date: iso,
        status: "before-start"
      });
      continue;
    }
    const dow = d.getUTCDay();
    if (cfg.businessDaysOnly && (dow === 0 || dow === 6)) {
      days.push({
        date: iso,
        status: "weekend"
      });
      continue;
    }
    if (cfg.businessDaysOnly) {
      const h = holidayOn(iso);
      if (h) {
        days.push({
          date: iso,
          status: "holiday",
          reason: h
        });
        continue;
      }
    }
    if (cfg.maxCount != null && scheduledCount >= cfg.maxCount) {
      days.push({
        date: iso,
        status: "max-reached"
      });
      continue;
    }
    if (lastScheduledMs != null && d.getTime() - lastScheduledMs < cfg.intervalDays * DAY_MS) {
      days.push({
        date: iso,
        status: "before-start",
        reason: `Interval (${cfg.intervalDays}d)`
      });
      continue;
    }
    days.push({
      date: iso,
      status: "scheduled"
    });
    scheduledCount += 1;
    lastScheduledMs = d.getTime();
  }
  return {
    cycle: {
      id: cycle.id,
      name: cycle.name,
      period_start: cycle.period_start
    },
    countryCode,
    config: cfg,
    days,
    scheduledCount
  };
});
const upsertGoal_createServerFn_handler = createServerRpc({
  id: "f46b1e944a242ac4672dc085bb45cfcdde7cab8d59dbec8a43f6ba73cec189f7",
  name: "upsertGoal",
  filename: "src/lib/performance.functions.ts"
}, (opts) => upsertGoal.__executeServer(opts));
const upsertGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  cycleId: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  description: stringType().max(2e3).optional(),
  weight: numberType().min(0).max(100).default(0),
  progress: numberType().min(0).max(100).default(0),
  status: enumType(["not_started", "in_progress", "completed", "cancelled"]).default("not_started"),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).parse(d)).handler(upsertGoal_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const payload = {
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    cycle_id: data.cycleId ?? null,
    title: data.title,
    description: data.description ?? null,
    weight: data.weight,
    progress: data.progress,
    status: data.status,
    due_date: data.dueDate ?? null
  };
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("performance_goals").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("performance_goals").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const deleteGoal_createServerFn_handler = createServerRpc({
  id: "efdefab07947169d0918629b6da9d6c728b0a03436684b27bca2b27a8ced2c66",
  name: "deleteGoal",
  filename: "src/lib/performance.functions.ts"
}, (opts) => deleteGoal.__executeServer(opts));
const deleteGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGoal_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("performance_goals").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const responseSchema = arrayType(objectType({
  questionId: stringType().min(1).max(100),
  rating: numberType().nullable().optional(),
  text: stringType().max(5e3).nullable().optional()
})).max(50).optional();
const submitSelfReview_createServerFn_handler = createServerRpc({
  id: "4a19a4ef26793677503238e3ab4ea1e2bf8b8b3b55e6f3ac5bfb131dc093624e",
  name: "submitSelfReview",
  filename: "src/lib/performance.functions.ts"
}, (opts) => submitSelfReview.__executeServer(opts));
const submitSelfReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  selfRating: numberType().min(1).max(10),
  selfComments: stringType().max(5e3).optional(),
  responses: responseSchema
}).parse(d)).handler(submitSelfReview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const patch = {
    self_rating: Math.round(data.selfRating),
    self_comments: data.selfComments ?? null,
    status: "self_submitted"
  };
  if (data.responses) patch.self_responses = data.responses;
  const {
    error
  } = await supabase.from("performance_reviews").update(patch).eq("id", data.reviewId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const submitManagerReview_createServerFn_handler = createServerRpc({
  id: "cbebc65c4e4ac15ef103cc2dcfe0d304db6ef5aa52ee757bab9208baf4595687",
  name: "submitManagerReview",
  filename: "src/lib/performance.functions.ts"
}, (opts) => submitManagerReview.__executeServer(opts));
const submitManagerReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  managerRating: numberType().min(1).max(10),
  managerComments: stringType().max(5e3).optional(),
  finalize: booleanType().default(false),
  responses: responseSchema
}).parse(d)).handler(submitManagerReview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  const payload = {
    manager_rating: Math.round(data.managerRating),
    manager_comments: data.managerComments ?? null,
    status: data.finalize ? "finalized" : "manager_submitted"
  };
  if (data.responses) payload.manager_responses = data.responses;
  if (data.finalize) payload.finalized_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await supabase.from("performance_reviews").update(payload).eq("id", data.reviewId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const calibrateReview_createServerFn_handler = createServerRpc({
  id: "3bf0861b437548d5b4a28d563199dd81165c2ffa639f26d42aa411da5a03bd1f",
  name: "calibrateReview",
  filename: "src/lib/performance.functions.ts"
}, (opts) => calibrateReview.__executeServer(opts));
const calibrateReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  calibratedRating: numberType().min(1).max(10).nullable(),
  notes: stringType().max(2e3).optional()
}).parse(d)).handler(calibrateReview_createServerFn_handler, async ({
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
    error
  } = await supabase.from("performance_reviews").update({
    calibrated_rating: data.calibratedRating,
    calibration_notes: data.notes ?? null,
    calibrated_by: data.calibratedRating == null ? null : userId,
    calibrated_at: data.calibratedRating == null ? null : (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.reviewId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const acknowledgeReview_createServerFn_handler = createServerRpc({
  id: "de145e8b4e54cc0cffab0c395e7bc48f0a2a37c835c00b323f6c0ae20d803683",
  name: "acknowledgeReview",
  filename: "src/lib/performance.functions.ts"
}, (opts) => acknowledgeReview.__executeServer(opts));
const acknowledgeReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  comments: stringType().max(2e3).optional()
}).parse(d)).handler(acknowledgeReview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("performance_reviews").update({
    status: "acknowledged",
    acknowledged_at: (/* @__PURE__ */ new Date()).toISOString(),
    acknowledgment_comments: data.comments ?? null
  }).eq("id", data.reviewId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const addReviewFeedback_createServerFn_handler = createServerRpc({
  id: "577b803319655a9c90f59b40397ca9e6469b5ed7c501e7c6bba336eeb0af1358",
  name: "addReviewFeedback",
  filename: "src/lib/performance.functions.ts"
}, (opts) => addReviewFeedback.__executeServer(opts));
const addReviewFeedback = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  kind: enumType(["peer", "upward"]).default("peer"),
  text: stringType().min(1).max(5e3)
}).parse(d)).handler(addReviewFeedback_createServerFn_handler, async ({
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
  if (!prof?.tenant_id) throw new Error("No tenant");
  const {
    error
  } = await supabase.from("review_feedback").insert({
    tenant_id: prof.tenant_id,
    review_id: data.reviewId,
    author_id: userId,
    kind: data.kind,
    text: data.text
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const evidenceTypeEnum = enumType(["document", "url", "social", "screenshot"]);
const scheduleSchema = objectType({
  type: enumType(["monthly", "quarterly", "half_yearly", "annual", "custom"]),
  periods: arrayType(stringType().max(20)).max(12).optional(),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).optional();
const competencySchema = objectType({
  id: stringType().min(1).max(80),
  label: stringType().min(1).max(200),
  description: stringType().max(500).optional(),
  type: enumType(["rating", "text", "number", "range", "yes_no", "scale", "percentage", "currency"]).default("rating"),
  required: booleanType().default(false),
  min: numberType().optional(),
  max: numberType().optional(),
  target: unionType([numberType(), stringType()]).optional(),
  unit: stringType().max(20).optional(),
  weight: numberType().min(0).max(100).optional(),
  yesLabel: stringType().max(40).optional(),
  noLabel: stringType().max(40).optional(),
  evidenceEnabled: booleanType().optional(),
  evidenceTypes: arrayType(evidenceTypeEnum).optional(),
  minEvidenceCount: numberType().int().min(0).max(20).optional(),
  requiredEvidenceTypes: arrayType(evidenceTypeEnum).optional(),
  reviewPeriod: stringType().max(40).optional(),
  schedule: scheduleSchema
}).refine((c) => c.min == null || c.max == null || c.min <= c.max, {
  message: "min must be ≤ max"
}).refine((c) => {
  if (!c.evidenceEnabled) return true;
  const allowed = new Set(c.evidenceTypes ?? []);
  return (c.requiredEvidenceTypes ?? []).every((t) => allowed.has(t));
}, {
  message: "requiredEvidenceTypes must be a subset of evidenceTypes"
});
const upsertReviewTemplate_createServerFn_handler = createServerRpc({
  id: "70bdb04465e3960209a10887cf8624df1f34b1d8dd4a1e996a29bdb7452f1bb3",
  name: "upsertReviewTemplate",
  filename: "src/lib/performance.functions.ts"
}, (opts) => upsertReviewTemplate.__executeServer(opts));
const upsertReviewTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(1e3).optional(),
  industry: stringType().max(60).optional(),
  kind: enumType(["kpi", "kra", "competency", "mixed", "360"]).default("competency"),
  scaleMin: numberType().int().min(1).max(10).default(1),
  scaleMax: numberType().int().min(2).max(10).default(5),
  scaleLabels: arrayType(stringType().max(80)).max(10).default([]),
  competencies: arrayType(competencySchema).max(50).default([]),
  isDefault: booleanType().default(false),
  changeNote: stringType().max(500).optional(),
  bumpVersion: booleanType().default(false)
}).parse(d)).handler(upsertReviewTemplate_createServerFn_handler, async ({
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
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No tenant");
  if (data.scaleMax <= data.scaleMin) throw new Error("scaleMax must be greater than scaleMin");
  if (data.isDefault) {
    await supabase.from("review_templates").update({
      is_default: false
    }).eq("tenant_id", prof.tenant_id);
  }
  if (data.id && data.bumpVersion) {
    const {
      data: existing
    } = await supabase.from("review_templates").select("*").eq("id", data.id).maybeSingle();
    if (!existing) throw new Error("Template not found");
    const e = existing;
    await supabase.from("review_templates").update({
      is_current: false
    }).eq("id", data.id);
    const {
      data: row2,
      error: error2
    } = await supabase.from("review_templates").insert({
      tenant_id: prof.tenant_id,
      name: data.name,
      description: data.description ?? null,
      industry: data.industry ?? null,
      kind: data.kind,
      scale_min: data.scaleMin,
      scale_max: data.scaleMax,
      scale_labels: data.scaleLabels,
      competencies: data.competencies,
      is_default: data.isDefault,
      version: (e.version ?? 1) + 1,
      parent_template_id: e.parent_template_id ?? data.id,
      is_current: true,
      change_note: data.changeNote ?? null,
      created_by: e.created_by,
      updated_by: userId
    }).select("id").single();
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: row2.id
    };
  }
  if (data.id) {
    const {
      error: error2
    } = await supabase.from("review_templates").update({
      name: data.name,
      description: data.description ?? null,
      industry: data.industry ?? null,
      kind: data.kind,
      scale_min: data.scaleMin,
      scale_max: data.scaleMax,
      scale_labels: data.scaleLabels,
      competencies: data.competencies,
      is_default: data.isDefault,
      change_note: data.changeNote ?? null,
      updated_by: userId
    }).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("review_templates").insert({
    tenant_id: prof.tenant_id,
    name: data.name,
    description: data.description ?? null,
    industry: data.industry ?? null,
    kind: data.kind,
    scale_min: data.scaleMin,
    scale_max: data.scaleMax,
    scale_labels: data.scaleLabels,
    competencies: data.competencies,
    is_default: data.isDefault,
    created_by: userId,
    updated_by: userId,
    change_note: data.changeNote ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const deleteReviewTemplate_createServerFn_handler = createServerRpc({
  id: "b76314ebe3d83aab208968e61d3e57e95a21894d484a746c55348e30eddd149d",
  name: "deleteReviewTemplate",
  filename: "src/lib/performance.functions.ts"
}, (opts) => deleteReviewTemplate.__executeServer(opts));
const deleteReviewTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteReviewTemplate_createServerFn_handler, async ({
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
    error
  } = await supabase.from("review_templates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getCycleProgress_createServerFn_handler = createServerRpc({
  id: "add13753f71f13606fc8c20d4b151124ef9f42bb6f4488ef7c889d2129a03da4",
  name: "getCycleProgress",
  filename: "src/lib/performance.functions.ts"
}, (opts) => getCycleProgress.__executeServer(opts));
const getCycleProgress = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(getCycleProgress_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("performance_reviews").select("status,manager_rating,calibrated_rating,self_rating").eq("cycle_id", data.cycleId);
  if (error) throw new Error(error.message);
  const all = rows ?? [];
  const counts = {
    draft: 0,
    self_submitted: 0,
    manager_submitted: 0,
    finalized: 0,
    acknowledged: 0
  };
  let ratingSum = 0, ratingN = 0;
  for (const r of all) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    const finalR = r.calibrated_rating ?? r.manager_rating;
    if (finalR != null) {
      ratingSum += Number(finalR);
      ratingN += 1;
    }
  }
  const total = all.length;
  return {
    total,
    counts,
    completionPct: total === 0 ? 0 : Math.round((counts.finalized + counts.acknowledged) / total * 100),
    avgFinalRating: ratingN === 0 ? null : Number((ratingSum / ratingN).toFixed(2))
  };
});
const getReviewAuditTrail_createServerFn_handler = createServerRpc({
  id: "2ed294dc7be47c732fb8c18d19be294e8f0c2e53eed689a096128928877d1bcd",
  name: "getReviewAuditTrail",
  filename: "src/lib/performance.functions.ts"
}, (opts) => getReviewAuditTrail.__executeServer(opts));
const getReviewAuditTrail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(100)
}).parse(d)).handler(getReviewAuditTrail_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) throw new Error("Not authorized");
  let q = supabase.from("audit_log").select("*").eq("entity_type", "performance_review").order("created_at", {
    ascending: false
  }).limit(data.limit);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const entries = rows ?? [];
  const filtered = data.cycleId ? entries.filter((r) => r.metadata?.cycle_id === data.cycleId) : entries;
  return {
    entries: filtered
  };
});
export {
  acknowledgeReview_createServerFn_handler,
  activateReviewCycle_createServerFn_handler,
  addReviewFeedback_createServerFn_handler,
  calibrateReview_createServerFn_handler,
  closeReviewCycle_createServerFn_handler,
  createReviewCycle_createServerFn_handler,
  deleteGoal_createServerFn_handler,
  deleteReviewTemplate_createServerFn_handler,
  getCycleProgress_createServerFn_handler,
  getReviewAuditTrail_createServerFn_handler,
  previewReviewReminderSchedule_createServerFn_handler,
  submitManagerReview_createServerFn_handler,
  submitSelfReview_createServerFn_handler,
  updateReviewCycleReminders_createServerFn_handler,
  updateReviewCycleTemplate_createServerFn_handler,
  upsertGoal_createServerFn_handler,
  upsertReviewTemplate_createServerFn_handler
};
