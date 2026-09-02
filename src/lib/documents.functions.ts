import { createServerFn } from "@tanstack/react-start";
import { requireTenantId } from "@/lib/tenant-scope";
import { z } from "zod";
import { getRequestHeader, getRequestIP, getRequestHost } from "@tanstack/react-start/server";
import DOMPurify from "isomorphic-dompurify";
import { sanitizeDocHtml } from "@/lib/doc-html-sanitize";
import { requireSupabaseAuth } from "@/lib/auth-guard";

// ---------- helpers ----------
async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function sendDocEmail(
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any>,
  idempotencyKey?: string,
) {
  try {
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    await sendInternalEmail({ templateName, recipientEmail, templateData, idempotencyKey });
  } catch (e) {
    console.error("[documents] email send failed", templateName, e);
  }
}

function siteOrigin(): string {
  try {
    const host = getRequestHost();
    if (host) return `https://${host}`;
  } catch {}
  return "https://hrppl.io";
}

function genToken(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function buildCertificateHtml(args: {
  envelope: any;
  signers: Array<any>;
  events: Array<any>;
  audit_hash: string;
}): string {
  const { envelope, signers, events, audit_hash } = args;
  const signerRows = signers
    .map(
      (s) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(s.signer_name)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(s.signer_email)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(s.role || "signer")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${s.signed_at ? new Date(s.signed_at).toLocaleString() : "—"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;">${escapeHtml(s.signature_ip || "—")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;">${renderSignatureBlock(s)}</td>
    </tr>`,
    )
    .join("");

  const eventRows = events
    .slice(0, 50)
    .map(
      (e) => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:10px;color:#6b7280;">${new Date(e.created_at).toLocaleString()}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;">${escapeHtml(e.event)}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">${escapeHtml(e.actor_email || "")}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:10px;color:#9ca3af;">${escapeHtml(e.ip || "")}</td>
    </tr>`,
    )
    .join("");

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

function renderSignatureBlock(s: any): string {
  if (s.signature_method === "drawn" && s.signature_drawn_svg) {
    const safe = DOMPurify.sanitize(String(s.signature_drawn_svg), {
      USE_PROFILES: { svg: true, svgFilters: false },
      ALLOWED_TAGS: [
        "svg",
        "g",
        "path",
        "rect",
        "circle",
        "ellipse",
        "line",
        "polyline",
        "polygon",
      ],
      ALLOWED_ATTR: [
        "viewBox",
        "xmlns",
        "width",
        "height",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "d",
        "x",
        "y",
        "x1",
        "y1",
        "x2",
        "y2",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "points",
        "transform",
        "opacity",
      ],
      FORBID_TAGS: [
        "script",
        "use",
        "foreignObject",
        "animate",
        "animateTransform",
        "animateMotion",
        "set",
        "iframe",
        "image",
      ],
      FORBID_ATTR: ["onload", "onclick", "onerror", "onmouseover", "href", "xlink:href"],
      KEEP_CONTENT: false,
    });
    return `<div style="max-width:120px;max-height:40px;overflow:hidden;">${safe}</div>`;
  }
  if (s.signature_method === "typed" && s.signature_typed) {
    return `<span style="font-family: 'Segoe Script','Brush Script MT',cursive;font-size:18px;">${escapeHtml(s.signature_typed)}</span>`;
  }
  return `<span style="color:#9ca3af;font-size:11px;">acknowledged</span>`;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s).replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

async function getOrgAdminTenant(supabase: any, userId: string): Promise<string> {
  // W5 P0-4 · The role check is unchanged; only the tenant lookup moves to
  // tenant-scope, so a super_admin acting as a tenant resolves to that tenant
  // instead of failing on their own NULL profiles.tenant_id.
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const ok = (roles ?? []).some((r: any) => r.role === "org_admin" || r.role === "super_admin");
  if (!ok) throw new Error("Not authorized");
  return requireTenantId(supabase, userId);
}

// Allow-list HTML sanitizer for stored template/envelope HTML.
// Uses DOMPurify with a strict tag/attribute allowlist; safe URI schemes only.
const DOC_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "ul",
    "ol",
    "li",
    "div",
    "blockquote",
    "a",
    "img",
    "code",
    "pre",
  ],
  ALLOWED_ATTR: [
    "class",
    "style",
    "href",
    "target",
    "rel",
    "src",
    "alt",
    "width",
    "height",
    "colspan",
    "rowspan",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    "script",
    "iframe",
    "object",
    "embed",
    "style",
    "link",
    "meta",
    "svg",
    "math",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "option",
  ],
  FORBID_ATTR: [
    "onerror",
    "onload",
    "onclick",
    "onmouseover",
    "onfocus",
    "onblur",
    "onsubmit",
    "onchange",
    "onkeydown",
    "onkeyup",
    "onkeypress",
    "formaction",
    "xlink:href",
  ],
};

function sanitizeHtml(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, DOC_HTML_SANITIZE_CONFIG);
}

