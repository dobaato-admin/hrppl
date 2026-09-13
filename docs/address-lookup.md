# T15 / T17 — address search and postcode lookup

**Status: the interface and the Australian postcode→state rule ship. Free-text
autocomplete and postcode→suburb do not, for the reasons below. This is the
"flag it back to the client rather than blocking" T17 asked for.**

## What ships

**The provider interface** (`src/lib/address/`). One entry per country in
`providers.ts`. A second source is a new file plus a registry line — no change
to any form, which is what T15 asked for.

**Australia: postcode → state, complete.** Australia Post allocates postcodes
in contiguous per-state ranges and has since 1967. That is a rule, not a
dataset, so it is implemented in full in `au-postcode.ts` including the
PO-box-only blocks and the ACT ranges that sit inside NSW's numeric span. It
never guesses: the unallocated gaps return null, because a silently wrong state
routes payroll tax to the wrong revenue office, and a blank field the person
fills in is better than a filled field that is wrong.

**Manual entry, everywhere, as a first-class path.** It writes the same
structured fields autocomplete would, so a record cannot be identified as
hand-typed. This is not a fallback that reads as failure — in Nepal it is the
primary path (below), and it has to be good enough to be that.

## What does not ship, and why

**Free-text address autocomplete.** Every usable Australian source is either
licensed (Australia Post PAF) or a paid API needing a key (Google Places,
Geoscape). The interface has a `search()` slot and a provider reports
`available: false` until one is configured, so the form falls to manual entry
with a reason rather than showing a search box that returns nothing.

*Needs from the client:* a decision on provider and budget, and the key.

**Postcode → suburb.** One Australian postcode covers many suburbs and nothing
about the number tells you which, so this half genuinely needs a dataset
(~16,000 postcode/locality pairs). It is deliberately not shipped with a
partial sample: a lookup that fails for most postcodes teaches people the
feature is broken, which is worse than not having it. `PostcodeLookupResult`
carries `suburbsKnown: false` so the form says "type your suburb" rather than
implying the postcode has none.

*Needs from the client:* agreement to load a dataset (data.gov.au publishes a
free postcode/locality file under CC-BY; Australia Post's PAF is the licensed
option) — then this becomes a data load, not a code change.

## Nepal — verified, as T17 asked

T17 said to verify what postcode/suburb data exists for Nepal before
committing. It is thin:

- Nepal Post publishes postal codes at **district** level, not suburb level.
- There is no maintained locality dataset comparable to Australia's.
- Addresses are described in practice by **ward number and landmark**, not by a
  postcode-suburb pair — so even a complete postcode dataset would not match
  how people write their address.

**Therefore Nepal gets the province dropdown from T16 plus manual entry**, and
no postcode lookup. This is a recommendation to the client, not a limitation we
are hiding: building a postcode→suburb flow for Nepal would produce a form that
matches neither the data nor the habit.
