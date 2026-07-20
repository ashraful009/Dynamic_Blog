import { z } from "zod";
export const MediaValidation = {
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
      id: z.string({ required_error: "Media ID is required" }),
    }),
  }),
};
