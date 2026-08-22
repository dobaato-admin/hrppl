import { supabaseAdmin } from "./client.server-D5ro3rAQ.mjs";
import { sendInternalEmail } from "./send-internal.server-9cG3k97B.mjs";
import "../_libs/react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "node:stream";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
const BILLING_OPS_URL = "https://hrppl.io/admin/billing-ops";
async function raiseBillingAlert(input) {
  const severity = input.severity ?? "error";
  if (input.idempotencyKey) {
    const { data: existing } = await supabaseAdmin.from("billing_admin_alerts").select("id, suppressed").eq("idempotency_key", input.idempotencyKey).maybeSingle();
    if (existing) return { id: existing.id, created: false, suppressed: !!existing.suppressed };
  }
  const suppressed = await isAlertSuppressed(input.tenant_id ?? null, input.alert_type);
  const policy = await getRetryPolicy(input.alert_type);
  const nextRetryAt = policy?.enabled ? new Date(Date.now() + (policy.backoff_seconds ?? 300) * 1e3).toISOString() : null;
  const { data: row, error } = await supabaseAdmin.from("billing_admin_alerts").insert({
    tenant_id: input.tenant_id ?? null,
    alert_type: input.alert_type,
    severity,
    title: input.title,
    message: input.message ?? null,
    context: input.context ?? {},
    idempotency_key: input.idempotencyKey ?? null,
    suppressed,
    next_retry_at: nextRetryAt
  }).select("id").single();
  if (error || !row) {
    console.error("[raiseBillingAlert] insert failed", error);
    throw error ?? new Error("failed to insert alert");
  }
  const alertId = row.id;
  if (!suppressed) {
    try {
      await notifySuperAdminsForAlert(alertId, input);
    } catch (e) {
      console.error("[raiseBillingAlert] notify failed", e);
    }
  }
  return { id: alertId, created: true, suppressed };
}
async function isAlertSuppressed(tenantId, alertType) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const { data } = await supabaseAdmin.from("billing_alert_suppressions").select("tenant_id, alert_type, expires_at");
  for (const r of data ?? []) {
    const typeMatch = !r.alert_type || r.alert_type === alertType;
    const tenantMatch = !r.tenant_id || r.tenant_id === tenantId;
    const notExpired = !r.expires_at || r.expires_at > nowIso;
    if (typeMatch && tenantMatch && notExpired) return true;
  }
  return false;
}
async function getRetryPolicy(alertType) {
  const { data } = await supabaseAdmin.from("billing_alert_retry_policies").select("*").eq("alert_type", alertType).maybeSingle();
  return data ?? null;
}
function computeNextRetryAt(policy, attempt) {
  if (!policy?.enabled) return null;
  if (attempt >= (policy.max_attempts ?? 3)) return null;
  const base = policy.backoff_seconds ?? 300;
  const mult = Number(policy.backoff_multiplier ?? 2);
  const max = policy.max_backoff_seconds ?? 86400;
  const delay = Math.min(max, Math.round(base * Math.pow(mult, Math.max(0, attempt))));
  return new Date(Date.now() + delay * 1e3).toISOString();
}
async function notifySuperAdminsForAlert(alertId, input) {
  let tenantName;
  if (input.tenant_id) {
    const { data: t } = await supabaseAdmin.from("tenants").select("name").eq("id", input.tenant_id).maybeSingle();
    tenantName = t?.name;
  }
  const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "super_admin");
  const ids = (roles ?? []).map((r) => r.user_id);
  if (!ids.length) return;
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email, full_name").in("id", ids);
  const retryUrl = `${BILLING_OPS_URL}?alert=${alertId}`;
  const period = input.context?.year && input.context?.month ? `${input.context.year}-${String(input.context.month).padStart(2, "0")}` : void 0;
  const inAppRows = ids.map((uid) => ({
    user_id: uid,
    kind: "billing_alert",
    title: input.title,
    body: input.message ?? "",
    link: retryUrl,
    metadata: { alert_id: alertId, alert_type: input.alert_type, severity: input.severity ?? "error" }
  }));
  await supabaseAdmin.from("in_app_notifications").insert(inAppRows).then(
    () => void 0,
    (e) => console.error("[notifySuperAdmins] in-app insert failed", e)
  );
  for (const p of profiles ?? []) {
    const email = p.email;
    if (!email) continue;
    await sendInternalEmail({
      templateName: "billing-ops-alert",
      recipientEmail: email,
      idempotencyKey: `billing-alert:${alertId}:${p.id}`,
      templateData: {
        recipientName: p.full_name ?? "Admin",
        tenantName,
        alertType: input.alert_type,
        severity: input.severity ?? "error",
        title: input.title,
        message: input.message,
        failureReason: input.message,
        retryUrl,
        occurredAt: (/* @__PURE__ */ new Date()).toISOString(),
        period
      }
    });
  }
  await supabaseAdmin.from("billing_admin_alerts").update({ notified_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", alertId);
}
async function logBillingOpsAudit(input) {
  try {
    await supabaseAdmin.from("billing_ops_audit").insert({
      actor_user_id: input.actor_user_id ?? null,
      actor_email: input.actor_email ?? null,
      action: input.action,
      target_type: input.target_type ?? null,
      target_id: input.target_id ?? null,
      tenant_id: input.tenant_id ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? {}
    });
  } catch (e) {
    console.error("[logBillingOpsAudit] failed", e);
  }
}
export {
  computeNextRetryAt,
  getRetryPolicy,
  logBillingOpsAudit,
  raiseBillingAlert
};
