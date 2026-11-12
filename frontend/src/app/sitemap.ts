import { MetadataRoute } from "next";
import { getPostUrl } from "@/utils/postUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000")
  ).replace(/\/$/, "");

  const apiBase = (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/api/v1")
  ).replace(/\/$/, "");

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl || "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  if (!apiBase) {
    return routes;
  }

  try {
    const res = await fetch(`${apiBase}/posts?limit=1000`, {
      next: { revalidate: 3600 },
    });
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
