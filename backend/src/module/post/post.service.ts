import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
import crypto from "crypto";
import { sanitizeHtml, stripHtml } from "../../utils/sanitize";
import { PostStatus } from "@prisma/client";
import { slugify } from "../../utils/slugify";

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
    categoryId?: string | null;
    categoryIds?: string[];
    tagIds?: string[];
  }
) => {
  const baseSlug = slugify(data.title);
  let slug: string;
  if (!baseSlug) {
    slug = crypto.randomBytes(4).toString("hex");
    let existingPost = await prisma.post.findUnique({ where: { slug } });
    while (existingPost) {
      slug = crypto.randomBytes(4).toString("hex");
      existingPost = await prisma.post.findUnique({ where: { slug } });
    }
  } else {
    slug = baseSlug;
    let count = 1;
    let existingPost = await prisma.post.findUnique({ where: { slug } });
    while (existingPost) {
      slug = `${baseSlug}-${count}`;
      count++;
      existingPost = await prisma.post.findUnique({ where: { slug } });
    }
  }
  const sanitizedContent = sanitizeHtml(data.content);
  const excerpt = data.excerpt || stripHtml(sanitizedContent).substring(0, 500);
  const metaTitle = data.metaTitle || data.title.substring(0, 160);
  const metaDescription =
    data.metaDescription || stripHtml(sanitizedContent).substring(0, 320);

  const uniqueCategoryIds = Array.from(
    new Set([
      ...(data.categoryIds || []),
      ...(data.categoryId ? [data.categoryId] : []),
    ])
  ).filter(Boolean);

  const primaryCategoryId = uniqueCategoryIds[0] || data.categoryId || null;
  const uniqueTagIds = Array.from(new Set(data.tagIds || [])).filter(Boolean);

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
      categoryId: primaryCategoryId,
      categories:
        uniqueCategoryIds.length > 0
          ? { connect: uniqueCategoryIds.map((id) => ({ id })) }
          : undefined,
      tags:
        uniqueTagIds.length > 0
          ? { connect: uniqueTagIds.map((id) => ({ id })) }
          : undefined,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
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
  tagSlug?: string;
}) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const andConditions: any[] = [{ status: "PUBLISHED" as PostStatus }];

  if (options.search) {
    andConditions.push({
      OR: [
        { title: { contains: options.search } },
        { excerpt: { contains: options.search } },
      ],
    });
  }

  if (options.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: options.categorySlug },
      include: { children: { select: { id: true } } },
    });
    if (category) {
      const categoryIds = [category.id, ...category.children.map((c) => c.id)];
      andConditions.push({
        OR: [
          { categoryId: { in: categoryIds } },
          { categories: { some: { id: { in: categoryIds } } } },
        ],
      });
    } else {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  if (options.tagSlug) {
    const tag = await prisma.tag.findUnique({
      where: { slug: options.tagSlug },
    });
    if (tag) {
      andConditions.push({
        tags: { some: { id: tag.id } },
      });
    } else {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  const where =
    andConditions.length === 1 ? andConditions[0] : { AND: andConditions };

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
        readTime: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  return post;
};

const getRecentIndex = async (options: { page?: number; limit?: number }) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
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
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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

const getAllForAdmin = async (
  authorId: string,
  options: { page?: number; limit?: number; status?: PostStatus },
  role?: string
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const where: any = role === "ADMIN" ? {} : { authorId };
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
        category: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
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
      category: {
        select: { id: true, name: true, slug: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
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
  prisma.post
    .update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error("Failed to increment views:", err));
  return post;
};

const getById = async (id: string, authorId: string, role?: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
      media: true,
    },
  });
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }
  if (role !== "ADMIN" && post.authorId !== authorId) {
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
    categoryIds?: string[];
    tagIds?: string[];
  },
  role?: string
) => {
  const existingPost = await prisma.post.findUnique({ where: { id } });
  if (!existingPost) {
    throw new ApiError(404, "Post not found.");
  }
  if (role !== "ADMIN" && existingPost.authorId !== authorId) {
    throw new ApiError(403, "You do not have permission to edit this post.");
  }

  const { categoryIds, tagIds, ...restData } = data;
  const updateData: any = { ...restData };

  if (data.content) {
    updateData.content = sanitizeHtml(data.content);
    if (!data.excerpt) {
      updateData.excerpt = stripHtml(updateData.content).substring(0, 500);
    }
  }
  if (
    data.status === "PUBLISHED" &&
    existingPost.status !== "PUBLISHED"
  ) {
    updateData.publishedAt = new Date();
  }

  if (categoryIds !== undefined) {
    const uniqueCats = Array.from(new Set(categoryIds)).filter(Boolean);
    updateData.categories = {
      set: uniqueCats.map((catId) => ({ id: catId })),
    };
    updateData.categoryId = uniqueCats[0] || null;
  } else if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId;
    updateData.categories = data.categoryId
      ? { set: [{ id: data.categoryId }] }
      : { set: [] };
  }

  if (tagIds !== undefined) {
    const uniqueTags = Array.from(new Set(tagIds)).filter(Boolean);
    updateData.tags = {
      set: uniqueTags.map((tId) => ({ id: tId })),
    };
  }

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
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

const deletePost = async (id: string, authorId: string, role?: string) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }
  if (role !== "ADMIN" && post.authorId !== authorId) {
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
