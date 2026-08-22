import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, z as stringType } from "../_libs/zod.mjs";
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
const getMfaStatus_createServerFn_handler = createServerRpc({
  id: "d0006175a4e9d4f0d33a0a73a987fa1293ea7bc56387c8a8db9488c0d7d5cef5",
  name: "getMfaStatus",
  filename: "src/lib/mfa.functions.ts"
}, (opts) => getMfaStatus.__executeServer(opts));
const getMfaStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMfaStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("profiles").select("mfa_method, mfa_enrolled_at, email").eq("id", userId).maybeSingle();
  return {
    method: data?.mfa_method ?? null,
    enrolledAt: data?.mfa_enrolled_at ?? null,
    email: data?.email ?? null
  };
});
const startEmailMfa_createServerFn_handler = createServerRpc({
  id: "ccb3fc392e3f62f117512375633491672440415e51b57e05c58789c916ea85da",
  name: "startEmailMfa",
  filename: "src/lib/mfa.functions.ts"
}, (opts) => startEmailMfa.__executeServer(opts));
const startEmailMfa = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  purpose: enumType(["enroll", "login"])
}).parse(input)).handler(startEmailMfa_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    hashCode
  } = await import("./mfa.server-DaZAKu-H.mjs");
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("email").eq("id", userId).maybeSingle();
  const email = profile?.email;
  if (!email) throw new Error("No email on profile");
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 6e4).toISOString();
  await supabaseAdmin.from("mfa_email_challenges").update({
    consumed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("user_id", userId).eq("purpose", data.purpose).is("consumed_at", null);
  const {
    error
  } = await supabaseAdmin.from("mfa_email_challenges").insert({
    user_id: userId,
    code_hash: codeHash,
    purpose: data.purpose,
    expires_at: expiresAt
  });
  if (error) throw error;
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  await sendInternalEmail({
    templateName: "mfa-otp-code",
    recipientEmail: email,
    templateData: {
      code,
      purpose: data.purpose,
      expiresInMinutes: 10
    },
    idempotencyKey: `mfa-${userId}-${Date.now()}`
  });
  return {
    ok: true,
    sentTo: email.replace(/(.).+(@.+)/, "$1***$2")
  };
});
const verifyEmailMfa_createServerFn_handler = createServerRpc({
  id: "89ef84d1b03da127c5ea648832c30daef92635551353c45f0cf39583ff126f1d",
  name: "verifyEmailMfa",
  filename: "src/lib/mfa.functions.ts"
}, (opts) => verifyEmailMfa.__executeServer(opts));
const verifyEmailMfa = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  purpose: enumType(["enroll", "login"]),
  code: stringType().regex(/^\d{6}$/)
}).parse(input)).handler(verifyEmailMfa_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    hashCode
  } = await import("./mfa.server-DaZAKu-H.mjs");
  const codeHash = await hashCode(data.code);
  const {
    data: challenge
  } = await supabaseAdmin.from("mfa_email_challenges").select("id, code_hash, expires_at, consumed_at, attempts").eq("user_id", userId).eq("purpose", data.purpose).is("consumed_at", null).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  if (!challenge) throw new Error("No active code. Request a new one.");
  if (new Date(challenge.expires_at) < /* @__PURE__ */ new Date()) throw new Error("Code expired");
  if (challenge.attempts >= 5) {
    await supabaseAdmin.from("mfa_email_challenges").update({
      consumed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", challenge.id);
    throw new Error("Too many attempts. Request a new code.");
  }
  if (challenge.code_hash !== codeHash) {
    await supabaseAdmin.from("mfa_email_challenges").update({
      attempts: challenge.attempts + 1
    }).eq("id", challenge.id);
    throw new Error("Incorrect code");
  }
  await supabaseAdmin.from("mfa_email_challenges").update({
    consumed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", challenge.id);
  if (data.purpose === "enroll") {
    await supabaseAdmin.from("profiles").update({
      mfa_method: "email",
      mfa_enrolled_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
  }
  return {
    ok: true
  };
});
const setTotpEnrolled_createServerFn_handler = createServerRpc({
  id: "190e8a7bfd793c4778792abe5fd4c30440a216e1f5236671476bc9b341a39dd4",
  name: "setTotpEnrolled",
  filename: "src/lib/mfa.functions.ts"
}, (opts) => setTotpEnrolled.__executeServer(opts));
const setTotpEnrolled = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(setTotpEnrolled_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("profiles").update({
    mfa_method: "totp",
    mfa_enrolled_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId);
  if (error) throw new Error(`Could not record TOTP enrollment: ${error.message}`);
  return {
    ok: true
  };
});
export {
  getMfaStatus_createServerFn_handler,
  setTotpEnrolled_createServerFn_handler,
  startEmailMfa_createServerFn_handler,
  verifyEmailMfa_createServerFn_handler
};
