import { z } from "zod";
export const PostValidation = {
  create: z.object({
    body: z.object({
      title: z
        .string({ required_error: "Title is required" })
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title must not exceed 255 characters"),
      content: z
        .string({ required_error: "Content is required" })
        .min(10, "Content must be at least 10 characters"),
      excerpt: z
        .string()
        .max(500, "Excerpt must not exceed 500 characters")
        .optional(),
      coverImage: z.string().url("Invalid cover image URL").optional(),
      metaTitle: z
        .string()
        .max(160, "Meta title must not exceed 160 characters")
        .optional(),
      metaDescription: z
        .string()
        .max(320, "Meta description must not exceed 320 characters")
        .optional(),
      ogImage: z.string().url("Invalid OG image URL").optional(),
      status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      isFeatured: z.boolean().optional(),
      readTime: z.number().int().positive().optional(),
      displayOrder: z.number().int().optional(),
      categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
    }),
  }),
  update: z.object({
    params: z.object({
      id: z.string({ required_error: "Post ID is required" }),
    }),
    body: z.object({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title must not exceed 255 characters")
        .optional(),
      content: z
        .string()
        .min(10, "Content must be at least 10 characters")
        .optional(),
      excerpt: z
        .string()
        .max(500, "Excerpt must not exceed 500 characters")
        .optional(),
      coverImage: z.string().url("Invalid cover image URL").optional().nullable(),
      metaTitle: z
        .string()
        .max(160, "Meta title must not exceed 160 characters")
        .optional()
        .nullable(),
      metaDescription: z
        .string()
        .max(320, "Meta description must not exceed 320 characters")
        .optional()
        .nullable(),
      ogImage: z.string().url("Invalid OG image URL").optional().nullable(),
      status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      isFeatured: z.boolean().optional(),
      readTime: z.number().int().positive().optional().nullable(),
      displayOrder: z.number().int().optional().nullable(),
      categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
    }),
  }),
  getBySlug: z.object({
    params: z.object({
      slug: z
        .string({ required_error: "Slug is required" })
        .min(1, "Slug is required"),
    }),
  }),
  getById: z.object({
    params: z.object({
      id: z.string({ required_error: "Post ID is required" }),
    }),
  }),
};