function applyMergeFields(html: string, values: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const v = values?.[key];
    return v == null
      ? ""
      : String(v).replace(
          /[<>&]/g,
          (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string,
        );
  });
}

async function hashAudit(parts: Array<string | null | undefined>): Promise<string> {
  const text = parts.filter(Boolean).join("|");
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function requestContext() {
  let ip: string | null = null;
  let ua: string | null = null;
  try {
    ip = getRequestIP({ xForwardedFor: true }) ?? null;
    ua = getRequestHeader("user-agent") ?? null;
  } catch {
    // not in request scope
  }
  return { ip, ua };
}

async function logEvent(args: {
  envelope_id: string;
  tenant_id: string;
  event: string;
  actor_user_id?: string | null;
  actor_email?: string | null;
  metadata?: Record<string, any>;
}) {
  const admin = await loadAdmin();
  const { ip, ua } = requestContext();
  await admin.from("document_events").insert({
    envelope_id: args.envelope_id,
    tenant_id: args.tenant_id,
    event: args.event,
    actor_user_id: args.actor_user_id ?? null,
    actor_email: args.actor_email ?? null,
    ip,
    user_agent: ua,
    metadata: args.metadata ?? {},
  });
}

// =============================================================================
// TEMPLATES (admin)
// =============================================================================

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { data, error } = await supabase
      .from("document_templates")
      .select(
        "id,name,description,doc_type,status,version,parent_template_id,requires_signature,requires_countersign,default_due_days,published_at,created_at,updated_at",
      )
      .eq("tenant_id", tenant_id)
      .order("doc_type", { ascending: true })
      .order("name", { ascending: true })
      .order("version", { ascending: false });
    if (error) throw error;
    return { templates: data ?? [] };
  });

export const getTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { data: tpl, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("id", data.id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    if (error) throw error;
    if (!tpl) throw new Error("Not found");
    return { template: tpl };
  });

const TemplateUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  doc_type: z.enum(["employment_contract", "offer_letter", "policy", "hr_letter", "other"]),
  body_html: z.string().max(200_000),
  merge_fields: z
    .array(
      z
        .string()
        .regex(/^[a-zA-Z0-9_.]+$/)
        .max(64),
    )
    .max(100)
    .default([]),
  requires_signature: z.boolean().default(true),
  requires_countersign: z.boolean().default(false),
  countersigner_role: z.string().max(100).optional().nullable(),
  default_due_days: z.number().int().min(1).max(365).default(14),
});

export const upsertTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TemplateUpsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const body_html = sanitizeHtml(data.body_html);
    const payload: any = {
      tenant_id,
      name: data.name,
      description: data.description ?? null,
      doc_type: data.doc_type,
      body_html,
      merge_fields: data.merge_fields,
      requires_signature: data.requires_signature,
      requires_countersign: data.requires_countersign,
      countersigner_role: data.countersigner_role ?? null,
      default_due_days: data.default_due_days,
    };
    if (data.id) {
      const { data: existing } = await supabase
        .from("document_templates")
        .select("status,tenant_id")
        .eq("id", data.id)
        .maybeSingle();
      if (!existing || existing.tenant_id !== tenant_id) throw new Error("Not found");
      if (existing.status !== "draft")
        throw new Error("Only draft templates can be edited; clone to create a new version");
      const { data: updated, error } = await supabase
        .from("document_templates")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw error;
      return { id: updated.id };
    }
    payload.created_by = userId;
    const { data: created, error } = await supabase
      .from("document_templates")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return { id: created.id };
  });

