#!/usr/bin/env node
// =============================================================================
// Configure Supabase Auth: redirect URLs, and Resend as the SMTP sender
// =============================================================================
//
// Two settings no migration can carry, and both were still at their defaults on
// the production project after the v1.0.0 release.
//
// -----------------------------------------------------------------------------
// 1. Why the signup link pointed at http://localhost:3000
// -----------------------------------------------------------------------------
//
// The app does the right thing already — signup.tsx:104 sends
// `emailRedirectTo: ${window.location.origin}/org/setup`. GoTrue validates that
// against the project's redirect allowlist, and on a fresh project the
// allowlist is EMPTY, so every redirect the app asks for is rejected and
// silently replaced by Site URL — whose untouched default is
// `http://localhost:3000`. That is where the confirmation link came from. It
// was never a bug in the app; the tell is that the link landed on `/` rather
// than on `/org/setup`.
//
// It fails closed, which is correct of GoTrue — an unvalidated redirect on an
// auth link is how you hand someone else's access token away — but it fails
// silently, which is why it looked like the app's doing.
//
// -----------------------------------------------------------------------------
// 2. Why auth email needs Resend specifically
// -----------------------------------------------------------------------------
//
// Signup confirmations, password resets, magic links and email-change
// confirmations are sent by GoTrue itself, NOT by this codebase. Nothing in
// `src/` can intercept them: `auth_emails` exists as a pgmq queue but has no
// producer anywhere in the repo. So `RESEND_API_KEY` in Vercel does nothing for
// them — the only lever is the project's custom SMTP settings, which is what
// this script writes.
//
// Until custom SMTP is set, a project uses Supabase's shared sender, capped at
// `rate_limit_email_sent` = 2 messages per hour across the whole project, and
// documented as not for production use. Two confirmations an hour is not a
// launch.
//
// Application email (invitations, reminders, payslips) is the other half and
// goes through Vercel's RESEND_API_KEY + EMAIL_FROM. Both halves want the same
// Resend account and the same verified domain; they are configured in two
// different places because they are sent by two different systems.
//
// -----------------------------------------------------------------------------
// Every SMTP value comes from the environment. None is written here.
// -----------------------------------------------------------------------------
//
// An earlier version of this file built the mail block from hard-coded host and
// username strings, with only the password read from the environment. No
// credential was ever committed. But secret scanners match the *shape* — a
// literal host and username sitting beside a password field reads as a pasted
// credential whether the value next to it is a string or a variable reference.
// GitGuardian flagged it, correctly by its own rules.
//
// (This comment avoids naming those fields in their literal form for the same
// reason. A detector cannot tell an explanation from a recurrence.)
//
// Rather than annotate around the detector, the provider-specific values moved
// out of the file entirely. That is better config hygiene anyway: the host,
// port and username are deployment facts, not source code, and hard-coding
// them is what made switching provider a code change.
//
// -----------------------------------------------------------------------------
// Usage
// -----------------------------------------------------------------------------
//
//   # URLs only (safe to run first, changes nothing about email)
//   node scripts/configure-auth.mjs --env prod --urls
//
//   # URLs + SMTP. Reads SMTP_* from .env — never pass a secret on the command
//   # line, where it is recorded verbatim in your shell history file.
//   node scripts/configure-auth.mjs --env prod --urls --smtp
//
//   # See what is currently set, change nothing
//   node scripts/configure-auth.mjs --env prod --show
//
// Reads SUPABASE_ACCESS_TOKEN from .env (the personal access token, not a
// project key). Pass --dry-run to print the request body without sending it.

import { readFileSync } from "node:fs";

// ---- .env loading (same shape as scripts/apply-migration.mjs) --------------
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* .env is optional when the vars are already exported */
}

