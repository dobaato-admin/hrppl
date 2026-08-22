import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { j as Route$2w, k as postsQuery } from "./router-CLxirH5A.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { B as BlogNav, a as BlogFooter } from "./blog-chrome-KoRrT5V1.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { as as ArrowRight } from "../_libs/lucide-react.mjs";
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
function BlogIndex() {
  const search = Route$2w.useSearch();
  const {
    data
  } = useSuspenseQuery(postsQuery(search));
  const {
    posts,
    categories
  } = data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlogNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-gradient-hero border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium uppercase tracking-widest text-primary", children: "The hrppl blog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl md:text-6xl font-display font-semibold tracking-tight", children: "Global payroll, people ops & product." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-lg text-muted-foreground", children: "Field-tested guides, compliance updates and lessons from teams running HR and payroll in 40+ countries." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryChip, { label: "All", active: !search.category, to: "/blog" }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryChip, { label: c.name, active: search.category === c.slug, to: "/blog", params: {
          category: c.slug
        } }, c.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-6 py-16", children: posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-24 text-muted-foreground", children: "No posts yet. Check back soon." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-3", children: posts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/blog/$slug", params: {
      slug: p.slug
    }, className: "block", children: [
      p.cover_image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] overflow-hidden bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.cover_image_url, alt: p.title, className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500", loading: "lazy" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] bg-gradient-brand" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          p.published_at && /* @__PURE__ */ jsxRuntimeExports.jsx("time", { children: new Date(p.published_at).toLocaleDateString(void 0, {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) }),
          p.reading_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              p.reading_minutes,
              " min read"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-xl font-display font-semibold group-hover:text-primary transition-colors line-clamp-2", children: p.title }),
        p.excerpt && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3", children: p.excerpt }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary", children: [
          "Read article ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 group-hover:translate-x-1 transition-transform" })
        ] })
      ] })
    ] }) }, p.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlogFooter, {})
  ] });
}
function CategoryChip({
  label,
  active,
  to,
  params
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, search: params ? {
    category: params.category
  } : {}, className: `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"}`, children: label });
}
export {
  BlogIndex as component
};
