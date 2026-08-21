import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, Download } from "lucide-react";
import { syncAuHolidays, listAuHolidaySyncLog } from "@/lib/au-holidays-sync.functions";
import { useQuery } from "@tanstack/react-query";
import { AdminGate } from "@/components/AdminGate";
import { PLATFORM_OR_ORG_ADMIN } from "@/lib/rbac";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/holiday-calendar")({
  head: () => ({ meta: [{ title: "Holiday calendar — HRPPL" }] }),
  component: () => (
    <AdminGate allow={PLATFORM_OR_ORG_ADMIN}>
      <HolidayCalendar />
    </AdminGate>
  ),
});

interface Country { code: string; name: string }
interface Holiday {
  id: string; country_code: string; holiday_date: string; name: string;
  is_paid: boolean; is_recurring: boolean; notes: string | null;
  pay_multiplier: number | null;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["S","M","T","W","T","F","S"];

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function HolidayCalendar() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const isSuper = roles.includes("super_admin");
  const isRegional = roles.includes("regional_admin");
  const isOrg = roles.includes("org_admin");
  const canManage = isSuper || isRegional || isOrg;

  const today = new Date();
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState<string>("");
  const [year, setYear] = useState<number>(today.getFullYear() + 1);
  const [rows, setRows] = useState<Holiday[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canManage) { toast.error("Admin access required"); navigate({ to: "/dashboard" }); }
  }, [loading, user, canManage, navigate]);

  useEffect(() => {
    if (!canManage || !user) return;
    (async () => {
      if (isSuper) {
        const { data } = await supabase.from("countries").select("code,name").order("name");
        setCountries((data ?? []) as Country[]);
      } else if (isOrg) {
        const { data: prof } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
        if (!prof?.tenant_id) return;
        const { data: tenant } = await supabase.from("tenants").select("country_code").eq("id", prof.tenant_id).maybeSingle();
        if (!tenant?.country_code) return;
        const { data } = await supabase.from("countries").select("code,name").eq("code", tenant.country_code).order("name");
        setCountries((data ?? []) as Country[]);
      } else {
        const { data: scope } = await supabase.from("role_scope").select("country_code").eq("user_id", user.id);
        const codes = (scope ?? []).map((s) => s.country_code as string);
        if (!codes.length) return;
        const { data } = await supabase.from("countries").select("code,name").in("code", codes).order("name");
        setCountries((data ?? []) as Country[]);
      }
    })();
  }, [canManage, isOrg, isSuper, user]);

  useEffect(() => { if (countries.length && !country) setCountry(countries[0].code); }, [countries, country]);

  async function load() {
    if (!country) return;
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const { data } = await supabase.from("public_holidays").select("*")
      .eq("country_code", country)
      .gte("holiday_date", start)
      .lte("holiday_date", end)
      .order("holiday_date");
    // Also pull recurring entries from any year and project onto the selected year.
    const { data: recurring } = await supabase.from("public_holidays").select("*")
      .eq("country_code", country)
      .eq("is_recurring", true);
    const explicit = (data ?? []) as Holiday[];
    const have = new Set(explicit.map((r) => r.holiday_date));
    const projected: Holiday[] = [];
    for (const r of (recurring ?? []) as Holiday[]) {
      const projDate = `${year}-${r.holiday_date.slice(5)}`;
      if (!have.has(projDate)) {
        projected.push({ ...r, id: `recurring:${r.id}`, holiday_date: projDate });
      }
    }
    setRows([...explicit, ...projected].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)));
  }
  useEffect(() => { load(); }, [country, year]);

  const byDate = useMemo(() => {
    const m = new Map<string, Holiday>();
    for (const r of rows) m.set(r.holiday_date, r);
    return m;
  }, [rows]);

  async function addHoliday(date: string, name: string, isPaid: boolean, isRecurring: boolean, payMultiplier: string) {
    const { error } = await supabase.from("public_holidays").insert({
      country_code: country, holiday_date: date, name, is_paid: isPaid,
      is_recurring: isRecurring,
      pay_multiplier: payMultiplier === "" ? null : Number(payMultiplier),
    });
    if (error) return toast.error(error.message);
    toast.success(`${name} added`);
    load();
  }
  async function materialiseRecurring(virtualId: string, date: string, name: string, isPaid: boolean, payMultiplier: number | null) {
    // virtualId looks like "recurring:<uuid>"; create a concrete row for this year so it can be edited/removed independently.
    const { error } = await supabase.from("public_holidays").insert({
      country_code: country, holiday_date: date, name, is_paid: isPaid,
      is_recurring: false, pay_multiplier: payMultiplier,
    });
    if (error) return toast.error(error.message);
    toast.success("Holiday pinned to this year — edit again to update");
    load();
  }
  async function patch(id: string, changes: Partial<Holiday>) {
    if (id.startsWith("recurring:")) {
      toast.message("This date is generated from a recurring rule. Edit it on the Public holidays page, or pin it to this year first.");
      return;
    }
    const { error } = await supabase.from("public_holidays").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  async function remove(id: string) {
    if (id.startsWith("recurring:")) {
      toast.message("Recurring holidays must be removed from the Public holidays page.");
      return;
    }
    const { error } = await supabase.from("public_holidays").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  const yearOptions = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2];

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    <AppShell>
      <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Annual holiday calendar</h1>
              <p className="text-xs text-muted-foreground">Click any day to mark or unmark it as a public holiday — used automatically when payroll runs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/holidays"><Button size="sm" variant="ghost">List view</Button></Link>
            <Link to="/dashboard"><Button size="sm" variant="outline">Dashboard</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Pick a country and a year — holidays you set here flow into payroll automatically (holiday-pay multiplier applies on the pay-day calc).</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <Badge variant="secondary">{rows.length} day{rows.length === 1 ? "" : "s"} marked</Badge>
              {country === "AU" && <AuSyncButton year={year} onDone={load} />}
            </div>
          </CardContent>
        </Card>

        {country === "AU" && <AuSyncLog />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MONTHS.map((label, monthIdx) => (
            <MonthCard
              key={label}
              year={year}
              monthIndex={monthIdx}
              label={label}
              byDate={byDate}
              onAdd={addHoliday}
              onPatch={patch}
              onRemove={remove}
              onMaterialise={materialiseRecurring}
            />
          ))}
        </div>
      </section>
      </main>
    </AppShell>
  );
}

