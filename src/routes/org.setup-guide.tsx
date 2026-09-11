import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CircleDashed,
  ExternalLink,
  Info,
  Lock,
  Rocket,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { SectionCard, SkeletonRows, StatusChip, EmptyState } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMyTenantCountry } from "@/hooks/use-tenant";
import { validateBusinessRegistrationNumber } from "@/lib/payroll-validation";
import { useFormErrors, FieldError, type FieldSpec } from "@/hooks/use-form-errors";
import {
  SEGMENT_KEYS,
  type SegmentKey,
  getSetupGuide,
  setSetupSegmentSkipped,
  setSetupLastSegment,
  finalizeSetup,
  reopenSetup,
  updateCompanyProfile,
} from "@/lib/setup-guide.functions";

export const Route = createFileRoute("/org/setup-guide")({
  head: () => ({ meta: [{ title: "Setup guide — hrppl" }] }),
  /**
   * `?segment=payroll` opens the guide on that segment.
   *
   * T19 · "Skip & finish" on the setup wizard's invite step sends an admin
   * whose payroll setup is unfinished straight here, rather than dropping them
   * on the dashboard with nothing to act on. An unrecognised value is ignored
   * rather than refused — a stale link should open the guide, not an error.
   */
  validateSearch: (search: Record<string, unknown>): { segment?: SegmentKey } => {
    const seg = search.segment;
    return typeof seg === "string" && (SEGMENT_KEYS as readonly string[]).includes(seg)
      ? { segment: seg as SegmentKey }
      : {};
  },
  component: () => (
    <AdminGate feature="org.setupGuide">
      <SetupGuidePage />
    </AdminGate>
  ),
});

