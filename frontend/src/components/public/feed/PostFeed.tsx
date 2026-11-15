import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getPostUrl } from "@/utils/postUrl";
import PostProse from "@/components/public/post/PostProse";
import type { Category, PaginationMeta, Post } from "@/types/blog";
import { SYSTEM_HOME_CATEGORY_SLUG } from "@/constants/category";

const extractPdfEmbeds = (html?: string | null): string => {
  if (!html || !html.includes("pdf-embed")) return "";
  const matches = html.match(
    /<div[^>]*class=["'][^"']*pdf-embed[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/g
  );
  return matches ? matches.join("") : "";
};

const extractFirstYoutubeEmbed = (html?: string | null): string => {
  if (!html || !html.includes("yt-embed")) return "";
  const match = html.match(
    /<div[^>]*class=["'][^"']*yt-embed[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/
  );
  return match ? match[0] : "";
};

interface PostFeedProps {
  posts: Post[];
  readMoreText?: string;
  pagination?: PaginationMeta;
  basePath?: string;
}

export default function PostFeed({
  posts,
  readMoreText = "READ MORE",
  pagination,
  basePath = "/",
}: PostFeedProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-surface p-12 text-center text-muted border border-line">
        কোনো লেখা পাওয়া যায়নি। (No posts found.)
      </div>
    );
  }

  const getPageHref = (pageNum: number) => {
    if (pageNum <= 1) return basePath;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${pageNum}`;
  };

  return (
    <div className="flex flex-col gap-8">
      {posts.map((post, index) => {
        const postDate = post.publishedAt || post.createdAt;
        const formattedDate =
          postDate && !isNaN(new Date(postDate).getTime())
            ? format(new Date(postDate), "MMMM d, yyyy").toUpperCase()
            : "";

        // Combine multi-categories (or fallback to primary category)
        const postCategories =
          post.categories && post.categories.length > 0
            ? post.categories
            : post.category
            ? [post.category]
            : [];

        // Split excerpt into paragraphs for multi-paragraph preview (like shuhanrizwan.com)
        const paragraphs = post.excerpt
          ? post.excerpt
              .split(/\n+/)
              .map((p: string) => p.trim())
              .filter(Boolean)
          : [];

        return (
          <article
            key={post.id}
            className="bg-surface p-6 sm:p-8 md:p-12 border border-line shadow-card"
          >
            <header className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-headline font-bold leading-tight mb-4">
                <Link
                  href={getPostUrl(post)}
                  className="text-heading no-underline transition-colors hover:text-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                >
                  {post.title}
                </Link>
              </h2>

              {/* Metadata Bar: BY সুহান রিজওয়ান / ON JULY 22, 2026 / IN খেলা, ফুটবল, বিবিধ */}
              <div className="text-meta text-muted font-semibold tracking-wider uppercase flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-line pb-4">
                <span>
                  BY{" "}
                  <Link
                    href="/about"
                    className="text-link hover:text-link-hover hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                  >
                    {post.author?.name || "ফেরদৌস আনাম জীবন"}
                  </Link>
                </span>

                {formattedDate && (
                  <>
                    <span className="text-faint">/</span>
                    <span>
                      ON{" "}
                      <Link
                        href={getPostUrl(post)}
                        className="text-link hover:text-link-hover hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                      >
                        <time dateTime={postDate || undefined}>{formattedDate}</time>
                      </Link>
                    </span>
                  </>
                )}

                {postCategories.length > 0 && (
                  <>
                    <span className="text-faint">/</span>
                    <span>
                      IN{" "}
                      {postCategories.map((cat: Category, idx: number) => (
                        <span key={cat.id}>
                          <Link
                            href={
                              cat.isSystem ||
                              cat.slug === SYSTEM_HOME_CATEGORY_SLUG
                                ? "/"
                                : `/category/${cat.slug}`
                            }
                            className="text-link hover:text-link-hover hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 rounded-control"
                          >
                            {cat.name}
                          </Link>
                          {idx < postCategories.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </div>
            </header>

            {post.coverImage ? (
              <Link
                href={getPostUrl(post)}
                className="block mb-7 relative w-full aspect-post overflow-hidden bg-surface-3 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 92vw, 56vw"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 hover:opacity-95"
                />
              </Link>
            ) : (
              (() => {
                const ytHtml = extractFirstYoutubeEmbed(post.content);
                return ytHtml ? (
                  <div className="mb-7">
                    <PostProse content={ytHtml} />
                  </div>
                ) : null;
              })()
            )}

            <div className="text-body text-body leading-article mb-7 space-y-4">
              {paragraphs.length > 0 ? (
                paragraphs.map((para: string, i: number) => {
                  const isEditorialBracket =
                    para.startsWith("[") && para.endsWith("]");
                  return (
                    <p
                      key={i}
                      className={
                        isEditorialBracket
                          ? "italic text-link font-medium"
                          : ""
                      }
                    >
                      {para}
                    </p>
                  );
                })
              ) : (
                <p>বিস্তারিত পড়তে নিচের বাটনে ক্লিক করুন।</p>
              )}
              {(() => {
                const pdfHtml = extractPdfEmbeds(post.content);
                return pdfHtml ? <PostProse content={pdfHtml} /> : null;
              })()}
            </div>

            <div>
              <Link
                href={getPostUrl(post)}
                className="inline-block px-5 py-2.5 text-meta font-bold uppercase tracking-wider text-heading bg-surface-2 border border-line-strong hover:bg-primary hover:text-on-primary hover:border-primary transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
              >
                {readMoreText || "READ MORE"}
              </Link>
            </div>
          </article>
        );
      })}

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="bg-surface px-6 py-4 border border-line flex items-center justify-between flex-wrap gap-4"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            PAGE {pagination.page} OF {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {pagination.page > 1 && (
              <Link
                href={getPageHref(pagination.page - 1)}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-line-strong text-heading hover:bg-primary hover:text-on-primary hover:border-primary transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={getPageHref(pageNum)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0 ${
                    pageNum === pagination.page
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-2 text-heading border-line-strong hover:bg-primary-hover hover:text-page hover:border-primary-hover"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={getPageHref(pagination.page + 1)}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-line-strong text-heading hover:bg-primary hover:text-on-primary hover:border-primary transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
              >
                Next →
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
