import DatumHero from "@/components/public/datum/DatumHero";
import PageGrid from "@/components/public/PageGrid";
import PostFeed from "@/components/public/feed/PostFeed";
import Sidebar from "@/components/public/sidebar/Sidebar";

export const dynamic = "force-dynamic";

async function getHomepageData(page: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${apiUrl}/homepage?page=${page}&limit=5`, {
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

export default async function Homepage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1);
  const data = await getHomepageData(page);

  const settings = data?.settings || {};
  const recentPosts = data?.recentPosts || [];
  const sidebarRecentPosts = data?.sidebarRecentPosts || recentPosts;
  const pagination = data?.pagination;
  const categories = data?.categories || [];
  const tags = data?.tags || [];

  return (
    <main className="bg-page min-h-screen">
      <DatumHero settings={settings} />
      <PageGrid
        main={
          <PostFeed
            posts={recentPosts}
            readMoreText={settings?.readMoreBtnText || "READ MORE"}
            pagination={pagination}
            basePath="/"
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
    </main>
  );
}
