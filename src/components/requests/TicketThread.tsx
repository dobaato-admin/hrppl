import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SkeletonRows } from "@/components/monday";
import { useAuth } from "@/hooks/use-auth";
import { can, type AppRole } from "@/lib/rbac";
import { addTicketComment, listTicketComments } from "@/lib/support-tickets.functions";
import { MessageSquare, Lock } from "lucide-react";

/**
 * The conversation on a support ticket.
 *
 * `addTicketComment` and `listTicketComments` were built, tested by RLS, and
 * called by nothing: a ticket could be raised and decided, but the two people
 * involved could not exchange a single word about it. The decision notes field
 * is one-way and only exists at the moment of deciding, so "what size?" or
 * "which cost centre?" had no home at all — the request just sat there.
 *
 * **One component, used from both sides**, for the same reason `RequestList` is:
 * `/admin/requests` (the approver asking) and `/me/requests` (the requester
 * answering) are two views of one conversation, and two implementations of it
 * would drift into disagreeing about what was said.
 *
 * ---------------------------------------------------------------------------
 * Internal notes
 * ---------------------------------------------------------------------------
 *
 * A comment can be marked `is_internal` — visible to approvers, not to the
 * person who raised the ticket. **The database enforces that**, in
 * `support_ticket_comments_view`; this component does not filter, it only
 * decides whether to offer the toggle. Filtering here as well would put the
 * same rule in two places and let them drift.
 *
 * The toggle is gated on `org.ticketInternalNotes`, which mirrors that policy
 * exactly rather than reusing `org.requests`. The two differ: `hr`, `finance`
 * and `branch_admin` reach this queue but cannot read an internal note back, so
 * offering them the toggle would let them write into a void.
 */
export function TicketThread({
  ticketId,
  subject,
  trigger,
}: {
  ticketId: string;
  subject: string;
  /** Defaults to a compact "Discuss" button. */
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const { roles } = useAuth();
  const qc = useQueryClient();

  const mayPostInternal = can("org.ticketInternalNotes", roles as readonly AppRole[]);

  const fetchComments = useServerFn(listTicketComments);
  const commentsQ = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => fetchComments({ data: { ticket_id: ticketId } }),
    // Only once the thread is actually opened: the queue can hold hundreds of
    // tickets and none of them needs its conversation until someone looks.
    enabled: open,
  });

  const post = useServerFn(addTicketComment);
  const postM = useMutation({
    mutationFn: (d: { ticket_id: string; body: string; is_internal: boolean }) => post({ data: d }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not post the comment"),
  });

  const comments = commentsQ.data?.comments ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost">
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Discuss
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate">{subject}</DialogTitle>
          <DialogDescription>
            {mayPostInternal
              ? "Replies are visible to the requester unless you mark them internal."
              : "Everyone involved in this request can see what you write here."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {commentsQ.isLoading ? (
            <SkeletonRows rows={3} />
          ) : comments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No messages yet. Ask a question or add context.
            </p>
          ) : (
            comments.map((c: any) => (
              <div
                key={c.id}
                className={`rounded-md border p-3 text-sm ${
                  c.is_internal ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/40"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium">{c.author_label}</span>
                  {c.is_internal ? (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Lock className="h-2.5 w-2.5" />
                      Internal
                    </Badge>
                  ) : null}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            rows={3}
            placeholder="Write a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center gap-3">
            {mayPostInternal ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                Internal note — the requester will not see this
              </label>
            ) : null}
            <Button
              size="sm"
              className="ml-auto"
              disabled={!body.trim() || postM.isPending}
              onClick={() =>
                postM.mutate({
                  ticket_id: ticketId,
                  body: body.trim(),
                  is_internal: mayPostInternal && internal,
                })
              }
            >
              {postM.isPending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
