/**
 * Client-side evidence URL validation. Mirrors the server-side rules in
 * src/lib/rate-limit.functions.ts so failures surface immediately with a
 * user-friendly explanation rather than a generic server error.
 */
export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const EVIDENCE_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
export const EVIDENCE_ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export type EvidenceValidation = { ok: true } | { ok: false; reason: string };

export function validateEvidenceUrlClient(url: string | null | undefined): EvidenceValidation {
  if (!url) return { ok: true };
  const trimmed = url.trim();
  if (!trimmed) return { ok: true };
  if (trimmed.length > 1000) return { ok: false, reason: "Link is too long (max 1000 characters). Use a short-link service or upload the file." };
  let u: URL;
  try { u = new URL(trimmed); } catch { return { ok: false, reason: "That doesn't look like a valid URL. Include https:// at the start." }; }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, reason: "Only http(s) links are allowed. Paste a web link, not a file:// path." };
  const path = u.pathname.toLowerCase();
  const looksLikeFile = /\.[a-z0-9]{2,5}$/.test(path);
  if (looksLikeFile) {
    const ok = EVIDENCE_ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
    if (!ok) return { ok: false, reason: `That file type isn't allowed. Allowed: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}.` };
  }
  return { ok: true };
}

export function validateEvidenceFileClient(file: File): EvidenceValidation {
  if (file.size > EVIDENCE_MAX_BYTES) {
    return { ok: false, reason: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed is ${EVIDENCE_MAX_BYTES / 1024 / 1024} MB.` };
  }
  const name = file.name.toLowerCase();
  const extOk = EVIDENCE_ALLOWED_EXTENSIONS.some((e) => name.endsWith(e));
  const mimeOk = !file.type || EVIDENCE_ALLOWED_MIME.includes(file.type);
  if (!extOk || !mimeOk) {
    return { ok: false, reason: `File type not allowed. Use one of: ${EVIDENCE_ALLOWED_EXTENSIONS.join(", ")}.` };
  }
  return { ok: true };
}
