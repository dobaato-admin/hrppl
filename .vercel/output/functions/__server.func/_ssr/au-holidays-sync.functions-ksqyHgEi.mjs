import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType } from "../_libs/zod.mjs";
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
const AU_CSV_CANDIDATES = (year) => [`https://data.gov.au/data/dataset/b1bc6077-dadd-4f61-9f8c-002ab2cdff10/resource/australianpublicholidays-${year}.csv`, `https://data.gov.au/data/dataset/australian-holidays-machine-readable-dataset/resource/australianpublicholidays-${year}.csv`];
const VALID_STATES = /* @__PURE__ */ new Set(["NAT", "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);
function parseCsv(text) {
  const rows = [];
  let cur = [];
  let val = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        val += '"';
        i++;
      } else if (c === '"') {
        q = false;
      } else {
        val += c;
      }
    } else if (c === '"') {
      q = true;
    } else if (c === ",") {
      cur.push(val);
      val = "";
    } else if (c === "\n" || c === "\r") {
      if (val !== "" || cur.length) {
        cur.push(val);
        rows.push(cur);
        cur = [];
        val = "";
      }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else {
      val += c;
    }
  }
  if (val !== "" || cur.length) {
    cur.push(val);
    rows.push(cur);
  }
  return rows;
}
async function getTenantId(supabase, userId) {
  const {
    data
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  return data?.tenant_id ?? null;
}
const syncAuHolidays_createServerFn_handler = createServerRpc({
  id: "6fa7f9598c2bbf059aa8d16a0f3372034460c651b828ac38c3600e80903a77d6",
  name: "syncAuHolidays",
  filename: "src/lib/au-holidays-sync.functions.ts"
}, (opts) => syncAuHolidays.__executeServer(opts));
const syncAuHolidays = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  year: numberType().int().min(2020).max(2035)
}).parse(d)).handler(syncAuHolidays_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin", "regional_admin"].includes(x))) {
    throw new Error("Admin only");
  }
  const tenantId = await getTenantId(supabase, userId);
  const startedAt = (/* @__PURE__ */ new Date()).toISOString();
  const parseErrors = [];
  async function logResult(args) {
    try {
      await supabase.from("au_holiday_sync_log").insert({
        tenant_id: tenantId,
        year: data.year,
        status: args.status,
        source_url: args.sourceUrl || null,
        inserted_count: args.inserted,
        skipped_count: args.skipped,
        total_count: args.total,
        error_message: args.errorMessage ?? null,
        csv_parse_errors: parseErrors,
        started_at: startedAt,
        completed_at: (/* @__PURE__ */ new Date()).toISOString(),
        synced_by: userId
      });
    } catch {
    }
  }
  let csv = null;
  let usedUrl = "";
  let fetchErr = "";
  for (const url of AU_CSV_CANDIDATES(data.year)) {
    try {
      const res = await fetch(url, {
        headers: {
          "Accept": "text/csv"
        }
      });
      if (res.ok) {
        csv = await res.text();
        usedUrl = url;
        break;
      }
      fetchErr = `HTTP ${res.status} from ${url}`;
    } catch (e) {
      fetchErr = `${e?.message ?? e} from ${url}`;
    }
  }
  if (!csv) {
    const msg = `Could not download AU public holidays CSV for ${data.year} from data.gov.au. ${fetchErr}`.trim();
    await logResult({
      status: "failed",
      sourceUrl: "",
      inserted: 0,
      skipped: 0,
      total: 0,
      errorMessage: msg
    });
    throw new Error(msg);
  }
  const rows = parseCsv(csv);
  if (rows.length < 2) {
    const msg = "Empty CSV from data.gov.au";
    await logResult({
      status: "failed",
      sourceUrl: usedUrl,
      inserted: 0,
      skipped: 0,
      total: 0,
      errorMessage: msg
    });
    throw new Error(msg);
  }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const nameIdx = header.findIndex((h) => h.includes("holiday name") || h === "name");
  const jurIdx = header.findIndex((h) => h.includes("jurisdiction") || h.includes("applicable"));
  if (dateIdx < 0 || nameIdx < 0 || jurIdx < 0) {
    const msg = `Unexpected CSV columns from data.gov.au: ${header.join(", ")}`;
    await logResult({
      status: "failed",
      sourceUrl: usedUrl,
      inserted: 0,
      skipped: 0,
      total: 0,
      errorMessage: msg
    });
    throw new Error(msg);
  }
  let inserted = 0;
  let skipped = 0;
  const byKey = /* @__PURE__ */ new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) {
      parseErrors.push({
        row: i,
        reason: "too few columns"
      });
      continue;
    }
    const raw = (row[dateIdx] || "").trim();
    let iso = "";
    if (/^\d{8}$/.test(raw)) iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) iso = raw;
    else {
      parseErrors.push({
        row: i,
        reason: "invalid date",
        raw
      });
      continue;
    }
    if (!iso.startsWith(`${data.year}-`)) {
      parseErrors.push({
        row: i,
        reason: `date not in ${data.year}`,
        raw: iso
      });
      continue;
    }
    const name = (row[nameIdx] || "").trim();
    if (!name) {
      parseErrors.push({
        row: i,
        reason: "missing name",
        raw: iso
      });
      continue;
    }
    const jur = (row[jurIdx] || "").toUpperCase().split(/[|,/ ]+/).filter(Boolean);
    const regions = jur.filter((x) => VALID_STATES.has(x));
    if (jur.length && !regions.length) {
      parseErrors.push({
        row: i,
        reason: `unknown jurisdiction: ${jur.join(",")}`,
        raw: iso
      });
    }
    const list = regions.length === 0 || regions.includes("NAT") ? [null] : regions.filter((x) => x !== "NAT");
    for (const region of list) {
      const key = `${iso}|${region ?? ""}|${name}`;
      if (byKey.has(key)) continue;
      byKey.set(key, {
        country_code: "AU",
        holiday_date: iso,
        name,
        region,
        is_paid: true,
        is_recurring: false
      });
    }
  }
  try {
    for (const v of byKey.values()) {
      const {
        error
      } = await supabase.from("public_holidays").insert(v);
      if (error) {
        if (error.code === "23505") {
          skipped++;
          continue;
        }
        throw new Error(error.message);
      }
      inserted++;
    }
  } catch (e) {
    await logResult({
      status: "failed",
      sourceUrl: usedUrl,
      inserted,
      skipped,
      total: byKey.size,
      errorMessage: e?.message ?? String(e)
    });
    throw e;
  }
  const status = parseErrors.length > 0 ? "partial" : "success";
  await logResult({
    status,
    sourceUrl: usedUrl,
    inserted,
    skipped,
    total: byKey.size
  });
  return {
    inserted,
    skipped,
    total: byKey.size,
    source: usedUrl,
    parseErrors: parseErrors.length
  };
});
const listAuHolidaySyncLog_createServerFn_handler = createServerRpc({
  id: "b5113ef54c545cb4b6e49ae37426399ae528fbbf78349891e5311899041457bd",
  name: "listAuHolidaySyncLog",
  filename: "src/lib/au-holidays-sync.functions.ts"
}, (opts) => listAuHolidaySyncLog.__executeServer(opts));
const listAuHolidaySyncLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAuHolidaySyncLog_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("au_holiday_sync_log").select("id, year, status, source_url, inserted_count, skipped_count, total_count, error_message, csv_parse_errors, started_at, completed_at, synced_by").order("started_at", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return {
    entries: data ?? []
  };
});
export {
  listAuHolidaySyncLog_createServerFn_handler,
  syncAuHolidays_createServerFn_handler
};
