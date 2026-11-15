import { z } from "zod";
export const MediaValidation = {
  getAll: z.object({
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      type: z.enum(["IMAGE", "VIDEO", "PDF"]).optional(),
    }),
  }),
  upload: z.object({
    body: z.object({
      alt: z
        .string()
        .max(255, "Alt text must not exceed 255 characters")
        .optional(),
      postId: z.string().uuid("Invalid post ID").optional(),
    }),
  }),
  delete: z.object({
    params: z.object({
      id: z.string().uuid("Invalid media ID"),
    }),
  }),
  linkToPost: z.object({
    params: z.object({
      id: z.string().uuid("Invalid media ID"),
    }),
    body: z.object({
      postId: z.string().uuid("Invalid post ID"),
    }),
  }),
};
