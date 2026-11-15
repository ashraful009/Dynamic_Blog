import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import YoutubeEmbedComponent from "./YoutubeEmbedComponent";
import { isValidYoutubeId, parseYoutubeUrl } from "./youtubeUtils";

export interface YoutubeEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      setYoutubeEmbed: (options: {
        videoId: string;
        start?: number | null;
        width?: number | null;
        float?: "left" | "right" | "none";
      }) => ReturnType;
    };
  }
}

export const YoutubeEmbed = Node.create<YoutubeEmbedOptions>({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      videoId: {
        default: null,
        parseHTML: (element) => {
          const id = element.getAttribute("data-yt-id");
          return isValidYoutubeId(id) ? id : null;
        },
        renderHTML: (attributes) =>
          isValidYoutubeId(attributes.videoId)
            ? { "data-yt-id": attributes.videoId }
            : {},
      },
      start: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-yt-start");
          if (!raw) return null;
          const num = parseInt(raw, 10);
          return Number.isFinite(num) && num >= 0 ? num : null;
        },
        renderHTML: (attributes) =>
          typeof attributes.start === "number" && attributes.start >= 0
            ? { "data-yt-start": String(attributes.start) }
            : {},
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-width");
          if (raw) {
            const num = Number(raw);
            return Number.isFinite(num) && num > 0 ? num : null;
          }
          const styleWidth = parseFloat(element.style.width);
          return Number.isFinite(styleWidth) && styleWidth > 0
            ? styleWidth
            : null;
        },
        renderHTML: (attributes) =>
          attributes.width ? { "data-width": String(attributes.width) } : {},
      },
      float: {
        default: "none",
        parseHTML: (element) =>
          element.getAttribute("data-float") || element.style.float || "none",
        renderHTML: (attributes) => ({
          "data-float": attributes.float || "none",
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: "div.yt-embed" },
      { tag: 'div[data-node-type="yt-embed"]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const videoId = isValidYoutubeId(node.attrs.videoId)
      ? node.attrs.videoId
      : "";
    const start =
      typeof node.attrs.start === "number" && node.attrs.start >= 0
        ? node.attrs.start
        : null;
    const width = node.attrs.width ? Number(node.attrs.width) : null;
    const float = (node.attrs.float as string) || "none";

    const style: string[] = [
      "aspect-ratio: 16 / 9",
      width ? `width: ${width}px` : "width: 100%",
      "max-width: 100%",
    ];
    if (float === "left") {
      style.push("float: left", "margin-right: 20px", "margin-bottom: 20px");
    } else if (float === "right") {
      style.push("float: right", "margin-left: 20px", "margin-bottom: 20px");
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}${
      start !== null ? `&t=${start}s` : ""
    }`;
    const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "yt-embed",
        "data-node-type": "yt-embed",
        "data-yt-id": videoId,
        ...(start !== null ? { "data-yt-start": String(start) } : {}),
        "data-float": float,
        style: style.join("; "),
      }),
      [
        "a",
        {
          class: "yt-embed-link",
          href: watchUrl,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        [
          "img",
          {
            class: "yt-embed-thumb",
            src: thumbUrl,
            alt: "YouTube video thumbnail",
            loading: "lazy",
          },
        ],
        [
          "span",
          {
            class: "yt-embed-play",
            "aria-label": "Play YouTube video",
          },
          "▶",
        ],
      ],
      [
        "div",
        { class: "yt-embed-footer" },
        [
          "a",
          {
            class: "yt-embed-watch",
            href: watchUrl,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Watch on YouTube",
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeEmbed:
        (options) =>
        ({ commands }) => {
          if (!isValidYoutubeId(options.videoId)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: {
              videoId: options.videoId,
              start: options.start ?? null,
              width: options.width ?? null,
              float: options.float ?? "none",
            },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const nodeTypeName = this.name;
    return [
      new Plugin({
        key: new PluginKey("youtubePaste"),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain")?.trim();
            if (!text) return false;
            const parsed = parseYoutubeUrl(text);
            if (!parsed) return false;

            const { $from, empty } = view.state.selection;
            if (
              !empty ||
              $from.parent.type.name !== "paragraph" ||
              $from.parent.content.size !== 0
            ) {
              return false;
            }

            const nodeType = view.state.schema.nodes[nodeTypeName];
            if (!nodeType) return false;

            event.preventDefault();
            const editorWidth = view.dom.clientWidth
              ? view.dom.clientWidth - 56
              : 640;
            const defaultWidth = Math.max(240, Math.min(640, editorWidth));

            const node = nodeType.create({
              videoId: parsed.videoId,
              start: parsed.start ?? null,
              width: defaultWidth,
              float: "none",
            });

            const from = $from.before($from.depth);
            const to = $from.after($from.depth);
            const tr = view.state.tr.replaceWith(from, to, node);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeEmbedComponent);
  },
});
