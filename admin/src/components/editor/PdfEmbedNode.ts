import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import PdfEmbedComponent from "./PdfEmbedComponent";

export interface PdfEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pdfEmbed: {
      setPdfEmbed: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const PdfEmbed = Node.create<PdfEmbedOptions>({
  name: "pdfEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-src") ||
          element.querySelector("iframe")?.getAttribute("src") ||
          null,
        renderHTML: (attributes) =>
          attributes.src ? { "data-src": attributes.src } : {},
      },
      title: {
        default: "PDF Document",
        parseHTML: (element) =>
          element.getAttribute("data-title") ||
          element.querySelector("iframe")?.getAttribute("title") ||
          "PDF Document",
        renderHTML: (attributes) =>
          attributes.title ? { "data-title": attributes.title } : {},
      },
    };
  },

  parseHTML() {
    return [
      { tag: "div.pdf-embed" },
      { tag: 'div[data-node-type="pdf-embed"]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const src = (node.attrs.src as string) || "";
    const title = (node.attrs.title as string) || "PDF Document";

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "pdf-embed",
        "data-node-type": "pdf-embed",
        "data-src": src,
        "data-title": title,
      }),
      [
        "iframe",
        {
          src,
          title,
          class: "pdf-embed-frame",
          "data-pdf-embed": "true",
          loading: "lazy",
        },
      ],
      [
        "div",
        { class: "pdf-embed-fallback" },
        [
          "a",
          {
            href: src,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Open PDF in new tab",
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setPdfEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfEmbedComponent);
  },
});
