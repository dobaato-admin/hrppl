import { createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/AdminGate";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { listLeads, updateLeadStatus } from "@/lib/leads.functions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/leads")({
  head: () => ({ meta: [{ title: "Leads — hrppl admin" }] }),
  component: () => (
    <AdminGate feature="platform.admin">
      <LeadsPage />
    </AdminGate>
  ),
});

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

function LeadsPage() {
  const fetchLeads = useServerFn(listLeads);
  const update = useServerFn(updateLeadStatus);
  const qc = useQueryClient();

  const {
    data: leads = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["platform-leads"],
    queryFn: () => fetchLeads(),
  });

  const mut = useMutation({
    mutationFn: (vars: { id: string; status: (typeof STATUSES)[number] }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["platform-leads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell title="Inbound leads">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Leads submitted from the public hrppl.io landing page. Newest first, last 500 records.
        </p>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load leads"}
          </div>
        )}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Current system</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                    No leads yet.
                  </TableCell>
                </TableRow>
              )}
              {leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(l.created_at as string).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {l.full_name}
                    {l.role && <div className="text-xs text-muted-foreground">{l.role}</div>}
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${l.work_email}`} className="text-primary hover:underline">
                      {l.work_email}
                    </a>
                  </TableCell>
                  <TableCell>{l.company}</TableCell>
                  <TableCell>{l.country ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{l.company_size ?? "—"}</Badge>
                    {l.employee_count != null && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {l.employee_count} emp
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{l.current_payroll_system ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={(l.status as string) ?? "new"}
                      onValueChange={(v) =>
                        mut.mutate({ id: l.id as string, status: v as (typeof STATUSES)[number] })
                      }
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
