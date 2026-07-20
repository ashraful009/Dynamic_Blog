import DOMPurify from "isomorphic-dompurify";
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "sub", "sup", "mark", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a",
  "img", "video", "source", "figure", "figcaption",
  "div", "span", "blockquote", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ALLOWED_ATTR = [
  "class", "style", "id", "title", "draggable",
  "href", "target", "rel",
  "src", "alt", "width", "height", "loading",
  "controls", "autoplay", "muted", "loop", "poster", "playsinline", "preload", "type",
  "data-type", "data-float", "data-width", "data-height",
  "data-node-type", "data-media-id", "data-src",
];
const ALLOWED_CSS_PROPERTIES = [
  "float", "clear", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "width", "height", "max-width", "max-height", "min-width", "min-height",
  "display", "text-align", "color", "background-color", "font-size", "font-weight",
  "font-style", "text-decoration", "line-height", "shape-outside", "border-radius",
];
export const sanitizeHtml = (dirtyHtml: string): string => {
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
