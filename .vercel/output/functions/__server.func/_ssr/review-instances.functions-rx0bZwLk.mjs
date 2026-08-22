import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, B as enumType, z as stringType, F as anyType, C as numberType, D as arrayType } from "../_libs/zod.mjs";
const evidenceSchema = arrayType(objectType({
  type: enumType(["document", "url", "social", "screenshot"]),
  name: stringType().max(300),
  url: stringType().max(2e3),
  size: numberType().optional(),
  mime: stringType().max(120).optional()
})).max(20).default([]);
const generateReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid(),
  employeeIds: arrayType(stringType().uuid()).min(1).max(2e3).optional(),
  horizonDays: numberType().int().min(7).max(730).default(365),
  dueOffsetDays: numberType().int().min(0).max(60).default(7)
}).parse(d)).handler(createSsrRpc("790a65af93936e0b362a1c57b42f24cbd2a28bb583684e9d39b15093108a8301"));
const listMyReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["pending", "submitted", "approved", "rejected", "all"]).default("all")
}).parse(d)).handler(createSsrRpc("e996aa2e4316979c321bbbfecc52d2f7df38d77c7078925d12722dbe15b6955a"));
const submitInput = objectType({
  id: stringType().uuid(),
  score: anyType(),
  evidence: evidenceSchema,
  comments: stringType().max(2e3).optional()
});
const submitReviewInstance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => submitInput.parse(d)).handler(createSsrRpc("989dff55afece2dac071e6fc2b6dbfd75e637ee622dad10d1281b880f8f0a8bd"));
const resubmitReviewInstance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => submitInput.parse(d)).handler(createSsrRpc("e57535bb30a65d6eaac70f0ea3b7c8267d2e12d99fef3cf0203b66c9cf73ac39"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  comments: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("88c80a0f3ead8fc28b622d847b3487e84a01eeaa27208108ed13ce6fa572744c"));
const listInstanceVersions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  instanceId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d31900949f8a8524ca890cf6f7cbaf57d06a718d67e63a2e7cc42f8e9e34eeb2"));
const logTemplateAuditEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  templateId: stringType().uuid().nullable(),
  templateName: stringType().min(1).max(200),
  action: enumType(["export", "import"]),
  fileName: stringType().max(300).optional(),
  snapshot: anyType().optional()
}).parse(d)).handler(createSsrRpc("71319c89323470fef0e46513cdfe7b21575e069016f5e259f98f750d7e35b8c8"));
const listTemplateAuditLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  limit: numberType().int().min(1).max(500).default(100),
  action: enumType(["export", "import", "all"]).default("all")
}).parse(d)).handler(createSsrRpc("5ced16b0fc5af624ecf22b1105836c4abecf92a5913257253c6701da875a0277"));
const reviewDashboardSummary = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("fbfbc94005c6d2ccaea1bd22b821c5d1a6ea0fd0b3844729a0979fcff25be5e3"));
const exportReviewInstances = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: stringType().uuid().optional(),
  employeeId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("c5e9858e62caea92711f01160a6acc47174fb636c65eb4657096541c43fe6ea5"));
export {
  listInstanceVersions as a,
  logTemplateAuditEvent as b,
  listTemplateAuditLog as c,
  reviewDashboardSummary as d,
  exportReviewInstances as e,
  generateReviewInstances as g,
  listMyReviewInstances as l,
  resubmitReviewInstance as r,
  submitReviewInstance as s
};
