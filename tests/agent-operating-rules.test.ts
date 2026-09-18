import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Pins the "Agent operating rules" section of CLAUDE.md and the security
 * posture of the local agent config.
 *
 * Why this exists: `npx ecc-agentshield scan` audits CLAUDE.md as an agent
 * system prompt and re-raises each missing defence on every run. The 2026-09-17
 * scan graded the repo D (51/100) on nine missing defences plus an absent deny
 * list. Rather than re-argue that scan every time somebody runs it, the
 * decisions are written into CLAUDE.md and pinned here.
 *
 * The regexes below are copied verbatim from AgentShield 1.6.0
 * (`src/rules/prompt-defense.ts`, DEFENSE_CHECKS). Keeping them identical is the
 * point: if a rewrite of CLAUDE.md drops a defence, this fails locally *before*
 * the scanner reports it, and the failure names which defence went missing.
 *
 * Gotcha: these patterns use `.` without the `s` flag, so a match cannot cross a
 * newline. A defence sentence must sit on ONE line of CLAUDE.md. Reflowing the
 * paragraph to a different wrap width can therefore "remove" a defence without
 * changing a word of it — which is exactly what this test is here to catch.
 *
 * If a rule genuinely no longer applies, delete it here AND in CLAUDE.md in the
 * same change, with the reason. Do not weaken prose to satisfy a scanner and do
 * not weaken this test to satisfy prose — that is how `20260613143222` silently
 * disabled every training quiz.
 */
const root = process.cwd();

