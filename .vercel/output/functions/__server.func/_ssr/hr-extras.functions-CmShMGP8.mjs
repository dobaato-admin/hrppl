import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, C as numberType, D as arrayType, B as enumType } from "../_libs/zod.mjs";
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
  } = await supabase.from("employees").select("id,tenant_id,manager_id").eq("user_id", userId).maybeSingle();
  return data;
}
const DesignationSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(120),
  code: stringType().max(40).optional().nullable(),
  grade: stringType().max(40).optional().nullable(),
  department_id: stringType().uuid().optional().nullable(),
  min_salary: numberType().nonnegative().optional().nullable(),
  max_salary: numberType().nonnegative().optional().nullable(),
  currency_code: stringType().max(3).optional().nullable(),
  description: stringType().max(1e3).optional().nullable(),
  is_active: booleanType().default(true)
});
const listDesignations_createServerFn_handler = createServerRpc({
  id: "0cbdbd4d0a5f60c0ab6362f75d90f21231bd26e0f696acdbcc79835080e5e1d8",
  name: "listDesignations",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listDesignations.__executeServer(opts));
const listDesignations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listDesignations_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("designations").select("*, departments(name)").order("title");
  if (error) throw error;
  return {
    designations: data ?? []
  };
});
const upsertDesignation_createServerFn_handler = createServerRpc({
  id: "676f2683c7cdd2e7642ed4cf01b85da58b5c9c7cbd904aecbf24147789a4295e",
  name: "upsertDesignation",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => upsertDesignation.__executeServer(opts));
const upsertDesignation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DesignationSchema.parse(d)).handler(upsertDesignation_createServerFn_handler, async ({
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
  const {
    data: row,
    error
  } = data.id ? await supabase.from("designations").update(payload).eq("id", data.id).select().single() : await supabase.from("designations").insert(payload).select().single();
  if (error) throw error;
  return {
    designation: row
  };
});
const deleteDesignation_createServerFn_handler = createServerRpc({
  id: "d062cf7b6d55e9d7cc7ccb1dd6530cd9e2d77b6417b2607c51ae5c671ece5ebc",
  name: "deleteDesignation",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => deleteDesignation.__executeServer(opts));
const deleteDesignation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDesignation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("designations").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const SeedPresetSchema = objectType({
  currency_code: stringType().min(3).max(3).default("USD"),
  department_id: stringType().uuid().optional().nullable(),
  designations: arrayType(objectType({
    title: stringType().min(1).max(120),
    grade: stringType().max(40).optional().nullable(),
    code: stringType().max(40).optional().nullable(),
    min_salary: numberType().nonnegative().optional().nullable(),
    max_salary: numberType().nonnegative().optional().nullable(),
    description: stringType().max(1e3).optional().nullable()
  })).min(1).max(50)
});
const seedDesignationPreset_createServerFn_handler = createServerRpc({
  id: "8b3a98be6db256140695576d620a272ac657e412b419627345a9f22518a36993",
  name: "seedDesignationPreset",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => seedDesignationPreset.__executeServer(opts));
const seedDesignationPreset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SeedPresetSchema.parse(d)).handler(seedDesignationPreset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const titles = data.designations.map((d) => d.title);
  const {
    data: existing
  } = await supabase.from("designations").select("title").eq("tenant_id", tenant_id);
  const seen = new Set((existing ?? []).map((r) => String(r.title).toLowerCase()));
  const rows = data.designations.filter((d) => !seen.has(d.title.toLowerCase())).map((d) => ({
    ...d,
    tenant_id,
    department_id: data.department_id ?? null,
    currency_code: data.currency_code,
    is_active: true
  }));
  if (rows.length === 0) return {
    inserted: 0,
    skipped: titles.length
  };
  const {
    error
  } = await supabase.from("designations").insert(rows);
  if (error) throw error;
  return {
    inserted: rows.length,
    skipped: titles.length - rows.length
  };
});
const PromotionSchema = objectType({
  employee_id: stringType().uuid(),
  to_designation_id: stringType().uuid().optional().nullable(),
  to_job_title: stringType().min(1).max(160),
  to_department_id: stringType().uuid().optional().nullable(),
  to_manager_id: stringType().uuid().optional().nullable(),
  to_grade: stringType().max(40).optional().nullable(),
  effective_date: stringType(),
  reason: stringType().max(1e3).optional().nullable()
});
const proposePromotion_createServerFn_handler = createServerRpc({
  id: "d7eb527e9a7a072a13b24eb93e3a78586c86ca52671028c7a9cc4e833aedf1d0",
  name: "proposePromotion",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => proposePromotion.__executeServer(opts));
const proposePromotion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PromotionSchema.parse(d)).handler(proposePromotion_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: emp,
    error: e1
  } = await supabase.from("employees").select("job_title,department_id,manager_id").eq("id", data.employee_id).single();
  if (e1) throw e1;
  const {
    data: row,
    error
  } = await supabase.from("promotions").insert({
    tenant_id,
    employee_id: data.employee_id,
    from_job_title: emp.job_title,
    from_department_id: emp.department_id,
    from_manager_id: emp.manager_id,
    to_designation_id: data.to_designation_id,
    to_job_title: data.to_job_title,
    to_department_id: data.to_department_id,
    to_manager_id: data.to_manager_id,
    to_grade: data.to_grade,
    effective_date: data.effective_date,
    reason: data.reason,
    proposed_by: userId,
    status: "proposed"
  }).select().single();
  if (error) throw error;
  return {
    promotion: row
  };
});
const listPromotions_createServerFn_handler = createServerRpc({
  id: "030df4639beacc16c4f915d56b0974a525ac5339e10b0dd5c66e787835e5245c",
  name: "listPromotions",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listPromotions.__executeServer(opts));
const listPromotions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "team", "all"]).default("all"),
  status: stringType().optional()
}).parse(d)).handler(listPromotions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("promotions").select("*, employees!promotions_employee_id_fkey(first_name,last_name,job_title,email)").order("created_at", {
    ascending: false
  });
  if (data.status) q = q.eq("status", data.status);
  if (data.scope === "mine") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      promotions: []
    };
    q = q.eq("employee_id", emp.id);
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    promotions: rows ?? []
  };
});
const decidePromotion_createServerFn_handler = createServerRpc({
  id: "eedd818ad7a8269a4b7c32cbfe68713905765b1dc9a7399bbed567ca023941a8",
  name: "decidePromotion",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => decidePromotion.__executeServer(opts));
const decidePromotion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected", "cancelled"]),
  notes: stringType().max(1e3).optional().nullable(),
  apply_now: booleanType().default(false)
}).parse(d)).handler(decidePromotion_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("promotions").update({
    status: data.decision,
    decided_by: userId,
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    decision_notes: data.notes
  }).eq("id", data.id).select().single();
  if (error) throw error;
  if (data.decision === "approved" && data.apply_now) {
    await supabase.from("employees").update({
      job_title: row.to_job_title,
      department_id: row.to_department_id ?? void 0,
      manager_id: row.to_manager_id ?? void 0
    }).eq("id", row.employee_id);
    await supabase.from("promotions").update({
      status: "applied"
    }).eq("id", data.id);
    if (row.to_designation_id) {
      const {
        data: des
      } = await supabase.from("designations").select("min_salary,max_salary,currency_code").eq("id", row.to_designation_id).maybeSingle();
      const tenant_id = await getTenant(supabase, userId);
      const {
        data: emp
      } = await supabase.from("employees").select("base_salary,currency_code").eq("id", row.employee_id).maybeSingle();
      const min = des?.min_salary ? Number(des.min_salary) : null;
      const max = des?.max_salary ? Number(des.max_salary) : null;
      const midpoint = min != null && max != null ? (min + max) / 2 : max ?? min;
      if (midpoint != null && midpoint > 0) {
        const currency = des?.currency_code ?? emp?.currency_code ?? "USD";
        const {
          data: prc
        } = await supabase.from("pay_rate_changes").insert({
          tenant_id,
          employee_id: row.employee_id,
          promotion_id: row.id,
          from_amount: emp?.base_salary ?? null,
          to_amount: midpoint,
          currency_code: currency,
          pay_frequency: "monthly",
          effective_date: row.effective_date,
          reason: "promotion",
          notes: "Auto-proposed from approved promotion (designation midpoint).",
          proposed_by: userId,
          status: "proposed"
        }).select().single();
        return {
          promotion: row,
          pay_rate_change: prc
        };
      }
    }
  }
  return {
    promotion: row
  };
});
const PayRateSchema = objectType({
  employee_id: stringType().uuid(),
  to_amount: numberType().nonnegative(),
  currency_code: stringType().min(3).max(3),
  pay_frequency: stringType().max(20).default("monthly"),
  effective_date: stringType(),
  reason: enumType(["hire", "promotion", "annual_review", "market_adjustment", "correction", "other"]).default("other"),
  notes: stringType().max(1e3).optional().nullable(),
  promotion_id: stringType().uuid().optional().nullable()
});
const proposePayRate_createServerFn_handler = createServerRpc({
  id: "37b8240ff9154a0c473a86b84f694031f5361a927422ce203c31a2aeb089037b",
  name: "proposePayRate",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => proposePayRate.__executeServer(opts));
const proposePayRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => PayRateSchema.parse(d)).handler(proposePayRate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getTenant(supabase, userId);
  const {
    data: emp
  } = await supabase.from("employees").select("base_salary").eq("id", data.employee_id).single();
  const {
    data: row,
    error
  } = await supabase.from("pay_rate_changes").insert({
    tenant_id,
    employee_id: data.employee_id,
    promotion_id: data.promotion_id,
    from_amount: emp?.base_salary ?? null,
    to_amount: data.to_amount,
    currency_code: data.currency_code,
    pay_frequency: data.pay_frequency,
    effective_date: data.effective_date,
    reason: data.reason,
    notes: data.notes,
    proposed_by: userId,
    status: "proposed"
  }).select().single();
  if (error) throw error;
  return {
    change: row
  };
});
const listPayRateChanges_createServerFn_handler = createServerRpc({
  id: "f6dd5083cf5b4bfd97543c8e96d000094ccd7b6488daf25b942a012964c333ce",
  name: "listPayRateChanges",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listPayRateChanges.__executeServer(opts));
const listPayRateChanges = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "all"]).default("all"),
  employee_id: stringType().uuid().optional(),
  status: stringType().optional()
}).parse(d)).handler(listPayRateChanges_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("pay_rate_changes").select("*, employees!pay_rate_changes_employee_id_fkey(first_name,last_name,job_title)").order("effective_date", {
    ascending: false
  });
  if (data.status) q = q.eq("status", data.status);
  if (data.employee_id) q = q.eq("employee_id", data.employee_id);
  if (data.scope === "mine") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      changes: []
    };
    q = q.eq("employee_id", emp.id);
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    changes: rows ?? []
  };
});
const decidePayRate_createServerFn_handler = createServerRpc({
  id: "2cf2950ccb7fb5dbed89bb186b50103c6138ca80e104466c55093d7179ca2bf1",
  name: "decidePayRate",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => decidePayRate.__executeServer(opts));
const decidePayRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected", "cancelled"]),
  notes: stringType().max(1e3).optional().nullable(),
  apply_now: booleanType().default(false)
}).parse(d)).handler(decidePayRate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("pay_rate_changes").update({
    status: data.decision,
    decided_by: userId,
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    decision_notes: data.notes
  }).eq("id", data.id).select().single();
  if (error) throw error;
  if (data.decision === "approved" && data.apply_now) {
    await supabase.from("employees").update({
      base_salary: row.to_amount,
      currency_code: row.currency_code
    }).eq("id", row.employee_id);
    await supabase.from("pay_rate_changes").update({
      status: "applied"
    }).eq("id", data.id);
  }
  return {
    change: row
  };
});
const listAppreciations_createServerFn_handler = createServerRpc({
  id: "0074b036524ba650fb345e382e72b03e175f39d56ddac0d95f5a29a230a3223d",
  name: "listAppreciations",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listAppreciations.__executeServer(opts));
const listAppreciations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["feed", "received", "sent"]).default("feed"),
  limit: numberType().int().min(1).max(100).default(50)
}).parse(d)).handler(listAppreciations_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let q = supabase.from("appreciations").select("*, from_emp:employees!appreciations_from_employee_id_fkey(first_name,last_name), to_emp:employees!appreciations_to_employee_id_fkey(first_name,last_name,job_title), appreciation_reactions(emoji,user_id)").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.scope !== "feed") {
    const emp = await getEmployee(supabase, userId);
    if (!emp) return {
      items: []
    };
    if (data.scope === "received") q = q.eq("to_employee_id", emp.id);
    else q = q.eq("from_employee_id", emp.id);
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    items: rows ?? []
  };
});
const createAppreciation_createServerFn_handler = createServerRpc({
  id: "ed39086562532ce601003e0fbf8507fd1c407d3aab50e1f3a806c3da563f5afd",
  name: "createAppreciation",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => createAppreciation.__executeServer(opts));
const createAppreciation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  to_employee_id: stringType().uuid(),
  message: stringType().min(2).max(1e3),
  emoji: stringType().max(8).optional().nullable(),
  value_tag: stringType().max(40).optional().nullable(),
  visibility: enumType(["public", "manager"]).default("public")
}).parse(d)).handler(createAppreciation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: row,
    error
  } = await supabase.from("appreciations").insert({
    tenant_id: emp.tenant_id,
    from_employee_id: emp.id,
    to_employee_id: data.to_employee_id,
    message: data.message,
    emoji: data.emoji ?? "👏",
    value_tag: data.value_tag,
    visibility: data.visibility
  }).select().single();
  if (error) throw error;
  return {
    appreciation: row
  };
});
const toggleAppreciationReaction_createServerFn_handler = createServerRpc({
  id: "6df4964c2b59d339639f05a04dc32ca5f010d0854e31db82761186e2d38c74b9",
  name: "toggleAppreciationReaction",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => toggleAppreciationReaction.__executeServer(opts));
const toggleAppreciationReaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  appreciation_id: stringType().uuid(),
  emoji: stringType().max(8).default("👏")
}).parse(d)).handler(toggleAppreciationReaction_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: existing
  } = await supabase.from("appreciation_reactions").select("id").eq("appreciation_id", data.appreciation_id).eq("user_id", userId).eq("emoji", data.emoji).maybeSingle();
  if (existing) {
    await supabase.from("appreciation_reactions").delete().eq("id", existing.id);
    return {
      reacted: false
    };
  }
  await supabase.from("appreciation_reactions").insert({
    appreciation_id: data.appreciation_id,
    user_id: userId,
    emoji: data.emoji
  });
  return {
    reacted: true
  };
});
const AwardTypeSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(1e3).optional().nullable(),
  icon: stringType().max(40).optional().nullable(),
  cadence: enumType(["monthly", "quarterly", "annual", "ad_hoc"]).default("monthly"),
  is_active: booleanType().default(true)
});
const listAwardTypes_createServerFn_handler = createServerRpc({
  id: "caac7defbea870ac1f99338a153484e0827a8eecfdc28bebcd879e974b10f0a5",
  name: "listAwardTypes",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listAwardTypes.__executeServer(opts));
const listAwardTypes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAwardTypes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("award_types").select("*").order("name");
  if (error) throw error;
  return {
    types: data ?? []
  };
});
const upsertAwardType_createServerFn_handler = createServerRpc({
  id: "464d54df7bf62cea89ffa9f79a1064f38d2e0f1daa203fccc22e0524dfc38995",
  name: "upsertAwardType",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => upsertAwardType.__executeServer(opts));
const upsertAwardType = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AwardTypeSchema.parse(d)).handler(upsertAwardType_createServerFn_handler, async ({
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
  const {
    data: row,
    error
  } = data.id ? await supabase.from("award_types").update(payload).eq("id", data.id).select().single() : await supabase.from("award_types").insert(payload).select().single();
  if (error) throw error;
  return {
    type: row
  };
});
const CycleSchema = objectType({
  id: stringType().uuid().optional(),
  award_type_id: stringType().uuid(),
  title: stringType().min(1).max(160),
  period_start: stringType(),
  period_end: stringType(),
  nominations_close_at: stringType().optional().nullable(),
  status: enumType(["open", "nominated", "shortlisted", "awarded", "closed", "cancelled"]).default("open")
});
const listAwardCycles_createServerFn_handler = createServerRpc({
  id: "cd4b3138d67c5cc43be53720a3721fccc3ead655c731ef3ecf03d9fe99834e27",
  name: "listAwardCycles",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listAwardCycles.__executeServer(opts));
const listAwardCycles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAwardCycles_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("award_cycles").select("*, award_types(name,icon)").order("period_start", {
    ascending: false
  });
  if (error) throw error;
  return {
    cycles: data ?? []
  };
});
const upsertAwardCycle_createServerFn_handler = createServerRpc({
  id: "d0373c44b753b4cff3cb930aa346716db019f2a190c27a33766a6c7a3777af64",
  name: "upsertAwardCycle",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => upsertAwardCycle.__executeServer(opts));
const upsertAwardCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CycleSchema.parse(d)).handler(upsertAwardCycle_createServerFn_handler, async ({
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
  const {
    data: row,
    error
  } = data.id ? await supabase.from("award_cycles").update(payload).eq("id", data.id).select().single() : await supabase.from("award_cycles").insert(payload).select().single();
  if (error) throw error;
  return {
    cycle: row
  };
});
const nominateForAward_createServerFn_handler = createServerRpc({
  id: "721227d4ba2d8aa84a6e26cb5a8feaa30f2dce151e3e715ded097f8bcbe4d7cd",
  name: "nominateForAward",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => nominateForAward.__executeServer(opts));
const nominateForAward = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycle_id: stringType().uuid(),
  nominee_employee_id: stringType().uuid(),
  justification: stringType().min(10).max(2e3)
}).parse(d)).handler(nominateForAward_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: row,
    error
  } = await supabase.from("award_nominations").insert({
    tenant_id: emp.tenant_id,
    cycle_id: data.cycle_id,
    nominee_employee_id: data.nominee_employee_id,
    nominator_user_id: userId,
    nominator_employee_id: emp.id,
    justification: data.justification,
    status: "submitted"
  }).select().single();
  if (error) throw error;
  return {
    nomination: row
  };
});
const listNominations_createServerFn_handler = createServerRpc({
  id: "e0b2dd59b4f63768a3075043c7e8ed20151ab1861f46d42aa5f926a48ba7fcca",
  name: "listNominations",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listNominations.__executeServer(opts));
const listNominations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycle_id: stringType().uuid().optional()
}).parse(d)).handler(listNominations_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("award_nominations").select("*, nominee:employees!award_nominations_nominee_employee_id_fkey(first_name,last_name,job_title), nominator:employees!award_nominations_nominator_employee_id_fkey(first_name,last_name), award_cycles(title,award_type_id,award_types(name))").order("created_at", {
    ascending: false
  });
  if (data.cycle_id) q = q.eq("cycle_id", data.cycle_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    nominations: rows ?? []
  };
});
const decideNomination_createServerFn_handler = createServerRpc({
  id: "9923291689cf5b870884e70f365addbc95aaca08921238701b29ae49dc911ff9",
  name: "decideNomination",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => decideNomination.__executeServer(opts));
const decideNomination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  decision: enumType(["shortlisted", "awarded", "rejected", "withdrawn"]),
  notes: stringType().max(1e3).optional().nullable(),
  citation: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(decideNomination_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("award_nominations").update({
    status: data.decision,
    decided_by: userId,
    decided_at: (/* @__PURE__ */ new Date()).toISOString(),
    decision_notes: data.notes
  }).eq("id", data.id).select("*, award_cycles(award_type_id)").single();
  if (error) throw error;
  if (data.decision === "awarded") {
    await supabase.from("awards_granted").insert({
      tenant_id: row.tenant_id,
      cycle_id: row.cycle_id,
      award_type_id: row.award_cycles.award_type_id,
      nomination_id: row.id,
      recipient_employee_id: row.nominee_employee_id,
      citation: data.citation ?? row.justification,
      granted_by: userId
    });
  }
  return {
    nomination: row
  };
});
const listAwardsGranted_createServerFn_handler = createServerRpc({
  id: "cb61fa41499009895ad01460420f0488d39e5984bf628cea4653055ddcf2b175",
  name: "listAwardsGranted",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => listAwardsGranted.__executeServer(opts));
const listAwardsGranted = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAwardsGranted_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("awards_granted").select("*, recipient:employees!awards_granted_recipient_employee_id_fkey(first_name,last_name,job_title), award_types(name,icon), award_cycles(title)").order("granted_on", {
    ascending: false
  }).limit(100);
  if (error) throw error;
  return {
    awards: data ?? []
  };
});
const getEmployeeTimeline_createServerFn_handler = createServerRpc({
  id: "10129f858432cd1f88218334882b6bb9eb3b1b8ddb7e65b65aa0c2458f6e045c",
  name: "getEmployeeTimeline",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => getEmployeeTimeline.__executeServer(opts));
const getEmployeeTimeline = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid()
}).parse(d)).handler(getEmployeeTimeline_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const employee_id = data.employee_id;
  const [empRes, promRes, payRes] = await Promise.all([supabase.from("employees").select("id,first_name,last_name,job_title,hire_date,base_salary,currency_code,department_id,departments(name)").eq("id", employee_id).maybeSingle(), supabase.from("promotions").select("*, from_dept:departments!promotions_from_department_id_fkey(name), to_dept:departments!promotions_to_department_id_fkey(name), to_designation:designations!promotions_to_designation_id_fkey(title,grade)").eq("employee_id", employee_id).order("effective_date", {
    ascending: false
  }), supabase.from("pay_rate_changes").select("*").eq("employee_id", employee_id).order("effective_date", {
    ascending: false
  })]);
  if (empRes.error) throw empRes.error;
  if (promRes.error) throw promRes.error;
  if (payRes.error) throw payRes.error;
  const employee = empRes.data;
  const promotions = promRes.data ?? [];
  const payRates = payRes.data ?? [];
  const actorIds = Array.from(new Set([...promotions.flatMap((p) => [p.proposed_by, p.decided_by]), ...payRates.flatMap((p) => [p.proposed_by, p.decided_by])].filter(Boolean)));
  let actors = {};
  if (actorIds.length) {
    const {
      data: profs
    } = await supabase.from("profiles").select("id,full_name,email").in("id", actorIds);
    actors = Object.fromEntries((profs ?? []).map((p) => [p.id, {
      full_name: p.full_name,
      email: p.email
    }]));
  }
  const nameOf = (id) => id ? actors[id]?.full_name ?? actors[id]?.email ?? null : null;
  const events = [];
  if (employee?.hire_date) {
    events.push({
      kind: "hire",
      date: employee.hire_date,
      title: "Hired",
      detail: `Joined as ${employee.job_title ?? "team member"}${employee.departments?.name ? ` · ${employee.departments.name}` : ""}`
    });
  }
  for (const p of promotions) {
    events.push({
      kind: "promotion",
      date: p.effective_date,
      title: `${p.from_job_title ?? "—"} → ${p.to_job_title}`,
      detail: [p.to_grade ? `Grade ${p.to_grade}` : null, p.to_dept?.name ? `Dept: ${p.to_dept.name}` : null, p.reason ? `Reason: ${p.reason}` : null].filter(Boolean).join(" · "),
      status: p.status,
      proposed_by: p.proposed_by ? {
        name: nameOf(p.proposed_by)
      } : null,
      decided_by: p.decided_by ? {
        name: nameOf(p.decided_by)
      } : null,
      decided_at: p.decided_at
    });
    if (p.to_designation?.title) {
      events.push({
        kind: "designation",
        date: p.effective_date,
        title: `Designation: ${p.to_designation.title}${p.to_designation.grade ? ` (Grade ${p.to_designation.grade})` : ""}`,
        detail: [p.from_job_title ? `Previously ${p.from_job_title}` : null, p.to_dept?.name ? `Dept: ${p.to_dept.name}` : null].filter(Boolean).join(" · "),
        status: p.status,
        proposed_by: p.proposed_by ? {
          name: nameOf(p.proposed_by)
        } : null,
        decided_by: p.decided_by ? {
          name: nameOf(p.decided_by)
        } : null,
        decided_at: p.decided_at
      });
    }
  }
  for (const r of payRates) {
    const cur = r.currency_code ?? "";
    events.push({
      kind: "pay_rate",
      date: r.effective_date,
      title: `Pay rate: ${r.from_amount ?? "—"} → ${r.to_amount} ${cur}`,
      detail: [`Frequency: ${r.pay_frequency}`, `Reason: ${r.reason}`, r.notes ? r.notes : null].filter(Boolean).join(" · "),
      status: r.status,
      proposed_by: r.proposed_by ? {
        name: nameOf(r.proposed_by)
      } : null,
      decided_by: r.decided_by ? {
        name: nameOf(r.decided_by)
      } : null,
      decided_at: r.decided_at
    });
  }
  events.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  return {
    employee,
    events
  };
});
const getEmployeePayHistory_createServerFn_handler = createServerRpc({
  id: "b8423a62444702e0a68281ff411a515581c85f7a922b62d11314b8163926441a",
  name: "getEmployeePayHistory",
  filename: "src/lib/hr-extras.functions.ts"
}, (opts) => getEmployeePayHistory.__executeServer(opts));
const getEmployeePayHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employee_id: stringType().uuid()
}).parse(d)).handler(getEmployeePayHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const [{
    data: emp
  }, {
    data: rates
  }, {
    data: promos
  }] = await Promise.all([supabase.from("employees").select("id,first_name,last_name,job_title,base_salary,currency_code,hire_date").eq("id", data.employee_id).maybeSingle(), supabase.from("pay_rate_changes").select("*").eq("employee_id", data.employee_id).order("effective_date", {
    ascending: false
  }), supabase.from("promotions").select("*").eq("employee_id", data.employee_id).order("effective_date", {
    ascending: false
  })]);
  return {
    employee: emp ?? null,
    pay_changes: rates ?? [],
    promotions: promos ?? []
  };
});
export {
  createAppreciation_createServerFn_handler,
  decideNomination_createServerFn_handler,
  decidePayRate_createServerFn_handler,
  decidePromotion_createServerFn_handler,
  deleteDesignation_createServerFn_handler,
  getEmployeePayHistory_createServerFn_handler,
  getEmployeeTimeline_createServerFn_handler,
  listAppreciations_createServerFn_handler,
  listAwardCycles_createServerFn_handler,
  listAwardTypes_createServerFn_handler,
  listAwardsGranted_createServerFn_handler,
  listDesignations_createServerFn_handler,
  listNominations_createServerFn_handler,
  listPayRateChanges_createServerFn_handler,
  listPromotions_createServerFn_handler,
  nominateForAward_createServerFn_handler,
  proposePayRate_createServerFn_handler,
  proposePromotion_createServerFn_handler,
  seedDesignationPreset_createServerFn_handler,
  toggleAppreciationReaction_createServerFn_handler,
  upsertAwardCycle_createServerFn_handler,
  upsertAwardType_createServerFn_handler,
  upsertDesignation_createServerFn_handler
};
