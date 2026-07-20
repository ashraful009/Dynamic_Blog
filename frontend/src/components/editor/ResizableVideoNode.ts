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
        parseHTML: (element) => Number(element.getAttribute("data-transform-x")) || 0,
        renderHTML: (attributes) => ({ "data-transform-x": attributes.transformX }),
      },
      transformY: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute("data-transform-y")) || 0,
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
  renderHTML({ HTMLAttributes }) {
    const style = [];
    if (HTMLAttributes.float === "left") {
      style.push("float: left", "margin-right: 20px", "margin-bottom: 20px");
    } else if (HTMLAttributes.float === "right") {
      style.push("float: right", "margin-left: 20px", "margin-bottom: 20px");
    } else {
      style.push("display: inline-block", "vertical-align: middle");
    }
    if (HTMLAttributes.width) {
      style.push(`width: ${HTMLAttributes.width}px`);
    }
    if (HTMLAttributes.height) {
      style.push(`height: ${HTMLAttributes.height}px`);
    }
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "node-video",
        style: style.join("; "),
        controls: "true",
      }),
      ["source", { src: HTMLAttributes.src }],
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
