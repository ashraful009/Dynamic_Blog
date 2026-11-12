import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getPostUrl } from "@/utils/postUrl";

interface PostFeedProps {
  posts: any[];
  readMoreText?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
      <div className="bg-white p-12 text-center text-gray-500 border border-gray-200">
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
      {posts.map((post) => {
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
            className="bg-white p-6 sm:p-8 md:p-12 border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <header className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold leading-[1.3] mb-4">
                <Link
                  href={getPostUrl(post)}
                  className="text-[#111111] no-underline transition-colors hover:text-[#e53935]"
                >
                  {post.title}
                </Link>
              </h2>

              {/* Metadata Bar: BY সুহান রিজওয়ান / ON JULY 22, 2026 / IN খেলা, ফুটবল, বিবিধ */}
              <div className="text-[11px] sm:text-[12px] text-gray-500 font-semibold tracking-wider uppercase flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-gray-200 pb-4">
                <span>
                  BY{" "}
                  <Link
                    href="/about"
                    className="text-[#e53935] hover:underline no-underline"
                  >
                    {post.author?.name || "ফেরদৌস আনাম জীবন"}
                  </Link>
                </span>

                {formattedDate && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span>
                      ON{" "}
                      <Link
                        href={getPostUrl(post)}
                        className="text-[#e53935] hover:underline no-underline"
                      >
                        <time dateTime={postDate}>{formattedDate}</time>
                      </Link>
                    </span>
                  </>
                )}

                {postCategories.length > 0 && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span>
                      IN{" "}
                      {postCategories.map((cat: any, idx: number) => (
                        <span key={cat.id}>
                          <Link
                            href={`/category/${cat.slug}`}
                            className="text-[#e53935] hover:underline no-underline"
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

            {post.coverImage && (
              <Link
                href={getPostUrl(post)}
                className="block mb-7 overflow-hidden relative w-full bg-gray-50"
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  className="transition-opacity duration-300 hover:opacity-95"
                />
              </Link>
            )}

            <div className="text-[#222222] text-[15px] md:text-[16px] leading-[1.85] mb-7 space-y-4">
              {paragraphs.length > 0 ? (
                paragraphs.map((para: string, i: number) => {
                  const isEditorialBracket =
                    para.startsWith("[") && para.endsWith("]");
                  return (
                    <p
                      key={i}
                      className={
                        isEditorialBracket
                          ? "italic text-[#a33b10] font-medium"
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
            </div>

            <div>
              <Link
                href={getPostUrl(post)}
                className="inline-block px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#111111] bg-white border border-[#222222] hover:bg-[#111111] hover:text-white transition-colors no-underline"
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
          className="bg-white px-6 py-4 border border-gray-200 flex items-center justify-between flex-wrap gap-4"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            PAGE {pagination.page} OF {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {pagination.page > 1 && (
              <Link
                href={getPageHref(pagination.page - 1)}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-gray-300 text-[#111] hover:bg-[#111] hover:text-white transition-colors no-underline"
              >
                ← Prev
              </Link>
            )}
            {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={getPageHref(pageNum)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-colors no-underline ${
                    pageNum === pagination.page
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#111] border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={getPageHref(pagination.page + 1)}
                className="px-3 py-1.5 text-xs font-bold uppercase border border-gray-300 text-[#111] hover:bg-[#111] hover:text-white transition-colors no-underline"
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
