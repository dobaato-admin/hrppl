import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * A role revalidation must not tear the page down.
 *
 * ---------------------------------------------------------------------------
 * T12 Part B — modal state lost on tab switch
 * ---------------------------------------------------------------------------
 *
 * Reported as "switching tabs loses my data", which is the symptom. The cause
 * is one line: `refreshRoles` opened with an unconditional
 *
 *     setAuthState({ rolesLoaded: false });
 *
 * and `AdminGate` renders `if (!rolesLoaded) return <div>Loading…</div>`. So
 * every role refresh unmounted the entire page beneath the gate, taking any
 * open modal and everything typed into it.
 *
 * It fires more often than it sounds: Supabase emits SIGNED_IN when it recovers
 * a session on tab focus, and `requestRoleRefresh()` is called explicitly after
 * several flows. Each one silently discarded a half-filled form.
 *
 * Reproduced in a live browser by dispatching the refresh event with the
 * employee modal open and "TESTDATA-Zephyr" typed: the dialog closed and the
 * value was gone. After the fix the same test — three consecutive refreshes —
 * leaves both intact, and the same holds on /admin/policies, confirming the
 * cause was shared rather than per-page.
 *
 * The candidates the ticket listed were checked and were NOT the cause:
 * `refetchOnWindowFocus` is already false globally in `src/router.tsx`, and the
 * `focusHandler` / `visibilityHandler` in this module are declared but never
 * assigned to any listener.
 */

const ROOT = process.cwd();
const AUTH = readFileSync(join(ROOT, "src/hooks/use-auth.ts"), "utf8");
const GATE = readFileSync(join(ROOT, "src/components/AdminGate.tsx"), "utf8");

describe("refreshRoles revalidates without unmounting", () => {
  const fn = AUTH.slice(
    AUTH.indexOf("async function refreshRoles"),
    AUTH.indexOf("\n}", AUTH.indexOf("async function refreshRoles")),
  );

  it("does not blank rolesLoaded unconditionally", () => {
    expect(
      fn,
      "An unconditional `setAuthState({ rolesLoaded: false })` makes AdminGate " +
        "unmount the whole page on every refresh, destroying open modals and " +
        "their form state.",
    ).not.toMatch(/^\s*setAuthState\(\{ rolesLoaded: false \}\);/m);
  });

  it("only blanks them when it lacks an answer for THIS user", () => {
    expect(fn).toContain("haveRolesForThisUser");
    expect(fn).toMatch(/rolesForUserId === nextUserId && authState\.rolesLoaded/);
    expect(fn).toMatch(/if \(!haveRolesForThisUser\) setAuthState\(\{ rolesLoaded: false \}\)/);
  });

  it("tracks role ownership separately from authState.user", () => {
    // onAuthStateChange sets the user before calling refreshRoles, so by then
    // the two always agree and cannot distinguish an account change from a
    // revalidation.
    expect(AUTH).toMatch(/let rolesForUserId: string \| null = null;/);
    expect(fn).toMatch(/rolesForUserId = nextUserId;/);
  });

  it("clears the tracker on sign-out and on teardown", () => {
    // Otherwise the next user in the same tab inherits the previous one's
    // "we already have roles" shortcut and never sees the gate re-evaluate.
    const signedOut = AUTH.slice(AUTH.indexOf("if (!nextUserId) {"), AUTH.indexOf("if (!nextUserId) {") + 220);
    expect(signedOut).toContain("rolesForUserId = null;");
    expect(AUTH).toMatch(/unsubscribeAuth = null;\s*\n\s*rolesForUserId = null;/);
  });
});

describe("the gate is still a gate", () => {
  it("AdminGate still withholds children until roles are known", () => {
    // The fix must not turn the loading guard off — a page must not render for
    // an unknown role. It only stops that guard being re-entered for a user
    // whose roles are already known.
    expect(GATE).toMatch(/if \(!rolesLoaded\) return/);
    expect(GATE).toMatch(/if \(!user \|\| !allowed\) return null;/);
  });
});

describe("the causes the ticket suspected were ruled out, not left in place", () => {
  it("window-focus refetching is off globally", () => {
    const router = readFileSync(join(ROOT, "src/router.tsx"), "utf8");
    expect(router).toMatch(/refetchOnWindowFocus: false/);
  });

  it("no visibilitychange listener reloads the app", () => {
    expect(AUTH).not.toMatch(/addEventListener\("visibilitychange"/);
    expect(AUTH).not.toMatch(/location\.reload\(\)/);
  });
});
