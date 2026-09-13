/**
 * T15 · The address shape, and the provider interface behind it.
 *
 * "Build the lookup behind a provider interface so a second source can be
 * added per country without touching the form." Everything a form needs is
 * expressed here, so adding Australia Post, Google Places, or whatever Nepal
 * ends up using is a new file in this directory and one registry entry.
 */

export type AuStateCode = "ACT" | "NSW" | "NT" | "QLD" | "SA" | "TAS" | "VIC" | "WA";

/**
 * A structured address. Manual entry and autocomplete produce exactly this —
 * that is the point of T15's "manual entry writes the same structured
 * fields". A record must not be identifiable as hand-typed.
 */
export interface StructuredAddress {
  line1: string;
  line2: string;
  /** Suburb, town or city. */
  suburb: string;
  /** Subdivision code where the country has one (see country_subdivisions). */
  state: string;
  postcode: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
}

export function emptyAddress(country = ""): StructuredAddress {
  return { line1: "", line2: "", suburb: "", state: "", postcode: "", country };
}

export interface AddressSuggestion {
  /** Stable id from the provider, for keying and for a follow-up fetch. */
  id: string;
  /** One-line form, for the suggestion list. */
  label: string;
  /** Everything the provider already knows. A provider that returns a full
   *  address here saves the form a second request. */
  address: StructuredAddress;
}

export interface PostcodeLookupResult {
  postcode: string;
  /** Subdivision code, when the country's postcodes determine one. */
  state: string | null;
  /** Localities sharing this postcode. Empty when no dataset is loaded. */
  suburbs: string[];
  /**
   * False when we have no locality data for this country — distinct from a
   * postcode that genuinely matched nothing. The form says different things
   * for the two, because "type your suburb" and "that postcode doesn't exist"
   * are different instructions.
   */
  suburbsKnown: boolean;
}

export interface AddressProvider {
  /** ISO country this provider serves. */
  readonly country: string;
  /** Human name, shown in the "powered by" line where the provider requires it. */
  readonly name: string;
  /**
   * False when the provider is present in the registry but not usable — no API
   * key configured, no dataset loaded. The form falls to manual entry and says
   * so, rather than offering a search box that returns nothing.
   */
  readonly available: boolean;
  /** Free-text autocomplete. Only called when `available`. */
  search?(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]>;
  /** Postcode lookup. May be present when `search` is not. */
  lookupPostcode?(postcode: string): Promise<PostcodeLookupResult>;
}
