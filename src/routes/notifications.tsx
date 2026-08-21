import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCheck, Download, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { listNotifications, markNotificationRead, markNotificationUnread } from "@/lib/notifications.functions";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — HRPPL" }] }),
  component: Page,
});

const PAGE_SIZE = 25;

function Page() {
  const fList = useServerFn(listNotifications);
  const fMark = useServerFn(markNotificationRead);
  const fUnmark = useServerFn(markNotificationUnread);

  const [unreadOnly, setUnreadOnly] = useState<"all" | "unread">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "unread_first" | "job_id">("newest");
  const [page, setPage] = useState(0);

  const filters = {
    unreadOnly: unreadOnly === "unread",
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
    sortBy,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const q = useQuery({
    queryKey: ["notifications-inbox", filters],
    queryFn: () => fList({ data: filters }),
    refetchInterval: 30_000,
  });

  const items = (q.data?.notifications ?? []) as any[];
  const total = q.data?.total ?? 0;
  const unreadTotal = q.data?.unreadTotal ?? 0;
  const hasMore = (page + 1) * PAGE_SIZE < total;
  const visibleUnreadIds = items.filter((n) => !n.read_at).map((n) => n.id);

  const reset = (k: () => void) => { k(); setPage(0); };

  const markOne = async (id: string) => {
    try { await fMark({ data: { id } }); q.refetch(); } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };
  const markAllUnread = async () => {
    try { await fMark({ data: { all: true } }); toast.success("Marked all as read"); q.refetch(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };
  const markVisible = async () => {
    if (visibleUnreadIds.length === 0) return;
    const idsSnapshot = [...visibleUnreadIds];
    try {
      await fMark({ data: { ids: idsSnapshot } });
      q.refetch();
      // Undo snackbar: 6s window to revert. Sonner auto-dismiss handles the timer.
      toast.success(`Marked ${idsSnapshot.length} as read`, {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await fUnmark({ data: { ids: idsSnapshot } });
              toast.success(`Restored ${idsSnapshot.length} to unread`);
              q.refetch();
            } catch (e: any) { toast.error(e?.message ?? "Couldn't undo"); }
          },
        },
      });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };

  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); };

  return (
    <AppShell title="Notifications" subtitle="Background job completions, reminders, and system alerts.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm" data-testid="inbox-title">
              Inbox {unreadTotal > 0 && <Badge variant="destructive" className="ml-2" data-testid="inbox-unread-badge">{unreadTotal} unread</Badge>}
            </CardTitle>
            <CardDescription>CSV export completions link directly to the Recent jobs panel for one-click download.</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={markVisible} disabled={visibleUnreadIds.length === 0} data-testid="mark-visible-read">
              <CheckCheck className="h-3 w-3 mr-1" /> Mark visible read ({visibleUnreadIds.length})
            </Button>
            <Button size="sm" variant="outline" onClick={markAllUnread} disabled={unreadTotal === 0} data-testid="mark-all-read">
              <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={"/admin/audit-history" as any}><Download className="h-3 w-3 mr-1" /> Recent export jobs</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-6 mb-4 pb-4 border-b">
            <form onSubmit={submitSearch} className="md:col-span-2">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  className="pl-7"
                  placeholder="Export name, job id, evidence type…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  data-testid="filter-search"
                />
              </div>
            </form>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={unreadOnly} onValueChange={(v) => reset(() => setUnreadOnly(v as any))}>
                <SelectTrigger data-testid="filter-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All notifications</SelectItem>
                  <SelectItem value="unread">Unread only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={startDate} onChange={(e) => reset(() => setStartDate(e.target.value))} data-testid="filter-start" />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={endDate} onChange={(e) => reset(() => setEndDate(e.target.value))} data-testid="filter-end" />
            </div>
            <div>
              <Label className="text-xs">Sort</Label>
              <Select value={sortBy} onValueChange={(v) => reset(() => setSortBy(v as any))}>
                <SelectTrigger data-testid="filter-sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="unread_first">Unread first</SelectItem>
                  <SelectItem value="job_id">By export job id</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end md:col-span-6">
              <Button size="sm" variant="ghost" onClick={() => {
                setUnreadOnly("all"); setStartDate(""); setEndDate(""); setSearch(""); setSearchInput(""); setSortBy("newest"); setPage(0);
              }}>
                Clear filters
              </Button>
              {search && <Badge variant="secondary" className="ml-2">Search: "{search}"</Badge>}
            </div>
          </div>

          <div className="divide-y">
            {q.isLoading && <div className="py-6 text-sm text-muted-foreground text-center">Loading…</div>}
            {!q.isLoading && items.length === 0 && (
              <div className="py-10 text-sm text-muted-foreground text-center" data-testid="inbox-empty">
                {unreadOnly === "unread" || startDate || endDate || search ? "No notifications match these filters." : "You're all caught up."}
              </div>
            )}
            {items.map((n) => {
              const isExport = (n.kind ?? "").includes("csv_export") || (n.title ?? "").toLowerCase().includes("export");
              const link = n.link || (isExport ? "/admin/audit-history" : null);
              return (
                <div key={n.id} data-testid="notification-row" className={`py-3 px-1 flex items-start justify-between gap-3 ${n.read_at ? "opacity-70" : ""}`}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {!n.read_at && <span className="h-2 w-2 rounded-full bg-primary inline-block" aria-label="unread" />}
                      {n.title}
                      {isExport && <Badge variant="outline" className="text-[10px]">CSV export</Badge>}
                    </div>
                    {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {link && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={link as any} data-testid="notification-link"><ExternalLink className="h-3 w-3" /></Link>
                      </Button>
                    )}
                    {!n.read_at && (
                      <Button size="sm" variant="ghost" onClick={() => markOne(n.id)} aria-label="Mark as read" data-testid="mark-one-read">
                        <CheckCheck className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} data-testid="page-prev">
              Previous
            </Button>
            <div className="text-xs text-muted-foreground" data-testid="page-info">
              Page {page + 1} · showing {items.length} of {total}
            </div>
            <Button size="sm" variant="outline" disabled={!hasMore} onClick={() => setPage((p) => p + 1)} data-testid="page-next">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
