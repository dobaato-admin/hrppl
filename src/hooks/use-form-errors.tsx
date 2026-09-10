import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Required-field validation that a person can actually act on.
 *
 * ---------------------------------------------------------------------------
 * What was wrong
 * ---------------------------------------------------------------------------
 *
 * Forms here validated by throwing the whole payload at the server and showing
 * whatever came back. When the setup guide's company form submitted with empty
 * fields, the toast rendered a raw Zod array:
 *
 *   [ { "code": "invalid_type", "expected": "string", "received": "null",
 *       "path": [ "trading_name" ], "message": "Expected string, received null" }, … ]
 *
 * Nothing was highlighted, focus did not move, and the reader had to map
 * `path: ["trading_name"]` onto a field by eye. Meanwhile no input in the
 * product styled `aria-invalid` at all, so a form *could not* show red even if
 * it wanted to.
 *
 * ---------------------------------------------------------------------------
 * What this does
 * ---------------------------------------------------------------------------
 *
 * `check()` validates before anything is sent, and on failure does the three
 * things a person needs at once: marks every offending field, moves the cursor
 * into the first one, and says in the toast which field and why. Marking is via
 * `aria-invalid`, so the red border and the screen-reader announcement come
 * from the same source and cannot disagree.
 *
 * `fromServer()` exists for the case validation cannot prevent — a rule only
 * the server knows, like an ABN checksum. It maps a Zod issue array back onto
 * the fields it names, so a server refusal lands on the input rather than in a
 * JSON blob.
 */

export type FieldSpec = {
  /** Must match the name passed to `register()`. */
  name: string;
  value: unknown;
  /** Shown in the message, so write it as the label reads: "Postcode". */
  label: string;
  /** Optional: return a message to fail, or null to pass. Runs only when non-empty. */
  rule?: (value: string) => string | null;
  /** Set false for a field that may be blank but must still satisfy `rule`. */
  required?: boolean;
};

export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  /** Props for the control. Spread onto Input / Textarea / SelectTrigger. */
  const register = useCallback(
    (name: string) => ({
      ref: (el: HTMLElement | null) => {
        refs.current[name] = el;
      },
      "aria-invalid": errors[name] ? (true as const) : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    }),
    [errors],
  );

  /** Clear one field's error — call as the user edits it. */
  const clearField = useCallback((name: string) => {
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  }, []);

  const focusFirst = useCallback((names: string[]) => {
    const el = refs.current[names[0]];
    // scrollIntoView first: focusing a field below the fold scrolls it to the
    // very edge, which reads as the page jumping rather than as an answer.
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    el?.focus?.({ preventScroll: true } as FocusOptions);
  }, []);

  /**
   * Validate in the order given. Returns true when everything passes.
   *
   * The order matters: it is the order the fields appear, so "the first
   * problem" is the topmost one rather than whichever the object happened to
   * enumerate first.
   */
  const check = useCallback(
    (fields: FieldSpec[]): boolean => {
      const next: Record<string, string> = {};
      for (const f of fields) {
        const raw = f.value == null ? "" : String(f.value).trim();
        const required = f.required !== false;
        if (required && raw === "") {
          next[f.name] = `${f.label} is required`;
          continue;
        }
        if (raw !== "" && f.rule) {
          const message = f.rule(raw);
          if (message) next[f.name] = message;
        }
      }
      setErrors(next);

      const failed = fields.filter((f) => next[f.name]).map((f) => f.name);
      if (failed.length === 0) return true;

      focusFirst(failed);
      const first = next[failed[0]];
      toast.error(
        failed.length === 1
          ? first
          : `${first} (and ${failed.length - 1} other field${failed.length > 2 ? "s" : ""})`,
      );
      return false;
    },
    [focusFirst],
  );

  /**
   * Map a server-side Zod refusal back onto the fields it names.
   *
   * Returns true if it recognised the shape and displayed it, so the caller can
   * fall back to a plain toast otherwise. Accepts the message string, an issue
   * array, or an Error carrying either.
   */
  const fromServer = useCallback(
    (error: unknown, labels: Record<string, string> = {}): boolean => {
      const raw =
        typeof error === "string"
          ? error
          : ((error as { message?: string } | null)?.message ?? "");
      let issues: Array<{ path?: unknown[]; message?: string }> | null = null;
      if (Array.isArray(error)) issues = error as never;
      else if (raw.trim().startsWith("[")) {
        try {
          issues = JSON.parse(raw);
        } catch {
          issues = null;
        }
      }
      if (!issues || issues.length === 0) return false;

      const next: Record<string, string> = {};
      for (const i of issues) {
        const name = String(i?.path?.[0] ?? "");
        if (!name) continue;
        const label = labels[name] ?? name.replace(/_/g, " ");
        // The server's own wording ("Expected string, received null") describes
        // a type system, not a form. Say what the person has to do instead.
        next[name] = /required|expected|invalid_type/i.test(i.message ?? "")
          ? `${label} is required`
          : (i.message ?? `${label} is invalid`);
      }
      if (Object.keys(next).length === 0) return false;

      setErrors(next);
      const names = Object.keys(next);
      focusFirst(names);
      toast.error(
        names.length === 1
          ? next[names[0]]
          : `${next[names[0]]} (and ${names.length - 1} other field${names.length > 2 ? "s" : ""})`,
      );
      return true;
    },
    [focusFirst],
  );

  const reset = useCallback(() => setErrors({}), []);

  return { errors, register, check, clearField, fromServer, reset };
}

/** The message under a field. Renders nothing when the field is valid. */
export function FieldError({
  name,
  errors,
}: {
  name: string;
  errors: Record<string, string>;
}) {
  const message = errors[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
