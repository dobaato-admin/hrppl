import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listPublishedPosts } from "@/lib/blog.functions";
import { BlogNav, BlogFooter } from "@/components/blog-chrome";

type Search = { category?: string; tag?: string };

const postsQuery = (s: Search) =>
  queryOptions({
    queryKey: ["blog", "posts", s],
    queryFn: () => listPublishedPosts({ data: { limit: 24, category: s.category, tag: s.tag } }),
  });

export const Route = createFileRoute("/blog/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    tag: typeof s.tag === "string" ? s.tag : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(postsQuery(deps)),
  head: () => ({
    meta: [
      { title: "Blog — hrppl" },
      { name: "description", content: "Insights on global payroll, HR strategy, and product updates from the hrppl team." },
      { property: "og:title", content: "hrppl Blog — Global Payroll & HR Insights" },
      { property: "og:description", content: "Articles, guides and product updates from hrppl." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hrppl.io/blog" },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io/blog" }],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Couldn't load the blog</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <button onClick={reset} className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground">Try again</button>
      </div>
    </div>
  ),
  component: BlogIndex,
});

function BlogIndex() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(postsQuery(search));
  const { posts, categories } = data;

  return (
    <div className="min-h-screen bg-background">
      <BlogNav />
      <section className="bg-gradient-hero border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">The hrppl blog</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-display font-semibold tracking-tight">
            Global payroll, people ops & product.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Field-tested guides, compliance updates and lessons from teams running HR and payroll in 40+ countries.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <CategoryChip label="All" active={!search.category} to="/blog" />
            {categories.map((c) => (
              <CategoryChip key={c.id} label={c.name} active={search.category === c.slug} to="/blog" params={{ category: c.slug }} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            No posts yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="block">
                  {p.cover_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-brand" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {p.published_at && <time>{new Date(p.published_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</time>}
                      {p.reading_minutes && <><span>·</span><span>{p.reading_minutes} min read</span></>}
                    </div>
                    <h2 className="mt-2 text-xl font-display font-semibold group-hover:text-primary transition-colors line-clamp-2">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <BlogFooter />
    </div>
  );
}

function CategoryChip({ label, active, to, params }: { label: string; active: boolean; to: string; params?: { category: string } }) {
  return (
    <Link
      to={to}
      search={params ? { category: params.category } : {}}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"
      }`}
    >
      {label}
    </Link>
  );
}

