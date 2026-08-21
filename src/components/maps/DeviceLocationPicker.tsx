import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LocateFixed, Crosshair, AlertCircle, AlertTriangle,
  ShieldAlert, Info, CheckCircle2,
} from "lucide-react";
import { logGeofenceEvent } from "@/lib/geofence-audit.functions";

export type LatLng = { lat: number; lng: number };

export interface DeviceLocationPickerProps {
  value: LatLng;
  radiusMeters: number;
  /** Min accuracy (m). Captures worse than this are flagged suspicious. */
  minAccuracyMeters?: number;
  /** Existing geofence id, used to attach audit entries to the right row. */
  geofenceId?: string | null;
  onChange: (next: { lat: number; lng: number; radiusMeters: number; accuracy?: number }) => void;
}

type PermState = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

const ACC_JUMP_FACTOR = 3; // sudden 3× accuracy swing = source change suspicion

export function DeviceLocationPicker({
  value, radiusMeters, minAccuracyMeters = 100, geofenceId = null, onChange,
}: DeviceLocationPickerProps) {
  const audit = useServerFn(logGeofenceEvent);
  const [err, setErr] = useState<string | null>(null);
  const [errKind, setErrKind] = useState<"denied" | "timeout" | "unavailable" | "other" | null>(null);
  const [busy, setBusy] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [watching, setWatching] = useState(false);
  const [perm, setPerm] = useState<PermState>("unknown");
  const [suspicious, setSuspicious] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastAccRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Probe permission state (best-effort; not supported in every browser)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPerm("unsupported"); return;
    }
    const anyNav = navigator as any;
    if (!anyNav.permissions?.query) { setPerm("unknown"); return; }
    let cancelled = false;
    anyNav.permissions.query({ name: "geolocation" }).then((status: any) => {
      if (cancelled) return;
      setPerm(status.state as PermState);
      status.onchange = () => setPerm(status.state as PermState);
    }).catch(() => setPerm("unknown"));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  const safeAudit = useCallback((payload: any) => {
    audit({ data: { ...payload, geofence_id: geofenceId ?? null } }).catch(() => {});
  }, [audit, geofenceId]);

  const handleError = useCallback((e: GeolocationPositionError, action: "capture" | "track") => {
    let kind: typeof errKind = "other";
    let msg = e.message || "Could not read location";
    if (e.code === 1) { kind = "denied"; msg = "Location permission denied. Enable it for this site in your browser settings, then retry."; }
    else if (e.code === 2) { kind = "unavailable"; msg = "Your device couldn't determine its location. Move outdoors or check GPS / Wi-Fi, then retry."; }
    else if (e.code === 3) { kind = "timeout"; msg = "Location request timed out. Stay still for a few seconds and try again."; }
    setErr(msg); setErrKind(kind); setBusy(false);
    safeAudit({
      action: kind === "denied" ? "permission_denied" : kind === "timeout" ? "permission_timeout" : "permission_denied",
      source: "device", metadata: { code: e.code, raw: e.message, on: action },
    });
  }, [safeAudit]);

  const acceptFix = useCallback((p: GeolocationPosition, sourceTag: "device" | "background") => {
    const lat = Number(p.coords.latitude.toFixed(6));
    const lng = Number(p.coords.longitude.toFixed(6));
    const acc = p.coords.accuracy;
    setAccuracy(acc);

    // Suspicious detection: low accuracy or sudden source jump
    let reason: string | null = null;
    if (acc > minAccuracyMeters) reason = `Low GPS accuracy (±${Math.round(acc)}m > ${minAccuracyMeters}m threshold)`;
    const prev = lastAccRef.current;
    if (prev != null && acc > 0 && (acc / prev > ACC_JUMP_FACTOR || prev / acc > ACC_JUMP_FACTOR)) {
      const swap = `Accuracy jumped ${Math.round(prev)}m → ${Math.round(acc)}m — likely location source change`;
      reason = reason ? `${reason}; ${swap}` : swap;
    }
    lastAccRef.current = acc;
    setSuspicious(reason);

    onChangeRef.current({ lat, lng, radiusMeters, accuracy: acc });
    safeAudit({
      action: "capture", source: sourceTag, latitude: lat, longitude: lng,
      accuracy_m: acc, is_suspicious: !!reason, suspicious_reason: reason,
    });
    if (reason) {
      safeAudit({
        action: "suspicious_flagged", source: sourceTag, latitude: lat, longitude: lng,
        accuracy_m: acc, is_suspicious: true, suspicious_reason: reason,
      });
    }
  }, [minAccuracyMeters, radiusMeters, safeAudit]);

  function captureOnce() {
    if (!navigator.geolocation) { setErr("Geolocation not supported by this browser"); setErrKind("other"); return; }
    setErr(null); setErrKind(null); setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setBusy(false); acceptFix(p, "device"); },
      (e) => handleError(e, "capture"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function toggleWatch() {
    if (!navigator.geolocation) { setErr("Geolocation not supported"); setErrKind("other"); return; }
    if (watching && watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null; setWatching(false);
      safeAudit({ action: "tracking_stopped", source: "device" });
      return;
    }
    setErr(null); setErrKind(null);
    const id = navigator.geolocation.watchPosition(
      (p) => acceptFix(p, "device"),
      (e) => handleError(e, "track"),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
    watchIdRef.current = id; setWatching(true);
    safeAudit({ action: "tracking_started", source: "device" });
  }

  function manualEdit(lat: number, lng: number) {
    setSuspicious(null);
    onChangeRef.current({ lat, lng, radiusMeters });
    safeAudit({ action: "manual_edit", source: "manual", latitude: lat, longitude: lng });
  }

  const hasPos = !!(value.lat || value.lng);

  return (
    <div className="space-y-3 rounded-md border p-3 bg-muted/30">
      {perm === "denied" && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Location blocked for this site</AlertTitle>
          <AlertDescription className="text-xs">
            Open your browser's site settings (the padlock icon in the address bar) → <strong>Location → Allow</strong>, reload, and try again. You can still enter coordinates manually below.
          </AlertDescription>
        </Alert>
      )}
      {perm === "prompt" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Permission required</AlertTitle>
          <AlertDescription className="text-xs">
            Click <strong>Capture</strong> and approve the browser prompt to share your current location. Nothing is sent until you allow it.
          </AlertDescription>
        </Alert>
      )}
      {perm === "unsupported" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Geolocation not supported</AlertTitle>
          <AlertDescription className="text-xs">
            This browser can't read your device's location. Enter coordinates manually or use a different browser/device.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Use my device location</p>
          <p className="text-xs text-muted-foreground">
            Reads GPS / Wi-Fi position from this browser. No Google Maps billing.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="button" size="sm" variant="secondary" onClick={captureOnce} disabled={busy || perm === "unsupported"}>
            <LocateFixed className="h-4 w-4 mr-1" /> {busy ? "Reading…" : "Capture"}
          </Button>
          <Button type="button" size="sm" variant={watching ? "default" : "outline"} onClick={toggleWatch} disabled={perm === "unsupported"}>
            <Crosshair className="h-4 w-4 mr-1" /> {watching ? "Stop" : "Track"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Latitude</Label>
          <Input
            inputMode="decimal" value={value.lat || ""}
            onChange={(e) => manualEdit(Number(e.target.value) || 0, value.lng)}
            placeholder="-33.8688"
          />
        </div>
        <div>
          <Label className="text-xs">Longitude</Label>
          <Input
            inputMode="decimal" value={value.lng || ""}
            onChange={(e) => manualEdit(value.lat, Number(e.target.value) || 0)}
            placeholder="151.2093"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Radius: <span className="font-mono">{radiusMeters} m</span></Label>
        <Slider
          min={25} max={2000} step={5} value={[radiusMeters]}
          onValueChange={(v) => onChangeRef.current({ lat: value.lat, lng: value.lng, radiusMeters: v[0] })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {hasPos && (
          <span className="font-mono">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
        {accuracy != null && (
          <span className={accuracy > minAccuracyMeters ? "text-status-stuck" : ""}>
            ±{Math.round(accuracy)} m accuracy
          </span>
        )}
        {hasPos && (
          <a
            className="underline hover:text-foreground"
            href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=18/${value.lat}/${value.lng}`}
            target="_blank" rel="noreferrer"
          >Preview on OpenStreetMap</a>
        )}
        {watching && !suspicious && accuracy != null && accuracy <= minAccuracyMeters && (
          <span className="flex items-center gap-1 text-status-done">
            <CheckCircle2 className="h-3.5 w-3.5" /> Good fix
          </span>
        )}
      </div>

      {suspicious && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Suspicious location reading</AlertTitle>
          <AlertDescription className="text-xs">{suspicious}. Flagged in the geofence audit log.</AlertDescription>
        </Alert>
      )}

      {err && (
        <Alert variant={errKind === "timeout" ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {errKind === "denied" ? "Permission denied"
              : errKind === "timeout" ? "Location request timed out"
              : errKind === "unavailable" ? "Location unavailable"
              : "Couldn't read location"}
          </AlertTitle>
          <AlertDescription className="text-xs space-y-2">
            <p>{err}</p>
            {errKind !== "denied" && (
              <Button type="button" size="sm" variant="outline" onClick={captureOnce}>Retry capture</Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!hasPos && !err && perm !== "denied" && (
        <p className="text-xs text-muted-foreground">
          Tap <strong>Capture</strong> while standing at the site to pin its centre, or paste coordinates manually.
        </p>
      )}
    </div>
  );
}
