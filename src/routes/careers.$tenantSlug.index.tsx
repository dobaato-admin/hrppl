import { createFileRoute, Link, ErrorComponent, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import DOMPurify from "isomorphic-dompurify";
import { getCareersByTenantSlug } from "@/lib/careers.functions";
import { trackCareersEvent } from "@/lib/careers-analytics.functions";

const ABOUT_SANITIZE = {
  ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "p", "strong", "em", "ul", "ol", "li", "a", "br", "blockquote"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

export const Route = createFileRoute("/careers/$tenantSlug/")({
  loader: async ({ params }) => {
    const r = await getCareersByTenantSlug({ data: { tenant_slug: params.tenantSlug } });
    if (!r.site) throw notFound();
    return r;
  },
  head: ({ loaderData, params }) => {
    const title = loaderData?.site?.headline
      ? `${loaderData.site.headline} — Careers`
      : `Careers — ${params.tenantSlug}`;
    const description = loaderData?.site?.headline
      ? `Open roles at ${loaderData.site.headline}. Browse our team's job openings.`
      : "Open job opportunities.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData?.site?.hero_image_url
          ? [
              { property: "og:image", content: loaderData.site.hero_image_url },
              { name: "twitter:image", content: loaderData.site.hero_image_url },
            ]
          : []),
      ],
    };
  },
  errorComponent: ErrorComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Careers page not found.
    </div>
  ),
  component: CareersPage,
});

function CareersPage() {
  const { tenantSlug } = Route.useParams();
  const fn = useServerFn(getCareersByTenantSlug);
  const { data } = useQuery({
    queryKey: ["careers", tenantSlug],
    queryFn: () => fn({ data: { tenant_slug: tenantSlug } }),
  });

  const site = data?.site;
  const jobs = data?.jobs ?? [];
  const brand = site?.brand_color ?? "#0F172A";

  const trackFn = useServerFn(trackCareersEvent);
  useEffect(() => {
    if (!site) return;
    trackFn({
      data: {
        tenant_slug: tenantSlug,
        event_type: "site_view",
        referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : undefined,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
      },
    }).catch(() => {});
  }, [site, tenantSlug, trackFn]);

  return (
    <div className="min-h-screen bg-background">
      <header
        className="border-b"
        style={{
          backgroundImage: site?.hero_image_url ? `url(${site.hero_image_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black/40 px-6 py-20 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold">{site?.headline ?? "Careers"}</h1>
            <p className="mt-2 opacity-80">Open positions on our team</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {site?.about_html && (
          <section
            className="prose dark:prose-invert mb-10"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(site.about_html, ABOUT_SANITIZE) }}
          />
        )}

        <h2 className="text-2xl font-semibold mb-4">Open positions ({jobs.length})</h2>
        <div className="space-y-3">
          {jobs.map((j: any) => (
            <Link
              key={j.id}
              to="/careers/$tenantSlug/$jobSlug"
              params={{ tenantSlug, jobSlug: j.public_slug ?? j.id }}
              className="block border rounded-lg p-4 hover:border-primary/40 transition"
              style={{ borderLeft: `3px solid ${brand}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[j.location, j.employment_type].filter(Boolean).join(" · ")}
                  </p>
                  {j.public_summary && (
                    <p className="text-sm mt-2 line-clamp-2">{j.public_summary}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {j.published_at ? new Date(j.published_at).toLocaleDateString() : ""}
                </span>
              </div>
            </Link>
          ))}
          {jobs.length === 0 && (
            <p className="text-muted-foreground text-sm">No open positions right now. Please check back soon.</p>
          )}
        </div>
      </main>
    </div>
  );
}
