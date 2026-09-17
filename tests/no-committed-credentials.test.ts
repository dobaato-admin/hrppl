import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// =============================================================================
// Credentials must not be reconstructible from the repository
// =============================================================================
//
// Written after GitGuardian flagged `scripts/configure-auth.mjs`. Its finding
// was a false positive on the value — the password was always read from the
// environment and nothing secret was ever committed — but it was a true
// positive on the *shape*: a literal mail host and username sitting beside a
// password field is indistinguishable from a pasted credential, and a scanner
// cannot tell which it is looking at.
//
// Two things are checked, for two different reasons:
//
//   1. No secret-shaped literal in any tracked file. The real protection.
//   2. No credential-shaped literal in the mail config path. Keeps the scanner
//      quiet, which matters because an alert people learn to dismiss is worse
//      than no alert — the next one will be real and will look identical.
//
// `.env.example` is deliberately in scope. It is the one env file that IS
// committed, which makes it the single most likely place for a real value to
// be typed by accident.

const ROOT = new URL("..", import.meta.url).pathname;

const SCAN_DIRS = ["src", "scripts", "tests", "supabase/migrations", ".github"];
const SCAN_FILES = [".env.example", "vercel.json", "package.json"];
const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".woff", ".woff2", ".lock"]);

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === ".git" || e === "dist" || e === ".vercel") continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (![...SKIP_EXT].some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

function targetFiles(): string[] {
  const files: string[] = [];
  for (const d of SCAN_DIRS) walk(join(ROOT, d), files);
  for (const f of SCAN_FILES) {
    try {
      statSync(join(ROOT, f));
      files.push(join(ROOT, f));
    } catch {
      /* optional */
    }
  }
  return files;
}

// Provider key formats. Each is anchored on its own prefix so that ordinary
// identifiers cannot match — an earlier, looser version of this scan matched
// `require_lessons_before_quiz` on the substring `re_`.
const SECRET_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{10,}/ },
  { name: "Supabase service-role / JWT", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: "Supabase secret key", re: /\bsb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: "Supabase personal access token", re: /\bsbp_[a-f0-9]{40}/ },
  { name: "Stripe secret key", re: /\bsk_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: "Google API key", re: /\bAIza[A-Za-z0-9_-]{30,}/ },
  { name: "AWS access key id", re: /\bAKIA[A-Z0-9]{16}\b/ },
  { name: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: "Private key block", re: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
];

describe("no committed credentials", () => {
  it("contains no provider secret in any scanned file", () => {
    const hits: string[] = [];
    for (const file of targetFiles()) {
      let content: string;
      try {
        content = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      // This test file necessarily contains the patterns it searches for.
      if (file.endsWith("no-committed-credentials.test.ts")) continue;
      for (const { name, re } of SECRET_PATTERNS) {
        const m = content.match(re);
        if (m) hits.push(`${relative(ROOT, file)}: ${name} -> ${m[0].slice(0, 12)}…`);
      }
    }
    expect(hits, `Secret-shaped literals found:\n${hits.join("\n")}`).toEqual([]);
  });

  it("keeps .env.example free of values", () => {
    let content: string;
    try {
      content = readFileSync(join(ROOT, ".env.example"), "utf8");
    } catch {
      return; // absence is handled by the repo, not by this assertion
    }
    // A committed example file with a filled-in value is the failure mode this
    // guards: it looks like documentation and reads like a credential store.
    const filled = content
      .split("\n")
      .filter((l) => /^[A-Z][A-Z0-9_]*=.+$/.test(l.trim()))
      .map((l) => l.trim());
    expect(filled, `.env.example must list names only:\n${filled.join("\n")}`).toEqual([]);
  });

  it("builds SMTP settings from the environment, not from literals", () => {
    const file = join(ROOT, "scripts/configure-auth.mjs");
    let content: string;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      return;
    }
    // Strip line comments only: the file explains this rule, and an explanation
    // must not be able to fail the rule it describes. That mistake has been made
    // three times elsewhere in this suite.
    //
    // Block-comment stripping is deliberately NOT done, and the reason is worth
    // recording. A `/\*[\s\S]*?\*\/` pass looks obviously correct until the file
    // being scanned contains a URL glob — this one holds
    // `https://hrppl.io/**` in the redirect allowlist. The `/*` inside that
    // string opens a comment the scanner never intended, and it runs to the next
    // `*/` anywhere in the file: eight `/*` against two `*/` here, which silently
    // deleted 11,615 of 13,817 characters and made this guard pass against a
    // file with a hard-coded credential in it. A guard that cannot fail is worse
    // than no guard, because it is reported as evidence.
    const code = content
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
      .join("\n");

    // A quoted hostname or username next to a password field is the pattern a
    // scanner reads as a credential, regardless of the value's provenance.
    const literalHost = /smtp_host\s*:\s*["'`]/.test(code);
    const literalUser = /smtp_user\s*:\s*["'`]/.test(code);
    const literalPass = /smtp_pass\s*:\s*["'`][^"'`$]/.test(code);

    expect(
      { literalHost, literalUser, literalPass },
      "SMTP settings must come from environment variables. See the header of " +
        "scripts/configure-auth.mjs — hard-coding host/username beside a " +
        "password field is what triggered the original GitGuardian alert.",
    ).toEqual({ literalHost: false, literalUser: false, literalPass: false });

    // And the values must actually be sourced from env.
    expect(code).toMatch(/process\.env\[/);
  });
});
