import { z } from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Category name is required",
    }),
    slug: z.string().optional(),
    parentId: z.string().nullable().optional(),
    showInHeader: z.boolean().optional(),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    parentId: z.string().nullable().optional(),
    showInHeader: z.boolean().optional(),
  }),
});

const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
});

const reorderCategorySchema = z.object({
  body: z.object({
    parentId: z.string().uuid("Invalid parent category ID").nullable(),
    orderedIds: z
      .array(z.string().uuid("Invalid category ID"))
      .min(1, "orderedIds must not be empty"),
  }),
});

export const CategoryValidation = {
  create: createCategorySchema,
  update: updateCategorySchema,
  delete: deleteCategorySchema,
  reorder: reorderCategorySchema,
};
