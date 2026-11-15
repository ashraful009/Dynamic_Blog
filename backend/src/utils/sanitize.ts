import DOMPurify from "isomorphic-dompurify";
import config from "../config";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "sub", "sup", "mark", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a",
  "img", "video", "source", "iframe", "figure", "figcaption",
  "div", "span", "blockquote", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ALLOWED_ATTR = [
  "class", "style", "id", "title", "draggable", "aria-label",
  "href", "target", "rel",
  "src", "alt", "width", "height", "loading",
  "controls", "autoplay", "muted", "loop", "poster", "playsinline", "preload", "type",
  "data-type", "data-float", "data-width", "data-height",
  "data-node-type", "data-media-id", "data-src", "data-title", "data-aspect-ratio", "data-pdf-embed",
  "data-yt-id", "data-yt-start",
];

const ALLOWED_CSS_PROPERTIES = new Set([
  "float",
  "clear",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "width",
  "height",
  "max-width",
  "max-height",
  "min-width",
  "min-height",
  "aspect-ratio",
  "object-fit",
  "vertical-align",
  "display",
  "text-align",
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "line-height",
  "shape-outside",
  "border-radius",
]);

const DANGEROUS_CSS_VALUE_RE = /(?:url\s*\(|expression\s*\(|javascript:|vbscript:|@import|-moz-binding|behavior\s*:)/i;

const sanitizeStyleValue = (rawStyle: string): string => {
  return rawStyle
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .map((decl) => {
      const colonIdx = decl.indexOf(":");
      if (colonIdx === -1) return null;
      const prop = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).trim();
      if (!ALLOWED_CSS_PROPERTIES.has(prop)) return null;
      if (!val || DANGEROUS_CSS_VALUE_RE.test(val)) return null;
      return `${prop}: ${val}`;
    })
    .filter((v): v is string => v !== null)
    .join("; ");
};

const isAllowedCloudinaryPdfUrl = (rawSrc: string | null): boolean => {
  if (!rawSrc) return false;
  try {
    const parsed = new URL(rawSrc);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname !== "res.cloudinary.com") return false;
    if (
      config.cloudinary.cloudName &&
      !parsed.pathname.startsWith(`/${config.cloudinary.cloudName}/`)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

let pdfIframeHookRegistered = false;
const ensurePdfIframeHook = () => {
  if (pdfIframeHookRegistered) return;
  pdfIframeHookRegistered = true;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    const el = node as unknown as {
      getAttribute?: (name: string) => string | null;
      setAttribute?: (name: string, val: string) => void;
      removeAttribute?: (name: string) => void;
      classList?: { contains?: (cls: string) => boolean };
      parentNode?: { removeChild: (child: unknown) => unknown } | null;
    };

    if (data.tagName === "iframe") {
      const isPdfEmbed =
        el.getAttribute?.("data-pdf-embed") === "true" ||
        Boolean(el.classList?.contains?.("pdf-embed-frame"));
      const src = el.getAttribute?.("src") ?? null;
      if (!isPdfEmbed || !isAllowedCloudinaryPdfUrl(src)) {
        el.parentNode?.removeChild(node);
      }
      return;
    }

    const isYtEmbed =
      el.getAttribute?.("data-node-type") === "yt-embed" ||
      Boolean(el.classList?.contains?.("yt-embed"));
    if (isYtEmbed) {
      const ytId = el.getAttribute?.("data-yt-id");
      if (!ytId || !YOUTUBE_ID_RE.test(ytId)) {
        el.parentNode?.removeChild(node);
        return;
      }
      const ytStart = el.getAttribute?.("data-yt-start");
      if (ytStart && !/^\d+$/.test(ytStart)) {
        el.removeAttribute?.("data-yt-start");
      }
    }
  });
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "style") return;
    const clean = sanitizeStyleValue(data.attrValue || "");
    if (!clean) {
      data.keepAttr = false;
    } else {
      data.attrValue = clean;
    }
  });
};

export const sanitizeHtml = (dirtyHtml: string): string => {
  ensurePdfIframeHook();
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    FORCE_BODY: false,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
};
export const stripHtml = (html: string): string => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
};
export default sanitizeHtml;
