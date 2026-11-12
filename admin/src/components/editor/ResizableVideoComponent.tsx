import { NodeViewWrapper } from "@tiptap/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AlignLeft, AlignRight, AlignCenter } from "lucide-react";
export default function ResizableVideoComponent(props: any) {
  const { node, updateAttributes, selected } = props;
  const { src, width = 320, height = 320, float, transformX = 0, transformY = 0 } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(direction);
    if (videoRef.current) {
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        w: videoRef.current.clientWidth,
        h: videoRef.current.clientHeight,
      };
    }
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    let newWidth = startPos.current.w;
    let newHeight = startPos.current.h;
    if (activeHandle.includes("r")) newWidth += dx;
    if (activeHandle.includes("l")) newWidth -= dx;
    if (activeHandle.includes("b")) newHeight += dy;
    if (activeHandle.includes("t")) newHeight -= dy;
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);
    updateAttributes({
      width: newWidth,
      height: newHeight,
    });
  }, [isResizing, activeHandle, updateAttributes]);
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setActiveHandle("");
  }, []);
  const handleVideoMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startX: transformX,
      startY: transformY,
    };
  };
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    updateAttributes({
      transformX: dragStartPos.current.startX + dx,
      transformY: dragStartPos.current.startY + dy,
    });
  }, [isDragging, updateAttributes]);
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isResizing, isDragging, handleMouseMove, handleMouseUp, handleDragMove, handleDragEnd]);
  const setFloat = (direction: "left" | "right" | "none") => {
    updateAttributes({ float: direction, transformX: 0, transformY: 0 });
  };
  return (
    <NodeViewWrapper
      as="span"
      className={`media-wrapper ${selected ? "selected" : ""}`}
      style={{
        float: float === "none" ? undefined : float,
        display: "inline-block",
        width: "fit-content",
        position: "relative",
        transform: "none",
        marginLeft: float === "none" ? "4px" : float === "left" ? `${Math.max(0, transformX)}px` : `20px`,
        marginRight: float === "none" ? "4px" : float === "right" ? `${Math.max(0, -transformX)}px` : `20px`,
        marginTop: float === "none" ? "4px" : `${Math.max(0, transformY)}px`,
        marginBottom: float === "none" ? "4px" : "20px",
        clear: undefined,
        zIndex: isDragging ? 50 : 10,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      data-float={float}
      onMouseDown={handleVideoMouseDown}
    >
      <video
        ref={videoRef}
        controls
        src={src}
        draggable={false}
        style={{
          width: width ? `${width}px` : "320px",
          height: height ? `${height}px` : "320px",
          objectFit: "fill",
          maxWidth: "100%",
          display: "block",
        }}
      />
      <div className="media-float-controls" contentEditable={false}>
        <button
          className={`media-float-btn ${float === "left" ? "active" : ""}`}
          onClick={() => setFloat("left")}
          title="Float Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          className={`media-float-btn ${float === "none" ? "active" : ""}`}
          onClick={() => setFloat("none")}
          title="Default (Inline)"
        >
          <AlignCenter size={14} />
        </button>
        <button
          className={`media-float-btn ${float === "right" ? "active" : ""}`}
          onClick={() => setFloat("right")}
          title="Float Right"
        >
          <AlignRight size={14} />
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
            className="media-resizer top-center"
            style={{ top: "-5px", left: "50%", cursor: "ns-resize", marginLeft: "-5px" }}
            onMouseDown={(e) => handleMouseDown(e, "t")}
          />
          <div
            className="media-resizer bottom-center"
            style={{ bottom: "-5px", left: "50%", cursor: "ns-resize", marginLeft: "-5px" }}
            onMouseDown={(e) => handleMouseDown(e, "b")}
          />
          <div
            className="media-resizer left-center"
            style={{ left: "-5px", top: "50%", cursor: "ew-resize", marginTop: "-5px" }}
            onMouseDown={(e) => handleMouseDown(e, "l")}
          />
          <div
            className="media-resizer right-center"
            style={{ right: "-5px", top: "50%", cursor: "ew-resize", marginTop: "-5px" }}
            onMouseDown={(e) => handleMouseDown(e, "r")}
          />
        </>
      )}
    </NodeViewWrapper>
  );
}
