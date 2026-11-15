import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableVideoComponent from "./ResizableVideoComponent";
export interface ResizableVideoOptions {
  HTMLAttributes: Record<string, any>;
}
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableVideo: {
      setResizableVideo: (options: {
        src: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}
export const ResizableVideo = Node.create<ResizableVideoOptions>({
  name: "resizableVideo",
  group: "inline",
  inline: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-width"),
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-height"),
        renderHTML: (attributes) => ({ "data-height": attributes.height }),
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
        tag: 'video[src]',
      },
      {
        tag: 'img[data-type="video"]',
      }
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const style = [];
    const { float, width, height, transformX = 0, transformY = 0 } = node.attrs;
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
    if (width) {
      style.push(`width: ${width}px`);
    }
    if (height) {
      style.push(`height: ${height}px`);
    }
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "node-video",
        style: style.join("; "),
        controls: "true",
      }),
      ["source", { src: node.attrs.src }],
    ];
  },
  addCommands() {
    return {
      setResizableVideo:
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
    return ReactNodeViewRenderer(ResizableVideoComponent);
  },
});
