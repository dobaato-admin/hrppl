import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Mail,
  AlertTriangle,
  Users,
  FileText,
  Search,
  Inbox,
  Download,
  X as XIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  listTeamMembers,
  listEmployeeRecord,
  requestMissingDocument,
  cancelDocumentRequest,
  exportEmployeeHistoryCsv,
} from "@/lib/teams.functions";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({
    meta: [
      { title: "Team members — hrppl" },
      {
        name: "description",
        content: "View, manage and request information from your entire team.",
      },
    ],
  }),
  component: () => (
    <AdminGate feature="org.teams">
      <TeamsPage />
    </AdminGate>
  ),
});

const DOC_OPTIONS: { value: string; label: string }[] = [
  { value: "national_id", label: "National ID / Passport" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's license" },
  { value: "tax_id", label: "Tax ID / TFN" },
  { value: "social_security", label: "Social security number" },
  { value: "bank_details", label: "Bank account details" },
  { value: "next_of_kin", label: "Next of kin / emergency contact" },
  { value: "address_proof", label: "Proof of address" },
  { value: "other", label: "Other document" },
];

const ALL_CATEGORIES = [
  "leave",
  "asset",
  "promotion",
  "pay_change",
  "document",
  "training",
  "disciplinary",
  "grievance",
  "medical",
  "review",
  "onboarding",
  "offboarding",
  "payroll",
  "request",
  "expense",
  "appraisal",
  "other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  leave: "bg-status-done text-white",
  asset: "bg-status-working text-white",
  promotion: "bg-accent text-accent-foreground",
  pay_change: "bg-primary text-primary-foreground",
  document: "bg-muted text-foreground",
  training: "bg-status-info text-white",
  disciplinary: "bg-status-stuck text-white",
  grievance: "bg-status-pending text-white",
  medical: "bg-status-stuck text-white",
  review: "bg-accent text-accent-foreground",
  onboarding: "bg-status-info text-white",
  payroll: "bg-primary text-primary-foreground",
  request: "bg-status-pending text-white",
  offboarding: "bg-status-stuck text-white",
};

function TeamsPage() {
  const listFn = useServerFn(listTeamMembers);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => listFn(),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data?.employees ?? [];
    if (!q) return list;
    return list.filter((e: any) =>
      `${e.first_name} ${e.last_name} ${e.email ?? ""} ${e.job_title ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [data, search]);

  const totalMissing = useMemo(
    () => (data?.employees ?? []).reduce((s: number, e: any) => s + (e.missing?.length ?? 0), 0),
    [data],
  );

  return (
    <AppShell
      title="Team members"
      subtitle="Everyone you manage, with history, filters, and pending items"
    >
      <div className="grid h-full grid-cols-1 gap-4 p-4 md:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" /> Directory ({(data?.employees ?? []).length})
                </CardTitle>
                <CardDescription>
                  {totalMissing > 0
                    ? `${totalMissing} missing items across the team`
                    : "All records look complete."}
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/id-requests">
                  <Inbox className="mr-1 h-3.5 w-3.5" /> Requests
                </Link>
              </Button>
            </div>
            <div className="relative pt-2">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or title"
                className="pl-7"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto px-0 pt-0">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No team members found.</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((e: any) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setSelectedId(e.id)}
                      className={`flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-accent ${
                        selectedId === e.id ? "bg-accent/60" : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {(e.first_name?.[0] ?? "") + (e.last_name?.[0] ?? "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {e.first_name} {e.last_name}
                          </span>
                          {e.status !== "active" && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {e.status}
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {e.job_title || "—"}
                        </div>
                        {(e.missing?.length ?? 0) > 0 && (
                          <Badge className="mt-1 bg-status-stuck text-white text-[10px]">
                            <AlertTriangle className="mr-1 h-2.5 w-2.5" /> {e.missing.length}{" "}
                            missing
                          </Badge>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0">
          {selectedId ? (
            <EmployeeDetail
              employeeId={selectedId}
              precomputedMissing={
                (data?.employees ?? []).find((e: any) => e.id === selectedId)?.missing ?? []
              }
            />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Select a team member to view their record.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function EmployeeDetail({
  employeeId,
  precomputedMissing,
}: {
  employeeId: string;
  precomputedMissing: string[];
}) {
  const qc = useQueryClient();
  const fetchRecord = useServerFn(listEmployeeRecord);
  const requestFn = useServerFn(requestMissingDocument);
  const cancelFn = useServerFn(cancelDocumentRequest);
  const exportFn = useServerFn(exportEmployeeHistoryCsv);

  const [categories, setCategories] = useState<string[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [eventSearch, setEventSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filters = useMemo(
    () => ({
      employeeId,
      categories: categories.length ? categories : undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
      search: eventSearch.trim() || undefined,
      page,
      pageSize,
    }),
    [employeeId, categories, from, to, eventSearch, page],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["team-member-record", filters],
    queryFn: () => fetchRecord({ data: filters }),
  });

  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openRequestDialog() {
    // Pre-select all currently outstanding missing items
    const preset = precomputedMissing.filter((m) => DOC_OPTIONS.some((o) => o.value === m));
    setSelectedDocs(preset.length ? preset : []);
    setRequestOpen(true);
  }

  function toggleDoc(value: string) {
    setSelectedDocs((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function submitRequest() {
    if (selectedDocs.length === 0) {
      toast.error("Select at least one item to request");
      return;
    }
    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        selectedDocs.map((doc) =>
          requestFn({ data: { employeeId, documentType: doc as any, notes: notes || undefined } }),
        ),
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - ok;
      if (ok > 0) toast.success(`${ok} request${ok === 1 ? "" : "s"} sent`);
      if (failed > 0) toast.error(`${failed} request${failed === 1 ? "" : "s"} failed`);
      setRequestOpen(false);
      setNotes("");
      setSelectedDocs([]);
      qc.invalidateQueries({ queryKey: ["team-member-record"] });
      qc.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send requests");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelRequest(id: string) {
    try {
      await cancelFn({ data: { id } });
      toast.success("Request cancelled");
      qc.invalidateQueries({ queryKey: ["team-member-record"] });
      qc.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function doExport(kind: "csv" | "pdf") {
    try {
      const res: any = await exportFn({
        data: {
          employeeId,
          categories: categories.length ? categories : undefined,
          from: filters.from,
          to: filters.to,
        },
      });
      if (kind === "csv") {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
        downloadBlob(blob, res.filename);
        toast.success("CSV downloaded");
      } else {
        const html = buildPrintHtml(res.employee, res.csv);
        const w = window.open("", "_blank");
        if (!w) {
          toast.error("Allow pop-ups to print a PDF");
          return;
        }
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 250);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    }
  }

  if (isLoading && !data) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  const emp: any = data?.employee;
  const profile: any = data?.profile ?? {};
  const pendingRequests = (data?.requests ?? []).filter((r: any) => r.status === "pending");
  const events = data?.events ?? [];
  const total = data?.totalEvents ?? 0;
  const counts: Record<string, number> = data?.categoryCounts ?? {};
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function toggleCategory(cat: string) {
    setPage(1);
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">
              {emp?.first_name} {emp?.last_name}
            </CardTitle>
            <CardDescription>
              {emp?.job_title || "—"} · {emp?.email || "no email"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/employees/$employeeId" params={{ employeeId }}>
                <FileText className="mr-1 h-4 w-4" /> Full timeline
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => doExport("csv")}>
              <Download className="mr-1 h-4 w-4" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => doExport("pdf")}>
              <Download className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button size="sm" onClick={openRequestDialog}>
              <Mail className="mr-1 h-4 w-4" /> Request info
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <InfoStat label="Employment" value={emp?.employment_type ?? "—"} />
          <InfoStat label="Status" value={emp?.status ?? "—"} />
          <InfoStat label="Hire date" value={emp?.hire_date ?? "—"} />
          <InfoStat label="Phone" value={emp?.phone ?? "—"} />
        </CardContent>
      </Card>

      {(precomputedMissing.length > 0 || pendingRequests.length > 0) && (
        <Card className="border-status-stuck/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-status-stuck" /> Pending items
            </CardTitle>
            <CardDescription>
              Information missing from this employee's record, plus open requests you've sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {precomputedMissing.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {precomputedMissing.map((m) => (
                  <Badge
                    key={m}
                    variant="outline"
                    className="border-status-stuck/40 text-status-stuck"
                  >
                    Missing: {DOC_OPTIONS.find((d) => d.value === m)?.label ?? m.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
            {pendingRequests.length > 0 && (
              <ul className="space-y-1.5">
                {pendingRequests.map((r: any) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        Requested:{" "}
                        {DOC_OPTIONS.find((d) => d.value === r.document_type)?.label ??
                          r.document_type}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(r.requested_at).toLocaleString()}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => cancelRequest(r.id)}>
                      Cancel
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identity & contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <InfoStat label="Date of birth" value={profile.date_of_birth ?? "—"} />
          <InfoStat label="Nationality" value={profile.nationality ?? "—"} />
          <InfoStat label="National ID" value={profile.national_id_number ?? "—"} />
          <InfoStat label="Tax ID" value={profile.tax_identification_number ?? "—"} />
          <InfoStat
            label="Address"
            value={
              [profile.address_line1, profile.city, profile.country_of_residence]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
          <InfoStat
            label="Next of kin"
            value={
              profile.emergency_contact_name
                ? `${profile.emergency_contact_name} (${profile.emergency_contact_relation ?? "—"}) · ${profile.emergency_contact_phone ?? "no phone"}`
                : "—"
            }
          />
          <InfoStat label="Bank account" value={profile.bank_account_number ? "On file" : "—"} />
          <InfoStat label="Personal email" value={profile.personal_email ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activity by category</CardTitle>
          <CardDescription>
            {total} event{total === 1 ? "" : "s"} match{total === 1 ? "es" : ""} your filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                From
              </Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-40"
              />
            </div>
            <div className="flex flex-col">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                To
              </Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-40"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Search
              </Label>
              <Input
                value={eventSearch}
                onChange={(e) => {
                  setEventSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search event title…"
                className="h-9"
              />
            </div>
            {(categories.length || from || to || eventSearch) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCategories([]);
                  setFrom("");
                  setTo("");
                  setEventSearch("");
                  setPage(1);
                }}
              >
                <XIcon className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const active = categories.includes(cat);
              const count = counts[cat] ?? 0;
              if (count === 0 && !active) return null;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] capitalize transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  {cat.replace("_", " ")} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          <EventList events={events} />

          {total > pageSize && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request information from {emp?.first_name}</DialogTitle>
            <DialogDescription>
              Select one or more items. We'll email the employee and add each to their pending items
              until provided.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Documents or information</Label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setSelectedDocs(DOC_OPTIONS.map((o) => o.value))}
                  >
                    Select all
                  </button>
                  <span className="text-muted-foreground">·</span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setSelectedDocs([])}
                  >
                    Clear
                  </button>
                  {precomputedMissing.length > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() =>
                          setSelectedDocs(
                            precomputedMissing.filter((m) =>
                              DOC_OPTIONS.some((o) => o.value === m),
                            ),
                          )
                        }
                      >
                        Outstanding only
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-md border border-border">
                {DOC_OPTIONS.map((o) => {
                  const checked = selectedDocs.includes(o.value);
                  const outstanding = precomputedMissing.includes(o.value);
                  return (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0 hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDoc(o.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="flex-1">{o.label}</span>
                      {outstanding && (
                        <Badge
                          variant="outline"
                          className="border-status-stuck/40 text-[10px] text-status-stuck"
                        >
                          Outstanding
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">{selectedDocs.length} selected</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes for the employee (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything specific you need…"
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRequest} disabled={submitting || selectedDocs.length === 0}>
              {submitting
                ? "Sending…"
                : `Send ${selectedDocs.length || ""} request${selectedDocs.length === 1 ? "" : "s"}`.trim()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildPrintHtml(employee: any, csv: string) {
  const name = employee
    ? `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim()
    : "Employee";
  const rows = csv.split("\n");
  const headers = (rows.shift() ?? "").split(",");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') q = false;
        else cur += c;
      } else if (c === ",") {
        out.push(cur);
        cur = "";
      } else if (c === '"') q = true;
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const body = rows
    .filter((r) => r.trim())
    .map(
      (r) =>
        `<tr>${parseRow(r)
          .map((c) => `<td>${esc(c)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)} — history</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;color:#111}
      h1{margin:0 0 4px;font-size:20px}
      p{margin:0 0 16px;color:#555;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
      th{background:#f5f5f5}
      tr:nth-child(even) td{background:#fafafa}
      @media print{button{display:none}}
    </style></head><body>
    <h1>${esc(name)} — Team history</h1>
    <p>Exported ${new Date().toLocaleString()} · ${rows.length} events</p>
    <table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${body}</tbody></table>
    <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
    </body></html>`;
}

function EventList({ events }: { events: any[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No events match your filters.</p>;
  }
  return (
    <ol className="relative space-y-3 border-l border-border pl-4">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[22px] mt-1 inline-block h-3 w-3 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={CATEGORY_COLORS[e.category as string] ?? "bg-muted"}>
              {(e.category as string).replace("_", " ")}
            </Badge>
            <span className="font-medium">{e.title}</span>
            {e.severity && (
              <Badge variant="outline" className="capitalize">
                {e.severity}
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {new Date(e.occurred_at).toLocaleString()}
            </span>
          </div>
          {e.summary && <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>}
        </li>
      ))}
    </ol>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