/** Verbatim from AgentShield 1.6.0 src/rules/prompt-defense.ts */
const DEFENCES: Array<{ id: string; pattern: RegExp }> = [
  {
    id: "role-escape",
    pattern:
      /(?:do\s+not|never|must\s+not|cannot|don'?t|refuse|reject|ignore)\s+.{0,60}(?:role|persona|character|identity|pretend|act\s+as|impersonat|role.?play)/i,
  },
  {
    id: "instruction-override",
    pattern:
      /(?:do\s+not|never|must\s+not|cannot|don'?t|refuse|reject)\s+.{0,60}(?:override|ignore|disregard|bypass|modify|change|alter)\s+.{0,40}(?:instruction|system|rule|guideline|directive|prompt)/i,
  },
  {
    id: "data-leakage",
    pattern:
      /(?:do\s+not|never|must\s+not|cannot|don'?t|refuse)\s+.{0,60}(?:reveal|disclose|share|leak|expose|output|repeat|show)\s+.{0,40}(?:system|prompt|instruction|internal|confidential|secret|private|api.?key|credential)/i,
  },
  {
    id: "output-manipulation",
    pattern:
      /(?:do\s+not|never|must\s+not|cannot|don'?t|refuse|restrict|limit|only)\s+.{0,60}(?:output|generat|produc|return|render|includ|embed)\s+.{0,40}(?:code|script|html|markdown|link|url|execut|iframe|javascript)/i,
  },
  {
    id: "multilang-bypass",
    pattern:
      /(?:regardless\s+of\s+(?:the\s+)?language|in\s+(?:any|all|every)\s+language|translat(?:e|ion)\s+.{0,30}(?:rule|instruction|safety|restrict)|language\s+.{0,20}(?:bypass|circumvent|evade))/i,
  },
  {
    id: "unicode-attack",
    pattern:
      /(?:unicode|homoglyph|invisible\s+character|zero.?width|encod(?:ed|ing)\s+.{0,20}(?:trick|attack|bypass|evas)|special\s+character|non.?printable)/i,
  },
  {
    id: "context-overflow",
    pattern:
      /(?:(?:context|token|input|message)\s+.{0,20}(?:limit|length|overflow|window|exceed|truncat|maximum)|too\s+(?:long|large|many)\s+.{0,20}(?:input|token|message|character)|length\s+.{0,10}(?:restrict|limit|cap|max))/i,
  },
  {
    id: "indirect-injection",
    pattern:
      /(?:(?:external|third.?party|user.?provided|untrusted|fetched|retrieved)\s+.{0,30}(?:data|content|source|input|document|url|link|tool)\s+.{0,30}(?:instruct|command|inject|malicious|trust)|indirect\s+.{0,10}(?:inject|prompt|attack))/i,
  },
  {
    id: "social-engineering",
    pattern:
      /(?:(?:emotional|urgency|authority|guilt|sympathy|emergency|life.?or.?death|dying|threaten)\s+.{0,30}(?:manipulat|appeal|pressure|claim|bypass|trick|override)|social\s+engineer)/i,
  },
  {
    id: "output-weaponization",
    pattern:
      /(?:do\s+not|never|must\s+not|cannot|don'?t|refuse)\s+.{0,60}(?:harm(?:ful)?|danger(?:ous)?|illegal|weapon|violen(?:t|ce)|exploit|malware|phishing|attack(?:s|ing)?)/i,
  },
  {
    id: "abuse-prevention",
    pattern:
      /(?:abuse|misuse|exploit(?:ation)?|repeated\s+(?:attempt|request|abuse)|rate\s+limit|session\s+(?:isolat|boundar)|detect\s+.{0,20}(?:abuse|pattern|manipulat))/i,
  },
  {
    id: "input-validation-missing",
    pattern:
      /(?:(?:valid|saniti|verif|check|inspect|reject|filter|screen)\s+.{0,30}(?:input|request|query|message|user\s+(?:input|data|message))|malform|suspicious\s+.{0,10}(?:input|request|pattern))/i,
  },
];

describe("CLAUDE.md carries every agent prompt defence", () => {
  const claudeMd = readFileSync(join(root, "CLAUDE.md"), "utf8");

  it("still has the Agent operating rules section", () => {
    expect(claudeMd).toContain("## Agent operating rules");
  });

  for (const { id, pattern } of DEFENCES) {
    it(`states a ${id} defence`, () => {
      expect(
        pattern.test(claudeMd),
        `CLAUDE.md lost its "${id}" defence. Restore it in the "Agent operating rules" ` +
          `section rather than deleting this assertion — AgentShield will re-raise it either way.`,
      ).toBe(true);
    });
  }
});

describe("local agent config keeps its guard rails", () => {
  // .mcp.json and .claude/ are gitignored, so they are absent in CI and on a
  // fresh clone. Absent is not a failure; present-but-weakened is.
  function readOptionalJson(rel: string): Record<string, unknown> | null {
    try {
      return JSON.parse(readFileSync(join(root, rel), "utf8"));
    } catch {
      return null;
    }
  }

  it("never points the Supabase MCP server at the production project", () => {
    const mcp = readOptionalJson(".mcp.json");
    if (!mcp) return;
    // ifitgxscyuabessaoqui is production with real tenant data (CLAUDE.md,
    // Deployment). Local tooling belongs on the dev project.
    expect(JSON.stringify(mcp)).not.toContain("ifitgxscyuabessaoqui&");
    expect(JSON.stringify(mcp)).not.toContain("project_ref=ifitgxscyuabessaoqui");
  });

  it("pins every npx-launched MCP server to an exact version", () => {
    const mcp = readOptionalJson(".mcp.json");
    if (!mcp) return;
    const servers = (mcp.mcpServers ?? {}) as Record<string, { command?: string; args?: string[] }>;
    for (const [name, server] of Object.entries(servers)) {
      if (server.command !== "npx") continue;
      for (const arg of server.args ?? []) {
        expect(arg, `MCP server "${name}" must pin a version, not track a tag`).not.toMatch(
          /@(?:latest|next|canary)$/,
        );
        expect(arg, `MCP server "${name}" must not auto-install with -y`).not.toBe("-y");
      }
    }
  });

  it("keeps a non-empty deny list alongside the broad allow list", () => {
    const settings = readOptionalJson(".claude/settings.local.json");
    if (!settings) return;
    const permissions = (settings.permissions ?? {}) as { allow?: string[]; deny?: string[] };
    if (!permissions.allow?.length) return;
    expect(
      permissions.deny?.length ?? 0,
      "The allow list grants interpreter access (bun run, node -e). A deny list is what " +
        "keeps that from reaching .env, a force push, or a generated file.",
    ).toBeGreaterThan(0);
  });
});
