import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, PackageCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { previewProvisioning, provisionEmployee } from "@/lib/provisioning.functions";

/**
 * Phase 3 provisioning, as an action on the onboarding tracker.
 *
 * Shows the plan before running it, because the operator is about to create
 * dated obligations for a real person and should see the seven courses and four
 * policies first. The blocked step (KPI assignment) is displayed rather than
 * omitted — a step that quietly does nothing is worse than a step that says why
 * it cannot.
 */
export function ProvisionButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const qc = useQueryClient();
  const previewFn = useServerFn(previewProvisioning);
  const runFn = useServerFn(provisionEmployee);
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function openPreview() {
    setBusy(true);
    setResult(null);
    try {
      const p = await previewFn({ data: { employee_id: employeeId } });
      setPlan(p);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not read the provisioning plan");
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    setBusy(true);
    try {
      const res = await runFn({ data: { employee_id: employeeId } });
      setResult(res);
      qc.invalidateQueries({ queryKey: ["onboarding-tracker"] });
      qc.invalidateQueries({ queryKey: ["policy-compliance"] });
      toast.success(
        `Enrolled in ${res.training.enrolled} course(s), ${res.policies.assigned} policy task(s)`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Provisioning failed", { duration: 9000 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="ghost" disabled={busy} onClick={openPreview}>
        <Sparkles className="mr-1 h-3.5 w-3.5" /> Provision
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Provision {employeeName || "this employee"}</DialogTitle>
          </DialogHeader>

          {plan && !result && (
            <div className="space-y-4 text-sm">
              <section>
                <div className="font-medium">Mandatory training</div>
                {plan.coursesToEnrol.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {plan.courses.length === 0
                      ? "No courses are marked mandatory yet."
                      : "Already enrolled in every mandatory course."}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {plan.coursesToEnrol.map((c: any) => (
                      <li key={c.id}>• {c.title}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <div className="font-medium">Policies to sign</div>
                {plan.policiesToAssign.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {plan.policies.length === 0
                      ? "No signable policies published yet."
                      : "Already holds the current version of every policy."}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {plan.policiesToAssign.map((p: any) => (
                      <li key={p.id}>
                        • {p.title} <Badge variant="outline">v{p.version}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <div className="font-medium">Assets</div>
                <p className="text-xs text-muted-foreground">
                  {plan.assetCandidates.length} item(s) available to issue. Assigning a laptop is a
                  physical handover, so it stays a deliberate act on{" "}
                  <span className="font-medium">/admin/assets</span> rather than something this
                  fabricates.
                </p>
              </section>

              {plan.blocked.map((b: any) => (
                <section key={b.step} className="rounded-lg border border-dashed p-3">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    {b.step} — not automated
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.reason}</p>
                </section>
              ))}
            </div>
          )}

          {result && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <PackageCheck className="h-4 w-4 text-primary" /> Done
              </div>
              <p className="text-xs text-muted-foreground">
                {result.training.enrolled} course enrolment(s) created
                {result.training.alreadyEnrolled > 0 &&
                  ` (${result.training.alreadyEnrolled} already in place)`}
                , {result.policies.assigned} policy acknowledgement(s) assigned.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button onClick={run} disabled={busy}>
                {busy ? "Provisioning…" : "Run provisioning"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
