import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listExpiringDocuments, verifyEmployeeDocument } from "@/lib/documents.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/org/documents/expiring")({
  head: () => ({ meta: [{ title: "Document verification — hrppl" }] }),
  component: ExpiringPage,
});

function ExpiringPage() {
  const list = useServerFn(listExpiringDocuments);
  const verify = useServerFn(verifyEmployeeDocument);
  const [rows, setRows] = useState<any[]>([]);

  async function refresh() { setRows((await list()).documents); }
  useEffect(() => { refresh(); }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiring documents & verification</CardTitle>
        <CardDescription>Employee-uploaded IDs, certificates and visas expiring within 60 days, plus anything awaiting HR verification.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead><TableHead>Document</TableHead>
              <TableHead>Category</TableHead><TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-muted-foreground">Nothing expiring or pending.</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : "—"}</TableCell>
                <TableCell className="font-medium">{r.file_name}</TableCell>
                <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                <TableCell className={`text-xs ${r.expiry_date && new Date(r.expiry_date) < new Date() ? "text-status-stuck font-medium" : ""}`}>
                  {r.expiry_date ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={r.verification_status === "verified" ? "default" : r.verification_status === "rejected" ? "destructive" : "secondary"}>
                    {r.verification_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={async () => {
                    await verify({ data: { id: r.id, status: "verified" } });
                    toast.success("Verified"); refresh();
                  }}>Verify</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    const notes = prompt("Rejection note?") ?? "";
                    await verify({ data: { id: r.id, status: "rejected", notes } });
                    toast.success("Rejected"); refresh();
                  }}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
