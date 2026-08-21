// CSV helpers for question banks.
// Columns: question, choice_a..choice_h, correct, points, explanation, sort_order
// `correct` is a letter (A-H) or 1-based index.

export const QUIZ_CSV_HEADER = [
  "question", "choice_a", "choice_b", "choice_c", "choice_d",
  "choice_e", "choice_f", "choice_g", "choice_h",
  "correct", "points", "explanation", "sort_order",
];

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function questionsToCsv(questions: any[]): string {
  const lines = [QUIZ_CSV_HEADER.join(",")];
  for (const q of questions) {
    const choices: string[] = Array.isArray(q.choices) ? q.choices : [];
    const cells: (string | number)[] = [q.question ?? ""];
    for (let i = 0; i < 8; i++) cells.push(choices[i] ?? "");
    cells.push(String.fromCharCode(65 + (q.correct_index ?? 0)));
    cells.push(q.points ?? 1);
    cells.push(q.explanation ?? "");
    cells.push(q.sort_order ?? 0);
    lines.push(cells.map(esc).join(","));
  }
  return lines.join("\n");
}

// Minimal RFC4180-ish CSV parser (handles quoted fields, escaped quotes, CRLF).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else cur += c;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

export type ParsedQuestion = {
  question: string;
  choices: string[];
  correct_index: number;
  points: number;
  explanation?: string | null;
  sort_order?: number;
};

export function csvToQuestions(text: string): { questions: ParsedQuestion[]; errors: string[] } {
  const rows = parseCsv(text);
  const errors: string[] = [];
  if (!rows.length) return { questions: [], errors: ["Empty file"] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const qIdx = idx("question");
  if (qIdx < 0) return { questions: [], errors: ["Missing 'question' column"] };

  const choiceIdx: number[] = [];
  for (const letter of "abcdefgh") {
    const i = idx(`choice_${letter}`);
    if (i >= 0) choiceIdx.push(i);
  }
  if (choiceIdx.length < 2) return { questions: [], errors: ["Need at least choice_a and choice_b columns"] };

  const correctI = idx("correct");
  const pointsI = idx("points");
  const explI = idx("explanation");
  const sortI = idx("sort_order");

  const questions: ParsedQuestion[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.some((c) => c && c.trim() !== "")) continue;
    const question = (row[qIdx] ?? "").trim();
    if (!question) { errors.push(`Row ${r + 1}: empty question`); continue; }
    const choices = choiceIdx.map((i) => (row[i] ?? "").trim()).filter(Boolean);
    if (choices.length < 2) { errors.push(`Row ${r + 1}: need at least 2 choices`); continue; }

    const rawCorrect = correctI >= 0 ? (row[correctI] ?? "").trim() : "A";
    let ci = -1;
    if (/^[A-Ha-h]$/.test(rawCorrect)) ci = rawCorrect.toUpperCase().charCodeAt(0) - 65;
    else if (/^\d+$/.test(rawCorrect)) ci = parseInt(rawCorrect, 10) - 1;
    if (ci < 0 || ci >= choices.length) { errors.push(`Row ${r + 1}: invalid 'correct' value "${rawCorrect}"`); continue; }

    const points = pointsI >= 0 && row[pointsI] ? Number(row[pointsI]) : 1;
    if (!Number.isFinite(points) || points <= 0) { errors.push(`Row ${r + 1}: invalid points`); continue; }

    const explanation = explI >= 0 ? (row[explI] ?? "").trim() || null : null;
    const sort_order = sortI >= 0 && row[sortI] ? Number(row[sortI]) : undefined;

    questions.push({ question, choices, correct_index: ci, points, explanation, sort_order });
  }
  return { questions, errors };
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
