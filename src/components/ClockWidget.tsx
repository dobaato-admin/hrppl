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
 * **The timestamp is captured on click**, before anything is awaited. The
 * server previously stamped its own `new Date()` inside the handler, so a punch
 * was late by the geolocation wait plus the round-trip, always in the
 * employer's favour. See `resolvePunchInstant`.
 *
 * **Location is pre-warmed, not fetched on click.** A cold
 * `getCurrentPosition` with `enableHighAccuracy` routinely takes the better
 * part of ten seconds on a laptop, which has no GPS and is trilaterating from
 * wifi. Asking for it when the panel *opens* means the fix is usually already
 * in hand by the time the button is pressed, so the punch feels instant. The
 * captured timestamp is unaffected either way — that is the point of capturing
 * it separately.
 *
 * **The working day comes from the server.** The status payload carries the
 * tenant's IANA zone and the `work_date` the server would file a punch against,
 * so the widget shows the day that will actually be written rather than the
 * browser's opinion of today. Those differ for most of the world.
 *
 * **Fence status is shown before the punch, not after.** The payload ships the
 * tenant's fences, so the widget runs the same `evaluateGeofence` the server
 * will and can say "inside Sydney HQ · ±12 m" up front. Discovering you are
 * outside the perimeter *after* pressing the button is the worst possible time
 * to learn it.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
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
  ShieldCheck,
  ShieldAlert,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { clockIn, clockOut, getClockStatus, setBreakMinutes } from "@/lib/attendance.functions";
import { browserTimeZone } from "@/lib/work-date";
import { evaluateGeofence, type GeofenceOutcome } from "@/lib/geofence";

/**
 * Long enough that navigating around the app does not re-query, short enough
 * that a punch taken in another tab shows up. Refetch on focus covers the rest.
 */
const STATUS_STALE_MS = 60_000;

/** A cached fix older than this is refreshed rather than reused. */
const POSITION_MAX_AGE_MS = 90_000;

/**
 * Nudge someone who is working but has not clocked in.
 *
 * Deliberately a toast and nothing more. A modal or a route guard would block
 * work to enforce bookkeeping, which gets the priority backwards — people are
 * here to do their job, and the punch is administration around it. So the
 * reminder never prevents an action, and it gives up quickly.
 *
 * Fired on the 2nd and 6th navigation of a session, twice at most, and the
 * count is kept in sessionStorage keyed by user *and* work date: a page reload
 * must not restart the nagging, and a new day should start it fresh.
 */
const REMINDER_AT_NAVIGATIONS = [2, 6];
const MAX_REMINDERS = 2;

interface BrowserPosition {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationError?: string;
  at?: number;
}

/**
 * Ask the browser where we are, and never reject.
 *
 * A refusal or a timeout is a *result* the server needs to see, not an
 * exception — the server decides whether a missing fix is fatal, because that
 * depends on the tenant's fences and on whether the employee has an approved
 * work-from-home day. Throwing here would take that decision away from it.
 */
function getBrowserPosition(opts: {
  highAccuracy: boolean;
  timeoutMs: number;
}): Promise<BrowserPosition> {
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
          at: Date.now(),
        }),
      (err) =>
        resolve({ locationError: err.message || "Location permission denied", at: Date.now() }),
      {
        enableHighAccuracy: opts.highAccuracy,
        timeout: opts.timeoutMs,
        // Let the browser hand back a recent fix instantly rather than
        // re-trilaterating from scratch for a punch taken minutes apart.
        maximumAge: POSITION_MAX_AGE_MS,
      },
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

/** How the live fence reading should read to a person about to press the button. */
function describeFence(
  outcome: GeofenceOutcome | null,
  approvedWfh: boolean,
): {
  tone: "ok" | "warn" | "bad" | "muted";
  icon: typeof ShieldCheck;
  label: string;
  detail: string;
} {
  if (approvedWfh) {
    return {
      tone: "ok",
      icon: House,
      label: "Working from home",
      detail: "Approved for today — you can clock in from anywhere.",
    };
  }
  if (!outcome) {
    return {
      tone: "muted",
      icon: Crosshair,
      label: "Checking location…",
      detail: "Finding your position.",
    };
  }
  switch (outcome.kind) {
    case "no_fences":
      return {
        tone: "muted",
        icon: ShieldCheck,
        label: "No work zones",
        detail: "Your organisation does not restrict where you clock in.",
      };
    case "no_location":
      return {
        tone: "warn",
        icon: ShieldAlert,
        label: "Location unavailable",
        detail: outcome.reason,
      };
    case "inside":
      return {
        tone: "ok",
        icon: ShieldCheck,
        label: `Inside ${outcome.fenceName}`,
        detail: `${outcome.distanceMeters}m from the centre · ±${Math.round(outcome.accuracyMeters ?? 0)}m accuracy`,
      };
    case "inside_low_confidence":
      return {
        tone: "warn",
        icon: ShieldAlert,
        label: `Inside ${outcome.fenceName}`,
        detail: `Accurate only to ±${Math.round(outcome.accuracyMeters ?? 0)}m — this site expects ±${outcome.minAccuracyMeters}m. Your punch will be flagged for review.`,
      };
    case "uncertain":
      return {
        tone: "warn",
        icon: ShieldAlert,
        label: `Near ${outcome.fenceName}`,
        detail: `${outcome.distanceMeters}m away, within your ±${Math.round(outcome.accuracyMeters ?? 0)}m margin of error. Your punch will be accepted and flagged.`,
      };
    case "outside":
      return {
        tone: "bad",
        icon: ShieldAlert,
        label: `Outside ${outcome.nearestFenceName}`,
        detail: `${outcome.distanceMeters}m away — this site allows ${outcome.radiusMeters}m. Request a work-from-home day if you are working remotely.`,
      };
  }
}