const ENVS = {
  prod: {
    ref: "ifitgxscyuabessaoqui",
    // Exact origins only. A wildcard such as `https://hrppl-*.vercel.app/**`
    // would also match a project somebody else creates on Vercel with a name
    // starting `hrppl-`, and a matching redirect on an auth link is a handover
    // of the access token in the URL fragment. Production gets no wildcards.
    siteUrl: "https://hrppl.io",
    allow: [
      "https://hrppl.io/**",
      "https://www.hrppl.io/**",
      "https://hrppl.vercel.app/**",
    ],
  },
  dev: {
    ref: "xnrjfrxzahmfdrqfsnnq",
    // Local development is where this project's Site URL should point: it is
    // the fallback used when a redirect fails to match, and on the development
    // project the person hitting that case is almost always on localhost.
    siteUrl: "http://localhost:8080",
    // Preview deployments get a generated hostname per branch and per commit,
    // so exact entries are impossible here. The wildcard is acceptable on THIS
    // project and not on production: it holds demo data, and a token minted
    // against it grants nothing real.
    allow: [
      "http://localhost:8080/**",
      "https://hrppl-*.vercel.app/**",
    ],
  },
};

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const envName = val("--env");
const target = ENVS[envName];
if (!target) {
  console.error(`Usage: --env <prod|dev> [--show] [--urls] [--smtp] [--dry-run]`);
  process.exit(1);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is not set (expected in .env).");
  process.exit(1);
}

const API = `https://api.supabase.com/v1/projects/${target.ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function show() {
  const res = await fetch(API, { headers });
  if (!res.ok) { console.error(`GET failed: ${res.status} ${await res.text()}`); process.exit(1); }
  const d = await res.json();
  const keys = ["site_url", "uri_allow_list", "smtp_host", "smtp_port", "smtp_user",
                "smtp_sender_name", "smtp_admin_email", "rate_limit_email_sent",
                "mailer_autoconfirm", "external_google_enabled"];
  console.log(`\n${envName} (${target.ref}):`);
  for (const k of keys) console.log(`  ${k.padEnd(24)} ${JSON.stringify(d[k] ?? null)}`);
  if (!d.smtp_host) {
    console.log(`\n  NOTE: no custom SMTP -> Supabase's shared sender, capped at`);
    console.log(`        ${d.rate_limit_email_sent} emails per hour for the whole project.`);
  }
  console.log();
}

// Every SMTP field, and where it comes from. Nothing provider-specific is
// written in this file — see the header. `.env.example` lists the same names
// with the values a Resend account wants.
//
// SMTP_PASS falls back to RESEND_API_KEY because with Resend they are the same
// secret: the SMTP password IS the API key. Keeping the fallback means one
// value to set for both halves of the mail setup, while still allowing two
// distinct keys if you would rather revoke them independently.
const SMTP_FIELDS = [
  { api: "smtp_host",             env: "SMTP_HOST",         required: true,  hint: "your provider's SMTP hostname" },
  { api: "smtp_port",             env: "SMTP_PORT",         required: true,  hint: "465 for implicit TLS, or 587", string: true },
  { api: "smtp_user",             env: "SMTP_USER",         required: true,  hint: "SMTP username (provider-specific, often not an email)" },
  { api: "smtp_pass",             env: "SMTP_PASS",         required: true,  hint: "SMTP password / API key", secret: true, fallback: "RESEND_API_KEY" },
  { api: "smtp_admin_email",      env: "SMTP_ADMIN_EMAIL",  required: true,  hint: "From: address, on a domain verified with your provider" },
  { api: "smtp_sender_name",      env: "SMTP_SENDER_NAME",  required: false, hint: "display name on outgoing mail" },
  { api: "rate_limit_email_sent", env: "SMTP_RATE_LIMIT",   required: false, hint: "messages/hour (default 30)", number: true, default: "30" },
];

// Lookup order for every field: PROD_/DEV_ prefixed first, then the bare name,
// then the cross-provider fallback, then the default.
//
// The prefix exists because the identity fields genuinely differ per
// environment while the secret usually does not. Without it, a single
// SMTP_SENDER_NAME in .env applies to both — and since .env is a development
// file, `--env prod` quietly stamps production invitations with whatever
// display name local testing left there. The recipient sees it; nothing else
// does.
function lookup(f) {
  const prefixed = `${envName.toUpperCase()}_${f.env}`;
  return (
    process.env[prefixed] ??
    process.env[f.env] ??
    (f.fallback ? process.env[f.fallback] : undefined) ??
    f.default
  );
}

function resolveSmtpFromEnv() {
  const body = {};
  const missing = [];
  for (const f of SMTP_FIELDS) {
    const raw = lookup(f);
    if (raw === undefined || raw === "") {
      if (f.required) missing.push(f);
      continue;
    }
    // smtp_port must go out as a STRING even though GET returns a number;
    // rate_limit_email_sent is the reverse. See patchOnce().
    body[f.api] = f.number ? Number(raw) : f.string ? String(raw) : raw;
  }
  return { body, missing };
}

