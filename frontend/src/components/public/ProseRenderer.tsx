"use client";

import React from "react";

interface ProseRendererProps {
  content: string;
}

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export default function ProseRenderer({ content }: ProseRendererProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Allow the explicit "Watch on YouTube" link to open YouTube directly
    if (target.closest("a.yt-embed-watch")) {
      return;
    }

    const link = target.closest("a.yt-embed-link") as HTMLAnchorElement | null;
    const wrapper = target.closest(".yt-embed") as HTMLElement | null;
    if (!link || !wrapper) return;

    const videoId = wrapper.getAttribute("data-yt-id");
    if (!videoId || !YOUTUBE_ID_RE.test(videoId)) return;

    e.preventDefault();
    const rawStart = wrapper.getAttribute("data-yt-start");
    const startParam =
      rawStart && /^\d+$/.test(rawStart) ? `&start=${rawStart}` : "";

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1${startParam}&rel=0`;
    iframe.allow =
      "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.title = "YouTube video";
    iframe.className = "yt-embed-iframe";

    link.replaceWith(iframe);
  };

  return (
    <div
      className="ProseMirror"
      onClick={handleClick}
      style={{
        padding: 0,
        minHeight: "auto",
        outline: "none",
        color: "var(--color-body)",
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
