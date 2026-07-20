import { z } from "zod";
const createCategorySchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Category name is required",
    }),
    slug: z.string().optional(),
    parentId: z.string().optional(),
  }),
});
const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    parentId: z.string().optional(),
  }),
});
export const CategoryValidation = {
  create: createCategorySchema,
  update: updateCategorySchema,
};
