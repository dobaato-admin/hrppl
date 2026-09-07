import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * X-07 and the defect underneath it.
 *
 * ---------------------------------------------------------------------------
 * 1. The learner's read path
 * ---------------------------------------------------------------------------
 *
 * `training_quiz_questions_public` is a SECURITY DEFINER view **on purpose**.
 * `20260609033335` dropped the learner's SELECT policy on the base table so
 * nobody sitting a quiz could read `correct_index`, and made this view their
 * only read path, enforcing tenant and enrollment scope in its own WHERE.
 *
 * `20260613143222` — "Fix Security Definer view" — then set
 * `security_invoker = on` to clear a Supabase linter warning that had already
 * been triaged and accepted in `security_findings_log`. Under `invoker` the
 * view has no privileges of its own: the caller's RLS on the base table
 * decides, and the caller is an employee with no policy there.
 *
 * Result, verified against the live database with a real JWT: an enrolled
 * employee read **0 rows**. `listQuestions` returned `{ questions: [] }`, the
 * quiz dialog said "No quiz questions have been set for this course yet", and
 * since `/me/training` only completes a course via the quiz, **no employee
 * could finish any course.** It read as "not configured", not as an error, and
 * no demo tenant had a quiz question to contradict it.
 *
 * The whole failure was one word in one ALTER. This test is the thing that
 * makes the next linter sweep argue with a test instead of with production.
 *
 * ---------------------------------------------------------------------------
 * 2. Gate drift — the last of Wave 5's four axes
 * ---------------------------------------------------------------------------
 *
 * `/org/training` admits hr and branch_admin. Not one write in
 * `training.functions.ts` carried a role check; they all leaned on RLS, which
 * admitted a different set. `20260906090000` widened the policies for hr and
 * kept branch_admin read-only; `training-guard.ts` mirrors that on the server
 * so the refusal is legible instead of a Postgres policy error.
 */

const ROOT = process.cwd();
const MIGRATIONS = join(ROOT, "supabase/migrations");
const LIB = join(ROOT, "src/lib");

const migrationFiles = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort();

/** SQL with `--` line comments removed. */
function stripSqlComments(sql: string): string {
  return sql.replace(/--.*$/gm, "");
}

/** TypeScript with `//` and block comments removed. */
function stripTsComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("the quiz view stays readable by learners", () => {
  /**
   * The last migration to say anything about this view's `security_invoker`
   * wins, so that is the one to assert on — not whether the string appears
   * somewhere in history.
   */
  function lastInvokerSetting(): { file: string; value: string } | null {
    let latest: { file: string; value: string } | null = null;
    for (const file of migrationFiles) {
      // Comments stripped first: this very file's header explains the bug by
      // quoting the broken setting, and a check that reads prose as code is a
      // check that reports the opposite of the truth.
      const sql = stripSqlComments(readFileSync(join(MIGRATIONS, file), "utf8"));
      if (!sql.includes("training_quiz_questions_public")) continue;
      // Anchored on the DDL forms — `WITH (...)` on a CREATE VIEW and
      // `SET (...)` on an ALTER VIEW — so a mention inside a string literal
      // (this migration's own remediation note names the broken setting)
      // cannot be mistaken for the setting itself.
      const matches = [
        ...sql.matchAll(/(?:WITH|SET)\s*\(\s*security_invoker\s*=\s*(on|off)\s*\)/gi),
      ];
      if (matches.length) latest = { file, value: matches[matches.length - 1][1].toLowerCase() };
    }
    return latest;
  }

  it("is defined somewhere in the migrations", () => {
    expect(lastInvokerSetting()).not.toBeNull();
  });

  it("is SECURITY DEFINER — security_invoker is off", () => {
    const latest = lastInvokerSetting()!;
    expect(
      latest.value,
      `${latest.file} leaves training_quiz_questions_public at ` +
        `security_invoker = ${latest.value}. With 'on', the caller's RLS on ` +
        "training_quiz_questions decides — and learners are denied there by " +
        "design so they cannot read correct_index. Every quiz then returns " +
        "zero questions for every employee, silently, and no course can be " +
        "completed. If a linter is asking for this change, the answer is the " +
        "accepted_risk row in security_findings_log, not the ALTER.",
    ).toBe("off");
  });

  it("still hides the answer key from the view", () => {
    const sql = readFileSync(
      join(MIGRATIONS, "20260906090000_training_x07_learner_access.sql"),
      "utf8",
    );
    const body = sql.slice(sql.indexOf("CREATE VIEW public.training_quiz_questions_public"));
    const select = body.slice(0, body.indexOf("FROM public.training_quiz_questions"));
    expect(select).not.toMatch(/correct_index/);
    expect(select).not.toMatch(/explanation/);
  });

  it("keeps the enrolled-learner branch that makes the view worth having", () => {
    const sql = readFileSync(
      join(MIGRATIONS, "20260906090000_training_x07_learner_access.sql"),
      "utf8",
    );
    expect(sql).toMatch(/FROM public\.training_enrollments en/);
    expect(sql).toMatch(/e\.user_id = auth\.uid\(\)/);
  });
});

