import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  Undo,
  Redo,
} from "lucide-react";
interface ToolbarProps {
  editor: Editor | null;
  onOpenMediaModal: () => void;
}
export default function Toolbar({ editor, onOpenMediaModal }: ToolbarProps) {
  if (!editor) {
    return null;
  }
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-bg-elevated">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <select
        onChange={(e) => {
          if (e.target.value === "") {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(e.target.value).run();
          }
        }}
        value={editor.getAttributes("textStyle").fontFamily || ""}
        className="px-2 py-1.5 rounded-md border border-border bg-bg-card text-text-secondary text-[13px] hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors min-w-[130px] font-body"
        title="Font Family"
      >
        <option value="">Default Font</option>
        <option value="Inter, sans-serif">Inter</option>
        <option value="Outfit, sans-serif">Outfit</option>
        <option value="Roboto, sans-serif">Roboto</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Noto Sans Bengali', sans-serif">Noto Sans Bengali</option>
        <option value="Kalpurush, sans-serif">Kalpurush</option>
        <option value="'Hind Siliguri', sans-serif">Hind Siliguri</option>
        <option value="'Siyam Rupali', sans-serif">Siyam Rupali</option>
      </select>
      <select
        onChange={(e) => {
          if (e.target.value === "") {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(e.target.value).run();
          }
        }}
        value={editor.getAttributes("textStyle").fontSize || ""}
        className="px-2 py-1.5 rounded-md border border-border bg-bg-card text-text-secondary text-[13px] hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body"
        title="Font Size"
      >
        <option value="">Size</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="30px">30px</option>
        <option value="36px">36px</option>
      </select>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <AlignJustify size={16} />
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={16} />
      </ToolbarButton>
      <div className="w-px h-6 bg-border mx-1" />
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Insert Link"
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={onOpenMediaModal}
        title="Insert Media"
      >
        <ImageIcon size={16} />
        <Film size={16} style={{ marginLeft: "-4px" }} />
      </ToolbarButton>
    </div>
  );
}