export const publishTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { error } = await supabase
      .from("document_templates")
      .update({ status: "published", published_at: new Date().toISOString(), published_by: userId })
      .eq("id", data.id)
      .eq("tenant_id", tenant_id)
      .eq("status", "draft");
    if (error) throw error;
    return { ok: true };
  });

export const archiveTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { error } = await supabase
      .from("document_templates")
      .update({ status: "archived" })
      .eq("id", data.id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;
    return { ok: true };
  });

export const cloneTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { data: src } = await supabase
      .from("document_templates")
      .select("*")
      .eq("id", data.id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    if (!src) throw new Error("Not found");
    const root = src.parent_template_id ?? src.id;
    const { data: max } = await supabase
      .from("document_templates")
      .select("version")
      .or(`id.eq.${root},parent_template_id.eq.${root}`)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = (max?.version ?? src.version) + 1;
    const { data: created, error } = await supabase
      .from("document_templates")
      .insert({
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
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: created.id };
  });

// =============================================================================
// ENVELOPES (admin send + tracking)
// =============================================================================

const CountersignerSchema = z
  .object({
    employee_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    email: z.string().email().max(255).optional(),
    name: z.string().min(1).max(200).optional(),
    role: z.string().max(100).optional(),
  })
  .optional();

const SendEnvelopeSchema = z.object({
  template_id: z.string().uuid().optional(),
  doc_type: z
    .enum(["employment_contract", "offer_letter", "policy", "hr_letter", "other"])
    .optional(),
  subject: z.string().trim().min(1).max(300),
  body_html: z.string().max(200_000).optional(),
  recipients: z
    .array(
      z.object({
        employee_id: z.string().uuid().optional(),
        email: z.string().email().max(255).optional(),
        name: z.string().min(1).max(200).optional(),
        merge_values: z.record(z.string(), z.string().max(2000)).default({}),
      }),
    )
    .min(1)
    .max(500),
  due_days: z.number().int().min(1).max(365).optional(),
  requires_signature: z.boolean().optional(),
  countersigner: CountersignerSchema,
  require_geofence: z.boolean().optional(),
  allowed_geofence_ids: z.array(z.string().uuid()).max(20).optional(),
});

