import { Metadata } from "next";
import { notFound } from "next/navigation";
import DatumHero from "@/components/public/datum/DatumHero";
import PageGrid from "@/components/public/PageGrid";
import PostFeed from "@/components/public/feed/PostFeed";
import Sidebar from "@/components/public/sidebar/Sidebar";
import type { Tag } from "@/types/blog";

export const dynamic = "force-dynamic";

async function getTagPageData(slug: string, page: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const decodedSlug = decodeURIComponent(slug);

    const [homeRes, postsRes] = await Promise.all([
      fetch(`${apiUrl}/homepage`, { cache: "no-store" }),
      fetch(
        `${apiUrl}/posts?tagSlug=${encodeURIComponent(
          decodedSlug
        )}&page=${page}&limit=5`,
        { cache: "no-store" }
      ),
    ]);

    if (!homeRes.ok) return null;
    const homeJson = await homeRes.json();
    const homeData = homeJson.data || {};
    const tags = homeData.tags || [];

    const normalizeSlug = (s: string) => {
      try {
        return decodeURIComponent(s).normalize("NFC").trim();
      } catch {
        return s.normalize("NFC").trim();
      }
    };

    const targetSlug = normalizeSlug(decodedSlug);

    const tag = tags.find(
      (t: Tag) =>
        normalizeSlug(t.slug) === targetSlug ||
        t.slug === decodedSlug ||
        t.slug === slug
    );
    if (!tag) return null;

    let posts = [];
    let meta = { page: 1, limit: 5, total: 0, totalPages: 1 };
    if (postsRes.ok) {
      const postsJson = await postsRes.json();
      posts = postsJson.data || [];
      if (postsJson.meta) {
        meta = postsJson.meta;
      }
    }

    return {
      tag,
      posts,
      meta,
      settings: homeData.settings || {},
      categories: homeData.categories || [],
      sidebarRecentPosts:
        homeData.sidebarRecentPosts || homeData.recentPosts || [],
      tags,
    };
  } catch (error) {
    console.error("Error fetching tag data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTagPageData(slug, 1);
  if (!data) {
    return { title: "Tag Not Found" };
  }
  const siteName = data.settings?.siteName || "ফেরদৌস আনাম জীবন";
  return {
    title: `${data.tag.name} – ${siteName}`,
    description: `${data.tag.name} বিষয়ক সকল লেখা`,
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1);

  const data = await getTagPageData(slug, page);
  if (!data) {
    notFound();
  }

  const {
    tag,
    posts,
    meta,
    settings,
    categories,
    sidebarRecentPosts,
    tags,
  } = data;

  const totalPages = Math.max(1, meta.totalPages || 1);

  return (
    <div className="bg-page min-h-screen">
      <DatumHero
        settings={settings}
        archiveLabel={`TAG: ${tag.name}`}
        pageLabel={`PAGE ${meta.page} OF ${totalPages}`}
      />

      <PageGrid
        main={
          <PostFeed
            posts={posts}
            readMoreText={settings?.readMoreBtnText || "READ MORE"}
            pagination={meta}
            basePath={`/tag/${tag.slug}`}
          />
        }
        sidebar={
          <Sidebar
            settings={settings}
            categories={categories}
            recentPosts={sidebarRecentPosts}
            tags={tags}
          />
        }
      />
    </div>
  );
}

