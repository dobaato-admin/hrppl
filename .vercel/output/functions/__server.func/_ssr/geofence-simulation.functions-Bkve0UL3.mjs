import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, D as arrayType, z as stringType } from "../_libs/zod.mjs";
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
const PointSchema = objectType({
  lat: numberType(),
  lng: numberType(),
  accuracy_m: numberType().min(0).max(1e5).optional(),
  t_offset_ms: numberType().int().min(0).optional()
});
const TraceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(500).optional().nullable(),
  points: arrayType(PointSchema).max(5e3)
});
const listSimTraces_createServerFn_handler = createServerRpc({
  id: "a5520bdb39cb3d25a73160531b129d00475915aedc5ad0ba74f809b1a1268c5d",
  name: "listSimTraces",
  filename: "src/lib/geofence-simulation.functions.ts"
}, (opts) => listSimTraces.__executeServer(opts));
const listSimTraces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSimTraces_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("geofence_sim_traces").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    traces: data ?? []
  };
});
const saveSimTrace_createServerFn_handler = createServerRpc({
  id: "9ed7a6d7801653cac0cc7d239febe674c7f1cb1c0828a127d2ccf9b956a4c0ed",
  name: "saveSimTrace",
  filename: "src/lib/geofence-simulation.functions.ts"
}, (opts) => saveSimTrace.__executeServer(opts));
const saveSimTrace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => TraceSchema.parse(d)).handler(saveSimTrace_createServerFn_handler, async ({
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
    tenant_id: profile.tenant_id,
    name: data.name,
    description: data.description ?? null,
    points: data.points,
    created_by: userId
  };
  const {
    data: row,
    error
  } = data.id ? await supabase.from("geofence_sim_traces").update(payload).eq("id", data.id).select().single() : await supabase.from("geofence_sim_traces").insert(payload).select().single();
  if (error) throw error;
  return {
    trace: row
  };
});
const deleteSimTrace_createServerFn_handler = createServerRpc({
  id: "7cb1346511c3ee2aef56f2be3066d47b7d226c831a9c0e8eebf68f1a081567ac",
  name: "deleteSimTrace",
  filename: "src/lib/geofence-simulation.functions.ts"
}, (opts) => deleteSimTrace.__executeServer(opts));
const deleteSimTrace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSimTrace_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("geofence_sim_traces").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteSimTrace_createServerFn_handler,
  listSimTraces_createServerFn_handler,
  saveSimTrace_createServerFn_handler
};
