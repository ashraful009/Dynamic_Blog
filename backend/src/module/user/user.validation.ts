import { z } from "zod";
export const UserValidation = {
  login: z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format"),
      password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required"),
    }),
  }),
  updateProfile: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),
      avatar: z.string().url("Invalid avatar URL").optional(),
    }),
  }),
};
