import { NodeViewWrapper } from "@tiptap/react";
import { FileText, ExternalLink, Trash2 } from "lucide-react";

export default function PdfEmbedComponent(props: any) {
  const { node, selected, deleteNode } = props;
  const { src, title = "PDF Document" } = node.attrs;

  return (
    <NodeViewWrapper
      className={`pdf-embed-editor ${selected ? "selected" : ""}`}
      data-node-type="pdf-embed"
    >
      <div className="pdf-embed-toolbar" contentEditable={false}>
        <div className="flex items-center gap-2 min-w-0 text-xs font-medium text-text-secondary">
          <FileText size={14} className="shrink-0 text-primary" />
          <span className="truncate">{title || "PDF Document"}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-bg-tertiary text-text-secondary hover:text-text no-underline"
              title="Open PDF in new tab"
            >
              <ExternalLink size={12} />
              Open
            </a>
          )}
          <button
            type="button"
            onClick={() => deleteNode()}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-danger/10 text-danger hover:bg-danger/20 border-none cursor-pointer"
            title="Remove PDF"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      </div>

      <div className="pdf-embed">
        <iframe
          src={src}
          title={title || "PDF Document"}
          className="pdf-embed-frame"
          loading="lazy"
        />
        <div className="pdf-embed-fallback" contentEditable={false}>
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open PDF in new tab
          </a>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
