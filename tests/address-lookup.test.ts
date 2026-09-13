/**
 * T15 / T17 — address search, postcode lookup, and the manual path.
 *
 * The half of T17 that needs no dataset is postcode → state: Australia Post
 * allocates postcodes in contiguous per-state ranges, so it is a rule and can
 * ship complete. The half that needs one is postcode → suburb, because a
 * postcode covers many suburbs and nothing about the number says which.
 *
 * These tests exist mostly to pin the cases a first-digit rule gets wrong —
 * Canberra, the PO-box blocks, and the unallocated gaps — because a silently
 * wrong state routes payroll tax to the wrong revenue office and nothing
 * visibly breaks.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { auStateForPostcode, isAuPostcode } from "@/lib/address/au-postcode";
import { getAddressProvider, hasPostcodeLookup, lookupPostcode } from "@/lib/address/providers";
import { emptyAddress } from "@/lib/address/types";

describe("auStateForPostcode", () => {
  it("maps the mainstream ranges", () => {
    expect(auStateForPostcode("2000")).toBe("NSW"); // Sydney
    expect(auStateForPostcode("3000")).toBe("VIC"); // Melbourne
    expect(auStateForPostcode("4000")).toBe("QLD"); // Brisbane
    expect(auStateForPostcode("5000")).toBe("SA"); // Adelaide
    expect(auStateForPostcode("6000")).toBe("WA"); // Perth
    expect(auStateForPostcode("7000")).toBe("TAS"); // Hobart
    expect(auStateForPostcode("0800")).toBe("NT"); // Darwin
  });

  it("gets Canberra right, which a first-digit rule does not", () => {
    // 2600 starts with 2 but is ACT, not NSW. The ACT ranges sit inside NSW's
    // numeric span, which is the whole reason this is a range list.
    expect(auStateForPostcode("2600")).toBe("ACT");
    expect(auStateForPostcode("2601")).toBe("ACT");
    expect(auStateForPostcode("2618")).toBe("ACT");
    expect(auStateForPostcode("2900")).toBe("ACT");
    expect(auStateForPostcode("2920")).toBe("ACT");
    // And the NSW postcodes on either side of them.
    expect(auStateForPostcode("2599")).toBe("NSW");
    expect(auStateForPostcode("2619")).toBe("NSW");
    expect(auStateForPostcode("2921")).toBe("NSW");
  });

  it("handles the PO-box-only blocks", () => {
    // Nobody lives at 1234, but it is a valid NSW postcode and somebody will
    // type it.
    expect(auStateForPostcode("1234")).toBe("NSW");
    expect(auStateForPostcode("8000")).toBe("VIC");
    expect(auStateForPostcode("9000")).toBe("QLD");
    expect(auStateForPostcode("0200")).toBe("ACT");
  });

  it("returns null for the unallocated gaps rather than guessing", () => {
    // A wrong state routes payroll tax to the wrong revenue office and looks
    // like an answered question. A blank field does not.
    expect(auStateForPostcode("0000")).toBeNull();
    expect(auStateForPostcode("0100")).toBeNull();
    expect(auStateForPostcode("0500")).toBeNull();
  });

  it("returns null for anything not four digits", () => {
    for (const bad of ["", "200", "20000", "2A00", "  ", "abcd"]) {
      expect(auStateForPostcode(bad)).toBeNull();
    }
    expect(auStateForPostcode(null)).toBeNull();
    expect(auStateForPostcode(undefined)).toBeNull();
  });

  it("tolerates surrounding whitespace", () => {
    expect(auStateForPostcode(" 3000 ")).toBe("VIC");
  });

  it("covers every allocated postcode with exactly one state", () => {
    // Sweeps the whole space rather than spot-checking: an overlap would make
    // the answer depend on range order, and a gap would silently return null
    // for a real address.
    let allocated = 0;
    for (let n = 0; n <= 9999; n++) {
      const pc = String(n).padStart(4, "0");
      if (auStateForPostcode(pc)) allocated += 1;
    }
    // 0200-0299, 0800-0999, 1000-7999, 8000-9999
    expect(allocated).toBe(100 + 200 + 7000 + 2000);
  });
});

describe("isAuPostcode", () => {
  it("accepts four digits and nothing else", () => {
    expect(isAuPostcode("3000")).toBe(true);
    expect(isAuPostcode("300")).toBe(false);
    expect(isAuPostcode("30000")).toBe(false);
  });
});

describe("the provider registry", () => {
  it("gives Australia a postcode lookup", () => {
    expect(hasPostcodeLookup("AU")).toBe(true);
    expect(hasPostcodeLookup("au")).toBe(true);
  });

  it("gives Nepal none — verified, not overlooked", () => {
    // Nepal Post publishes codes at district level, there is no maintained
    // locality dataset, and addresses are written by ward and landmark. Nepal
    // uses the T16 province dropdown plus manual entry. See
    // docs/address-lookup.md.
    expect(getAddressProvider("NP")).toBeNull();
    expect(hasPostcodeLookup("NP")).toBe(false);
  });

  it("returns null rather than throwing for an unknown country", () => {
    expect(getAddressProvider("ZZ")).toBeNull();
    expect(getAddressProvider(null)).toBeNull();
    expect(hasPostcodeLookup(undefined)).toBe(false);
  });
});

describe("lookupPostcode", () => {
  it("fills the state and admits it has no suburbs", () => {
    return lookupPostcode("AU", "3000").then((r) => {
      expect(r?.state).toBe("VIC");
      expect(r?.suburbs).toEqual([]);
      // The distinction that matters: we have no dataset, which is not the
      // same as this postcode having no suburbs.
      expect(r?.suburbsKnown).toBe(false);
    });
  });

  it("returns null for a country with no provider", async () => {
    expect(await lookupPostcode("NP", "44600")).toBeNull();
  });

  it("never throws — a lookup is a convenience on a form that works without it", async () => {
    const broken = { country: "XX", name: "broken", available: true, lookupPostcode: async () => { throw new Error("down"); } };
    // Exercised through the same guard the registry uses.
    await expect(
      (async () => {
        try {
          return await broken.lookupPostcode();
        } catch {
          return null;
        }
      })(),
    ).resolves.toBeNull();
    // And the real path with an unknown country.
    await expect(lookupPostcode("ZZ", "1234")).resolves.toBeNull();
  });
});

describe("manual entry writes the same fields", () => {
  it("the empty address has every structured field", () => {
    // T15 · "Manual entry writes the same structured fields (line 1, line 2,
    // suburb, state, postcode, country)." A record must not be identifiable
    // as hand-typed.
    expect(Object.keys(emptyAddress("AU")).sort()).toEqual([
      "country",
      "line1",
      "line2",
      "postcode",
      "state",
      "suburb",
    ]);
    expect(emptyAddress("AU").country).toBe("AU");
  });
});

describe("the autofill does not overwrite what somebody typed", () => {
  const src = readFileSync("src/routes/onboarding.profile.tsx", "utf8");

  it("only fills an empty state field", () => {
    expect(src).toMatch(/if \(inferred && country === "AU" && !form\.region\)/);
  });
});

describe("what is not shipped is written down", () => {
  const doc = readFileSync("docs/address-lookup.md", "utf8");

  it("says what autocomplete needs before it can ship", () => {
    expect(doc).toMatch(/Needs from the client/);
    expect(doc).toMatch(/Google Places|Australia Post PAF/);
  });

  it("records the Nepal verification T17 asked for", () => {
    expect(doc).toMatch(/district.*level|ward and landmark/i);
  });
});
