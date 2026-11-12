import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
import { slugify } from "../../utils/slugify";

const getAll = async () => {
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
      multiPosts: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
      parent: true,
      children: {
        include: {
          posts: {
            where: { status: "PUBLISHED" },
            select: { id: true },
          },
          multiPosts: {
            where: { status: "PUBLISHED" },
            select: { id: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Compute distinct published post count per category (including direct + multiPosts, and child posts for parent categories)
  return categories.map((cat) => {
    const directIds = new Set<string>([
      ...cat.posts.map((p) => p.id),
      ...cat.multiPosts.map((p) => p.id),
    ]);

    const childrenWithCounts = cat.children.map((child) => {
      const childPostIds = new Set<string>([
        ...child.posts.map((p) => p.id),
        ...child.multiPosts.map((p) => p.id),
      ]);
      childPostIds.forEach((id) => directIds.add(id));
      const { posts: _p, multiPosts: _mp, ...restChild } = child;
      return {
        ...restChild,
        _count: { posts: childPostIds.size },
      };
    });

    const { posts: _p, multiPosts: _mp, ...restCat } = cat;
    return {
      ...restCat,
      children: childrenWithCounts,
      _count: {
        posts: directIds.size,
      },
    };
  });
};

const create = async (data: {
  name: string;
  slug?: string;
  parentId?: string | null;
  showInHeader?: boolean;
}) => {
  let slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const existingCategory = await prisma.category.findFirst({
    where: { OR: [{ name: data.name }, { slug }] },
  });
  if (existingCategory) {
    if (existingCategory.name === data.name) {
      throw new ApiError(400, "Category with this name already exists");
    }
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }
  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: data.parentId || null,
      showInHeader: data.showInHeader ?? false,
    },
  });
  return category;
};

const update = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    showInHeader?: boolean;
  }
) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }
  const updateData: any = { ...data };
  if (data.parentId === "") {
    updateData.parentId = null;
  }
  if (data.name && data.name !== existingCategory.name) {
    const nameConflict = await prisma.category.findFirst({
      where: { name: data.name, id: { not: id } },
    });
    if (nameConflict) throw new ApiError(400, "Category name already exists");
    if (!data.slug) {
      updateData.slug = slugify(data.name);
    }
  }
  if (updateData.slug && updateData.slug !== existingCategory.slug) {
    let newSlug = slugify(updateData.slug);
    const slugConflict = await prisma.category.findFirst({
      where: { slug: newSlug, id: { not: id } },
    });
    if (slugConflict) {
      newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 8)}`;
    }
    updateData.slug = newSlug;
  }
  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });
  return category;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { posts: true, multiPosts: true } },
    },
  });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  if (category._count.posts > 0 || category._count.multiPosts > 0) {
    throw new ApiError(400, "Cannot delete category with associated posts");
  }
  await prisma.category.delete({ where: { id } });
  return { id };
};

export const CategoryService = {
  getAll,
  create,
  update,
  deleteCategory,
};
