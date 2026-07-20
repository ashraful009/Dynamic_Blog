"use client";
import Link from "next/link";
import Image from "next/image";
import { getPostUrl } from "@/utils/postUrl";
interface DatumFeaturedProps {
  post: Record<string, unknown> | any;
}
export default function DatumFeatured({ post }: DatumFeaturedProps) {
  if (!post) return null;
  return (
    <section className="py-10 sm:py-14 lg:py-20 border-b border-datum-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-11">
        <div className="flex items-baseline justify-between mb-6 sm:mb-8 pb-3 border-b border-datum-line">
          <h2 className="font-datum-display font-semibold text-[13px] sm:text-[14px] tracking-[0.06em] uppercase text-datum-ink">
            Currently Featured
          </h2>
          <span className="font-datum-mono text-[11px] tracking-[0.08em] text-datum-ink-faint">index 001</span>
        </div>
        <Link
          href={getPostUrl(post)}
          className="group relative grid grid-cols-1 md:grid-cols-2 bg-datum-surface border border-datum-line no-underline text-inherit transition-all duration-200 hover:border-datum-accent/30 hover:shadow-lg"
        >
          <div className="corner-bracket corner-bracket-tl" />
          <div className="corner-bracket corner-bracket-tr" />
          <div className="corner-bracket corner-bracket-bl" />
          <div className="corner-bracket corner-bracket-br" />
          <div className="aspect-[4/3] md:aspect-auto bg-datum-surface bg-dot-grid-featured md:border-r border-datum-line relative">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-datum-line-strong/20" />
            )}
          </div>
          <div className="p-6 sm:p-8 lg:p-[52px] flex flex-col justify-center">
            <div className="font-datum-mono text-[11px] tracking-[0.08em] uppercase text-datum-ink-faint mb-4">
              {post.category?.name || "Uncategorized"} • {post.readTime || 5} min read
            </div>
            <h3 className="font-datum-display font-bold text-[clamp(22px,3vw,32px)] leading-[1.2] text-datum-ink mb-3 transition-colors group-hover:text-datum-accent">
              {post.title}
            </h3>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-datum-ink-soft mb-6 line-clamp-3">
              {post.excerpt || "Click to read the full post..."}
            </p>
            <span className="font-datum-mono text-[12px] tracking-[0.06em] uppercase text-datum-accent font-medium">
              Read the note
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
