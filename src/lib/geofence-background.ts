// Best-effort background location tracking.
// True OS-level background requires a native app or installed PWA with
// Background Sync / Periodic Background Sync permissions. In a regular tab
// this keeps watchPosition alive while the tab is open and reports fixes to
// the geofence audit log; we degrade gracefully when the page is hidden.
import { logGeofenceEvent } from "@/lib/geofence-audit.functions";

type Handle = { stop: () => void };
const active = new Map<string, Handle>();

export function isBackgroundTrackingSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.geolocation;
}

export async function startBackgroundTracking(opts: {
  geofenceId: string;
  minAccuracyMeters: number;
  audit: (payload: any) => Promise<any>;
}): Promise<Handle> {
  const existing = active.get(opts.geofenceId);
  if (existing) return existing;

  if (!navigator.geolocation) {
    throw new Error("Geolocation API unavailable in this browser");
  }

  let lastAcc: number | null = null;

  const id = navigator.geolocation.watchPosition(
    (p) => {
      const acc = p.coords.accuracy;
      let reason: string | null = null;
      if (acc > opts.minAccuracyMeters) reason = `Low accuracy (±${Math.round(acc)}m)`;
      if (lastAcc != null && (acc / lastAcc > 3 || lastAcc / acc > 3)) {
        reason = (reason ? reason + "; " : "") + "Accuracy jump (source change)";
      }
      lastAcc = acc;
      opts.audit({
        data: {
          geofence_id: opts.geofenceId, action: "capture", source: "background",
          latitude: Number(p.coords.latitude.toFixed(6)),
          longitude: Number(p.coords.longitude.toFixed(6)),
          accuracy_m: acc, is_suspicious: !!reason, suspicious_reason: reason,
          metadata: { hidden: typeof document !== "undefined" ? document.hidden : false },
        },
      }).catch(() => {});
    },
    () => { /* swallow; surfaced via UI elsewhere */ },
    { enableHighAccuracy: true, maximumAge: 30_000, timeout: 60_000 },
  );

  const handle: Handle = {
    stop: () => {
      navigator.geolocation.clearWatch(id);
      active.delete(opts.geofenceId);
    },
  };
  active.set(opts.geofenceId, handle);
  return handle;
}

export function stopBackgroundTracking(geofenceId: string) {
  active.get(geofenceId)?.stop();
}

// Hint about true-background availability so admins can be told the truth.
export function backgroundTrackingNote(): string {
  return "Browser tabs only run location updates while open. For true background tracking, install this site as a PWA on your phone and keep the app added to your home screen.";
}

// Tree-shaking safety
export const _logImport = logGeofenceEvent;
