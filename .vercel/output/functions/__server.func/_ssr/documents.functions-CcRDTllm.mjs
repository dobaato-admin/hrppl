import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, D as arrayType, A as booleanType, C as numberType, E as recordType, G as literalType } from "../_libs/zod.mjs";
const listTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8f8398e96f70354858f29e9774e76da8f68d81529cf60e32bd0d6b7c36138a8a"));
const getTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("279ed1469b4ca2b9991da32381113186ad1ba836a45d71f49aaab50e2c58a06c"));
const TemplateUpsertSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  doc_type: enumType(["employment_contract", "offer_letter", "policy", "hr_letter", "other"]),
  body_html: stringType().max(2e5),
  merge_fields: arrayType(stringType().regex(/^[a-zA-Z0-9_.]+$/).max(64)).max(100).default([]),
  requires_signature: booleanType().default(true),
  requires_countersign: booleanType().default(false),
  countersigner_role: stringType().max(100).optional().nullable(),
  default_due_days: numberType().int().min(1).max(365).default(14)
});
const upsertTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => TemplateUpsertSchema.parse(d)).handler(createSsrRpc("988de5c255de0140459b3fbe3ff3f4e18109c1492bf453b5bbd6f772f3bbedea"));
const publishTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("73769c5ccda941434468190642584a61396f75a48db78803dc3470365be06524"));
const archiveTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d2ed42b050fd0eb33060b934e42e6790d348255b6a6b49a46efa2d7ba4508b80"));
const cloneTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("645c993d6bd494f5b894b9bd244045d0e7ca4ae69ffe281b3ecadfb04ce0b402"));
const CountersignerSchema = objectType({
  employee_id: stringType().uuid().optional(),
  user_id: stringType().uuid().optional(),
  email: stringType().email().max(255).optional(),
  name: stringType().min(1).max(200).optional(),
  role: stringType().max(100).optional()
}).optional();
const SendEnvelopeSchema = objectType({
  template_id: stringType().uuid().optional(),
  doc_type: enumType(["employment_contract", "offer_letter", "policy", "hr_letter", "other"]).optional(),
  subject: stringType().trim().min(1).max(300),
  body_html: stringType().max(2e5).optional(),
  recipients: arrayType(objectType({
    employee_id: stringType().uuid().optional(),
    email: stringType().email().max(255).optional(),
    name: stringType().min(1).max(200).optional(),
    merge_values: recordType(stringType(), stringType().max(2e3)).default({})
  })).min(1).max(500),
  due_days: numberType().int().min(1).max(365).optional(),
  requires_signature: booleanType().optional(),
  countersigner: CountersignerSchema,
  require_geofence: booleanType().optional(),
  allowed_geofence_ids: arrayType(stringType().uuid()).max(20).optional()
});
const sendEnvelopes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SendEnvelopeSchema.parse(d)).handler(createSsrRpc("493d371f437e58ea84560e458b360a66aaf25f8515d2775d99a7713439a2ed15"));
const listEnvelopes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: stringType().optional(),
  doc_type: stringType().optional(),
  search: stringType().max(200).optional()
}).parse(d ?? {})).handler(createSsrRpc("6a61749174e00b5f6f1dba9d3b62065a3301ba07fa28dedf556620a1492cce1d"));
const getEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2c8b2f576335cfeb8a70e9b9026e9016b4e5929bb9485aef89c16c430ad4960e"));
const cancelEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("41ff17276628972f6589ba5fa4c55d62fc4ae8f6103b1e1ca2f8f08891fc6696"));
const myPendingEnvelopes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ad9ef467e0293322ecb0b0f6c06ce0a3138a5b69f939addad28fdfb193ad189c"));
const getSigningEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f8f238ab345677ff42a3f1cc0916f88d9281b9c1d206cde9493aef020a6beeb0"));
const SignSchema = objectType({
  envelope_id: stringType().uuid(),
  method: enumType(["typed", "drawn", "acknowledged"]),
  typed: stringType().max(200).optional(),
  drawn_svg: stringType().max(2e5).optional(),
  consent: literalType(true),
  geo: objectType({
    latitude: numberType().min(-90).max(90),
    longitude: numberType().min(-180).max(180),
    accuracy_m: numberType().nonnegative().max(1e5).optional()
  }).optional()
});
const submitSignature = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SignSchema.parse(d)).handler(createSsrRpc("f9c994d04030c47f67f804b8043b8f05b95c6f868cf389d501d063d429b67330"));
const declineEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid(),
  reason: stringType().max(500)
}).parse(d)).handler(createSsrRpc("7c2fa475a105a23489b9543e8d511ee4918ef170db9694884479a9919d461708"));
const sendEnvelopeReminder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3a737fdfa82a3e2e650faefb09107b9a405d719dbac97834d49d9d0880dad171"));
const getCertificate = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  token: stringType().min(20).max(80)
}).parse(d)).handler(createSsrRpc("23d6c4acec297d0614c7ce517d851ff7850138f3887ead0b16d6568c6450e58b"));
const renderTemplatePreview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  body_html: stringType().max(2e5),
  sample_values: recordType(stringType(), stringType().max(2e3)).optional()
}).parse(d)).handler(createSsrRpc("bbbd0a43cc6d2edca875cf88cfa631aab6dff19aa626ad51aaa99f7062ddc562"));
const listExpiringDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0784cfa9c0df1fbc161b9d8bb8bca3a23f5b08bc3b41ddfc6c3c49848d499fcc"));
const verifyEmployeeDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["verified", "rejected", "unverified"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("a25b2d07aa2e174d9ab26eedba0431b7b8a693a0a4fd72d0fbd6237647d961a9"));
const listStarterTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a5ef2f439fe399e7725f2852aca65618ae9363c979702d3f955c33b7e6fcec2c"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  key: stringType().min(1).max(80)
}).parse(d)).handler(createSsrRpc("94181a72b451f8dd8515d1821ae35359a010d9b4499864315d6144a75300d711"));
const instantiateStarterTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  key: stringType().min(1).max(80)
}).parse(d)).handler(createSsrRpc("bb20c5d63b4cedc513d09ee27fb135a72baf892deac26b364f76661a51acee46"));
export {
  sendEnvelopes as a,
  listTemplates as b,
  cancelEnvelope as c,
  declineEnvelope as d,
  getCertificate as e,
  getTemplate as f,
  getSigningEnvelope as g,
  archiveTemplate as h,
  cloneTemplate as i,
  listStarterTemplates as j,
  instantiateStarterTemplate as k,
  listEnvelopes as l,
  myPendingEnvelopes as m,
  listExpiringDocuments as n,
  getEnvelope as o,
  publishTemplate as p,
  sendEnvelopeReminder as q,
  renderTemplatePreview as r,
  submitSignature as s,
  upsertTemplate as u,
  verifyEmployeeDocument as v
};