const TONE_CLASS = {
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  bad: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25",
  muted: "bg-muted text-muted-foreground border-border",
} as const;

export function ClockWidget() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "in" | "out" | "break">(null);
  const [breakInput, setBreakInput] = useState("");
  const [tick, setTick] = useState(0);
  const [position, setPosition] = useState<BrowserPosition | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const warmingRef = useRef(false);

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
    // One attempt, not four. This query runs on every authenticated page, so a
    // persistent server-side failure would otherwise turn each navigation into
    // a burst of retries — the shape of the listNotifications storm.
    retry: false,
  });

  const entry = status && "entry" in status ? status.entry : null;
  const isClockedIn = !!entry?.clockIn && !entry?.clockOut;
  /** Already clocked out for the day — nothing left to remind them about. */
  const alreadyFinishedToday = !!entry?.clockOut;
  // Memoised: a fresh array literal each render would re-run the fence
  // evaluation (and its useMemo) on every tick of the one-second timer.
  const fences = useMemo(
    () => (status && "geofences" in status ? (status.geofences ?? []) : []),
    [status],
  );
  const approvedWfhToday =
    (status && "approvedWfhToday" in status && status.approvedWfhToday) || false;
  const needsLocation = fences.length > 0;

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

  /**
   * Warm the position ahead of the click.
   *
   * This is the single biggest thing between "press Clock in" and "clocked in":
   * a cold high-accuracy fix on a laptop can take the full timeout. Doing it
   * when the panel opens means the answer is usually already cached, and it
   * doubles as the input to the live fence readout.
   */
  const warmPosition = useCallback(
    async (highAccuracy: boolean) => {
      if (!needsLocation || warmingRef.current) return;
      if (position?.at && Date.now() - position.at < POSITION_MAX_AGE_MS) return;
      warmingRef.current = true;
      try {
        setPosition(
          await getBrowserPosition({ highAccuracy, timeoutMs: highAccuracy ? 8000 : 4000 }),
        );
      } finally {
        warmingRef.current = false;
      }
    },
    [needsLocation, position?.at],
  );

  useEffect(() => {
    if (open) void warmPosition(true);
  }, [open, warmPosition]);

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

  // The reminder. Counts navigations rather than firing on a timer, so someone
  // who signs in and immediately starts working is nudged while they are
  // actually at the keyboard, not while they are making coffee.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const remindKey =
    user?.id && status && "workDate" in status ? `clock-nudge:${user.id}:${status.workDate}` : null;
  const seenPaths = useRef(new Set<string>());
  useEffect(() => {
    if (!remindKey || isClockedIn || alreadyFinishedToday) return;
    if (seenPaths.current.has(pathname)) return;
    seenPaths.current.add(pathname);

    let sent = 0;
    try {
      sent = Number(sessionStorage.getItem(remindKey) ?? "0");
    } catch {
      return; // storage unavailable (private mode); skip rather than nag every time
    }
    if (sent >= MAX_REMINDERS) return;
    if (!REMINDER_AT_NAVIGATIONS.includes(seenPaths.current.size)) return;

    try {
      sessionStorage.setItem(remindKey, String(sent + 1));
    } catch {
      /* best effort */
    }
    toast("You have not clocked in today", {
      description: "Your hours will not be recorded until you do.",
      duration: 6000,
      action: { label: "Clock in", onClick: () => setOpen(true) },
    });
    // `pathname` is the trigger; the rest gate it.
  }, [pathname, remindKey, isClockedIn, alreadyFinishedToday]);

  const elapsed = useMemo(() => {
    if (!isClockedIn || !entry?.clockIn) return null;
    void tick; // recomputed each second while running
    return formatElapsed(Date.now() - new Date(entry.clockIn).getTime());
  }, [isClockedIn, entry?.clockIn, tick]);

  /** The same evaluation the server will run, so the readout cannot disagree with it. */
  const fenceOutcome = useMemo<GeofenceOutcome | null>(() => {
    if (!needsLocation) return { kind: "no_fences" };
    if (!position) return null;
    return evaluateGeofence(fences, position);
  }, [fences, needsLocation, position]);

  const fenceInfo = describeFence(fenceOutcome, approvedWfhToday);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["clock-status", user?.id] });
  }, [qc, user?.id]);

  /**
   * The position to send with a punch.
   *
   * An approved work-from-home day means the fence will be bypassed regardless,
   * so there is nothing to gain from making the employee wait on a precise fix —
   * take whatever is already cached and go. Everyone else gets the full budget,
   * because for them the answer decides whether the punch is accepted at all.
   */
  const positionForPunch = useCallback(async (): Promise<BrowserPosition> => {
    if (!needsLocation) return {};
    if (position?.at && Date.now() - position.at < POSITION_MAX_AGE_MS) return position;
    return getBrowserPosition({
      highAccuracy: !approvedWfhToday,
      timeoutMs: approvedWfhToday ? 2500 : 8000,
    });
  }, [approvedWfhToday, needsLocation, position]);

  const onClockIn = useCallback(async () => {
    setBusy("in");
    // Captured first, deliberately. Everything after this line takes time, and
    // that time must not be charged to the employee.
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const pos = await positionForPunch();
      setPosition(pos);
      const { at: _at, ...payload } = pos;
      const res = await fnIn({ data: { ...payload, clientTime, clientTimeZone } });
      if (res.needsReview) {
        toast.warning(`Clocked in ${res.localTime} — flagged for review`, {
          description: res.reviewReason ?? undefined,
          duration: 5000,
        });
      } else {
        toast.success(`Clocked in ${res.localTime}${res.remote ? " · remote" : ""}`, {
          duration: 2500,
        });
      }
      refresh();
    } catch (e: unknown) {
      // The refusal message explains distance, allowance and what to do about
      // it, so it gets longer than a confirmation — but not so long that it
      // sits over the widget you are trying to use next.
      toast.error(e instanceof Error ? e.message : "Could not clock in", { duration: 6000 });
    } finally {
      setBusy(null);
    }
  }, [fnIn, positionForPunch, refresh]);

  const onClockOut = useCallback(async () => {
    setBusy("out");
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const pos = await positionForPunch();
      setPosition(pos);
      const { at: _at, ...payload } = pos;
      const res = await fnOut({ data: { ...payload, clientTime, clientTimeZone } });
      toast.success(
        `Clocked out ${res.localTime} — ${res.hours}h` +
          (res.overnight ? ` (recorded against ${res.workDate})` : ""),
        { duration: 3000 },
      );
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not clock out", { duration: 5000 });
    } finally {
      setBusy(null);
    }
  }, [fnOut, positionForPunch, refresh]);

  const onSaveBreak = useCallback(async () => {
    const minutes = Number(breakInput);
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 720) {
      toast.error("Break must be between 0 and 720 minutes");
      return;
    }
    setBusy("break");
    try {
      await fnBreak({ data: { breakMinutes: Math.round(minutes) } });
      toast.success(`Break set to ${Math.round(minutes)} minutes`, { duration: 2500 });
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
  const state: "in" | "done" | "out" = isClockedIn ? "in" : alreadyFinishedToday ? "done" : "out";
  const pillLabel =
    state === "in"
      ? (elapsed ?? "Clocked in")
      : state === "done"
        ? `${entry?.hoursWorked ?? 0}h today`
        : "Clock in";
  const FenceIcon = fenceInfo.icon;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Time clock"
          className="pointer-events-auto w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-2 border-b bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
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
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
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
                {approvedWfhToday ? (
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

            {/* Where you are, before you press anything. Learning you are
                outside the perimeter only after the punch fails is the worst
                possible moment to find out. */}
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border px-2.5 py-2",
                TONE_CLASS[fenceInfo.tone],
              )}
            >
              <FenceIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 text-[11px] leading-relaxed">
                <p className="font-semibold">{fenceInfo.label}</p>
                <p className="opacity-90">{fenceInfo.detail}</p>
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

            {busy === "in" && needsLocation && !position && (
              <p className="text-[11px] text-muted-foreground">
                Finding your location… your clock-in time was already captured.
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
        onMouseEnter={() => void warmPosition(false)}
        aria-expanded={open}
        aria-label={open ? "Hide time clock" : "Show time clock"}
        className={cn(
          "pointer-events-auto relative flex items-center gap-2.5 rounded-full py-3 pl-3.5 pr-5 text-sm font-semibold shadow-xl transition-all",
          "hover:scale-[1.03] active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          state === "in"
            ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700"
            : state === "done"
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : // Not clocked in yet: the one state that is a call to action.
                "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/40 hover:brightness-110",
        )}
      >
        {/* A soft halo, only while there is something to do. Rendered behind the
            pill and pointer-events-none so it never intercepts the click. */}
        {state === "out" && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1 -z-10 animate-pulse rounded-full bg-primary/30 blur-md motion-reduce:animate-none"
          />
        )}
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Clock className="h-5 w-5" />
          {state === "in" && (
            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
          )}
        </span>
        <span className="tabular-nums">{pillLabel}</span>
        {/* Fence state at a glance, without opening the panel. */}
        {state === "out" && fenceInfo.tone === "bad" && (
          <ShieldAlert aria-label="Outside your work zone" className="h-4 w-4 opacity-90" />
        )}
        <ChevronUp className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
    </div>
  );
}
