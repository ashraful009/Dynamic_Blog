import { Metadata } from "next";
import { notFound } from "next/navigation";
import DatumHero from "@/components/public/datum/DatumHero";
import PostFeed from "@/components/public/feed/PostFeed";
import Sidebar from "@/components/public/sidebar/Sidebar";

export const dynamic = "force-dynamic";

async function getCategoryPageData(slug: string, page: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const decodedSlug = decodeURIComponent(slug);

    const [homeRes, postsRes] = await Promise.all([
      fetch(`${apiUrl}/homepage`, { cache: "no-store" }),
      fetch(
        `${apiUrl}/posts?categorySlug=${encodeURIComponent(
          decodedSlug
        )}&page=${page}&limit=5`,
        { cache: "no-store" }
      ),
    ]);

    if (!homeRes.ok) return null;
    const homeJson = await homeRes.json();
    const homeData = homeJson.data || {};
    const categories = homeData.categories || [];

    const normalizeSlug = (s: string) => {
      try {
        return decodeURIComponent(s).normalize("NFC").trim();
      } catch {
        return s.normalize("NFC").trim();
      }
    };

    const targetSlug = normalizeSlug(decodedSlug);

    const findCat = (cats: any[]): any => {
      for (const c of cats) {
        if (
          normalizeSlug(c.slug) === targetSlug ||
          c.slug === decodedSlug ||
          c.slug === slug
        ) {
          return c;
        }
        if (c.children) {
          const found = findCat(c.children);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCat(categories);
    if (!category) return null;

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
      category,
      posts,
      meta,
      settings: homeData.settings || {},
      categories,
      sidebarRecentPosts: homeData.sidebarRecentPosts || homeData.recentPosts || [],
      tags: homeData.tags || [],
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageData(slug, 1);
  if (!data) {
    return { title: "Category Not Found" };
  }
  const siteName = data.settings?.siteName || "ফেরদৌস আনাম জীবন";
  return {
    title: `${data.category.name} – ${siteName}`,
    description: `${data.category.name} বিষয়ক সকল লেখা`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1);

  const data = await getCategoryPageData(slug, page);
  if (!data) {
    notFound();
  }

  const {
    category,
    posts,
    meta,
    settings,
    categories,
    sidebarRecentPosts,
    tags,
  } = data;

  const totalPages = Math.max(1, meta.totalPages || 1);

  return (
    <div className="bg-[#f2f2f2] min-h-screen">
      <DatumHero
        settings={settings}
        archiveLabel={`CATEGORY: ${category.name}`}
        pageLabel={`PAGE ${meta.page} OF ${totalPages}`}
      />

      <div className="w-[92%] lg:w-[82%] max-w-[1240px] mx-auto px-0 grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8 lg:gap-10 py-10 lg:py-14">
        <PostFeed
          posts={posts}
          readMoreText={settings?.readMoreBtnText || "READ MORE"}
          pagination={meta}
          basePath={`/category/${category.slug}`}
        />
        <Sidebar
          settings={settings}
          categories={categories}
          recentPosts={sidebarRecentPosts}
          tags={tags}
        />
      </div>
    </div>
  );
}
