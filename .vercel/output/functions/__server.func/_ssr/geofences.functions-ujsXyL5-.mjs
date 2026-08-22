import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
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
const listGeofences_createServerFn_handler = createServerRpc({
  id: "1867c75f8a5cac528310405841a1881e4979037288ccbd593dcd571d8e776800",
  name: "listGeofences",
  filename: "src/lib/geofences.functions.ts"
}, (opts) => listGeofences.__executeServer(opts));
const listGeofences = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listGeofences_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("sign_geofences").select("*").order("name");
  if (error) throw error;
  return {
    geofences: data ?? []
  };
});
const FenceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  latitude: numberType().min(-90).max(90),
  longitude: numberType().min(-180).max(180),
  radius_meters: numberType().int().min(25).max(5e3),
  notes: stringType().max(500).optional().nullable(),
  is_active: booleanType().default(true),
  background_tracking_enabled: booleanType().optional().default(false),
  min_accuracy_meters: numberType().int().min(5).max(2e3).optional().default(100)
});
const upsertGeofence_createServerFn_handler = createServerRpc({
  id: "ec7c21b8d0b5ca4021d34e267f6e173c48a459d9bd657c080758d6a615d6b316",
  name: "upsertGeofence",
  filename: "src/lib/geofences.functions.ts"
}, (opts) => upsertGeofence.__executeServer(opts));
const upsertGeofence = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FenceSchema.parse(d)).handler(upsertGeofence_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const payload = {
    ...data,
    tenant_id: profile.tenant_id
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("sign_geofences").update(payload).eq("id", data.id).select().single() : await supabase.from("sign_geofences").insert(payload).select().single();
  if (error) throw error;
  return {
    geofence: row
  };
});
const deleteGeofence_createServerFn_handler = createServerRpc({
  id: "2290ea44c4aa438400b89bd54fb3c682252090cd8b9ef77337220d517ba8f69e",
  name: "deleteGeofence",
  filename: "src/lib/geofences.functions.ts"
}, (opts) => deleteGeofence.__executeServer(opts));
const deleteGeofence = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGeofence_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("sign_geofences").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteGeofence_createServerFn_handler,
  listGeofences_createServerFn_handler,
  upsertGeofence_createServerFn_handler
};
