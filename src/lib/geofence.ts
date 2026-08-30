/**
 * Deciding whether a punch happened inside a work zone.
 *
 * ## Why this is not just "distance <= radius"
 *
 * A browser geolocation fix is not a point, it is a point plus a confidence
 * radius: `GeolocationCoordinates.accuracy` is the radius in metres within
 * which the true position lies with 95% probability. That number varies by
 * three orders of magnitude depending on how the fix was obtained — roughly
 * 5-20 m from satellite GPS on a phone outdoors, 20-100 m from wifi
 * trilateration indoors, and 1-5 km from IP geolocation on a desktop with no
 * radio at all. A laptop in the office next to the router routinely reports a
 * position hundreds of metres away.
 *
 * The previous implementation read `coords.latitude`/`longitude`, discarded
 * `accuracy` entirely, and compared the bare distance against the radius. That
 * treats a 2 km IP-derived guess as though it were a satellite fix, which fails
 * in both directions: it lets someone at home be "inside" a fence they are
 * nowhere near, and it refuses someone standing in the doorway whose phone has
 * not got a lock yet. `sign_geofences.min_accuracy_meters` has existed since
 * migration 20260619132140 precisely to bound this, and nothing has ever read
 * it.
 *
 * So the comparison is made three ways, and the result says which:
 *
 * - **inside** — within the radius, and the fix is at least as good as the
 *   fence requires. Accept silently.
 * - **inside_low_confidence** — within the radius, but the fix is coarser than
 *   `min_accuracy_meters`. Accept, flag for review. Refusing here would punish
 *   people for standing indoors.
 * - **uncertain** — outside the radius, but not by more than the accuracy, so
 *   the true position could still be inside. Accept, flag. This is the honest
 *   reading of a confidence radius, and it is the case that makes the feature
 *   usable in a basement or a warehouse.
 * - **outside** — outside the radius by more than the accuracy could explain.
 *   The caller decides what that means; an approved work-from-home day makes it
 *   fine, and everything else makes it a refusal.
 *
 * Being generous at the boundary is deliberate. A false refusal stops someone
 * working and is visible immediately; a false acceptance is recorded, flagged,
 * and reviewable. Those are not symmetric costs.
 */

export interface GeofenceRow {
  id: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
  radius_meters: number;
  /** Coarsest fix this fence will accept without flagging. Defaults to 100 m. */
  min_accuracy_meters?: number | null;
}

export interface PunchPosition {
  latitude?: number | null;
  longitude?: number | null;
  /** Radius of 95% confidence in metres, straight from the browser. */
  accuracyMeters?: number | null;
  /** Set when the device refused or failed to produce a fix. */
  locationError?: string | null;
}

export type GeofenceOutcome =
  | { kind: "no_fences" }
  | { kind: "no_location"; reason: string }
  | {
      kind: "inside" | "inside_low_confidence" | "uncertain";
      fenceId: string;
      fenceName: string;
      distanceMeters: number;
      accuracyMeters: number | null;
      minAccuracyMeters: number;
    }
  | {
      kind: "outside";
      nearestFenceId: string;
      nearestFenceName: string;
      distanceMeters: number;
      radiusMeters: number;
      accuracyMeters: number | null;
    };

/** Metres between two coordinates on a sphere. */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Default when a fence does not set one, matching the column default. */
export const DEFAULT_MIN_ACCURACY_METERS = 100;

