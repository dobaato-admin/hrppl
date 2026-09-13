# Design system — the rules that exist because something broke

Not a component catalogue. Each rule below is here because it shipped wrong
once, in a way that was invisible in review and often invisible in the browser
until a specific piece of data hit it. `src/components/monday.tsx` holds the
product's own primitives (`PageHeader`, `SectionCard`, `KpiTile`, `StatusChip`,
`EmptyState`, `SkeletonRows`); `src/components/ui/*` holds the shadcn/Radix
layer.

---

## 1. `SelectItem`: use `description`, never a second line of children

**Radix clones the contents of `ItemText` into the trigger.** That is how the
closed control knows what to display. So every child you pass to `SelectItem`
is rendered twice — once in the open list, where a two-line block is fine, and
once inside a 36px-high trigger, where it is not.

This shipped on `/org/roles`. The role picker passed a `flex flex-col` with a
label and a description, and the closed trigger rendered both lines, centred,
overflowing its own border.

```tsx
// Wrong — both lines end up in the trigger
<SelectItem value="hr">
  <div className="flex flex-col">
    <span>HR</span>
    <span className="text-xs">Manages people, leave, training</span>
  </div>
</SelectItem>

// Right — description renders in the list only
<SelectItem value="hr" description="Manages people, leave, training">
  HR
</SelectItem>
```

The same applies to a trailing inline hint (`{name}<span>{code}</span>`), which
produced "New South Wales NSW" in the trigger. That is `description` too.

Pinned by `tests/select-item-contract.test.ts`.

## 2. `truncate` does nothing until every ancestor can shrink

The rule most worth internalising, because the symptom appears on a child and
the cause is usually two levels up.

Both flex items and grid tracks default to `min-width: auto`, which means
**refuse to shrink below my content**. So `truncate` on a span is inert if any
ancestor between it and the fixed-width container is still free to grow — the
text pushes the whole chain wider instead of being clipped.

Three parts, all required:

- the truncating element: `min-w-0 truncate`
- anything that must stay visible beside it (chevron, icon, count): `shrink-0`
- **every ancestor that could grow**: `min-w-0` on a flex child,
  `grid-cols-[minmax(0,1fr)]` on a grid container

That last one was the actual cause here, and fixing only the first two was not
enough. Measured in the browser on `/org/roles`: with `min-w-0` and `truncate`
correctly applied to the select's value span, a long value still grew the
trigger from **462px to 631px** and pushed its own chevron **169px** to the
right, because `DialogContent` was a bare `grid` — so the track sized to
content and overflowed its own `max-w-lg`. After capping the track, the same
test holds the dialog at 512px, the trigger at 462px, the chevron still, and
the text finally clips.

`SelectTrigger` and `DialogContent` both carry this now. Anywhere you put text
in a flex row or a grid cell, do the same — and verify by putting an absurd
value in and measuring, not by reading the classes.

**The trade-off, checked rather than assumed:** content genuinely wider than
the dialog — a table, a long code block — no longer stretches the dialog. It
does not get clipped either; the dialog becomes horizontally scrollable and
the content stays reachable. Measured with a 300-character unbroken string:
dialog held at 512px, the child stayed inside the box, `scrollWidth >
clientWidth`. Wide content is still better off in its own
`overflow-x-auto` container so the scroll is local to it rather than to the
whole dialog.

## 3. Validation state appears after a submit attempt, not on mount

A field outlined in red the moment a dialog opens says "you have made a
mistake" before a mistake is possible. `aria-invalid={!value}` is the usual way
this happens.

Gate it on a `…Attempted` flag set by the submit handler, and reset it when the
form opens. `src/hooks/use-form-errors.tsx` already does this — `check()` only
populates errors when called, and `formatError()` deliberately returns null for
an empty value because required-ness is a separate question.

## 4. Colour is not a message

A red border tells you nothing if you cannot see it, and not much if you can.
Every invalid field needs text saying what is wrong and what to do, tied to the
control with `aria-describedby`, and marked `role="alert"` so it is announced.

Say what to do, not what is missing: "Choose a branch — it decides what this
person can see" beats "Branch is required".

## 5. The required marker is decoration; the word is the label

`<span className="text-destructive">*</span>` is invisible to a screen reader
in any useful sense. Mark it `aria-hidden="true"` and add
`<span className="sr-only">(required)</span>`.

## 6. Helper text must not contradict the control

The branch field was marked required with a `*` and captioned "Without a branch
this role would cover the whole organisation" — which says the opposite, that
you may leave it blank. One of the two is always wrong; decide which, and if
the field is genuinely optional in some state, change the marker in that state
rather than leaving both on screen.

## 7. Dialog titles hold user data, so they wrap

A title built from a person's name or email will meet a long one. Give it
`pr-6` so it clears the close button and `break-words` so an email address —
which has no spaces to wrap at — breaks instead of overflowing.

## 8. Focus the field that needs answering

When a submit is refused, move focus to the first control at fault.
`useFormErrors().check()` does this via `focusFirst`; a hand-rolled refusal
should call `document.getElementById(...)?.focus()` or equivalent. Otherwise
the person has to find the red control themselves, which on a long form means
scrolling for it.

## 9. Empty and failed must not look the same

Stated fully in CLAUDE.md, repeated here because it is as much a UI rule as a
data one: a list that failed to load and a list that is genuinely empty need
different words. "No results" over a failed request is a lie the user cannot
detect.
