import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  listMyDocuments,
  registerMyDocument,
  createMyDocumentDownloadUrl,
  deleteMyDocument,
} from "@/lib/me.functions";
import { SectionCard, EmptyState, SkeletonRows } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Trash2, Upload, FolderOpen, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export const Route = createFileRoute("/me/documents")({
  head: () => ({ meta: [{ title: "Documents — hrppl" }] }),
  component: MeDocuments,
});

const DOC_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's licence" },
  { value: "citizenship_certificate", label: "Citizenship certificate" },
  { value: "id", label: "Other ID card" },
  { value: "visa", label: "Visa / work permit" },
  { value: "certificate", label: "Certificate" },
  { value: "tax_form", label: "Tax form" },
  { value: "other", label: "Other" },
];

const ID_DOC_TYPES = new Set(["passport", "drivers_license", "citizenship_certificate", "id"]);

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

function fmtBytes(n?: number | null) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function MeDocuments() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyDocuments);
  const regFn = useServerFn(registerMyDocument);
  const dlFn = useServerFn(createMyDocumentDownloadUrl);
  const delFn = useServerFn(deleteMyDocument);

  const { data, isLoading } = useQuery({ queryKey: ["me-documents"], queryFn: () => listFn({}) });

  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<string>("other");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  async function handleUpload(file: File) {
    if (!data?.employeeId || !data?.tenantId) return;
    if (file.size > MAX_SIZE) { toast.error("Max 25 MB"); return; }
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
      const path = `${data.tenantId}/${data.employeeId}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from("employee-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      await regFn({
        data: {
          doc_type: docType as any,
          file_path: path,
          file_name: file.name,
          mime_type: file.type || undefined,
          size_bytes: file.size,
          notes: notes || undefined,
        },
      });
      toast.success("Uploaded");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["me-documents"] });
      qc.invalidateQueries({ queryKey: ["me-overview"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const downloadM = useMutation({
    mutationFn: (id: string) => dlFn({ data: { id } }),
    onSuccess: (r) => { window.open(r.url, "_blank"); },
    onError: (e: any) => toast.error(e?.message ?? "Could not generate download link"),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Document deleted");
      qc.invalidateQueries({ queryKey: ["me-documents"] });
      qc.invalidateQueries({ queryKey: ["me-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const hasIdDoc = (data?.documents ?? []).some((d: any) => ID_DOC_TYPES.has(d.doc_type));

  return (
    <div className="space-y-4">
      {!isLoading && !hasIdDoc && (
        <Alert className="border-status-warning/40 bg-status-warning/10">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          <AlertTitle>Upload a photo ID</AlertTitle>
          <AlertDescription>
            Please upload at least one identity document — passport, driver's licence, citizenship certificate, or other government-issued ID. This is needed to verify your employment. We'll send a reminder if it's still missing in a week.
          </AlertDescription>
        </Alert>
      )}
      <SectionCard title="Upload a document" description="Stored privately. Only you and your HR admin can see these." tone="primary">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Document type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} placeholder="e.g. Renewed in 2026" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="me-doc-file">File</Label>
            <input
              id="me-doc-file"
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <Button type="button" disabled={uploading || !data?.employeeId} onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Choose file"}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Max 25 MB. PDF, images, and Office documents supported.</p>
      </SectionCard>

      <SectionCard title="Your documents" description={data ? `${data.documents.length} file${data.documents.length === 1 ? "" : "s"}` : undefined}>
        {isLoading ? (
          <SkeletonRows rows={4} />
        ) : !data?.documents.length ? (
          <EmptyState icon={FolderOpen} title="No documents yet" description="Upload your contract, ID, or other personal documents to keep them in one place." />
        ) : (
          <ul className="divide-y">
            {data.documents.map((d: any) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.file_name}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{(d.doc_type || "other").replace("_", " ")}</Badge>
                      <span>{fmtBytes(d.size_bytes)}</span>
                      <span>· {fmtDate(d.created_at)}</span>
                      {d.notes && <span className="truncate">· {d.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => downloadM.mutate(d.id)} disabled={downloadM.isPending}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Download
                  </Button>
                  <Button size="sm" variant="ghost" className="text-status-stuck hover:text-status-stuck"
                    onClick={() => setConfirmDelete({ id: d.id, name: d.file_name })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.name}" will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (confirmDelete) deleteM.mutate(confirmDelete.id); setConfirmDelete(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
