/**
 * The floating clock — clock in/out from anywhere in the app.
 *
 * Clocking in is the first thing most people do each day and the one action
 * that gates everything downstream: no punch, no timesheet, no hours, no pay.
 * It used to live only at `/attendance`, three navigation steps into an app
 * with 101 sidebar entries, which is a long walk for the most frequent action
 * in the product. It is now on every authenticated page.
 *
 * ## Design notes that are load-bearing, not cosmetic
 *
 * **The timestamp is captured on click.** `clientTime` is read the instant the
 * button is pressed, *before* awaiting geolocation — and geolocation is allowed
 * eight seconds. The server previously stamped its own `new Date()` inside the
 * handler, so a punch was late by the geolocation wait plus the network
 * round-trip, always in the employer's favour. See `resolvePunchInstant`.
 *
 * **The working day comes from the server.** The status payload carries the
 * tenant's IANA zone and the `work_date` the server would file a punch against,
 * so the widget shows the day that will actually be written rather than the
 * browser's opinion of today. Those differ for most of the world.
 *
 * **Location is only requested when it can be used.** If the tenant has no
 * active geofences, the widget never touches `navigator.geolocation` — asking
 * for a permission you have no use for trains people to refuse it.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  House,
  ChevronUp,
  X,
  Coffee,
  CalendarClock,
  AlertTriangle,
  Loader2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { clockIn, clockOut, getClockStatus, setBreakMinutes } from "@/lib/attendance.functions";
import { browserTimeZone } from "@/lib/work-date";

/**
 * Long enough that navigating around the app does not re-query, short enough
 * that a punch taken in another tab shows up. Refetch on focus covers the rest.
 */
const STATUS_STALE_MS = 60_000;

interface BrowserPosition {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationError?: string;
}

/**
 * Ask the browser where we are, and never reject.
 *
 * A refusal or a timeout is a *result* the server needs to see, not an
 * exception — the server decides whether a missing fix is fatal, because that
 * depends on the tenant's fences and on whether the employee has an approved
 * work-from-home day. Throwing here would take that decision away from it.
 */
function getBrowserPosition(): Promise<BrowserPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ locationError: "Geolocation is not available on this device" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          // Previously discarded. It is what separates a satellite fix from an
          // IP guess, and the geofence check is meaningless without it.
          accuracyMeters: typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : undefined,
        }),
      (err) => resolve({ locationError: err.message || "Location permission denied" }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  });
}

