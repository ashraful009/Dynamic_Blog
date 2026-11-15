import { NodeViewWrapper } from "@tiptap/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlignLeft,
  AlignRight,
  AlignCenter,
  Play,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function YoutubeEmbedComponent(props: any) {
  const { node, updateAttributes, selected, deleteNode } = props;
  const { videoId, start, width = 640, float = "none" } = node.attrs;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, w: 0 });

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(direction);
    if (boxRef.current) {
      startPos.current = {
        x: e.clientX,
        w: boxRef.current.clientWidth,
      };
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = e.clientX - startPos.current.x;
      let newWidth = startPos.current.w;
      if (activeHandle.includes("r")) newWidth += dx;
      if (activeHandle.includes("l")) newWidth -= dx;
      newWidth = Math.max(160, Math.round(newWidth));
      updateAttributes({ width: newWidth });
    },
    [isResizing, activeHandle, updateAttributes]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setActiveHandle("");
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}${
    typeof start === "number" && start >= 0 ? `&t=${start}s` : ""
  }`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${
    typeof start === "number" && start >= 0 ? `&start=${start}` : ""
  }`;
  const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <NodeViewWrapper
      as="div"
      className={`media-wrapper yt-embed-editor ${selected ? "selected" : ""}`}
      style={{
        float: float === "none" ? undefined : float,
        display: "block",
        width: width ? `${width}px` : "100%",
        maxWidth: "100%",
        position: "relative",
        marginLeft:
          float === "right" ? "20px" : float === "none" ? "0" : undefined,
        marginRight:
          float === "left" ? "20px" : float === "none" ? "0" : undefined,
        marginTop: "12px",
        marginBottom: "16px",
      }}
      data-float={float}
    >
      <div
        ref={boxRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black"
      >
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            className="w-full h-full border-0 block"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full p-0 border-0 bg-black cursor-pointer block group"
            contentEditable={false}
            title="Play YouTube video"
          >
            <img
              src={thumbUrl}
              alt="YouTube video thumbnail"
              draggable={false}
              className="w-full h-full object-cover block"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
              <span className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play size={26} fill="currentColor" className="ml-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div
        className="flex items-center justify-between px-2 py-1 text-xs text-text-muted"
        contentEditable={false}
      >
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ExternalLink size={12} />
          Watch on YouTube
        </a>
        {typeof start === "number" && start > 0 && (
          <span>Starts at {start}s</span>
        )}
      </div>

      <div className="media-float-controls" contentEditable={false}>
        <button
          type="button"
          className={`media-float-btn ${float === "left" ? "active" : ""}`}
          onClick={() => updateAttributes({ float: "left" })}
          title="Float Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          className={`media-float-btn ${float === "none" ? "active" : ""}`}
          onClick={() => updateAttributes({ float: "none" })}
          title="Default (Block)"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          className={`media-float-btn ${float === "right" ? "active" : ""}`}
          onClick={() => updateAttributes({ float: "right" })}
          title="Float Right"
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          className="media-float-btn hover:!bg-red-600"
          onClick={() => deleteNode()}
          title="Remove YouTube Video"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {selected && (
        <>
          <div
            className="media-resizer top-left"
            onMouseDown={(e) => handleMouseDown(e, "tl")}
          />
          <div
            className="media-resizer top-right"
            onMouseDown={(e) => handleMouseDown(e, "tr")}
          />
          <div
            className="media-resizer bottom-left"
            onMouseDown={(e) => handleMouseDown(e, "bl")}
          />
          <div
            className="media-resizer bottom-right"
            onMouseDown={(e) => handleMouseDown(e, "br")}
          />
          <div
            className="media-resizer left-center"
            style={{
              left: "-5px",
              top: "50%",
              cursor: "ew-resize",
              marginTop: "-5px",
            }}
            onMouseDown={(e) => handleMouseDown(e, "l")}
          />
          <div
            className="media-resizer right-center"
            style={{
              right: "-5px",
              top: "50%",
              cursor: "ew-resize",
              marginTop: "-5px",
            }}
            onMouseDown={(e) => handleMouseDown(e, "r")}
          />
        </>
      )}
    </NodeViewWrapper>
  );
}