describe("training writes are guarded on the server, not only by RLS", () => {
  type Fn = { name: string; module: string; body: string };

  function serverFns(file: string): Fn[] {
    const src = readFileSync(join(LIB, file), "utf8");
    const starts = [...src.matchAll(/^export const (\w+) = createServerFn/gm)];
    return starts.map((m, i) => ({
      name: m[1],
      module: file,
      body: src.slice(m.index!, i + 1 < starts.length ? starts[i + 1].index! : src.length),
    }));
  }

  const FNS = [
    ...serverFns("training.functions.ts"),
    ...serverFns("training-lessons.functions.ts"),
  ];

  /**
   * Reads are governed by RLS alone on purpose: the policies narrow rather
   * than refuse, so a role that may see less simply sees less. Adding a guard
   * to a read would turn "an empty list" into "Forbidden" for people entitled
   * to the empty list.
   */
  const READ_ONLY = new Set([
    "listCourses",
    "listEnrollments",
    "listCertifications",
    "listQuestions",
    "listAttempts",
    "listLessons",
    "getCoursePlayer",
    "listCourseProgress",
    "getLessonMediaUrl",
  ]);

  /** Writes a learner performs on their own record; ownership is the check. */
  const LEARNER_OWNED = new Set(["submitQuizAttempt", "markLessonProgress"]);

  it("finds the training server functions", () => {
    expect(FNS.length).toBeGreaterThan(20);
  });

  it("every writing function asserts the caller may author training", () => {
    const unguarded = FNS.filter(
      (f) =>
        !READ_ONLY.has(f.name) &&
        !LEARNER_OWNED.has(f.name) &&
        !f.body.includes("assertTrainingAuthor("),
    ).map((f) => `${f.module} → ${f.name}`);
    expect(
      unguarded,
      "These write to training tables with no server-side role check, so the " +
        "only thing standing between the caller and the row is RLS — which " +
        "admits a different set from the nav and answers with a Postgres " +
        "policy error rather than a message a person can act on. Add " +
        "assertTrainingAuthor, or list the function above with its reason.",
    ).toEqual([]);
  });

  it("the two learner-owned writes check ownership instead", () => {
    for (const name of LEARNER_OWNED) {
      const fn = FNS.find((f) => f.name === name)!;
      expect(fn, `${name} not found`).toBeDefined();
      expect(fn.body, `${name} must resolve the caller's own employee row`).toMatch(
        /getCallerEmployee\(|getEmployee\(/,
      );
    }
  });

  it("a learner cannot declare their own course complete", () => {
    const src = readFileSync(join(LIB, "training.functions.ts"), "utf8");
    const fn = src.slice(src.indexOf("export const updateEnrollment"));
    expect(fn).toContain("isOwner");
    // The owner branch admits only the two in-progress states.
    expect(fn).toMatch(/\["assigned", "in_progress"\]/);
  });

  it("the guard runs on the caller's client, never the service role", () => {
    const src = readFileSync(join(LIB, "training-guard.ts"), "utf8");
    expect(src).not.toMatch(/supabaseAdmin|client\.server/);
  });
});

describe("the training feature keys say what the policies say", () => {
  const rbac = readFileSync(join(LIB, "rbac.ts"), "utf8");

  function allowSet(key: string): string[] {
    const m = rbac.match(new RegExp(`"${key}":\\s*SET\\(([^)]*)\\)`));
    if (!m) return [];
    return [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]);
  }

  it("branch_admin may read the roster", () => {
    expect(allowSet("org.training")).toContain("branch_admin");
  });

  it("branch_admin may NOT write it", () => {
    expect(
      allowSet("org.trainingManage"),
      "Every branch_admin policy in this domain is a FOR SELECT. Putting " +
        "branch_admin in the write key gives them an Assign button that " +
        "Postgres refuses — which is exactly X-07.",
    ).not.toContain("branch_admin");
  });

  it("hr may write it, matching the policies added in 20260906090000", () => {
    expect(allowSet("org.trainingManage")).toContain("hr");
    const sql = readFileSync(
      join(MIGRATIONS, "20260906090000_training_x07_learner_access.sql"),
      "utf8",
    );
    expect(sql).toMatch(/hr manages tenant training_quiz_questions/);
    expect(sql).toMatch(/hr manages tenant certifications/);
  });

  it("the org roster derives its write controls from the write key", () => {
    const page = readFileSync(join(ROOT, "src/routes/org.training.tsx"), "utf8");
    expect(page).toContain('can("org.trainingManage", roles)');
    // The three writes on that page are all behind it.
    expect(page).toMatch(/canManage &&[\s\S]{0,400}Manage catalog/);
    expect(page).toMatch(/canManage \? \(\s*<Select/);
    expect(page).toMatch(/canManage && \(\s*<Button[\s\S]{0,200}remove\(en\.id\)/);
  });
});

describe("training dates belong to the tenant, not to UTC", () => {
  it("neither training module derives 'today' from toISOString", () => {
    for (const file of ["training.functions.ts", "training-lessons.functions.ts"]) {
      const src = stripTsComments(readFileSync(join(LIB, file), "utf8"));
      expect(
        src,
        `${file} builds a calendar date with new Date().toISOString().slice(0, 10), ` +
          "which is today in UTC. Overdue reminders then fire early or late by " +
          "the tenant's offset. Use tenantToday / work-date.ts.",
      ).not.toMatch(/new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/);
    }
  });

  it("the overdue sweep and the expiry horizon both use the tenant clock", () => {
    const src = readFileSync(join(LIB, "training.functions.ts"), "utf8");
    expect(src).toContain("workDateInZone");
    expect(src.match(/await tenantToday\(/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});
