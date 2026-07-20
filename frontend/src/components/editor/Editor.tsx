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
import Toolbar from "./Toolbar";
import EditorMediaModal from "./EditorMediaModal";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "./FontSize";
import { useState, useEffect } from "react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}
export default function Editor({ content, onChange }: EditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
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
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const timeoutId = setTimeout(() => {
        editor.commands.setContent(content);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [content, editor]);
  const handleMediaSelect = (media: { url: string; type: string; alt?: string }) => {
    if (!editor) return;
    if (media.type === "IMAGE") {
      editor
        .chain()
        .focus()
        .setResizableImage({
          src: media.url,
          alt: media.alt || "",
          width: 320,
          height: 320,
        })
        .run();
    } else if (media.type === "VIDEO") {
      editor
        .chain()
        .focus()
        .setResizableVideo({
          src: media.url,
          width: 320,
          height: 320,
        })
        .run();
    }
  };
  return (
    <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-bg-tertiary h-full min-h-[700px] shadow-sm">
      <div className="sticky top-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
        <Toolbar editor={editor} onOpenMediaModal={() => setIsMediaModalOpen(true)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-10 flex justify-center custom-scrollbar">
        <div className="w-full flex justify-center">
          <EditorContent editor={editor} />
        </div>
      </div>
      <EditorMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
