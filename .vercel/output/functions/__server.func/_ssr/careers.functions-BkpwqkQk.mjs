import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { s as src_default } from "../_libs/isomorphic-dompurify.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/jsdom.mjs";
import "path";
import "url";
import "fs";
import "vm";
import "node:vm";
import "node:fs";
import "zlib";
import "../_libs/tough-cookie.mjs";
import "../_libs/tldts.mjs";
import "../_libs/tldts-core.mjs";
import "../_libs/html-encoding-sniffer.mjs";
import "../_libs/exodus__bytes.mjs";
import "node:buffer";
import "../_libs/whatwg-url.mjs";
import "../_libs/webidl-conversions.mjs";
import "../_libs/tr46.mjs";
import "../_libs/punycode.mjs";
import "../_libs/whatwg-mimetype.mjs";
import "../_libs/undici.mjs";
import "node:assert";
import "node:net";
import "node:querystring";
import "node:events";
import "node:diagnostics_channel";
import "node:util";
import "node:tls";
import "node:zlib";
import "node:perf_hooks";
import "node:util/types";
import "node:sqlite";
import "node:worker_threads";
import "node:url";
import "node:console";
import "node:fs/promises";
import "node:path";
import "node:timers";
import "node:dns";
import "node:http";
import "node:stream";
import "node:crypto";
import "node:async_hooks";
import "events";
import "util";
import "../_libs/symbol-tree.mjs";
import "../_libs/is-potential-custom-element-name+[...].mjs";
import "../_libs/xml-name-validator.mjs";
import "../_libs/saxes.mjs";
import "../_libs/xmlchars.mjs";
import "../_libs/parse5.mjs";
import "../_libs/entities.mjs";
import "../_libs/w3c-xmlserializer.mjs";
import "../_libs/asamuzakjp__css-color.mjs";
import "../_libs/asamuzakjp__generational-cache.mjs";
import "../_libs/csstools__css-tokenizer.mjs";
import "../_libs/csstools__css-calc.mjs";
import "../_libs/@csstools/css-parser-algorithms+[...].mjs";
import "../_libs/csstools__css-color-parser.mjs";
import "../_libs/csstools__color-helpers.mjs";
import "../_libs/@csstools/css-syntax-patches-for-csstree+[...].mjs";
import "../_libs/css-tree.mjs";
import "../_libs/source-map-js.mjs";
import "../_libs/mdn-data.mjs";
import "module";
import "../_libs/lru-cache.mjs";
import "../_libs/bramus__specificity.mjs";
import "../_libs/asamuzakjp__dom-selector.mjs";
import "../_libs/asamuzakjp__nwsapi.mjs";
import "../_libs/bidi-js.mjs";
import "stream";
import "../_libs/data-urls.mjs";
import "../_libs/decimal.js.mjs";
import "os";
import "crypto";
import "./createMiddleware-BvN2ghIY.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/isbot.mjs";
const ABOUT_SANITIZE = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "p", "strong", "em", "ul", "ol", "li", "a", "br", "blockquote"],
  ALLOWED_ATTR: ["href", "target", "rel"]
};
function getPublicClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
const getCareersByTenantSlug_createServerFn_handler = createServerRpc({
  id: "0d2e6486bb79d16006411b50330fa12aa33a0f2c05073e892dae795341f2d24a",
  name: "getCareersByTenantSlug",
  filename: "src/lib/careers.functions.ts"
}, (opts) => getCareersByTenantSlug.__executeServer(opts));
const getCareersByTenantSlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120)
}).parse(d)).handler(getCareersByTenantSlug_createServerFn_handler, async ({
  data
}) => {
  const sb = getPublicClient();
  const {
    data: site,
    error: siteErr
  } = await sb.from("tenant_careers_settings").select("tenant_id, public_slug, headline, about_html, brand_color, hero_image_url, is_enabled").eq("public_slug", data.tenant_slug).eq("is_enabled", true).maybeSingle();
  if (siteErr) throw new Error(siteErr.message);
  if (!site) return {
    site: null,
    jobs: []
  };
  const {
    data: jobs,
    error: jobsErr
  } = await sb.from("recruitment_jobs").select("id, title, public_slug, public_summary, employment_type, location, department_id, published_at").eq("tenant_id", site.tenant_id).eq("is_published", true).order("published_at", {
    ascending: false
  });
  if (jobsErr) throw new Error(jobsErr.message);
  return {
    site,
    jobs: jobs ?? []
  };
});
const getJobBySlug_createServerFn_handler = createServerRpc({
  id: "dc53f2f3eecc862902d2ef16ba7bb8998c9600c067da1ee890ae0825b8543e58",
  name: "getJobBySlug",
  filename: "src/lib/careers.functions.ts"
}, (opts) => getJobBySlug.__executeServer(opts));
const getJobBySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  tenant_slug: stringType().trim().min(1).max(120),
  job_slug: stringType().trim().min(1).max(200)
}).parse(d)).handler(getJobBySlug_createServerFn_handler, async ({
  data
}) => {
  const sb = getPublicClient();
  const {
    data: site
  } = await sb.from("tenant_careers_settings").select("tenant_id, public_slug, headline, brand_color").eq("public_slug", data.tenant_slug).eq("is_enabled", true).maybeSingle();
  if (!site) return {
    site: null,
    job: null
  };
  const {
    data: job
  } = await sb.from("recruitment_jobs").select("id, title, public_slug, public_summary, description_html, requirements_html, employment_type, location, department_id, salary_min, salary_max, currency, published_at").eq("tenant_id", site.tenant_id).eq("public_slug", data.job_slug).eq("is_published", true).maybeSingle();
  return {
    site,
    job: job ?? null
  };
});
const getCareersSettings_createServerFn_handler = createServerRpc({
  id: "ca629a86389fff83ec9be09f23e23516a4e9b6c1a7267d8bd44548bdecd9200f",
  name: "getCareersSettings",
  filename: "src/lib/careers.functions.ts"
}, (opts) => getCareersSettings.__executeServer(opts));
const getCareersSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getCareersSettings_createServerFn_handler, async ({
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
    settings: null,
    jobs: []
  };
  const {
    data: settings
  } = await supabase.from("tenant_careers_settings").select("*").eq("tenant_id", emp.tenant_id).maybeSingle();
  const {
    data: jobs
  } = await supabase.from("recruitment_jobs").select("id, title, public_slug, is_published, published_at, public_summary").eq("tenant_id", emp.tenant_id).order("created_at", {
    ascending: false
  }).limit(200);
  return {
    settings,
    jobs: jobs ?? [],
    tenant_id: emp.tenant_id
  };
});
const updateCareersSettings_createServerFn_handler = createServerRpc({
  id: "e749404053deaff22d38d90a24e7676b66711eac6d84e7001fde765012587b9c",
  name: "updateCareersSettings",
  filename: "src/lib/careers.functions.ts"
}, (opts) => updateCareersSettings.__executeServer(opts));
const updateCareersSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  public_slug: stringType().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  headline: stringType().trim().max(200).nullable().optional(),
  about_html: stringType().trim().max(1e4).nullable().optional(),
  brand_color: stringType().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F172A"),
  hero_image_url: stringType().url().nullable().optional(),
  is_enabled: booleanType().default(false)
}).parse(d)).handler(updateCareersSettings_createServerFn_handler, async ({
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
  if (!emp?.tenant_id) throw new Error("Tenant not found");
  const {
    error
  } = await supabase.from("tenant_careers_settings").upsert({
    tenant_id: emp.tenant_id,
    public_slug: data.public_slug,
    headline: data.headline ?? null,
    about_html: data.about_html ? src_default.sanitize(data.about_html, ABOUT_SANITIZE) : null,
    brand_color: data.brand_color,
    hero_image_url: data.hero_image_url ?? null,
    is_enabled: data.is_enabled
  }, {
    onConflict: "tenant_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateJobPublication_createServerFn_handler = createServerRpc({
  id: "63d91e4b39380a95e603911e12138847e2f093467e085a0da7b00321a2568afc",
  name: "updateJobPublication",
  filename: "src/lib/careers.functions.ts"
}, (opts) => updateJobPublication.__executeServer(opts));
const updateJobPublication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  is_published: booleanType(),
  public_slug: stringType().trim().min(2).max(120).regex(/^[a-z0-9-]+$/).nullable().optional(),
  public_summary: stringType().trim().max(2e3).nullable().optional()
}).parse(d)).handler(updateJobPublication_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const payload = {
    is_published: data.is_published,
    published_at: data.is_published ? (/* @__PURE__ */ new Date()).toISOString() : null
  };
  if (data.public_slug !== void 0) payload.public_slug = data.public_slug;
  if (data.public_summary !== void 0) payload.public_summary = data.public_summary;
  const {
    error
  } = await supabase.from("recruitment_jobs").update(payload).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getCareersByTenantSlug_createServerFn_handler,
  getCareersSettings_createServerFn_handler,
  getJobBySlug_createServerFn_handler,
  updateCareersSettings_createServerFn_handler,
  updateJobPublication_createServerFn_handler
};
