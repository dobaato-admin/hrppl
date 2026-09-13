import type { AddressProvider, PostcodeLookupResult } from "./types";
import { auStateForPostcode, isAuPostcode } from "./au-postcode";

/**
 * T15 · The provider registry.
 *
 * One entry per country. A provider that is registered but not `available`
 * means "this country has a lookup, but it is not usable here" — no API key,
 * no dataset — and the form falls to manual entry with a reason, rather than
 * showing a search box that silently returns nothing.
 *
 * ## Launch coverage, stated plainly
 *
 * **Australia.** Postcode → state ships complete, because it is a rule rather
 * than a dataset (see `au-postcode.ts`). Postcode → suburb and free-text
 * autocomplete need a dataset or a paid API and are **not** shipped: see
 * `docs/address-lookup.md`.
 *
 * **Nepal.** T17 asked us to verify what postcode/suburb data exists before
 * committing. It is thin: Nepal Post publishes postal codes at district level,
 * there is no maintained locality dataset comparable to Australia's, and
 * addresses in practice are described by ward and landmark rather than by a
 * postcode-suburb pair. So Nepal gets the province dropdown from T16 plus
 * manual entry, and that is flagged to the client rather than blocking the
 * ticket — which is what T17 asked for.
 *
 * Manual entry is a first-class path in every country, not a fallback that
 * reads as failure. It writes the same structured fields autocomplete does.
 */

/** Australia: the postcode→state rule, with no suburb dataset behind it. */
const auProvider: AddressProvider = {
  country: "AU",
  name: "Australian postcode ranges",
  available: true,
  async lookupPostcode(postcode: string): Promise<PostcodeLookupResult> {
    const state = auStateForPostcode(postcode);
    return {
      postcode: (postcode ?? "").trim(),
      state,
      suburbs: [],
      // The honest answer. We have no locality dataset loaded, so the form
      // must ask the person for their suburb rather than implying this
      // postcode has none.
      suburbsKnown: false,
    };
  },
};

const PROVIDERS: Record<string, AddressProvider> = {
  AU: auProvider,
};

/** The provider for a country, or null when it has none. */
export function getAddressProvider(country: string | null | undefined): AddressProvider | null {
  const code = (country ?? "").toUpperCase();
  return PROVIDERS[code] ?? null;
}

/** Whether typing a postcode can fill anything in for this country. */
export function hasPostcodeLookup(country: string | null | undefined): boolean {
  const p = getAddressProvider(country);
  return !!p?.available && typeof p.lookupPostcode === "function";
}

/**
 * Look a postcode up, returning null when the country has no lookup.
 *
 * Never throws: a lookup is a convenience on top of a form that works without
 * it, and an address form that fails because an optional enrichment failed is
 * a worse form than one with no enrichment.
 */
export async function lookupPostcode(
  country: string | null | undefined,
  postcode: string,
): Promise<PostcodeLookupResult | null> {
  const provider = getAddressProvider(country);
  if (!provider?.available || !provider.lookupPostcode) return null;
  try {
    return await provider.lookupPostcode(postcode);
  } catch (e) {
    console.error("[address] postcode lookup failed", country, e);
    return null;
  }
}

/** Re-exported so callers need one import. */
export { auStateForPostcode, isAuPostcode };
