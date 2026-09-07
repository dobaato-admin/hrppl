import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, FileText, PenLine, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, EmptyState, SkeletonRows, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderMarkdown } from "@/lib/markdown";
import { listMyPolicyTasks, acknowledgePolicy } from "@/lib/policies.functions";

export const Route = createFileRoute("/me/policies")({
  head: () => ({ meta: [{ title: "Policies to sign — hrppl" }] }),
  component: MyPoliciesPage,
});

function MyPoliciesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyPolicyTasks);
  const signFn = useServerFn(acknowledgePolicy);

  const [reading, setReading] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-policy-tasks"],
    queryFn: () => listFn(),
  });

  const tasks: any[] = data?.tasks ?? [];
  const outstanding = tasks.filter((t) => !t.acknowledged_at);
  const signed = tasks.filter((t) => t.acknowledged_at);

  async function sign() {
    if (!reading) return;
    if (signature.trim().length < 2) {
      toast.error("Type your full name to sign");
      return;
    }
    setBusy(true);
    try {
      const res = await signFn({
        data: { acknowledgement_id: reading.id, signature_name: signature.trim() },
      });
      toast.success(res.alreadySigned ? "Already signed" : "Signed — thank you");
      setReading(null);
      setSignature("");
      qc.invalidateQueries({ queryKey: ["my-policy-tasks"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not record your signature");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Policies to sign">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <SkeletonRows rows={4} />
        </div>
      </AppShell>
    );
  }

  if (data?.noEmployeeRecord) {
    return (
      <AppShell title="Policies to sign">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <EmptyState
            icon={ShieldCheck}
            tone="pending"
            title="No employee record"
            description="Policy acknowledgements belong to an employee. Platform accounts have no employee record, so there is nothing here for this login."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Policies to sign"
      subtitle="Read each one, then sign to confirm you have understood it"
    >
      <section className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
        <SectionCard
          tone={outstanding.length ? "primary" : "done"}
          title={outstanding.length ? `${outstanding.length} to read` : "Nothing outstanding"}
          description={
            outstanding.length
              ? "Signing records the version you read, so you will be asked again if a policy is materially revised."
              : "You are up to date with every policy assigned to you."
          }
        >
          {outstanding.length === 0 && signed.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No policies assigned"
              description="Your organisation has not asked you to sign anything yet."
            />
          ) : (
            <ul className="space-y-2">
              {outstanding.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.policy_documents?.title}</div>
                    <div className="text-xs text-muted-foreground">
                      v{t.policy_version}
                      {t.due_date && ` · due ${t.due_date}`}
                      {t.policy_documents?.summary && ` · ${t.policy_documents.summary}`}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setReading(t)}>
                    <PenLine className="mr-1 h-4 w-4" /> Read &amp; sign
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {signed.length > 0 && (
          <SectionCard title="Signed" description="Your record of what you have accepted.">
            <ul className="space-y-2">
              {signed.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.policy_documents?.title}</div>
                    <div className="text-xs text-muted-foreground">
                      v{t.policy_version} · signed as {t.signature_name} on{" "}
                      {new Date(t.acknowledged_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setReading(t)}>
                    Re-read
                  </Button>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </section>

      <Dialog
        open={!!reading}
        onOpenChange={(v) => {
          if (!v) {
            setReading(null);
            setSignature("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{reading?.policy_documents?.title}</DialogTitle>
          </DialogHeader>
          {reading && (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Version {reading.policy_version}</Badge>
                {reading.acknowledged_at && <StatusChip tone="done">Signed</StatusChip>}
              </div>
              <div
                className="prose-sm max-h-[45vh] max-w-none overflow-auto rounded-lg border p-4"
                // renderMarkdown escapes before converting — src/lib/markdown.ts.
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(reading.policy_documents?.body_md ?? ""),
                }}
              />
              {!reading.acknowledged_at && (
                <div className="space-y-2">
                  <Label htmlFor="sig">Type your full name to sign</Label>
                  <Input
                    id="sig"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Your full name"
                  />
                  <p className="text-xs text-muted-foreground">
                    This records that you read version {reading.policy_version}. Only you can sign
                    it — nobody else can record this on your behalf.
                  </p>
                </div>
              )}
            </>
          )}
          <DialogFooter>
            {reading?.acknowledged_at ? (
              <Button onClick={() => setReading(null)}>Close</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setReading(null)}>
                  Not yet
                </Button>
                <Button onClick={sign} disabled={busy}>
                  {busy ? "Signing…" : "I have read and understood this"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
