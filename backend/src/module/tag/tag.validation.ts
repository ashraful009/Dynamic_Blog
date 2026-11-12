import { z } from "zod";

const createTagSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Tag name is required",
    }).min(1, "Tag name is required"),
    slug: z.string().optional(),
  }),
});

const updateTagSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid tag ID"),
  }),
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
  }),
});

const deleteTagSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid tag ID"),
  }),
});

export const TagValidation = {
  create: createTagSchema,
  update: updateTagSchema,
  delete: deleteTagSchema,
};

