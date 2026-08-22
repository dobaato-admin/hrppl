function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const DOWNLOAD_EXT = /\.(docx?|xlsx?|pptx?|csv|zip|pdf)(\?|#|$)/i;
function inline(s) {
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
    const safe = /^(https?:|mailto:|\/)/i.test(url) ? url : "#";
    const isFile = DOWNLOAD_EXT.test(safe);
    const filename = isFile ? safe.split("/").pop()?.split(/[?#]/)[0] ?? "" : "";
    const attrs = isFile ? `download="${esc(filename)}" rel="noopener noreferrer"` : `target="_blank" rel="noopener noreferrer"`;
    return `<a href="${esc(safe)}" ${attrs} class="text-primary underline">${esc(text)}</a>`;
  });
  s = s.replace(/`([^`]+)`/g, (_m, c) => `<code class="rounded bg-muted px-1 py-0.5 text-sm">${esc(c)}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}
function renderMarkdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuf = [];
  let para = [];
  const flushPara = () => {
    if (para.length) {
      out.push(`<p class="my-3 leading-relaxed">${inline(esc(para.join(" ")))}</p>`);
      para = [];
    }
  };
  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };
  for (const rawLine of lines) {
    const line = rawLine;
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre class="my-3 overflow-x-auto rounded-md bg-muted p-3 text-sm"><code>${esc(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        flushPara();
        closeLists();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushPara();
      closeLists();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeLists();
      const level = h[1].length;
      const sizes = ["text-2xl mt-6 mb-3 font-semibold", "text-xl mt-5 mb-2 font-semibold", "text-lg mt-4 mb-2 font-semibold", "text-base mt-3 mb-2 font-semibold"];
      out.push(`<h${level} class="${sizes[level - 1]}">${inline(esc(h[2]))}</h${level}>`);
      continue;
    }
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="my-3 ml-6 list-disc space-y-1">');
        inUl = true;
      }
      out.push(`<li>${inline(esc(ul[1]))}</li>`);
      continue;
    }
    const ol = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="my-3 ml-6 list-decimal space-y-1">');
        inOl = true;
      }
      out.push(`<li>${inline(esc(ol[2]))}</li>`);
      continue;
    }
    para.push(line.trim());
  }
  flushPara();
  closeLists();
  if (inCode) {
    out.push(`<pre class="my-3 overflow-x-auto rounded-md bg-muted p-3 text-sm"><code>${esc(codeBuf.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}
export {
  renderMarkdown as r
};
