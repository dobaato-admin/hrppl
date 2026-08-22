import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, e as CardContent, f as Badge, B as Button, T as Textarea, a6 as listReconciliation, a7 as resolveReconciliation, a8 as runReconciliation, h as cn } from "./router-CLxirH5A.mjs";
import { listGeofences, upsertGeofence, deleteGeofence, distanceMeters } from "./geofences.functions-C8KvPefL.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { C as Checkbox } from "./checkbox-Dj6wn8_T.mjs";
import { S as Switch } from "./switch-B3SbfIg0.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AdminGate } from "./AdminGate-B3-x5ytD.mjs";
import { A as ADMIN_LAYOUT_ROLES } from "./rbac-BWg_Nf1T.mjs";
import { R as Root, T as Track, a as Range, b as Thumb } from "../_libs/radix-ui__react-slider.mjs";
import { A as Alert, b as AlertTitle, a as AlertDescription } from "./alert-CfSGBoj2.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/seroval.mjs";
import { b9 as FlaskConical, e as ClipboardList, J as MapPin, T as Trash2, aa as Plus, aF as RefreshCw, D as Download, q as FileText, r as ShieldAlert, b0 as Square, a$ as Play, ba as Info, al as CircleAlert, bb as LocateFixed, bc as Crosshair, ak as CircleCheck, Y as TriangleAlert, Z as CircleQuestionMark, aR as Smartphone, b3 as ChevronLeft, af as ExternalLink, $ as ChevronRight } from "../_libs/lucide-react.mjs";
import { a as objectType, E as recordType, z as stringType, F as anyType, A as booleanType, C as numberType, B as enumType, D as arrayType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "./client-BLUqAwhM.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/cmdk.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "./separator-D6YV3GQ2.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./monday-Dpwrcz0o.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const ACTIONS = ["create", "update", "delete", "capture", "manual_edit", "permission_denied", "permission_timeout", "tracking_started", "tracking_stopped", "suspicious_flagged", "background_enabled", "background_disabled", "simulation_run", "simulation_point"];
const LogSchema = objectType({
  geofence_id: stringType().uuid().nullable().optional(),
  action: enumType(ACTIONS),
  source: enumType(["device", "manual", "map", "background", "simulation"]).nullable().optional(),
  latitude: numberType().min(-90).max(90).nullable().optional(),
  longitude: numberType().min(-180).max(180).nullable().optional(),
  accuracy_m: numberType().min(0).max(1e5).nullable().optional(),
  is_suspicious: booleanType().optional(),
  suspicious_reason: stringType().max(280).nullable().optional(),
  metadata: recordType(stringType(), anyType()).optional()
});
const logGeofenceEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => LogSchema.parse(d)).handler(createSsrRpc("426ee86312116c89f6763861b849205a4e193492669d6bc435b1796558a89510"));
const listGeofenceAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  geofence_id: stringType().uuid().optional(),
  actor_user_id: stringType().uuid().optional(),
  from: stringType().datetime().optional(),
  to: stringType().datetime().optional(),
  limit: numberType().int().min(1).max(2e3).default(200),
  suspicious_only: booleanType().optional()
}).parse(d ?? {})).handler(createSsrRpc("66e9738c0be1073e724d7b54d6865773ec183a6e2a186433b93e03f9001da63d"));
const PointSchema = objectType({
  lat: numberType(),
  lng: numberType(),
  accuracy_m: numberType().min(0).max(1e5).optional(),
  t_offset_ms: numberType().int().min(0).optional()
});
const TraceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  description: stringType().max(500).optional().nullable(),
  points: arrayType(PointSchema).max(5e3)
});
const listSimTraces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a5520bdb39cb3d25a73160531b129d00475915aedc5ad0ba74f809b1a1268c5d"));
const saveSimTrace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => TraceSchema.parse(d)).handler(createSsrRpc("9ed7a6d7801653cac0cc7d239febe674c7f1cb1c0828a127d2ccf9b956a4c0ed"));
const deleteSimTrace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7cb1346511c3ee2aef56f2be3066d47b7d226c831a9c0e8eebf68f1a081567ac"));
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Root.displayName;
const KEY = "AIzaSyBmvJph4LmrbtW7skeczzpBIyb9WWzFKo4";
const CHANNEL = "9f058c14f60dc58761926cc60818a836";
function loadMaps() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  window.__gmapsLoading = new Promise((resolve, reject) => {
    window.__gmapsInit = () => resolve();
    const s = document.createElement("script");
    const params = new URLSearchParams({
      key: KEY,
      v: "weekly",
      libraries: "places",
      loading: "async",
      callback: "__gmapsInit"
    });
    params.set("channel", CHANNEL);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}
function GoogleMapPicker({ value, radiusMeters, onChange, height = 320 }) {
  const mapRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const stateRef = reactExports.useRef({});
  const [err, setErr] = reactExports.useState(null);
  const [ready, setReady] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const onChangeRef = reactExports.useRef(onChange);
  reactExports.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  reactExports.useEffect(() => {
    let mounted = true;
    loadMaps().then(() => {
      if (!mounted || !mapRef.current || !window.google?.maps) return;
      const g = window.google.maps;
      const center = value.lat || value.lng ? { lat: Number(value.lat), lng: Number(value.lng) } : { lat: -33.8688, lng: 151.2093 };
      const map = new g.Map(mapRef.current, {
        center,
        zoom: value.lat || value.lng ? 16 : 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      const marker = new g.Marker({ map, position: center, draggable: true });
      const circle = new g.Circle({
        map,
        center,
        radius: radiusMeters,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.9,
        strokeWeight: 2
      });
      const move = (lat, lng) => {
        marker.setPosition({ lat, lng });
        circle.setCenter({ lat, lng });
        onChangeRef.current({ lat, lng, radiusMeters });
      };
      marker.addListener("dragend", (e) => move(e.latLng.lat(), e.latLng.lng()));
      map.addListener("click", (e) => move(e.latLng.lat(), e.latLng.lng()));
      stateRef.current = { map, marker, circle };
      setReady(true);
    }).catch((e) => setErr(e.message));
    return () => {
      mounted = false;
    };
  }, []);
  reactExports.useEffect(() => {
    if (stateRef.current.circle) stateRef.current.circle.setRadius(radiusMeters);
  }, [radiusMeters]);
  reactExports.useEffect(() => {
    const { map, marker, circle } = stateRef.current;
    if (!map || !marker || !circle) return;
    const pos = marker.getPosition?.();
    if (!pos) return;
    if (Math.abs(pos.lat() - value.lat) > 1e-6 || Math.abs(pos.lng() - value.lng) > 1e-6) {
      const p = { lat: Number(value.lat), lng: Number(value.lng) };
      marker.setPosition(p);
      circle.setCenter(p);
      map.panTo(p);
    }
  }, [value.lat, value.lng]);
  async function geocodeSearch() {
    if (!search.trim() || !window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: search }, (results, status) => {
      if (status !== "OK" || !results?.length) {
        setErr("Address not found");
        return;
      }
      const loc = results[0].geometry.location;
      const lat = loc.lat(), lng = loc.lng();
      stateRef.current.map?.panTo({ lat, lng });
      stateRef.current.map?.setZoom(17);
      stateRef.current.marker?.setPosition({ lat, lng });
      stateRef.current.circle?.setCenter({ lat, lng });
      onChangeRef.current({ lat, lng, radiusMeters, address: results[0].formatted_address });
      setErr(null);
    });
  }
  function useMyLocation() {
    if (!navigator.geolocation) return setErr("Geolocation unsupported");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude, lng = p.coords.longitude;
        stateRef.current.map?.panTo({ lat, lng });
        stateRef.current.map?.setZoom(17);
        stateRef.current.marker?.setPosition({ lat, lng });
        stateRef.current.circle?.setCenter({ lat, lng });
        onChangeRef.current({ lat, lng, radiusMeters });
      },
      (e) => setErr(e.message),
      { enableHighAccuracy: true }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          placeholder: "Search address or place…",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              geocodeSearch();
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", onClick: geocodeSearch, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 mr-1" }),
        " Find"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: useMyLocation, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-4 w-4 mr-1" }),
        " Me"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: mapRef,
        style: { height },
        className: "w-full overflow-hidden rounded-md border bg-muted"
      }
    ),
    !ready && !err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading map…" }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-status-stuck", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
          "Radius: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
            radiusMeters,
            " m"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            min: 25,
            max: 2e3,
            step: 5,
            value: [radiusMeters],
            onValueChange: (v) => onChangeRef.current({ lat: value.lat, lng: value.lng, radiusMeters: v[0] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground self-end", children: value.lat ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Center: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
          value.lat.toFixed(5),
          ", ",
          value.lng.toFixed(5)
        ] })
      ] }) : "Click the map to set the center" })
    ] })
  ] });
}
const ACC_JUMP_FACTOR = 3;
function DeviceLocationPicker({
  value,
  radiusMeters,
  minAccuracyMeters = 100,
  geofenceId = null,
  onChange
}) {
  const audit = useServerFn(logGeofenceEvent);
  const [err, setErr] = reactExports.useState(null);
  const [errKind, setErrKind] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [accuracy, setAccuracy] = reactExports.useState(null);
  const [watching, setWatching] = reactExports.useState(false);
  const [perm, setPerm] = reactExports.useState("unknown");
  const [suspicious, setSuspicious] = reactExports.useState(null);
  const watchIdRef = reactExports.useRef(null);
  const lastAccRef = reactExports.useRef(null);
  const onChangeRef = reactExports.useRef(onChange);
  reactExports.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  reactExports.useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPerm("unsupported");
      return;
    }
    const anyNav = navigator;
    if (!anyNav.permissions?.query) {
      setPerm("unknown");
      return;
    }
    let cancelled = false;
    anyNav.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled) return;
      setPerm(status.state);
      status.onchange = () => setPerm(status.state);
    }).catch(() => setPerm("unknown"));
    return () => {
      cancelled = true;
    };
  }, []);
  reactExports.useEffect(() => () => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);
  const safeAudit = reactExports.useCallback((payload) => {
    audit({ data: { ...payload, geofence_id: geofenceId ?? null } }).catch(() => {
    });
  }, [audit, geofenceId]);
  const handleError = reactExports.useCallback((e, action) => {
    let kind = "other";
    let msg = e.message || "Could not read location";
    if (e.code === 1) {
      kind = "denied";
      msg = "Location permission denied. Enable it for this site in your browser settings, then retry.";
    } else if (e.code === 2) {
      kind = "unavailable";
      msg = "Your device couldn't determine its location. Move outdoors or check GPS / Wi-Fi, then retry.";
    } else if (e.code === 3) {
      kind = "timeout";
      msg = "Location request timed out. Stay still for a few seconds and try again.";
    }
    setErr(msg);
    setErrKind(kind);
    setBusy(false);
    safeAudit({
      action: kind === "denied" ? "permission_denied" : kind === "timeout" ? "permission_timeout" : "permission_denied",
      source: "device",
      metadata: { code: e.code, raw: e.message, on: action }
    });
  }, [safeAudit]);
  const acceptFix = reactExports.useCallback((p, sourceTag) => {
    const lat = Number(p.coords.latitude.toFixed(6));
    const lng = Number(p.coords.longitude.toFixed(6));
    const acc = p.coords.accuracy;
    setAccuracy(acc);
    let reason = null;
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
      action: "capture",
      source: sourceTag,
      latitude: lat,
      longitude: lng,
      accuracy_m: acc,
      is_suspicious: !!reason,
      suspicious_reason: reason
    });
    if (reason) {
      safeAudit({
        action: "suspicious_flagged",
        source: sourceTag,
        latitude: lat,
        longitude: lng,
        accuracy_m: acc,
        is_suspicious: true,
        suspicious_reason: reason
      });
    }
  }, [minAccuracyMeters, radiusMeters, safeAudit]);
  function captureOnce() {
    if (!navigator.geolocation) {
      setErr("Geolocation not supported by this browser");
      setErrKind("other");
      return;
    }
    setErr(null);
    setErrKind(null);
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false);
        acceptFix(p, "device");
      },
      (e) => handleError(e, "capture"),
      { enableHighAccuracy: true, timeout: 15e3, maximumAge: 0 }
    );
  }
  function toggleWatch() {
    if (!navigator.geolocation) {
      setErr("Geolocation not supported");
      setErrKind("other");
      return;
    }
    if (watching && watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatching(false);
      safeAudit({ action: "tracking_stopped", source: "device" });
      return;
    }
    setErr(null);
    setErrKind(null);
    const id = navigator.geolocation.watchPosition(
      (p) => acceptFix(p, "device"),
      (e) => handleError(e, "track"),
      { enableHighAccuracy: true, timeout: 2e4, maximumAge: 1e3 }
    );
    watchIdRef.current = id;
    setWatching(true);
    safeAudit({ action: "tracking_started", source: "device" });
  }
  function manualEdit(lat, lng) {
    setSuspicious(null);
    onChangeRef.current({ lat, lng, radiusMeters });
    safeAudit({ action: "manual_edit", source: "manual", latitude: lat, longitude: lng });
  }
  const hasPos = !!(value.lat || value.lng);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-md border p-3 bg-muted/30", children: [
    perm === "denied" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Location blocked for this site" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-xs", children: [
        "Open your browser's site settings (the padlock icon in the address bar) → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Location → Allow" }),
        ", reload, and try again. You can still enter coordinates manually below."
      ] })
    ] }),
    perm === "prompt" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Permission required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-xs", children: [
        "Click ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Capture" }),
        " and approve the browser prompt to share your current location. Nothing is sent until you allow it."
      ] })
    ] }),
    perm === "unsupported" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Geolocation not supported" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-xs", children: "This browser can't read your device's location. Enter coordinates manually or use a different browser/device." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Use my device location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reads GPS / Wi-Fi position from this browser. No Google Maps billing." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: captureOnce, disabled: busy || perm === "unsupported", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-4 w-4 mr-1" }),
          " ",
          busy ? "Reading…" : "Capture"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: watching ? "default" : "outline", onClick: toggleWatch, disabled: perm === "unsupported", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "h-4 w-4 mr-1" }),
          " ",
          watching ? "Stop" : "Track"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Latitude" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "decimal",
            value: value.lat || "",
            onChange: (e) => manualEdit(Number(e.target.value) || 0, value.lng),
            placeholder: "-33.8688"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Longitude" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            inputMode: "decimal",
            value: value.lng || "",
            onChange: (e) => manualEdit(value.lat, Number(e.target.value) || 0),
            placeholder: "151.2093"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
        "Radius: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
          radiusMeters,
          " m"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Slider,
        {
          min: 25,
          max: 2e3,
          step: 5,
          value: [radiusMeters],
          onValueChange: (v) => onChangeRef.current({ lat: value.lat, lng: value.lng, radiusMeters: v[0] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground", children: [
      hasPos && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
        value.lat.toFixed(5),
        ", ",
        value.lng.toFixed(5)
      ] }),
      accuracy != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: accuracy > minAccuracyMeters ? "text-status-stuck" : "", children: [
        "±",
        Math.round(accuracy),
        " m accuracy"
      ] }),
      hasPos && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          className: "underline hover:text-foreground",
          href: `https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=18/${value.lat}/${value.lng}`,
          target: "_blank",
          rel: "noreferrer",
          children: "Preview on OpenStreetMap"
        }
      ),
      watching && !suspicious && accuracy != null && accuracy <= minAccuracyMeters && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-status-done", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        " Good fix"
      ] })
    ] }),
    suspicious && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Suspicious location reading" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-xs", children: [
        suspicious,
        ". Flagged in the geofence audit log."
      ] })
    ] }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: errKind === "timeout" ? "default" : "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: errKind === "denied" ? "Permission denied" : errKind === "timeout" ? "Location request timed out" : errKind === "unavailable" ? "Location unavailable" : "Couldn't read location" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-xs space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: err }),
        errKind !== "denied" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: captureOnce, children: "Retry capture" })
      ] })
    ] }),
    !hasPos && !err && perm !== "denied" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Tap ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Capture" }),
      " while standing at the site to pin its centre, or paste coordinates manually."
    ] })
  ] });
}
function detectPlatform() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}
const STEPS = {
  ios: [
    { title: "Use Safari (iOS quirk)", body: "Background location in iOS browsers only works in Safari, not Chrome/Firefox on iOS. They all share the WebKit engine but Safari is the most reliable host." },
    { title: "Allow Precise Location", body: "Settings → Privacy & Security → Location Services → Safari Websites → set Allow Location Access to While Using the App, and turn Precise Location ON." },
    { title: "Install as PWA", body: "In Safari, tap the Share icon → Add to Home Screen. Open the app from the new home-screen icon — this is the only mode where iOS keeps the page running with the screen off." },
    { title: "Keep the screen awake", body: "iOS aggressively suspends inactive tabs. While clocking in/out, keep the PWA in the foreground or enable Guided Access for long shifts." },
    { title: "Test the toggle", body: "Lock the screen for ~30 seconds, then re-open. The audit log should show new capture events with source=background." }
  ],
  android: [
    { title: "Use Chrome (latest)", body: "Background tracking is best supported in Chrome 88+. Make sure Chrome is updated from the Play Store." },
    { title: "Grant location while in use", body: "Settings → Apps → Chrome → Permissions → Location → Allow only while using the app. ‘Precise’ must be on." },
    { title: "Install the PWA", body: "Open the site in Chrome → tap the ⋮ menu → Install app (or Add to Home Screen). Run it from the home-screen icon for the best results." },
    { title: "Disable battery optimization", body: "Settings → Apps → Chrome (or the installed PWA) → Battery → Unrestricted. This prevents Android Doze from killing the location watcher." },
    { title: "Allow background usage", body: "Some OEMs (Samsung, Xiaomi) need extra: Settings → Battery → Background usage limits → Never sleep. Disable any 'Adaptive Battery' restrictions for this app." },
    { title: "Test the toggle", body: "Lock the screen for ~60 seconds. Open the app — there should be new capture rows in the audit log with source=background." }
  ],
  desktop: [
    { title: "Allow location in the browser", body: "Click the padlock/info icon next to the URL → Site settings → Location → Allow." },
    { title: "Keep the tab visible", body: "Browsers throttle background tabs. Keep this tab pinned or visible while tracking." },
    { title: "Test the toggle", body: "Move 20–30m or change networks and watch the audit log refresh; you should see new capture rows." }
  ]
};
function GeofenceTroubleshootWizard({
  open,
  onOpenChange,
  initialPlatform
}) {
  const [platform, setPlatform] = reactExports.useState(initialPlatform ?? detectPlatform());
  const [step, setStep] = reactExports.useState(0);
  const steps = reactExports.useMemo(() => STEPS[platform], [platform]);
  const last = step >= steps.length - 1;
  function pick(p) {
    setPlatform(p);
    setStep(0);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }),
      " Enable background location"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      ["ios", "android", "desktop"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: platform === p ? "default" : "outline",
          onClick: () => pick(p),
          className: "capitalize",
          children: p
        },
        p
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "ml-auto", children: [
        "Step ",
        step + 1,
        " / ",
        steps.length
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4 min-h-[160px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium mb-2", children: steps[step].title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: steps[step].body })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", disabled: step === 0, onClick: () => setStep((s) => s - 1), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 mr-1" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          className: "text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline",
          href: "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API",
          target: "_blank",
          rel: "noreferrer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
            " Geolocation docs"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: last ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => onOpenChange(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-1" }),
        " Done"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setStep((s) => s + 1), children: [
        "Next ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 ml-1" })
      ] }) })
    ] })
  ] }) });
}
function TroubleshootButton({ size = "sm" }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size, variant: "outline", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-3.5 w-3.5 mr-1" }),
      " Troubleshoot"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GeofenceTroubleshootWizard, { open, onOpenChange: setOpen })
  ] });
}
const blank = () => ({
  name: "",
  latitude: 0,
  longitude: 0,
  radius_meters: 150,
  is_active: true,
  notes: "",
  background_tracking_enabled: false,
  min_accuracy_meters: 100
});
function GeofencePage() {
  const list = useServerFn(listGeofences);
  const up = useServerFn(upsertGeofence);
  const del = useServerFn(deleteGeofence);
  const audit = useServerFn(logGeofenceEvent);
  const [rows, setRows] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(blank());
  async function refresh() {
    const r = await list();
    setRows(r.geofences);
  }
  reactExports.useEffect(() => {
    refresh();
  }, []);
  async function save() {
    if (!editing.name.trim()) return toast.error("Name required");
    if (!editing.latitude || !editing.longitude) return toast.error("Set a location");
    try {
      const isNew = !editing.id;
      const {
        geofence
      } = await up({
        data: {
          ...editing,
          latitude: Number(editing.latitude),
          longitude: Number(editing.longitude),
          radius_meters: Number(editing.radius_meters),
          min_accuracy_meters: Number(editing.min_accuracy_meters) || 100,
          background_tracking_enabled: !!editing.background_tracking_enabled
        }
      });
      audit({
        data: {
          geofence_id: geofence?.id ?? null,
          action: isNew ? "create" : "update",
          source: "manual",
          latitude: Number(editing.latitude),
          longitude: Number(editing.longitude),
          metadata: {
            radius_meters: Number(editing.radius_meters),
            background: !!editing.background_tracking_enabled
          }
        }
      }).catch(() => {
      });
      toast.success("Saved");
      setOpen(false);
      setEditing(blank());
      await refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function remove(r) {
    await del({
      data: {
        id: r.id
      }
    });
    audit({
      data: {
        geofence_id: r.id,
        action: "delete",
        source: "manual"
      }
    }).catch(() => {
    });
    refresh();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Signing geofences", subtitle: "Hard-enforced locations for in-person e-signatures", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
    setEditing(blank());
    setOpen(true);
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
    " Add geofence"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 md:p-6 space-y-4 max-w-6xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "fences", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "fences", children: "Locations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "audit", children: "Audit log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "simulator", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5 mr-1" }),
          " Simulator"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "reconciliation", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5 mr-1" }),
          " Reconciliation"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "fences", className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Approved signing locations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "When an envelope requires geofencing, signers must be within one of these circles." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Coordinates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Radius" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Min accuracy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Background" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-6", children: "No geofences yet" }) }),
            rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
                r.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
                Number(r.latitude).toFixed(5),
                ", ",
                Number(r.longitude).toFixed(5)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                r.radius_meters,
                "m"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                "±",
                r.min_accuracy_meters ?? 100,
                "m"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.background_tracking_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "On" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Off" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_active ? "Yes" : "No" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                  setEditing({
                    ...r,
                    notes: r.notes ?? "",
                    min_accuracy_meters: r.min_accuracy_meters ?? 100,
                    background_tracking_enabled: !!r.background_tracking_enabled
                  });
                  setOpen(true);
                }, children: "Edit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }, r.id))
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "audit", className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditPanel, { geofences: rows }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "simulator", className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SimulatorPanel, { geofences: rows }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "reconciliation", className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReconciliationPanel, { geofences: rows }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing.id ? "Edit geofence" : "New geofence" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.name, onChange: (e) => setEditing({
            ...editing,
            name: e.target.value
          }), placeholder: "Sydney HQ" })
        ] }),
        (() => {
          const pickerValue = {
            lat: Number(editing.latitude) || 0,
            lng: Number(editing.longitude) || 0
          };
          const pickerRadius = Number(editing.radius_meters) || 150;
          const onPick = (n) => setEditing((e) => ({
            ...e,
            latitude: Number(n.lat.toFixed(6)),
            longitude: Number(n.lng.toFixed(6)),
            radius_meters: n.radiusMeters
          }));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "map", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "device", children: "Device location (free)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "map", disabled: false, children: "Map picker" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "device", className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceLocationPicker, { value: pickerValue, radiusMeters: pickerRadius, onChange: onPick, geofenceId: editing.id ?? null, minAccuracyMeters: Number(editing.min_accuracy_meters) || 100 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "map", className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleMapPicker, { value: pickerValue, radiusMeters: pickerRadius, onChange: onPick }) })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Minimum GPS accuracy (m)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 5, max: 2e3, value: editing.min_accuracy_meters ?? 100, onChange: (e) => setEditing({
              ...editing,
              min_accuracy_meters: Number(e.target.value) || 100
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Captures worse than this are flagged in the audit log." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!editing.background_tracking_enabled, onCheckedChange: (v) => setEditing({
              ...editing,
              background_tracking_enabled: !!v
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Background tracking" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Keeps watching while the tab/PWA stays open." })
            ] }),
            !!editing.background_tracking_enabled && /* @__PURE__ */ jsxRuntimeExports.jsx(TroubleshootButton, {})
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.notes ?? "", onChange: (e) => setEditing({
            ...editing,
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: editing.is_active, onCheckedChange: (v) => setEditing({
            ...editing,
            is_active: !!v
          }) }),
          " Active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Save" }) })
    ] }) })
  ] });
}
function csvCell(v) {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}
function downloadBlob(filename, content, type) {
  const blob = new Blob([content], {
    type
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}
function AuditPanel({
  geofences
}) {
  const list = useServerFn(listGeofenceAudit);
  const [rows, setRows] = reactExports.useState([]);
  const [suspiciousOnly, setSuspiciousOnly] = reactExports.useState(false);
  const [geofenceId, setGeofenceId] = reactExports.useState("all");
  const [actor, setActor] = reactExports.useState("");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function refresh() {
    setLoading(true);
    try {
      const r = await list({
        data: {
          limit: 500,
          suspicious_only: suspiciousOnly || void 0,
          geofence_id: geofenceId !== "all" ? geofenceId : void 0,
          actor_user_id: /^[0-9a-f-]{36}$/i.test(actor) ? actor : void 0,
          from: from ? new Date(from).toISOString() : void 0,
          to: to ? new Date(to).toISOString() : void 0
        }
      });
      setRows(r.rows);
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    refresh();
  }, [suspiciousOnly, geofenceId]);
  function exportCsv() {
    const headers = ["created_at", "action", "source", "geofence_id", "actor_user_id", "latitude", "longitude", "accuracy_m", "is_suspicious", "suspicious_reason"];
    const lines = [headers.join(",")].concat(rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")));
    downloadBlob(`geofence-audit-${Date.now()}.csv`, lines.join("\n"), "text/csv");
  }
  function exportPdf() {
    const w = window.open("", "_blank");
    if (!w) return toast.error("Pop-up blocked");
    const css = `body{font:12px system-ui;margin:24px;color:#111}h1{font-size:16px;margin:0 0 12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:4px 6px;text-align:left;font-size:11px}th{background:#f3f3f3}tr.sus{background:#fff5f5}`;
    const fname = geofences.find((g) => g.id === geofenceId)?.name ?? "All geofences";
    const html = `<!doctype html><html><head><title>Geofence audit</title><style>${css}</style></head><body>
      <h1>Geofence audit log — ${fname}</h1>
      <p>Generated ${(/* @__PURE__ */ new Date()).toLocaleString()} · ${rows.length} rows · Filters: ${suspiciousOnly ? "suspicious only · " : ""}${from || "—"} → ${to || "—"}</p>
      <table><thead><tr><th>When</th><th>Action</th><th>Source</th><th>Coords</th><th>Acc</th><th>Actor</th><th>Flag</th></tr></thead>
      <tbody>${rows.map((r) => `<tr class="${r.is_suspicious ? "sus" : ""}">
        <td>${new Date(r.created_at).toLocaleString()}</td><td>${r.action}</td><td>${r.source ?? ""}</td>
        <td>${r.latitude != null ? Number(r.latitude).toFixed(5) + ", " + Number(r.longitude).toFixed(5) : ""}</td>
        <td>${r.accuracy_m != null ? "±" + Math.round(r.accuracy_m) + "m" : ""}</td>
        <td>${(r.actor_user_id ?? "").slice(0, 8)}</td>
        <td>${r.is_suspicious ? r.suspicious_reason ?? "Flagged" : ""}</td>
      </tr>`).join("")}</tbody></table>
      <script>window.onload=()=>setTimeout(()=>window.print(),200)<\/script></body></html>`;
    w.document.write(html);
    w.document.close();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Geofence audit log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Every capture, manual edit, permission event, and suspicious flag." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Geofence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: geofenceId, onValueChange: setGeofenceId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
              geofences.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Actor (user id)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9 w-[280px] font-mono text-xs", value: actor, onChange: (e) => setActor(e.target.value), placeholder: "uuid" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", className: "h-9", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", className: "h-9", value: to, onChange: (e) => setTo(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: suspiciousOnly, onCheckedChange: (v) => setSuspiciousOnly(!!v) }),
          " Suspicious only"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: refresh, disabled: loading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}` }),
          " Apply"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: exportCsv, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1" }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: exportPdf, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 mr-1" }),
          " PDF"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Coords" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Accuracy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Actor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Flag" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-6", children: "No events" }) }),
          rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: r.is_suspicious ? "bg-status-stuck/5" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: new Date(r.created_at).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: r.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.source ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-[11px]", children: r.latitude != null ? `${Number(r.latitude).toFixed(5)}, ${Number(r.longitude).toFixed(5)}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.accuracy_m != null ? `±${Math.round(r.accuracy_m)}m` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] font-mono", children: r.actor_user_id?.slice(0, 8) ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_suspicious && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-status-stuck", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
              " ",
              r.suspicious_reason ?? "Flagged"
            ] }) })
          ] }, r.id))
        ] })
      ] })
    ] })
  ] });
}
function SimulatorPanel({
  geofences
}) {
  const list = useServerFn(listSimTraces);
  const save = useServerFn(saveSimTrace);
  const del = useServerFn(deleteSimTrace);
  const audit = useServerFn(logGeofenceEvent);
  const [traces, setTraces] = reactExports.useState([]);
  const [selectedTrace, setSelectedTrace] = reactExports.useState("");
  const [fenceId, setFenceId] = reactExports.useState(geofences[0]?.id ?? "");
  const [running, setRunning] = reactExports.useState(false);
  const [log, setLog] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState({
    name: "",
    description: "",
    pointsText: ""
  });
  async function refresh() {
    setTraces((await list()).traces);
  }
  reactExports.useEffect(() => {
    refresh();
  }, []);
  reactExports.useEffect(() => {
    if (!fenceId && geofences[0]) setFenceId(geofences[0].id);
  }, [geofences, fenceId]);
  const fence = reactExports.useMemo(() => geofences.find((g) => g.id === fenceId), [geofences, fenceId]);
  const trace = reactExports.useMemo(() => traces.find((t) => t.id === selectedTrace), [traces, selectedTrace]);
  async function saveTrace() {
    try {
      const points = draft.pointsText.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        const [lat, lng, acc] = l.split(/[,\s]+/).map(Number);
        return {
          lat,
          lng,
          accuracy_m: acc || 20,
          t_offset_ms: 0
        };
      });
      if (!points.length) return toast.error("Add at least one point");
      await save({
        data: {
          name: draft.name || "Untitled trace",
          description: draft.description,
          points
        }
      });
      toast.success("Trace saved");
      setOpen(false);
      setDraft({
        name: "",
        description: "",
        pointsText: ""
      });
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function runSim() {
    if (!fence || !trace) return toast.error("Pick a geofence and trace");
    setRunning(true);
    setLog([]);
    let inside = false;
    audit({
      data: {
        geofence_id: fence.id,
        action: "simulation_run",
        source: "simulation",
        metadata: {
          trace_id: trace.id,
          points: trace.points.length
        }
      }
    }).catch(() => {
    });
    for (let i = 0; i < trace.points.length; i++) {
      const p = trace.points[i];
      const dist = distanceMeters(p.lat, p.lng, Number(fence.latitude), Number(fence.longitude));
      const wasInside = inside;
      inside = dist <= Number(fence.radius_meters);
      const event = !wasInside && inside ? "ENTER" : wasInside && !inside ? "EXIT" : "—";
      const flagged = p.accuracy_m && p.accuracy_m > (fence.min_accuracy_meters ?? 100);
      setLog((l) => [...l, `#${i + 1} d=${Math.round(dist)}m acc=±${p.accuracy_m ?? "?"}m ${event}${flagged ? " ⚠ low-acc" : ""}`]);
      audit({
        data: {
          geofence_id: fence.id,
          action: "simulation_point",
          source: "simulation",
          latitude: p.lat,
          longitude: p.lng,
          accuracy_m: p.accuracy_m,
          is_suspicious: !!flagged,
          suspicious_reason: flagged ? "Simulated low-accuracy fix" : null,
          metadata: {
            event,
            distance_m: Math.round(dist),
            index: i
          }
        }
      }).catch(() => {
      });
      await new Promise((r) => setTimeout(r, 150));
    }
    setRunning(false);
    toast.success(`Simulation complete (${trace.points.length} points)`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Stored traces" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Replay these against a fence — your real GPS is untouched." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          " New trace"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Points" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          traces.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground py-6", children: "No saved traces" }) }),
          traces.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: selectedTrace === t.id ? "bg-muted/50" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "cursor-pointer", onClick: () => setSelectedTrace(t.id), children: t.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t.points?.length ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedTrace(t.id), children: "Pick" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: async () => {
                await del({
                  data: {
                    id: t.id
                  }
                });
                refresh();
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, t.id))
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Run simulation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Drive enter/exit logic against any fence, with audit entries." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Geofence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fenceId, onValueChange: setFenceId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick fence" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: geofences.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trace" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedTrace, onValueChange: setSelectedTrace, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick trace" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: traces.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: runSim, disabled: running || !fence || !trace, children: [
          running ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-3.5 w-3.5 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5 mr-1" }),
          running ? "Running…" : "Run"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border bg-muted/30 p-3 font-mono text-[11px] min-h-[160px] max-h-[280px] overflow-auto", children: log.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "No output yet" }) : log.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: l }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New simulation trace" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.name, onChange: (e) => setDraft({
            ...draft,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.description, onChange: (e) => setDraft({
            ...draft,
            description: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Points (one per line: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "lat, lng, accuracy_m" }),
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 8, className: "font-mono text-xs", placeholder: "-33.8688, 151.2093, 15\n-33.8690, 151.2095, 18", value: draft.pointsText, onChange: (e) => setDraft({
            ...draft,
            pointsText: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveTrace, children: "Save trace" }) })
    ] }) })
  ] });
}
function ReconciliationPanel({
  geofences
}) {
  const list = useServerFn(listReconciliation);
  const resolve = useServerFn(resolveReconciliation);
  const run = useServerFn(runReconciliation);
  const [rows, setRows] = reactExports.useState([]);
  const [status, setStatus] = reactExports.useState("open");
  const [busy, setBusy] = reactExports.useState(false);
  const fenceName = (id) => geofences.find((g) => g.id === id)?.name ?? "—";
  async function refresh() {
    setRows((await list({
      data: {
        status
      }
    })).rows);
  }
  reactExports.useEffect(() => {
    refresh();
  }, [status]);
  async function runJob() {
    setBusy(true);
    try {
      const r = await run({
        data: {
          lookback_hours: 72
        }
      });
      toast.success(`Scanned ${r.scanned}, created ${r.created}`);
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function act(id, st) {
    await resolve({
      data: {
        id,
        status: st
      }
    });
    refresh();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Geofence reconciliation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Mismatches between geofence captures and attendance punches." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["open", "reviewed", "resolved", "dismissed", "all"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: runJob, disabled: busy, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 mr-1 ${busy ? "animate-spin" : ""}` }),
          " Run now"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Geofence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-6", children: "Nothing in queue" }) }),
        rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: new Date(r.event_time).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: r.mismatch_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: fenceName(r.geofence_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-[11px] font-mono", children: JSON.stringify(r.details ?? {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "open" ? "default" : "secondary", children: r.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right space-x-1", children: r.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => act(r.id, "reviewed"), children: "Review" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => act(r.id, "resolved"), children: "Resolve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => act(r.id, "dismissed"), children: "Dismiss" })
          ] }) })
        ] }, r.id))
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminGate, { allow: ADMIN_LAYOUT_ROLES, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GeofencePage, {}) });
export {
  SplitComponent as component
};
