/**
 * Geofence evaluation.
 *
 * The old check was `distance <= radius` against a position whose accuracy had
 * been discarded, which fails in both directions: a desktop's IP-derived guess
 * can place someone kilometres away while sitting at their desk, and a phone
 * indoors can read a hundred metres off while standing in the doorway.
 *
 * These cases pin the three-way outcome that replaced it, and in particular
 * that the boundary is generous — a false refusal stops someone working and is
 * visible instantly; a false acceptance is recorded, flagged and reviewable.
 */
import { describe, it, expect } from "vitest";
import {
  evaluateGeofence,
  distanceMeters,
  outsideFenceMessage,
  DEFAULT_MIN_ACCURACY_METERS,
  type GeofenceRow,
} from "@/lib/geofence";

/** Kathmandu, roughly. */
const OFFICE = { lat: 27.7172, lng: 85.324 };

/** Offset a coordinate by roughly `metres` due north. */
function north(lat: number, metres: number): number {
  return lat + metres / 111_320;
}

const fence = (over: Partial<GeofenceRow> = {}): GeofenceRow => ({
  id: "fence-1",
  name: "Head Office",
  latitude: OFFICE.lat,
  longitude: OFFICE.lng,
  radius_meters: 150,
  min_accuracy_meters: 100,
  ...over,
});

describe("distanceMeters", () => {
  it("measures a short offset to within a metre", () => {
    const d = distanceMeters(OFFICE.lat, OFFICE.lng, north(OFFICE.lat, 500), OFFICE.lng);
    expect(d).toBeGreaterThan(499);
    expect(d).toBeLessThan(501);
  });

  it("is zero at the same point", () => {
    expect(distanceMeters(OFFICE.lat, OFFICE.lng, OFFICE.lat, OFFICE.lng)).toBe(0);
  });
});

describe("evaluateGeofence", () => {
  it("says there is nothing to enforce when the tenant has no fences", () => {
    expect(evaluateGeofence([], { latitude: OFFICE.lat, longitude: OFFICE.lng }).kind).toBe(
      "no_fences",
    );
    expect(evaluateGeofence(null, {}).kind).toBe("no_fences");
  });

  it("accepts a good fix inside the radius", () => {
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 50),
      longitude: OFFICE.lng,
      accuracyMeters: 12,
    });
    expect(out.kind).toBe("inside");
    if (out.kind === "inside") {
      expect(out.fenceId).toBe("fence-1");
      expect(out.distanceMeters).toBeGreaterThan(45);
      expect(out.distanceMeters).toBeLessThan(55);
    }
  });

  it("accepts but flags a coarse fix inside the radius", () => {
    // Standing well inside the boundary, but the device only knows the position
    // to ±400 m — probably wifi or IP. Refusing would punish someone for being
    // indoors; accepting silently would make the fence meaningless.
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 20),
      longitude: OFFICE.lng,
      accuracyMeters: 400,
    });
    expect(out.kind).toBe("inside_low_confidence");
    if (out.kind === "inside_low_confidence") expect(out.minAccuracyMeters).toBe(100);
  });

  it("accepts but flags a position outside the radius but inside the margin of error", () => {
    // 200 m from a 150 m fence, known to ±80 m: the true position could be
    // 120 m out, which is inside. This is the case that makes the feature
    // usable in a basement or a steel-framed warehouse.
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 200),
      longitude: OFFICE.lng,
      accuracyMeters: 80,
    });
    expect(out.kind).toBe("uncertain");
  });

  it("refuses a position that no margin of error can explain", () => {
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 3000),
      longitude: OFFICE.lng,
      accuracyMeters: 20,
    });
    expect(out.kind).toBe("outside");
    if (out.kind === "outside") {
      expect(out.nearestFenceName).toBe("Head Office");
      expect(out.radiusMeters).toBe(150);
      expect(out.distanceMeters).toBeGreaterThan(2900);
    }
  });

  it("treats a missing accuracy as acceptable rather than suspect", () => {
    // Some browsers omit it. That is not the employee's doing, and flagging
    // every punch from those devices would make the queue useless.
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 50),
      longitude: OFFICE.lng,
    });
    expect(out.kind).toBe("inside");
  });

  it("cannot be rescued by a missing accuracy when clearly outside", () => {
    // Without an accuracy there is no margin to apply, so a distant position
    // stays a refusal — omitting the field must not be a way past the fence.
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 3000),
      longitude: OFFICE.lng,
    });
    expect(out.kind).toBe("outside");
  });

  it("uses the fence's own minimum accuracy, not a global one", () => {
    // A warehouse yard can reasonably accept a coarser fix than a bank vault.
    const lenient = evaluateGeofence([fence({ min_accuracy_meters: 500 })], {
      latitude: north(OFFICE.lat, 20),
      longitude: OFFICE.lng,
      accuracyMeters: 400,
    });
    expect(lenient.kind).toBe("inside");
  });

  it("falls back to the column default when a fence sets none", () => {
    const out = evaluateGeofence([fence({ min_accuracy_meters: null })], {
      latitude: north(OFFICE.lat, 20),
      longitude: OFFICE.lng,
      accuracyMeters: DEFAULT_MIN_ACCURACY_METERS + 1,
    });
    expect(out.kind).toBe("inside_low_confidence");
    if (out.kind === "inside_low_confidence") {
      expect(out.minAccuracyMeters).toBe(DEFAULT_MIN_ACCURACY_METERS);
    }
  });

  it("prefers the best outcome across fences, not merely the nearest", () => {
    // A clean match at a distant site beats an uncertain one at a near site:
    // the point is to record the best available explanation of where they were.
    const near = fence({ id: "near", name: "Near", radius_meters: 25, min_accuracy_meters: 10 });
    const far = fence({
      id: "far",
      name: "Far",
      latitude: north(OFFICE.lat, 400),
      radius_meters: 300,
      min_accuracy_meters: 100,
    });
    const out = evaluateGeofence([near, far], {
      latitude: north(OFFICE.lat, 200),
      longitude: OFFICE.lng,
      accuracyMeters: 30,
    });
    expect(out.kind).toBe("inside");
    if (out.kind === "inside") expect(out.fenceId).toBe("far");
  });

  it("reports a refused fix as no_location rather than outside", () => {
    // The distinction matters: "you denied location" and "you are 3 km away"
    // need different messages and different remedies.
    const out = evaluateGeofence([fence()], { locationError: "User denied Geolocation" });
    expect(out.kind).toBe("no_location");
    if (out.kind === "no_location") expect(out.reason).toContain("denied");
  });

  it("reports missing coordinates as no_location", () => {
    expect(evaluateGeofence([fence()], {}).kind).toBe("no_location");
  });
});

describe("outsideFenceMessage", () => {
  it("tells the person where they are, what is allowed, and what to do", () => {
    const out = evaluateGeofence([fence()], {
      latitude: north(OFFICE.lat, 3000),
      longitude: OFFICE.lng,
      accuracyMeters: 25,
    });
    expect(out.kind).toBe("outside");
    if (out.kind !== "outside") return;
    const msg = outsideFenceMessage(out);
    expect(msg).toContain("Head Office");
    expect(msg).toContain("150m");
    expect(msg).toContain("±25m");
    // The old message stopped at "move closer", which is useless advice to
    // someone legitimately working from home.
    expect(msg).toContain("work-from-home");
  });
});
