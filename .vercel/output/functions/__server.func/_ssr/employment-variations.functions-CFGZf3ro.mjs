import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { B as enumType, a as objectType, z as stringType, G as literalType, A as booleanType, E as recordType, F as anyType } from "../_libs/zod.mjs";
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
const VariationType = enumType(["promotion", "transfer", "pay_change", "hours_change", "role_change", "department_change", "contract_change"]);
const Status = enumType(["draft", "pending_approval", "approved", "rejected", "applied", "cancelled"]);
async function getMyTenant(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  return data?.tenant_id ?? null;
}
async function getActor(supabase, userId) {
  const {
    data: p
  } = await supabase.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  return {
    email: p?.email ?? null,
    name: p?.full_name ?? null
  };
}
async function audit(opts) {
  const actor = await getActor(opts.supabase, opts.userId);
  await opts.supabase.from("employment_variation_audit").insert({
    variation_id: opts.variation_id,
    action: opts.action,
    details: opts.details ?? {},
    actor_id: opts.userId,
    actor_email: actor.email,
    actor_name: actor.name
  });
  return actor;
}
async function notifyVariation(opts) {
  try {
    const {
      sendInternalEmail
    } = await import("./send-internal.server-9cG3k97B.mjs");
    const {
      data: v
    } = await opts.supabase.from("employment_variations").select("variation_type, effective_date, requested_by, employee:employee_id(first_name, last_name, email, manager_id)").eq("id", opts.variation_id).maybeSingle();
    if (!v?.employee) return;
    const emp = v.employee;
    const recipients = /* @__PURE__ */ new Set();
    if (emp.email) recipients.add(emp.email);
    if (emp.manager_id) {
      const {
        data: mgr
      } = await opts.supabase.from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.email) recipients.add(mgr.email);
    }
    if (v.requested_by) {
      const {
        data: r
      } = await opts.supabase.from("profiles").select("email").eq("id", v.requested_by).maybeSingle();
      if (r?.email) recipients.add(r.email);
    }
    for (const to of recipients) {
      await sendInternalEmail({
        templateName: "employment-variation-status",
        recipientEmail: to,
        idempotencyKey: `variation-${opts.variation_id}-${opts.action}`,
        templateData: {
          employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
          variationType: v.variation_type,
          effectiveDate: v.effective_date,
          status: opts.action,
          actorName: opts.actor.name ?? opts.actor.email ?? "Someone",
          reason: opts.reason ?? null
        }
      });
    }
  } catch (e) {
    console.error("[variation email]", e);
  }
}
const listVariations_createServerFn_handler = createServerRpc({
  id: "fff7316ee9ee302d27938f5044f9e3a761857e0156611c85cac1fdced01a7350",
  name: "listVariations",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => listVariations.__executeServer(opts));
const listVariations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: Status.or(literalType("all")).default("all"),
  employee_id: stringType().uuid().optional()
}).partial().parse(d ?? {})).handler(listVariations_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await getMyTenant(supabase, userId);
  let q = supabase.from("employment_variations").select("id, variation_type, effective_date, status, current_snapshot, proposed_changes, requested_by, approver_id, approved_at, applied_at, rejection_reason, notes, created_at, employee:employee_id(id, first_name, last_name, employee_number)").order("created_at", {
    ascending: false
  }).limit(200);
  if (tenantId) q = q.eq("tenant_id", tenantId);
  if (data?.status && data.status !== "all") q = q.eq("status", data.status);
  if (data?.employee_id) q = q.eq("employee_id", data.employee_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    rows: rows ?? []
  };
});
const listVariationAudit_createServerFn_handler = createServerRpc({
  id: "97cb4df4f6b3448917ee29c225220b55113787af6cf23b03f64798ed4d13d323",
  name: "listVariationAudit",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => listVariationAudit.__executeServer(opts));
const listVariationAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  variation_id: stringType().uuid()
}).parse(d)).handler(listVariationAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: entries,
    error
  } = await supabase.from("employment_variation_audit").select("*").eq("variation_id", data.variation_id).order("created_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    entries: entries ?? []
  };
});
const createVariation_createServerFn_handler = createServerRpc({
  id: "34f6a6285521e4a04689c024501e88e7d0d8bf127998e7edafa3bdb0f1491877",
  name: "createVariation",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => createVariation.__executeServer(opts));
const createVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid(),
  variation_type: VariationType,
  effective_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  proposed_changes: recordType(stringType(), anyType()),
  notes: stringType().trim().max(2e3).nullable().optional(),
  submit: booleanType().default(false)
}).parse(d)).handler(createVariation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp,
    error: empErr
  } = await supabase.from("employees").select("id, tenant_id, first_name, last_name, job_title, department_id, employment_type, base_salary, hourly_rate").eq("id", data.employee_id).maybeSingle();
  if (empErr) throw new Error(empErr.message);
  if (!emp) throw new Error("Employee not found");
  const snapshot = {
    job_title: emp.job_title,
    department_id: emp.department_id,
    employment_type: emp.employment_type,
    base_salary: emp.base_salary,
    hourly_rate: emp.hourly_rate
  };
  const {
    data: ins,
    error
  } = await supabase.from("employment_variations").insert({
    employee_id: emp.id,
    tenant_id: emp.tenant_id,
    variation_type: data.variation_type,
    effective_date: data.effective_date,
    current_snapshot: snapshot,
    proposed_changes: data.proposed_changes,
    status: data.submit ? "pending_approval" : "draft",
    requested_by: userId,
    notes: data.notes ?? null
  }).select("id").single();
  if (error) throw new Error(error.message);
  const actor = await audit({
    supabase,
    userId,
    variation_id: ins.id,
    action: data.submit ? "submitted" : "created",
    details: {
      variation_type: data.variation_type,
      effective_date: data.effective_date
    }
  });
  if (data.submit) {
    await notifyVariation({
      supabase,
      variation_id: ins.id,
      action: "submitted",
      actor
    });
  }
  return {
    ok: true,
    id: ins.id
  };
});
const submitVariation_createServerFn_handler = createServerRpc({
  id: "bfc797ec37156876a94160104faa87b48a1ef3ef00b4e30eb84699261daf4960",
  name: "submitVariation",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => submitVariation.__executeServer(opts));
const submitVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(submitVariation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("employment_variations").update({
    status: "pending_approval"
  }).eq("id", data.id).eq("status", "draft");
  if (error) throw new Error(error.message);
  const actor = await audit({
    supabase,
    userId,
    variation_id: data.id,
    action: "submitted"
  });
  await notifyVariation({
    supabase,
    variation_id: data.id,
    action: "submitted",
    actor
  });
  return {
    ok: true
  };
});
const approveVariation_createServerFn_handler = createServerRpc({
  id: "4ca1ac9fb371bb54f4f38421f832a860a9d1cdd2ad9f567a4afd2fb211468fcf",
  name: "approveVariation",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => approveVariation.__executeServer(opts));
const approveVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  comment: stringType().trim().max(1e3).optional()
}).parse(d)).handler(approveVariation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("employment_variations").update({
    status: "approved",
    approver_id: userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    rejection_reason: null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await supabase.from("employment_variation_approvals").insert({
    variation_id: data.id,
    step_no: 1,
    approver_role: "approver",
    approver_id: userId,
    decision: "approved",
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    comment: data.comment ?? null
  });
  const actor = await audit({
    supabase,
    userId,
    variation_id: data.id,
    action: "approved",
    details: {
      comment: data.comment ?? null
    }
  });
  await notifyVariation({
    supabase,
    variation_id: data.id,
    action: "approved",
    actor,
    reason: data.comment ?? null
  });
  return {
    ok: true
  };
});
const rejectVariation_createServerFn_handler = createServerRpc({
  id: "94539d0999be1703d4b95fe4ee34c4004500040ccf0cf81af7581aedac4d09f8",
  name: "rejectVariation",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => rejectVariation.__executeServer(opts));
const rejectVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().trim().min(3).max(1e3)
}).parse(d)).handler(rejectVariation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("employment_variations").update({
    status: "rejected",
    approver_id: userId,
    approved_at: null,
    rejection_reason: data.reason
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await supabase.from("employment_variation_approvals").insert({
    variation_id: data.id,
    step_no: 1,
    approver_role: "approver",
    approver_id: userId,
    decision: "rejected",
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    comment: data.reason
  });
  const actor = await audit({
    supabase,
    userId,
    variation_id: data.id,
    action: "rejected",
    details: {
      reason: data.reason
    }
  });
  await notifyVariation({
    supabase,
    variation_id: data.id,
    action: "rejected",
    actor,
    reason: data.reason
  });
  return {
    ok: true
  };
});
const applyVariation_createServerFn_handler = createServerRpc({
  id: "3378dedbc692f0b6ece4b74908ed6a1bda716b8d74912d010bba18afa18064ee",
  name: "applyVariation",
  filename: "src/lib/employment-variations.functions.ts"
}, (opts) => applyVariation.__executeServer(opts));
const applyVariation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(applyVariation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: v,
    error: vErr
  } = await supabase.from("employment_variations").select("id, employee_id, status, proposed_changes").eq("id", data.id).maybeSingle();
  if (vErr) throw new Error(vErr.message);
  if (!v) throw new Error("Variation not found");
  if (v.status !== "approved") throw new Error("Variation must be approved before applying");
  const allowed = ["job_title", "department_id", "employment_type", "base_salary", "hourly_rate"];
  const updates = {};
  for (const k of allowed) {
    if (v.proposed_changes && k in v.proposed_changes && v.proposed_changes[k] !== null && v.proposed_changes[k] !== "") {
      updates[k] = v.proposed_changes[k];
    }
  }
  if (Object.keys(updates).length) {
    const {
      error: upErr
    } = await supabase.from("employees").update(updates).eq("id", v.employee_id);
    if (upErr) throw new Error(upErr.message);
  }
  const {
    error: stErr
  } = await supabase.from("employment_variations").update({
    status: "applied",
    applied_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", v.id);
  if (stErr) throw new Error(stErr.message);
  const actor = await audit({
    supabase,
    userId,
    variation_id: v.id,
    action: "applied",
    details: {
      applied_fields: Object.keys(updates)
    }
  });
  await notifyVariation({
    supabase,
    variation_id: v.id,
    action: "applied",
    actor
  });
  return {
    ok: true
  };
});
export {
  applyVariation_createServerFn_handler,
  approveVariation_createServerFn_handler,
  createVariation_createServerFn_handler,
  listVariationAudit_createServerFn_handler,
  listVariations_createServerFn_handler,
  rejectVariation_createServerFn_handler,
  submitVariation_createServerFn_handler
};
