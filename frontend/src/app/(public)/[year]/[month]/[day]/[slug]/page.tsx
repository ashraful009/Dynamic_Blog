import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import DatumHero from "@/components/public/datum/DatumHero";
import Sidebar from "@/components/public/sidebar/Sidebar";
import PostProse from "@/components/public/post/PostProse";
import CommentsSection from "@/components/public/post/CommentsSection";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

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
    /<h2[^>]*>(.*?)<\/h2>/g,
    (_match: string, innerHtml: string) => {
      const text = innerHtml.replace(/<[^>]*>?/gm, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
        .replace(/(^-|-$)/g, "");
      return `<h2 id="${id}">${innerHtml}</h2>`;
    }
  );

  return (
    <main className="bg-[#f2f2f2] min-h-screen">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DatumHero settings={settings} />

      <div className="w-[92%] lg:w-[82%] max-w-[1240px] mx-auto px-0 grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8 lg:gap-10 py-10 lg:py-14">
        <article className="bg-white p-6 sm:p-8 md:p-12 border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-w-0 break-words overflow-hidden">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-[38px] font-bold leading-[1.3] mb-4 text-[#111]">
              {post.title}
            </h1>

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
                    <time dateTime={postDate} className="text-[#e53935]">
                      {formattedDate}
                    </time>
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
            <div className="mb-8 overflow-hidden relative w-full bg-gray-50">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
                priority
              />
            </div>
          )}

          <PostProse content={modifiedContent} />

          {/* Post Tags Cloud at bottom of article */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">
                ট্যাগসমূহ:
              </span>
              {post.tags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-[12px] text-[#333] bg-[#e6e6e6] hover:bg-[#e53935] hover:text-white transition-colors rounded-l-full rounded-r-xs no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          )}

          <CommentsSection postId={post.id} />
        </article>

        <Sidebar
          settings={settings}
          categories={categories}
          recentPosts={recentPosts}
          tags={tags}
        />
      </div>
    </main>
  );
}
