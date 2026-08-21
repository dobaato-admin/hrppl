import { createFileRoute, ErrorComponent, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getJobBySlug } from "@/lib/careers.functions";
import { trackCareersEvent } from "@/lib/careers-analytics.functions";
import { Button } from "@/components/ui/button";
import DOMPurify from "isomorphic-dompurify";

const JOB_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["h1","h2","h3","h4","h5","h6","p","span","strong","em","b","i","u","br","hr","ul","ol","li","blockquote","a","code","pre"],
  ALLOWED_ATTR: ["href","target","rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};
const cleanJobHtml = (html?: string | null) =>
  html ? DOMPurify.sanitize(html, JOB_HTML_SANITIZE_CONFIG) : "";

export const Route = createFileRoute("/careers/$tenantSlug/$jobSlug")({
  loader: async ({ params }) => {
    const r = await getJobBySlug({
      data: { tenant_slug: params.tenantSlug, job_slug: params.jobSlug },
    });
    if (!r.job) throw notFound();
    return r;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.job?.title ?? "Job opening";
    const description =
      loaderData?.job?.public_summary ??
      `Apply for ${loaderData?.job?.title ?? "this role"}.`;
    const jsonLd = loaderData?.job
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: loaderData.job.title,
          description: loaderData.job.description_html || loaderData.job.public_summary,
          datePosted: loaderData.job.published_at,
          employmentType: loaderData.job.employment_type,
          jobLocation: loaderData.job.location
            ? { "@type": "Place", address: loaderData.job.location }
            : undefined,
          baseSalary:
            loaderData.job.salary_min && loaderData.job.salary_max
              ? {
                  "@type": "MonetaryAmount",
                  currency: loaderData.job.currency ?? "USD",
                  value: {
                    "@type": "QuantitativeValue",
                    minValue: loaderData.job.salary_min,
                    maxValue: loaderData.job.salary_max,
                    unitText: "YEAR",
                  },
                }
              : undefined,
        }
      : null;
    return {
      meta: [
        { title: `${title} — Careers` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      scripts: jsonLd
        ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
        : [],
    };
  },
  errorComponent: ErrorComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Job not found.
    </div>
  ),
  component: JobPage,
});

function JobPage() {
  const { tenantSlug, jobSlug } = Route.useParams();
  const fn = useServerFn(getJobBySlug);
  const { data } = useQuery({
    queryKey: ["career-job", tenantSlug, jobSlug],
    queryFn: () => fn({ data: { tenant_slug: tenantSlug, job_slug: jobSlug } }),
  });

  const job = data?.job;
  const site = data?.site;
  const trackFn = useServerFn(trackCareersEvent);

  useEffect(() => {
    if (!job?.id) return;
    trackFn({
      data: {
        tenant_slug: tenantSlug,
        job_id: job.id,
        event_type: "job_view",
        referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : undefined,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
      },
    }).catch(() => {});
  }, [job?.id, tenantSlug, trackFn]);

  if (!job) return null;

  function recordApplyStart() {
    if (!job?.id) return;
    trackFn({
      data: { tenant_slug: tenantSlug, job_id: job.id, event_type: "apply_start" },
    }).catch(() => {});
  }

  const fmtMoney = (n: number | null | undefined) =>
    n ? new Intl.NumberFormat(undefined, { style: "currency", currency: job.currency ?? "USD" }).format(n) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b" style={{ borderColor: site?.brand_color ?? undefined }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <a href={`/careers/${tenantSlug}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← All openings
          </a>
          <h1 className="text-3xl font-bold mt-2">{job.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {[job.location, job.employment_type].filter(Boolean).join(" · ")}
            {job.salary_min && job.salary_max
              ? ` · ${fmtMoney(job.salary_min)} – ${fmtMoney(job.salary_max)}`
              : ""}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {job.public_summary && (
          <p className="text-lg text-muted-foreground">{job.public_summary}</p>
        )}
        {job.description_html && (
          <section
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanJobHtml(job.description_html) }}
          />
        )}
        {job.requirements_html && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Requirements</h2>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: cleanJobHtml(job.requirements_html) }}
            />
          </section>
        )}

        <div className="pt-4 border-t">
          <Button asChild size="lg" style={{ backgroundColor: site?.brand_color ?? undefined }}>
            <a
              href={`mailto:careers@${tenantSlug}.com?subject=Application: ${encodeURIComponent(job.title)}`}
              onClick={recordApplyStart}
            >
              Apply for this role
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
