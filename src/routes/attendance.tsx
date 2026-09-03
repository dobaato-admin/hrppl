import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { clockIn, clockOut, upsertAttendanceEntry, submitTimesheet } from "@/lib/attendance.functions";
import { AppShell } from "@/components/AppShell";
import { KpiTile, CardRail, StatusChip, statusTone } from "@/components/monday";
import { Clock, Timer, AlarmClock, FileCheck2 } from "lucide-react";
import { browserTimeZone, localYmd } from "@/lib/work-date";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "My attendance — hrppl" }] }),
  component: AttendancePage,
});

interface Entry {
  id: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_minutes: number;
  hours_worked: number;
  notes: string | null;
  status: string;
}
interface Timesheet { id: string; period_start: string; period_end: string; total_hours: number; overtime_hours: number; status: string; rejection_reason: string | null }

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
/**
 * The local calendar date, NOT the UTC one.
 *
 * This function used to be `d.toISOString().slice(0, 10)`, and it is the reason
 * entries appeared against the wrong day. Every cell of the week grid is built
 * from a *local* midnight Date; converting that to UTC first lands on the
 * previous calendar day for any positive offset, so each column queried the day
 * before the one it was labelled with — and today's entry showed up in
 * tomorrow's row. See src/lib/work-date.ts for the full write-up.
 */
const ymd = localYmd;

function AttendancePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [empId, setEmpId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [busy, setBusy] = useState(false);

  const fnClockIn = useServerFn(clockIn);
  const fnClockOut = useServerFn(clockOut);
  const fnUpsert = useServerFn(upsertAttendanceEntry);
  const fnSubmit = useServerFn(submitTimesheet);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: emp } = await supabase.from("employees").select("id").eq("user_id", user.id).maybeSingle();
      if (emp?.id) setEmpId(emp.id);
    })();
  }, [user]);

  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d; }, [weekStart]);

  async function loadWeek() {
    if (!empId) return;
    const [eRes, tRes] = await Promise.all([
      supabase.from("attendance_entries").select("*")
        .eq("employee_id", empId)
        .gte("work_date", ymd(weekStart))
        .lte("work_date", ymd(weekEnd))
        .order("work_date"),
      supabase.from("timesheets").select("*").eq("employee_id", empId).order("period_start", { ascending: false }).limit(10),
    ]);
    setEntries((eRes.data ?? []) as Entry[]);
    setTimesheets((tRes.data ?? []) as Timesheet[]);
  }
  useEffect(() => { loadWeek(); }, [empId, weekStart]);

  const days = useMemo(() => {
    const out: { date: Date; entry?: Entry }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      const e = entries.find((x) => x.work_date === ymd(d));
      out.push({ date: d, entry: e });
    }
    return out;
  }, [entries, weekStart]);

  const todayEntry = entries.find((e) => e.work_date === ymd(new Date()));
  const isClockedIn = !!todayEntry?.clock_in && !todayEntry?.clock_out;
  const totalWeekHours = entries.reduce((s, e) => s + Number(e.hours_worked || 0), 0);

  async function getBrowserLocation(): Promise<{
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    locationError?: string;
  }> {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return { locationError: "Geolocation not supported on this device" };
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            // Previously thrown away. Without it a 2 km IP-derived guess was
            // compared against the fence exactly like a 5 m satellite fix.
            accuracyMeters:
              typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : undefined,
          }),
        (err) => resolve({ locationError: err.message || "Location permission denied" }),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
      );
    });
  }

  async function onClockIn() {
    setBusy(true);
    // Captured before the geolocation wait, which is allowed eight seconds.
    // The server used to stamp its own clock after that wait plus the network
    // round-trip, so every punch was late, always in the employer's favour.
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const loc = await getBrowserLocation();
      const res = await fnClockIn({ data: { ...loc, clientTime, clientTimeZone } });
      if (res.needsReview) {
        toast.warning(`Clocked in at ${res.localTime} — flagged for review`, {
          description: res.reviewReason ?? undefined,
          duration: 9000,
        });
      } else {
        toast.success(`Clocked in at ${res.localTime}${res.remote ? " (working from home)" : ""}`);
      }
      await loadWeek();
    } catch (e: any) {
      toast.error(e.message ?? "Failed", { duration: 12000 });
    } finally {
      setBusy(false);
    }
  }
  async function onClockOut() {
    setBusy(true);
    const clientTime = new Date().toISOString();
    const clientTimeZone = browserTimeZone();
    try {
      const loc = await getBrowserLocation();
      const res = await fnClockOut({ data: { ...loc, clientTime, clientTimeZone } });
      toast.success(`Clocked out at ${res.localTime} — ${res.hours}h`);
      await loadWeek();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function saveRow(date: Date, clockInStr: string, clockOutStr: string, breakMin: number, notes: string) {
    setBusy(true);
    try {
      const ds = ymd(date);
      const ci = clockInStr ? new Date(`${ds}T${clockInStr}:00`).toISOString() : null;
      const co = clockOutStr ? new Date(`${ds}T${clockOutStr}:00`).toISOString() : null;
      await fnUpsert({ data: { workDate: ds, clockIn: ci, clockOut: co, breakMinutes: breakMin, notes } });
      toast.success("Saved");
      await loadWeek();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  async function onSubmitTimesheet() {
    setBusy(true);
    try {
      await fnSubmit({ data: { periodStart: ymd(weekStart), periodEnd: ymd(weekEnd) } });
      toast.success("Submitted for approval");
      await loadWeek();
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  if (loading || !user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  if (!empId) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">No employee record linked.</main>;

  const fmtTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const submittedCount = timesheets.filter((t) => t.status === "submitted" || t.status === "pending").length;
  const rejectedCount = timesheets.filter((t) => t.status === "rejected").length;

  return (
    <AppShell title="My attendance" subtitle="Clock in/out and submit your timesheet.">
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Today"
            value={isClockedIn ? "Clocked in" : todayEntry?.clock_out ? "Done" : "—"}
            tone={isClockedIn ? "working" : todayEntry?.clock_out ? "done" : "pending"}
            icon={Clock}
            hint={todayEntry?.clock_in ? `In ${fmtTime(todayEntry.clock_in)}${todayEntry.clock_out ? ` · Out ${fmtTime(todayEntry.clock_out)}` : ""}` : "Not clocked in"}
          />
          <KpiTile label="Week hours" value={totalWeekHours.toFixed(1)} tone="info" icon={Timer} hint={`${ymd(weekStart)} → ${ymd(weekEnd)}`} />
          <KpiTile label="Awaiting approval" value={submittedCount} tone={submittedCount > 0 ? "working" : "done"} icon={FileCheck2} />
          <KpiTile label="Rejected" value={rejectedCount} tone={rejectedCount > 0 ? "stuck" : "done"} icon={AlarmClock} />
        </section>

        <Card className="overflow-hidden">
          <CardRail tone={isClockedIn ? "working" : "info"} />
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
            <CardDescription>
              {todayEntry?.clock_in ? `In at ${fmtTime(todayEntry.clock_in)}` : "Not clocked in"}
              {todayEntry?.clock_out ? ` · Out at ${fmtTime(todayEntry.clock_out)} · ${todayEntry.hours_worked}h` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={onClockIn} disabled={busy || isClockedIn}>Clock in</Button>
            <Button onClick={onClockOut} disabled={busy || !isClockedIn} variant="outline">Clock out</Button>
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Week of {ymd(weekStart)} — {ymd(weekEnd)}</CardTitle>
              <CardDescription>Total: {totalWeekHours.toFixed(2)}h</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}>Prev</Button>
              <Button size="sm" variant="outline" onClick={() => setWeekStart(startOfWeek(new Date()))}>This week</Button>
              <Button size="sm" variant="outline" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}>Next</Button>
              <Button size="sm" onClick={onSubmitTimesheet} disabled={busy}>Submit timesheet</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead>Break (min)</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(({ date, entry }) => (
                  <DayRow key={ymd(date)} date={date} entry={entry} onSave={saveRow} disabled={busy} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent timesheets</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Hours</TableHead><TableHead>Overtime</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
              <TableBody>
                {timesheets.map((t) => {
                  const s = statusTone(t.status);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{t.period_start} → {t.period_end}</TableCell>
                      <TableCell>{Number(t.total_hours).toFixed(2)}</TableCell>
                      <TableCell>{Number(t.overtime_hours).toFixed(2)}</TableCell>
                      <TableCell><StatusChip tone={s.tone}>{s.label}</StatusChip></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.rejection_reason || "—"}</TableCell>
                    </TableRow>
                  );
                })}
                {timesheets.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No timesheets yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function DayRow({ date, entry, onSave, disabled }: { date: Date; entry?: Entry; onSave: (d: Date, ci: string, co: string, br: number, notes: string) => void; disabled: boolean }) {
  const tStr = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const [ci, setCi] = useState(tStr(entry?.clock_in ?? null));
  const [co, setCo] = useState(tStr(entry?.clock_out ?? null));
  const [br, setBr] = useState(entry?.break_minutes ?? 0);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  useEffect(() => {
    setCi(tStr(entry?.clock_in ?? null));
    setCo(tStr(entry?.clock_out ?? null));
    setBr(entry?.break_minutes ?? 0);
    setNotes(entry?.notes ?? "");
  }, [entry?.id, entry?.clock_in, entry?.clock_out]);

  const dayLabel = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{dayLabel}</TableCell>
      <TableCell><Input type="time" value={ci} onChange={(e) => setCi(e.target.value)} className="w-28" /></TableCell>
      <TableCell><Input type="time" value={co} onChange={(e) => setCo(e.target.value)} className="w-28" /></TableCell>
      <TableCell><Input type="number" min={0} max={720} value={br} onChange={(e) => setBr(Number(e.target.value))} className="w-24" /></TableCell>
      <TableCell>{Number(entry?.hours_worked ?? 0).toFixed(2)}</TableCell>
      <TableCell><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" /></TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" disabled={disabled} onClick={() => onSave(date, ci, co, br, notes)}>Save</Button>
      </TableCell>
    </TableRow>
  );
}