export const sendEnvelopes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendEnvelopeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);

    let tpl: any = null;
    if (data.template_id) {
      const { data: t } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", data.template_id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();
      if (!t) throw new Error("Template not found");
      if (t.status !== "published") throw new Error("Template must be published to send");
      tpl = t;
    }
    const bodyTemplate = sanitizeHtml(data.body_html ?? tpl?.body_html ?? "");
    if (!bodyTemplate) throw new Error("Body is required");
    const doc_type = (data.doc_type ?? tpl?.doc_type ?? "other") as any;
    const requires_signature = data.requires_signature ?? tpl?.requires_signature ?? true;
    const dueDays = data.due_days ?? tpl?.default_due_days ?? 14;
    const due_date = new Date(Date.now() + dueDays * 86400_000).toISOString().slice(0, 10);
    const batch_id = crypto.randomUUID();

    // Resolve countersigner (apply to all envelopes in batch)
    let countersigner: {
      user_id: string | null;
      employee_id: string | null;
      email: string;
      name: string;
      role: string;
    } | null = null;
    if (data.countersigner) {
      const cs = data.countersigner;
      let resolvedEmail = cs.email ?? null;
      let resolvedName = cs.name ?? null;
      let resolvedUser = cs.user_id ?? null;
      let resolvedEmp = cs.employee_id ?? null;
      if (cs.employee_id) {
        const { data: e } = await supabase
          .from("employees")
          .select("id,first_name,last_name,email,user_id")
          .eq("id", cs.employee_id)
          .eq("tenant_id", tenant_id)
          .maybeSingle();
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
          role: cs.role ?? tpl?.countersigner_role ?? "countersigner",
        };
      }
    }
    const requires_countersign = !!countersigner || tpl?.requires_countersign || false;

    const admin = await loadAdmin();
    const created: string[] = [];
    const origin = siteOrigin();

    // Resolve admin email (envelope creator) once for notifications
    const { data: adminProfile } = await admin
      .from("profiles")
      .select("email,full_name")
      .eq("id", userId)
      .maybeSingle();

    for (const r of data.recipients) {
      let employee: any = null;
      if (r.employee_id) {
        const { data: e } = await supabase
          .from("employees")
          .select("id,first_name,last_name,email,user_id,tenant_id,job_title")
          .eq("id", r.employee_id)
          .eq("tenant_id", tenant_id)
          .maybeSingle();
        if (!e) continue;
        employee = e;
      }
      const recipient_email = employee?.email ?? r.email;
      const recipient_name =
        r.name ?? (employee ? `${employee.first_name} ${employee.last_name}` : null);
      if (!recipient_email || !recipient_name) continue;

      const merge_values = {
        ...(employee
          ? {
              "employee.first_name": employee.first_name,
              "employee.last_name": employee.last_name,
              "employee.full_name": `${employee.first_name} ${employee.last_name}`,
              "employee.email": employee.email,
              "employee.job_title": employee.job_title ?? "",
            }
          : {}),
        today: new Date().toISOString().slice(0, 10),
        ...r.merge_values,
      };

      const rendered = applyMergeFields(bodyTemplate, merge_values);

      const { data: env, error } = await admin
        .from("document_envelopes")
        .insert({
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
          sent_at: new Date().toISOString(),
          created_by: userId,
          bulk_batch_id: batch_id,
          require_geofence: data.require_geofence ?? false,
          allowed_geofence_ids: data.allowed_geofence_ids ?? [],
        })
        .select("id")
        .single();
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
        status: "pending",
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
          status: "pending",
        });
      }

      await logEvent({
        envelope_id: env.id,
        tenant_id,
        event: "envelope_sent",
        actor_user_id: userId,
        metadata: { recipient: recipient_email, countersigner: countersigner?.email ?? null },
      });
      created.push(env.id);

      // Email signer (sequential — countersigner notified after primary signs)
      await sendDocEmail(
        "document-sent",
        recipient_email,
        {
          recipientName: recipient_name,
          subject: data.subject,
          docType: doc_type,
          dueDate: due_date,
          signUrl: `${origin}/sign/${env.id}`,
          senderName: adminProfile?.full_name ?? "Your organisation",
        },
        `envsend:${env.id}`,
      );
    }
    return { created: created.length, batch_id };
  });

export const listEnvelopes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.string().optional(),
        doc_type: z.string().optional(),
        search: z.string().max(200).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    let q = supabase
      .from("document_envelopes")
      .select(
        "id,subject,doc_type,status,recipient_name,recipient_email,due_date,sent_at,completed_at,created_at,employee:employees(id,first_name,last_name)",
      )
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("status", data.status);
    if (data.doc_type) q = q.eq("doc_type", data.doc_type);
    if (data.search) q = q.ilike("recipient_name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { envelopes: rows ?? [] };
  });

