import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { e as enforceRateLimit, v as validateEvidenceUrl } from "./rate-limit.functions-CFVeXiWs.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
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
async function recordAudit(supabase, userId, assignment_id, task_id, action, details) {
  const {
    data: p
  } = await supabase.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  await supabase.from("onboarding_control_room_audit").insert({
    assignment_id,
    task_id,
    action,
    details,
    actor_id: userId,
    actor_email: p?.email ?? null,
    actor_name: p?.full_name ?? null
  });
}
const listOnboardingTrackerRows_createServerFn_handler = createServerRpc({
  id: "72825e9b46a5c885c77a75525373e1faedc10ed8ec47887547b564bdec7fde41",
  name: "listOnboardingTrackerRows",
  filename: "src/lib/onboarding-tracker.functions.ts"
}, (opts) => listOnboardingTrackerRows.__executeServer(opts));
const listOnboardingTrackerRows = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: stringType().max(40).optional(),
  country: stringType().max(8).optional(),
  branchId: stringType().uuid().optional(),
  onlyOverdue: booleanType().optional()
}).partial().parse(d ?? {})).handler(listOnboardingTrackerRows_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) return {
    rows: []
  };
  const {
    data: assignments
  } = await supabase.from("onboarding_assignments").select("id, status, due_date, employee:employee_id(id, first_name, last_name, employee_number, hire_date, branch_id, tenant_id, job_title)").order("due_date", {
    ascending: true,
    nullsFirst: false
  }).limit(500);
  let rows = (assignments ?? []).filter((a) => a.employee?.tenant_id === me.tenant_id);
  if (data?.status) rows = rows.filter((r) => r.status === data.status);
  if (data?.branchId) rows = rows.filter((r) => r.employee?.branch_id === data.branchId);
  if (data?.country) {
    const branchIds = Array.from(new Set(rows.map((r) => r.employee?.branch_id).filter(Boolean)));
    const {
      data: branches
    } = branchIds.length ? await supabase.from("tenant_branches").select("id, country_code").in("id", branchIds) : {
      data: []
    };
    const cc = new Map((branches ?? []).map((b) => [b.id, b.country_code]));
    rows = rows.filter((r) => cc.get(r.employee?.branch_id) === data.country);
  }
  const ids = rows.map((r) => r.id);
  if (!ids.length) return {
    rows: []
  };
  const {
    data: tasks
  } = await supabase.from("onboarding_control_room_tasks").select("assignment_id, status, due_date, attestation_required, attested_at, evidence_url").in("assignment_id", ids);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const stats = {};
  (tasks ?? []).forEach((t) => {
    const s = stats[t.assignment_id] ??= {
      total: 0,
      done: 0,
      overdue: 0,
      missingAttest: 0,
      missingEvidence: 0
    };
    s.total++;
    if (t.status === "completed" || t.status === "skipped") s.done++;
    if (t.status !== "completed" && t.status !== "skipped" && t.due_date && t.due_date < today) s.overdue++;
    if (t.attestation_required && !t.attested_at) s.missingAttest++;
    if (t.attestation_required && !t.evidence_url) s.missingEvidence++;
  });
  let out = rows.map((r) => ({
    ...r,
    stats: stats[r.id] ?? {
      total: 0,
      done: 0,
      overdue: 0,
      missingAttest: 0,
      missingEvidence: 0
    }
  }));
  if (data?.onlyOverdue) out = out.filter((r) => r.stats.overdue > 0);
  return {
    rows: out
  };
});
const attestControlRoomTask_createServerFn_handler = createServerRpc({
  id: "af257575dd4616160fc9c895f390ab6f221faae2bd8523de8121f0e8040d8f8c",
  name: "attestControlRoomTask",
  filename: "src/lib/onboarding-tracker.functions.ts"
}, (opts) => attestControlRoomTask.__executeServer(opts));
const attestControlRoomTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  signature: stringType().trim().min(2).max(200),
  evidence_url: stringType().url().max(1e3).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable()
}).parse(d)).handler(attestControlRoomTask_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "tracker_attest", 60, 60);
  if (data.evidence_url) validateEvidenceUrl(data.evidence_url);
  const {
    data: existing
  } = await supabase.from("onboarding_control_room_tasks").select("id, assignment_id, title").eq("id", data.id).maybeSingle();
  if (!existing) throw new Error("Task not found");
  const {
    error
  } = await supabase.from("onboarding_control_room_tasks").update({
    attestation_required: true,
    attestation_signature: data.signature,
    attested_at: (/* @__PURE__ */ new Date()).toISOString(),
    attested_by: userId,
    evidence_url: data.evidence_url ?? null,
    verifier_notes: data.notes ?? null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await recordAudit(supabase, userId, existing.assignment_id, existing.id, "task_attested", {
    title: existing.title,
    signature: data.signature,
    evidence: !!data.evidence_url
  });
  return {
    ok: true
  };
});
const toggleTaskAttestationRequired_createServerFn_handler = createServerRpc({
  id: "756f51b013ce24ca31145c63d7fafa7fa86faac2691c3426362700c0358a970d",
  name: "toggleTaskAttestationRequired",
  filename: "src/lib/onboarding-tracker.functions.ts"
}, (opts) => toggleTaskAttestationRequired.__executeServer(opts));
const toggleTaskAttestationRequired = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  required: booleanType()
}).parse(d)).handler(toggleTaskAttestationRequired_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: t
  } = await supabase.from("onboarding_control_room_tasks").select("assignment_id, title").eq("id", data.id).maybeSingle();
  const {
    error
  } = await supabase.from("onboarding_control_room_tasks").update({
    attestation_required: data.required
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  if (t) await recordAudit(supabase, userId, t.assignment_id, data.id, "task_attestation_toggled", {
    title: t.title,
    required: data.required
  });
  return {
    ok: true
  };
});
const acknowledgeCountryMerge_createServerFn_handler = createServerRpc({
  id: "ea2ed1576d6d3267dd471a669a2877f0c575f98d01e1ec3370e3103fdf265f9b",
  name: "acknowledgeCountryMerge",
  filename: "src/lib/onboarding-tracker.functions.ts"
}, (opts) => acknowledgeCountryMerge.__executeServer(opts));
const acknowledgeCountryMerge = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignment_id: stringType().uuid()
}).parse(d)).handler(acknowledgeCountryMerge_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: a
  } = await supabase.from("onboarding_assignments").select("metadata").eq("id", data.assignment_id).maybeSingle();
  const meta = {
    ...a?.metadata ?? {},
    country_merge_acknowledged_at: (/* @__PURE__ */ new Date()).toISOString(),
    country_merge_acknowledged_by: userId
  };
  await supabase.from("onboarding_assignments").update({
    metadata: meta
  }).eq("id", data.assignment_id);
  await recordAudit(supabase, userId, data.assignment_id, null, "country_merge_acknowledged", {});
  return {
    ok: true
  };
});
export {
  acknowledgeCountryMerge_createServerFn_handler,
  attestControlRoomTask_createServerFn_handler,
  listOnboardingTrackerRows_createServerFn_handler,
  toggleTaskAttestationRequired_createServerFn_handler
};