export function evaluateGeofence(
  fences: GeofenceRow[] | null | undefined,
  position: PunchPosition,
): GeofenceOutcome {
  if (!fences || fences.length === 0) return { kind: "no_fences" };

  if (position.locationError) {
    return { kind: "no_location", reason: position.locationError };
  }
  if (typeof position.latitude !== "number" || typeof position.longitude !== "number") {
    return { kind: "no_location", reason: "No location supplied" };
  }

  const accuracy =
    typeof position.accuracyMeters === "number" && position.accuracyMeters >= 0
      ? position.accuracyMeters
      : null;

  let best: {
    fence: GeofenceRow;
    distance: number;
    minAccuracy: number;
    kind: "inside" | "inside_low_confidence" | "uncertain" | "outside";
  } | null = null;

  // Rank by how good the outcome is, then by distance — a clean match at 40 m
  // beats an uncertain one at 5 m, because the point is to record the best
  // available explanation of where the employee was.
  const rank = { inside: 0, inside_low_confidence: 1, uncertain: 2, outside: 3 } as const;

  for (const f of fences) {
    const dist = distanceMeters(
      position.latitude,
      position.longitude,
      Number(f.latitude),
      Number(f.longitude),
    );
    const radius = Number(f.radius_meters);
    const minAccuracy = Number(f.min_accuracy_meters ?? DEFAULT_MIN_ACCURACY_METERS);

    let kind: "inside" | "inside_low_confidence" | "uncertain" | "outside";
    if (dist <= radius) {
      // A fix with no accuracy at all is treated as acceptable rather than
      // suspect: some browsers omit it, and it is not the employee's doing.
      kind = accuracy === null || accuracy <= minAccuracy ? "inside" : "inside_low_confidence";
    } else if (accuracy !== null && dist - accuracy <= radius) {
      kind = "uncertain";
    } else {
      kind = "outside";
    }

    if (
      !best ||
      rank[kind] < rank[best.kind] ||
      (rank[kind] === rank[best.kind] && dist < best.distance)
    ) {
      best = { fence: f, distance: dist, minAccuracy, kind };
    }
  }

  if (!best) return { kind: "no_fences" };

  if (best.kind === "outside") {
    return {
      kind: "outside",
      nearestFenceId: best.fence.id,
      nearestFenceName: best.fence.name,
      distanceMeters: Math.round(best.distance),
      radiusMeters: Number(best.fence.radius_meters),
      accuracyMeters: accuracy,
    };
  }

  return {
    kind: best.kind,
    fenceId: best.fence.id,
    fenceName: best.fence.name,
    distanceMeters: Math.round(best.distance),
    accuracyMeters: accuracy,
    minAccuracyMeters: best.minAccuracy,
  };
}

/**
 * What to tell someone whose punch was refused.
 *
 * Named separately because the wording matters more than it looks: this message
 * is the entire interface between the system and a person who cannot start
 * work. It has to say where they are, where they need to be, how far, and — the
 * part the old message left out — what to do about it if they are legitimately
 * working from home.
 */
export function outsideFenceMessage(
  outcome: Extract<GeofenceOutcome, { kind: "outside" }>,
): string {
  const acc =
    outcome.accuracyMeters !== null
      ? ` Your device reports its position to within ±${Math.round(outcome.accuracyMeters)}m.`
      : "";
  return (
    `You are ${outcome.distanceMeters}m from "${outcome.nearestFenceName}", ` +
    `which allows clock-in within ${outcome.radiusMeters}m.${acc} ` +
    `Move closer to an approved site, or request a work-from-home day if you are working remotely.`
  );
}

/** What clockOut should flag a geofence outcome as, or null for a clean one. */
export interface ClockOutReview {
  mismatchType: "wfh_outside_fence" | "clock_out_outside_fence" | "accuracy_low";
  reason: string;
  fenceId: string;
}

/**
 * clockOut records a punch's distance/fence columns for every outcome but,
 * unlike clockIn, never flagged any of them — needs_review stayed false and
 * nothing was queued to geofence_reconciliation regardless of how far outside
 * a fence the closing punch landed. clockOut still never *blocks* on this
 * (someone who already started a shift should not be trapped on site to end
 * it), but it should flag exactly what clockIn would have flagged for the
 * same outcome.
 *
 * An approved WFH day reuses `wfh_outside_fence` — the same classification
 * clockIn gives it — since it's the same sanctioned remote day continuing
 * into its closing punch. An unapproved out-of-fence clock-out gets its own
 * type: none of the existing values describe an unblocked, unapproved,
 * out-of-fence *closing* punch.
 */
export function classifyClockOutGeofence(
  outcome: GeofenceOutcome,
  approvedWfh: boolean,
): ClockOutReview | null {
  if (outcome.kind === "outside") {
    return approvedWfh
      ? {
          mismatchType: "wfh_outside_fence",
          reason: `Approved work-from-home clock-out, ${outcome.distanceMeters}m from "${outcome.nearestFenceName}"`,
          fenceId: outcome.nearestFenceId,
        }
      : {
          mismatchType: "clock_out_outside_fence",
          reason:
            `Clocked out ${outcome.distanceMeters - outcome.radiusMeters}m outside all work zones — ` +
            `not blocked, since ending an already-open shift should never be`,
          fenceId: outcome.nearestFenceId,
        };
  }
  if (outcome.kind === "inside_low_confidence" || outcome.kind === "uncertain") {
    return {
      mismatchType: "accuracy_low",
      reason: `Clock-out position uncertain, ${outcome.distanceMeters}m from "${outcome.fenceName}"`,
      fenceId: outcome.fenceId,
    };
  }
  return null;
}
