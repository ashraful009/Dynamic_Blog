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

export const CategoryValidation = {
  create: createCategorySchema,
  update: updateCategorySchema,
  delete: deleteCategorySchema,
};