function SetupGuidePage() {
  const qc = useQueryClient();
  const guideFn = useServerFn(getSetupGuide);
  const skipFn = useServerFn(setSetupSegmentSkipped);
  const lastFn = useServerFn(setSetupLastSegment);
  const finalizeFn = useServerFn(finalizeSetup);
  const reopenFn = useServerFn(reopenSetup);
  const companyFn = useServerFn(updateCompanyProfile);

  const { segment: requestedSegment } = Route.useSearch();
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [company, setCompany] = useState({
    legal_name: "",
    trading_name: "",
    address_line1: "",
    city: "",
    region: "",
    postal_code: "",
    registration_number: "",
  });
  const [companyLoaded, setCompanyLoaded] = useState(false);
  // Field-level validation for the Segment 1 form. Lives in the page rather
  // than the child so a server refusal (an ABN the ATO checksum rejects) can be
  // mapped back onto the same fields the client-side check uses.
  const form = useFormErrors();

  const { data, isLoading, error } = useQuery({
    queryKey: ["setup-guide"],
    queryFn: () => guideFn(),
    retry: false,
  });

  const segments = data?.segments ?? [];
  const activated = !!data?.state?.activated_at;

  // Resume: drop the admin back where they were, or at the first thing that is
  // actually outstanding. Doing nothing here would open on Segment 1 every
  // time, which is the behaviour a checklist is supposed to remove.
  useEffect(() => {
    if (active || segments.length === 0) return;
    // An explicit ?segment= wins over what was remembered: somebody following
    // a link that names a segment is asking for that segment.
    if (requestedSegment && segments.some((s: any) => s.key === requestedSegment)) {
      setActive(requestedSegment);
      return;
    }
    const remembered = data?.state?.last_segment as string | undefined;
    if (remembered && segments.some((s: any) => s.key === remembered)) {
      setActive(remembered);
      return;
    }
    const next = segments.find((s: any) => !s.done && !s.skipped) ?? segments[0];
    setActive(next.key);
  }, [segments, data, active, requestedSegment]);

  const current = useMemo(
    () => segments.find((s: any) => s.key === active) ?? null,
    [segments, active],
  );

  async function select(key: string) {
    setActive(key);
    // Fire and forget: remembering the tab is a convenience, and a failed save
    // here must not interrupt the person's actual work.
    lastFn({ data: { segment: key as never } }).catch(() => {});
  }

  async function toggleSkip(key: string, skipped: boolean) {
    try {
      await skipFn({ data: { segment: key as never, skipped } });
      await qc.invalidateQueries({ queryKey: ["setup-guide"] });
      toast.success(skipped ? "Segment deferred" : "Segment restored");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update");
    }
  }

  async function saveCompany() {
    setBusy(true);
    try {
      await companyFn({ data: company });
      await qc.invalidateQueries({ queryKey: ["setup-guide"] });
      form.reset();
      toast.success("Company profile saved");
    } catch (e: any) {
      // A refusal the client could not have predicted — an ABN that fails the
      // ATO checksum, or a schema issue — lands on the field it names rather
      // than as a JSON blob in a toast. Falls back to a plain message when the
      // error is not field-shaped.
      const shown = form.fromServer(e, {
        legal_name: "Registered legal entity name",
        trading_name: "Trading name",
        registration_number: "Registration number",
        address_line1: "Head office address",
        city: "City",
        region: "State / region",
        postal_code: "Postcode",
      });
      if (!shown) toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    setBusy(true);
    try {
      await finalizeFn({});
      await qc.invalidateQueries({ queryKey: ["setup-guide"] });
      toast.success("Your organisation is live.");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not activate", { duration: 9000 });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Setup guide">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <SkeletonRows rows={7} />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Setup guide">
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <EmptyState
            icon={Info}
            tone="pending"
            title="No organisation selected"
            description="A platform account has no tenant of its own. Use the tenant switcher to act as one, or sign in as an organisation admin."
          />
        </div>
      </AppShell>
    );
  }

  const requiredOutstanding = segments.filter((s: any) => s.required && !s.done);

  return (
    <AppShell
      title="Setup guide"
      subtitle="Everything your organisation needs before it goes live"
      actions={
        activated ? (
          <div className="flex items-center gap-2">
            <StatusChip tone="done">Live</StatusChip>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await reopenFn({});
                qc.invalidateQueries({ queryKey: ["setup-guide"] });
              }}
            >
              <RotateCcw className="mr-1 h-4 w-4" /> Reopen setup
            </Button>
          </div>
        ) : (
          <Button size="sm" disabled={!data.requiredComplete || busy} onClick={activate}>
            {data.requiredComplete ? (
              <Rocket className="mr-1 h-4 w-4" />
            ) : (
              <Lock className="mr-1 h-4 w-4" />
            )}
            Finalize &amp; activate
          </Button>
        )
      }
    >
      <section className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <SectionCard
          tone={activated ? "done" : "primary"}
          title={activated ? "Organisation is live" : `${data.percent}% configured`}
          description={
            activated
              ? `Activated ${new Date(data.state.activated_at).toLocaleDateString()}. Reopen setup if something needs changing.`
              : requiredOutstanding.length === 0
                ? "Everything required is done — you can activate whenever you are ready."
                : `Still required: ${requiredOutstanding.map((s: any) => s.title).join(", ")}.`
          }
        >
          <Progress value={data.percent} className="h-2" />
          <p className="mt-3 text-xs text-muted-foreground">
            Each item below is checked against your organisation&apos;s actual data, not against a
            box someone ticked. That means a segment can reopen — delete every leave type and
            payroll goes back to incomplete, which is the honest answer.
          </p>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
          {/* ------------------------------------------------- segment list -- */}
          <SectionCard title="Segments" className="h-fit">
            <ol className="space-y-1">
              {segments.map((s: any, i: number) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => select(s.key)}
                    aria-current={s.key === active}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition",
                      s.key === active
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className="mt-0.5 shrink-0">
                      {s.done ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : s.skipped ? (
                        <SkipForward className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CircleDashed className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block">
                        {i + 1}. {s.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.skipped
                          ? "Deferred"
                          : s.done
                            ? "Complete"
                            : `${s.checks.filter((c: any) => c.done).length}/${s.checks.length} done`}
                        {s.required && !s.done && " · required"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </SectionCard>

          {/* ---------------------------------------------- segment detail -- */}
          {current && (
            <SectionCard
              tone={current.done ? "done" : current.required ? "primary" : undefined}
              title={current.title}
              description={current.description}
              actions={
                current.required ? (
                  <Badge variant="outline">Required to activate</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSkip(current.key, !current.skipped)}
                  >
                    <SkipForward className="mr-1 h-4 w-4" />
                    {current.skipped ? "Bring back" : "Do this later"}
                  </Button>
                )
              }
            >
              <ul className="space-y-2">
                {current.checks.map((c: any) => (
                  <li key={c.key} className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="mt-0.5 shrink-0">
                      {c.done ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleDashed className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{c.label}</div>
                      {c.hint && (
                        <div className="text-xs text-muted-foreground">
                          {c.hint}
                          {!c.done && " Not required to activate."}
                        </div>
                      )}
                    </div>
                    {c.href && !c.done && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={c.href}>
                          Set up <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {c.href && c.done && (
                      <Button asChild size="sm" variant="ghost">
                        <Link to={c.href}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Segment 1 is editable in place: there is no company-profile
                  page to link to, and sending someone into the create-an-org
                  wizard to change an address is exactly the "go and find the
                  page" this flow exists to remove. */}
              {current.key === "company" && (
                <CompanyForm
                  value={company}
                  onChange={setCompany}
                  loaded={companyLoaded}
                  onLoad={() => setCompanyLoaded(true)}
                  onSave={saveCompany}
                  busy={busy}
                  errors={form.errors}
                  register={form.register}
                  check={form.check}
                  clearField={form.clearField}
                />
              )}
            </SectionCard>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function CompanyForm({
  value,
  onChange,
  loaded,
  onLoad,
  onSave,
  busy,
  errors,
  register,
  check,
  clearField,
}: {
  value: Record<string, string>;
  onChange: (v: any) => void;
  loaded: boolean;
  onLoad: () => void;
  onSave: () => void;
  busy: boolean;
  errors: Record<string, string>;
  register: (name: string) => Record<string, unknown>;
  check: (fields: FieldSpec[]) => boolean;
  clearField: (name: string) => void;
}) {
  const guideFn = useServerFn(getSetupGuide);
  const { data } = useQuery({ queryKey: ["setup-guide"], queryFn: () => guideFn() });
  const { country } = useMyTenantCountry();

  // Prefill once from whatever is already stored, so an admin editing one field
  // does not blank the rest.
  //
  // Nulls are coerced to "". The stored row has null for every column nobody
  // has filled in, and spreading those straight into form state did two bad
  // things: React switched the inputs from controlled to uncontrolled, and the
  // submit sent `null` where the schema wanted a string — which is the
  // "Expected string, received null" refusal this form used to answer with.
  useEffect(() => {
    if (loaded || !data) return;
    const t = (data as any).tenantProfile as Record<string, unknown> | null;
    if (t) {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(t)) clean[k] = v == null ? "" : String(v);
      onChange({ ...value, ...clean });
    }
    onLoad();
  }, [data, loaded]);

  const FIELDS: {
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    rule?: (v: string) => string | null;
  }[] = [
    { key: "legal_name", label: "Registered legal entity name", required: true },
    {
      key: "trading_name",
      label: "Trading name (DBA)",
      placeholder: "Optional — leave blank if you trade under the legal name",
      required: false,
    },
    {
      key: "registration_number",
      label: country === "AU" ? "ABN" : "Business registration number",
      required: true,
      // Checked here as well as on the server, so a mistyped ABN lands on the
      // field instead of arriving as a thrown string after a round trip.
      rule: (v) => {
        const res = validateBusinessRegistrationNumber(v, country ?? "");
        return res.ok ? null : (res.error ?? "Not a valid registration number");
      },
    },
    { key: "address_line1", label: "Head office address", required: true },
    { key: "city", label: "City", required: true },
    { key: "region", label: "State / region", placeholder: "Optional", required: false },
    { key: "postal_code", label: "Postcode", required: true },
  ];

  function submit() {
    const ok = check(
      FIELDS.map((f) => ({
        name: f.key,
        value: value[f.key],
        label: f.label,
        required: f.required,
        rule: f.rule,
      })),
    );
    if (!ok) return;
    onSave();
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="text-sm font-medium">Edit here</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`co-${f.key}`} className="text-xs">
              {f.label}
              {f.required !== false && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Input
              id={`co-${f.key}`}
              value={value[f.key] ?? ""}
              placeholder={f.placeholder}
              {...(register(f.key) as object)}
              onChange={(e) => {
                clearField(f.key);
                onChange({ ...value, [f.key]: e.target.value });
              }}
            />
            <FieldError name={f.key} errors={errors} />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Save company profile"}
        </Button>
      </div>
    </div>
  );
}
