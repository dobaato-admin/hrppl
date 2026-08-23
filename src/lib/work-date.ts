/**
 * Calendar dates for a workforce spread across time zones.
 *
 * ## The bug this replaces
 *
 * Both the client and the server derived "today" with
 *
 *     new Date().toISOString().slice(0, 10)
 *
 * which is not today — it is today *in UTC*. A working day is a local calendar
 * concept, so that expression is wrong for every tenant not sitting on the
 * prime meridian, and wrong in a different direction on each side of it:
 *
 * - `Asia/Kathmandu` is UTC+05:45. Between local midnight and 05:45 the UTC
 *   date is still yesterday, so an early shift was filed against **T-1**.
 * - `America/New_York` is UTC-05:00. After 19:00 local the UTC date has already
 *   rolled over, so an evening shift was filed against **T+1**.
 *
 * The visible symptom was the second one, and it came from the week grid rather
 * than the punch: the grid built each column from a *local* midnight `Date` and
 * then ran it through the same UTC conversion, which for any positive offset
 * lands on the previous calendar day. Every column was therefore labelled one
 * day later than the date it queried, so an entry written for today appeared in
 * tomorrow's row.
 *
 * ## Daylight saving
 *
 * Nothing here hard-codes an offset, and nothing should. Offsets are a property
 * of an instant, not of a place: `America/New_York` is -05:00 in January and
 * -04:00 in July. Storing an IANA zone name and resolving it per instant
 * through `Intl` means the platform inherits the tz database's DST rules —
 * including the ones that change, which they do most years somewhere in the
 * world. Nepal has never observed DST, but the mechanism has to be right before
 * the first tenant in a zone that does.
 *
 * The database side of the same rule is `timestamptz AT TIME ZONE '<zone>'`,
 * which consults the same tz database.
 *
 * ## Storage
 *
 * Instants (`clock_in`, `clock_out`) stay `timestamptz` — a real moment, zone
 * independent. Only `work_date` is a local calendar date, and it is the one
 * value that needs a zone to compute.
 */

/** Zone used when a tenant has none configured, or has one we cannot resolve. */
export const FALLBACK_TIME_ZONE = "UTC";

/**
 * Furthest a device clock may differ from the server before we stop believing
 * it. Inside this window the client's own timestamp is more accurate than the
 * server's, because it is the moment the button was pressed rather than the
 * moment the request finished travelling.
 */
export const CLOCK_SKEW_TOLERANCE_MS = 5 * 60_000;

const zoneCache = new Map<string, boolean>();

/** True when the runtime's tz database knows this zone. */
export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  if (!timeZone) return false;
  const cached = zoneCache.get(timeZone);
  if (cached !== undefined) return cached;
  let ok = false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
    ok = true;
  } catch {
    ok = false;
  }
  zoneCache.set(timeZone, ok);
  return ok;
}

/**
 * Pick the first usable zone from a preference list.
 *
 * Callers pass branch → tenant → undefined, so a multi-site tenant can hold
 * offices in different zones while single-site tenants configure it once. The
 * columns are free text (`tenants.timezone` defaults to the literal `'UTC'`),
 * so an unrecognised value must degrade rather than throw — a bad settings
 * string should not be able to stop the whole workforce clocking in.
 */
export function resolveTimeZone(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    if (isValidTimeZone(c)) return c as string;
  }
  return FALLBACK_TIME_ZONE;
}

/**
 * The calendar date at `instant` as seen in `timeZone`, as `YYYY-MM-DD`.
 *
 * Built from `formatToParts` rather than a locale pattern: `en-CA` happens to
 * render ISO order today, but that is a locale-data detail and not a contract.
 */
export function workDateInZone(instant: Date | string | number, timeZone: string): string {
  const d = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(d.getTime())) throw new Error("workDateInZone: invalid instant");
  const zone = resolveTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Wall-clock `HH:mm` at `instant` in `timeZone`, for display and audit copy. */
export function workTimeInZone(instant: Date | string | number, timeZone: string): string {
  const d = instant instanceof Date ? instant : new Date(instant);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: resolveTimeZone(timeZone),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}`;
}

/**
 * Offset of `timeZone` from UTC at `instant`, in minutes east of Greenwich.
 *
 * Correct across DST boundaries and across the sub-hour offsets that trip up
 * naive implementations — Nepal is +345 minutes, not +5 or +6 hours.
 */
export function zoneOffsetMinutes(instant: Date | string | number, timeZone: string): number {
  const d = instant instanceof Date ? instant : new Date(instant);
  const zone = resolveTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // `hour` renders as 24 rather than 0 for midnight under hourCycle h24 in some
  // runtimes; normalise before rebuilding the instant.
  const hour = get("hour") % 24;
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second"),
  );
  // `asUtc` carries no milliseconds, so drop them from the instant too rather
  // than letting a sub-second remainder perturb the rounding.
  return Math.round((asUtc - (d.getTime() - d.getMilliseconds())) / 60000);
}

/**
 * The local calendar date of a `Date` as the *browser* sees it.
 *
 * The client-side counterpart of `workDateInZone`, and the direct replacement
 * for `d.toISOString().slice(0, 10)` — which silently converts to UTC first and
 * so shifts the date by a day for most of the world.
 */
export function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The viewer's own IANA zone, for showing "your device says …" alongside the tenant's. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

export interface ResolvedPunchTime {
  /** The instant to store. */
  instant: Date;
  /** Signed device-minus-server difference, in seconds. */
  skewSeconds: number;
  /** True when the device clock was too far out to believe. */
  rejectedClientTime: boolean;
}

/**
 * Decide which instant a punch actually happened at.
 *
 * The server used to stamp `new Date()` inside the handler, which is not when
 * the employee pressed the button — it is after the auth round-trip, the
 * employee lookup and the geofence query, plus however long the request spent
 * on the network. On a slow mobile connection that is seconds of unpaid time on
 * every punch, always in the employer's favour, which is precisely the kind of
 * systematic bias a payroll system must not have.
 *
 * So the client sends the moment it captured, and this decides whether to
 * believe it. Inside the tolerance the device is the better witness. Outside
 * it, the device clock is simply wrong (or being manipulated) and the server
 * time stands — but the discrepancy is returned so it can be recorded and
 * reviewed rather than silently discarded.
 */
export function resolvePunchInstant(
  clientIso: string | null | undefined,
  serverNow: Date = new Date(),
  toleranceMs: number = CLOCK_SKEW_TOLERANCE_MS,
): ResolvedPunchTime {
  if (!clientIso) {
    return { instant: serverNow, skewSeconds: 0, rejectedClientTime: false };
  }
  const client = new Date(clientIso);
  if (Number.isNaN(client.getTime())) {
    return { instant: serverNow, skewSeconds: 0, rejectedClientTime: true };
  }
  const deltaMs = client.getTime() - serverNow.getTime();
  const skewSeconds = Math.round(deltaMs / 1000);
  if (Math.abs(deltaMs) > toleranceMs) {
    return { instant: serverNow, skewSeconds, rejectedClientTime: true };
  }
  return { instant: client, skewSeconds, rejectedClientTime: false };
}
