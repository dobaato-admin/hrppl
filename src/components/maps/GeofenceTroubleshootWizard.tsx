import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Smartphone, HelpCircle } from "lucide-react";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

const STEPS: Record<Platform, { title: string; body: string }[]> = {
  ios: [
    { title: "Use Safari (iOS quirk)", body: "Background location in iOS browsers only works in Safari, not Chrome/Firefox on iOS. They all share the WebKit engine but Safari is the most reliable host." },
    { title: "Allow Precise Location", body: "Settings → Privacy & Security → Location Services → Safari Websites → set Allow Location Access to While Using the App, and turn Precise Location ON." },
    { title: "Install as PWA", body: "In Safari, tap the Share icon → Add to Home Screen. Open the app from the new home-screen icon — this is the only mode where iOS keeps the page running with the screen off." },
    { title: "Keep the screen awake", body: "iOS aggressively suspends inactive tabs. While clocking in/out, keep the PWA in the foreground or enable Guided Access for long shifts." },
    { title: "Test the toggle", body: "Lock the screen for ~30 seconds, then re-open. The audit log should show new capture events with source=background." },
  ],
  android: [
    { title: "Use Chrome (latest)", body: "Background tracking is best supported in Chrome 88+. Make sure Chrome is updated from the Play Store." },
    { title: "Grant location while in use", body: "Settings → Apps → Chrome → Permissions → Location → Allow only while using the app. ‘Precise’ must be on." },
    { title: "Install the PWA", body: "Open the site in Chrome → tap the ⋮ menu → Install app (or Add to Home Screen). Run it from the home-screen icon for the best results." },
    { title: "Disable battery optimization", body: "Settings → Apps → Chrome (or the installed PWA) → Battery → Unrestricted. This prevents Android Doze from killing the location watcher." },
    { title: "Allow background usage", body: "Some OEMs (Samsung, Xiaomi) need extra: Settings → Battery → Background usage limits → Never sleep. Disable any 'Adaptive Battery' restrictions for this app." },
    { title: "Test the toggle", body: "Lock the screen for ~60 seconds. Open the app — there should be new capture rows in the audit log with source=background." },
  ],
  desktop: [
    { title: "Allow location in the browser", body: "Click the padlock/info icon next to the URL → Site settings → Location → Allow." },
    { title: "Keep the tab visible", body: "Browsers throttle background tabs. Keep this tab pinned or visible while tracking." },
    { title: "Test the toggle", body: "Move 20–30m or change networks and watch the audit log refresh; you should see new capture rows." },
  ],
};

export function GeofenceTroubleshootWizard({
  open,
  onOpenChange,
  initialPlatform,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPlatform?: Platform;
}) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform ?? detectPlatform());
  const [step, setStep] = useState(0);
  const steps = useMemo(() => STEPS[platform], [platform]);
  const last = step >= steps.length - 1;

  function pick(p: Platform) {
    setPlatform(p); setStep(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Enable background location
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          {(["ios", "android", "desktop"] as Platform[]).map((p) => (
            <Button key={p} size="sm" variant={platform === p ? "default" : "outline"}
              onClick={() => pick(p)} className="capitalize">{p}</Button>
          ))}
          <Badge variant="secondary" className="ml-auto">Step {step + 1} / {steps.length}</Badge>
        </div>
        <div className="rounded-lg border bg-card p-4 min-h-[160px]">
          <h4 className="font-medium mb-2">{steps[step].title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{steps[step].body}</p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <a className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline"
            href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API"
            target="_blank" rel="noreferrer">
            <ExternalLink className="h-3 w-3" /> Geolocation docs
          </a>
          <div className="ml-auto">
            {last ? (
              <Button size="sm" onClick={() => onOpenChange(false)}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Done
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TroubleshootButton({ size = "sm" as const }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} variant="outline" onClick={() => setOpen(true)}>
        <HelpCircle className="h-3.5 w-3.5 mr-1" /> Troubleshoot
      </Button>
      <GeofenceTroubleshootWizard open={open} onOpenChange={setOpen} />
    </>
  );
}
