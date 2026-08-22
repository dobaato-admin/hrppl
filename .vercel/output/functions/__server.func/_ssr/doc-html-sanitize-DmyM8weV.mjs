import { s as src_default } from "../_libs/isomorphic-dompurify.mjs";
const DOC_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "ul",
    "ol",
    "li",
    "div",
    "blockquote",
    "a",
    "img",
    "code",
    "pre"
  ],
  ALLOWED_ATTR: ["class", "style", "href", "target", "rel", "src", "alt", "width", "height", "colspan", "rowspan"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ["script", "iframe", "object", "embed", "style", "link", "meta", "svg", "math", "form", "input", "button", "textarea", "select", "option"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onsubmit", "onchange", "onkeydown", "onkeyup", "onkeypress", "formaction", "xlink:href"]
};
function sanitizeDocHtml(input) {
  if (!input) return "";
  return src_default.sanitize(input, DOC_HTML_SANITIZE_CONFIG);
}
export {
  sanitizeDocHtml as s
};
