import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
import crypto from "crypto";
import { sanitizeHtml, stripHtml } from "../../utils/sanitize";
import { PostStatus } from "@prisma/client";
const createPost = async (
  authorId: string,
  data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    status?: PostStatus;
    isFeatured?: boolean;
    readTime?: number;
    displayOrder?: number;
    categoryId?: string;
  }
) => {
  let slug = crypto.randomBytes(4).toString("hex");
  let existingPost = await prisma.post.findUnique({ where: { slug } });
  while (existingPost) {
    slug = crypto.randomBytes(4).toString("hex");
    existingPost = await prisma.post.findUnique({ where: { slug } });
  }
  const sanitizedContent = sanitizeHtml(data.content);
  const excerpt = data.excerpt || stripHtml(sanitizedContent).substring(0, 300);
  const metaTitle = data.metaTitle || data.title.substring(0, 160);
  const metaDescription =
    data.metaDescription || stripHtml(sanitizedContent).substring(0, 320);
  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      content: sanitizedContent,
      excerpt,
      coverImage: data.coverImage,
      metaTitle,
      metaDescription,
      ogImage: data.ogImage || data.coverImage,
      status: data.status || "DRAFT",
      authorId,
      isFeatured: data.isFeatured || false,
      readTime: data.readTime,
      displayOrder: data.displayOrder,
      categoryId: data.categoryId,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
  if (data.isFeatured) {
    await prisma.post.updateMany({
      where: { id: { not: post.id } },
      data: { isFeatured: false },
    });
  }
  return post;
};
const getAllPublished = async (options: {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
}) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const where: any = { status: "PUBLISHED" as PostStatus };
  if (options.search) {
    where.OR = [
      { title: { contains: options.search } },
      { excerpt: { contains: options.search } },
    ];
  }
  if (options.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: options.categorySlug },
      include: { children: { select: { id: true } } }
    });
    if (category) {
      const categoryIds = [category.id, ...category.children.map(c => c.id)];
      where.categoryId = { in: categoryIds };
    } else {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }
  }
  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
  ]);
  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const getFeatured = async () => {
  const post = await prisma.post.findFirst({
    where: { status: "PUBLISHED" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
  return post;
};
const getRecentIndex = async (options: { limit?: number }) => {
  const limit = options.limit || 10;
  const [total, posts] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
        displayOrder: true,
        publishedAt: true,
        createdAt: true,
        views: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { views: "desc" },
      take: limit,
    }),
  ]);
  return {
    data: posts,
    meta: {
      page: 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const getAllForAdmin = async (
  authorId: string,
  options: { page?: number; limit?: number; status?: PostStatus }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const where: any = { authorId };
  if (options.status) {
    where.status = options.status;
  }
  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
  ]);
  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const getBySlug = async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      media: {
        select: {
          id: true,
          publicId: true,
          secureUrl: true,
          type: true,
          hlsUrl: true,
          width: true,
          height: true,
          alt: true,
        },
      },
    },
  });
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }
  if (post.status !== "PUBLISHED") {
    throw new ApiError(404, "Post not found.");
  }
  prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } }
  }).catch(err => console.error("Failed to increment views:", err));
  return post;
};
const getById = async (id: string, authorId: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      media: true,
    },
  });
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }
  if (post.authorId !== authorId) {
    throw new ApiError(403, "You do not have permission to view this post.");
  }
  return post;
};
const updatePost = async (
  id: string,
  authorId: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    status?: PostStatus;
    isFeatured?: boolean;
    readTime?: number | null;
    displayOrder?: number | null;
    categoryId?: string | null;
  }
) => {
  const existingPost = await prisma.post.findUnique({ where: { id } });
  if (!existingPost) {
    throw new ApiError(404, "Post not found.");
  }
  if (existingPost.authorId !== authorId) {
    throw new ApiError(403, "You do not have permission to edit this post.");
  }
  const updateData: any = { ...data };
  if (data.title && data.title !== existingPost.title) {
    // Slugs are randomly generated once and shouldn't change on title update to prevent broken links
  }
  if (data.content) {
    updateData.content = sanitizeHtml(data.content);
    if (!data.excerpt) {
      updateData.excerpt = stripHtml(updateData.content).substring(0, 300);
    }
  }
  if (
    data.status === "PUBLISHED" &&
    existingPost.status !== "PUBLISHED"
  ) {
    updateData.publishedAt = new Date();
  }
  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
  if (data.isFeatured) {
    await prisma.post.updateMany({
      where: { id: { not: post.id } },
      data: { isFeatured: false },
    });
  }
  return post;
};
const deletePost = async (id: string, authorId: string) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }
  if (post.authorId !== authorId) {
    throw new ApiError(403, "You do not have permission to delete this post.");
  }
  await prisma.post.delete({ where: { id } });
  return { id };
};
export const PostService = {
  createPost,
  getAllPublished,
  getAllForAdmin,
  getFeatured,
  getRecentIndex,
  getBySlug,
  getById,
  updatePost,
  deletePost,
};
