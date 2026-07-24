import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Header from "@/components/public/Header";
import DatumHero from "@/components/public/datum/DatumHero";
import Sidebar from "@/components/public/sidebar/Sidebar";
import PostProse from "@/components/public/post/PostProse";
import CommentsSection from "@/components/public/post/CommentsSection";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
async function getPost(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://zibon-blog.onrender.com/api/v1"}/posts/${slug}`, {
      next: { revalidate: 60 },
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://zibon-blog.onrender.com/api/v1"}/homepage`, {
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
  { params }: { params: Promise<{ year: string; month: string; day: string; slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  const previousImages = (await parent).openGraph?.images || [];
  const ogImages = post.coverImage ? [post.coverImage, ...previousImages] : previousImages;
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: ["Zibon Vlog"],
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
export default async function PostPage({ params }: { params: Promise<{ year: string; month: string; day: string; slug: string }> }) {
  const { slug } = await params;
  const [post, homeData] = await Promise.all([
    getPost(slug),
    getHomepageData()
  ]);

  if (!post) {
    notFound();
  }

  const settings = homeData?.settings || {};
  const categories = homeData?.categories || [];
  const recentPosts = homeData?.recentPosts || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "Zibon Vlog",
      url: "https://zibonvlog.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Zibon Vlog",
      logo: {
        "@type": "ImageObject",
        url: "https://zibonvlog.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zibonvlog.com/posts/${post.slug}`,
    },
  };
  let modifiedContent = post.content || "";
  const toc: { id: string; text: string }[] = [];
  modifiedContent = modifiedContent.replace(/<h2[^>]*>(.*?)<\/h2>/g, (match: string, innerHtml: string) => {
    const text = innerHtml.replace(/<[^>]*>?/gm, '').trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
    if (id && text) {
      toc.push({ id, text });
    }
    return `<h2 id="${id}">${innerHtml}</h2>`;
  });
  const readTime = Math.ceil((modifiedContent.split(/\s+/).length) / 200) || 5;
  return (
    <>
      <main className="min-h-screen">
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DatumHero settings={settings} />

        <div className="w-[90%] lg:w-[80%] max-w-[1600px] mx-auto px-0 py-12 lg:py-16">
          <header className="mb-10 lg:w-[70%] lg:pr-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight mb-5 text-text">
              {post.title}
            </h1>
            <div className="text-[13px] text-text-muted font-medium tracking-wide uppercase flex flex-wrap items-center gap-1 border-b border-border pb-5">
              <span>By</span>
              <span className="text-text-secondary">{post.author?.name || "Admin"}</span>
              <span>on</span>
              <time dateTime={post.createdAt}>
                {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                  ? format(new Date(post.createdAt), "MMMM d, yyyy") 
                  : "Unknown Date"}
              </time>
              {post.category && (
                <>
                  <span>in</span>
                  <Link href={`/category/${post.category.slug}`} className="text-primary hover:underline transition-all">
                    {post.category.name}
                  </Link>
                </>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-12">
            <article className="min-w-0 pb-10 break-words overflow-hidden">

            {post.coverImage && (
              <div className="mb-10 overflow-hidden rounded-md relative w-full bg-bg-secondary">
                <Image 
                  src={post.coverImage} 
                  alt={post.title} 
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  priority
                />
              </div>
            )}

            <PostProse content={modifiedContent} />
            <CommentsSection postId={post.id} />
          </article>

            <Sidebar settings={settings} categories={categories} recentPosts={recentPosts} />
          </div>
        </div>
      </main>
    </>
  );
}
