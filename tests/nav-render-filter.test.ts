import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * The sidebar must RENDER the filtered list, not just compute it.
 *
 * ---------------------------------------------------------------------------
 * The bug this exists to stop coming back
 * ---------------------------------------------------------------------------
 *
 * `FlyoutNavGroup` computed `visibleItems` and `visibleSections` by running
 * every row through `can()` — and then used them for exactly two things: the
 * decision to render the group at all, and the active highlight. The popover
 * body, the part a person actually reads and clicks, mapped over the RAW
 * `items` and `sections` props.
 *
 * So every row in every flyout was offered to every role, whatever its feature
 * key said. `finance` saw "STP pay events", clicked it, and the route gate
 * bounced them to /dashboard.
 *
 * That is precisely the dead-link shape W5 spent two waves removing — and none
 * of that work could see it, because every test looked at the nav DATA and the
 * route GATES, which agreed with each other perfectly. The defect sat one level
 * below both, in how the data was rendered. It was found by opening the flyout
 * in a browser as a real seeded user and counting the rows.
 *
 * ---------------------------------------------------------------------------
 * Why this is a source assertion
 * ---------------------------------------------------------------------------
 *
 * The honest test is a render test: mount the shell as `finance` and assert
 * three links. That needs the whole provider stack — auth, router, query
 * client, sidebar context — which this suite has no harness for, and a shallow
 * approximation of it would be its own kind of lie.
 *
 * So this asserts the property directly on the source: inside the component,
 * the render path must not reach for the unfiltered props. It is narrow, but
 * it fails loudly on the exact regression, and its message says what to do.
 */

const ROOT = process.cwd();
const SRC = readFileSync(join(ROOT, "src/components/AppShell.tsx"), "utf8");

/** The body of FlyoutNavGroup — the component that renders the popover. */
function flyoutSource(): string {
  const from = SRC.indexOf("function FlyoutNavGroup(");
  expect(from, "FlyoutNavGroup not found — has it been renamed?").toBeGreaterThan(-1);
  // Runs to the next top-level function declaration.
  const rest = SRC.slice(from + 1);
  const next = rest.indexOf("\nfunction ");
  return next === -1 ? SRC.slice(from) : SRC.slice(from, from + 1 + next);
}

describe("the sidebar renders what it filtered", () => {
  const BODY = flyoutSource();

  it("computes both filtered lists", () => {
    expect(BODY).toMatch(/const visibleItems = items\.filter\(isVisible\)/);
    expect(BODY).toMatch(/const visibleSections = /);
  });

  it("maps the filtered lists, never the raw props", () => {
    // `items.map(` / `sections.map(` inside the render is the bug verbatim.
    // `section.items.map(` is fine: those items came out of visibleSections.
    const rawItems = /(?<![.\w])items\.map\(/.test(BODY);
    const rawSections = /(?<![.\w])sections\.map\(/.test(BODY);
    expect(
      { rawItems, rawSections },
      "FlyoutNavGroup's popover must render visibleItems / visibleSections. " +
        "Mapping the raw `items` or `sections` props shows every row to every " +
        "role regardless of its feature key, and the route gate then refuses " +
        "the click — a dead link one level below the nav data the other tests " +
        "read.",
    ).toEqual({ rawItems: false, rawSections: false });
  });

  it("decides the accordion from the filtered sections too", () => {
    // `sections?.length ? <Accordion>` renders an empty bordered box when every
    // section in it was filtered away for this role.
    expect(BODY).not.toMatch(/\{sections\?\.length \?/);
    expect(BODY).toMatch(/\{visibleSections\.length \?/);
  });

  it("filters on all three axes", () => {
    // feature (role), hideWhen (completion state), country (where the tenant
    // operates). Dropping any one silently widens the sidebar.
    expect(BODY).toMatch(/can\(i\.feature, roles\)/);
    expect(BODY).toMatch(/i\.hideWhen/);
    expect(BODY).toMatch(/appliesToCountry\(i\.country, tenantCountry\)/);
  });

  it("hides a country-scoped subgroup as a whole", () => {
    // "Australian compliance" must be absent for a Nepali tenant, not an empty
    // heading — an empty section reads as a broken page, not an absent feature.
    expect(BODY).toMatch(/appliesToCountry\(s\.country, tenantCountry\)/);
  });
});

describe("country filtering fails closed", () => {
  it("an unknown tenant country hides country-scoped rows", () => {
    // The two ways to be wrong are not symmetrical: a row that is briefly
    // missing corrects itself when the query lands; one that is briefly present
    // is a link that answers Forbidden if clicked in that window.
    const from = SRC.indexOf("function appliesToCountry(");
    expect(from).toBeGreaterThan(-1);
    const fn = SRC.slice(from, from + 400);
    expect(fn).toMatch(/if \(!country\) return true;/);
    expect(fn).toMatch(/if \(!tenantCountry\) return false;/);
  });
});
