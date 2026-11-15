import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageComponent from "./ResizableImageComponent";
export interface ResizableImageOptions {
  HTMLAttributes: Record<string, any>;
}
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
        aspectRatio?: string | null;
      }) => ReturnType;
    };
  }
}
export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",
  group: "inline",
  inline: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute("data-width");
          return val ? Number(val) : null;
        },
        renderHTML: (attributes) =>
          attributes.width ? { "data-width": attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute("data-height");
          return val ? Number(val) : null;
        },
        renderHTML: (attributes) =>
          attributes.height ? { "data-height": attributes.height } : {},
      },
      aspectRatio: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-aspect-ratio") ||
          element.style.aspectRatio ||
          null,
        renderHTML: (attributes) =>
          attributes.aspectRatio
            ? { "data-aspect-ratio": attributes.aspectRatio }
            : {},
      },
      float: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-float") || "none",
        renderHTML: (attributes) => ({ "data-float": attributes.float }),
      },
      transformX: {
        default: 0,
        parseHTML: (element) => {
          const attr = element.getAttribute("data-transform-x");
          if (attr !== null) return Number(attr) || 0;
          const float = element.getAttribute("data-float") || element.style.float || "none";
          if (float === "left") return Math.max(0, parseFloat(element.style.marginLeft) || 0);
          if (float === "right") return -(Math.max(0, parseFloat(element.style.marginRight) || 0));
          return 0;
        },
        renderHTML: (attributes) => ({ "data-transform-x": attributes.transformX }),
      },
      transformY: {
        default: 0,
        parseHTML: (element) => {
          const attr = element.getAttribute("data-transform-y");
          if (attr !== null) return Number(attr) || 0;
          return Math.max(0, parseFloat(element.style.marginTop) || 0);
        },
        renderHTML: (attributes) => ({ "data-transform-y": attributes.transformY }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]:not([data-type="video"])',
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const style = [];
    const { float, width, height, aspectRatio, transformX = 0, transformY = 0 } = node.attrs;
    const tx = Number(transformX) || 0;
    const ty = Number(transformY) || 0;
    if (float === "left") {
      style.push(
        "float: left",
        `margin-left: ${Math.max(0, tx)}px`,
        "margin-right: 20px",
        `margin-top: ${Math.max(0, ty)}px`,
        "margin-bottom: 20px"
      );
    } else if (float === "right") {
      style.push(
        "float: right",
        "margin-left: 20px",
        `margin-right: ${Math.max(0, -tx)}px`,
        `margin-top: ${Math.max(0, ty)}px`,
        "margin-bottom: 20px"
      );
    } else {
      style.push("display: inline-block", "vertical-align: middle");
    }
    if (aspectRatio) {
      style.push(
        width ? `width: ${width}px` : "width: 100%",
        "max-width: 100%",
        "height: auto",
        `aspect-ratio: ${aspectRatio}`,
        "object-fit: cover"
      );
    } else {
      if (width) {
        style.push(`width: ${width}px`);
      }
      if (height) {
        style.push(`height: ${height}px`);
      }
    }
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "node-image",
        style: style.join("; "),
      }),
    ];
  },
  addCommands() {
    return {
      setResizableImage:
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
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