export const getEnvelope = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: env, error } = await supabase
      .from("document_envelopes")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!env) throw new Error("Not found");
    const [signers, events] = await Promise.all([
      supabase
        .from("document_signers")
        .select(
          "id,order_index,role,signer_name,signer_email,signer_user_id,status,viewed_at,signed_at,signature_method",
        )
        .eq("envelope_id", env.id)
        .order("order_index"),
      supabase
        .from("document_events")
        .select("id,event,actor_email,ip,created_at,metadata")
        .eq("envelope_id", env.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    return { envelope: env, signers: signers.data ?? [], events: events.data ?? [] };
  });

export const cancelEnvelope = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; reason?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        reason: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { error } = await supabase
      .from("document_envelopes")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancel_reason: data.reason ?? null,
      })
      .eq("id", data.id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;
    await logEvent({
      envelope_id: data.id,
      tenant_id,
      event: "envelope_cancelled",
      actor_user_id: userId,
      metadata: { reason: data.reason },
    });
    return { ok: true };
  });

// =============================================================================
// SIGNING (employee surface)
// =============================================================================

export const myPendingEnvelopes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data, error } = await supabase
      .from("document_signers")
      .select(
        "id,status,signed_at,envelope:document_envelopes(id,subject,doc_type,status,due_date,sent_at,requires_signature)",
      )
      .eq("signer_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return { items: data ?? [] };
  });

export const getSigningEnvelope = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { envelope_id: string }) =>
    z.object({ envelope_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: signer } = await supabase
      .from("document_signers")
      .select("*")
      .eq("envelope_id", data.envelope_id)
      .eq("signer_user_id", userId)
      .maybeSingle();
    if (!signer) throw new Error("Not authorized");
    const { data: env } = await supabase
      .from("document_envelopes")
      .select("*")
      .eq("id", data.envelope_id)
      .maybeSingle();
    if (!env) throw new Error("Not found");

    if (signer.status === "pending") {
      const admin = await loadAdmin();
      await admin
        .from("document_signers")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", signer.id);
      await admin
        .from("document_envelopes")
        .update({
          status: env.status === "sent" ? "viewed" : env.status,
          first_viewed_at: env.first_viewed_at ?? new Date().toISOString(),
        })
        .eq("id", env.id);
      await logEvent({
        envelope_id: env.id,
        tenant_id: env.tenant_id,
        event: "envelope_viewed",
        actor_user_id: userId,
      });
    }
    return { envelope: env, signer };
  });

const SignSchema = z.object({
  envelope_id: z.string().uuid(),
  method: z.enum(["typed", "drawn", "acknowledged"]),
  typed: z.string().max(200).optional(),
  drawn_svg: z.string().max(200_000).optional(),
  consent: z.literal(true),
  geo: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy_m: z.number().nonnegative().max(100000).optional(),
    })
    .optional(),
});