function AuSyncButton({ year, onDone }: { year: number; onDone: () => void }) {
  const sync = useServerFn(syncAuHolidays);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const r: any = await sync({ data: { year } });
      toast.success(`Synced AU holidays for ${year}: ${r.inserted} added, ${r.skipped} already present.`);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  return (
    <Button size="sm" variant="outline" onClick={run} disabled={busy}>
      <Download className="mr-1 h-4 w-4" /> {busy ? "Syncing…" : `Sync AU ${year} from data.gov.au`}
    </Button>
  );
}

function AuSyncLog() {
  const listFn = useServerFn(listAuHolidaySyncLog);
  const q = useQuery({ queryKey: ["au-holiday-sync-log"], queryFn: () => listFn() });
  const entries = (q.data?.entries ?? []) as any[];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AU sync history</CardTitle>
        <CardDescription>Last 50 sync runs from data.gov.au. Failed or partial runs show the error and any CSV rows that couldn't be parsed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No syncs yet — click the “Sync AU …” button above.</p>}
        {entries.map((e) => {
          const errs = Array.isArray(e.csv_parse_errors) ? e.csv_parse_errors : [];
          return (
            <details key={e.id} className="rounded border p-2 text-sm">
              <summary className="flex flex-wrap items-center gap-2 cursor-pointer">
                <Badge variant={e.status === "success" ? "default" : e.status === "partial" ? "secondary" : "outline"} className={e.status === "failed" ? "border-red-400 text-red-700" : ""}>{e.status}</Badge>
                <span className="font-medium">{e.year}</span>
                <span className="text-xs text-muted-foreground">{new Date(e.started_at).toLocaleString()}</span>
                <span className="text-xs">+{e.inserted_count} added · {e.skipped_count} skipped · {e.total_count} total</span>
                {errs.length > 0 && <span className="text-xs text-amber-600">{errs.length} parse warning(s)</span>}
              </summary>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {e.source_url && <div>Source: <a className="underline" href={e.source_url} target="_blank" rel="noreferrer">{e.source_url}</a></div>}
                {e.error_message && <div className="text-red-600">Error: {e.error_message}</div>}
                {errs.length > 0 && (
                  <div className="mt-1 rounded bg-muted p-2">
                    <div className="font-medium mb-1">CSV parse warnings:</div>
                    <ul className="list-disc pl-5 space-y-0.5 max-h-40 overflow-auto">
                      {errs.slice(0, 100).map((er: any, i: number) => (
                        <li key={i}>row {er.row}: {er.reason}{er.raw ? ` (${er.raw})` : ""}</li>
                      ))}
                      {errs.length > 100 && <li>… and {errs.length - 100} more</li>}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MonthCard({
  year, monthIndex, label, byDate, onAdd, onPatch, onRemove, onMaterialise,
}: {
  year: number; monthIndex: number; label: string;
  byDate: Map<string, Holiday>;
  onAdd: (date: string, name: string, isPaid: boolean, isRecurring: boolean, payMultiplier: string) => void;
  onPatch: (id: string, changes: Partial<Holiday>) => void;
  onRemove: (id: string) => void;
  onMaterialise: (virtualId: string, date: string, name: string, isPaid: boolean, payMultiplier: number | null) => void;
}) {
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {DOW.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="h-8" />;
            const dateStr = ymd(d);
            const h = byDate.get(dateStr);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            return (
              <DayCell
                key={i}
                date={d}
                dateStr={dateStr}
                holiday={h}
                isWeekend={isWeekend}
                onAdd={(name, isPaid, isRecurring, mult) => onAdd(dateStr, name, isPaid, isRecurring, mult)}
                onPatch={(c) => h && onPatch(h.id, c)}
                onRemove={() => h && onRemove(h.id)}
                onMaterialise={() => h && onMaterialise(h.id, dateStr, h.name, h.is_paid, h.pay_multiplier)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DayCell({
  date, dateStr, holiday, isWeekend, onAdd, onPatch, onRemove, onMaterialise,
}: {
  date: Date; dateStr: string; holiday: Holiday | undefined; isWeekend: boolean;
  onAdd: (name: string, isPaid: boolean, isRecurring: boolean, payMultiplier: string) => void;
  onPatch: (changes: Partial<Holiday>) => void;
  onRemove: () => void;
  onMaterialise: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(holiday?.name ?? "");
  const [isPaid, setIsPaid] = useState(holiday?.is_paid ?? true);
  const [isRecurring, setIsRecurring] = useState(holiday?.is_recurring ?? false);
  const [mult, setMult] = useState<string>(holiday?.pay_multiplier != null ? String(holiday.pay_multiplier) : "");

  useEffect(() => {
    setName(holiday?.name ?? "");
    setIsPaid(holiday?.is_paid ?? true);
    setIsRecurring(holiday?.is_recurring ?? false);
    setMult(holiday?.pay_multiplier != null ? String(holiday.pay_multiplier) : "");
  }, [holiday?.id]);

  const isVirtual = holiday?.id.startsWith("recurring:");
  const base = "relative h-8 w-full rounded text-xs flex items-center justify-center transition";
  const cls = holiday
    ? (isVirtual ? "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100" : "bg-primary text-primary-foreground hover:bg-primary/90")
    : isWeekend ? "bg-muted/40 text-muted-foreground hover:bg-muted" : "hover:bg-muted";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={`${base} ${cls}`} title={holiday?.name ?? dateStr}>
          {date.getDate()}
          {holiday && <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-current opacity-70" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 pointer-events-auto" align="start">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">{dateStr}</div>
          {isVirtual && (
            <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              This date comes from a recurring holiday rule. Pin it to this year to edit it, or change the original on the Public holidays page.
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Holiday name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Independence Day" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded border p-2">
              <Label className="text-xs">Paid</Label>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>
            <div className="flex items-center justify-between rounded border p-2">
              <Label className="text-xs">Recurs yearly</Label>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} disabled={!!holiday && !isVirtual ? false : false} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pay multiplier (blank = country default)</Label>
            <Input type="number" step="0.05" min={1} max={10} value={mult} onChange={(e) => setMult(e.target.value)} placeholder="e.g. 2.0" />
          </div>
          <div className="flex justify-between gap-2 pt-1">
            {holiday && !isVirtual && (
              <Button size="sm" variant="outline" onClick={() => { onRemove(); setOpen(false); }}>
                Remove
              </Button>
            )}
            {isVirtual && (
              <Button size="sm" variant="outline" onClick={() => { onMaterialise(); setOpen(false); }}>
                Pin to {dateStr.slice(0, 4)}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              {holiday && !isVirtual ? (
                <Button
                  size="sm"
                  onClick={() => {
                    onPatch({
                      name: name || holiday.name,
                      is_paid: isPaid,
                      is_recurring: isRecurring,
                      pay_multiplier: mult === "" ? null : Number(mult),
                    });
                    setOpen(false);
                  }}
                  disabled={!name.trim()}
                >Save</Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    if (!name.trim()) return;
                    onAdd(name.trim(), isPaid, isRecurring, mult);
                    setOpen(false);
                  }}
                  disabled={!name.trim()}
                >Add holiday</Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
