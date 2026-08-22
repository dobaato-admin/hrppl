import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, C as numberType, A as booleanType, D as arrayType, H as unionType } from "../_libs/zod.mjs";
const createReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(120),
  periodStart: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: stringType().regex(/^\d{4}-\d{2}-\d{2}$/)
}).parse(d)).handler(createSsrRpc("81f9295736b3c453103be20a3fc9373ce07a214d9364585ed3e8684d39880ef4"));
const activateReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("bbc5738d190c0fb308efac1c1c35d4a53b0e8673989cb3a3bafed876a82a49b8"));
const updateReviewCycleTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid(),
  templateId: stringType().uuid().nullable()
}).parse(d)).handler(createSsrRpc("f01eaf4907d4c5e2c5646434b017611ffe4ceef186b2faa4a33c73dca5cc6d2a"));
const closeReviewCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("563a0f16affb0fab026212d2c0cb5910d775243c9ef9fbbb7f099fbdf78d3efd"));
const updateReviewCycleReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid(),
  remindersEnabled: booleanType(),
  intervalDays: numberType().int().min(1).max(60),
  startOffsetDays: numberType().int().min(0).max(365),
  businessDaysOnly: booleanType(),
  maxCount: numberType().int().min(1).max(50).nullable()
}).parse(d)).handler(createSsrRpc("ca529b66da01d8b1561e05958cde8e1818a8fc2ca4ce7cbc677a4422a44829ba"));
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
}).parse(d)).handler(createSsrRpc("8d07a91bc0ade26baede2753764241626582e36df26ec22c0eaf0b82ae2eac3e"));
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
}).parse(d)).handler(createSsrRpc("f46b1e944a242ac4672dc085bb45cfcdde7cab8d59dbec8a43f6ba73cec189f7"));
const deleteGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("efdefab07947169d0918629b6da9d6c728b0a03436684b27bca2b27a8ced2c66"));
const responseSchema = arrayType(objectType({
  questionId: stringType().min(1).max(100),
  rating: numberType().nullable().optional(),
  text: stringType().max(5e3).nullable().optional()
})).max(50).optional();
const submitSelfReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  selfRating: numberType().min(1).max(10),
  selfComments: stringType().max(5e3).optional(),
  responses: responseSchema
}).parse(d)).handler(createSsrRpc("4a19a4ef26793677503238e3ab4ea1e2bf8b8b3b55e6f3ac5bfb131dc093624e"));
const submitManagerReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  managerRating: numberType().min(1).max(10),
  managerComments: stringType().max(5e3).optional(),
  finalize: booleanType().default(false),
  responses: responseSchema
}).parse(d)).handler(createSsrRpc("cbebc65c4e4ac15ef103cc2dcfe0d304db6ef5aa52ee757bab9208baf4595687"));
const calibrateReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  calibratedRating: numberType().min(1).max(10).nullable(),
  notes: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("3bf0861b437548d5b4a28d563199dd81165c2ffa639f26d42aa411da5a03bd1f"));
const acknowledgeReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  comments: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("de145e8b4e54cc0cffab0c395e7bc48f0a2a37c835c00b323f6c0ae20d803683"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  kind: enumType(["peer", "upward"]).default("peer"),
  text: stringType().min(1).max(5e3)
}).parse(d)).handler(createSsrRpc("577b803319655a9c90f59b40397ca9e6469b5ed7c501e7c6bba336eeb0af1358"));
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
}).parse(d)).handler(createSsrRpc("70bdb04465e3960209a10887cf8624df1f34b1d8dd4a1e996a29bdb7452f1bb3"));
const deleteReviewTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b76314ebe3d83aab208968e61d3e57e95a21894d484a746c55348e30eddd149d"));
const getCycleProgress = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("add13753f71f13606fc8c20d4b151124ef9f42bb6f4488ef7c889d2129a03da4"));
const getReviewAuditTrail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(100)
}).parse(d)).handler(createSsrRpc("2ed294dc7be47c732fb8c18d19be294e8f0c2e53eed689a096128928877d1bcd"));
export {
  acknowledgeReview as a,
  activateReviewCycle as b,
  createReviewCycle as c,
  deleteGoal as d,
  closeReviewCycle as e,
  submitManagerReview as f,
  updateReviewCycleTemplate as g,
  calibrateReview as h,
  getCycleProgress as i,
  getReviewAuditTrail as j,
  updateReviewCycleReminders as k,
  upsertReviewTemplate as l,
  deleteReviewTemplate as m,
  previewReviewReminderSchedule as p,
  submitSelfReview as s,
  upsertGoal as u
};
