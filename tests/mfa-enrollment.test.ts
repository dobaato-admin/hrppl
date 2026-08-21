import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * MFA enrollment must not depend on the service-role key.
 *
 * MFA is mandatory for every account (AuthRouteGate enforces it on every
 * non-MFA_ALLOWED route), so any environment where enrollment cannot complete
 * is an environment where nobody can reach the app at all. Both email-OTP paths
 * legitimately need service-role — they write mfa_email_challenges, which a
 * user must not be able to forge. TOTP does not: enrollment happens entirely in
 * the Supabase client, and the only server write is two columns on the caller's
 * own profile row.
 *
 * That makes TOTP the one method that works without SUPABASE_SERVICE_ROLE_KEY,
 * and this file keeps it that way.
 */

const root = process.cwd();
const MFA = readFileSync(join(root, "src/lib/mfa.functions.ts"), "utf8");

/** Drop // and /* *\/ comments so prose about a symbol never counts as a use. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ 	]*\/\/.*$/gm, "");
}

/** Executable body of a `export const <name> = createServerFn(...)` block. */
function serverFn(name: string): string {
  const start = MFA.indexOf(`export const ${name} =`);
  expect(start, `${name} not found in mfa.functions.ts`).toBeGreaterThan(-1);
  const rest = MFA.slice(start + 1);
  const next = rest.indexOf("\nexport const ");
  return stripComments(next === -1 ? rest : rest.slice(0, next));
}

describe("setTotpEnrolled works without the service-role key", () => {
  const body = serverFn("setTotpEnrolled");

  it("does not import the service-role client", () => {
    // client.server.ts throws on construction when the key is absent, so a
    // single import here re-breaks enrollment everywhere the key is missing.
    expect(body).not.toMatch(/client\.server/);
    expect(body).not.toMatch(/supabaseAdmin/);
  });

  it("writes through the caller's own client", () => {
    expect(body).toMatch(/const \{ supabase, userId \} = context/);
    expect(body).toMatch(/supabase\s*\n?\s*\.from\(['"]profiles['"]\)/);
  });

  it("scopes the write to the caller's own row", () => {
    // RLS would reject anything else, but an unscoped .update() would be a
    // full-table write attempt rather than a no-op — fail loudly, not quietly.
    expect(body).toMatch(/\.eq\(['"]id['"], userId\)/);
  });

  it("surfaces a failed write instead of returning ok", () => {
    // Swallowing the error is what turns a failed write into a redirect loop:
    // the client marks the session verified and navigates, the next load reads
    // mfa_method: null, and the gate sends it straight back.
    expect(body).toMatch(/const \{ error \}/);
    expect(body).toMatch(/if \(error\) throw/);
  });
});

describe("the email-OTP paths still use service-role deliberately", () => {
  // Not an oversight to be "fixed" the same way: a user who could insert into
  // mfa_email_challenges could mint their own second factor.
  for (const fn of ["startEmailMfa", "verifyEmailMfa"]) {
    it(`${fn} keeps writing challenges as service-role`, () => {
      expect(serverFn(fn)).toMatch(/supabaseAdmin/);
    });
  }
});

describe("the database permits the profile write", () => {
  const migrations = join(root, "supabase/migrations");
  const sql = readdirSync(migrations)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(join(migrations, f), "utf8"))
    .join("\n");

  it("has a self-update policy on profiles", () => {
    expect(sql).toMatch(
      /CREATE POLICY "users update own profile" ON public\.profiles FOR UPDATE USING \(id = auth\.uid\(\)\)/,
    );
  });

  it("does not guard mfa_method in prevent_profile_privileged_changes", () => {
    // The trigger fires on every profiles UPDATE. If a later migration adds
    // mfa_method to it, the caller's client stops being able to write and TOTP
    // enrollment breaks again — this is the tripwire for that.
    const start = sql.lastIndexOf("FUNCTION public.prevent_profile_privileged_changes()");
    expect(start).toBeGreaterThan(-1);
    const body = sql.slice(start, sql.indexOf("$function$;", start));
    expect(body).not.toMatch(/mfa_method|mfa_enrolled_at/);
  });
});

/**
 * TOTP must be enabled at the PROJECT level, not just in the UI.
 *
 * MFA is mandatory here — AuthRouteGate bounces every authenticated request
 * off any route outside MFA_ALLOWED until a factor is enrolled and the session
 * verified. So `mfa_totp_enroll_enabled = false` is not a degraded experience,
 * it is a total lockout: the gate sends the user to /me/security, enroll()
 * fails with "MFA enroll is disabled for TOTP", and they get a spinner where
 * the QR code should be.
 *
 * A fresh Supabase project has every MFA factor OFF by default. The old
 * project had TOTP switched on in its dashboard — a setting that does not
 * travel with a schema migration and is invisible until someone rebuilds.
 * Pinning it in config.toml is what makes it survive the next rebuild.
 */
describe("TOTP is enabled at the project level", () => {
  const CONFIG = readFileSync(join(root, "supabase/config.toml"), "utf8");

  function tomlSection(name: string): string {
    const lines = CONFIG.split(/\r?\n/);
    const start = lines.findIndex((l) => l.trim() === `[${name}]`);
    if (start === -1) return "";
    const body: string[] = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith("[")) break;
      body.push(lines[i]);
    }
    return body.join("\n");
  }

  it("declares [auth.mfa.totp] with enrol and verify on", () => {
    const totp = tomlSection("auth.mfa.totp");
    expect(totp, "config.toml has no [auth.mfa.totp] section").not.toBe("");
    expect(totp).toMatch(/^\s*enroll_enabled\s*=\s*true/m);
    expect(totp).toMatch(/^\s*verify_enabled\s*=\s*true/m);
  });

  it("allows more than one factor", () => {
    // max_enrolled_factors = 0 would disable MFA just as completely as
    // enroll_enabled = false, and much less obviously.
    const mfa = tomlSection("auth.mfa");
    const max = mfa.match(/^\s*max_enrolled_factors\s*=\s*(\d+)/m);
    expect(max, "[auth.mfa] must set max_enrolled_factors").not.toBeNull();
    expect(Number(max![1])).toBeGreaterThan(0);
  });

  it("does not enable factors the app has no UI for", () => {
    // me.security.tsx offers TOTP and email OTP only, and email OTP is
    // implemented in-app via mfa_email_challenges rather than by GoTrue.
    // Enabling phone or WebAuthn here would advertise a factor that no screen
    // can enrol, stranding anyone who picks it.
    expect(tomlSection("auth.mfa.phone")).not.toMatch(/enroll_enabled\s*=\s*true/);
    expect(tomlSection("auth.mfa.web_authn")).not.toMatch(/enroll_enabled\s*=\s*true/);
  });
});
