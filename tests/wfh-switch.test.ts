import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

/**
 * The tenant-level work-from-home switch, and the door it used to leave open.
 *
 * `tenants.wfh_enabled` existed, `createWfhRequest` refused when it was off,
 * `/admin/wfh` could toggle it — and `decideWfhRequest` never looked at it. So
 * requests filed BEFORE the switch was turned off stayed in the queue and could
 * still be approved, and an approved window authorises remote clock-in. An
 * organisation that had just said "no remote work" went on permitting it,
 * through a queue nobody thought of as a second entrance.
 *
 * Two rules follow, and they pull in opposite directions on purpose.
 */
const WFH = readFileSync("src/lib/wfh.functions.ts", "utf8");
const ADMIN_PAGE = readFileSync("src/routes/admin.wfh.tsx", "utf8").replace(/\s+/g, " ");

describe("the switch closes the side door as well as the front one", () => {
  it("creating a request checks it", () => {
    expect(WFH).toMatch(/isWfhEnabled/);
    expect(WFH).toMatch(/does not currently permit work-from-home requests/);
  });

  it("APPROVING a request checks it too", () => {
    // The gap. Without this, the switch only stops requests that had not been
    // filed yet — which is the half that matters least, because a pending
    // queue is exactly what exists when somebody decides to turn it off.
    expect(WFH).toMatch(/data\.decision === "approved" && !\(await isWfhEnabled\(/);
  });

  it("rejecting is still allowed while it is off", () => {
    // An approver must be able to clear a queue they can no longer say yes to.
    // Refusing both decisions would strand every pending request forever, which
    // is a worse outcome than the bug.
    const guard = /if \(data\.decision === "approved" && !\(await isWfhEnabled\([^)]*\)\)\)/.exec(
      WFH,
    );
    expect(guard, "the approval guard must be conditional on the decision").not.toBeNull();
  });
});

describe("switching it off does not revoke what was already approved", () => {
  it("counts the windows still in force instead of deleting them", () => {
    // Somebody was told they may work from home that day and may have arranged
    // their life around it, and attendance is the input to pay. Same good-faith
    // rule the lifecycle trigger applies to a request with a punch under it.
    expect(WFH).toMatch(/remainingApprovedWindows/);
    expect(WFH).toMatch(/\.eq\("status", "approved"\)/);
    // Only windows that have not finished — a count including last year's
    // would be alarming and meaningless.
    expect(WFH).toMatch(/\.gte\("end_date", today\)/);
  });

  it("the admin is told, rather than left to find out from attendance", () => {
    expect(ADMIN_PAGE).toMatch(/remainingApprovedWindows/);
    expect(ADMIN_PAGE).toMatch(/still in force/);
    // And the other branch says so too, so "no message" never has to be
    // interpreted as either answer.
    expect(ADMIN_PAGE).toMatch(/takes effect immediately/);
  });
});
