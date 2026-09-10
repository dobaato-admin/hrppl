import { useMemo, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Departments as a list you build, not a paragraph you type.
 *
 * The step used to be a `<Textarea>` split on newlines. That put the whole
 * burden on the person: no idea what a sensible department is, no confirmation
 * that a line counted as one, a stray blank line silently becoming nothing, and
 * "Engineering" typed twice becoming two departments with the same name — which
 * is very hard to unpick afterwards, because employees get attached to them.
 *
 * Now: each department is a removable item, common ones are offered, and typing
 * something that is not on the list offers to create it. Duplicates are refused
 * case-insensitively, since "People" and "people" are not two teams.
 */

/**
 * Offered as suggestions, not imposed. Deliberately broad rather than
 * industry-specific — a starter list should be recognisable to a builder and to
 * a software company alike, and anything missing is one keystroke away.
 */
const COMMON = [
  "Operations",
  "Engineering",
  "People",
  "Finance",
  "Sales",
  "Marketing",
  "Customer Support",
  "Product",
  "Design",
  "Legal",
  "IT",
  "Administration",
  "Logistics",
  "Procurement",
  "Health & Safety",
  "Research & Development",
];

export function DepartmentPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const clean = useMemo(() => value.map((v) => v.trim()).filter(Boolean), [value]);
  const taken = useMemo(() => new Set(clean.map((v) => v.toLowerCase())), [clean]);

  const query = draft.trim();
  const suggestions = useMemo(() => {
    const pool = COMMON.filter((c) => !taken.has(c.toLowerCase()));
    if (!query) return pool.slice(0, 8);
    return pool.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [query, taken]);

  /** Typed something that is not already added and not an exact suggestion. */
  const canCreate =
    query.length > 0 &&
    !taken.has(query.toLowerCase()) &&
    !suggestions.some((s) => s.toLowerCase() === query.toLowerCase());

  const isDuplicate = query.length > 0 && taken.has(query.toLowerCase());

  function add(name: string) {
    const trimmed = name.trim();
    if (!trimmed || taken.has(trimmed.toLowerCase())) return;
    onChange([...clean, trimmed]);
    setDraft("");
    inputRef.current?.focus();
  }

  function remove(name: string) {
    onChange(clean.filter((v) => v !== name));
  }

  return (
    <div className="space-y-3">
      {/* ------------------------------------------------ current list -- */}
      {clean.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Departments you have added">
          {clean.map((name) => (
            <li key={name}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1.5 text-sm font-medium text-primary">
                {name}
                <button
                  type="button"
                  onClick={() => remove(name)}
                  aria-label={`Remove ${name}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No departments yet. Add the teams you already have — you can change them later.
        </p>
      )}

      {/* --------------------------------------------------- the input -- */}
      <div className="space-y-1.5">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && draft === "" && clean.length > 0) {
              // Removes the last one, the way every tag input does.
              remove(clean[clean.length - 1]);
            }
          }}
          placeholder="Type a department and press Enter"
          aria-label="Add a department"
          aria-invalid={isDuplicate || undefined}
        />
        {isDuplicate && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {query} is already on the list
          </p>
        )}
      </div>

      {/* --------------------------------------------------- offerings -- */}
      {(suggestions.length > 0 || canCreate) && (
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => add(query)}
              className="h-8"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Create &ldquo;{query}&rdquo;
            </Button>
          )}
          {suggestions.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => add(s)}
              className={cn("h-8 font-normal")}
            >
              <Plus className="mr-1 h-3.5 w-3.5 opacity-60" />
              {s}
            </Button>
          ))}
        </div>
      )}

      {clean.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-primary" />
          {clean.length} department{clean.length === 1 ? "" : "s"} will be created.
        </p>
      )}
    </div>
  );
}
