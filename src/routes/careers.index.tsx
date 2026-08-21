import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPublicJobs } from "@/lib/recruitment.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Careers — hrppl" },
      { name: "description", content: "Open roles at hrppl. Help build the global HRMS and payroll platform finance and HR teams rely on." },
      { property: "og:title", content: "Careers — hrppl" },
      { property: "og:description", content: "Browse and apply to open positions at hrppl." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hrppl.io/careers" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Careers — hrppl" },
      { name: "twitter:description", content: "Browse and apply to open positions at hrppl." },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io/careers" }],
  }),
  component: CareersList,
});

function CareersList() {
  const list = useServerFn(listPublicJobs);
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => { list().then((r) => setJobs(r.jobs)); }, []);
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="font-display text-4xl">Join our team</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">We're building something meaningful. Browse open roles and apply directly — no recruiters in between.</p>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-10 space-y-3">
        {jobs.length === 0 && <p className="text-muted-foreground">No open roles right now. Check back soon.</p>}
        {jobs.map((j) => (
          <Link key={j.id} to="/careers/$slug" params={{ slug: j.slug }}>
            <Card className="hover:border-primary transition cursor-pointer">
              <CardHeader>
                <CardTitle className="text-xl">{j.title}</CardTitle>
                <CardDescription className="flex items-center gap-3 mt-1">
                  {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location}</span>}
                  {j.employment_type && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{j.employment_type.replace("_"," ")}</span>}
                  {j.departments?.name && <Badge variant="secondary">{j.departments.name}</Badge>}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
