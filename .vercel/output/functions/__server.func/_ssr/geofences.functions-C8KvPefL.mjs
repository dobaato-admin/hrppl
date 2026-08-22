import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
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
const listGeofences = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("1867c75f8a5cac528310405841a1881e4979037288ccbd593dcd571d8e776800"));
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
const upsertGeofence = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FenceSchema.parse(d)).handler(createSsrRpc("ec7c21b8d0b5ca4021d34e267f6e173c48a459d9bd657c080758d6a615d6b316"));
const deleteGeofence = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2290ea44c4aa438400b89bd54fb3c682252090cd8b9ef77337220d517ba8f69e"));
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
export {
  deleteGeofence,
  distanceMeters,
  listGeofences,
  upsertGeofence
};
