import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import DOMPurify from "isomorphic-dompurify";
import { getPublicJob, applyToJob, createResumeUploadUrl } from "@/lib/recruitment.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Briefcase, Upload } from "lucide-react";

const JOB_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["h1","h2","h3","h4","h5","h6","p","span","strong","em","b","i","u","br","hr","ul","ol","li","blockquote","a","code","pre"],
  ALLOWED_ATTR: ["href","target","rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};
const cleanJobHtml = (html?: string | null) =>
  html ? DOMPurify.sanitize(html, JOB_HTML_SANITIZE_CONFIG) : "";

export const Route = createFileRoute("/careers/$slug")({
  component: JobPage,
});

function JobPage() {
  const { slug } = useParams({ from: "/careers/$slug" });
  const get = useServerFn(getPublicJob);
  const apply = useServerFn(applyToJob);
  const mintUpload = useServerFn(createResumeUploadUrl);
  const [job, setJob] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ first_name: "", last_name: "", email: "", phone: "", linkedin_url: "", current_title: "", current_company: "", cover_letter: "" });
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => { get({ data: { slug } }).then((r) => setJob(r.job)); }, [slug]);

  async function uploadResume(file: File) {
    if (!job) return;
    try {
      const { path, token } = await mintUpload({ data: { job_id: job.id, filename: file.name } });
      const { error } = await supabase.storage
        .from("candidate-resumes")
        .uploadToSignedUrl(path, token, file);
      if (error) return toast.error(error.message);
      setResumePath(path);
      toast.success("Resume uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Could not upload resume");
    }
  }

  async function submit() {
    if (!form.first_name || !form.last_name || !form.email) return toast.error("Name and email required");
    setWorking(true);
    try {
      await apply({ data: { job_id: job.id, ...form, resume_path: resumePath } });
      setSubmitted(true);
    } catch (e: any) { toast.error(e.message); }
    finally { setWorking(false); }
  }

  if (!job) return <main className="p-10 text-muted-foreground">Loading…</main>;
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link to="/careers" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> All roles</Link>
          <h1 className="mt-3 font-display text-4xl">{job.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
            {job.employment_type && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.employment_type.replace("_"," ")}</span>}
            {job.salary_min && <span>{job.currency} {Number(job.salary_min).toLocaleString()} – {Number(job.salary_max ?? job.salary_min).toLocaleString()}</span>}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8 grid gap-6">
        {job.description_html && <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanJobHtml(job.description_html) }} />}
        {job.requirements_html && (<div className="space-y-2"><h2 className="font-display text-xl">Requirements</h2><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanJobHtml(job.requirements_html) }} /></div>)}

        {submitted ? (
          <Card><CardHeader><CardTitle>Thank you!</CardTitle><CardDescription>Your application has been received. We'll be in touch.</CardDescription></CardHeader></Card>
        ) : (
        <Card>
          <CardHeader><CardTitle>Apply for this role</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>First name *</Label><Input value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} /></div>
              <div><Label>Last name *</Label><Input value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>Current title</Label><Input value={form.current_title} onChange={(e) => setForm({...form, current_title: e.target.value})} /></div>
              <div><Label>Current company</Label><Input value={form.current_company} onChange={(e) => setForm({...form, current_company: e.target.value})} /></div>
              <div className="md:col-span-2"><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={(e) => setForm({...form, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/…" /></div>
            </div>
            <div><Label>Cover letter</Label><Textarea rows={4} value={form.cover_letter} onChange={(e) => setForm({...form, cover_letter: e.target.value})} /></div>
            <div>
              <Label>Resume / CV (PDF)</Label>
              <div className="mt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" /> {resumePath ? "Replace resume" : "Upload resume"}
                  <input type="file" hidden accept="application/pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])} />
                </label>
                {resumePath && <span className="ml-2 text-xs text-muted-foreground">Uploaded</span>}
              </div>
            </div>
            <Button onClick={submit} disabled={working} className="w-full">{working ? "Submitting…" : "Submit application"}</Button>
          </CardContent>
        </Card>
        )}
      </section>
    </main>
  );
}
