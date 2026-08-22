import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { Q as postQuery, S as Route$1y, U as relatedQuery } from "./router-CLxirH5A.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { B as BlogNav, a as BlogFooter } from "./blog-chrome-KoRrT5V1.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { _ as ArrowLeft } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./client-BLUqAwhM.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "./auth-guard-CkYFJuQL.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./geofences.functions-C8KvPefL.mjs";
import "../_libs/zod.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
function PostPage() {
  const {
    post
  } = useSuspenseQuery(postQuery(Route$1y.useParams().slug)).data;
  const related = useSuspenseQuery(relatedQuery()).data.posts.filter((r) => r.id !== post.id).slice(0, 3);
  const p = post;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlogNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "mx-auto max-w-3xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blog", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " All posts"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground", children: [
        p.published_at && /* @__PURE__ */ jsxRuntimeExports.jsx("time", { children: new Date(p.published_at).toLocaleDateString(void 0, {
          day: "numeric",
          month: "long",
          year: "numeric"
        }) }),
        p.reading_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            p.reading_minutes,
            " min read"
          ] })
        ] }),
        p.author_name && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.author_name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-4xl md:text-5xl font-display font-semibold tracking-tight", children: p.title }),
      p.excerpt && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xl text-muted-foreground", children: p.excerpt }),
      p.cover_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.cover_image_url, alt: p.title, className: "h-full w-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose-blog mt-10", dangerouslySetInnerHTML: {
        __html: p.content_html ?? ""
      } }),
      p.tags && p.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex flex-wrap gap-2", children: p.tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 rounded-full bg-muted text-xs font-medium", children: [
        "#",
        t
      ] }, t)) })
    ] }),
    related.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-6 py-16 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-display font-semibold mb-8", children: "More from the blog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-3", children: related.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blog/$slug", params: {
        slug: r.slug
      }, className: "group rounded-xl border border-border p-5 hover:shadow-md transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold group-hover:text-primary line-clamp-2", children: r.title }),
        r.excerpt && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3", children: r.excerpt })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlogFooter, {})
  ] });
}
export {
  PostPage as component
};
