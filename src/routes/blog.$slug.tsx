import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublishedPost, listPublishedPosts } from "@/lib/blog.functions";
import { BlogNav, BlogFooter } from "@/components/blog-chrome";
import { ArrowLeft } from "lucide-react";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    queryFn: () => getPublishedPost({ data: { slug } }),
  });

const relatedQuery = () =>
  queryOptions({
    queryKey: ["blog", "related"],
    queryFn: () => listPublishedPosts({ data: { limit: 3 } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data.post) throw notFound();
    await context.queryClient.ensureQueryData(relatedQuery());
    return data;
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Article — hrppl" }] };
    const title = p.seo_title || p.title;
    const desc = p.seo_description || p.excerpt || "Read this article on the hrppl blog.";
    const url = `https://hrppl.io/blog/${params.slug}`;
    const ogImage = p.og_image_url || p.cover_image_url || undefined;
    return {
      meta: [
        { title: `${title} — hrppl Blog` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(ogImage ? [{ property: "og:image", content: ogImage }, { name: "twitter:image", content: ogImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: p.canonical_url || url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: desc,
          image: ogImage,
          datePublished: p.published_at,
          dateModified: p.updated_at,
          author: { "@type": "Person", name: p.author_name ?? "hrppl" },
          mainEntityOfPage: url,
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><h1 className="text-2xl font-semibold">Article not found</h1><Link to="/blog" className="mt-4 inline-block text-primary">Back to the blog</Link></div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Couldn't load article</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <button onClick={reset} className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground">Try again</button>
      </div>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = useSuspenseQuery(postQuery(Route.useParams().slug)).data;
  const related = useSuspenseQuery(relatedQuery()).data.posts.filter((r) => r.id !== post!.id).slice(0, 3);
  const p = post!;
  return (
    <div className="min-h-screen bg-background">
      <BlogNav />
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {p.published_at && <time>{new Date(p.published_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</time>}
          {p.reading_minutes && <><span>·</span><span>{p.reading_minutes} min read</span></>}
          {p.author_name && <><span>·</span><span>{p.author_name}</span></>}
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-display font-semibold tracking-tight">{p.title}</h1>
        {p.excerpt && <p className="mt-4 text-xl text-muted-foreground">{p.excerpt}</p>}
        {p.cover_image_url && (
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: p.content_html ?? "" }}
        />
        {p.tags && p.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {p.tags.map((t: string) => (
              <span key={t} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">#{t}</span>
            ))}
          </div>
        )}
      </article>
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-border">
          <h2 className="text-2xl font-display font-semibold mb-8">More from the blog</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} className="group rounded-xl border border-border p-5 hover:shadow-md transition-all">
                <h3 className="font-semibold group-hover:text-primary line-clamp-2">{r.title}</h3>
                {r.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
      <BlogFooter />
    </div>
  );
}
