import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Archive, ArrowUp, ArrowDown, Play, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { exploreAudit } from "@/lib/audit-explorer.functions";
import { getAuditDetail } from "@/lib/audit-detail.functions";
import {
  listRetentionPolicies,
  upsertRetentionPolicy,
  runRetentionNow,
} from "@/lib/audit-retention.functions";
import {
  enqueueAuditExportJob,
  getExportJob,
  downloadExportJob,
  listMyRecentExportJobs,
  retryExportJob,
  getCsvExportRetention,
  updateCsvExportRetention,
  getExportJobHistory,
} from "@/lib/csv-export-jobs.functions";
import { RefreshCw, AlertTriangle, History, Radio } from "lucide-react";

export const Route = createFileRoute("/admin/audit-history")({
  head: () => ({ meta: [{ title: "Audit history — HRPPL" }] }),
  component: Page,
});

function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const PAGE_SIZE = 100;

function Page() {
  const fExplore = useServerFn(exploreAudit);
  const fRetList = useServerFn(listRetentionPolicies);
  const fRetSave = useServerFn(upsertRetentionPolicy);
  const fRetRun = useServerFn(runRetentionNow);
  const fEnqueue = useServerFn(enqueueAuditExportJob);
  const fJobStatus = useServerFn(getExportJob);
  const fJobDownload = useServerFn(downloadExportJob);
  const fJobsList = useServerFn(listMyRecentExportJobs);
  const fJobRetry = useServerFn(retryExportJob);
  const fDetail = useServerFn(getAuditDetail);
  const fRetGet = useServerFn(getCsvExportRetention);
  const fRetSet = useServerFn(updateCsvExportRetention);
  const fHistory = useServerFn(getExportJobHistory);
  const queryClient = useQueryClient();
  const [historyJobId, setHistoryJobId] = useState<string | null>(null);
  const [realtimeOk, setRealtimeOk] = useState(false);

  // Read ?job=<id> for click-through highlight from notification inbox.
  const highlightJobId =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("job") : null;

  const [filters, setFilters] = useState<any>({
    source: "all",
    includeArchive: false,
    sortBy: "created_at",
    sortDir: "desc",
  });
  const [page, setPage] = useState(0);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ source: "onboarding" | "offboarding"; id: string } | null>(
    null,
  );

  const detailQ = useQuery({
    queryKey: ["audit-detail", detail],
    queryFn: () =>
      fDetail({
        data: { source: detail!.source, id: detail!.id, includeArchive: !!filters.includeArchive },
      }),
    enabled: !!detail,
  });

  const data = useQuery({
    queryKey: ["audit-explorer", filters, page],
    queryFn: () => fExplore({ data: { ...filters, limit: PAGE_SIZE, offset: page * PAGE_SIZE } }),
  });
  const retention = useQuery({ queryKey: ["audit-retention"], queryFn: () => fRetList() });
  const jobs = useQuery({
    queryKey: ["audit-export-jobs"],
    queryFn: () => fJobsList(),
    // Realtime pushes updates server-side (see effect below). Polling is the
    // fallback when realtime isn't connected so the UI never stalls.
    refetchInterval: (q) => {
      if (realtimeOk) return false;
      const rows = ((q.state.data as any)?.rows ?? []) as any[];
      const inFlight = rows.some((r) => r.status === "queued" || r.status === "running");
      return inFlight || activeJobId ? 1500 : false;
    },
  });

  // Live status updates without polling: subscribe to csv_export_jobs changes
  // for this user, invalidate the list query so the table re-renders. Realtime
  // is opt-in; we set realtimeOk true only after SUBSCRIBED so polling stays
  // active during connection.
  useEffect(() => {
    const channel = supabase
      .channel("csv-export-jobs-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "csv_export_jobs" }, () => {
        queryClient.invalidateQueries({ queryKey: ["audit-export-jobs"] });
      })
      .subscribe((status) => {
        setRealtimeOk(status === "SUBSCRIBED");
      });
    return () => {
      supabase.removeChannel(channel);
      setRealtimeOk(false);
    };
  }, [queryClient]);
  const csvRetention = useQuery({ queryKey: ["csv-export-retention"], queryFn: () => fRetGet() });
  const [retentionDraft, setRetentionDraft] = useState<string>("");

  const set = (k: string, v: any) => {
    setPage(0);
    setFilters((s: any) => ({ ...s, [k]: v || undefined }));
  };

  // Poll active job status until finished
  const activeJob = useQuery({
    queryKey: ["audit-export-job", activeJobId],
    queryFn: () => fJobStatus({ data: { jobId: activeJobId! } }),
    enabled: !!activeJobId,
    refetchInterval: (q) => {
      const s = (q.state.data as any)?.status;
      return s === "succeeded" || s === "failed" ? false : 1500;
    },
  });

  useEffect(() => {
    const s = (activeJob.data as any)?.status;
    if (s === "succeeded" && activeJobId) {
      (async () => {
        try {
          const res = await fJobDownload({ data: { jobId: activeJobId } });
          downloadCsv(`audit-${activeJobId}.csv`, res.csv);
          toast.success(
            `Downloaded ${res.rowCount} rows${res.truncated ? " (truncated at 50k)" : ""}`,
          );
        } catch (e: any) {
          toast.error(e?.message ?? "Download failed");
        } finally {
          setActiveJobId(null);
          jobs.refetch();
        }
      })();
    } else if (s === "failed" && activeJobId) {
      toast.error((activeJob.data as any)?.error_message ?? "Export failed");
      setActiveJobId(null);
      jobs.refetch();
    }
  }, [activeJob.data, activeJobId]);

  const startExport = async (jobType: "audit_unified" | "audit_onboarding") => {
    try {
      const res = await fEnqueue({ data: { jobType, filters } });
      setActiveJobId(res.jobId);
      toast.info("Export started — you'll get the file when it's ready.");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't start export");
    }
  };

  const toggleSort = (col: "created_at" | "action" | "source") => {
    if (filters.sortBy === col) {
      setFilters((s: any) => ({ ...s, sortDir: s.sortDir === "asc" ? "desc" : "asc" }));
    } else {
      setFilters((s: any) => ({ ...s, sortBy: col, sortDir: "desc" }));
    }
    setPage(0);
  };

  const SortHead = ({ col, label }: { col: "created_at" | "action" | "source"; label: string }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(col)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {filters.sortBy === col &&
          (filters.sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          ))}
      </span>
    </TableHead>
  );

  const total = (data.data as any)?.total ?? 0;
  const hasMore = (data.data as any)?.hasMore ?? false;
  const runRetention = async () => {
    try {
      const r = await fRetRun();
      toast.success(`Retention run: ${r.results.length} table(s) processed`);
      retention.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Retention run failed");
    }
  };

  return (
    <AppShell
      title="Audit history"
      subtitle="Search and export attestation, evidence, and channel changes across onboarding and offboarding."
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <Label className="text-xs">Source</Label>
                <Select value={filters.source} onValueChange={(v) => set("source", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="onboarding">Onboarding tracker / control-room</SelectItem>
                    <SelectItem value="offboarding">Offboarding comms removal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Employee ID</Label>
                <Input
                  placeholder="UUID"
                  value={filters.employeeId ?? ""}
                  onChange={(e) => set("employeeId", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Step / Task ID</Label>
                <Input
                  placeholder="UUID"
                  value={filters.taskId ?? ""}
                  onChange={(e) => set("taskId", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Assignment ID</Label>
                <Input
                  placeholder="UUID"
                  value={filters.assignmentId ?? ""}
                  onChange={(e) => set("assignmentId", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Channel</Label>
                <Input
                  placeholder="e.g. slack"
                  value={filters.channel ?? ""}
                  onChange={(e) => set("channel", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Actor (name/email)</Label>
                <Input
                  placeholder="jane@"
                  value={filters.actorSearch ?? ""}
                  onChange={(e) => set("actorSearch", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Action contains</Label>
                <Input
                  placeholder="attest"
                  value={filters.action ?? ""}
                  onChange={(e) => set("action", e.target.value.trim())}
                />
              </div>
              <div>
                <Label className="text-xs">Start date</Label>
                <Input
                  type="date"
                  value={filters.startDate ?? ""}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">End date</Label>
                <Input
                  type="date"
                  value={filters.endDate ?? ""}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={!!filters.includeArchive}
                    onCheckedChange={(v) => set("includeArchive", !!v)}
                  />
                  <Archive className="h-3 w-3" /> Include archive
                </label>
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!activeJobId}
                  onClick={() => startExport("audit_unified")}
                >
                  {activeJobId ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}{" "}
                  Export all (background)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!activeJobId}
                  onClick={() => startExport("audit_onboarding")}
                >
                  <Download className="h-3 w-3 mr-1" /> Onboarding-only CSV
                </Button>
                {activeJob.data && (
                  <span className="text-xs text-muted-foreground">
                    {(activeJob.data as any).status} · {(activeJob.data as any).progress}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Results — page {page + 1} ({(data.data as any)?.rows?.length ?? 0} of {total} on this
              page)
            </CardTitle>
            <CardDescription>
              Append-only. Click column headers to sort. Rows older than the archive window are
              moved to a cold store.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead col="created_at" label="Timestamp" />
                  <SortHead col="source" label="Source" />
                  <SortHead col="action" label="Action" />
                  <TableHead>Actor</TableHead>
                  <TableHead>Channel / Task</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((data.data as any)?.rows ?? []).map((r: any) => (
                  <TableRow key={`${r.source}-${r.id}`}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.source}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{r.action}</TableCell>
                    <TableCell className="text-xs">
                      {r.actor_name ?? r.actor_email ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.channel ?? r.task_id?.slice(0, 8) ?? "—"}
                    </TableCell>
                    <TableCell
                      className="text-[11px] max-w-md truncate"
                      title={JSON.stringify(r.details ?? r.after)}
                    >
                      {JSON.stringify(r.details ?? r.after ?? {}).slice(0, 120)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetail({ source: r.source, id: r.id })}
                        aria-label="View details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!data.isLoading && ((data.data as any)?.rows ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      No audit events match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <div className="text-xs text-muted-foreground">Page {page + 1}</div>
              <Button
                size="sm"
                variant="outline"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="recent-jobs" data-testid="recent-jobs-card">
          <CardHeader className="flex flex-row items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                Recent CSV export jobs
                <Badge
                  variant={realtimeOk ? "default" : "outline"}
                  className="gap-1"
                  data-testid="live-indicator"
                  title={realtimeOk ? "Live updates connected" : "Falling back to polling"}
                >
                  <Radio className={`h-3 w-3 ${realtimeOk ? "animate-pulse" : ""}`} />
                  {realtimeOk ? "Live" : "Polling"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Background exports run server-side and don't block the UI. Up to {50000} rows per
                job. Status updates live as jobs progress. Failed jobs can be re-run with the same
                filters.
              </CardDescription>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-xs">File retention (days)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    className="w-24"
                    data-testid="csv-retention-input"
                    value={
                      retentionDraft !== ""
                        ? retentionDraft
                        : ((csvRetention.data as any)?.retentionDays ?? "")
                    }
                    onChange={(e) => setRetentionDraft(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="csv-retention-save"
                    onClick={async () => {
                      const n = parseInt(
                        retentionDraft || String((csvRetention.data as any)?.retentionDays ?? "7"),
                        10,
                      );
                      if (!Number.isFinite(n) || n < 1 || n > 365) {
                        toast.error("Enter 1–365 days.");
                        return;
                      }
                      try {
                        await fRetSet({ data: { retentionDays: n } });
                        toast.success(`Generated CSVs now kept for ${n} day(s).`);
                        setRetentionDraft("");
                        csvRetention.refetch();
                      } catch (e: any) {
                        toast.error(e?.message ?? "Couldn't save retention setting.");
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  After this window, generated files are purged but the job record remains.
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {highlightJobId &&
              (() => {
                const j = ((jobs.data as any)?.rows ?? []).find(
                  (x: any) => x.id === highlightJobId,
                );
                if (j && j.expired) {
                  return (
                    <div
                      data-testid="expired-deeplink-banner"
                      className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium">This export's CSV has expired.</div>
                        <div className="opacity-90">
                          The file was purged on {new Date(j.expires_at).toLocaleString()} per your
                          tenant's CSV retention window. Re-run the export to generate a fresh
                          download.
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((jobs.data as any)?.rows ?? []).map((j: any) => {
                  const isHighlight = highlightJobId === j.id;
                  const inFlight = j.status === "queued" || j.status === "running";
                  return (
                    <TableRow
                      key={j.id}
                      data-testid="export-job-row"
                      data-job-id={j.id}
                      data-job-status={j.status}
                      data-job-expired={j.expired ? "true" : "false"}
                      className={isHighlight ? "bg-accent/40 ring-2 ring-primary/40" : ""}
                    >
                      <TableCell className="text-xs">
                        {new Date(j.created_at).toLocaleString()}
                        {j.attempt && j.attempt > 1 && (
                          <div
                            className="text-[10px] text-muted-foreground"
                            data-testid="job-attempt"
                          >
                            Attempt {j.attempt}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{j.job_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            j.status === "succeeded"
                              ? "default"
                              : j.status === "failed"
                                ? "destructive"
                                : "outline"
                          }
                          data-testid="job-status"
                          className={inFlight ? "animate-pulse" : ""}
                        >
                          {j.status}
                          {inFlight && typeof j.progress === "number" ? ` (${j.progress}%)` : ""}
                        </Badge>
                        {j.expired && (
                          <Badge
                            variant="outline"
                            className="ml-1 text-[10px]"
                            data-testid="job-expired-badge"
                          >
                            Expired
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {j.row_count ?? "—"}
                        {j.truncated ? " (capped)" : ""}
                      </TableCell>
                      <TableCell
                        className="text-[11px] text-muted-foreground"
                        data-testid="job-expires"
                      >
                        {j.expires_at ? new Date(j.expires_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-[11px] max-w-xs">
                        {j.status === "failed" ? (
                          <div
                            className="flex items-start gap-1 text-destructive"
                            data-testid="job-error"
                          >
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span
                              className="break-words"
                              title={j.error_message ?? "Unknown error"}
                            >
                              {j.error_message ??
                                "The export failed without an error message. Try again or narrow the filters."}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {j.status === "succeeded" && !j.expired && (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid="job-download"
                              onClick={async () => {
                                try {
                                  const r = await fJobDownload({ data: { jobId: j.id } });
                                  downloadCsv(`audit-${j.id}.csv`, r.csv);
                                } catch (e: any) {
                                  toast.error(e?.message ?? "Download failed");
                                }
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          {(j.status === "failed" || j.expired) && (
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid="job-retry"
                              disabled={!!activeJobId}
                              onClick={async () => {
                                try {
                                  const r = await fJobRetry({ data: { jobId: j.id } });
                                  setActiveJobId(r.jobId);
                                  toast.info(
                                    j.expired
                                      ? "Regenerating expired export…"
                                      : "Re-running export with the same filters.",
                                  );
                                  jobs.refetch();
                                } catch (e: any) {
                                  toast.error(e?.message ?? "Couldn't retry export");
                                }
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />{" "}
                              {j.expired ? "Regenerate" : "Retry"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-testid="job-history"
                            aria-label="Retry history"
                            onClick={() => setHistoryJobId(j.id)}
                          >
                            <History className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {((jobs.data as any)?.rows ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-4 text-xs"
                    >
                      No export jobs yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Retention &amp; archival</CardTitle>
              <CardDescription>
                Rows are immutable while active. Archived rows remain queryable; deletion only
                happens after the deletion window.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={runRetention}>
              <Play className="h-3 w-3 mr-1" /> Test run now
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {((retention.data as any)?.rows ?? []).map((p: any) => (
              <RetentionRow
                key={p.table_name}
                policy={p}
                onSave={async (patch) => {
                  try {
                    await fRetSave({ data: { ...p, ...patch } });
                    toast.success("Saved");
                    retention.refetch();
                  } catch (e: any) {
                    toast.error(e?.message ?? "Save failed");
                  }
                }}
              />
            ))}
          </CardContent>
        </Card>

        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit entry detail</DialogTitle>
              <DialogDescription>
                {detail ? `${detail.source} · ${detail.id.slice(0, 8)}` : ""}
              </DialogDescription>
            </DialogHeader>
            {detailQ.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {detailQ.error && (
              <div className="text-sm text-destructive">
                {(detailQ.error as any)?.message ?? "Failed to load"}
              </div>
            )}
            {detailQ.data &&
              (() => {
                const d: any = detailQ.data;
                return (
                  <div className="space-y-4">
                    <div className="text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Action:</span>{" "}
                        <span className="font-mono">{d.row.action}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">When:</span>{" "}
                        {new Date(d.row.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actor:</span>{" "}
                        {d.row.actor_name ?? d.row.actor_email ?? "—"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Channel:</span>{" "}
                        {d.row.channel ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-1">What changed</div>
                      {d.diff.length === 0 ? (
                        <div className="text-xs text-muted-foreground">
                          No field-level diff (single-event record).
                        </div>
                      ) : (
                        <ul className="text-xs space-y-1">
                          {d.diff.map((c: any) => (
                            <li
                              key={c.key}
                              className="border-l-2 pl-2"
                              style={{
                                borderColor:
                                  c.kind === "added"
                                    ? "var(--primary)"
                                    : c.kind === "removed"
                                      ? "hsl(var(--destructive))"
                                      : "var(--ring)",
                              }}
                            >
                              <span className="font-mono">{c.key}</span>{" "}
                              <Badge variant="outline" className="ml-1">
                                {c.kind}
                              </Badge>{" "}
                              {c.kind !== "added" && (
                                <span className="text-muted-foreground line-through mr-1">
                                  {JSON.stringify(c.from)}
                                </span>
                              )}
                              {c.kind !== "removed" && <span>{JSON.stringify(c.to)}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold mb-1">Before</div>
                        <pre className="text-[10px] bg-muted p-2 rounded max-h-64 overflow-auto">
                          {JSON.stringify(d.before ?? null, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-1">After</div>
                        <pre className="text-[10px] bg-muted p-2 rounded max-h-64 overflow-auto">
                          {JSON.stringify(d.after ?? null, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>

        <JobHistoryDialog
          jobId={historyJobId}
          onClose={() => setHistoryJobId(null)}
          fetchHistory={fHistory}
        />
      </div>
    </AppShell>
  );
}

function JobHistoryDialog({
  jobId,
  onClose,
  fetchHistory,
}: {
  jobId: string | null;
  onClose: () => void;
  fetchHistory: (args: any) => Promise<any>;
}) {
  const q = useQuery({
    queryKey: ["export-job-history", jobId],
    queryFn: () => fetchHistory({ data: { jobId: jobId! } }),
    enabled: !!jobId,
  });
  const chain = (q.data as any)?.chain ?? [];
  const audits = (q.data as any)?.audits ?? [];
  return (
    <Dialog open={!!jobId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" /> Export job retry history
          </DialogTitle>
          <DialogDescription>
            Every attempt for this export, plus the audit record for each retry.
          </DialogDescription>
        </DialogHeader>
        {q.isLoading && <div className="text-xs text-muted-foreground py-4">Loading…</div>}
        {!q.isLoading && chain.length === 0 && (
          <div className="text-xs text-muted-foreground py-4">No history for this job.</div>
        )}
        {chain.length > 0 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold mb-1">Attempts</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Attempt</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Rows</TableHead>
                    <TableHead className="text-xs">Created</TableHead>
                    <TableHead className="text-xs">Completed</TableHead>
                    <TableHead className="text-xs">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chain.map((c: any) => (
                    <TableRow key={c.id} data-testid="history-attempt-row">
                      <TableCell className="text-xs">#{c.attempt ?? 1}</TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant={
                            c.status === "succeeded"
                              ? "default"
                              : c.status === "failed"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.row_count ?? "—"}</TableCell>
                      <TableCell className="text-[11px]">
                        {new Date(c.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[11px]">
                        {c.completed_at ? new Date(c.completed_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell
                        className="text-[11px] text-destructive max-w-xs truncate"
                        title={c.error_message ?? ""}
                      >
                        {c.error_message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Retry audit log</div>
              {audits.length === 0 ? (
                <div className="text-xs text-muted-foreground">No retries recorded.</div>
              ) : (
                <div className="space-y-2">
                  {audits.map((a: any) => (
                    <div
                      key={a.id}
                      data-testid="history-audit-row"
                      className="border rounded p-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="mr-2">
                            attempt #{a.details?.attempt ?? "?"}
                          </Badge>
                          <span className="font-mono">{a.action}</span> by{" "}
                          <span className="font-mono">{a.actor_id?.slice(0, 8)}…</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Result:{" "}
                        <Badge
                          variant={
                            a.details?.result_status === "succeeded" ? "default" : "destructive"
                          }
                        >
                          {a.details?.result_status ?? "unknown"}
                        </Badge>
                        {a.details?.row_count != null && <> · {a.details.row_count} rows</>}
                        {a.details?.reason && <> · reason: {a.details.reason}</>}
                      </div>
                      <details className="mt-1">
                        <summary className="cursor-pointer text-[10px] text-muted-foreground">
                          Filters used
                        </summary>
                        <pre className="text-[10px] bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                          {JSON.stringify(a.details?.filters ?? {}, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RetentionRow({
  policy,
  onSave,
}: {
  policy: any;
  onSave: (patch: any) => void | Promise<void>;
}) {
  const [archive, setArchive] = useState(policy.archive_after_days);
  const [del, setDel] = useState(policy.delete_after_days);
  const [active, setActive] = useState(policy.is_active ?? true);
  const status = policy.last_run_status as string | null;
  return (
    <div className="grid gap-2 md:grid-cols-6 items-end border-b pb-3">
      <div className="md:col-span-2">
        <Label className="text-xs">Table</Label>
        <div className="text-sm font-mono">{policy.table_name}</div>
        {policy.last_run_at && (
          <div className="text-[10px] text-muted-foreground mt-1">
            Last run: {new Date(policy.last_run_at).toLocaleString()} ·{" "}
            <Badge
              variant={
                status === "succeeded" ? "default" : status === "failed" ? "destructive" : "outline"
              }
            >
              {status ?? "—"}
            </Badge>
            {policy.last_archived_count != null && (
              <>
                {" "}
                · archived {policy.last_archived_count}, deleted {policy.last_deleted_count ?? 0}
              </>
            )}
            {policy.last_run_error && (
              <div className="text-destructive">{policy.last_run_error}</div>
            )}
          </div>
        )}
      </div>
      <div>
        <Label className="text-xs">Archive after (days)</Label>
        <Input
          type="number"
          min={30}
          value={archive}
          onChange={(e) => setArchive(Number(e.target.value))}
        />
      </div>
      <div>
        <Label className="text-xs">Delete after (days)</Label>
        <Input
          type="number"
          min={365}
          value={del}
          onChange={(e) => setDel(Number(e.target.value))}
        />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Checkbox checked={active} onCheckedChange={(v) => setActive(!!v)} /> Active
      </label>
      <div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onSave({ archive_after_days: archive, delete_after_days: del, is_active: active })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
