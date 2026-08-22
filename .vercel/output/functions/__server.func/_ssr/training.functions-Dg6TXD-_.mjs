import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, C as numberType, D as arrayType, A as booleanType } from "../_libs/zod.mjs";
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
const listCourses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5d2ad5d9a89cecfc947baf6cf81572b867bf939cca32893bc33769294cb36f50"));
const upsertCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CourseSchema.parse(d)).handler(createSsrRpc("4ee95b4c2a51b86d24c8d8034292dde4fc882ba13b721dfd49e14142f8215fd1"));
const deleteCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3db2ea82a37c3ec3c0cc7216c99ce3f2442779fbf6675fd1ccb5b063da24da1c"));
const AssignSchema = objectType({
  course_id: stringType().uuid(),
  employee_ids: arrayType(stringType().uuid()).min(1).max(500),
  due_date: stringType().optional().nullable()
});
const assignCourse = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AssignSchema.parse(d)).handler(createSsrRpc("93c95edd8ee0becc18aadb6881fd09bd066f7178e381fb2672e163859608acd1"));
const UpdateEnrollmentSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["assigned", "in_progress", "completed", "expired", "waived"]).optional(),
  score: numberType().min(0).max(100).optional().nullable(),
  certificate_url: stringType().url().max(500).optional().nullable(),
  notes: stringType().max(1e3).optional().nullable(),
  completed_at: stringType().optional().nullable()
});
const updateEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateEnrollmentSchema.parse(d)).handler(createSsrRpc("74f7543a5e53313554c353c5a3148f9db947d5e5f8de11755e49c7be6968c060"));
const listEnrollments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all"]).default("all"),
  status: stringType().optional(),
  course_id: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("df8b29b20c68ed4d649afe2080d3d384a6e7d561fa1f78bda1fb2575ee702164"));
const deleteEnrollment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e9a675d4b5a818984d988108c294524932f3fb7f1a4ee56a811e44669d9638e4"));
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
const upsertCertification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CertSchema.parse(d)).handler(createSsrRpc("1f5da21c5cb19e421adbcf77cfd7ae7cbcd6aedf81fac06eaf3f0d20b8aa4add"));
const deleteCertification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("bf4b2bb75da76d89644857d9f7cd2f5958399e3d0d409cdef45a654eb9fe46d1"));
const listCertifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["me", "all", "expiring"]).default("all"),
  days: numberType().int().min(1).max(365).default(60)
}).parse(d)).handler(createSsrRpc("2a286373443198420f65cc93d3ae39c439bf12ad19f2979dbca7bff057fc0dbc"));
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
const listQuestions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  course_id: stringType().uuid(),
  include_answers: booleanType().default(false),
  for_attempt: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("4c8cf66699750f5aa13e47ad0e0f7706370b60a2cf229ac3c7a489f15559c91d"));
const CopyQuestionsSchema = objectType({
  source_course_id: stringType().uuid(),
  target_course_id: stringType().uuid(),
  question_ids: arrayType(stringType().uuid()).optional()
});
const copyQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CopyQuestionsSchema.parse(d)).handler(createSsrRpc("02491caa2202d25612b7690c3b0128cec573c0df39a6673539b11f9318d70f47"));
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
const importQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ImportQuestionsSchema.parse(d)).handler(createSsrRpc("052622096593f7deecf9e121593527dd28a8a53c722324fd7fd3f3edf42fb8db"));
const upsertQuestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => QuestionSchema.parse(d)).handler(createSsrRpc("bfbf9f7b39b199bdc16ccb5611d30ac23d2d3ed22cb8a1c0eaea2cabf7660546"));
const deleteQuestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e97ce8de4ecdf0f89dd81dd316d0c2af93dd783ed69333fb3b5f3c9b7dffeebb"));
const AttemptSchema = objectType({
  enrollment_id: stringType().uuid(),
  answers: arrayType(objectType({
    question_id: stringType().uuid(),
    selected_index: numberType().int().min(0).max(7)
  })).min(1).max(200)
});
const submitQuizAttempt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AttemptSchema.parse(d)).handler(createSsrRpc("6de647560fbdccfeb000d5ed8303eb26a1354d5c037c078e77e056e00f6403ca"));
const listAttempts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  enrollment_id: stringType().uuid().optional(),
  course_id: stringType().uuid().optional(),
  scope: enumType(["me", "all"]).default("all")
}).parse(d)).handler(createSsrRpc("fe4f2c2b021117940b396ac116e05ce1d21c9255f4f111963ebc152b235c301f"));
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
const seedTrainingPreset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  courses: arrayType(TrainingPresetCourseSchema).min(1).max(50)
}).parse(d)).handler(createSsrRpc("9163631608e4f34d59fbdb4731875bac25453069222dc444772b65eb10085438"));
const sendOverdueTrainingReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  course_id: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("97244842b97287c98bd5814cc6542e059421c776fb2fb4a224cd2f0507a20c33"));
export {
  listEnrollments as a,
  assignCourse as b,
  listCertifications as c,
  deleteEnrollment as d,
  upsertCertification as e,
  deleteCertification as f,
  listQuestions as g,
  listAttempts as h,
  upsertCourse as i,
  deleteCourse as j,
  seedTrainingPreset as k,
  listCourses as l,
  sendOverdueTrainingReminders as m,
  upsertQuestion as n,
  deleteQuestion as o,
  copyQuestions as p,
  importQuestions as q,
  submitQuizAttempt as s,
  updateEnrollment as u
};