// The PATCH is atomic, so one rejected field discards every other field in the
// same request. Sending the URLs and the SMTP block as SEPARATE requests means a
// problem with the mail settings cannot also throw away the redirect allowlist —
// which is exactly what happened when smtp_port went out as a number: a 400 on
// one field, and site_url silently left at its localhost default.
function buildPatches() {
  const patches = [];
  if (flag("--urls")) {
    patches.push({
      label: "redirect URLs",
      body: { site_url: target.siteUrl, uri_allow_list: target.allow.join(",") },
    });
  }
  if (flag("--smtp")) {
    const { body, missing } = resolveSmtpFromEnv();
    if (missing.length) {
      console.error(
        `\n--smtp is missing required environment variables:\n` +
          missing.map((m) => `  ${m.env.padEnd(18)} ${m.hint}`).join("\n") +
          `\n\nSet them in .env (gitignored) — see .env.example. Do NOT pass them\n` +
          `inline on the command line; your shell records that verbatim.\n`,
      );
      process.exit(1);
    }
    patches.push({ label: "SMTP", body });
  }
  return patches;
}

// Redact every field marked secret, not just the one we happen to remember.
// The printed body is the thing most likely to end up pasted into a chat or an
// issue, which is how a value that was correctly kept out of git leaks anyway.
function redact(body) {
  const out = { ...body };
  for (const f of SMTP_FIELDS) {
    if (f.secret && out[f.api]) {
      const v = String(out[f.api]);
      out[f.api] = `***${v.length > 4 ? v.slice(-4) : ""} (${v.length} chars)`;
    }
  }
  return out;
}

/**
 * Send one PATCH, and on a type-validation 400 coerce the named field and retry
 * exactly once.
 *
 * This exists because the Management API's GET returns `smtp_port` as a NUMBER
 * and its PATCH requires a STRING — so the value you read back is not a value
 * you can write, and the error surfaces only at request time. Bounded to one
 * retry and to type coercion alone: it will not invent a value, and any other
 * 400 is reported untouched rather than retried into a different shape.
 */
async function patchOnce(label, body) {
  const send = (b) =>
    fetch(API, { method: "PATCH", headers, body: JSON.stringify(b) });

  let res = await send(body);
  if (res.ok) return { ok: true, body };

  const text = await res.text();
  const m = text.match(/"?([a-z_]+)"?: Invalid input: expected (string|number)/i);
  if (res.status === 400 && m) {
    const [, field, want] = m;
    const current = body[field];
    if (current !== undefined) {
      const coerced = want === "string" ? String(current) : Number(current);
      console.log(`  ${label}: API wants ${field} as ${want}; retrying with ${JSON.stringify(coerced)}`);
      const retryBody = { ...body, [field]: coerced };
      res = await send(retryBody);
      if (res.ok) return { ok: true, body: retryBody };
      return { ok: false, status: res.status, text: await res.text() };
    }
  }
  return { ok: false, status: res.status, text };
}

async function main() {
  if (flag("--show") || (!flag("--urls") && !flag("--smtp"))) return show();

  const patches = buildPatches();
  console.log(`\n${envName} (${target.ref}) — ${patches.length} request(s):`);
  for (const { label, body } of patches) {
    console.log(`\n  [${label}]`);
    console.log(JSON.stringify(redact(body), null, 2).split("\n").map((l) => "  " + l).join("\n"));
  }

  if (flag("--dry-run")) { console.log("\n--dry-run: nothing sent.\n"); return; }

  let failed = 0;
  for (const { label, body } of patches) {
    const r = await patchOnce(label, body);
    if (r.ok) {
      console.log(`  ${label}: OK`);
    } else {
      failed++;
      console.error(`  ${label}: FAILED ${r.status} ${r.text}`);
    }
  }

  // Report the live state either way. A partial apply is the likely outcome of
  // a failure here, and guessing which half landed is how a project ends up
  // with mail configured and redirects still pointing at localhost.
  console.log("\nRe-reading to confirm:");
  await show();
  if (failed) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
