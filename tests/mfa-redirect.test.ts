import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * /me/security is doing two jobs with one screen:
 *   - a 2FA SETUP page reached from the nav;
 *   - a login CHALLENGE the route gate redirects to mid-navigation, carrying
 *     ?redirect=<where they were going>.
 *
 * It read that param straight off location.search with no validateSearch and no
 * sanitising, unlike /auth which has done both since it was written.
 */

const root = process.cwd();
const PAGE = readFileSync(join(root, "src/routes/me.security.tsx"), "utf8");
const GATE = readFileSync(join(root, "src/components/AuthRouteGate.tsx"), "utf8");

describe("the redirect param is parsed and sanitised", () => {
  it("declares validateSearch so the router actually parses it", () => {
    expect(PAGE).toMatch(/validateSearch:/);
  });

  it("reads it through useSearch, not the raw location", () => {
    expect(PAGE).toMatch(/useSearch\(\{ from: "\/me\/security" \}\)/);
    expect(PAGE).not.toMatch(/location\.search/);
  });

  it("sanitises the target so this page cannot bounce a user anywhere", () => {
    expect(PAGE).toMatch(/sanitizeRedirect\(raw\)/);
  });

  it("treats an absent param as absent, not as a redirect to /dashboard", () => {
    // sanitizeRedirect() takes a string and falls back to /dashboard, so calling
    // it unconditionally would make every visit look like a challenge — and
    // would throw on undefined.
    expect(PAGE).toMatch(/if \(typeof raw !== "string"\) return \{\};/);
  });
});

describe("the page says which job it is doing", () => {
  it("distinguishes a gate challenge from opening Security from the nav", () => {
    expect(PAGE).toMatch(/const isChallenge = !!redirect;/);
  });

  it("shows challenge wording only when challenged", () => {
    expect(PAGE).toMatch(/isChallenge \? "Verify it's you" : "Two-factor authentication"/);
  });

  it("hides the app navigation during a challenge", () => {
    // The route does two jobs and they want opposite framing. As a settings
    // page it needs the shell, or the user loses every way to navigate. As a
    // gate challenge it must NOT show the nav: nothing behind it is reachable
    // until MFA passes, so every link would bounce straight back here and read
    // as a redirect loop.
    expect(PAGE).toMatch(/const Frame = isChallenge/);
    expect(PAGE).toMatch(/<AppShell title="Security">/);
    // The challenge branch renders bare chrome, not a shell.
    const frame = PAGE.slice(PAGE.indexOf("const Frame = isChallenge"));
    const decl = frame.slice(0, frame.indexOf("return ("));
    const challengeBranch = decl.slice(0, decl.indexOf(": ({ children }"));
    expect(challengeBranch).not.toMatch(/AppShell/);
  });
});

describe("a failed send stays visible", () => {
  it("keeps the reason on screen, not only in a toast", () => {
    // Otherwise the user sees the same button again and reads it as a loop.
    expect(PAGE).toMatch(/const \[sendError, setSendError\]/);
    expect(PAGE).toMatch(/setSendError\(message\)/);
    expect(PAGE).toMatch(/We&rsquo;couldn|couldn&rsquo;t send your code/);
  });
});

describe("the gate contract this depends on", () => {
  it("still lets /me/security render while unverified", () => {
    // If this route ever left MFA_ALLOWED, the gate would redirect to it from
    // itself — a genuine infinite loop.
    const allowed = GATE.slice(GATE.indexOf("const MFA_ALLOWED"));
    expect(allowed.slice(0, 200)).toMatch(/"\/me\/security"/);
  });

  it("sends the current path as the redirect target", () => {
    expect(GATE).toMatch(/navigate\(\{ to: "\/me\/security", search: \{ redirect: pathname \}/);
  });
});
