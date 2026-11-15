"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { ResizableImage } from "./ResizableImageNode";
import { ResizableVideo } from "./ResizableVideoNode";
import { PdfEmbed } from "./PdfEmbedNode";
import { YoutubeEmbed } from "./YoutubeEmbedNode";
import Toolbar from "./Toolbar";
import EditorMediaModal from "./EditorMediaModal";
import EditorYoutubeModal from "./EditorYoutubeModal";
import type { ParsedYoutubeUrl } from "./youtubeUtils";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "./FontSize";
import { useState, useEffect, useRef } from "react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}
export default function Editor({ content, onChange }: EditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const lastEmittedHtmlRef = useRef<string>(content);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-light underline cursor-pointer",
        },
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      ResizableImage,
      ResizableVideo,
      PdfEmbed,
      YoutubeEmbed,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
  });
  useEffect(() => {
    if (!editor) return;
    if (content === lastEmittedHtmlRef.current) return;
    if (content !== editor.getHTML()) {
      const timeoutId = setTimeout(() => {
        lastEmittedHtmlRef.current = content;
        editor.commands.setContent(content, { emitUpdate: false });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [content, editor]);
  const handleOpenMediaModal = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      savedSelectionRef.current = { from, to };
    }
    setIsMediaModalOpen(true);
  };

  const handleOpenYoutubeModal = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      savedSelectionRef.current = { from, to };
    }
    setIsYoutubeModalOpen(true);
  };

  const getTargetRange = () => {
    if (!editor) return 0;
    const docSize = editor.state.doc.content.size;
    const saved = savedSelectionRef.current;
    const fallbackPos = editor.state.selection.$from.end();
    return saved
      ? {
          from: Math.min(saved.from, docSize),
          to: Math.min(saved.to, docSize),
        }
      : Math.min(fallbackPos, docSize);
  };

  const handleYoutubeInsert = (parsed: ParsedYoutubeUrl) => {
    if (!editor) return;
    const targetRange = getTargetRange();
    const editorWidth = editor.view.dom.clientWidth
      ? editor.view.dom.clientWidth - 56
      : 640;
    const defaultWidth = Math.max(240, Math.min(640, editorWidth));

    editor
      .chain()
      .focus()
      .insertContentAt(targetRange, {
        type: "youtubeEmbed",
        attrs: {
          videoId: parsed.videoId,
          start: parsed.start ?? null,
          width: defaultWidth,
          float: "none",
        },
      })
      .run();

    savedSelectionRef.current = null;
    setIsYoutubeModalOpen(false);
  };

  const handleMediaSelect = (media: { url: string; type: string; alt?: string }) => {
    if (!editor) return;

    const docSize = editor.state.doc.content.size;
    const saved = savedSelectionRef.current;
    const fallbackPos = editor.state.selection.$from.end();
    const targetRange = saved
      ? {
          from: Math.min(saved.from, docSize),
          to: Math.min(saved.to, docSize),
        }
      : Math.min(fallbackPos, docSize);

    if (media.type === "IMAGE") {
      const editorWidth = editor.view.dom.clientWidth
        ? editor.view.dom.clientWidth - 56
        : 640;
      const defaultWidth = Math.max(240, Math.min(640, editorWidth));
      const defaultHeight = Math.round((defaultWidth * 9) / 16);

      editor
        .chain()
        .focus()
        .insertContentAt(targetRange, {
          type: "resizableImage",
          attrs: {
            src: media.url,
            alt: media.alt || "",
            width: defaultWidth,
            height: defaultHeight,
            aspectRatio: "16/9",
          },
        })
        .run();
    } else if (media.type === "VIDEO") {
      editor
        .chain()
        .focus()
        .insertContentAt(targetRange, {
          type: "resizableVideo",
          attrs: {
            src: media.url,
            width: 320,
            height: 320,
          },
        })
        .run();
    } else if (media.type === "PDF") {
      editor
        .chain()
        .focus()
        .insertContentAt(targetRange, {
          type: "pdfEmbed",
          attrs: {
            src: media.url,
            title: media.alt || "PDF Document",
          },
        })
        .run();
    }

    savedSelectionRef.current = null;
    setIsMediaModalOpen(false);
  };
  return (
    <div className="w-full flex flex-col border border-border rounded-xl overflow-clip bg-white shadow-sm">
      <div className="sticky top-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
        <Toolbar
          editor={editor}
          onOpenMediaModal={handleOpenMediaModal}
          onOpenYoutubeModal={handleOpenYoutubeModal}
        />
      </div>
      <div className="w-full min-w-0">
        <EditorContent editor={editor} className="w-full" />
      </div>
      <EditorMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
      <EditorYoutubeModal
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        onInsert={handleYoutubeInsert}
      />
    </div>
  );
}
