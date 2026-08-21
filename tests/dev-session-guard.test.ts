import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * /dev-session carries an existing Supabase session from the deployed app to a
 * local dev server, because Google OAuth is only configured for the deployed
 * origins.
 *
 * It grants nothing — it accepts a session the user already holds and Supabase
 * still validates it — but a page that writes auth state must not exist in a
 * production bundle regardless. These tests pin that.
 */

const root = process.cwd();
const PAGE = readFileSync(join(root, "src/routes/dev-session.tsx"), "utf8");

describe("dev-session is development-only", () => {
  it("guards on import.meta.env.DEV, which is statically false in a build", () => {
    expect(PAGE).toMatch(/if \(!import\.meta\.env\.DEV\)/);
  });

  it("returns a dead end before any token handling when not in dev", () => {
    // The guard must sit above the logic, not merely hide the button.
    const guardAt = PAGE.indexOf("import.meta.env.DEV");
    const setSessionAt = PAGE.indexOf("supabase.auth.setSession");
    expect(guardAt).toBeGreaterThan(-1);
    expect(setSessionAt).toBeGreaterThan(guardAt);
  });

  it("is excluded from search indexing", () => {
    expect(PAGE).toMatch(/robots.*noindex, nofollow/s);
  });
});

describe("dev-session cannot escalate", () => {
  it("only ever calls setSession — it never mints or signs anything", () => {
    expect(PAGE).toMatch(/supabase\.auth\.setSession/);
    expect(PAGE).not.toMatch(/signInWith|admin\.|service_role|SERVICE_ROLE/);
  });

  it("uses the browser client, never the service-role client", () => {
    expect(PAGE).toMatch(/from "@\/integrations\/supabase\/client"/);
    expect(PAGE).not.toMatch(/client\.server/);
  });

  it("does not weaken MFA", () => {
    // The route gate still enforces MFA after the session lands.
    expect(PAGE).not.toMatch(/mfa|setMfaSessionVerified/i);
  });
});

describe("route gate exposure", () => {
  const GATE = readFileSync(join(root, "src/components/AuthRouteGate.tsx"), "utf8");

  it("is public so it can be reached without a session", () => {
    // Chicken-and-egg: you need to reach it in order to get a session.
    expect(GATE).toMatch(/"\/dev-session"/);
  });

  it("documents why that is not a hole", () => {
    expect(GATE).toMatch(/dead weight there, not a hole/);
  });
});
