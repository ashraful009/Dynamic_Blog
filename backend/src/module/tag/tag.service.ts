import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
import { slugify } from "../../utils/slugify";

const getAll = async () => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return tags;
};

const create = async (data: { name: string; slug?: string }) => {
  let slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const existingTag = await prisma.tag.findFirst({
    where: { OR: [{ name: data.name }, { slug }] },
  });
  if (existingTag) {
    if (existingTag.name === data.name) {
      throw new ApiError(400, "Tag with this name already exists");
    }
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      slug,
    },
  });
  return tag;
};

const update = async (id: string, data: { name?: string; slug?: string }) => {
  const existingTag = await prisma.tag.findUnique({ where: { id } });
  if (!existingTag) {
    throw new ApiError(404, "Tag not found");
  }
  const updateData: any = { ...data };
  if (data.name && data.name !== existingTag.name) {
    const nameConflict = await prisma.tag.findFirst({
      where: { name: data.name, id: { not: id } },
    });
    if (nameConflict) throw new ApiError(400, "Tag name already exists");
    if (!data.slug) {
      updateData.slug = slugify(data.name);
    }
  }
  if (updateData.slug && updateData.slug !== existingTag.slug) {
    let newSlug = slugify(updateData.slug);
    const slugConflict = await prisma.tag.findFirst({
      where: { slug: newSlug, id: { not: id } },
    });
    if (slugConflict) {
      newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 8)}`;
    }
    updateData.slug = newSlug;
  }
  const tag = await prisma.tag.update({
    where: { id },
    data: updateData,
  });
  return tag;
};

const deleteTag = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }
  await prisma.tag.delete({ where: { id } });
  return { id };
};

export const TagService = {
  getAll,
  create,
  update,
  deleteTag,
};

