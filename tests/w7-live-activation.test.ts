import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { buildSetupGuide } from "../src/lib/setup-guide.functions";

/**
 * Live check of the activation gate against the dev project.
 *
 * Skipped without service-role credentials, exactly like `rbac.test.ts` — the
 * unit tests in `setup-guide.test.ts` cover the logic against a stub; this one
 * answers the different question of whether a real tenant's real data satisfies
 * the gate.
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT = process.env.W7_TENANT_ID;

describe.skipIf(!URL || !KEY || !TENANT)("Acme is genuinely ready to activate", () => {
  it("reports every required segment complete", async () => {
    const sb = createClient(URL!, KEY!);
    const guide = await buildSetupGuide(sb as any, TENANT!);
    const outstanding = guide.segments
      .filter((s) => s.required && !s.done)
      .map(
        (s) =>
          `${s.title}: ${s.checks
            .filter((c) => !c.done && !c.hint)
            .map((c) => c.label)
            .join(", ")}`,
      );
    expect(outstanding, "required segments still outstanding").toEqual([]);
    expect(guide.requiredComplete).toBe(true);
    console.log(
      `percent=${guide.percent} segments done=${guide.segments.filter((s) => s.done).length}/7`,
    );
  });
});
