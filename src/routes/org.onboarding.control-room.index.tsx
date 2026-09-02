import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  listControlRooms,
  bulkUpdateAssignmentStatus,
} from "@/lib/onboarding-control-room.functions";
import { Search, X, ArrowUpDown, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

const LANES = ["hr", "it", "manager", "employee", "finance"] as const;
const STATUSES = ["pending", "in_progress", "completed", "blocked", "skipped"] as const;
const ALL = "__all__";

export const Route = createFileRoute("/org/onboarding/control-room/")({
  head: () => ({ meta: [{ title: "Onboarding control room — HRPPL" }] }),
  component: Page,
});

function Page() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const canAccess =
    roles.includes("hr") ||
    roles.includes("org_admin") ||
    roles.includes("super_admin") ||
    roles.includes("manager");
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const [search, setSearch] = useState("");
  const [ownerRole, setOwnerRole] = useState<string>(ALL);
  const [taskStatus, setTaskStatus] = useState<string>(ALL);
  const [dueBefore, setDueBefore] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState<string>(ALL);
  const [sortBy, setSortBy] = useState<"recent" | "name" | "hire">("recent");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const qc = useQueryClient();
  const fn = useServerFn(listControlRooms);
  const bulkFn = useServerFn(bulkUpdateAssignmentStatus);
  const { data, isLoading } = useQuery({
    queryKey: [
      "onboarding-control-rooms",
      search,
      ownerRole,
      taskStatus,
      dueBefore,
      assignmentStatus,
    ],
    queryFn: () =>
      fn({
        data: {
          search: search || undefined,
          owner_role: ownerRole !== ALL ? (ownerRole as any) : undefined,
          task_status: taskStatus !== ALL ? (taskStatus as any) : undefined,
          due_before: dueBefore || undefined,
          assignment_status: assignmentStatus !== ALL ? assignmentStatus : undefined,
        },
      }),
    enabled: canAccess,
  });

  const allRows = data?.rows ?? [];
  const rows = [...allRows].sort((a: any, b: any) => {
    if (sortBy === "name") {
      const an = `${a.employee?.first_name ?? ""} ${a.employee?.last_name ?? ""}`.trim();
      const bn = `${b.employee?.first_name ?? ""} ${b.employee?.last_name ?? ""}`.trim();
      return an.localeCompare(bn);
    }
    if (sortBy === "hire") {
      const ad = a.employee?.hire_date ?? "";
      const bd = b.employee?.hire_date ?? "";
      return bd.localeCompare(ad);
    }
    return (b.assigned_at ?? "").localeCompare(a.assigned_at ?? "");
  });
  const hasFilter = !!(
    search ||
    ownerRole !== ALL ||
    taskStatus !== ALL ||
    dueBefore ||
    assignmentStatus !== ALL
  );

  function clearFilters() {
    setSearch("");
    setOwnerRole(ALL);
    setTaskStatus(ALL);
    setDueBefore("");
    setAssignmentStatus(ALL);
  }

  // KPI counts across the unfiltered-by-status visible rows
  const kpis = useMemo(() => {
    const k = { pending: 0, in_progress: 0, completed: 0, blocked: 0 };
    for (const r of allRows) {
      const s = (r as any).status as keyof typeof k;
      if (s in k) k[s] += 1;
    }
    return k;
  }, [allRows]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r: any) => r.id)));
  }

  async function runBulk(decision: "approve" | "reject", notes?: string) {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      const res = await bulkFn({ data: { ids: Array.from(selected), decision, notes } });
      toast.success(
        `${decision === "approve" ? "Approved" : "Rejected"} ${res.count} assignment${res.count === 1 ? "" : "s"}`,
      );
      setSelected(new Set());
      setRejectOpen(false);
      setRejectNotes("");
      qc.invalidateQueries({ queryKey: ["onboarding-control-rooms"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  }

  const kpiTiles = [
    { key: "pending", label: "Pending", value: kpis.pending, icon: Clock, tone: "text-amber-600" },
    {
      key: "in_progress",
      label: "In progress",
      value: kpis.in_progress,
      icon: ArrowUpDown,
      tone: "text-blue-600",
    },
    {
      key: "blocked",
      label: "Blocked",
      value: kpis.blocked,
      icon: AlertTriangle,
      tone: "text-red-600",
    },
    {
      key: "completed",
      label: "Completed",
      value: kpis.completed,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
  ];

  return (
    <AppShell title="Onboarding control room" subtitle="Cross-team checklists for every new hire">
      <div className="p-4 space-y-4">
        {/* KPI tiles */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {kpiTiles.map((t) => {
            const Icon = t.icon;
            const active = assignmentStatus === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setAssignmentStatus(active ? ALL : t.key)}
                aria-pressed={active}
                className={`text-left rounded-lg border bg-card p-3 transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary ring-1 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t.label}</span>
                  <Icon className={`h-4 w-4 ${t.tone}`} />
                </div>
                <div className="text-2xl font-semibold mt-1">{t.value}</div>
              </button>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Name, employee #, job title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Owner lane</Label>
                <Select value={ownerRole} onValueChange={setOwnerRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All lanes</SelectItem>
                    {LANES.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Task status</Label>
                <Select value={taskStatus} onValueChange={setTaskStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Due on/before</Label>
                <Input
                  type="date"
                  value={dueBefore}
                  onChange={(e) => setDueBefore(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                {hasFilter && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {rows.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selected.size === rows.length && rows.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all visible"
                />
                <span>Select all</span>
              </label>
            )}
            <div>
              {isLoading ? (
                "Loading…"
              ) : (
                <>
                  <span className="font-medium text-foreground">{rows.length}</span> assignment
                  {rows.length === 1 ? "" : "s"}
                  {hasFilter && " match these filters"}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently assigned</SelectItem>
                <SelectItem value="hire">Hire date (newest)</SelectItem>
                <SelectItem value="name">Employee name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card/95 backdrop-blur px-3 py-2 shadow-sm">
            <div className="text-sm">
              <span className="font-medium">{selected.size}</span> selected
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkBusy}
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Bulk reject
              </Button>
              <Button size="sm" disabled={bulkBusy} onClick={() => runBulk("approve")}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Bulk approve
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-[220px] animate-pulse">
                <CardHeader>
                  <span className="block h-4 w-2/3 rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="block h-2 w-full rounded bg-muted" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              {hasFilter ? "No matches for these filters." : "No onboarding assignments yet."}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row: any) => {
            const emp = row.employee ?? {};
            const isSel = selected.has(row.id);
            return (
              <Card
                key={row.id}
                className={`transition-colors ${isSel ? "border-primary" : "hover:border-primary/40"}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Select ${emp.first_name ?? ""} ${emp.last_name ?? ""}`}
                      className="mt-1"
                    />
                    <Link
                      to="/org/onboarding/control-room/$id"
                      params={{ id: row.id }}
                      className="flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      <CardTitle className="text-base truncate">
                        {emp.first_name} {emp.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        {emp.employee_number && <span>#{emp.employee_number}</span>}
                        {emp.job_title && <span>· {emp.job_title}</span>}
                        <Badge variant="outline" className="ml-auto">
                          {row.status}
                        </Badge>
                      </CardDescription>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {LANES.map((lane) => {
                    const l = row.lanes?.[lane];
                    const pct = l && l.total > 0 ? Math.round((l.done / l.total) * 100) : 0;
                    return (
                      <div key={lane}>
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{lane}</span>
                          <span className="text-muted-foreground">
                            {l ? `${l.done}/${l.total}` : "—"}
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject {selected.size} assignment{selected.size === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              Add a short note for the audit trail. The selected onboarding assignments will be
              marked as blocked.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)…"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={bulkBusy}
              onClick={() => runBulk("reject", rejectNotes || undefined)}
            >
              Reject {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
