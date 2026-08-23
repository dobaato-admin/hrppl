/**
 * Public webhook/cron endpoints must not echo caught errors back to the caller.
 *
 * `/api/public/hooks/*` authenticates with a bearer secret, not a session, so
 * these handlers are internet-reachable by definition. The errors they catch
 * are Postgres and PostgREST errors, whose messages routinely name tables,
 * columns, constraints and RLS policies — a schema map for anyone probing the
 * endpoint. CodeQL flags the pattern as "Information exposure through a stack
 * trace".
 *
 * The fix was `hookFailure()` in src/lib/hook-response.server.ts: log the full
 * error server-side, return a generic message plus a correlation ref. This test
 * is what stops the old shape coming back the next time someone adds a hook.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const HOOKS_DIR = join(process.cwd(), "src/routes/api/public/hooks");
const files = readdirSync(HOOKS_DIR).filter((f) => f.endsWith(".ts"));

/** Strip comments so prose about the rule cannot trip the rule. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/**
 * A caught value's message assigned to a variable, e.g.
 *   `const message = e instanceof Error ? e.message : String(e);`
 * Deliberately anchored to catch-like identifiers (`e`, `err`, `error`, `ex`) so
 * that `obj.last_payment_error?.message` — Stripe's decline reason, which is
 * meant to reach the tenant — is not mistaken for an internal error.
 */
const ERROR_DERIVED_ASSIGN =
  /(?:const|let|var)\s+(\w+)\s*=\s*[^;\n]*?(?:\b(?:e|err|error|ex)\d?\??\.message|String\(\s*e\w*\s*\))/g;

/** `e.message`, `e?.message`, `error.message`, `String(e)` and friends. */
const LEAKY = /(\w+\??\.message)|String\(\s*e\w*\s*\)/;

/**
 * Response bodies in `src` that carry caught-error detail.
 *
 * Only detail that reaches the *caller* counts — writing `e.message` into an
 * internal table such as `billing_admin_alerts` is exactly where it belongs.
 */
function findings(src: string): string[] {
  const lines = stripComments(src).split("\n");
  const body = lines.join("\n");

  // Names holding an error message. The file CodeQL flagged never put
  // `.message` on the response line at all — it did the assignment above and
  // passed the variable in, so matching only the literal shape reports it clean,
  // which is the one answer this test must never give.
  const aliases = [...body.matchAll(ERROR_DERIVED_ASSIGN)].map((m) => m[1]);
  const aliasRe = aliases.length
    ? new RegExp(`\\b(${aliases.join("|")})\\b`)
    : null;

  const out: string[] = [];
  lines.forEach((text, i) => {
    if (!/new Response\(|Response\.json\(/.test(text)) return;
    // The body often continues onto following lines, so read a small window
    // forward rather than just the call line.
    const window = lines.slice(i, i + 5).join(" ");
    if (LEAKY.test(window) || (aliasRe && aliasRe.test(window))) {
      out.push(`${i + 1}: ${text.trim()}`);
    }
  });
  return out;
}

describe("public hook endpoints do not expose error detail", () => {
  it("finds hook files to check", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  // A scanner that reports everything clean is worse than no scanner, so pin
  // the shapes it must catch. The first fixture is the verbatim body CodeQL
  // flagged in leave-accrual.ts — an earlier version of `findings()` called it
  // clean, because the message is built two lines above the response and only
  // the variable is passed in.
  describe("the detector itself", () => {
    it("catches a message assigned to a variable above the response", () => {
      const src = [
        `function failed(e: unknown) {`,
        `  console.error("[leave-accrual] failed", e);`,
        `  const message = e instanceof Error ? e.message : String(e);`,
        `  return new Response(JSON.stringify({ ok: false, error: message }), {`,
        `    status: 500,`,
        `  });`,
        `}`,
      ].join("\n");
      expect(findings(src)).toHaveLength(1);
    });

    it("catches a message inlined into the response body", () => {
      const src = `return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), { status: 500 });`;
      expect(findings(src)).toHaveLength(1);
    });

    it("catches a body wrapped onto the following line", () => {
      const src = [`return new Response(`, `  JSON.stringify({ error: err.message }),`, `);`].join("\n");
      expect(findings(src)).toHaveLength(1);
    });

    it("does not flag an error message written to an internal table", () => {
      const src = [
        `} catch (e: unknown) {`,
        `  await supabaseAdmin.from("billing_admin_alerts").insert({ message: (e as Error).message });`,
        `  return hookFailure("scope", e);`,
        `}`,
      ].join("\n");
      expect(findings(src)).toEqual([]);
    });

    it("does not flag prose about the rule in a comment", () => {
      const src = [
        `// Redacted on purpose — returning e.message here would leak the schema.`,
        `return hookFailure("scope", e);`,
      ].join("\n");
      expect(findings(src)).toEqual([]);
    });
  });

  for (const file of files) {
    it(`${file} returns no caught-error message in a response body`, () => {
      const src = readFileSync(join(HOOKS_DIR, file), "utf8");
      expect(
        findings(src).map((o) => `${file}:${o}`),
        `Use hookFailure()/hookErrorRef() from @/lib/hook-response.server instead — ` +
          `it logs the full error and returns only a correlation ref.`,
      ).toEqual([]);
    });
  }

  it("hookFailure keeps the detail out of the body but logs it", async () => {
    const { hookFailure } = await import("@/lib/hook-response.server");
    const logged: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => void logged.push(args);
    let body: { ok: boolean; error: string; ref: string };
    try {
      const res = hookFailure("test-scope", new Error("relation \"secret_table\" does not exist"));
      expect(res.status).toBe(500);
      body = await res.json();
    } finally {
      console.error = original;
    }

    expect(body.ok).toBe(false);
    expect(body.error).toBe("Internal error");
    expect(JSON.stringify(body)).not.toContain("secret_table");
    // …but an operator can still find it.
    expect(body.ref).toMatch(/^[a-z0-9]{4,10}$/);
    expect(logged.length).toBe(1);
    expect(String(logged[0][0])).toContain(body.ref);
    expect(String(logged[0][1])).toContain("secret_table");
  });
});
