import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, D as arrayType, C as numberType, A as booleanType } from "../_libs/zod.mjs";
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
const upsertFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).optional(),
  isDefault: booleanType().default(false),
  questions: arrayType(QuestionSchema).min(1).max(30),
  changeNote: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("8a3cbd0762c649d4c9c8f45bce36c03bf340a5100f3d9913e98bfd84758bddf4"));
const deleteFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8e4f128091dcce2cca9cc436de545dbb196b9571375614b6433ff8b3ae8ceced"));
const getFeedbackTemplateHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c1912505b88cbebe86baabd274aac8518d17029053430a81d32c7ddb0b7fe392"));
const archiveFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e2a9650cd2539a7bd9e8d26e5c179a67bbb29f89b118a4485c23eea7a8508ee2"));
const restoreFeedbackTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("de8015cbeb820e5fdb1746d4e31234cfff692d66d49ee49d44e0e1a9a4f92c33"));
const listArchivedFeedbackTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("730de2529e1bdb63993805f5f3e041f8e65dc8130d29d45476d76a3b42f53a6b"));
const requestFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid(),
  requestedUserIds: arrayType(stringType().uuid()).min(1).max(20),
  kind: enumType(["peer", "upward"]).default("peer"),
  message: stringType().max(1e3).optional(),
  templateId: stringType().uuid().optional(),
  dueDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).parse(d)).handler(createSsrRpc("256610d3536a5f0fe3cec696bac0039169d045fdd3e6d7aed93433501349521a"));
const submitFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  text: stringType().max(5e3).optional(),
  responses: arrayType(ResponseSchema).max(30).optional()
}).parse(d)).handler(createSsrRpc("cc922d2989421e98b065febdf00ca598b5ac90fddb1c459193baa081ac8d532d"));
const declineFeedback360 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("9ce21da18b3903926da35447be9545ce4b4c628dbf53926af8df8014a24cab66"));
const sendFeedbackReminders = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8d97518090a7ed3678536574eb4f24bc35f04fd4088aa680f1874fbeda8a2780"));
const getFeedback360Analytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("88a18470a3068bf022f3cb35cfe7da43e3a6b3492b9ab6a3cf421906f9f3037e"));
const getFeedback360AuditTrail = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  reviewId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(100)
}).parse(d ?? {})).handler(createSsrRpc("ea0fcce4b3530f296c16700d87f16700c1cab5b2bef072a5383f3c53c027efc2"));
export {
  sendFeedbackReminders as a,
  getFeedback360AuditTrail as b,
  deleteFeedbackTemplate as c,
  declineFeedback360 as d,
  getFeedbackTemplateHistory as e,
  archiveFeedbackTemplate as f,
  getFeedback360Analytics as g,
  restoreFeedbackTemplate as h,
  listArchivedFeedbackTemplates as l,
  requestFeedback360 as r,
  submitFeedback360 as s,
  upsertFeedbackTemplate as u
};
