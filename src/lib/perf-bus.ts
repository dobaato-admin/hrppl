/**
 * In-memory performance ring buffer used by the /admin/diagnostics page.
 * Captures route navigations, auth-gate timings, and per-route render counts.
 * Client-only; never persisted.
 */

export type NavSample = { id: string; path: string; ms: number; at: number };
export type GateSample = { path: string; ms: number; at: number; cached: boolean };
export type RenderSample = { path: string; count: number; at: number };

const MAX = 50;

export const perfBus = {
  navs: [] as NavSample[],
  gates: [] as GateSample[],
  renders: new Map<string, number>(),
  listeners: new Set<() => void>(),

  recordNav(sample: NavSample) {
    this.navs.unshift(sample);
    if (this.navs.length > MAX) this.navs.length = MAX;
    this.emit();
  },
  recordGate(sample: GateSample) {
    this.gates.unshift(sample);
    if (this.gates.length > MAX) this.gates.length = MAX;
    this.emit();
  },
  bumpRender(path: string) {
    this.renders.set(path, (this.renders.get(path) ?? 0) + 1);
    this.emit();
  },
  clear() {
    this.navs = [];
    this.gates = [];
    this.renders.clear();
    this.emit();
  },
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  emit() {
    this.listeners.forEach((fn) => fn());
  },
};

if (typeof window !== "undefined") {
  (window as any).__hrpplPerfBus = perfBus;
}
