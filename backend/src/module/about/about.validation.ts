import { z } from "zod";

const updateAboutSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      designation: z.string().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      biography: z.string().nullable().optional(),
      profileImage: z.string().nullable().optional(),
      signatureImage: z.string().nullable().optional(),
      skills: z.any().optional(),
    })
    .passthrough(),
});

export const AboutValidation = {
  update: updateAboutSchema,
};