function formatElapsed(ms: number): string {
  if (ms < 0) ms = 0;
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

function timeOfDay(iso: string | null, timeZone: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function ClockWidget() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "in" | "out" | "break">(null);
  const [breakInput, setBreakInput] = useState("");
  const [tick, setTick] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const fnStatus = useServerFn(getClockStatus);
  const fnIn = useServerFn(clockIn);
  const fnOut = useServerFn(clockOut);
  const fnBreak = useServerFn(setBreakMinutes);

  const { data: status, isLoading } = useQuery({
    // Keyed by user id so a sign-out followed by a different sign-in cannot
    // serve the previous person's shift — the dashboard had exactly that bug
    // with an unkeyed ["my-org-status"].
    queryKey: ["clock-status", user?.id],
    queryFn: () => fnStatus({ data: undefined }),
    enabled: !!user,
    staleTime: STATUS_STALE_MS,
    refetchOnWindowFocus: true,
  });

  const entry = status && "entry" in status ? status.entry : null;
  const isClockedIn = !!entry?.clockIn && !entry?.clockOut;

  // Re-render once a second only while the timer is actually running.
  useEffect(() => {
    if (!isClockedIn) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [isClockedIn]);

  // Track the two values rather than the object: `entry` is a fresh identity on
  // every refetch, so depending on it would stomp whatever the user is typing.
  const entryId = entry?.id ?? null;
  const entryBreakMinutes = entry?.breakMinutes ?? 0;
  useEffect(() => {
    if (entryId) setBreakInput(String(entryBreakMinutes));
  }, [entryId, entryBreakMinutes]);

  // Close on Escape and on a click outside, the way a popover should behave.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const elapsed = useMemo(() => {
    if (!isClockedIn || !entry?.clockIn) return null;
    void tick; // recomputed each second while running
    return formatElapsed(Date.now() - new Date(entry.clockIn).getTime());
  }, [isClockedIn, entry?.clockIn, tick]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["clock-status", user?.id] });
  }, [qc, user?.id]);

  const needsLocation = (status && "geofenceCount" in status ? status.geofenceCount : 0) > 0;

  const onClockIn = useCallback(async () => {
    setBusy("in");
    // Captured first, deliberately. Everything after this line takes time, and
    // that time must not be charged to the employee.
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const position = needsLocation ? await getBrowserPosition() : {};
      const res = await fnIn({ data: { ...position, clientTime, clientTimeZone } });
      if (res.needsReview) {
        toast.warning(`Clocked in at ${res.localTime} — flagged for review`, {
          description: res.reviewReason ?? undefined,
          duration: 9000,
        });
      } else {
        toast.success(`Clocked in at ${res.localTime}${res.remote ? " (working from home)" : ""}`);
      }
      refresh();
    } catch (e: unknown) {
      // The refusal message explains distance, allowance and what to do about
      // it, so give people time to read it rather than the default 4 seconds.
      toast.error(e instanceof Error ? e.message : "Could not clock in", { duration: 12000 });
    } finally {
      setBusy(null);
    }
  }, [fnIn, needsLocation, refresh]);

  const onClockOut = useCallback(async () => {
    setBusy("out");
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const position = needsLocation ? await getBrowserPosition() : {};
      const res = await fnOut({ data: { ...position, clientTime, clientTimeZone } });
      toast.success(
        `Clocked out at ${res.localTime} — ${res.hours}h` +
          (res.overnight ? ` recorded against ${res.workDate}` : ""),
      );
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not clock out", { duration: 8000 });
    } finally {
      setBusy(null);
    }
  }, [fnOut, needsLocation, refresh]);

  const onSaveBreak = useCallback(async () => {
    const minutes = Number(breakInput);
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 720) {
      toast.error("Break must be between 0 and 720 minutes");
      return;
    }
    setBusy("break");
    try {
      await fnBreak({ data: { breakMinutes: Math.round(minutes) } });
      toast.success(`Break set to ${Math.round(minutes)} minutes`);
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save break");
    } finally {
      setBusy(null);
    }
  }, [breakInput, fnBreak, refresh]);

  // Hidden for signed-out visitors and for platform accounts, which have no
  // employee row and therefore nothing to clock.
  if (loading || !user) return null;
  if (isLoading) return null;
  if (!status || !("hasEmployee" in status) || !status.hasEmployee) return null;

  const timeZone = status.timeZone;
  const deviceZone = browserTimeZone();
  const zoneMismatch = deviceZone !== timeZone;
  const remoteToday = status.approvedWfhToday;
  const done = !!entry?.clockOut;

  const state: "in" | "done" | "out" = isClockedIn ? "in" : done ? "done" : "out";
  const pillLabel =
    state === "in"
      ? (elapsed ?? "Clocked in")
      : state === "done"
        ? `${entry?.hoursWorked ?? 0}h today`
        : "Clock in";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Time clock"
          className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
        >
          <div className="flex items-start justify-between gap-2 border-b bg-muted/40 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Time clock</p>
              <p className="truncate text-xs text-muted-foreground">
                {status.workDate} · {status.localTime}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setOpen(false)}
              aria-label="Close time clock"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-semibold tabular-nums">
                  {state === "in"
                    ? elapsed
                    : state === "done"
                      ? `${entry?.hoursWorked ?? 0}h`
                      : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry?.clockIn ? `In ${timeOfDay(entry.clockIn, timeZone)}` : "Not started"}
                  {entry?.clockOut ? ` · Out ${timeOfDay(entry.clockOut, timeZone)}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {remoteToday ? (
                  <Badge variant="secondary" className="gap-1">
                    <House className="h-3 w-3" /> Remote
                  </Badge>
                ) : needsLocation ? (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" /> Geofenced
                  </Badge>
                ) : null}
                <span className="text-[11px] text-muted-foreground">
                  {status.weekHours}h this week
                </span>
              </div>
            </div>

            {/* The zone the punch will be filed in. Shown whenever it differs
                from the device's, because that difference is exactly what used
                to put a shift on the wrong calendar day without anyone seeing. */}
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Globe className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Recorded in <span className="font-medium text-foreground">{timeZone}</span>
                {zoneMismatch ? ` — your device is on ${deviceZone}` : ""}
              </span>
            </p>

            {entry?.needsReview && entry.reviewReason && (
              <p className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{entry.reviewReason}</span>
              </p>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={onClockIn}
                disabled={busy !== null || isClockedIn}
              >
                {busy === "in" ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-1.5 h-4 w-4" />
                )}
                Clock in
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={onClockOut}
                disabled={busy !== null || !isClockedIn}
              >
                {busy === "out" ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-1.5 h-4 w-4" />
                )}
                Clock out
              </Button>
            </div>

            {busy === "in" && needsLocation && (
              <p className="text-[11px] text-muted-foreground">
                Checking your location… your clock-in time was already captured.
              </p>
            )}

            <div className="space-y-1.5 border-t pt-3">
              <Label htmlFor="clock-widget-break" className="flex items-center gap-1.5 text-xs">
                <Coffee className="h-3.5 w-3.5" /> Unpaid break (minutes)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="clock-widget-break"
                  type="number"
                  min={0}
                  max={720}
                  inputMode="numeric"
                  value={breakInput}
                  onChange={(e) => setBreakInput(e.target.value)}
                  disabled={!entry?.clockIn || busy !== null}
                  className="h-8"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onSaveBreak}
                  disabled={!entry?.clockIn || busy !== null}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t pt-3">
              <Button asChild size="sm" variant="ghost" className="justify-start">
                <Link to="/attendance" onClick={() => setOpen(false)}>
                  <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Timesheet
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="justify-start">
                <Link to="/me/wfh" onClick={() => setOpen(false)}>
                  <House className="mr-1.5 h-3.5 w-3.5" /> Work from home
                </Link>
              </Button>
            </div>

            {status.upcomingWfh.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {status.upcomingWfh[0].status === "approved" ? "Approved" : "Pending"} remote work:{" "}
                {status.upcomingWfh[0].startDate}
                {status.upcomingWfh[0].endDate !== status.upcomingWfh[0].startDate
                  ? ` → ${status.upcomingWfh[0].endDate}`
                  : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Hide time clock" : "Show time clock"}
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-full py-2.5 pl-3 pr-4 text-sm font-medium shadow-lg transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          state === "in"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : state === "done"
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Clock className="h-5 w-5" />
          {state === "in" && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-white" />
          )}
        </span>
        <span className="tabular-nums">{pillLabel}</span>
        <ChevronUp className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
    </div>
  );
}
