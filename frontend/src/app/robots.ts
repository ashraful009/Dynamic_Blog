import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    ...(siteUrl ? { sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
