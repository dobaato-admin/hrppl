import { createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/AdminGate";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listExpiringDocuments, verifyEmployeeDocument } from "@/lib/documents.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/monday";
import { FileCheck } from "lucide-react";

export const Route = createFileRoute("/org/documents/expiring")({
  // Title matches the nav label, per the W4 §7 convention.
  head: () => ({ meta: [{ title: "Expiring documents — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.documentVerification">
      <ExpiringPage />
    </AdminGate>
  ),
});

function ExpiringPage() {
  const list = useServerFn(listExpiringDocuments);
  const verify = useServerFn(verifyEmployeeDocument);
  const [rows, setRows] = useState<any[]>([]);

  async function refresh() {
    setRows((await list()).documents);
  }
  useEffect(() => {
    refresh();
  }, []);

  return (
    // W5 P2 · This page rendered with no AppShell at all, so reaching it by URL
    // gave a bare card with no sidebar and no top bar — indistinguishable from
    // a broken page. It is the one orphan that was missing chrome as well as a
    // nav entry.
    <AppShell
      title="Expiring documents"
      subtitle="Employee IDs, certificates and visas expiring within 60 days, plus anything awaiting verification."
    >
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Expiring documents & verification</CardTitle>
            <CardDescription>
              Employee-uploaded IDs, certificates and visas expiring within 60 days, plus anything
              awaiting HR verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <EmptyState
                icon={FileCheck}
                tone="done"
                title="Nothing expiring or pending"
                description="No employee document is within 60 days of expiry, and none is waiting on verification."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : "—"}
                      </TableCell>
                      <TableCell className="font-medium">{r.file_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.category}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-xs ${r.expiry_date && new Date(r.expiry_date) < new Date() ? "text-status-stuck font-medium" : ""}`}
                      >
                        {r.expiry_date ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.verification_status === "verified"
                              ? "default"
                              : r.verification_status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {r.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await verify({ data: { id: r.id, status: "verified" } });
                            toast.success("Verified");
                            refresh();
                          }}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const notes = prompt("Rejection note?") ?? "";
                            await verify({ data: { id: r.id, status: "rejected", notes } });
                            toast.success("Rejected");
                            refresh();
                          }}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
