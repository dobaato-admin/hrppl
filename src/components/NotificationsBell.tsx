import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listNotifications, markNotificationRead } from "@/lib/notifications.functions";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/**
 * Cached across mounts, deliberately.
 *
 * This bell lives in the AppShell header, and AppShell is rendered per-route
 * rather than once at the root — so every navigation unmounts and remounts the
 * entire header. With a raw useEffect + useState that meant one unconditional
 * `listNotifications` POST per navigation, each one two Supabase round-trips,
 * plus a fresh 60s interval that restarted from zero and therefore rarely got
 * to fire. Clicking around the app produced a steady stream of identical
 * requests.
 *
 * TanStack Query fixes it because the QueryClient is hoisted to __root.tsx and
 * survives the remount: a navigation now reads the cache. The key is scoped by
 * user so switching accounts cannot show the previous user's notifications.
 *
 * refetchInterval keeps the poll alive at the client level rather than the
 * component level, so it ticks on schedule instead of being reset by
 * navigation. /notifications polls the same server fn under its own key; both
 * now share this cache entry for the unread badge.
 */
const NOTIFICATIONS_POLL_MS = 60_000;

export function NotificationsBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listNotifications);
  const mark = useServerFn(markNotificationRead);
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications-bell", user?.id],
    enabled: !!user,
    queryFn: async () => ((await list())?.notifications ?? []) as Notification[],
    // Under the poll interval, so a remount mid-cycle serves the cache instead
    // of refetching.
    staleTime: NOTIFICATIONS_POLL_MS,
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const items = data ?? [];

  const unread = items.filter((n) => !n.read_at).length;

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next && unread > 0) {
      try {
        await mark({ data: { all: true } });
        // Update the cache rather than local state — local state would be
        // discarded on the next navigation and the badge would reappear.
        qc.setQueryData<Notification[]>(["notifications-bell", user?.id], (prev) =>
          (prev ?? []).map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
        );
        qc.invalidateQueries({ queryKey: ["notifications-inbox"] });
      } catch { /* ignore */ }
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-[1.25rem] justify-center px-1 text-[10px]"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2 text-sm font-medium flex items-center justify-between">
          <span>Notifications</span>
          <Link to={"/notifications" as any} onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="max-h-96 overflow-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            items.map((n) => {
              const content = (
                <div className={`px-3 py-2 text-sm ${n.read_at ? "opacity-70" : "bg-muted/40"}`}>
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              );
              return (
                <div key={n.id} className="border-b border-border last:border-0">
                  {n.link ? (
                    <Link to={n.link as any} onClick={() => setOpen(false)} className="block hover:bg-accent">
                      {content}
                    </Link>
                  ) : content}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
