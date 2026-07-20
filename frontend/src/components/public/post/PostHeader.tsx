import React from "react";
import Image from "next/image";
interface PostHeaderProps {
  category: string;
  title: string;
  excerpt?: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  readTime: number;
  coverImage?: string;
}
export default function PostHeader({
  category,
  title,
  excerpt,
  authorName,
  authorAvatar,
  publishedAt,
  readTime,
  coverImage,
}: PostHeaderProps) {
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return (
    <header className="mb-10 sm:mb-16">
      <p className="font-datum-mono text-[11px] tracking-[0.08em] uppercase text-datum-accent mb-4 sm:mb-6">{category}</p>
      <h1 className="font-datum-display font-bold text-[clamp(32px,5vw,56px)] leading-[1.1] tracking-[-0.02em] text-datum-ink mb-4 sm:mb-6">{title}</h1>
      {excerpt && <p className="text-[18px] sm:text-[22px] leading-relaxed text-datum-ink-soft mb-8 sm:mb-12 max-w-[800px]">{excerpt}</p>}
      <div className="flex items-center gap-4 py-6 border-y border-datum-line mb-10 sm:mb-16">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-datum-line shrink-0 relative flex items-center justify-center font-bold text-datum-ink text-sm">
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
        <div className="flex flex-col sm:flex-row sm:items-center text-[13px] sm:text-[14px] text-datum-ink-soft">
          <strong className="text-datum-ink font-medium">{authorName}</strong>
          <span className="hidden sm:inline mx-[7px] text-datum-line-strong">·</span>
          {new Date(publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <span className="hidden sm:inline mx-[7px] text-datum-line-strong">·</span>
          {readTime} min read
        </div>
      </div>
      {coverImage && (
        <>
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-4 bg-datum-line">
            <Image src={coverImage} alt={title} fill priority sizes="100vw" className="object-cover" />
          </div>
          <p className="font-datum-mono text-[11px] text-center text-datum-ink-faint">Cover image for {title}</p>
        </>
      )}
    </header>
  );
}
