import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * A server function with no caller is a feature nobody can use.
 *
 * ---------------------------------------------------------------------------
 * Why this is worth a test
 * ---------------------------------------------------------------------------
 *
 * The W5 gap register found **48 of 588 server functions with no caller
 * anywhere in src/**. Tables, migrations, RLS policies and in several cases
 * unit tests all existed; nothing in the product invoked them. They are
 * invisible from the app and they pass every other kind of test, because a
 * function that is never called is never wrong.
 *
 * Some of what was hiding there mattered: the whole Australian compliance
 * domain (26 functions), the conversation on a support ticket, the draft state
 * of an employment variation, and the links that connect two events on an
 * employee's timeline. Each was built, tested, and unreachable.
 *
 * The count is now zero, and this keeps it there. A new server function must
 * be called by something, or be listed below with a reason.
 *
 * ---------------------------------------------------------------------------
 * Reading a failure
 * ---------------------------------------------------------------------------
 *
 * Adding a name to ALLOWED is the wrong first instinct. Ask instead which page
 * was supposed to call this and does not — that page is usually the actual
 * missing work, and the orphan is the symptom.
 */

const ROOT = process.cwd();
const LIB = join(ROOT, "src/lib");

/**
 * Deliberately uncalled from `src/`, each with the reason.
 *
 * A hook endpoint invoked over HTTP by a scheduler is not an orphan — nothing
 * in `src/` imports it because the caller is Vercel Cron or pg_cron.
 */
const ALLOWED: Record<string, string> = {
  // ── The award catalogue is edited at PLATFORM level, and that page does not
  // exist yet. These three are gated by assertCatalogueAdmin — super_admin, or
  // a regional_admin scoped to the country — not by any tenant role, so they
  // cannot live on /admin/awards, which is a tenant surface and deliberately
  // read-only about the catalogue. The missing surface is the regional course/
  // catalogue console, which is parked with D-8.
  upsertAward: "platform-level catalogue editing; the regional console is parked with D-8",
  upsertAwardClassification: "platform-level catalogue editing; parked with D-8",
  upsertAwardRate: "platform-level catalogue editing; parked with D-8",
  // ── A PAYG-W / SG calculator for a period that has not been run yet. Its
  // home is a preview panel on /org/payroll, which is a feature rather than a
  // loose end — the page currently computes a run, it does not model one.
  previewAuPeriod: "wants a preview panel on /org/payroll; that is a feature, not a wire-up",
};

/** Every exported createServerFn across the RPC layer. */
function exportedServerFns(): { name: string; module: string }[] {
  const out: { name: string; module: string }[] = [];
  for (const file of readdirSync(LIB)) {
    if (!file.endsWith(".functions.ts")) continue;
    const src = readFileSync(join(LIB, file), "utf8");
    for (const m of src.matchAll(/^export const (\w+) = createServerFn/gm)) {
      out.push({ name: m[1], module: file });
    }
  }
  return out;
}

/** Every source file that could call one — i.e. everything but the definitions. */
function consumerSources(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".functions.ts")) {
        files.push(p);
      }
    }
  };
  walk(join(ROOT, "src"));
  return files;
}

const FNS = exportedServerFns();
const CORPUS = consumerSources()
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

describe("every server function is reachable from the product", () => {
  it("finds the server functions to check", () => {
    // Guards against the scan silently matching nothing.
    expect(FNS.length).toBeGreaterThan(500);
  });

  it("has no orphans", () => {
    const orphans = FNS.filter(({ name }) => {
      if (ALLOWED[name]) return false;
      return !new RegExp(`\\b${name}\\b`).test(CORPUS);
    }).map((f) => `${f.module} → ${f.name}`);

    expect(
      orphans,
      "These server functions are exported and called by nothing in src/, so " +
        "no one can reach the behaviour they implement. Wire each into the page " +
        "that wanted it, delete it if something else now does the job, or add " +
        "it to ALLOWED with the reason it has no in-repo caller.",
    ).toEqual([]);
  });

  it("every exemption carries a reason and still exists", () => {
    for (const [name, reason] of Object.entries(ALLOWED)) {
      expect(reason.length, `${name} needs a real reason`).toBeGreaterThan(20);
      expect(
        FNS.some((f) => f.name === name),
        `${name} is exempt but is no longer a server fn — drop the entry`,
      ).toBe(true);
    }
  });
});

