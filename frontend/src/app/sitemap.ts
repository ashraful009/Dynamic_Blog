import { MetadataRoute } from "next";
import { getPostUrl } from "@/utils/postUrl";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "http://localhost:3000";
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
  try {
    const res = await fetch("http://localhost:5000/api/v1/posts?limit=1000");
    if (res.ok) {
      const json = await res.json();
      const posts = json.data || [];
      const postRoutes = posts.map((post: any) => ({
        url: `${baseUrl}${getPostUrl(post)}`,
        lastModified: new Date(post.publishedAt || post.createdAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
      return [...routes, ...postRoutes];
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
  return routes;
}
