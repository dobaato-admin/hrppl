/**
 * Postgres and PostgREST errors must not reach a user verbatim.
 *
 * A constraint message names tables, columns, constraints and policies — it is
 * information disclosure on a public server-fn endpoint (the same class of
 * finding `hook-response.server.ts` exists for), and it is unreadable besides:
 * T20 was reported as the user being shown
 *
 *   null value in column "id" of relation
 *   "onboarding_checklist_template_items" violates not-null constraint
 *
 * in a toast. `plainDbMessage` keeps the original for the server log and hands
 * the caller a sentence they can act on.
 */

/** The shape supabase-js returns on a failed query. */
export interface DbErrorLike {
  message?: string | null;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
}

/**
 * True when a value looks like it came out of PostgREST rather than out of our
 * own `throw new Error("…")`. Our own refusals are already written for a
 * person, so they must pass through untouched.
 */
export function isDbError(e: unknown): e is DbErrorLike {
  if (!e || typeof e !== "object") return false;
  const err = e as DbErrorLike;
  if (typeof err.code === "string" && /^[0-9A-Z]{5}$|^PGRST/.test(err.code)) return true;
  // Some paths lose `code` but keep a recognisably Postgres message.
  return typeof err.message === "string" && /violates|relation "|column "/.test(err.message);
}

const BY_CODE: Record<string, string> = {
  "23502": "Something required was missing from the record we tried to save. Nothing was saved.",
  "23503": "That refers to something that no longer exists. Reload the page and try again.",
  "23505": "That already exists. Give it a different name or value.",
  "23514": "One of the values is outside the range this field allows.",
  "22001": "One of the values is too long for the field it was entered in.",
  "42501": "You do not have permission to do that.",
  "42P01": "Part of this feature is not available. Nothing was saved.",
  PGRST116: "We could not find that record — it may have been deleted.",
  PGRST200: "Part of this page could not be loaded. Nothing was saved.",
  PGRST301: "Your session has expired. Sign in again.",
};

/**
 * A plain-language message for a database failure.
 *
 * `fallback` is what the caller wants said when the code is not one we
 * recognise — phrase it for the action in progress ("Could not save the
 * template."), never for the query.
 */
export function plainDbMessage(e: unknown, fallback: string): string {
  if (!isDbError(e)) {
    const msg = (e as { message?: string } | null)?.message;
    return typeof msg === "string" && msg.trim() ? msg : fallback;
  }
  const code = typeof e.code === "string" ? e.code : "";
  return BY_CODE[code] ?? fallback;
}

/**
 * Log the real error server-side and throw the plain one.
 *
 * Always call this rather than `throw error` on a write whose message could
 * reach a toast.
 */
export function throwPlain(e: unknown, fallback: string, where: string): never {
  console.error(`[db] ${where}`, e);
  throw new Error(plainDbMessage(e, fallback));
}
