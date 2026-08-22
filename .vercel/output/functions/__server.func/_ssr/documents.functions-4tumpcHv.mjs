import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { s as src_default } from "../_libs/isomorphic-dompurify.mjs";
import { s as sanitizeDocHtml } from "./doc-html-sanitize-DmyM8weV.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn, b as getRequestHost$1, d as getRequestIP$1, e as getRequestHeader } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, D as arrayType, B as enumType, E as recordType, G as literalType } from "../_libs/zod.mjs";
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
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function sendDocEmail(templateName, recipientEmail, templateData, idempotencyKey) {
  try {
    const {
      sendInternalEmail
    } = await import("./send-internal.server-9cG3k97B.mjs");
    await sendInternalEmail({
      templateName,
      recipientEmail,
      templateData,
      idempotencyKey
    });
  } catch (e) {
    console.error("[documents] email send failed", templateName, e);
  }
}
function siteOrigin() {
  try {
    const host = getRequestHost$1();
    if (host) return `https://${host}`;
  } catch {
  }
  return "https://hrppl.io";
}
function genToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function buildCertificateHtml(args) {
  const {
    envelope,
    signers,
    events,
    audit_hash
  } = args;
  const signerRows = signers.map((s) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(s.signer_name)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(s.signer_email)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(s.role || "signer")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${s.signed_at ? new Date(s.signed_at).toLocaleString() : "—"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;">${escapeHtml(s.signature_ip || "—")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${renderSignatureBlock(s)}</td>
    </tr>`).join("");
  const eventRows = events.slice(0, 50).map((e) => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:10px;color:#6b7280;">${new Date(e.created_at).toLocaleString()}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;">${escapeHtml(e.event)}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">${escapeHtml(e.actor_email || "")}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:10px;color:#9ca3af;">${escapeHtml(e.ip || "")}</td>
    </tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(envelope.subject)} — Signed copy</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111827; margin:0; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 24px; position: relative; }
  .watermark { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:0; opacity:0.06; transform:rotate(-30deg); font-size:160px; font-weight:900; color:#10b981; letter-spacing:8px; }
  .badge { display:inline-block; padding:4px 10px; border-radius:999px; background:#10b981; color:#fff; font-size:11px; font-weight:700; letter-spacing:1px; }
  .meta { display:flex; justify-content:space-between; align-items:center; padding:12px 0 16px; border-bottom:2px solid #10b981; margin-bottom:24px; }
  .content { position:relative; z-index:1; }
  .audit { margin-top:32px; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
  .audit h3 { margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#374151; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { text-align:left; padding:6px 10px; background:#f3f4f6; font-size:11px; text-transform:uppercase; color:#6b7280; }
  .hash { font-family:monospace; font-size:10px; color:#6b7280; word-break:break-all; }
  .print { position:fixed; top:12px; right:12px; }
  @media print { .print { display:none; } }
</style></head>
<body>
  <div class="watermark">SIGNED</div>
  <div class="wrap">
    <div class="meta">
      <div>
        <span class="badge">SIGNED &amp; CERTIFIED</span>
        <div style="margin-top:6px;font-size:11px;color:#6b7280;">Envelope ${envelope.id}</div>
      </div>
      <div style="text-align:right;font-size:11px;color:#6b7280;">
        Completed ${envelope.completed_at ? new Date(envelope.completed_at).toLocaleString() : "—"}<br/>
        Document type: ${escapeHtml(envelope.doc_type.replace(/_/g, " "))}
      </div>
    </div>
    <button class="print" onclick="window.print()" style="padding:6px 12px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;">Print / Save as PDF</button>
    <div class="content">
      ${sanitizeDocHtml(envelope.body_html_snapshot)}
    </div>
    <div class="audit">
      <h3>Signature certificate</h3>
      <table>
        <thead><tr><th>Signer</th><th>Email</th><th>Role</th><th>Signed at</th><th>IP</th><th>Signature</th></tr></thead>
        <tbody>${signerRows}</tbody>
      </table>
      <h3 style="margin-top:18px;">Audit trail</h3>
      <table>
        <thead><tr><th>Time</th><th>Event</th><th>Actor</th><th>IP</th></tr></thead>
        <tbody>${eventRows}</tbody>
      </table>
      <div style="margin-top:14px;">
        <div style="font-size:11px;color:#6b7280;">Tamper-evident audit hash</div>
        <div class="hash">${escapeHtml(audit_hash)}</div>
      </div>
    </div>
  </div>
</body></html>`;
}
function renderSignatureBlock(s) {
  if (s.signature_method === "drawn" && s.signature_drawn_svg) {
    const safe = src_default.sanitize(String(s.signature_drawn_svg), {
      USE_PROFILES: {
        svg: true,
        svgFilters: false
      },
      ALLOWED_TAGS: ["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon"],
      ALLOWED_ATTR: ["viewBox", "xmlns", "width", "height", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "d", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "points", "transform", "opacity"],
      FORBID_TAGS: ["script", "use", "foreignObject", "animate", "animateTransform", "animateMotion", "set", "iframe", "image"],
      FORBID_ATTR: ["onload", "onclick", "onerror", "onmouseover", "href", "xlink:href"],
      KEEP_CONTENT: false
    });
    return `<div style="max-width:120px;max-height:40px;overflow:hidden;">${safe}</div>`;
  }
  if (s.signature_method === "typed" && s.signature_typed) {
    return `<span style="font-family: 'Segoe Script','Brush Script MT',cursive;font-size:18px;">${escapeHtml(s.signature_typed)}</span>`;
  }
  return `<span style="color:#9ca3af;font-size:11px;">acknowledged</span>`;
}
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[<>&"']/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
async function getOrgAdminTenant(supabase, userId) {
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No organization");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const ok = (roles ?? []).some((r) => r.role === "org_admin" || r.role === "super_admin");
  if (!ok) throw new Error("Not authorized");
  return profile.tenant_id;
}
const DOC_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "strong", "em", "b", "i", "u", "br", "hr", "table", "thead", "tbody", "tr", "td", "th", "ul", "ol", "li", "div", "blockquote", "a", "img", "code", "pre"],
  ALLOWED_ATTR: ["class", "style", "href", "target", "rel", "src", "alt", "width", "height", "colspan", "rowspan"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ["script", "iframe", "object", "embed", "style", "link", "meta", "svg", "math", "form", "input", "button", "textarea", "select", "option"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onsubmit", "onchange", "onkeydown", "onkeyup", "onkeypress", "formaction", "xlink:href"]
};
function sanitizeHtml(input) {
  if (!input) return "";
  return src_default.sanitize(input, DOC_HTML_SANITIZE_CONFIG);
}
function applyMergeFields(html, values) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const v = values?.[key];
    return v == null ? "" : String(v).replace(/[<>&]/g, (c) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;"
    })[c]);
  });
}
async function hashAudit(parts) {
  const text = parts.filter(Boolean).join("|");
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function requestContext() {
  let ip = null;
  let ua = null;
  try {
    ip = getRequestIP$1({
      xForwardedFor: true
    }) ?? null;
    ua = getRequestHeader("user-agent") ?? null;
  } catch {
  }
  return {
    ip,
    ua
  };
}
async function logEvent(args) {
  const admin = await loadAdmin();
  const {
    ip,
    ua
  } = requestContext();
  await admin.from("document_events").insert({
    envelope_id: args.envelope_id,
    tenant_id: args.tenant_id,
    event: args.event,
    actor_user_id: args.actor_user_id ?? null,
    actor_email: args.actor_email ?? null,
    ip,
    user_agent: ua,
    metadata: args.metadata ?? {}
  });
}
const listTemplates_createServerFn_handler = createServerRpc({
  id: "8f8398e96f70354858f29e9774e76da8f68d81529cf60e32bd0d6b7c36138a8a",
  name: "listTemplates",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listTemplates.__executeServer(opts));
const listTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    data,
    error
  } = await supabase.from("document_templates").select("id,name,description,doc_type,status,version,parent_template_id,requires_signature,requires_countersign,default_due_days,published_at,created_at,updated_at").eq("tenant_id", tenant_id).order("doc_type", {
    ascending: true
  }).order("name", {
    ascending: true
  }).order("version", {
    ascending: false
  });
  if (error) throw error;
  return {
    templates: data ?? []
  };
});
const getTemplate_createServerFn_handler = createServerRpc({
  id: "279ed1469b4ca2b9991da32381113186ad1ba836a45d71f49aaab50e2c58a06c",
  name: "getTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => getTemplate.__executeServer(opts));
const getTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    data: tpl,
    error
  } = await supabase.from("document_templates").select("*").eq("id", data.id).eq("tenant_id", tenant_id).maybeSingle();
  if (error) throw error;
  if (!tpl) throw new Error("Not found");
  return {
    template: tpl
  };
});
const TemplateUpsertSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  doc_type: enumType(["employment_contract", "offer_letter", "policy", "hr_letter", "other"]),
  body_html: stringType().max(2e5),
  merge_fields: arrayType(stringType().regex(/^[a-zA-Z0-9_.]+$/).max(64)).max(100).default([]),
  requires_signature: booleanType().default(true),
  requires_countersign: booleanType().default(false),
  countersigner_role: stringType().max(100).optional().nullable(),
  default_due_days: numberType().int().min(1).max(365).default(14)
});
const upsertTemplate_createServerFn_handler = createServerRpc({
  id: "988de5c255de0140459b3fbe3ff3f4e18109c1492bf453b5bbd6f772f3bbedea",
  name: "upsertTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => upsertTemplate.__executeServer(opts));
const upsertTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => TemplateUpsertSchema.parse(d)).handler(upsertTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const body_html = sanitizeHtml(data.body_html);
  const payload = {
    tenant_id,
    name: data.name,
    description: data.description ?? null,
    doc_type: data.doc_type,
    body_html,
    merge_fields: data.merge_fields,
    requires_signature: data.requires_signature,
    requires_countersign: data.requires_countersign,
    countersigner_role: data.countersigner_role ?? null,
    default_due_days: data.default_due_days
  };
  if (data.id) {
    const {
      data: existing
    } = await supabase.from("document_templates").select("status,tenant_id").eq("id", data.id).maybeSingle();
    if (!existing || existing.tenant_id !== tenant_id) throw new Error("Not found");
    if (existing.status !== "draft") throw new Error("Only draft templates can be edited; clone to create a new version");
    const {
      data: updated,
      error: error2
    } = await supabase.from("document_templates").update(payload).eq("id", data.id).select("id").single();
    if (error2) throw error2;
    return {
      id: updated.id
    };
  }
  payload.created_by = userId;
  const {
    data: created,
    error
  } = await supabase.from("document_templates").insert(payload).select("id").single();
  if (error) throw error;
  return {
    id: created.id
  };
});
const publishTemplate_createServerFn_handler = createServerRpc({
  id: "73769c5ccda941434468190642584a61396f75a48db78803dc3470365be06524",
  name: "publishTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => publishTemplate.__executeServer(opts));
const publishTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(publishTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    error
  } = await supabase.from("document_templates").update({
    status: "published",
    published_at: (/* @__PURE__ */ new Date()).toISOString(),
    published_by: userId
  }).eq("id", data.id).eq("tenant_id", tenant_id).eq("status", "draft");
  if (error) throw error;
  return {
    ok: true
  };
});
const archiveTemplate_createServerFn_handler = createServerRpc({
  id: "d2ed42b050fd0eb33060b934e42e6790d348255b6a6b49a46efa2d7ba4508b80",
  name: "archiveTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => archiveTemplate.__executeServer(opts));
const archiveTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(archiveTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    error
  } = await supabase.from("document_templates").update({
    status: "archived"
  }).eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const cloneTemplate_createServerFn_handler = createServerRpc({
  id: "645c993d6bd494f5b894b9bd244045d0e7ca4ae69ffe281b3ecadfb04ce0b402",
  name: "cloneTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => cloneTemplate.__executeServer(opts));
const cloneTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(cloneTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    data: src
  } = await supabase.from("document_templates").select("*").eq("id", data.id).eq("tenant_id", tenant_id).maybeSingle();
  if (!src) throw new Error("Not found");
  const root = src.parent_template_id ?? src.id;
  const {
    data: max
  } = await supabase.from("document_templates").select("version").or(`id.eq.${root},parent_template_id.eq.${root}`).order("version", {
    ascending: false
  }).limit(1).maybeSingle();
  const nextVersion = (max?.version ?? src.version) + 1;
  const {
    data: created,
    error
  } = await supabase.from("document_templates").insert({
    tenant_id,
    name: `${src.name} v${nextVersion}`,
    description: src.description,
    doc_type: src.doc_type,
    body_html: src.body_html,
    merge_fields: src.merge_fields,
    status: "draft",
    version: nextVersion,
    parent_template_id: root,
    requires_signature: src.requires_signature,
    requires_countersign: src.requires_countersign,
    countersigner_role: src.countersigner_role,
    default_due_days: src.default_due_days,
    created_by: userId
  }).select("id").single();
  if (error) throw error;
  return {
    id: created.id
  };
});
const CountersignerSchema = objectType({
  employee_id: stringType().uuid().optional(),
  user_id: stringType().uuid().optional(),
  email: stringType().email().max(255).optional(),
  name: stringType().min(1).max(200).optional(),
  role: stringType().max(100).optional()
}).optional();
const SendEnvelopeSchema = objectType({
  template_id: stringType().uuid().optional(),
  doc_type: enumType(["employment_contract", "offer_letter", "policy", "hr_letter", "other"]).optional(),
  subject: stringType().trim().min(1).max(300),
  body_html: stringType().max(2e5).optional(),
  recipients: arrayType(objectType({
    employee_id: stringType().uuid().optional(),
    email: stringType().email().max(255).optional(),
    name: stringType().min(1).max(200).optional(),
    merge_values: recordType(stringType(), stringType().max(2e3)).default({})
  })).min(1).max(500),
  due_days: numberType().int().min(1).max(365).optional(),
  requires_signature: booleanType().optional(),
  countersigner: CountersignerSchema,
  require_geofence: booleanType().optional(),
  allowed_geofence_ids: arrayType(stringType().uuid()).max(20).optional()
});
const sendEnvelopes_createServerFn_handler = createServerRpc({
  id: "493d371f437e58ea84560e458b360a66aaf25f8515d2775d99a7713439a2ed15",
  name: "sendEnvelopes",
  filename: "src/lib/documents.functions.ts"
}, (opts) => sendEnvelopes.__executeServer(opts));
const sendEnvelopes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SendEnvelopeSchema.parse(d)).handler(sendEnvelopes_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  let tpl = null;
  if (data.template_id) {
    const {
      data: t
    } = await supabase.from("document_templates").select("*").eq("id", data.template_id).eq("tenant_id", tenant_id).maybeSingle();
    if (!t) throw new Error("Template not found");
    if (t.status !== "published") throw new Error("Template must be published to send");
    tpl = t;
  }
  const bodyTemplate = sanitizeHtml(data.body_html ?? tpl?.body_html ?? "");
  if (!bodyTemplate) throw new Error("Body is required");
  const doc_type = data.doc_type ?? tpl?.doc_type ?? "other";
  const requires_signature = data.requires_signature ?? tpl?.requires_signature ?? true;
  const dueDays = data.due_days ?? tpl?.default_due_days ?? 14;
  const due_date = new Date(Date.now() + dueDays * 864e5).toISOString().slice(0, 10);
  const batch_id = crypto.randomUUID();
  let countersigner = null;
  if (data.countersigner) {
    const cs = data.countersigner;
    let resolvedEmail = cs.email ?? null;
    let resolvedName = cs.name ?? null;
    let resolvedUser = cs.user_id ?? null;
    let resolvedEmp = cs.employee_id ?? null;
    if (cs.employee_id) {
      const {
        data: e
      } = await supabase.from("employees").select("id,first_name,last_name,email,user_id").eq("id", cs.employee_id).eq("tenant_id", tenant_id).maybeSingle();
      if (e) {
        resolvedEmail = resolvedEmail ?? e.email;
        resolvedName = resolvedName ?? `${e.first_name} ${e.last_name}`;
        resolvedUser = resolvedUser ?? e.user_id;
        resolvedEmp = e.id;
      }
    }
    if (resolvedEmail && resolvedName) {
      countersigner = {
        user_id: resolvedUser,
        employee_id: resolvedEmp,
        email: resolvedEmail,
        name: resolvedName,
        role: cs.role ?? tpl?.countersigner_role ?? "countersigner"
      };
    }
  }
  const requires_countersign = !!countersigner || tpl?.requires_countersign || false;
  const admin = await loadAdmin();
  const created = [];
  const origin = siteOrigin();
  const {
    data: adminProfile
  } = await admin.from("profiles").select("email,full_name").eq("id", userId).maybeSingle();
  for (const r of data.recipients) {
    let employee = null;
    if (r.employee_id) {
      const {
        data: e
      } = await supabase.from("employees").select("id,first_name,last_name,email,user_id,tenant_id,job_title").eq("id", r.employee_id).eq("tenant_id", tenant_id).maybeSingle();
      if (!e) continue;
      employee = e;
    }
    const recipient_email = employee?.email ?? r.email;
    const recipient_name = r.name ?? (employee ? `${employee.first_name} ${employee.last_name}` : null);
    if (!recipient_email || !recipient_name) continue;
    const merge_values = {
      ...employee ? {
        "employee.first_name": employee.first_name,
        "employee.last_name": employee.last_name,
        "employee.full_name": `${employee.first_name} ${employee.last_name}`,
        "employee.email": employee.email,
        "employee.job_title": employee.job_title ?? ""
      } : {},
      "today": (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      ...r.merge_values
    };
    const rendered = applyMergeFields(bodyTemplate, merge_values);
    const {
      data: env,
      error
    } = await admin.from("document_envelopes").insert({
      tenant_id,
      template_id: tpl?.id ?? null,
      template_version: tpl?.version ?? null,
      doc_type,
      subject: data.subject,
      body_html_snapshot: rendered,
      merge_values,
      employee_id: employee?.id ?? null,
      recipient_email,
      recipient_name,
      status: "sent",
      requires_signature,
      requires_countersign,
      due_date,
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_by: userId,
      bulk_batch_id: batch_id,
      require_geofence: data.require_geofence ?? false,
      allowed_geofence_ids: data.allowed_geofence_ids ?? []
    }).select("id").single();
    if (error || !env) continue;
    await admin.from("document_signers").insert({
      envelope_id: env.id,
      tenant_id,
      order_index: 1,
      role: "signer",
      signer_user_id: employee?.user_id ?? null,
      signer_employee_id: employee?.id ?? null,
      signer_email: recipient_email,
      signer_name: recipient_name,
      status: "pending"
    });
    if (countersigner) {
      await admin.from("document_signers").insert({
        envelope_id: env.id,
        tenant_id,
        order_index: 2,
        role: countersigner.role,
        signer_user_id: countersigner.user_id,
        signer_employee_id: countersigner.employee_id,
        signer_email: countersigner.email,
        signer_name: countersigner.name,
        status: "pending"
      });
    }
    await logEvent({
      envelope_id: env.id,
      tenant_id,
      event: "envelope_sent",
      actor_user_id: userId,
      metadata: {
        recipient: recipient_email,
        countersigner: countersigner?.email ?? null
      }
    });
    created.push(env.id);
    await sendDocEmail("document-sent", recipient_email, {
      recipientName: recipient_name,
      subject: data.subject,
      docType: doc_type,
      dueDate: due_date,
      signUrl: `${origin}/sign/${env.id}`,
      senderName: adminProfile?.full_name ?? "Your organisation"
    }, `envsend:${env.id}`);
  }
  return {
    created: created.length,
    batch_id
  };
});
const listEnvelopes_createServerFn_handler = createServerRpc({
  id: "6a61749174e00b5f6f1dba9d3b62065a3301ba07fa28dedf556620a1492cce1d",
  name: "listEnvelopes",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listEnvelopes.__executeServer(opts));
const listEnvelopes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: stringType().optional(),
  doc_type: stringType().optional(),
  search: stringType().max(200).optional()
}).parse(d ?? {})).handler(listEnvelopes_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  let q = supabase.from("document_envelopes").select("id,subject,doc_type,status,recipient_name,recipient_email,due_date,sent_at,completed_at,created_at,employee:employees(id,first_name,last_name)").eq("tenant_id", tenant_id).order("created_at", {
    ascending: false
  }).limit(200);
  if (data.status) q = q.eq("status", data.status);
  if (data.doc_type) q = q.eq("doc_type", data.doc_type);
  if (data.search) q = q.ilike("recipient_name", `%${data.search}%`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    envelopes: rows ?? []
  };
});
const getEnvelope_createServerFn_handler = createServerRpc({
  id: "2c8b2f576335cfeb8a70e9b9026e9016b4e5929bb9485aef89c16c430ad4960e",
  name: "getEnvelope",
  filename: "src/lib/documents.functions.ts"
}, (opts) => getEnvelope.__executeServer(opts));
const getEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getEnvelope_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: env,
    error
  } = await supabase.from("document_envelopes").select("*").eq("id", data.id).maybeSingle();
  if (error) throw error;
  if (!env) throw new Error("Not found");
  const [signers, events] = await Promise.all([supabase.from("document_signers").select("id,order_index,role,signer_name,signer_email,signer_user_id,status,viewed_at,signed_at,signature_method").eq("envelope_id", env.id).order("order_index"), supabase.from("document_events").select("id,event,actor_email,ip,created_at,metadata").eq("envelope_id", env.id).order("created_at", {
    ascending: false
  }).limit(100)]);
  return {
    envelope: env,
    signers: signers.data ?? [],
    events: events.data ?? []
  };
});
const cancelEnvelope_createServerFn_handler = createServerRpc({
  id: "41ff17276628972f6589ba5fa4c55d62fc4ae8f6103b1e1ca2f8f08891fc6696",
  name: "cancelEnvelope",
  filename: "src/lib/documents.functions.ts"
}, (opts) => cancelEnvelope.__executeServer(opts));
const cancelEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().max(500).optional()
}).parse(d)).handler(cancelEnvelope_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    error
  } = await supabase.from("document_envelopes").update({
    status: "cancelled",
    cancelled_at: (/* @__PURE__ */ new Date()).toISOString(),
    cancelled_by: userId,
    cancel_reason: data.reason ?? null
  }).eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  await logEvent({
    envelope_id: data.id,
    tenant_id,
    event: "envelope_cancelled",
    actor_user_id: userId,
    metadata: {
      reason: data.reason
    }
  });
  return {
    ok: true
  };
});
const myPendingEnvelopes_createServerFn_handler = createServerRpc({
  id: "ad9ef467e0293322ecb0b0f6c06ce0a3138a5b69f939addad28fdfb193ad189c",
  name: "myPendingEnvelopes",
  filename: "src/lib/documents.functions.ts"
}, (opts) => myPendingEnvelopes.__executeServer(opts));
const myPendingEnvelopes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(myPendingEnvelopes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("document_signers").select("id,status,signed_at,envelope:document_envelopes(id,subject,doc_type,status,due_date,sent_at,requires_signature)").eq("signer_user_id", userId).order("created_at", {
    ascending: false
  }).limit(100);
  if (error) throw error;
  return {
    items: data ?? []
  };
});
const getSigningEnvelope_createServerFn_handler = createServerRpc({
  id: "f8f238ab345677ff42a3f1cc0916f88d9281b9c1d206cde9493aef020a6beeb0",
  name: "getSigningEnvelope",
  filename: "src/lib/documents.functions.ts"
}, (opts) => getSigningEnvelope.__executeServer(opts));
const getSigningEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid()
}).parse(d)).handler(getSigningEnvelope_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: signer
  } = await supabase.from("document_signers").select("*").eq("envelope_id", data.envelope_id).eq("signer_user_id", userId).maybeSingle();
  if (!signer) throw new Error("Not authorized");
  const {
    data: env
  } = await supabase.from("document_envelopes").select("*").eq("id", data.envelope_id).maybeSingle();
  if (!env) throw new Error("Not found");
  if (signer.status === "pending") {
    const admin = await loadAdmin();
    await admin.from("document_signers").update({
      status: "viewed",
      viewed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", signer.id);
    await admin.from("document_envelopes").update({
      status: env.status === "sent" ? "viewed" : env.status,
      first_viewed_at: env.first_viewed_at ?? (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", env.id);
    await logEvent({
      envelope_id: env.id,
      tenant_id: env.tenant_id,
      event: "envelope_viewed",
      actor_user_id: userId
    });
  }
  return {
    envelope: env,
    signer
  };
});
const SignSchema = objectType({
  envelope_id: stringType().uuid(),
  method: enumType(["typed", "drawn", "acknowledged"]),
  typed: stringType().max(200).optional(),
  drawn_svg: stringType().max(2e5).optional(),
  consent: literalType(true),
  geo: objectType({
    latitude: numberType().min(-90).max(90),
    longitude: numberType().min(-180).max(180),
    accuracy_m: numberType().nonnegative().max(1e5).optional()
  }).optional()
});
const submitSignature_createServerFn_handler = createServerRpc({
  id: "f9c994d04030c47f67f804b8043b8f05b95c6f868cf389d501d063d429b67330",
  name: "submitSignature",
  filename: "src/lib/documents.functions.ts"
}, (opts) => submitSignature.__executeServer(opts));
const submitSignature = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SignSchema.parse(d)).handler(submitSignature_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: signer
  } = await supabase.from("document_signers").select("*").eq("envelope_id", data.envelope_id).eq("signer_user_id", userId).maybeSingle();
  if (!signer) throw new Error("Not authorized");
  if (signer.status === "signed") return {
    ok: true,
    already: true
  };
  if (signer.status === "declined") throw new Error("Already declined");
  if (data.method === "typed" && !data.typed?.trim()) throw new Error("Typed signature required");
  if (data.method === "drawn" && !data.drawn_svg?.trim()) throw new Error("Drawn signature required");
  const admin = await loadAdmin();
  const {
    data: env0
  } = await admin.from("document_envelopes").select("id,tenant_id,subject,doc_type,created_by,certificate_token,employee_id,require_geofence,allowed_geofence_ids,status").eq("id", data.envelope_id).single();
  let matchedFenceId = null;
  if (env0?.require_geofence) {
    if (!data.geo) throw new Error("Location is required to sign this document. Please allow location access and try again.");
    const ids = env0.allowed_geofence_ids ?? [];
    if (ids.length === 0) throw new Error("No signing locations are configured for this document. Contact your administrator.");
    const {
      data: fences
    } = await admin.from("sign_geofences").select("id,latitude,longitude,radius_meters,is_active").in("id", ids);
    const {
      distanceMeters
    } = await import("./geofences.functions-C8KvPefL.mjs");
    for (const f of (fences ?? []).filter((x) => x.is_active)) {
      const d = distanceMeters(Number(f.latitude), Number(f.longitude), data.geo.latitude, data.geo.longitude);
      if (d <= f.radius_meters) {
        matchedFenceId = f.id;
        break;
      }
    }
    if (!matchedFenceId) throw new Error("You are outside the permitted signing area. Move on-site and try again.");
  }
  const {
    ip,
    ua
  } = requestContext();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const audit = await hashAudit([signer.id, userId, data.method, data.typed ?? "", data.drawn_svg ?? "", ip, ua, now, data.geo ? `${data.geo.latitude},${data.geo.longitude}` : ""]);
  await admin.from("document_signers").update({
    status: "signed",
    signed_at: now,
    signature_method: data.method,
    signature_typed: data.typed ?? null,
    signature_drawn_svg: data.drawn_svg ?? null,
    signature_ip: ip,
    signature_user_agent: ua,
    audit_hash: audit,
    signature_latitude: data.geo?.latitude ?? null,
    signature_longitude: data.geo?.longitude ?? null,
    signature_geo_accuracy_m: data.geo?.accuracy_m ?? null,
    signature_geofence_id: matchedFenceId
  }).eq("id", signer.id);
  const {
    data: env
  } = await admin.from("document_envelopes").select("*").eq("id", data.envelope_id).maybeSingle();
  const {
    data: allSigners
  } = await admin.from("document_signers").select("*").eq("envelope_id", data.envelope_id).order("order_index");
  const allDone = (allSigners ?? []).every((r) => r.status === "signed");
  const remaining = (allSigners ?? []).filter((r) => r.status !== "signed").length;
  const origin = siteOrigin();
  let adminEmail = null;
  if (env?.created_by) {
    const {
      data: adm
    } = await admin.from("profiles").select("email").eq("id", env.created_by).maybeSingle();
    adminEmail = adm?.email ?? null;
  }
  if (adminEmail) {
    await sendDocEmail("document-signed", adminEmail, {
      recipientName: "Admin",
      signerName: signer.signer_name,
      subject: env?.subject,
      docType: env?.doc_type,
      signedAt: new Date(now).toLocaleString(),
      envelopeUrl: `${origin}/org/documents/envelope/${data.envelope_id}`,
      remainingSigners: remaining
    }, `envsigned:${signer.id}`);
  }
  if (allDone && env) {
    const {
      data: events
    } = await admin.from("document_events").select("event,actor_email,ip,created_at,metadata").eq("envelope_id", data.envelope_id).order("created_at", {
      ascending: true
    });
    const completedAt = now;
    const finalAuditHash = await hashAudit([env.id, completedAt, ...(allSigners ?? []).map((s) => `${s.id}:${s.audit_hash ?? ""}`)]);
    const cert = buildCertificateHtml({
      envelope: {
        ...env,
        completed_at: completedAt
      },
      signers: allSigners ?? [],
      events: events ?? [],
      audit_hash: finalAuditHash
    });
    const certToken = env.certificate_token ?? genToken();
    await admin.from("document_envelopes").update({
      status: "completed",
      completed_at: completedAt,
      signed_certificate_html: cert,
      certificate_token: certToken,
      signed_document_path: `certificate:${certToken}`
    }).eq("id", data.envelope_id);
    if (env.employee_id) {
      await admin.from("employee_documents").insert({
        tenant_id: env.tenant_id,
        employee_id: env.employee_id,
        doc_type: env.doc_type,
        category: "signed_document",
        file_path: `certificate:${certToken}`,
        file_name: `${env.subject}.html`,
        mime_type: "text/html",
        size_bytes: cert.length,
        uploaded_by: userId,
        visibility: "employee",
        notes: "Signed via in-app e-signature",
        source_envelope_id: env.id
      });
    }
    await logEvent({
      envelope_id: data.envelope_id,
      tenant_id: signer.tenant_id,
      event: "envelope_completed",
      actor_user_id: userId,
      metadata: {
        audit_hash: finalAuditHash
      }
    });
    const certUrl = `${origin}/sign/certificate/${certToken}`;
    const recipients = /* @__PURE__ */ new Set();
    (allSigners ?? []).forEach((s) => s.signer_email && recipients.add(s.signer_email));
    if (adminEmail) recipients.add(adminEmail);
    for (const to of recipients) {
      await sendDocEmail("document-completed", to, {
        recipientName: "",
        subject: env.subject,
        docType: env.doc_type,
        completedAt: new Date(completedAt).toLocaleString(),
        certificateUrl: certUrl
      }, `envdone:${data.envelope_id}:${to}`);
    }
  } else if (env) {
    const next = (allSigners ?? []).find((s) => s.status !== "signed" && s.status !== "declined");
    await admin.from("document_envelopes").update({
      status: "in_progress"
    }).eq("id", data.envelope_id);
    if (next && next.signer_email) {
      await sendDocEmail("document-sent", next.signer_email, {
        recipientName: next.signer_name,
        subject: env.subject,
        docType: env.doc_type,
        dueDate: env.due_date,
        signUrl: `${origin}/sign/${env.id}`,
        senderName: "Your organisation"
      }, `envsend-next:${next.id}`);
    }
  }
  await logEvent({
    envelope_id: data.envelope_id,
    tenant_id: signer.tenant_id,
    event: "envelope_signed",
    actor_user_id: userId,
    metadata: {
      method: data.method,
      audit_hash: audit
    }
  });
  return {
    ok: true,
    audit_hash: audit
  };
});
const declineEnvelope_createServerFn_handler = createServerRpc({
  id: "7c2fa475a105a23489b9543e8d511ee4918ef170db9694884479a9919d461708",
  name: "declineEnvelope",
  filename: "src/lib/documents.functions.ts"
}, (opts) => declineEnvelope.__executeServer(opts));
const declineEnvelope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid(),
  reason: stringType().max(500)
}).parse(d)).handler(declineEnvelope_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: signer
  } = await supabase.from("document_signers").select("*").eq("envelope_id", data.envelope_id).eq("signer_user_id", userId).maybeSingle();
  if (!signer) throw new Error("Not authorized");
  const admin = await loadAdmin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await admin.from("document_signers").update({
    status: "declined",
    declined_at: now,
    decline_reason: data.reason
  }).eq("id", signer.id);
  await admin.from("document_envelopes").update({
    status: "declined"
  }).eq("id", data.envelope_id);
  await logEvent({
    envelope_id: data.envelope_id,
    tenant_id: signer.tenant_id,
    event: "envelope_declined",
    actor_user_id: userId,
    metadata: {
      reason: data.reason
    }
  });
  const {
    data: env
  } = await admin.from("document_envelopes").select("subject,doc_type,created_by").eq("id", data.envelope_id).maybeSingle();
  if (env?.created_by) {
    const {
      data: adm
    } = await admin.from("profiles").select("email").eq("id", env.created_by).maybeSingle();
    if (adm?.email) {
      await sendDocEmail("document-declined", adm.email, {
        recipientName: "Admin",
        signerName: signer.signer_name,
        subject: env.subject,
        docType: env.doc_type,
        reason: data.reason,
        envelopeUrl: `${siteOrigin()}/org/documents/envelope/${data.envelope_id}`
      }, `envdecline:${signer.id}`);
    }
  }
  return {
    ok: true
  };
});
const sendEnvelopeReminder_createServerFn_handler = createServerRpc({
  id: "3a737fdfa82a3e2e650faefb09107b9a405d719dbac97834d49d9d0880dad171",
  name: "sendEnvelopeReminder",
  filename: "src/lib/documents.functions.ts"
}, (opts) => sendEnvelopeReminder.__executeServer(opts));
const sendEnvelopeReminder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  envelope_id: stringType().uuid()
}).parse(d)).handler(sendEnvelopeReminder_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const admin = await loadAdmin();
  const {
    data: env
  } = await admin.from("document_envelopes").select("*").eq("id", data.envelope_id).eq("tenant_id", tenant_id).maybeSingle();
  if (!env) throw new Error("Not found");
  if (["completed", "cancelled", "declined", "expired"].includes(env.status)) throw new Error("Envelope is closed");
  if (env.last_reminder_at && Date.now() - new Date(env.last_reminder_at).getTime() < 6 * 36e5) {
    throw new Error("Please wait at least 6 hours between reminders");
  }
  const {
    data: signers
  } = await admin.from("document_signers").select("*").eq("envelope_id", data.envelope_id);
  const pending = (signers ?? []).filter((s) => s.status !== "signed" && s.status !== "declined");
  if (pending.length === 0) throw new Error("No pending signers");
  const origin = siteOrigin();
  for (const s of pending) {
    await sendDocEmail("document-reminder", s.signer_email, {
      recipientName: s.signer_name,
      subject: env.subject,
      docType: env.doc_type,
      dueDate: env.due_date,
      signUrl: `${origin}/sign/${env.id}`
    }, `envremind:${env.id}:${s.id}:${Date.now()}`);
  }
  await admin.from("document_envelopes").update({
    last_reminder_at: (/* @__PURE__ */ new Date()).toISOString(),
    reminder_count: (env.reminder_count ?? 0) + 1
  }).eq("id", env.id);
  await logEvent({
    envelope_id: env.id,
    tenant_id,
    event: "reminder_sent",
    actor_user_id: userId,
    metadata: {
      count: pending.length
    }
  });
  return {
    ok: true,
    reminded: pending.length
  };
});
const getCertificate_createServerFn_handler = createServerRpc({
  id: "23d6c4acec297d0614c7ce517d851ff7850138f3887ead0b16d6568c6450e58b",
  name: "getCertificate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => getCertificate.__executeServer(opts));
const getCertificate = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  token: stringType().min(20).max(80)
}).parse(d)).handler(getCertificate_createServerFn_handler, async ({
  data
}) => {
  const admin = await loadAdmin();
  const {
    data: env
  } = await admin.from("document_envelopes").select("id,subject,status,completed_at,signed_certificate_html").eq("certificate_token", data.token).maybeSingle();
  if (!env || env.status !== "completed" || !env.signed_certificate_html) {
    throw new Error("Certificate not available");
  }
  return {
    subject: env.subject,
    completed_at: env.completed_at,
    html: env.signed_certificate_html
  };
});
const renderTemplatePreview_createServerFn_handler = createServerRpc({
  id: "bbbd0a43cc6d2edca875cf88cfa631aab6dff19aa626ad51aaa99f7062ddc562",
  name: "renderTemplatePreview",
  filename: "src/lib/documents.functions.ts"
}, (opts) => renderTemplatePreview.__executeServer(opts));
const renderTemplatePreview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  body_html: stringType().max(2e5),
  sample_values: recordType(stringType(), stringType().max(2e3)).optional()
}).parse(d)).handler(renderTemplatePreview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await getOrgAdminTenant(supabase, userId);
  const defaults = {
    "employee.first_name": "Alex",
    "employee.last_name": "Sample",
    "employee.full_name": "Alex Sample",
    "employee.email": "alex.sample@example.com",
    "employee.job_title": "Software Engineer",
    "company.name": "Acme Inc.",
    "today": (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
  const values = {
    ...defaults,
    ...data.sample_values ?? {}
  };
  const rendered = applyMergeFields(sanitizeHtml(data.body_html), values);
  const found = /* @__PURE__ */ new Set();
  data.body_html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, k) => {
    found.add(k);
    return "";
  });
  const unresolved = Array.from(found).filter((k) => !(k in values));
  return {
    html: rendered,
    unresolved,
    used_values: values
  };
});
const listExpiringDocuments_createServerFn_handler = createServerRpc({
  id: "0784cfa9c0df1fbc161b9d8bb8bca3a23f5b08bc3b41ddfc6c3c49848d499fcc",
  name: "listExpiringDocuments",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listExpiringDocuments.__executeServer(opts));
const listExpiringDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listExpiringDocuments_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const cutoff = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
  const {
    data,
    error
  } = await supabase.from("employee_documents").select("id,file_name,category,expiry_date,verification_status,employee:employees(id,first_name,last_name,email)").eq("tenant_id", tenant_id).not("expiry_date", "is", null).lte("expiry_date", cutoff).order("expiry_date", {
    ascending: true
  }).limit(200);
  if (error) throw error;
  return {
    documents: data ?? []
  };
});
const verifyEmployeeDocument_createServerFn_handler = createServerRpc({
  id: "a25b2d07aa2e174d9ab26eedba0431b7b8a693a0a4fd72d0fbd6237647d961a9",
  name: "verifyEmployeeDocument",
  filename: "src/lib/documents.functions.ts"
}, (opts) => verifyEmployeeDocument.__executeServer(opts));
const verifyEmployeeDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["verified", "rejected", "unverified"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(verifyEmployeeDocument_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    error
  } = await supabase.from("employee_documents").update({
    verification_status: data.status,
    verified_by: userId,
    verified_at: (/* @__PURE__ */ new Date()).toISOString(),
    verification_notes: data.notes ?? null
  }).eq("id", data.id).eq("tenant_id", tenant_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listStarterTemplates_createServerFn_handler = createServerRpc({
  id: "a5ef2f439fe399e7725f2852aca65618ae9363c979702d3f955c33b7e6fcec2c",
  name: "listStarterTemplates",
  filename: "src/lib/documents.functions.ts"
}, (opts) => listStarterTemplates.__executeServer(opts));
const listStarterTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listStarterTemplates_createServerFn_handler, async () => {
  const {
    DOCUMENT_TEMPLATE_PRESETS
  } = await import("./document-template-presets-mYEZplhe.mjs");
  return {
    presets: DOCUMENT_TEMPLATE_PRESETS.map((p) => ({
      key: p.key,
      name: p.name,
      description: p.description,
      doc_type: p.doc_type,
      requires_signature: p.requires_signature,
      requires_countersign: p.requires_countersign,
      countersigner_role: p.countersigner_role ?? null,
      default_due_days: p.default_due_days,
      merge_fields: p.merge_fields
    }))
  };
});
const getStarterTemplate_createServerFn_handler = createServerRpc({
  id: "94181a72b451f8dd8515d1821ae35359a010d9b4499864315d6144a75300d711",
  name: "getStarterTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => getStarterTemplate.__executeServer(opts));
const getStarterTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  key: stringType().min(1).max(80)
}).parse(d)).handler(getStarterTemplate_createServerFn_handler, async ({
  data
}) => {
  const {
    getPresetByKey
  } = await import("./document-template-presets-mYEZplhe.mjs");
  const preset = getPresetByKey(data.key);
  if (!preset) throw new Error("Starter template not found");
  return {
    preset
  };
});
const instantiateStarterTemplate_createServerFn_handler = createServerRpc({
  id: "bb20c5d63b4cedc513d09ee27fb135a72baf892deac26b364f76661a51acee46",
  name: "instantiateStarterTemplate",
  filename: "src/lib/documents.functions.ts"
}, (opts) => instantiateStarterTemplate.__executeServer(opts));
const instantiateStarterTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  key: stringType().min(1).max(80)
}).parse(d)).handler(instantiateStarterTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenant_id = await getOrgAdminTenant(supabase, userId);
  const {
    getPresetByKey
  } = await import("./document-template-presets-mYEZplhe.mjs");
  const preset = getPresetByKey(data.key);
  if (!preset) throw new Error("Starter template not found");
  const {
    data: created,
    error
  } = await supabase.from("document_templates").insert({
    tenant_id,
    name: preset.name,
    description: preset.description,
    doc_type: preset.doc_type,
    body_html: sanitizeHtml(preset.body_html),
    merge_fields: preset.merge_fields,
    requires_signature: preset.requires_signature,
    requires_countersign: preset.requires_countersign,
    countersigner_role: preset.countersigner_role ?? null,
    default_due_days: preset.default_due_days,
    status: "draft",
    created_by: userId
  }).select("id").single();
  if (error) throw error;
  return {
    id: created.id
  };
});
export {
  archiveTemplate_createServerFn_handler,
  cancelEnvelope_createServerFn_handler,
  cloneTemplate_createServerFn_handler,
  declineEnvelope_createServerFn_handler,
  getCertificate_createServerFn_handler,
  getEnvelope_createServerFn_handler,
  getSigningEnvelope_createServerFn_handler,
  getStarterTemplate_createServerFn_handler,
  getTemplate_createServerFn_handler,
  instantiateStarterTemplate_createServerFn_handler,
  listEnvelopes_createServerFn_handler,
  listExpiringDocuments_createServerFn_handler,
  listStarterTemplates_createServerFn_handler,
  listTemplates_createServerFn_handler,
  myPendingEnvelopes_createServerFn_handler,
  publishTemplate_createServerFn_handler,
  renderTemplatePreview_createServerFn_handler,
  sendEnvelopeReminder_createServerFn_handler,
  sendEnvelopes_createServerFn_handler,
  submitSignature_createServerFn_handler,
  upsertTemplate_createServerFn_handler,
  verifyEmployeeDocument_createServerFn_handler
};