export const submitSignature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SignSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: signer } = await supabase
      .from("document_signers")
      .select("*")
      .eq("envelope_id", data.envelope_id)
      .eq("signer_user_id", userId)
      .maybeSingle();
    if (!signer) throw new Error("Not authorized");
    if (signer.status === "signed") return { ok: true, already: true };
    if (signer.status === "declined") throw new Error("Already declined");

    if (data.method === "typed" && !data.typed?.trim()) throw new Error("Typed signature required");
    if (data.method === "drawn" && !data.drawn_svg?.trim())
      throw new Error("Drawn signature required");

    const admin = await loadAdmin();

    // ---- Geofence enforcement ----
    const { data: env0 } = await admin
      .from("document_envelopes")
      .select(
        "id,tenant_id,subject,doc_type,created_by,certificate_token,employee_id,require_geofence,allowed_geofence_ids,status",
      )
      .eq("id", data.envelope_id)
      .single();
    let matchedFenceId: string | null = null;
    if (env0?.require_geofence) {
      if (!data.geo)
        throw new Error(
          "Location is required to sign this document. Please allow location access and try again.",
        );
      const ids: string[] = env0.allowed_geofence_ids ?? [];
      if (ids.length === 0)
        throw new Error(
          "No signing locations are configured for this document. Contact your administrator.",
        );
      const { data: fences } = await admin
        .from("sign_geofences")
        .select("id,latitude,longitude,radius_meters,is_active")
        .in("id", ids);
      const { distanceMeters } = await import("@/lib/geofences.functions");
      for (const f of (fences ?? []).filter((x: any) => x.is_active)) {
        const d = distanceMeters(
          Number(f.latitude),
          Number(f.longitude),
          data.geo.latitude,
          data.geo.longitude,
        );
        if (d <= f.radius_meters) {
          matchedFenceId = f.id;
          break;
        }
      }
      if (!matchedFenceId)
        throw new Error("You are outside the permitted signing area. Move on-site and try again.");
    }

    const { ip, ua } = requestContext();
    const now = new Date().toISOString();
    const audit = await hashAudit([
      signer.id,
      userId,
      data.method,
      data.typed ?? "",
      data.drawn_svg ?? "",
      ip,
      ua,
      now,
      data.geo ? `${data.geo.latitude},${data.geo.longitude}` : "",
    ]);

    await admin
      .from("document_signers")
      .update({
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
        signature_geofence_id: matchedFenceId,
      })
      .eq("id", signer.id);

    const { data: env } = await admin
      .from("document_envelopes")
      .select("*")
      .eq("id", data.envelope_id)
      .maybeSingle();
    const { data: allSigners } = await admin
      .from("document_signers")
      .select("*")
      .eq("envelope_id", data.envelope_id)
      .order("order_index");
    const allDone = (allSigners ?? []).every((r: any) => r.status === "signed");
    const remaining = (allSigners ?? []).filter((r: any) => r.status !== "signed").length;
    const origin = siteOrigin();

    // Notify envelope creator (admin) about each signature
    let adminEmail: string | null = null;
    if (env?.created_by) {
      const { data: adm } = await admin
        .from("profiles")
        .select("email")
        .eq("id", env.created_by)
        .maybeSingle();
      adminEmail = adm?.email ?? null;
    }
    if (adminEmail) {
      await sendDocEmail(
        "document-signed",
        adminEmail,
        {
          recipientName: "Admin",
          signerName: signer.signer_name,
          subject: env?.subject,
          docType: env?.doc_type,
          signedAt: new Date(now).toLocaleString(),
          envelopeUrl: `${origin}/org/documents/envelope/${data.envelope_id}`,
          remainingSigners: remaining,
        },
        `envsigned:${signer.id}`,
      );
    }

    if (allDone && env) {
      // Build watermarked signed certificate HTML and store
      const { data: events } = await admin
        .from("document_events")
        .select("event,actor_email,ip,created_at,metadata")
        .eq("envelope_id", data.envelope_id)
        .order("created_at", { ascending: true });
      const completedAt = now;
      const finalAuditHash = await hashAudit([
        env.id,
        completedAt,
        ...(allSigners ?? []).map((s: any) => `${s.id}:${s.audit_hash ?? ""}`),
      ]);
      const cert = buildCertificateHtml({
        envelope: { ...env, completed_at: completedAt },
        signers: allSigners ?? [],
        events: events ?? [],
        audit_hash: finalAuditHash,
      });
      const certToken = env.certificate_token ?? genToken();
      await admin
        .from("document_envelopes")
        .update({
          status: "completed",
          completed_at: completedAt,
          signed_certificate_html: cert,
          certificate_token: certToken,
          signed_document_path: `certificate:${certToken}`,
        })
        .eq("id", data.envelope_id);

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
          source_envelope_id: env.id,
        });
      }
      await logEvent({
        envelope_id: data.envelope_id,
        tenant_id: signer.tenant_id,
        event: "envelope_completed",
        actor_user_id: userId,
        metadata: { audit_hash: finalAuditHash },
      });

      // Email all signers + admin a completion notice with link to signed copy
      const certUrl = `${origin}/sign/certificate/${certToken}`;
      const recipients = new Set<string>();
      (allSigners ?? []).forEach((s: any) => s.signer_email && recipients.add(s.signer_email));
      if (adminEmail) recipients.add(adminEmail);
      for (const to of recipients) {
        await sendDocEmail(
          "document-completed",
          to,
          {
            recipientName: "",
            subject: env.subject,
            docType: env.doc_type,
            completedAt: new Date(completedAt).toLocaleString(),
            certificateUrl: certUrl,
          },
          `envdone:${data.envelope_id}:${to}`,
        );
      }
    } else if (env) {
      // Move to in_progress and notify next pending signer
      const next = (allSigners ?? []).find(
        (s: any) => s.status !== "signed" && s.status !== "declined",
      );
      await admin
        .from("document_envelopes")
        .update({ status: "in_progress" })
        .eq("id", data.envelope_id);
      if (next && next.signer_email) {
        await sendDocEmail(
          "document-sent",
          next.signer_email,
          {
            recipientName: next.signer_name,
            subject: env.subject,
            docType: env.doc_type,
            dueDate: env.due_date,
            signUrl: `${origin}/sign/${env.id}`,
            senderName: "Your organisation",
          },
          `envsend-next:${next.id}`,
        );
      }
    }

    await logEvent({
      envelope_id: data.envelope_id,
      tenant_id: signer.tenant_id,
      event: "envelope_signed",
      actor_user_id: userId,
      metadata: { method: data.method, audit_hash: audit },
    });
    return { ok: true, audit_hash: audit };
  });

