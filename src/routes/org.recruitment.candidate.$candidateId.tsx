import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getCandidate,
  scheduleInterview,
  submitScorecard,
  addCandidateNote,
  createOffer,
  updateOfferStatus,
  convertCandidateToEmployee,
} from "@/lib/recruitment.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Star, MessageSquare, FileText, Send } from "lucide-react";

export const Route = createFileRoute("/org/recruitment/candidate/$candidateId")({
  component: CandidatePage,
});

function CandidatePage() {
  const { candidateId } = useParams({ from: "/org/recruitment/candidate/$candidateId" });
  const get = useServerFn(getCandidate);
  const sched = useServerFn(scheduleInterview);
  const score = useServerFn(submitScorecard);
  const note = useServerFn(addCandidateNote);
  const off = useServerFn(createOffer);
  const offStatus = useServerFn(updateOfferStatus);
  const hire = useServerFn(convertCandidateToEmployee);

  const [data, setData] = useState<any | null>(null);
  const [iv, setIv] = useState({
    title: "Phone screen",
    scheduled_at: "",
    duration_minutes: 30,
    mode: "video" as const,
    location: "",
  });
  const [sc, setSc] = useState({
    overall_rating: 4,
    recommendation: "yes" as const,
    strengths: "",
    concerns: "",
  });
  const [noteText, setNoteText] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState({
    job_title: "",
    base_salary: 0,
    currency: "AUD",
    start_date: "",
  });
  const [hireOpen, setHireOpen] = useState(false);
  const [hireForm, setHireForm] = useState({
    employee_number: "",
    job_title: "",
    employment_type: "full_time" as const,
    hire_date: new Date().toISOString().slice(0, 10),
    base_salary: 0,
    currency_code: "AUD",
  });

  async function refresh() {
    const r = await get({ data: { id: candidateId } });
    setData(r);
    setOffer((o) => ({ ...o, job_title: r.candidate?.recruitment_jobs?.title ?? "" }));
    setHireForm((f) => ({
      ...f,
      job_title: f.job_title || r.candidate?.recruitment_jobs?.title || "",
    }));
  }
  useEffect(() => {
    refresh();
  }, [candidateId]);

  if (!data?.candidate) return <div className="p-6 text-muted-foreground">Loading…</div>;
  const c = data.candidate;

  async function scheduleIv() {
    if (!iv.scheduled_at) return toast.error("Date/time required");
    await sched({ data: { candidate_id: candidateId, ...iv, interviewer_ids: [], notes: null } });
    toast.success("Interview scheduled");
    setIv({ ...iv, title: "Phone screen", scheduled_at: "" });
    await refresh();
  }
  async function submitScore() {
    await score({ data: { candidate_id: candidateId, ...sc, scores: {} } });
    toast.success("Scorecard saved");
    setSc({ overall_rating: 4, recommendation: "yes", strengths: "", concerns: "" });
    await refresh();
  }
  async function addNote() {
    if (!noteText.trim()) return;
    await note({ data: { candidate_id: candidateId, body: noteText } });
    setNoteText("");
    await refresh();
  }
  async function makeOffer() {
    if (!offer.base_salary) return toast.error("Salary required");
    await off({
      data: {
        candidate_id: candidateId,
        ...offer,
        base_salary: Number(offer.base_salary),
        start_date: offer.start_date || null,
      },
    });
    toast.success("Offer drafted");
    setOfferOpen(false);
    await refresh();
  }
  async function setOfferStatus(id: string, status: "sent" | "accepted" | "declined") {
    try {
      await offStatus({ data: { id, status } });
      toast.success(`Offer ${status}`);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }
  async function convertToEmployee() {
    if (!hireForm.employee_number || !hireForm.job_title)
      return toast.error("Employee number and job title required");
    try {
      await hire({
        data: { candidate_id: candidateId, ...hireForm, base_salary: hireForm.base_salary || null },
      });
      toast.success("Candidate converted to employee");
      setHireOpen(false);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Conversion failed");
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">
              {c.first_name} {c.last_name}
            </CardTitle>
            <CardDescription>
              {c.current_title}
              {c.current_company ? ` @ ${c.current_company}` : ""} • Applied for{" "}
              <strong>{c.recruitment_jobs?.title}</strong>
            </CardDescription>
            <div className="mt-2 text-sm text-muted-foreground space-x-3">
              <a className="hover:underline" href={`mailto:${c.email}`}>
                {c.email}
              </a>
              {c.phone && <span>• {c.phone}</span>}
              {c.linkedin_url && (
                <a
                  className="hover:underline"
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  • LinkedIn
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant="secondary" className="capitalize">
              {c.status}
            </Badge>
            {data.resumeUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={data.resumeUrl} target="_blank" rel="noreferrer">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Resume
                </a>
              </Button>
            )}
            <Button size="sm" onClick={() => setOfferOpen(true)}>
              <Send className="h-3.5 w-3.5 mr-1" />
              Create offer
            </Button>
            {!c.hired_employee_id && (
              <Button size="sm" variant="default" onClick={() => setHireOpen(true)}>
                Hire → Employee
              </Button>
            )}
            {c.hired_employee_id && <Badge>Converted to employee</Badge>}
          </div>
        </CardHeader>
        {c.cover_letter && (
          <CardContent>
            <div className="text-sm whitespace-pre-wrap text-muted-foreground border-l-2 pl-3">
              {c.cover_letter}
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="interviews">
        <TabsList>
          <TabsTrigger value="interviews">
            <Calendar className="h-4 w-4 mr-1" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="scorecards">
            <Star className="h-4 w-4 mr-1" />
            Scorecards
          </TabsTrigger>
          <TabsTrigger value="notes">
            <MessageSquare className="h-4 w-4 mr-1" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="offers">
            <Send className="h-4 w-4 mr-1" />
            Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule interview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
              <Input
                className="md:col-span-2"
                placeholder="Title"
                value={iv.title}
                onChange={(e) => setIv({ ...iv, title: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={iv.scheduled_at}
                onChange={(e) =>
                  setIv({ ...iv, scheduled_at: new Date(e.target.value).toISOString() })
                }
              />
              <Input
                type="number"
                placeholder="Min"
                value={iv.duration_minutes}
                onChange={(e) => setIv({ ...iv, duration_minutes: Number(e.target.value) })}
              />
              <Button onClick={scheduleIv}>Schedule</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {data.interviews.map((i: any) => (
              <Card key={i.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{i.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(i.scheduled_at).toLocaleString()} • {i.duration_minutes}m • {i.mode}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {i.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scorecards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add scorecard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Overall rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={sc.overall_rating}
                    onChange={(e) => setSc({ ...sc, overall_rating: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Recommendation</Label>
                  <Select
                    value={sc.recommendation}
                    onValueChange={(v) => setSc({ ...sc, recommendation: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong_yes">Strong yes</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="strong_no">Strong no</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Strengths</Label>
                <Textarea
                  rows={2}
                  value={sc.strengths}
                  onChange={(e) => setSc({ ...sc, strengths: e.target.value })}
                />
              </div>
              <div>
                <Label>Concerns</Label>
                <Textarea
                  rows={2}
                  value={sc.concerns}
                  onChange={(e) => setSc({ ...sc, concerns: e.target.value })}
                />
              </div>
              <Button onClick={submitScore}>Submit</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {data.scorecards.map((s: any) => (
              <Card key={s.id}>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge>{s.recommendation.replace("_", " ")}</Badge>
                    <span className="text-sm">{"★".repeat(s.overall_rating ?? 0)}</span>
                  </div>
                  {s.strengths && (
                    <div className="text-xs">
                      <strong>Strengths:</strong> {s.strengths}
                    </div>
                  )}
                  {s.concerns && (
                    <div className="text-xs">
                      <strong>Concerns:</strong> {s.concerns}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="p-3 flex gap-2">
              <Input
                placeholder="Add a note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <Button onClick={addNote}>Post</Button>
            </CardContent>
          </Card>
          {data.notes.map((n: any) => (
            <Card key={n.id}>
              <CardContent className="p-3 space-y-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </div>
                <div className="text-sm whitespace-pre-wrap">{n.body}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="offers" className="space-y-3">
          {data.offers.length === 0 && (
            <p className="text-sm text-muted-foreground">No offers yet.</p>
          )}
          {data.offers.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium">{o.job_title}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.currency} {Number(o.base_salary).toLocaleString()} • Start{" "}
                    {o.start_date ?? "TBD"}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant="secondary" className="capitalize">
                    {o.status}
                  </Badge>
                  {o.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOfferStatus(o.id, "sent")}
                    >
                      Send
                    </Button>
                  )}
                  {o.status === "sent" && (
                    <>
                      <Button size="sm" onClick={() => setOfferStatus(o.id, "accepted")}>
                        Mark accepted
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOfferStatus(o.id, "declined")}
                      >
                        Declined
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draft offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Job title</Label>
              <Input
                value={offer.job_title}
                onChange={(e) => setOffer({ ...offer, job_title: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Base salary</Label>
                <Input
                  type="number"
                  value={offer.base_salary || ""}
                  onChange={(e) => setOffer({ ...offer, base_salary: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={offer.currency}
                  onChange={(e) => setOffer({ ...offer, currency: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={offer.start_date}
                  onChange={(e) => setOffer({ ...offer, start_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={makeOffer}>Save draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={hireOpen} onOpenChange={setHireOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Employee number*</Label>
                <Input
                  value={hireForm.employee_number}
                  onChange={(e) => setHireForm({ ...hireForm, employee_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Job title*</Label>
                <Input
                  value={hireForm.job_title}
                  onChange={(e) => setHireForm({ ...hireForm, job_title: e.target.value })}
                />
              </div>
              <div>
                <Label>Employment type</Label>
                <Select
                  value={hireForm.employment_type}
                  onValueChange={(v) => setHireForm({ ...hireForm, employment_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full time</SelectItem>
                    <SelectItem value="part_time">Part time</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hire date</Label>
                <Input
                  type="date"
                  value={hireForm.hire_date}
                  onChange={(e) => setHireForm({ ...hireForm, hire_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Base salary</Label>
                <Input
                  type="number"
                  value={hireForm.base_salary || ""}
                  onChange={(e) =>
                    setHireForm({ ...hireForm, base_salary: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={hireForm.currency_code}
                  onChange={(e) =>
                    setHireForm({ ...hireForm, currency_code: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={convertToEmployee}>Create employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
