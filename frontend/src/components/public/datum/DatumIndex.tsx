"use client";
import Link from "next/link";
import { Eye } from "lucide-react";
import Image from "next/image";
import { getPostUrl } from "@/utils/postUrl";
interface DatumIndexProps {
  posts: Record<string, unknown>[] | any[];
}
export default function DatumIndex({ posts }: DatumIndexProps) {
  if (!posts || posts.length === 0) return null;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  return (
    <section className="py-10 sm:py-14 lg:py-20 border-b border-datum-line" id="index">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-11">
        <div className="flex items-baseline justify-between mb-6 sm:mb-8 pb-3 border-b border-datum-line">
          <h2 className="font-datum-display font-semibold text-[13px] sm:text-[14px] tracking-[0.06em] uppercase text-datum-ink">
            Recent Index
          </h2>
          <span className="font-datum-mono text-[11px] tracking-[0.08em] text-datum-ink-faint">
            {posts.length} trending
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-8 sm:gap-10 mt-8 sm:mt-10">
          {posts.map((post) => (
            <Link
              href={getPostUrl(post)}
              key={post.id}
              className="group flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 items-start no-underline text-inherit"
            >
              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-[16px] sm:text-[18px] font-bold leading-[1.4] font-datum-display text-datum-ink transition-colors group-hover:text-datum-accent">
                  {post.title}
                </h3>
                <div className="flex flex-col gap-2 text-[13px] text-datum-ink-soft mt-auto">
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : "Recently"}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {post.views || 0} views
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-[140px] h-[200px] sm:h-[100px] shrink-0 rounded-lg overflow-hidden bg-datum-line/30 relative">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 140px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30 text-sm">
                    No Image
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
