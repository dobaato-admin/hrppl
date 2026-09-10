import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * What is already configured, at each step of a setup wizard.
 *
 * ---------------------------------------------------------------------------
 * Why a count is not enough
 * ---------------------------------------------------------------------------
 *
 * The steps reported "9 pay items configured" and stopped there. An admin
 * returning to that screen cannot tell whether the one they meant to add is
 * among the nine, whether a duplicate crept in, or whether the thing they
 * configured last week survived — so the safe move is to add it again, and now
 * there are ten.
 *
 * The data was already in hand in most cases; only the rendering was missing.
 *
 * Collapses past a threshold rather than paginating: the common case is a
 * handful of rows where scrolling is worse than reading, and the uncommon case
 * is thirty where the count plus a toggle is the right summary.
 */
export function ExistingList<T>({
  title,
  items,
  renderItem,
  keyOf,
  emptyTitle,
  emptyHint,
  collapseAfter = 6,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyOf: (item: T, index: number) => string;
  /** Shown instead of the list when there is nothing yet. */
  emptyTitle: string;
  /** What to do about it — the reason this step exists. */
  emptyHint: string;
  collapseAfter?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-0.5 text-xs opacity-90">{emptyHint}</p>
      </div>
    );
  }

  const overflow = items.length > collapseAfter;
  const shown = overflow && !expanded ? items.slice(0, collapseAfter) : items;

  return (
    <div className="rounded-md border bg-muted/30">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Check className="h-4 w-4 text-primary" />
          {title}
          <span className="font-normal text-muted-foreground">({items.length})</span>
        </p>
        {overflow && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Show fewer
              </>
            ) : (
              <>
                <ChevronRight className="h-3.5 w-3.5" /> Show all {items.length}
              </>
            )}
          </button>
        )}
      </div>
      <ul className="divide-y">
        {shown.map((item, i) => (
          <li
            key={keyOf(item, i)}
            className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2 text-sm")}
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
      {overflow && !expanded && (
        <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
          {items.length - collapseAfter} more not shown.
        </p>
      )}
    </div>
  );
}

/** A read-only "currently saved" summary, for steps that edit one record. */
export function CurrentSettings({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="rounded-md border bg-muted/30">
      <p className="flex items-center gap-1.5 border-b px-3 py-2 text-sm font-medium">
        <Check className="h-4 w-4 text-primary" />
        {title}
      </p>
      <dl className="grid gap-x-6 gap-y-1.5 px-3 py-2 text-sm sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
