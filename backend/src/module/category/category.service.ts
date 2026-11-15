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
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ isSystem: "desc" }, { displayOrder: "asc" }, { name: "asc" }],
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
  const targetParentId = data.parentId || null;
  const maxOrder = await prisma.category.aggregate({
    where: { parentId: targetParentId },
    _max: { displayOrder: true },
  });
  const nextDisplayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: targetParentId,
      showInHeader: data.showInHeader ?? false,
      displayOrder: nextDisplayOrder,
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
  if (existingCategory.isSystem) {
    if (data.name !== undefined && data.name.trim() !== existingCategory.name) {
      throw new ApiError(400, "Cannot rename the protected দিনলিপি category");
    }
    if (data.slug !== undefined && data.slug.trim() !== existingCategory.slug) {
      throw new ApiError(400, "Cannot change the slug of the protected দিনলিপি category");
    }
    if (data.parentId !== undefined && data.parentId !== null) {
      throw new ApiError(400, "দিনলিপি must remain a top-level category");
    }
  }
  const updateData: any = { ...data };
  if (data.parentId === "") {
    updateData.parentId = null;
  }
  if (
    updateData.parentId !== undefined &&
    updateData.parentId !== existingCategory.parentId
  ) {
    const maxOrder = await prisma.category.aggregate({
      where: { parentId: updateData.parentId },
      _max: { displayOrder: true },
    });
    updateData.displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
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
  if (category.isSystem) {
    throw new ApiError(400, "Cannot delete the protected দিনলিপি category");
  }
  if (category._count.posts > 0 || category._count.multiPosts > 0) {
    throw new ApiError(400, "Cannot delete category with associated posts");
  }
  await prisma.category.delete({ where: { id } });
  return { id };
};

const reorder = async (data: {
  parentId: string | null;
  orderedIds: string[];
}) => {
  if (new Set(data.orderedIds).size !== data.orderedIds.length) {
    throw new ApiError(400, "Duplicate category IDs provided");
  }

  if (data.parentId === null) {
    const systemCat = await prisma.category.findFirst({
      where: { isSystem: true, parentId: null },
      select: { id: true },
    });
    if (systemCat && data.orderedIds[0] !== systemCat.id) {
      throw new ApiError(400, "দিনলিপি must remain the first top-level category");
    }
  }

  const existing = await prisma.category.findMany({
    where: {
      id: { in: data.orderedIds },
      parentId: data.parentId,
    },
    select: { id: true },
  });

  if (existing.length !== data.orderedIds.length) {
    throw new ApiError(
      400,
      "One or more category IDs do not belong to the specified parent group"
    );
  }

  await prisma.$transaction(
    data.orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  );

  return { parentId: data.parentId, orderedIds: data.orderedIds };
};

export const CategoryService = {
  getAll,
  create,
  update,
  deleteCategory,
  reorder,
};
