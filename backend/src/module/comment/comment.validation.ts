import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  authorName: z.string().min(1, "Name is required"),
  authorEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  parentId: z.string().uuid("Invalid parent comment ID").optional(),
});
