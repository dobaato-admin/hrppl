import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The dev MFA bypass must never be able to reach production.
 *
 * MFA is enforced on every route outside MFA_ALLOWED, and both email-OTP paths
 * need mail credentials the dev project does not have — so TOTP was the only
 * way in, and an interrupted enrolment could strand an account entirely. The
 * bypass exists to unblock local work.
 *
 * Its entire safety rests on being ANDed with import.meta.env.DEV, which Vite
 * folds to a literal false in a production build, making the guarded branch
 * dead code that never ships. Drop that conjunct and a stray environment
 * variable silently disables second-factor enforcement in production.
 */

const root = process.cwd();
const GATE = readFileSync(join(root, "src/components/AuthRouteGate.tsx"), "utf8");

/** Source with // and block comments stripped, so prose never counts as code. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

const GATE_CODE = code(GATE);

describe("the dev MFA bypass is compile-time dead in production", () => {
  it("is defined once, as a module constant", () => {
    const defs = [...GATE_CODE.matchAll(/const DEV_MFA_BYPASS\s*=/g)];
    expect(defs).toHaveLength(1);
  });

  it("requires import.meta.env.DEV", () => {
    // The load-bearing conjunct. Without it the flag is runtime-controlled.
    const line = GATE_CODE.slice(GATE_CODE.indexOf("const DEV_MFA_BYPASS"));
    const decl = line.slice(0, line.indexOf(";") + 1);
    expect(decl).toMatch(/import\.meta\.env\.DEV/);
    expect(decl).toMatch(/&&/);
  });

  it("also requires an explicit opt-in variable", () => {
    const line = GATE_CODE.slice(GATE_CODE.indexOf("const DEV_MFA_BYPASS"));
    const decl = line.slice(0, line.indexOf(";") + 1);
    expect(decl).toMatch(/VITE_DEV_BYPASS_MFA/);
    // Compared against a literal, not merely checked for truthiness — so
    // VITE_DEV_BYPASS_MFA=false does not enable it.
    expect(decl).toMatch(/===\s*["']1["']/);
  });

  it("guards the MFA branch and nothing else", () => {
    // It must not be wired into the suspension, tenant or setup gates.
    const uses = [...GATE_CODE.matchAll(/DEV_MFA_BYPASS/g)];
    // definition + the enforcement condition + the one-time warning
    expect(uses.length).toBeLessThanOrEqual(3);
    expect(GATE_CODE).toMatch(/!MFA_ALLOWED\.has\(pathname\)\s*&&\s*!DEV_MFA_BYPASS/);
  });

  it("still enforces MFA when the bypass is off", () => {
    // The redirect must remain in place; the bypass only skips the block.
    expect(GATE_CODE).toMatch(/navigate\(\{\s*to:\s*"\/me\/security"/);
  });

  it("announces itself loudly when active", () => {
    // Silent disabling of a security control is how it gets left on.
    expect(GATE).toMatch(/MFA enforcement is DISABLED/);
  });

  it("is absent from the committed example env file", () => {
    // .env.example is what a new machine copies. Shipping the opt-in there
    // would make the bypass the default rather than a deliberate choice.
    for (const f of [".env.example", ".env.e2e.example"]) {
      let contents = "";
      try {
        contents = readFileSync(join(root, f), "utf8");
      } catch {
        continue; // file may not exist
      }
      expect(contents, `${f} must not preset the bypass`).not.toMatch(
        /^\s*VITE_DEV_BYPASS_MFA\s*=\s*1/m,
      );
    }
  });
});

describe("the enrolment split-brain self-heals", () => {
  const SECURITY = readFileSync(join(root, "src/routes/me.security.tsx"), "utf8");

  it("checks Supabase for an existing verified factor before offering to enrol", () => {
    // Supabase owns auth.mfa_factors; the app gates on profiles.mfa_method.
    // mfa.verify() and setTotpEnrolled are separate round trips, so an
    // interruption between them leaves a verified factor with mfa_method null
    // — and the enrol view would then add ANOTHER factor on every redirect.
    const heal = code(SECURITY);
    expect(heal).toMatch(/listFactors\(\)/);
    expect(heal).toMatch(/f\.status === "verified"/);
  });

  it("records the existing factor rather than enrolling a new one", () => {
    expect(code(SECURITY)).toMatch(/markTotpEnrolled\(\{\}\)/);
  });

  it("holds the loading state while repairing", () => {
    // Otherwise the enrol view flashes up and the user starts scanning a QR
    // that is about to be replaced.
    expect(code(SECURITY)).toMatch(/isLoading \|\| healing/);
  });
});