describe("the four P5 loose ends are wired, not just present", () => {
  /**
   * Each of these had a caller-count of zero and a page that obviously wanted
   * it. Pinned by the call site rather than by the orphan scan above, so a
   * failure names the surface that lost the capability.
   */
  const CASES: [string, string, string][] = [
    [
      "src/components/requests/TicketThread.tsx",
      "addTicketComment",
      "a ticket could be raised and decided, but nobody could say a word about it",
    ],
    [
      "src/components/requests/TicketThread.tsx",
      "listTicketComments",
      "the thread has to be readable, not just writable",
    ],
    [
      "src/routes/hr.variations.tsx",
      "submitVariation",
      "the draft state was authored, filterable, and could never be advanced",
    ],
    [
      "src/routes/admin.employees.$employeeId.tsx",
      "linkEvents",
      "the timeline's causal links were stored, fetched, and dropped by the UI",
    ],
  ];

  it.each(CASES)("%s calls %s — %s", (file, fn) => {
    const p = join(ROOT, file);
    expect(existsSync(p), `${file} is missing`).toBe(true);
    expect(readFileSync(p, "utf8")).toContain(fn);
  });

  it("renders both halves of a ticket conversation from one component", () => {
    // /me/requests and /admin/requests are two views of one conversation.
    // Two implementations would drift into disagreeing about what was said.
    const list = readFileSync(join(ROOT, "src/components/requests/RequestList.tsx"), "utf8");
    expect(list).toContain("TicketThread");
  });

  it("does not re-filter internal comments in the client", () => {
    // The rule lives in the RLS policy support_ticket_comments_view. Applying
    // it a second time here is how two copies of a rule start to disagree —
    // the component decides whether to OFFER the toggle, nothing more.
    const thread = readFileSync(join(ROOT, "src/components/requests/TicketThread.tsx"), "utf8");
    expect(thread).not.toMatch(/filter\([^)]*is_internal/);
    expect(thread).toContain("org.ticketInternalNotes");
  });
});

describe("the product has one name", () => {
  const SRC = consumerSources().concat(
    readdirSync(LIB)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => join(LIB, f)),
  );

  it("no file still says WorldPay", () => {
    // Three spellings shipped at once — "WorldPay HRMS", "HRPPL" and "hrppl" —
    // including in a staff invitation email and the public OpenAPI document,
    // both of which are read by people outside the team.
    const offenders = SRC.filter((f) => /WorldPay/.test(readFileSync(f, "utf8"))).map((f) =>
      f.replace(ROOT + "/", ""),
    );
    expect(offenders).toEqual([]);
  });

  it("uses one title suffix", () => {
    const suffixes = new Set<string>();
    for (const f of SRC) {
      if (!f.includes("/routes/")) continue;
      for (const m of readFileSync(f, "utf8").matchAll(/title: "[^"]*— ([^"]+)"/g)) {
        suffixes.add(m[1]);
      }
    }
    // Qualified suffixes are fine ("… — hrppl API"); what must not vary is how
    // the NAME ITSELF is spelled. Three spellings shipped at once, and the
    // capitalisation is the part a reader notices.
    const spellings = new Set<string>();
    for (const suffix of suffixes) {
      const m = suffix.match(/hrppl/i);
      if (m) spellings.add(m[0]);
    }
    expect(
      [...spellings],
      `The product name is spelled ${spellings.size} different ways in page titles`,
    ).toEqual(["hrppl"]);
  });
});
