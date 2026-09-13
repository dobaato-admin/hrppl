/**
 * T17 · Australian postcode → state, from the allocation ranges.
 *
 * The ticket asks for "postcode → suburb list → state auto-populates". Those
 * two halves need very different things, and only one of them needs data:
 *
 * - **Postcode → state is a rule.** Australia Post allocates postcodes in
 *   contiguous ranges per state, and has done since 1967. It is complete,
 *   stable, and needs no dataset — so it ships in full, here.
 * - **Postcode → suburb needs a dataset**, because one postcode covers many
 *   suburbs and nothing about the number tells you which. See
 *   `postcode-localities.ts` for why that half is not shipped with a token
 *   sample.
 *
 * Ranges include the PO-box-only blocks, because someone typing 1234 has a
 * valid NSW postcode even though nobody lives there.
 */

import type { AuStateCode } from "./types";

interface Range {
  from: number;
  to: number;
  state: AuStateCode;
}

/**
 * Ordered, non-overlapping. ACT's two ranges sit inside NSW's numeric span,
 * which is why this is a list of ranges rather than a lookup on the first
 * digit — 2600 is Canberra, not Sydney, and a first-digit rule gets every
 * Canberra address wrong.
 */
const RANGES: Range[] = [
  { from: 200, to: 299, state: "ACT" }, // PO boxes
  { from: 800, to: 999, state: "NT" },
  { from: 1000, to: 1999, state: "NSW" }, // PO boxes
  { from: 2000, to: 2599, state: "NSW" },
  { from: 2600, to: 2618, state: "ACT" },
  { from: 2619, to: 2899, state: "NSW" },
  { from: 2900, to: 2920, state: "ACT" },
  { from: 2921, to: 2999, state: "NSW" },
  { from: 3000, to: 3999, state: "VIC" },
  { from: 4000, to: 4999, state: "QLD" },
  { from: 5000, to: 5999, state: "SA" },
  { from: 6000, to: 6999, state: "WA" },
  { from: 7000, to: 7999, state: "TAS" },
  { from: 8000, to: 8999, state: "VIC" }, // PO boxes
  { from: 9000, to: 9999, state: "QLD" }, // PO boxes
];

/**
 * The state or territory a postcode belongs to, or null.
 *
 * Null for anything that is not four digits, and for the unallocated gaps —
 * 0000–0199, 0300–0799. Guessing on those would be worse than leaving the
 * field for the person to fill: a silently wrong state routes payroll tax to
 * the wrong revenue office.
 */
export function auStateForPostcode(postcode: string | null | undefined): AuStateCode | null {
  const raw = (postcode ?? "").trim();
  if (!/^\d{4}$/.test(raw)) return null;
  const n = Number(raw);
  for (const r of RANGES) {
    if (n >= r.from && n <= r.to) return r.state;
  }
  return null;
}

/** True when a string is shaped like an Australian postcode. */
export function isAuPostcode(value: string | null | undefined): boolean {
  return /^\d{4}$/.test((value ?? "").trim());
}
