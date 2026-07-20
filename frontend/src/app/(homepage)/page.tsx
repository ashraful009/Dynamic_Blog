import DatumHero from "@/components/public/datum/DatumHero";
import DatumFooter from "@/components/public/datum/DatumFooter";
import PostFeed from "@/components/public/feed/PostFeed";
import Sidebar from "@/components/public/sidebar/Sidebar";
export const dynamic = "force-dynamic";
async function getHomepageData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/homepage`, {
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
export default async function Homepage() {
  const data = await getHomepageData();
  const settings = data?.settings || {};
  const featuredPost = data?.featuredPost || null;
  const recentPosts = data?.recentPosts || [];
  const categories = data?.categories || [];

  return (
    <>
      <main>
        <DatumHero settings={settings} />
        <div className="w-[90%] lg:w-[80%] max-w-[1600px] mx-auto px-0 grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-12 py-12 lg:py-16">
          <PostFeed posts={recentPosts} />
          <Sidebar settings={settings} categories={categories} recentPosts={recentPosts} />
        </div>
      </main>
      <DatumFooter settings={settings} />
    </>
  );
}
