import prisma from "../../db";
import { SiteSettingsService } from "../site-settings/site-settings.service";
import { PostService } from "../post/post.service";
import { CategoryService } from "../category/category.service";
import { TagService } from "../tag/tag.service";

const getHomepageData = async (options?: { page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 5;

  const [settings, featuredPost, recentPostsRes, sidebarRecentRes, totalPosts, categories, tags] =
    await Promise.all([
      SiteSettingsService.getSettings(),
      PostService.getFeatured(),
      PostService.getRecentIndex({ page, limit }),
      PostService.getRecentIndex({ page: 1, limit: 10 }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      CategoryService.getAll(),
      TagService.getAll(),
    ]);

  return {
    settings,
    featuredPost,
    recentPosts: recentPostsRes.data,
    sidebarRecentPosts: sidebarRecentRes.data,
    pagination: recentPostsRes.meta,
    totalPosts,
    categories,
    tags,
  };
};

export const HomepageService = {
  getHomepageData,
};
