import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The loading bar was on almost permanently, for two independent reasons.
 *
 * It painted on every navigation: the gate re-checks on each route change, and
 * on a warm cache that resolves in a microtask with no network at all — yet the
 * bar was shown synchronously and then held for a 200ms linger. So a bar
 * appeared for work that never happened.
 *
 * And it could stick on forever. `emitRouteRevalidating(true)` fired at
 * AuthRouteGate, but the matching `false` sat behind BOTH `if (!cancelled)` and
 * `if (fullyCached)`. Cancel the effect mid-flight — which any navigation does,
 * since `pathname` is a dependency — and the retraction never ran. If the next
 * run then had `fullyCached === false` it emitted neither value, leaving the bar
 * lit indefinitely, animating `infinite` with nothing behind it.
 *
 * These tests pin both halves of the fix.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const code = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

describe("the gate always lowers a signal it raised", () => {
  const SRC = code(read("src/components/AuthRouteGate.tsx"));

  it("tracks per-run whether it emitted", () => {
    expect(SRC).toMatch(/let emittedActive = false/);
  });

  it("retracts outside the cancelled guard", () => {
    // The regression: `if (!cancelled) { ... emitRouteRevalidating(false) }`.
    // A cancelled run still raised the signal, so it still owes the retraction.
    const fin = SRC.slice(SRC.indexOf("} finally {"));
    const body = fin.slice(0, fin.indexOf("})();"));
    const retractAt = body.indexOf("emitRouteRevalidating(false)");
    const guardAt = body.indexOf("if (!cancelled)");
    expect(retractAt, "no retraction found in finally").toBeGreaterThan(-1);
    expect(guardAt, "no cancelled guard found in finally").toBeGreaterThan(-1);
    expect(
      retractAt < guardAt,
      "the retraction must come BEFORE (and outside) the !cancelled guard",
    ).toBe(true);
  });

  it("is not gated on fullyCached at retraction time", () => {
    const fin = SRC.slice(SRC.indexOf("} finally {"));
    const body = fin.slice(0, fin.indexOf("})();"));
    expect(body).not.toMatch(/if \(fullyCached\) emitRouteRevalidating\(false\)/);
    expect(body).toMatch(/if \(emittedActive\)/);
  });

  it("also retracts in the effect cleanup", () => {
    // So an abandoned run clears the bar immediately instead of waiting for an
    // in-flight request to settle.
    const at = SRC.search(/cancelled = true;/);
    expect(at, "no cleanup found").toBeGreaterThan(-1);
    expect(SRC.slice(at, at + 400)).toMatch(/emitRouteRevalidating\(false\)/);
  });
});

describe("the bar does not paint for work that is already done", () => {
  const SRC = read("src/components/RouteLoadingBar.tsx");
  const C = code(SRC);

  it("delays the paint so fast work never flashes", () => {
    expect(C).toMatch(/SHOW_DELAY_MS\s*=\s*\d+/);
    expect(C).toMatch(/setTimeout\(\(\) => setVisible\(true\), SHOW_DELAY_MS\)/);
  });

  it("caps how long it can stay visible", () => {
    // A progress bar must never be able to outlive its work: the animation is
    // `infinite` with no visual decay, so a stuck bar looks identical to a
    // working one.
    expect(C).toMatch(/MAX_VISIBLE_MS\s*=\s*[\d_]+/);
    expect(C).toMatch(/setVisible\(false\), SHOW_DELAY_MS \+ MAX_VISIBLE_MS\)/);
  });

  it("keeps the delay short enough to still be useful", () => {
    const m = C.match(/SHOW_DELAY_MS\s*=\s*(\d+)/);
    expect(m).not.toBeNull();
    const ms = Number(m![1]);
    // Long enough that a cached gate check is invisible, short enough that real
    // work still gets a signal well before the user wonders if the click landed.
    expect(ms).toBeGreaterThanOrEqual(100);
    expect(ms).toBeLessThanOrEqual(400);
  });
});

describe("the notifications bell survives the shell remount", () => {
  const SRC = code(read("src/components/NotificationsBell.tsx"));

  it("uses the shared query cache, not component state", () => {
    // AppShell renders per-route, so every navigation unmounted and remounted
    // the header. With useEffect + useState that meant one unconditional
    // listNotifications POST per navigation — two Supabase round-trips each —
    // plus a 60s interval that restarted from zero and rarely got to fire.
    // The QueryClient is hoisted to __root.tsx, so it outlives the remount.
    expect(SRC).toMatch(/useQuery\(/);
    expect(SRC).not.toMatch(/setInterval\(/);
  });

  it("scopes the cache key by user", () => {
    // Otherwise switching accounts shows the previous user's notifications.
    expect(SRC).toMatch(/queryKey: \["notifications-bell", user\?\.id\]/);
  });

  it("has a staleTime, so a remount mid-cycle serves the cache", () => {
    expect(SRC).toMatch(/staleTime: NOTIFICATIONS_POLL_MS/);
    expect(SRC).toMatch(/refetchInterval: NOTIFICATIONS_POLL_MS/);
  });

  it("writes read-state into the cache rather than local state", () => {
    // Local state would be discarded on the next navigation and the unread
    // badge would reappear for notifications already marked read.
    expect(SRC).toMatch(/qc\.setQueryData/);
  });
});
