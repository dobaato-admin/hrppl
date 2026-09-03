#!/usr/bin/env node
/**
 * Generate the role × feature matrix in `docs/rbac.md` from `src/lib/rbac.ts`.
 *
 * Why generated rather than written
 * --------------------------------
 * `docs/rbac.md` was authored as a *proposal*, before the matrix existed in
 * code, and CLAUDE.md tells you to "update it alongside any change". Wave 5
 * added seventeen feature keys; none of them reached the document. A matrix
 * that is hand-maintained beside the code it describes is a matrix that is
 * wrong, and a wrong authorization document is worse than no document — it is
 * the thing someone checks instead of the code.
 *
 * So the matrix section is now generated. Everything else in the file (the
 * role definitions, the guiding principles, the destructive-action rules) is
 * still hand-written prose and is left untouched.
 *
 *   node scripts/gen-rbac-matrix.mjs          # rewrite the section
 *   node scripts/gen-rbac-matrix.mjs --check  # fail if it is stale (CI)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RBAC = join(ROOT, "src/lib/rbac.ts");
const DOC = join(ROOT, "docs/rbac.md");

const BEGIN = "<!-- BEGIN GENERATED MATRIX -->";
const END = "<!-- END GENERATED MATRIX -->";

const ROLES = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
];

/** Parse `"key": SET("a", "b"),` entries out of the MATRIX literal. */
function parseMatrix(src) {
  const start = src.indexOf("MATRIX");
  if (start < 0) throw new Error("MATRIX not found in rbac.ts");
  const body = src.slice(start);
  const out = [];
  const re = /^\s*"([a-zA-Z][a-zA-Z0-9.]*)":\s*SET\(([^)]*)\)/gm;
  let m;
  while ((m = re.exec(body))) {
    const roles = [...m[2].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]);
    out.push({ key: m[1], roles });
  }
  return out;
}

/** Group by the prefix before the first dot: platform, org, manager, … */
function group(entries) {
  const groups = new Map();
  for (const e of entries) {
    const g = e.key.includes(".") ? e.key.split(".")[0] : "other";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(e);
  }
  return groups;
}

function render(entries) {
  const groups = group(entries);
  const order = ["platform", "regional", "org", "manager", "settings", "practice", "compliance", "account", "me", "help"];
  const names = [...groups.keys()].sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });

  const lines = [];
  lines.push(BEGIN);
  lines.push("");
  lines.push(
    `> **Generated** by \`node scripts/gen-rbac-matrix.mjs\` from \`src/lib/rbac.ts\`.`,
  );
  lines.push(
    `> Do not edit between the markers — regenerate instead. ` +
      `${entries.length} feature keys across ${names.length} groups.`,
  );
  lines.push("");
  lines.push(
    "`can(feature, roles)` controls **UI only**. RLS policies plus server-fn role checks are the " +
      "actual enforcement; where a key mirrors a specific policy, the comment beside it in " +
      "`rbac.ts` names that policy.",
  );
  lines.push("");
  lines.push("Legend: **●** = admitted · blank = no access");
  lines.push("");

  const head = `| Feature key | ${ROLES.map((r) => `\`${r}\``).join(" | ")} |`;
  const sep = `|---|${ROLES.map(() => "---").join("|")}|`;

  for (const g of names) {
    lines.push(`### ${g}`);
    lines.push("");
    lines.push(head);
    lines.push(sep);
    for (const e of groups.get(g).sort((a, b) => a.key.localeCompare(b.key))) {
      const cells = ROLES.map((r) => (e.roles.includes(r) ? "●" : ""));
      lines.push(`| \`${e.key}\` | ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  // A quick read on how wide each role's surface is.
  lines.push("### Surface size per role");
  lines.push("");
  lines.push("| Role | Feature keys admitted |");
  lines.push("|---|---|");
  for (const r of ROLES) {
    const n = entries.filter((e) => e.roles.includes(r)).length;
    lines.push(`| \`${r}\` | ${n} of ${entries.length} |`);
  }
  lines.push("");
  lines.push(END);
  return lines.join("\n");
}

const entries = parseMatrix(readFileSync(RBAC, "utf8"));
if (!entries.length) {
  console.error("Parsed 0 feature keys — the MATRIX shape must have changed.");
  process.exit(1);
}
const generated = render(entries);

let doc = readFileSync(DOC, "utf8");
const b = doc.indexOf(BEGIN);
const e = doc.indexOf(END);

let next;
if (b >= 0 && e > b) {
  next = doc.slice(0, b) + generated + doc.slice(e + END.length);
} else {
  // First run: replace the hand-written "## 3. Feature matrix" section.
  const s3 = doc.indexOf("## 3. Feature matrix");
  const s4 = doc.indexOf("## 4.");
  if (s3 < 0 || s4 < 0) throw new Error("Cannot locate section 3 to replace");
  next =
    doc.slice(0, s3) + "## 3. Feature matrix\n\n" + generated + "\n\n" + doc.slice(s4);
}

if (process.argv.includes("--check")) {
  if (next !== doc) {
    console.error("docs/rbac.md is stale — run: node scripts/gen-rbac-matrix.mjs");
    process.exit(1);
  }
  console.log(`docs/rbac.md is current (${entries.length} feature keys).`);
} else {
  writeFileSync(DOC, next);
  console.log(`Wrote docs/rbac.md — ${entries.length} feature keys.`);
}
