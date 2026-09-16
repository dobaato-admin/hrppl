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
// Usage
// -----------------------------------------------------------------------------
//
//   # URLs only (safe to run first, changes nothing about email)
//   node scripts/configure-auth.mjs --env prod --urls
//
//   # URLs + point GoTrue at Resend's SMTP
//   RESEND_API_KEY=re_xxx node scripts/configure-auth.mjs --env prod --urls --smtp
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

function buildPatch() {
  const patch = {};
  if (flag("--urls")) {
    patch.site_url = target.siteUrl;
    patch.uri_allow_list = target.allow.join(",");
  }
  if (flag("--smtp")) {
    const key = process.env.RESEND_API_KEY;
    if (!key) { console.error("--smtp needs RESEND_API_KEY in the environment."); process.exit(1); }
    const from = process.env.EMAIL_FROM_ADDRESS || "noreply@hrppl.io";
    Object.assign(patch, {
      smtp_host: "smtp.resend.com",
      // 465 with implicit TLS. Port 587 also works; 25 is blocked by most
      // hosts and by Supabase.
      smtp_port: 465,
      // Resend's SMTP username is the literal string "resend" for every
      // account — the API key is the password. Putting the key in the username
      // authenticates as nobody and fails with a generic 535.
      smtp_user: "resend",
      smtp_pass: key,
      smtp_admin_email: from,
      smtp_sender_name: process.env.EMAIL_FROM_NAME || "hrppl",
      // Supabase's own limit exists because the shared sender is shared. On a
      // dedicated Resend account it is just a throttle; 30/hour still absorbs
      // an onboarding batch without letting a loop empty the quota.
      rate_limit_email_sent: 30,
    });
  }
  return patch;
}

async function main() {
  if (flag("--show") || (!flag("--urls") && !flag("--smtp"))) return show();

  const patch = buildPatch();
  const redacted = { ...patch };
  if (redacted.smtp_pass) redacted.smtp_pass = `re_***${String(patch.smtp_pass).slice(-4)}`;
  console.log(`\nPATCH ${envName} (${target.ref}):`);
  console.log(JSON.stringify(redacted, null, 2));

  if (flag("--dry-run")) { console.log("\n--dry-run: not sent.\n"); return; }

  const res = await fetch(API, { method: "PATCH", headers, body: JSON.stringify(patch) });
  const text = await res.text();
  if (!res.ok) { console.error(`\nFAILED ${res.status}: ${text}`); process.exit(1); }
  console.log("\nOK. Re-reading to confirm:");
  await show();
}

main().catch((e) => { console.error(e); process.exit(1); });