export const declineEnvelope = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        envelope_id: z.string().uuid(),
        reason: z.string().max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: signer } = await supabase
      .from("document_signers")
      .select("*")
      .eq("envelope_id", data.envelope_id)
      .eq("signer_user_id", userId)
      .maybeSingle();
    if (!signer) throw new Error("Not authorized");
    const admin = await loadAdmin();
    const now = new Date().toISOString();
    await admin
      .from("document_signers")
      .update({
        status: "declined",
        declined_at: now,
        decline_reason: data.reason,
      })
      .eq("id", signer.id);
    await admin
      .from("document_envelopes")
      .update({ status: "declined" })
      .eq("id", data.envelope_id);
    await logEvent({
      envelope_id: data.envelope_id,
      tenant_id: signer.tenant_id,
      event: "envelope_declined",
      actor_user_id: userId,
      metadata: { reason: data.reason },
    });

    // Notify admin
    const { data: env } = await admin
      .from("document_envelopes")
      .select("subject,doc_type,created_by")
      .eq("id", data.envelope_id)
      .maybeSingle();
    if (env?.created_by) {
      const { data: adm } = await admin
        .from("profiles")
        .select("email")
        .eq("id", env.created_by)
        .maybeSingle();
      if (adm?.email) {
        await sendDocEmail(
          "document-declined",
          adm.email,
          {
            recipientName: "Admin",
            signerName: signer.signer_name,
            subject: env.subject,
            docType: env.doc_type,
            reason: data.reason,
            envelopeUrl: `${siteOrigin()}/org/documents/envelope/${data.envelope_id}`,
          },
          `envdecline:${signer.id}`,
        );
      }
    }
    return { ok: true };
  });

// =============================================================================
// REMINDERS
// =============================================================================

export const sendEnvelopeReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ envelope_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const admin = await loadAdmin();
    const { data: env } = await admin
      .from("document_envelopes")
      .select("*")
      .eq("id", data.envelope_id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    if (!env) throw new Error("Not found");
    if (["completed", "cancelled", "declined", "expired"].includes(env.status))
      throw new Error("Envelope is closed");
    if (
      env.last_reminder_at &&
      Date.now() - new Date(env.last_reminder_at).getTime() < 6 * 3600_000
    ) {
      throw new Error("Please wait at least 6 hours between reminders");
    }
    const { data: signers } = await admin
      .from("document_signers")
      .select("*")
      .eq("envelope_id", data.envelope_id);
    const pending = (signers ?? []).filter(
      (s: any) => s.status !== "signed" && s.status !== "declined",
    );
    if (pending.length === 0) throw new Error("No pending signers");

    const origin = siteOrigin();
    for (const s of pending) {
      await sendDocEmail(
        "document-reminder",
        s.signer_email,
        {
          recipientName: s.signer_name,
          subject: env.subject,
          docType: env.doc_type,
          dueDate: env.due_date,
          signUrl: `${origin}/sign/${env.id}`,
        },
        `envremind:${env.id}:${s.id}:${Date.now()}`,
      );
    }
    await admin
      .from("document_envelopes")
      .update({
        last_reminder_at: new Date().toISOString(),
        reminder_count: (env.reminder_count ?? 0) + 1,
      })
      .eq("id", env.id);
    await logEvent({
      envelope_id: env.id,
      tenant_id,
      event: "reminder_sent",
      actor_user_id: userId,
      metadata: { count: pending.length },
    });
    return { ok: true, reminded: pending.length };
  });

