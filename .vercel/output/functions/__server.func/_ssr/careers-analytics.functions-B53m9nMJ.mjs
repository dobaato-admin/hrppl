import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { B as enumType, a as objectType, E as recordType, z as stringType, F as anyType, C as numberType } from "../_libs/zod.mjs";
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
function getPublicClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
const EventType = enumType(["site_view", "job_view", "apply_start", "apply_submit"]);
const trackCareersEvent_createServerFn_handler = createServerRpc({
  id: "42d3e0a1777d41a78dcc6600255e69510ae86dc08fd86634c62cf6d6ce66d79c",
  name: "trackCareersEvent",
  filename: "src/lib/careers-analytics.functions.ts"
}, (opts) => trackCareersEvent.__executeServer(opts));
const trackCareersEvent = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120),
  job_id: stringType().uuid().optional(),
  event_type: EventType,
  session_id: stringType().max(80).optional(),
  referrer: stringType().max(500).optional(),
  user_agent: stringType().max(500).optional(),
  metadata: recordType(stringType(), anyType()).optional()
}).parse(d)).handler(trackCareersEvent_createServerFn_handler, async ({
  data
}) => {
  const sb = getPublicClient();
  const {
    data: site
  } = await sb.from("tenant_careers_settings").select("tenant_id, is_enabled").eq("public_slug", data.tenant_slug).maybeSingle();
  if (!site?.tenant_id || !site.is_enabled) return {
    ok: false
  };
  await sb.from("careers_analytics_events").insert({
    tenant_id: site.tenant_id,
    job_id: data.job_id ?? null,
    event_type: data.event_type,
    session_id: data.session_id ?? null,
    referrer: data.referrer ?? null,
    user_agent: data.user_agent ?? null,
    metadata: data.metadata ?? {}
  });
  return {
    ok: true
  };
});
const getCareersAnalytics_createServerFn_handler = createServerRpc({
  id: "4a60a5f8bb3db34352b3f00ea34128a5f19f42dc0e04ee585fd0b3482ed3a077",
  name: "getCareersAnalytics",
  filename: "src/lib/careers-analytics.functions.ts"
}, (opts) => getCareersAnalytics.__executeServer(opts));
const getCareersAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  days: numberType().int().min(1).max(365).default(30)
}).partial().parse(d ?? {})).handler(getCareersAnalytics_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp?.tenant_id) return {
    totals: null,
    perJob: [],
    series: []
  };
  const days = data?.days ?? 30;
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const {
    data: rows,
    error
  } = await supabase.from("careers_analytics_events").select("event_type, job_id, created_at").eq("tenant_id", emp.tenant_id).gte("created_at", since).limit(1e4);
  if (error) throw new Error(error.message);
  const totals = {
    site_view: 0,
    job_view: 0,
    apply_start: 0,
    apply_submit: 0
  };
  const perJob = {};
  const byDay = {};
  for (const r of rows ?? []) {
    const t = r.event_type;
    if (t in totals) totals[t] += 1;
    if (r.job_id && (t === "job_view" || t === "apply_start" || t === "apply_submit")) {
      perJob[r.job_id] ??= {
        job_view: 0,
        apply_start: 0,
        apply_submit: 0
      };
      perJob[r.job_id][t] += 1;
    }
    const day = String(r.created_at).slice(0, 10);
    byDay[day] ??= {
      job_view: 0,
      apply_start: 0,
      apply_submit: 0
    };
    if (t === "job_view" || t === "apply_start" || t === "apply_submit") {
      byDay[day][t] += 1;
    }
  }
  const jobIds = Object.keys(perJob);
  let jobsMap = {};
  if (jobIds.length) {
    const {
      data: jobs
    } = await supabase.from("recruitment_jobs").select("id, title, public_slug").in("id", jobIds);
    for (const j of jobs ?? []) jobsMap[j.id] = j;
  }
  const perJobArr = jobIds.map((id) => {
    const c = perJob[id];
    const conversion = c.job_view ? Math.round(c.apply_submit / c.job_view * 1e3) / 10 : 0;
    const startRate = c.job_view ? Math.round(c.apply_start / c.job_view * 1e3) / 10 : 0;
    return {
      job_id: id,
      title: jobsMap[id]?.title ?? "(deleted job)",
      public_slug: jobsMap[id]?.public_slug ?? null,
      ...c,
      start_rate_pct: startRate,
      conversion_pct: conversion
    };
  }).sort((a, b) => b.job_view - a.job_view);
  const series = Object.entries(byDay).sort(([a], [b]) => a < b ? -1 : 1).map(([day, v]) => ({
    day,
    ...v
  }));
  const overallConv = totals.job_view ? Math.round(totals.apply_submit / totals.job_view * 1e3) / 10 : 0;
  return {
    totals: {
      ...totals,
      conversion_pct: overallConv
    },
    perJob: perJobArr,
    series,
    days
  };
});
export {
  getCareersAnalytics_createServerFn_handler,
  trackCareersEvent_createServerFn_handler
};
