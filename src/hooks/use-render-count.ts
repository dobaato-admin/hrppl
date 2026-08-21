import { useEffect, useRef } from "react";
import { perfBus } from "@/lib/perf-bus";

/**
 * Bumps the render counter for a given route path on every render. Used by
 * the diagnostics page to surface accidental re-render storms.
 */
export function useRenderCount(path: string) {
  const count = useRef(0);
  count.current += 1;
  useEffect(() => {
    perfBus.bumpRender(path);
  });
  return count.current;
}