// =============================================================================
// CERTIFICATE (public via unguessable token)
// =============================================================================

export const getCertificate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(20).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const admin = await loadAdmin();
    const { data: env } = await admin
      .from("document_envelopes")
      .select("id,subject,status,completed_at,signed_certificate_html")
      .eq("certificate_token", data.token)
      .maybeSingle();
    if (!env || env.status !== "completed" || !env.signed_certificate_html) {
      throw new Error("Certificate not available");
    }
    return {
      subject: env.subject,
      completed_at: env.completed_at,
      html: env.signed_certificate_html,
    };
  });

// =============================================================================
// MERGE TAG PREVIEW (admin)
// =============================================================================

export const renderTemplatePreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        body_html: z.string().max(200_000),
        sample_values: z.record(z.string(), z.string().max(2000)).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await getOrgAdminTenant(supabase, userId);
    const defaults: Record<string, string> = {
      "employee.first_name": "Alex",
      "employee.last_name": "Sample",
      "employee.full_name": "Alex Sample",
      "employee.email": "alex.sample@example.com",
      "employee.job_title": "Software Engineer",
      "company.name": "Acme Inc.",
      today: new Date().toISOString().slice(0, 10),
    };
    const values = { ...defaults, ...(data.sample_values ?? {}) };
    const rendered = applyMergeFields(sanitizeHtml(data.body_html), values);
    // Extract unresolved tags so the editor can warn the user
    const found = new Set<string>();
    data.body_html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, k) => {
      found.add(k);
      return "";
    });
    const unresolved = Array.from(found).filter((k) => !(k in values));
    return { html: rendered, unresolved, used_values: values };
  });

// =============================================================================
// EMPLOYEE DOCUMENT VERIFICATION (admin)
// =============================================================================

export const listExpiringDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const cutoff = new Date(Date.now() + 60 * 86400_000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("employee_documents")
      .select(
        "id,file_name,category,expiry_date,verification_status,employee:employees(id,first_name,last_name,email)",
      )
      .eq("tenant_id", tenant_id)
      .not("expiry_date", "is", null)
      .lte("expiry_date", cutoff)
      .order("expiry_date", { ascending: true })
      .limit(200);
    if (error) throw error;
    return { documents: data ?? [] };
  });

export const verifyEmployeeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["verified", "rejected", "unverified"]),
        notes: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { error } = await supabase
      .from("employee_documents")
      .update({
        verification_status: data.status,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        verification_notes: data.notes ?? null,
      })
      .eq("id", data.id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;
    return { ok: true };
  });

// =============================================================================
// STARTER TEMPLATE LIBRARY (HRPPL recommended)
// =============================================================================

export const listStarterTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { DOCUMENT_TEMPLATE_PRESETS } = await import("@/lib/document-template-presets");
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
        merge_fields: p.merge_fields,
      })),
    };
  });

// Removed in W5 P3: `getStarterTemplate`.
// Superseded by instantiateStarterTemplate, which resolves the same preset and
// creates the template from it in one step. The templates page calls that.

export const instantiateStarterTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenant_id = await getOrgAdminTenant(supabase, userId);
    const { getPresetByKey } = await import("@/lib/document-template-presets");
    const preset = getPresetByKey(data.key);
    if (!preset) throw new Error("Starter template not found");
    const { data: created, error } = await supabase
      .from("document_templates")
      .insert({
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
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: created.id };
  });
