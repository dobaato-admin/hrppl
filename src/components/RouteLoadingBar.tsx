import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Thin top progress bar shown while the router is loading a route or the auth
 * gate is revalidating. Exists so returning to a background tab shows progress
 * rather than a blank screen.
 *
 * Two things had made it a permanent fixture rather than an occasional signal:
 *
 * 1. It painted on EVERY navigation. The gate re-checks on each route change,
 *    and on a warm cache that resolves in a microtask with no network at all —
 *    but the bar was shown synchronously and then held for a further 200ms
 *    linger, so a bar appeared for work that never happened. SHOW_DELAY_MS
 *    fixes that: nothing paints unless the work is still running after ~180ms,
 *    which is roughly where a delay stops feeling instant anyway.
 *
 * 2. It could stick on forever. The animation is `infinite` and there is no
 *    visual decay, so a bar that never received its "off" is indistinguishable
 *    from one that is genuinely working. The gate had unbalanced paths that did
 *    exactly that (see AuthRouteGate). Those are fixed at the source, but
 *    MAX_VISIBLE_MS is the backstop: an activity signal is a hint, not a
 *    guarantee, and a progress bar should never be able to outlive its work.
 */
export const ROUTE_REVALIDATING_EVENT = "hrppl:route-revalidating";

/** Work faster than this never paints — it would be a flash, not information. */
const SHOW_DELAY_MS = 180;
/** Hard ceiling. Past this the bar is lying, so stop drawing it. */
const MAX_VISIBLE_MS = 15_000;
/** Brief hold so a bar that did appear doesn't vanish mid-stride. */
const LINGER_MS = 200;

export function RouteLoadingBar() {
  const routerStatus = useRouterState({ select: (s) => s.status });
  const isPending = routerStatus === "pending";

  // "Something says it is working" — distinct from "the bar is painted".
  const [externalWanted, setExternalWanted] = useState(false);
  const [visible, setVisible] = useState(false);
  const lingerRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { active?: boolean } | undefined;
      if (detail?.active) {
        if (lingerRef.current) {
          window.clearTimeout(lingerRef.current);
          lingerRef.current = null;
        }
        setExternalWanted(true);
      } else {
        if (lingerRef.current) window.clearTimeout(lingerRef.current);
        lingerRef.current = window.setTimeout(() => setExternalWanted(false), LINGER_MS);
      }
    };
    window.addEventListener(ROUTE_REVALIDATING_EVENT, handler);
    return () => {
      window.removeEventListener(ROUTE_REVALIDATING_EVENT, handler);
      if (lingerRef.current) window.clearTimeout(lingerRef.current);
    };
  }, []);

  const wanted = isPending || externalWanted;

  useEffect(() => {
    if (!wanted) {
      setVisible(false);
      return;
    }
    // Delay the paint, and cap how long it can stay up.
    const show = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    const cap = window.setTimeout(() => setVisible(false), SHOW_DELAY_MS + MAX_VISIBLE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(cap);
    };
  }, [wanted]);

  if (!visible) return null;

  return (
    <div
      data-testid="route-loading-bar"
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden"
    >
      <div className="h-full w-1/3 animate-[routeloading_1.1s_ease-in-out_infinite] bg-primary" />
      <style>{`
        @keyframes routeloading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  );
}

export function emitRouteRevalidating(active: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ROUTE_REVALIDATING_EVENT, { detail: { active } }),
  );
}
