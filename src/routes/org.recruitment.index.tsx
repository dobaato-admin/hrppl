import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecruitmentJobs, upsertRecruitmentJob } from "@/lib/recruitment.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/org/recruitment/")({
  component: JobsPage,
});

const STATUS: Record<string,string> = {
  draft: "bg-muted text-muted-foreground", open: "bg-status-done/20 text-status-done",
  paused: "bg-status-pending/20 text-status-pending", closed: "bg-muted text-muted-foreground",
  filled: "bg-primary/20 text-primary",
};

function JobsPage() {
  const list = useServerFn(listRecruitmentJobs);
  const upsert = useServerFn(upsertRecruitmentJob);
  const [jobs, setJobs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [job, setJob] = useState<any>({ title: "", status: "draft", currency: "AUD", employment_type: "full_time" });

  async function refresh() { const r = await list(); setJobs(r.jobs); }
  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!job.title.trim()) return toast.error("Title required");
    try {
      await upsert({ data: { ...job, salary_min: job.salary_min ? Number(job.salary_min) : null, salary_max: job.salary_max ? Number(job.salary_max) : null } });
      toast.success("Saved");
      setOpen(false); setJob({ title: "", status: "draft", currency: "AUD", employment_type: "full_time" });
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Open roles</CardTitle>
            <CardDescription>Publish to your careers page and start sourcing.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/careers" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" /> Careers page</a></Button>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> New role</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {jobs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No roles yet</TableCell></TableRow>}
              {jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium"><Link to="/org/recruitment/$jobId" params={{ jobId: j.id }} className="hover:underline">{j.title}</Link></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{j.location ?? "—"}</TableCell>
                  <TableCell className="text-sm">{j.employment_type ?? "—"}</TableCell>
                  <TableCell><Badge className={STATUS[j.status]+" border-0 capitalize"}>{j.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild><Link to="/org/recruitment/$jobId" params={{ jobId: j.id }}>Pipeline →</Link></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New role</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Job title</Label><Input value={job.title} onChange={(e) => setJob({...job, title: e.target.value})} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Location</Label><Input value={job.location ?? ""} onChange={(e) => setJob({...job, location: e.target.value})} placeholder="Sydney / Remote" /></div>
              <div><Label>Employment type</Label>
                <Select value={job.employment_type ?? "full_time"} onValueChange={(v) => setJob({...job, employment_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full time</SelectItem>
                    <SelectItem value="part_time">Part time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salary min</Label><Input type="number" value={job.salary_min ?? ""} onChange={(e) => setJob({...job, salary_min: e.target.value})} /></div>
              <div><Label>Salary max</Label><Input type="number" value={job.salary_max ?? ""} onChange={(e) => setJob({...job, salary_max: e.target.value})} /></div>
              <div><Label>Currency</Label><Input value={job.currency ?? "AUD"} onChange={(e) => setJob({...job, currency: e.target.value.toUpperCase()})} /></div>
              <div><Label>Status</Label>
                <Select value={job.status} onValueChange={(v) => setJob({...job, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open (publish)</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description (HTML)</Label><Textarea rows={4} value={job.description_html ?? ""} onChange={(e) => setJob({...job, description_html: e.target.value})} /></div>
            <div><Label>Requirements (HTML)</Label><Textarea rows={3} value={job.requirements_html ?? ""} onChange={(e) => setJob({...job, requirements_html: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
