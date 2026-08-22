import { r as reactExports } from "../_libs/react.mjs";
import { render } from "../_libs/react-email__render.mjs";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.mjs";
import { TEMPLATES } from "./registry-Y5CZHtkF.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
const SITE_NAME = "global-payroll-bliss";
const SENDER_DOMAIN = "notify.hrppl.io";
const FROM_DOMAIN = "hrppl.io";
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function isOptedOut(email, key) {
  try {
    const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile?.id) return false;
    const { data: pref } = await supabaseAdmin.from("notification_preferences").select(key).eq("user_id", profile.id).maybeSingle();
    if (!pref) return false;
    return pref[key] === false;
  } catch {
    return false;
  }
}
async function sendInternalEmail(input) {
  try {
    const template = TEMPLATES[input.templateName];
    if (!template) {
      console.error("[email.internal] Unknown template", input.templateName);
      return;
    }
    const recipient = template.to || input.recipientEmail;
    if (!recipient) return;
    const normalized = recipient.toLowerCase();
    const messageId = crypto.randomUUID();
    const idempotencyKey = input.idempotencyKey || messageId;
    const data = input.templateData || {};
    const { data: suppressed } = await supabaseAdmin.from("suppressed_emails").select("id").eq("email", normalized).maybeSingle();
    if (suppressed) {
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: input.templateName,
        recipient_email: recipient,
        status: "suppressed"
      });
      return;
    }
    if (input.preferenceKey && await isOptedOut(normalized, input.preferenceKey)) {
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: input.templateName,
        recipient_email: recipient,
        status: "suppressed",
        error_message: `Opted out: ${input.preferenceKey}`
      });
      return;
    }
    let unsubscribeToken = null;
    const { data: existing } = await supabaseAdmin.from("email_unsubscribe_tokens").select("token, used_at").eq("email", normalized).maybeSingle();
    if (existing && !existing.used_at) {
      unsubscribeToken = existing.token;
    } else if (!existing) {
      unsubscribeToken = generateToken();
      await supabaseAdmin.from("email_unsubscribe_tokens").upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: "email", ignoreDuplicates: true }
      );
      const { data: stored } = await supabaseAdmin.from("email_unsubscribe_tokens").select("token").eq("email", normalized).maybeSingle();
      if (stored) unsubscribeToken = stored.token;
    } else {
      return;
    }
    const element = reactExports.createElement(template.component, data);
    const html = await render(element);
    const plainText = await render(element, { plainText: true });
    const subject = typeof template.subject === "function" ? template.subject(data) : template.subject;
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: input.templateName,
      recipient_email: recipient,
      status: "pending"
    });
    const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: recipient,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text: plainText,
        purpose: "transactional",
        label: input.templateName,
        idempotency_key: idempotencyKey,
        unsubscribe_token: unsubscribeToken,
        queued_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    if (enqueueError) {
      console.error("[email.internal] enqueue failed", enqueueError);
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: input.templateName,
        recipient_email: recipient,
        status: "failed",
        error_message: "Failed to enqueue email"
      });
    }
  } catch (err) {
    console.error("[email.internal] unexpected error", err);
  }
}
export {
  sendInternalEmail
};
