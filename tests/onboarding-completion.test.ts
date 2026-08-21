import { describe, it, expect } from "vitest";
import { computeOnboardingCompletion } from "../src/lib/onboarding-completion";

/**
 * Finalization Plan §1 #1 — "persistent onboarding screen shown even after
 * checklist completion".
 *
 * The rule under test: the employee is done when every REQUIRED item is ticked
 * and none has been bounced back. HR approval continues afterwards and must
 * never hold the employee on the page — waiting on an admin is the stuck-screen
 * symptom being fixed.
 */

const cl = (id: string, items: [string, boolean][]) => ({
  id,
  items: items.map(([key, required]) => ({ key, required })),
});

const tick = (checklist_id: string, item_key: string, approval_status?: string | null) => ({
  checklist_id,
  item_key,
  approval_status,
});

describe("computeOnboardingCompletion", () => {
  it("is not complete when required items are outstanding", () => {
    const r = computeOnboardingCompletion(
      [
        cl("c1", [
          ["contract", true],
          ["id", true],
        ]),
      ],
      [tick("c1", "contract")],
    );
    expect(r.complete).toBe(false);
    expect(r.doneRequired).toBe(1);
    expect(r.totalRequired).toBe(2);
    expect(r.percent).toBe(50);
  });

  it("is complete once every required item is ticked", () => {
    const r = computeOnboardingCompletion(
      [
        cl("c1", [
          ["contract", true],
          ["id", true],
        ]),
      ],
      [tick("c1", "contract"), tick("c1", "id")],
    );
    expect(r.complete).toBe(true);
    expect(r.percent).toBe(100);
  });

  it("does NOT wait for HR approval — that was the stuck-screen bug", () => {
    // Both ticked, neither reviewed yet. The employee has done their part.
    const r = computeOnboardingCompletion(
      [
        cl("c1", [
          ["contract", true],
          ["id", true],
        ]),
      ],
      [tick("c1", "contract", null), tick("c1", "id", null)],
    );
    expect(r.complete).toBe(true);
    expect(r.awaitingReview).toBe(2);
  });

  it("stays complete once HR approves", () => {
    const r = computeOnboardingCompletion(
      [cl("c1", [["contract", true]])],
      [tick("c1", "contract", "approved")],
    );
    expect(r.complete).toBe(true);
    expect(r.awaitingReview).toBe(0);
  });

  it("reopens when HR rejects an item", () => {
    const r = computeOnboardingCompletion(
      [
        cl("c1", [
          ["contract", true],
          ["id", true],
        ]),
      ],
      [tick("c1", "contract", "rejected"), tick("c1", "id", "approved")],
    );
    expect(r.complete).toBe(false);
    expect(r.rejected).toEqual([{ checklistId: "c1", itemKey: "contract" }]);
  });

  it("ignores optional items when deciding completion", () => {
    const r = computeOnboardingCompletion(
      [
        cl("c1", [
          ["contract", true],
          ["photo", false],
        ]),
      ],
      [tick("c1", "contract")],
    );
    expect(r.complete).toBe(true);
    expect(r.totalRequired).toBe(1);
  });

  it("spans multiple assigned checklists", () => {
    const lists = [cl("c1", [["contract", true]]), cl("c2", [["policy", true]])];
    expect(computeOnboardingCompletion(lists, [tick("c1", "contract")]).complete).toBe(false);
    expect(
      computeOnboardingCompletion(lists, [tick("c1", "contract"), tick("c2", "policy")]).complete,
    ).toBe(true);
  });

  it("does not confuse identical item keys across checklists", () => {
    const lists = [cl("c1", [["id", true]]), cl("c2", [["id", true]])];
    const r = computeOnboardingCompletion(lists, [tick("c1", "id")]);
    expect(r.complete).toBe(false);
    expect(r.doneRequired).toBe(1);
  });

  it("treats a new hire with nothing assigned as NOT complete", () => {
    // Otherwise they would be redirected away before anyone assigns them work.
    const r = computeOnboardingCompletion([], []);
    expect(r.complete).toBe(false);
    expect(r.percent).toBe(0);
  });

  it("treats a checklist of only optional items as NOT complete", () => {
    // Same reasoning: nothing required means nothing was actually asked.
    const r = computeOnboardingCompletion([cl("c1", [["photo", false]])], []);
    expect(r.complete).toBe(false);
  });

  it("tolerates progress rows for items no longer on the checklist", () => {
    // Admins edit checklists after assignment; stale rows must not crash or
    // inflate the count.
    const r = computeOnboardingCompletion(
      [cl("c1", [["contract", true]])],
      [tick("c1", "contract"), tick("c1", "removed-item", "approved")],
    );
    expect(r.complete).toBe(true);
    expect(r.totalRequired).toBe(1);
  });
});

// ------------------------------------------------------------------- wiring

import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

describe("the onboarding page acts on completion (§1 #1)", () => {
  const PAGE = readFileSync(join(root, "src/routes/onboarding.index.tsx"), "utf8");

  it("redirects a finished employee to their dashboard", () => {
    // The original defect: the page computed a percentage and did nothing.
    expect(PAGE).toMatch(/computeOnboardingCompletion/);
    expect(PAGE).toMatch(/navigate\(\{ to: "\/dashboard" \}\)/);
  });

  it("redirects on the transition only, so the record stays reviewable", () => {
    // A permanent redirect would make the completed checklist and the
    // employee's own uploaded documents unreachable.
    //
    // The latch is two-part. useState alone was not enough: navigating to
    // /dashboard unmounts this page and resets it, so every later visit looked
    // like a fresh transition — the toast re-fired and the user was bounced
    // straight back out, never reaching the summary this test exists to
    // protect. sessionStorage carries the flag across mounts.
    expect(PAGE).toMatch(/if \(redirected \|\| sessionStorage\.getItem\(key\)/);
    expect(PAGE).toMatch(/setRedirected\(true\)/);
  });

  it("clears the latch if the employee stops being complete", () => {
    // HR rejecting an item reopens the checklist; they must be able to be
    // redirected again once they re-submit.
    // Both halves of the latch must clear: the in-component state AND the
    // sessionStorage key that now makes it survive unmount.
    const branch = PAGE.slice(PAGE.indexOf("if (!onboardingComplete)"));
    const body = branch.slice(0, branch.indexOf("}") + 1);
    expect(body).toMatch(/sessionStorage\.removeItem\(/);
    expect(body).toMatch(/setRedirected\(false\)/);
  });

  it("shows a completed summary for returning visitors", () => {
    expect(PAGE).toMatch(/You&rsquo;ve completed your onboarding/);
  });

  it("tells the employee when HR has sent something back", () => {
    expect(PAGE).toMatch(/completion\.rejected\.length > 0/);
  });
});

describe("the nav stops advertising finished work", () => {
  const SHELL = readFileSync(join(root, "src/components/AppShell.tsx"), "utf8");

  it("hides the Onboarding entry once complete", () => {
    expect(SHELL).toMatch(/hideWhen: "onboardingComplete"/);
    expect(SHELL).toMatch(/!\(i\.hideWhen && hidden\?\.\[i\.hideWhen\]\)/);
  });

  it("keeps role visibility and completion state as separate filters", () => {
    // Conflating them would let a completed task look like a permissions
    // problem, or vice versa.
    expect(SHELL).toMatch(/`feature` is role visibility, `hideWhen` is/);
  });

  it("caches the lookup — the shell renders on every navigation", () => {
    expect(SHELL).toMatch(/staleTime: 5 \* 60_000/);
  });
});
