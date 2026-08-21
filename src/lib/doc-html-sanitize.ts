// Shared allow-list HTML sanitizer config for stored document HTML.
// Used at write time (server) AND defensively at render time (client) to
// provide XSS defense-in-depth on routes that show body_html_snapshot.
import DOMPurify from "isomorphic-dompurify";

export const DOC_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1","h2","h3","h4","h5","h6","p","span","strong","em","b","i","u","br","hr",
    "table","thead","tbody","tr","td","th","ul","ol","li","div","blockquote","a","img","code","pre",
  ],
  ALLOWED_ATTR: ["class","style","href","target","rel","src","alt","width","height","colspan","rowspan"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ["script","iframe","object","embed","style","link","meta","svg","math","form","input","button","textarea","select","option"],
  FORBID_ATTR: ["onerror","onload","onclick","onmouseover","onfocus","onblur","onsubmit","onchange","onkeydown","onkeyup","onkeypress","formaction","xlink:href"],
};

export function sanitizeDocHtml(input: string | null | undefined): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, DOC_HTML_SANITIZE_CONFIG);
}
