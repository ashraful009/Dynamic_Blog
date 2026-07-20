import prisma from "../../db";
import { SiteSettingsService } from "../site-settings/site-settings.service";
import { PostService } from "../post/post.service";
const getHomepageData = async () => {
  const [settings, featuredPost, recentPostsRes, totalPosts, categories] = await Promise.all([
    SiteSettingsService.getSettings(),
    PostService.getFeatured(),
    PostService.getRecentIndex({ limit: 10 }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.category.findMany({
      include: {
        children: true
      },
      orderBy: { name: 'asc' }
    }),
  ]);
  return {
    settings,
    featuredPost,
    recentPosts: recentPostsRes.data,
    totalPosts,
    categories,
  };
};
export const HomepageService = {
  getHomepageData,
};
