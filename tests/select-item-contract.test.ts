/**
 * The select trigger rendered two lines of text inside a 36px control.
 *
 * Reported with a screenshot of "Grant role to Gina Shrestha": the Role
 * trigger showed "HR" with "Manages people, leave, training, compliance"
 * beneath it, centred, overflowing its own border.
 *
 * The cause is a Radix contract that is easy to miss: `SelectPrimitive.Item`
 * clones the contents of `ItemText` into the **trigger**, because that is how
 * the closed control knows what to display. Our `SelectItem` wrapped ALL
 * children in `ItemText`, so a two-line block rendered in both places — fine
 * in the open list, wrong in the trigger.
 *
 * `description` renders outside `ItemText`. These tests stop a call site
 * going back to multi-line children, and pin the CSS that makes a long single
 * line truncate rather than push the chevron out of the control.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SELECT = readFileSync("src/components/ui/select.tsx", "utf8");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("SelectItem renders its description outside ItemText", () => {
  it("accepts a description prop", () => {
    expect(SELECT).toMatch(/description\?: React\.ReactNode/);
  });

  it("puts the description AFTER the closing ItemText tag", () => {
    // This is the whole fix. Inside, it reaches the trigger; outside, it does
    // not.
    const closeItemText = SELECT.indexOf("</SelectPrimitive.ItemText>");
    const descriptionRender = SELECT.indexOf("{description ? (");
    expect(closeItemText).toBeGreaterThan(-1);
    expect(descriptionRender).toBeGreaterThan(closeItemText);
  });

  it("only children go inside ItemText", () => {
    expect(SELECT).toMatch(/<SelectPrimitive\.ItemText>\{children\}<\/SelectPrimitive\.ItemText>/);
  });

  it("the description does not swallow the click that selects the row", () => {
    const block = SELECT.slice(SELECT.indexOf("{description ? ("));
    expect(block).toMatch(/pointer-events-none/);
  });
});

describe("no call site passes multi-line children to SelectItem", () => {
  it("none wraps children in a flex-col block", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles("src/routes"), ...sourceFiles("src/components")]) {
      if (file.endsWith("ui/select.tsx")) continue;
      const src = readFileSync(file, "utf8");
      // <SelectItem …> … flex flex-col … </SelectItem>
      const re = /<SelectItem\b[\s\S]{0,400}?<\/SelectItem>/g;
      for (const match of src.match(re) ?? []) {
        if (/flex-col/.test(match)) offenders.push(`${file}: ${match.slice(0, 90).replace(/\s+/g, " ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("a long value truncates instead of breaking the trigger", () => {
  it("the value span can actually shrink", () => {
    // `truncate` alone does nothing in a flex row: a flex item's default
    // min-width is `auto`, so it refuses to shrink below its content and
    // pushes the container instead. `min-w-0` is the part that works.
    expect(SELECT).toMatch(/\[&>span\]:min-w-0/);
    expect(SELECT).toMatch(/\[&>span\]:truncate/);
  });

  it("the chevron cannot be pushed out of the control", () => {
    const icon = SELECT.slice(SELECT.indexOf("SelectPrimitive.Icon"));
    expect(icon).toMatch(/shrink-0/);
  });

  it("the value is left-aligned", () => {
    // The screenshot showed it centred.
    expect(SELECT).toMatch(/\[&>span\]:text-left/);
  });
});

describe("a dialog does not grow to fit its widest child", () => {
  const DIALOG = readFileSync("src/components/ui/dialog.tsx", "utf8");

  it("caps the grid track so max-w-lg actually holds", () => {
    // Measured on /org/roles: with min-w-0 and truncate correctly applied to
    // the select's value span, a long value STILL grew the trigger from 462px
    // to 631px and pushed its chevron 169px right — because DialogContent was
    // a bare `grid`, whose track sizes to content and overflows the
    // container's own max-width. Capping the track is what makes every
    // `truncate` inside any dialog work.
    expect(DIALOG).toMatch(/grid-cols-\[minmax\(0,1fr\)\]/);
    expect(DIALOG).toMatch(/max-w-lg/);
  });

  it("the select trigger can shrink inside whatever contains it", () => {
    const trigger = SELECT.slice(SELECT.indexOf("SelectTrigger"), SELECT.indexOf("SelectScrollUpButton"));
    expect(trigger).toMatch(/w-full min-w-0/);
  });
});

describe("the grant-role dialog", () => {
  const src = readFileSync("src/routes/org.roles.tsx", "utf8");

  it("does not mark the branch field invalid before a submit is attempted", () => {
    // `aria-invalid={!newBranch}` outlined the field in red the moment the
    // dialog opened — telling somebody they have made a mistake before one is
    // possible.
    expect(src).not.toMatch(/aria-invalid=\{!newBranch\}/);
    expect(src).toMatch(/aria-invalid=\{branchMissing \|\| undefined\}/);
    expect(src).toMatch(/const branchMissing = grantAttempted &&/);
  });

  it("resets that flag each time the dialog opens", () => {
    const open = src.slice(src.indexOf("function openGrant"), src.indexOf("function openScope"));
    expect(open).toMatch(/setGrantAttempted\(false\)/);
  });

  it("says what is wrong in words, not only in colour", () => {
    expect(src).toMatch(/role="alert"/);
    expect(src).toMatch(/id="grant-branch-error"/);
    expect(src).toMatch(/aria-describedby=\{branchMissing \? "grant-branch-error" : "grant-branch-hint"\}/);
  });

  it("no longer captions a required field with what happens if you skip it", () => {
    // The field was marked required with a * and captioned "Without a branch
    // this role would cover the whole organisation", which says the opposite.
    const dialog = src.slice(src.indexOf("Grant role to"));
    expect(dialog).not.toMatch(/Without a branch this role would cover/);
  });

  it("marks the required asterisk as decoration and says the word", () => {
    expect(src).toMatch(/aria-hidden="true" className="text-destructive">\*/);
    expect(src).toMatch(/className="sr-only">\(required\)/);
  });

  it("moves focus to the field it refused on", () => {
    expect(src).toMatch(/getElementById\("grant-branch"\)\?\.focus\(\)/);
  });

  it("lets a long name wrap rather than pushing the close button away", () => {
    const titles = [...src.matchAll(/<DialogTitle className="([^"]*)"/g)].map((m) => m[1]);
    expect(titles.length).toBeGreaterThanOrEqual(2);
    for (const cls of titles) {
      expect(cls).toMatch(/break-words/);
      expect(cls).toMatch(/pr-6/);
    }
  });
});
