import React from "react";
import Link from "next/link";
import Image from "next/image";

import toast from "react-hot-toast";
import { getPostUrl } from "@/utils/postUrl";

interface PostFooterProps {
  authorName: string;
  authorBio?: string;
  authorAvatar?: string;
  nextPost?: { title: string; slug: string; createdAt?: string; publishedAt?: string };
  prevPost?: { title: string; slug: string; createdAt?: string; publishedAt?: string };
}

export default function PostFooter({
  authorName,
  authorBio,
  authorAvatar,
  nextPost,
  prevPost,
}: PostFooterProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <footer className="mt-12 pt-8 border-t border-datum-line">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider text-datum-ink-soft">
          <span className="px-2 py-1 bg-datum-surface border border-datum-line rounded">Reading</span>
          <span className="px-2 py-1 bg-datum-surface border border-datum-line rounded">Article</span>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-datum-bg hover:bg-datum-surface border border-datum-line text-datum-ink transition-colors" type="button" aria-label="Copy link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 12a4 4 0 0 0 5.5 1.5l3-3a4 4 0 0 0-5.5-5.5L10.5 6.5"/><path d="M15 12a4 4 0 0 0-5.5-1.5l-3 3a4 4 0 0 0 5.5 5.5l1.5-1.5"/></svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-datum-bg hover:bg-datum-surface border border-datum-line text-datum-ink transition-colors" type="button" aria-label="Share by email">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-datum-bg hover:bg-datum-surface border border-datum-line text-datum-ink transition-colors" type="button" aria-label="Share">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4"/></svg>
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-center p-6 bg-datum-surface rounded-xl border border-datum-line mb-12">
        <div className="w-16 h-16 shrink-0 rounded-full bg-datum-ink text-white flex items-center justify-center text-xl font-bold font-datum-display overflow-hidden relative">
          {authorAvatar ? (
            <Image 
              src={authorAvatar} 
              alt={authorName} 
              fill
              className="object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-datum-display text-xl font-bold text-datum-ink m-0">{authorName}</h3>
          <p className="text-datum-ink-soft text-sm m-0 leading-snug font-datum-body">{authorBio || "Author at Zibon Vlog"}</p>
          <button className="mt-3 px-4 py-1.5 bg-datum-ink hover:bg-datum-accent text-white text-sm font-semibold rounded transition-colors" type="button">Follow</button>
        </div>
      </div>

      {(prevPost || nextPost) && (
        <nav className="flex flex-col md:flex-row gap-4 border-t border-datum-line pt-8 pb-12 font-datum-display">
          {prevPost ? (
            <Link className="flex-1 p-5 rounded-xl border border-datum-line bg-datum-surface hover:border-datum-accent/50 hover:-translate-y-1 transition-all no-underline text-datum-ink" href={getPostUrl(prevPost)}>
              <span className="block text-xs uppercase tracking-widest text-datum-ink-soft font-datum-body mb-2">← Previous</span>
              <span className="block text-lg font-semibold leading-tight">{prevPost.title}</span>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
          {nextPost ? (
            <Link className="flex-1 p-5 rounded-xl border border-datum-line bg-datum-surface hover:border-datum-accent/50 hover:-translate-y-1 transition-all no-underline text-datum-ink text-right" href={getPostUrl(nextPost)}>
              <span className="block text-xs uppercase tracking-widest text-datum-ink-soft font-datum-body mb-2">Next →</span>
              <span className="block text-lg font-semibold leading-tight">{nextPost.title}</span>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
        </nav>
      )}
    </footer>
  );
}
