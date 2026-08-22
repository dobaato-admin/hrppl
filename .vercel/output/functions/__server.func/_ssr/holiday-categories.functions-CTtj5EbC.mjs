import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
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
async function assertOrgAdmin(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  return {
    tenantId: prof.tenant_id
  };
}
const listHolidayCategories_createServerFn_handler = createServerRpc({
  id: "6bcc10afef8865f2a80c3359bee108eb93aedac9514c3f4160e132caa87c9e35",
  name: "listHolidayCategories",
  filename: "src/lib/holiday-categories.functions.ts"
}, (opts) => listHolidayCategories.__executeServer(opts));
const listHolidayCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listHolidayCategories_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data: cats,
    error
  } = await supabase.from("public_holiday_categories").select("id, country_code, name, is_default, notes, created_at").eq("tenant_id", tenantId).order("country_code").order("name");
  if (error) throw new Error(error.message);
  const ids = (cats ?? []).map((c) => c.id);
  let dates = [];
  if (ids.length) {
    const {
      data
    } = await supabase.from("holiday_category_dates").select("id, category_id, holiday_date, name, is_paid, pay_multiplier, notes").in("category_id", ids).order("holiday_date");
    dates = data ?? [];
  }
  return {
    categories: cats ?? [],
    dates
  };
});
const UpsertCategory = objectType({
  id: stringType().uuid().optional(),
  country_code: stringType().trim().min(2).max(3),
  name: stringType().trim().min(1).max(120),
  is_default: booleanType().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertHolidayCategory_createServerFn_handler = createServerRpc({
  id: "97cd0df4fbc8c8688ace62b307bfa10343759a152b338fbdbdb6b6ca15e630d6",
  name: "upsertHolidayCategory",
  filename: "src/lib/holiday-categories.functions.ts"
}, (opts) => upsertHolidayCategory.__executeServer(opts));
const upsertHolidayCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertCategory.parse(d)).handler(upsertHolidayCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const payload = {
    tenant_id: tenantId,
    country_code: data.country_code.toUpperCase(),
    name: data.name,
    is_default: data.is_default ?? false,
    notes: data.notes ?? null
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("public_holiday_categories").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : await supabase.from("public_holiday_categories").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return {
    category: row
  };
});
const deleteHolidayCategory_createServerFn_handler = createServerRpc({
  id: "90cb15cd2d216308a375ab77d2680e1c622e1405181a5466663adee84080f315",
  name: "deleteHolidayCategory",
  filename: "src/lib/holiday-categories.functions.ts"
}, (opts) => deleteHolidayCategory.__executeServer(opts));
const deleteHolidayCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteHolidayCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("public_holiday_categories").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const UpsertDate = objectType({
  id: stringType().uuid().optional(),
  category_id: stringType().uuid(),
  holiday_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: stringType().trim().min(1).max(160),
  is_paid: booleanType().optional(),
  pay_multiplier: numberType().min(1).max(10).nullable().optional(),
  notes: stringType().trim().max(500).nullable().optional()
});
const upsertHolidayCategoryDate_createServerFn_handler = createServerRpc({
  id: "0b3cee7a0ab2556f977a5b755e78f73e0f6ed1d11bd2fce6b6f132959b097226",
  name: "upsertHolidayCategoryDate",
  filename: "src/lib/holiday-categories.functions.ts"
}, (opts) => upsertHolidayCategoryDate.__executeServer(opts));
const upsertHolidayCategoryDate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertDate.parse(d)).handler(upsertHolidayCategoryDate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data: cat
  } = await supabase.from("public_holiday_categories").select("id").eq("id", data.category_id).eq("tenant_id", tenantId).maybeSingle();
  if (!cat) throw new Error("Category not found");
  const payload = {
    category_id: data.category_id,
    holiday_date: data.holiday_date,
    name: data.name,
    is_paid: data.is_paid ?? true,
    pay_multiplier: data.pay_multiplier ?? null,
    notes: data.notes ?? null
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("holiday_category_dates").update(payload).eq("id", data.id).select().single() : await supabase.from("holiday_category_dates").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return {
    date: row
  };
});
const deleteHolidayCategoryDate_createServerFn_handler = createServerRpc({
  id: "444e5e0c028ecb570f37bf3ceddb90b5b9ee3116d6e758522f442f7bdbd3cf74",
  name: "deleteHolidayCategoryDate",
  filename: "src/lib/holiday-categories.functions.ts"
}, (opts) => deleteHolidayCategoryDate.__executeServer(opts));
const deleteHolidayCategoryDate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteHolidayCategoryDate_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("holiday_category_dates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteHolidayCategoryDate_createServerFn_handler,
  deleteHolidayCategory_createServerFn_handler,
  listHolidayCategories_createServerFn_handler,
  upsertHolidayCategoryDate_createServerFn_handler,
  upsertHolidayCategory_createServerFn_handler
};
