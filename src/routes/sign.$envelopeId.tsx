import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSigningEnvelope, submitSignature, declineEnvelope } from "@/lib/documents.functions";
import { sanitizeDocHtml } from "@/lib/doc-html-sanitize";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Pen, Type, Eraser } from "lucide-react";

export const Route = createFileRoute("/sign/$envelopeId")({
  head: () => ({ meta: [{ title: "Sign document — hrppl" }] }),
  component: SignPage,
});

function SignPage() {
  const { envelopeId } = useParams({ from: "/sign/$envelopeId" });
  const navigate = useNavigate();
  const load = useServerFn(getSigningEnvelope);
  const sign = useServerFn(submitSignature);
  const decline = useServerFn(declineEnvelope);

  const [data, setData] = useState<any | null>(null);
  const [typed, setTyped] = useState("");
  const [consent, setConsent] = useState(false);
  const [method, setMethod] = useState<"typed" | "drawn">("typed");
  const [working, setWorking] = useState(false);
  const [geo, setGeo] = useState<{ latitude: number; longitude: number; accuracy_m?: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const pathsRef = useRef<Array<Array<[number, number]>>>([]);
  const currentRef = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    load({ data: { envelope_id: envelopeId } }).then(setData).catch((e) => {
      toast.error(e.message);
      navigate({ to: "/me/signatures" });
    });
  }, [envelopeId]);

  function captureLocation() {
    if (!("geolocation" in navigator)) { setGeoErr("Geolocation is not supported in this browser."); return; }
    setGeoLoading(true); setGeoErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeo({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy_m: p.coords.accuracy });
        setGeoLoading(false);
      },
      (err) => { setGeoErr(err.message || "Could not get location"); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function svgFromPaths() {
    if (pathsRef.current.length === 0) return "";
    const paths = pathsRef.current.map((p) => {
      const d = p.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
      return `<path d="${d}" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200">${paths}</svg>`;
  }

  function clearCanvas() {
    pathsRef.current = [];
    const c = canvasRef.current; if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - r.left) * (600 / r.width), (e.clientY - r.top) * (200 / r.height)];
  }

  async function doSign() {
    if (!consent) return toast.error("You must agree to the terms");
    if (data?.envelope?.require_geofence && !geo) return toast.error("Capture your location before signing");
    setWorking(true);
    try {
      const drawn = method === "drawn" ? svgFromPaths() : undefined;
      if (method === "drawn" && !drawn) throw new Error("Please draw your signature");
      if (method === "typed" && !typed.trim()) throw new Error("Please type your name");
      const r = await sign({ data: {
        envelope_id: envelopeId, method, typed: method === "typed" ? typed : undefined,
        drawn_svg: drawn, consent: true,
        geo: geo ?? undefined,
      } });
      toast.success("Signed");
      navigate({ to: "/me/signatures" });
    } catch (e: any) { toast.error(e.message); }
    finally { setWorking(false); }
  }

  async function doDecline() {
    const reason = prompt("Reason for declining?");
    if (!reason) return;
    await decline({ data: { envelope_id: envelopeId, reason } });
    toast.success("Declined");
    navigate({ to: "/me/signatures" });
  }

  if (!data) return <AppShell title="Sign"><div className="p-6 text-muted-foreground">Loading…</div></AppShell>;
  const alreadySigned = data.signer.status === "signed";
  const alreadyDeclined = data.signer.status === "declined";
  const envClosed = ["completed", "cancelled", "declined", "expired"].includes(data.envelope.status);

  return (
    <AppShell title={data.envelope.subject} subtitle={data.envelope.doc_type.replace(/_/g, " ")}>
      <div className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-[1fr_360px] md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Document</CardTitle>
            <Badge variant={alreadySigned ? "default" : "secondary"}>{data.signer.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-card p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeDocHtml(data.envelope.body_html_snapshot) }} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pen className="h-4 w-4" /> Sign</CardTitle>
              <CardDescription>Adopt your signature below. Your IP, browser and timestamp will be recorded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alreadySigned ? (
                <div className="flex items-center gap-2 rounded-md border border-status-done bg-status-done/10 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-status-done" />
                  Signed on {data.signer.signed_at ? new Date(data.signer.signed_at).toLocaleString() : ""}
                </div>
              ) : alreadyDeclined ? (
                <div className="flex items-center gap-2 rounded-md border border-status-stuck bg-status-stuck/10 p-3 text-sm">
                  <XCircle className="h-4 w-4 text-status-stuck" /> Declined
                </div>
              ) : envClosed ? (
                <div className="text-sm text-muted-foreground">This envelope is closed.</div>
              ) : (
                <>
                  <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="typed"><Type className="h-3.5 w-3.5 mr-1" /> Type</TabsTrigger>
                      <TabsTrigger value="drawn"><Pen className="h-3.5 w-3.5 mr-1" /> Draw</TabsTrigger>
                    </TabsList>
                    <TabsContent value="typed" className="space-y-2">
                      <Label>Type your full legal name</Label>
                      <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={data.signer.signer_name} />
                      {typed && (
                        <div className="rounded-md border bg-muted/30 p-3 text-center"
                          style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive", fontSize: 28 }}>
                          {typed}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="drawn" className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Draw your signature</Label>
                        <Button size="sm" variant="ghost" onClick={clearCanvas}><Eraser className="h-3.5 w-3.5 mr-1" /> Clear</Button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full touch-none rounded-md border bg-white"
                        onPointerDown={(e) => {
                          drawingRef.current = true;
                          currentRef.current = [pos(e)];
                          (e.currentTarget as Element).setPointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                          if (!drawingRef.current) return;
                          const p = pos(e); currentRef.current.push(p);
                          const ctx = canvasRef.current!.getContext("2d")!;
                          ctx.strokeStyle = "black"; ctx.lineWidth = 2; ctx.lineCap = "round";
                          const arr = currentRef.current;
                          if (arr.length >= 2) {
                            const [x1, y1] = arr[arr.length - 2];
                            const [x2, y2] = arr[arr.length - 1];
                            const sx = canvasRef.current!.width / 600;
                            const sy = canvasRef.current!.height / 200;
                            ctx.beginPath(); ctx.moveTo(x1 * sx, y1 * sy); ctx.lineTo(x2 * sx, y2 * sy); ctx.stroke();
                          }
                        }}
                        onPointerUp={() => {
                          drawingRef.current = false;
                          if (currentRef.current.length > 1) pathsRef.current.push(currentRef.current);
                          currentRef.current = [];
                        }}
                      />
                    </TabsContent>
                  </Tabs>

                  {data.envelope.require_geofence ? (
                    <div className="rounded-md border border-status-pending/40 bg-status-pending/5 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">Location verification required</span>
                        {geo ? <Badge className="bg-status-done/20 text-status-done border-0">Captured</Badge> : null}
                      </div>
                      <p className="text-muted-foreground">This document must be signed from an approved location. We'll capture your coordinates only — never tracking after signing.</p>
                      {geo ? (
                        <div className="font-mono text-[11px]">{geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)} (±{Math.round(geo.accuracy_m ?? 0)}m)</div>
                      ) : null}
                      {geoErr ? <div className="text-status-stuck">{geoErr}</div> : null}
                      <Button type="button" size="sm" variant="outline" onClick={captureLocation} disabled={geoLoading}>
                        {geoLoading ? "Locating…" : geo ? "Recapture location" : "Capture my location"}
                      </Button>
                    </div>
                  ) : null}

                  <label className="flex items-start gap-2 text-xs">
                    <Checkbox checked={consent} onCheckedChange={(c) => setConsent(!!c)} />
                    <span>I agree that my electronic signature is the legal equivalent of my handwritten signature on this document.</span>
                  </label>

                  <div className="flex gap-2">
                    <Button className="flex-1" disabled={working || !consent || (data.envelope.require_geofence && !geo)} onClick={doSign}>
                      {working ? "Signing…" : "Sign document"}
                    </Button>
                    <Button variant="outline" onClick={doDecline}>Decline</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
