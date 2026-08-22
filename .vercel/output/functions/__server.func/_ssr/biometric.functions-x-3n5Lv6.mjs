import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, E as recordType, z as stringType, F as anyType, A as booleanType, B as enumType, C as numberType, D as arrayType } from "../_libs/zod.mjs";
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
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function assertOrgAdmin(supabase, userId) {
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["org_admin", "super_admin"]);
  if (!roles?.length) throw new Error("Forbidden");
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  if (!profile?.tenant_id) throw new Error("Forbidden");
  return profile.tenant_id;
}
const listBiometricDevices_createServerFn_handler = createServerRpc({
  id: "302f6e704602a0bc960bc3646298576a03e45bb96d2db403c236e75dda851298",
  name: "listBiometricDevices",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => listBiometricDevices.__executeServer(opts));
const listBiometricDevices = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listBiometricDevices_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("biometric_devices").select("*").order("name");
  if (error) throw error;
  return {
    devices: data ?? []
  };
});
const DeviceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  vendor: enumType(["zkteco", "generic", "suprema"]).default("zkteco"),
  device_serial: stringType().max(120).optional().nullable(),
  location: stringType().max(200).optional().nullable(),
  ip_address: stringType().max(80).optional().nullable(),
  is_active: booleanType().default(true),
  config: recordType(stringType(), anyType()).default({})
});
const upsertBiometricDevice_createServerFn_handler = createServerRpc({
  id: "e5b6f2526e7e83bc93fcd40da7735f0f0e4abc96dc6686bf9e80a4c585bacdbd",
  name: "upsertBiometricDevice",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => upsertBiometricDevice.__executeServer(opts));
const upsertBiometricDevice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DeviceSchema.parse(d)).handler(upsertBiometricDevice_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const payload = {
    ...data,
    tenant_id: tenantId
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("biometric_devices").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : await supabase.from("biometric_devices").insert(payload).select().single();
  if (error) throw error;
  return {
    device: row
  };
});
const rotateDeviceSecret_createServerFn_handler = createServerRpc({
  id: "72ac49f34ae0f396d86dcf00339e07d894bf0f94adf40f0a40e4769700c41094",
  name: "rotateDeviceSecret",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => rotateDeviceSecret.__executeServer(opts));
const rotateDeviceSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(rotateDeviceSecret_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: existing
  } = await admin.from("biometric_devices").select("id, tenant_id").eq("id", data.id).maybeSingle();
  if (!existing || existing.tenant_id !== tenantId) throw new Error("Forbidden");
  const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const {
    data: row,
    error
  } = await admin.from("biometric_devices").update({
    shared_secret: newSecret,
    webhook_token: newToken
  }).eq("id", data.id).eq("tenant_id", tenantId).select("id,name,vendor,is_active,last_sync_at,last_punch_at").single();
  if (error) throw error;
  return {
    device: row,
    shared_secret: newSecret,
    webhook_token: newToken
  };
});
const listMappings_createServerFn_handler = createServerRpc({
  id: "5ee7a1a6fdd6b4770e1f0bb12069f066a47f7c7d5e41c670c1d92634b06dabca",
  name: "listMappings",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => listMappings.__executeServer(opts));
const listMappings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid()
}).parse(d)).handler(listMappings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows
  } = await supabase.from("biometric_user_mappings").select("*, employees(first_name,last_name,email)").eq("device_id", data.device_id).order("raw_user_id");
  return {
    mappings: rows ?? []
  };
});
const upsertMapping_createServerFn_handler = createServerRpc({
  id: "98c6928dbdaf6f141a711aabb4b5f72168c66ff693d5f2d8b91caad47bb3d3a4",
  name: "upsertMapping",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => upsertMapping.__executeServer(opts));
const upsertMapping = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid(),
  raw_user_id: stringType().min(1).max(80),
  employee_id: stringType().uuid()
}).parse(d)).handler(upsertMapping_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await assertOrgAdmin(supabase, userId);
  const {
    error
  } = await supabase.from("biometric_user_mappings").upsert({
    ...data,
    tenant_id: tenantId
  }, {
    onConflict: "device_id,raw_user_id"
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const listPunches_createServerFn_handler = createServerRpc({
  id: "0c745e035e7c721c3e6e86e9dc94e8957f8abcaa2e88cde995c3ab455ca9a342",
  name: "listPunches",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => listPunches.__executeServer(opts));
const listPunches = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid().optional(),
  employee_id: stringType().uuid().optional(),
  limit: numberType().int().positive().max(500).default(100)
}).parse(d)).handler(listPunches_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("biometric_punches").select("*, biometric_devices(name), employees(first_name,last_name)").order("punch_at", {
    ascending: false
  }).limit(data.limit);
  if (data.device_id) q = q.eq("device_id", data.device_id);
  if (data.employee_id) q = q.eq("employee_id", data.employee_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    punches: rows ?? []
  };
});
const PunchInputSchema = objectType({
  raw_user_id: stringType().min(1).max(80),
  punch_at: stringType(),
  punch_type: enumType(["in", "out", "break_in", "break_out", "unknown"]).default("unknown"),
  raw: recordType(stringType(), anyType()).default({})
});
async function ingestPunches(deviceId, source, punches) {
  const admin = await loadAdmin();
  const {
    data: device
  } = await admin.from("biometric_devices").select("*").eq("id", deviceId).single();
  if (!device || !device.is_active) throw new Error("Device not active");
  const {
    data: mappings
  } = await admin.from("biometric_user_mappings").select("raw_user_id,employee_id").eq("device_id", deviceId);
  const map = new Map((mappings ?? []).map((m) => [m.raw_user_id, m.employee_id]));
  const rows = punches.map((p) => ({
    tenant_id: device.tenant_id,
    device_id: device.id,
    raw_user_id: p.raw_user_id,
    employee_id: map.get(p.raw_user_id) ?? null,
    punch_at: p.punch_at,
    punch_type: p.punch_type,
    source,
    raw: p.raw
  }));
  let inserted = 0;
  if (rows.length) {
    const {
      error,
      count
    } = await admin.from("biometric_punches").upsert(rows, {
      onConflict: "device_id,raw_user_id,punch_at,punch_type",
      ignoreDuplicates: true,
      count: "exact"
    });
    if (error) throw error;
    inserted = count ?? 0;
  }
  const latest = punches.reduce((a, p) => p.punch_at > a ? p.punch_at : a, "");
  await admin.from("biometric_devices").update({
    last_sync_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_punch_at: latest || null
  }).eq("id", device.id);
  return {
    received: punches.length,
    inserted
  };
}
const importPunchesManually_createServerFn_handler = createServerRpc({
  id: "8b08788657203cdc725d6efdc5bdb38374ed607e4289cb59249b44eaf9504caa",
  name: "importPunchesManually",
  filename: "src/lib/biometric.functions.ts"
}, (opts) => importPunchesManually.__executeServer(opts));
const importPunchesManually = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  device_id: stringType().uuid(),
  punches: arrayType(PunchInputSchema).min(1).max(2e3)
}).parse(d)).handler(importPunchesManually_createServerFn_handler, async ({
  data
}) => ingestPunches(data.device_id, "manual", data.punches));
export {
  importPunchesManually_createServerFn_handler,
  listBiometricDevices_createServerFn_handler,
  listMappings_createServerFn_handler,
  listPunches_createServerFn_handler,
  rotateDeviceSecret_createServerFn_handler,
  upsertBiometricDevice_createServerFn_handler,
  upsertMapping_createServerFn_handler
};
