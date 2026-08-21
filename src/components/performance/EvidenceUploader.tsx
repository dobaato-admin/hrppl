import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export type EvidenceType = "document" | "url" | "social" | "screenshot";
export interface EvidenceItem {
  type: EvidenceType;
  name: string;
  url: string;
  size?: number;
  mime?: string;
  preview?: string;
}

interface Props {
  value: EvidenceItem[];
  onChange: (v: EvidenceItem[]) => void;
  allowedTypes?: EvidenceType[];
  requiredTypes?: EvidenceType[];
  minCount?: number;
  maxSizeMB?: number;
  /** dataURL accepted (offline preview) when no upload target exists. */
}

const DOC_MIME = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv"];
const IMG_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function EvidenceUploader({
  value, onChange,
  allowedTypes = ["document","url","social","screenshot"],
  requiredTypes = [],
  minCount = 0,
  maxSizeMB = 10,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlType, setUrlType] = useState<EvidenceType>("url");
  const fileRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  const allowDoc = allowedTypes.includes("document");
  const allowUrl = allowedTypes.includes("url");
  const allowSocial = allowedTypes.includes("social");
  const allowShot = allowedTypes.includes("screenshot");

  const haveTypes = new Set(value.map((v) => v.type));
  const missingReq = requiredTypes.filter((t) => !haveTypes.has(t));
  const shortBy = Math.max(0, minCount - value.length);

  const ingestFiles = useCallback(async (files: FileList | File[], asType: EvidenceType) => {
    const max = maxSizeMB * 1024 * 1024;
    const out: EvidenceItem[] = [];
    for (const f of Array.from(files)) {
      if (f.size > max) { toast.error(`${f.name}: exceeds ${maxSizeMB} MB`); continue; }
      if (asType === "document" && !DOC_MIME.includes(f.type) && !IMG_MIME.includes(f.type)) {
        toast.error(`${f.name}: file type not allowed`); continue;
      }
      if (asType === "screenshot" && !IMG_MIME.includes(f.type)) {
        toast.error(`${f.name}: screenshots must be an image (PNG/JPG/WEBP)`); continue;
      }
      const preview = IMG_MIME.includes(f.type) ? await readDataUrl(f) : undefined;
      // Screenshot dimension sanity check
      if (asType === "screenshot" && preview) {
        const ok = await checkImage(preview);
        if (!ok) { toast.error(`${f.name}: image could not be decoded`); continue; }
      }
      out.push({ type: asType, name: f.name, url: preview ?? "", size: f.size, mime: f.type, preview });
    }
    if (out.length) onChange([...value, ...out]);
  }, [maxSizeMB, value, onChange]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    if (!allowDoc && !allowShot) { toast.error("Files not allowed"); return; }
    const isImg = Array.from(e.dataTransfer.files).every((f) => IMG_MIME.includes(f.type));
    ingestFiles(e.dataTransfer.files, isImg && allowShot ? "screenshot" : "document");
  }

  function addUrl() {
    if (!urlDraft.trim()) return;
    try {
      const u = new URL(urlDraft);
      const isSocial = /linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|tiktok\.com|youtube\.com/i.test(u.hostname);
      const t: EvidenceType = isSocial && allowSocial ? "social" : "url";
      if (!allowedTypes.includes(t)) { toast.error(`${t} URLs are not allowed`); return; }
      onChange([...value, { type: t, name: u.hostname + u.pathname.slice(0, 40), url: u.toString() }]);
      setUrlDraft("");
    } catch { toast.error("Invalid URL"); }
  }

  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-md border-2 border-dashed p-4 text-center text-sm transition ${dragOver ? "bg-muted" : "bg-background"}`}
      >
        <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
        <div>Drag &amp; drop files here, or use the buttons below</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Max {maxSizeMB} MB · Allowed: {allowedTypes.join(", ")}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {allowDoc && (
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <FileText className="mr-1 h-4 w-4" /> Document
            </Button>
          )}
          {allowShot && (
            <Button type="button" size="sm" variant="outline" onClick={() => screenshotRef.current?.click()}>
              <ImageIcon className="mr-1 h-4 w-4" /> Screenshot
            </Button>
          )}
        </div>
        <input ref={fileRef} type="file" multiple className="hidden"
          accept={[...DOC_MIME, ...IMG_MIME].join(",")}
          onChange={(e) => e.target.files && ingestFiles(e.target.files, "document")} />
        <input ref={screenshotRef} type="file" multiple className="hidden"
          accept={IMG_MIME.join(",")}
          onChange={(e) => e.target.files && ingestFiles(e.target.files, "screenshot")} />
      </div>

      {(allowUrl || allowSocial) && (
        <div className="flex gap-2">
          <Input placeholder="https://… (link or social post)" value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())} />
          <Button type="button" size="sm" onClick={addUrl}>
            <LinkIcon className="mr-1 h-4 w-4" /> Add link
          </Button>
        </div>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((e, i) => (
            <li key={i} className="flex items-center gap-2 rounded border p-2 text-sm">
              {e.preview ? (
                <img src={e.preview} alt={e.name} className="h-10 w-10 rounded object-cover" />
              ) : e.type === "url" || e.type === "social" ? (
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{e.name}</div>
                {e.url && (e.type === "url" || e.type === "social") && (
                  <a href={e.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">{e.url}</a>
                )}
              </div>
              <Badge variant="secondary">{e.type}</Badge>
              <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {(missingReq.length > 0 || shortBy > 0) && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {shortBy > 0 && <div>Need {shortBy} more evidence item(s) (min {minCount}).</div>}
          {missingReq.length > 0 && <div>Missing required type(s): {missingReq.join(", ")}.</div>}
        </div>
      )}
    </div>
  );
}

function readDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(f);
  });
}
function checkImage(dataUrl: string): Promise<boolean> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img.width > 10 && img.height > 10);
    img.onerror = () => res(false);
    img.src = dataUrl;
  });
}
