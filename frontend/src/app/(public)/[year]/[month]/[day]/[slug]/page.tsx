import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import DatumHero from "@/components/public/datum/DatumHero";
import PageGrid from "@/components/public/PageGrid";
import Sidebar from "@/components/public/sidebar/Sidebar";
import PostProse from "@/components/public/post/PostProse";
import CommentsSection from "@/components/public/post/CommentsSection";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Category, Tag } from "@/types/blog";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${apiUrl}/posts/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch post");
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

async function getHomepageData() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${apiUrl}/homepage`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return null;
  }
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ year: string; month: string; day: string; slug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) {
    return { title: "Post Not Found" };
  }
  const previousImages = (await parent).openGraph?.images || [];
  const ogImages = post.coverImage
    ? [post.coverImage, ...previousImages]
    : previousImages;
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || "ফেরদৌস আনাম জীবন"],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: ogImages,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ year: string; month: string; day: string; slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, homeData] = await Promise.all([
    getPost(decodedSlug),
    getHomepageData(),
  ]);

  if (!post) {
    notFound();
  }

  const settings = homeData?.settings || {};
  const categories = homeData?.categories || [];
  const recentPosts =
    homeData?.sidebarRecentPosts || homeData?.recentPosts || [];
  const tags = homeData?.tags || [];

  const postCategories =
    post.categories && post.categories.length > 0
      ? post.categories
      : post.category
      ? [post.category]
      : [];

  const postDate = post.publishedAt || post.createdAt;
  const formattedDate =
    postDate && !isNaN(new Date(postDate).getTime())
      ? format(new Date(postDate), "MMMM d, yyyy").toUpperCase()
      : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: postDate,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author?.name || settings?.siteName || "ফেরদৌস আনাম জীবন",
    },
  };

  let modifiedContent = post.content || "";
  modifiedContent = modifiedContent.replace(
    /<h2([^>]*)>(.*?)<\/h2>/g,
    (match: string, attrs: string, innerHtml: string) => {
      if (/\bid\s*=/i.test(attrs)) {
        return match;
      }
      const text = innerHtml.replace(/<[^>]*>?/gm, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
        .replace(/(^-|-$)/g, "");
      return `<h2${attrs} id="${id}">${innerHtml}</h2>`;
    }
  );

  return (
    <main className="bg-page min-h-screen">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DatumHero settings={settings} />

      <PageGrid
        main={
          <article className="bg-surface p-6 sm:p-8 md:p-12 border border-line shadow-card min-w-0 break-words overflow-hidden">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-display font-bold leading-tight mb-4 text-heading">
              {post.title}
            </h1>

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
                    <time dateTime={postDate} className="text-link">
                      {formattedDate}
                    </time>
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
                          href={`/category/${cat.slug}`}
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

          {post.coverImage && (
            <div className="mb-8 relative w-full aspect-post overflow-hidden bg-surface-3 rounded-card">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 92vw, 56vw"
                className="absolute inset-0 h-full w-full object-cover object-center"
                priority
              />
            </div>
          )}

          <PostProse content={modifiedContent} />

          {/* Post Tags Cloud at bottom of article */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-line flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted mr-2">
                ট্যাগসমূহ:
              </span>
              {post.tags.map((tag: Tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-meta text-body bg-tag hover:bg-tag-hover hover:text-heading transition-colors rounded-l-pill rounded-r-control no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-link shrink-0" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          )}

          <CommentsSection postId={post.id} />
        </article>
        }
        sidebar={
          <Sidebar
            settings={settings}
            categories={categories}
            recentPosts={recentPosts}
            tags={tags}
          />
        }
      />
    </main>
  );
}
