import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, C as numberType, z as stringType, D as arrayType, B as enumType } from "../_libs/zod.mjs";
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
async function getEmployee(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}
const CourseSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  provider: stringType().max(160).optional().nullable(),
  category: stringType().max(80).optional().nullable(),
  duration_hours: numberType().nonnegative().optional().nullable(),
  is_mandatory: booleanType().default(false),
  validity_months: numberType().int().positive().max(600).optional().nullable(),
  external_url: stringType().url().max(500).optional().nullable(),
  is_active: booleanType().default(true),
  pass_score: numberType().min(0).max(100).default(70),
  max_attempts: numberType().int().min(1).max(20).optional().nullable(),
  questions_per_attempt: numberType().int().min(1).max(200).optional().nullable(),
  shuffle_questions: booleanType().default(false)
});
const listCourses_createServerFn_handler = createServerRpc({
  id: "5d2ad5d9a89cecfc947baf6cf81572b867bf939cca32893bc33769294cb36f50",
  name: "listCourses",
  filename: "src/lib/training.functions.ts"
}, (opts) => listCourses.__executeServer(opts));
const listCourses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listCourses_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("training_courses").select("*").order("title");
  if (error) throw error;
  return {
    courses: data ?? []
  };
});
const upsertCourse_createServerFn_handler = createServerRpc({
  id: "4ee95b4c2a51b86d24c8d8034292dde4fc882ba13b721dfd49e14142f8215fd1",
  name: "upsertCourse",
  filename: "src/lib/training.functions.ts"
}, (opts) => upsertCourse.__executeServer(opts));
const upsertCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CourseSchema.parse(d)).handler(upsertCourse_createServerFn_handler, async ({
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
  if (!data.id) payload.created_by = userId;
  const {
    data: row,
    error
  } = data.id ? await supabase.from("training_courses").update(payload).eq("id", data.id).select().single() : await supabase.from("training_courses").insert(payload).select().single();
  if (error) throw error;
  return {
    course: row
  };
});
const deleteCourse_createServerFn_handler = createServerRpc({
  id: "3db2ea82a37c3ec3c0cc7216c99ce3f2442779fbf6675fd1ccb5b063da24da1c",
  name: "deleteCourse",
  filename: "src/lib/training.functions.ts"
}, (opts) => deleteCourse.__executeServer(opts));
const deleteCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCourse_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("training_courses").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const AssignSchema = objectType({
  course_id: stringType().uuid(),
  employee_ids: arrayType(stringType().uuid()).min(1).max(500),
  due_date: stringType().optional().nullable()
});
const assignCourse_createServerFn_handler = createServerRpc({
  id: "93c95edd8ee0becc18aadb6881fd09bd066f7178e381fb2672e163859608acd1",
  name: "assignCourse",
  filename: "src/lib/training.functions.ts"
}, (opts) => assignCourse.__executeServer(opts));
const assignCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AssignSchema.parse(d)).handler(assignCourse_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const rows = data.employee_ids.map((employee_id) => ({
    tenant_id,
    course_id: data.course_id,
    employee_id,
    assigned_by: userId,
    due_date: data.due_date || null,
    status: "assigned"
  }));
  const {
    error
  } = await supabase.from("training_enrollments").upsert(rows, {
    onConflict: "course_id,employee_id",
    ignoreDuplicates: true
  });
  if (error) throw error;
  return {
    ok: true,
    count: rows.length
  };
});
const UpdateEnrollmentSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["assigned", "in_progress", "completed", "expired", "waived"]).optional(),
  score: numberType().min(0).max(100).optional().nullable(),
  certificate_url: stringType().url().max(500).optional().nullable(),
  notes: stringType().max(1e3).optional().nullable(),
  completed_at: stringType().optional().nullable()
});
const updateEnrollment_createServerFn_handler = createServerRpc({
  id: "74f7543a5e53313554c353c5a3148f9db947d5e5f8de11755e49c7be6968c060",
  name: "updateEnrollment",
  filename: "src/lib/training.functions.ts"
}, (opts) => updateEnrollment.__executeServer(opts));
const updateEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateEnrollmentSchema.parse(d)).handler(updateEnrollment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const patch = {
    ...data
  };
  delete patch.id;
  if (patch.status === "in_progress" && !patch.started_at) patch.started_at = (/* @__PURE__ */ new Date()).toISOString();
  if (patch.status === "completed" && !patch.completed_at) patch.completed_at = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: row,
    error
  } = await supabase.from("training_enrollments").update(patch).eq("id", data.id).select("*, training_courses(id,title,validity_months,is_mandatory), employees(id,first_name,last_name)").single();
  if (error) throw error;
  if (row.status === "completed" && row.training_courses?.validity_months) {
    const tenant_id = await getTenant(supabase, userId);
    const completedAt = new Date(row.completed_at ?? Date.now());
    const expires = new Date(completedAt);
    expires.setMonth(expires.getMonth() + row.training_courses.validity_months);
    await supabase.from("certifications").insert({
      tenant_id,
      employee_id: row.employee_id,
      name: row.training_courses.title,
      issued_on: completedAt.toISOString().slice(0, 10),
      expires_on: expires.toISOString().slice(0, 10),
      file_url: row.certificate_url ?? null,
      source_course_id: row.training_courses.id,
      source_enrollment_id: row.id,
      created_by: userId
    });
  }
  return {
    enrollment: row
  };
});
const listEnrollments_createServerFn_handler = createServerRpc({
  id: "df8b29b20c68ed4d649afe2080d3d384a6e7d561fa1f78bda1fb2575ee702164",
  name: "listEnrollments",
  filename: "src/lib/training.functions.ts"
}, (opts) => listEnrollments.__executeServer(opts));
const listEnrollments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all"]).default("all"),
  status: stringType().optional(),
  course_id: stringType().uuid().optional()
}).parse(d)).handler(listEnrollments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("training_enrollments").select("*, training_courses(id,title,category,is_mandatory,validity_months), employees(id,first_name,last_name,email,job_title)").order("assigned_at", {
    ascending: false
  });
  if (data.scope === "me") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      enrollments: []
    };
    q = q.eq("employee_id", emp.id);
  }
  if (data.status) q = q.eq("status", data.status);
  if (data.course_id) q = q.eq("course_id", data.course_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    enrollments: rows ?? []
  };
});
const deleteEnrollment_createServerFn_handler = createServerRpc({
  id: "e9a675d4b5a818984d988108c294524932f3fb7f1a4ee56a811e44669d9638e4",
  name: "deleteEnrollment",
  filename: "src/lib/training.functions.ts"
}, (opts) => deleteEnrollment.__executeServer(opts));
const deleteEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteEnrollment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("training_enrollments").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const CertSchema = objectType({
  id: stringType().uuid().optional(),
  employee_id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  issuer: stringType().max(160).optional().nullable(),
  credential_id: stringType().max(120).optional().nullable(),
  issued_on: stringType().optional().nullable(),
  expires_on: stringType().optional().nullable(),
  file_url: stringType().url().max(500).optional().nullable()
});
const upsertCertification_createServerFn_handler = createServerRpc({
  id: "1f5da21c5cb19e421adbcf77cfd7ae7cbcd6aedf81fac06eaf3f0d20b8aa4add",
  name: "upsertCertification",
  filename: "src/lib/training.functions.ts"
}, (opts) => upsertCertification.__executeServer(opts));
const upsertCertification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CertSchema.parse(d)).handler(upsertCertification_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  let employee_id = data.employee_id;
  if (!employee_id) {
    const emp = await getEmployee(supabase, userId);
    if (!emp) throw new Error("No employee record");
    employee_id = emp.id;
  }
  const payload = {
    ...data,
    tenant_id,
    employee_id
  };
  if (!data.id) payload.created_by = userId;
  const {
    data: row,
    error
  } = data.id ? await supabase.from("certifications").update(payload).eq("id", data.id).select().single() : await supabase.from("certifications").insert(payload).select().single();
  if (error) throw error;
  return {
    certification: row
  };
});
const deleteCertification_createServerFn_handler = createServerRpc({
  id: "bf4b2bb75da76d89644857d9f7cd2f5958399e3d0d409cdef45a654eb9fe46d1",
  name: "deleteCertification",
  filename: "src/lib/training.functions.ts"
}, (opts) => deleteCertification.__executeServer(opts));
const deleteCertification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCertification_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("certifications").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listCertifications_createServerFn_handler = createServerRpc({
  id: "2a286373443198420f65cc93d3ae39c439bf12ad19f2979dbca7bff057fc0dbc",
  name: "listCertifications",
  filename: "src/lib/training.functions.ts"
}, (opts) => listCertifications.__executeServer(opts));
const listCertifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all", "expiring"]).default("all"),
  days: numberType().int().min(1).max(365).default(60)
}).parse(d)).handler(listCertifications_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("certifications").select("*, employees(id,first_name,last_name,email,job_title)").order("expires_on", {
    ascending: true,
    nullsFirst: false
  });
  if (data.scope === "me") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      certifications: []
    };
    q = q.eq("employee_id", emp.id);
  } else if (data.scope === "expiring") {
    const horizon = /* @__PURE__ */ new Date();
    horizon.setDate(horizon.getDate() + data.days);
    q = q.lte("expires_on", horizon.toISOString().slice(0, 10));
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    certifications: rows ?? []
  };
});
const QuestionSchema = objectType({
  id: stringType().uuid().optional(),
  course_id: stringType().uuid(),
  sort_order: numberType().int().min(0).default(0),
  question: stringType().min(1).max(2e3),
  choices: arrayType(stringType().min(1).max(500)).min(2).max(8),
  correct_index: numberType().int().min(0).max(7),
  points: numberType().positive().max(100).default(1),
  explanation: stringType().max(1e3).optional().nullable()
});
const listQuestions_createServerFn_handler = createServerRpc({
  id: "4c8cf66699750f5aa13e47ad0e0f7706370b60a2cf229ac3c7a489f15559c91d",
  name: "listQuestions",
  filename: "src/lib/training.functions.ts"
}, (opts) => listQuestions.__executeServer(opts));
const listQuestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  course_id: stringType().uuid(),
  include_answers: booleanType().default(false),
  for_attempt: booleanType().default(false)
}).parse(d)).handler(listQuestions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let allowAnswers = data.include_answers;
  if (allowAnswers) {
    const {
      data: roles
    } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const r = (roles ?? []).map((x) => x.role);
    if (!r.includes("org_admin") && !r.includes("super_admin") && !r.includes("manager")) allowAnswers = false;
  }
  const table = allowAnswers ? "training_quiz_questions" : "training_quiz_questions_public";
  const cols = allowAnswers ? "*" : "id,course_id,sort_order,question,choices,points";
  const {
    data: rows,
    error
  } = await supabase.from(table).select(cols).eq("course_id", data.course_id).order("sort_order");
  if (error) throw error;
  let list = rows ?? [];
  if (data.for_attempt) {
    const {
      data: course
    } = await supabase.from("training_courses").select("questions_per_attempt,shuffle_questions").eq("id", data.course_id).maybeSingle();
    if (course?.shuffle_questions) list = [...list].sort(() => Math.random() - 0.5);
    if (course?.questions_per_attempt && list.length > course.questions_per_attempt) {
      const pool = course?.shuffle_questions ? list : [...list].sort(() => Math.random() - 0.5);
      list = pool.slice(0, course.questions_per_attempt);
    }
  }
  return {
    questions: list
  };
});
const CopyQuestionsSchema = objectType({
  source_course_id: stringType().uuid(),
  target_course_id: stringType().uuid(),
  question_ids: arrayType(stringType().uuid()).optional()
});
const copyQuestions_createServerFn_handler = createServerRpc({
  id: "02491caa2202d25612b7690c3b0128cec573c0df39a6673539b11f9318d70f47",
  name: "copyQuestions",
  filename: "src/lib/training.functions.ts"
}, (opts) => copyQuestions.__executeServer(opts));
const copyQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CopyQuestionsSchema.parse(d)).handler(copyQuestions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  let q = supabase.from("training_quiz_questions").select("sort_order,question,choices,correct_index,points,explanation").eq("course_id", data.source_course_id);
  if (data.question_ids?.length) q = q.in("id", data.question_ids);
  const {
    data: src,
    error
  } = await q;
  if (error) throw error;
  if (!src?.length) return {
    ok: true,
    count: 0
  };
  const {
    count: existing
  } = await supabase.from("training_quiz_questions").select("id", {
    count: "exact",
    head: true
  }).eq("course_id", data.target_course_id);
  const base = existing ?? 0;
  const rows = src.map((r, i) => ({
    tenant_id,
    course_id: data.target_course_id,
    sort_order: base + i,
    question: r.question,
    choices: r.choices,
    correct_index: r.correct_index,
    points: r.points,
    explanation: r.explanation,
    created_by: userId
  }));
  const {
    error: insErr
  } = await supabase.from("training_quiz_questions").insert(rows);
  if (insErr) throw insErr;
  return {
    ok: true,
    count: rows.length
  };
});
const ImportQuestionsSchema = objectType({
  course_id: stringType().uuid(),
  mode: enumType(["append", "replace"]).default("append"),
  questions: arrayType(objectType({
    question: stringType().min(1).max(2e3),
    choices: arrayType(stringType().min(1).max(500)).min(2).max(8),
    correct_index: numberType().int().min(0).max(7),
    points: numberType().positive().max(100).default(1),
    explanation: stringType().max(1e3).optional().nullable(),
    sort_order: numberType().int().min(0).optional()
  })).min(1).max(500)
});
const importQuestions_createServerFn_handler = createServerRpc({
  id: "052622096593f7deecf9e121593527dd28a8a53c722324fd7fd3f3edf42fb8db",
  name: "importQuestions",
  filename: "src/lib/training.functions.ts"
}, (opts) => importQuestions.__executeServer(opts));
const importQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ImportQuestionsSchema.parse(d)).handler(importQuestions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.includes("org_admin") && !r.includes("super_admin") && !r.includes("manager")) throw new Error("Not authorized");
  for (const q of data.questions) {
    if (q.correct_index >= q.choices.length) throw new Error(`correct_index out of range for: ${q.question.slice(0, 60)}`);
  }
  if (data.mode === "replace") {
    const {
      error: delErr
    } = await supabase.from("training_quiz_questions").delete().eq("course_id", data.course_id);
    if (delErr) throw delErr;
  }
  const {
    count: existing
  } = await supabase.from("training_quiz_questions").select("id", {
    count: "exact",
    head: true
  }).eq("course_id", data.course_id);
  const base = existing ?? 0;
  const rows = data.questions.map((q, i) => ({
    tenant_id,
    course_id: data.course_id,
    sort_order: q.sort_order ?? base + i,
    question: q.question,
    choices: q.choices,
    correct_index: q.correct_index,
    points: q.points,
    explanation: q.explanation ?? null,
    created_by: userId
  }));
  const {
    error: insErr
  } = await supabase.from("training_quiz_questions").insert(rows);
  if (insErr) throw insErr;
  return {
    ok: true,
    count: rows.length
  };
});
const upsertQuestion_createServerFn_handler = createServerRpc({
  id: "bfbf9f7b39b199bdc16ccb5611d30ac23d2d3ed22cb8a1c0eaea2cabf7660546",
  name: "upsertQuestion",
  filename: "src/lib/training.functions.ts"
}, (opts) => upsertQuestion.__executeServer(opts));
const upsertQuestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => QuestionSchema.parse(d)).handler(upsertQuestion_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (data.correct_index >= data.choices.length) throw new Error("correct_index out of range");
  const tenant_id = await getTenant(supabase, userId);
  const payload = {
    ...data,
    tenant_id
  };
  if (!data.id) payload.created_by = userId;
  const {
    data: row,
    error
  } = data.id ? await supabase.from("training_quiz_questions").update(payload).eq("id", data.id).select().single() : await supabase.from("training_quiz_questions").insert(payload).select().single();
  if (error) throw error;
  return {
    question: row
  };
});
const deleteQuestion_createServerFn_handler = createServerRpc({
  id: "e97ce8de4ecdf0f89dd81dd316d0c2af93dd783ed69333fb3b5f3c9b7dffeebb",
  name: "deleteQuestion",
  filename: "src/lib/training.functions.ts"
}, (opts) => deleteQuestion.__executeServer(opts));
const deleteQuestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteQuestion_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("training_quiz_questions").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const AttemptSchema = objectType({
  enrollment_id: stringType().uuid(),
  answers: arrayType(objectType({
    question_id: stringType().uuid(),
    selected_index: numberType().int().min(0).max(7)
  })).min(1).max(200)
});
const submitQuizAttempt_createServerFn_handler = createServerRpc({
  id: "6de647560fbdccfeb000d5ed8303eb26a1354d5c037c078e77e056e00f6403ca",
  name: "submitQuizAttempt",
  filename: "src/lib/training.functions.ts"
}, (opts) => submitQuizAttempt.__executeServer(opts));
const submitQuizAttempt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AttemptSchema.parse(d)).handler(submitQuizAttempt_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: en,
    error: enErr
  } = await supabase.from("training_enrollments").select("id,employee_id,course_id,status,training_courses(id,title,pass_score,max_attempts,validity_months)").eq("id", data.enrollment_id).single();
  if (enErr || !en) throw new Error("Enrollment not found");
  const emp = await getEmployee(supabase, userId);
  const isOwner = emp?.id === en.employee_id;
  if (!isOwner) {
    const {
      data: roles
    } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const r = (roles ?? []).map((x) => x.role);
    if (!r.includes("org_admin") && !r.includes("super_admin") && !r.includes("manager")) throw new Error("Not authorized");
  }
  const course = en.training_courses;
  const pass_score = Number(course?.pass_score ?? 70);
  const max_attempts = course?.max_attempts;
  const {
    count: prior
  } = await supabase.from("training_quiz_attempts").select("id", {
    count: "exact",
    head: true
  }).eq("enrollment_id", en.id);
  if (max_attempts && (prior ?? 0) >= max_attempts) throw new Error(`Maximum attempts (${max_attempts}) reached`);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const qids = data.answers.map((a) => a.question_id);
  const {
    data: qs,
    error: qErr
  } = await supabaseAdmin.from("training_quiz_questions").select("id,correct_index,points").eq("course_id", en.course_id).in("id", qids);
  if (qErr) throw qErr;
  const qMap = new Map((qs ?? []).map((q) => [q.id, q]));
  let score = 0, max = 0;
  const detailed = data.answers.map((a) => {
    const q = qMap.get(a.question_id);
    if (!q) return {
      ...a,
      correct: false,
      points: 0
    };
    const pts = Number(q.points ?? 1);
    max += pts;
    const correct = q.correct_index === a.selected_index;
    if (correct) score += pts;
    return {
      ...a,
      correct,
      points: correct ? pts : 0
    };
  });
  const {
    data: allQ
  } = await supabaseAdmin.from("training_quiz_questions").select("id,points").eq("course_id", en.course_id);
  const answered = new Set(qids);
  (allQ ?? []).forEach((q) => {
    if (!answered.has(q.id)) max += Number(q.points ?? 1);
  });
  const percentage = max > 0 ? Math.round(score / max * 1e4) / 100 : 0;
  const passed = percentage >= pass_score;
  const attempt_number = (prior ?? 0) + 1;
  const {
    data: attempt,
    error: aErr
  } = await supabase.from("training_quiz_attempts").insert({
    tenant_id,
    enrollment_id: en.id,
    course_id: en.course_id,
    employee_id: en.employee_id,
    user_id: userId,
    answers: detailed,
    score,
    max_score: max,
    percentage,
    passed,
    attempt_number
  }).select().single();
  if (aErr) throw aErr;
  if (passed && en.status !== "completed") {
    const completedAt = (/* @__PURE__ */ new Date()).toISOString();
    await supabase.from("training_enrollments").update({
      status: "completed",
      score: percentage,
      completed_at: completedAt
    }).eq("id", en.id);
    if (course?.validity_months) {
      const expires = new Date(completedAt);
      expires.setMonth(expires.getMonth() + course.validity_months);
      await supabase.from("certifications").insert({
        tenant_id,
        employee_id: en.employee_id,
        name: course.title,
        issued_on: completedAt.slice(0, 10),
        expires_on: expires.toISOString().slice(0, 10),
        source_course_id: course.id,
        source_enrollment_id: en.id,
        created_by: userId
      });
    }
  }
  return {
    attempt,
    passed,
    percentage,
    score,
    max_score: max,
    attempt_number
  };
});
const listAttempts_createServerFn_handler = createServerRpc({
  id: "fe4f2c2b021117940b396ac116e05ce1d21c9255f4f111963ebc152b235c301f",
  name: "listAttempts",
  filename: "src/lib/training.functions.ts"
}, (opts) => listAttempts.__executeServer(opts));
const listAttempts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  enrollment_id: stringType().uuid().optional(),
  course_id: stringType().uuid().optional(),
  scope: enumType(["me", "all"]).default("all")
}).parse(d)).handler(listAttempts_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("training_quiz_attempts").select("*, employees(id,first_name,last_name), training_courses(id,title,pass_score)").order("attempted_at", {
    ascending: false
  });
  if (data.enrollment_id) q = q.eq("enrollment_id", data.enrollment_id);
  if (data.course_id) q = q.eq("course_id", data.course_id);
  if (data.scope === "me") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      attempts: []
    };
    q = q.eq("employee_id", emp.id);
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    attempts: rows ?? []
  };
});
const TrainingPresetCourseSchema = objectType({
  title: stringType().min(1).max(200),
  aliases: arrayType(stringType().min(1).max(200)).optional(),
  category: stringType().max(80).optional().nullable(),
  description: stringType().max(2e3).optional().nullable(),
  provider: stringType().max(160).optional().nullable(),
  duration_hours: numberType().nonnegative().optional().nullable(),
  is_mandatory: booleanType().default(false),
  validity_months: numberType().int().positive().max(600).optional().nullable(),
  pass_score: numberType().min(0).max(100).default(70),
  quiz_questions: arrayType(objectType({
    question: stringType().min(1).max(2e3),
    choices: arrayType(stringType().min(1).max(500)).min(2).max(8),
    correct_index: numberType().int().min(0).max(7),
    points: numberType().positive().max(100).default(1),
    explanation: stringType().max(1e3).optional().nullable()
  })).optional()
});
const seedTrainingPreset_createServerFn_handler = createServerRpc({
  id: "9163631608e4f34d59fbdb4731875bac25453069222dc444772b65eb10085438",
  name: "seedTrainingPreset",
  filename: "src/lib/training.functions.ts"
}, (opts) => seedTrainingPreset.__executeServer(opts));
const seedTrainingPreset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  courses: arrayType(TrainingPresetCourseSchema).min(1).max(50)
}).parse(d)).handler(seedTrainingPreset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: existing
  } = await supabase.from("training_courses").select("id,title").eq("tenant_id", tenant_id);
  const existingByTitle = new Map((existing ?? []).map((r) => [r.title.trim().toLowerCase(), r]));
  const normalize = (value) => value.trim().toLowerCase();
  const coursePayload = (c) => ({
    title: c.title,
    category: c.category ?? null,
    description: c.description ?? null,
    provider: c.provider ?? null,
    duration_hours: c.duration_hours ?? null,
    is_mandatory: c.is_mandatory,
    validity_months: c.validity_months ?? null,
    pass_score: c.pass_score ?? 70,
    tenant_id,
    is_active: true
  });
  let inserted = 0;
  let updated = 0;
  let questionsSeeded = 0;
  for (const c of data.courses) {
    for (const q of c.quiz_questions ?? []) {
      if (q.correct_index >= q.choices.length) {
        throw new Error(`correct_index out of range for preset question: ${q.question.slice(0, 60)}`);
      }
    }
    const match = [c.title, ...c.aliases ?? []].map(normalize).map((title) => existingByTitle.get(title)).find(Boolean);
    let courseId = match?.id;
    if (courseId) {
      const {
        error
      } = await supabase.from("training_courses").update(coursePayload(c)).eq("id", courseId);
      if (error) throw error;
      updated++;
    } else {
      const {
        data: row,
        error
      } = await supabase.from("training_courses").insert({
        ...coursePayload(c),
        created_by: userId
      }).select("id,title").single();
      if (error) throw error;
      courseId = row.id;
      existingByTitle.set(normalize(c.title), row);
      inserted++;
    }
    if (courseId && c.quiz_questions?.length) {
      const {
        error: deleteError
      } = await supabase.from("training_quiz_questions").delete().eq("course_id", courseId);
      if (deleteError) throw deleteError;
      const rows = c.quiz_questions.map((q, i) => ({
        tenant_id,
        course_id: courseId,
        sort_order: i,
        question: q.question,
        choices: q.choices,
        correct_index: q.correct_index,
        points: q.points ?? 1,
        explanation: q.explanation ?? null,
        created_by: userId
      }));
      const {
        error,
        count: qCount
      } = await supabase.from("training_quiz_questions").insert(rows, {
        count: "exact"
      });
      if (error) throw error;
      questionsSeeded += qCount ?? rows.length;
    }
  }
  return {
    inserted,
    updated,
    skipped: 0,
    questionsSeeded
  };
});
const sendOverdueTrainingReminders_createServerFn_handler = createServerRpc({
  id: "97244842b97287c98bd5814cc6542e059421c776fb2fb4a224cd2f0507a20c33",
  name: "sendOverdueTrainingReminders",
  filename: "src/lib/training.functions.ts"
}, (opts) => sendOverdueTrainingReminders.__executeServer(opts));
const sendOverdueTrainingReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  course_id: stringType().uuid().optional()
}).parse(d)).handler(sendOverdueTrainingReminders_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let q = supabase.from("training_enrollments").select("id, employee_id, course_id, due_date, status, training_courses!inner(id,title), employees!inner(id,first_name,last_name,email)").eq("tenant_id", tenant_id).lt("due_date", today).in("status", ["assigned", "in_progress"]);
  if (data.course_id) q = q.eq("course_id", data.course_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  if (!rows || rows.length === 0) return {
    sent: 0
  };
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  let sent = 0;
  for (const r of rows) {
    const email = r.employees?.email;
    if (!email) continue;
    const due = r.due_date;
    const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(due).getTime()) / 864e5));
    try {
      await sendInternalEmail({
        templateName: "training-overdue",
        recipientEmail: email,
        templateData: {
          recipientName: r.employees?.first_name ?? void 0,
          courseTitle: r.training_courses?.title ?? "Training course",
          dueDate: due,
          daysOverdue
        },
        idempotencyKey: `training-overdue-${r.id}-${today}`
      });
      sent++;
    } catch {
    }
  }
  return {
    sent,
    candidates: rows.length
  };
});
export {
  assignCourse_createServerFn_handler,
  copyQuestions_createServerFn_handler,
  deleteCertification_createServerFn_handler,
  deleteCourse_createServerFn_handler,
  deleteEnrollment_createServerFn_handler,
  deleteQuestion_createServerFn_handler,
  importQuestions_createServerFn_handler,
  listAttempts_createServerFn_handler,
  listCertifications_createServerFn_handler,
  listCourses_createServerFn_handler,
  listEnrollments_createServerFn_handler,
  listQuestions_createServerFn_handler,
  seedTrainingPreset_createServerFn_handler,
  sendOverdueTrainingReminders_createServerFn_handler,
  submitQuizAttempt_createServerFn_handler,
  updateEnrollment_createServerFn_handler,
  upsertCertification_createServerFn_handler,
  upsertCourse_createServerFn_handler,
  upsertQuestion_createServerFn_handler
};
