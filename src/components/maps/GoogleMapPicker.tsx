import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __gmapsLoading?: Promise<void>;
    __gmapsInit?: () => void;
  }
}

const KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  if (!KEY) return Promise.reject(new Error("Google Maps key missing"));
  window.__gmapsLoading = new Promise<void>((resolve, reject) => {
    window.__gmapsInit = () => resolve();
    const s = document.createElement("script");
    const params = new URLSearchParams({
      key: KEY,
      v: "weekly",
      libraries: "places",
      loading: "async",
      callback: "__gmapsInit",
    });
    if (CHANNEL) params.set("channel", CHANNEL);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
}

export type LatLng = { lat: number; lng: number };

export interface GoogleMapPickerProps {
  value: LatLng;
  radiusMeters: number;
  onChange: (next: { lat: number; lng: number; radiusMeters: number; address?: string }) => void;
  height?: number;
}

export function GoogleMapPicker({ value, radiusMeters, onChange, height = 320 }: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<{ map?: any; marker?: any; circle?: any }>({});
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");

  // Always keep latest onChange in a ref so map listeners read fresh values.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let mounted = true;
    loadMaps()
      .then(() => {
        if (!mounted || !mapRef.current || !window.google?.maps) return;
        const g = window.google.maps;
        const center = (value.lat || value.lng)
          ? { lat: Number(value.lat), lng: Number(value.lng) }
          : { lat: -33.8688, lng: 151.2093 };
        const map = new g.Map(mapRef.current, {
          center,
          zoom: value.lat || value.lng ? 16 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new g.Marker({ map, position: center, draggable: true });
        const circle = new g.Circle({
          map, center, radius: radiusMeters,
          fillColor: "#3b82f6", fillOpacity: 0.15,
          strokeColor: "#3b82f6", strokeOpacity: 0.9, strokeWeight: 2,
        });
        const move = (lat: number, lng: number) => {
          marker.setPosition({ lat, lng });
          circle.setCenter({ lat, lng });
          onChangeRef.current({ lat, lng, radiusMeters });
        };
        marker.addListener("dragend", (e: any) => move(e.latLng.lat(), e.latLng.lng()));
        map.addListener("click", (e: any) => move(e.latLng.lat(), e.latLng.lng()));
        stateRef.current = { map, marker, circle };
        setReady(true);
      })
      .catch((e) => setErr(e.message));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync circle radius when prop changes
  useEffect(() => {
    if (stateRef.current.circle) stateRef.current.circle.setRadius(radiusMeters);
  }, [radiusMeters]);

  // Re-center when external value changes meaningfully
  useEffect(() => {
    const { map, marker, circle } = stateRef.current;
    if (!map || !marker || !circle) return;
    const pos = marker.getPosition?.();
    if (!pos) return;
    if (Math.abs(pos.lat() - value.lat) > 1e-6 || Math.abs(pos.lng() - value.lng) > 1e-6) {
      const p = { lat: Number(value.lat), lng: Number(value.lng) };
      marker.setPosition(p); circle.setCenter(p); map.panTo(p);
    }
  }, [value.lat, value.lng]);

  async function geocodeSearch() {
    if (!search.trim() || !window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: search }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.length) { setErr("Address not found"); return; }
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
      { enableHighAccuracy: true },
    );
  }

  if (!KEY) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Google Maps isn't configured. Ask an admin to link the Google Maps connector.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Search address or place…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeSearch(); } }}
        />
        <Button type="button" variant="secondary" onClick={geocodeSearch}>
          <MapPin className="h-4 w-4 mr-1" /> Find
        </Button>
        <Button type="button" variant="outline" onClick={useMyLocation}>
          <LocateFixed className="h-4 w-4 mr-1" /> Me
        </Button>
      </div>
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-md border bg-muted"
      />
      {!ready && !err && <p className="text-xs text-muted-foreground">Loading map…</p>}
      {err && <p className="text-xs text-status-stuck">{err}</p>}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label className="text-xs">Radius: <span className="font-mono">{radiusMeters} m</span></Label>
          <Slider
            min={25} max={2000} step={5}
            value={[radiusMeters]}
            onValueChange={(v) => onChangeRef.current({ lat: value.lat, lng: value.lng, radiusMeters: v[0] })}
          />
        </div>
        <div className="text-xs text-muted-foreground self-end">
          {value.lat ? <>Center: <span className="font-mono">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</span></> : "Click the map to set the center"}
        </div>
      </div>
    </div>
  );
}
