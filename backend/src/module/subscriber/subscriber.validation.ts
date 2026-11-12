import { z } from "zod";
const subscribeSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format"),
  }),
});
const deleteSubscriberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid subscriber ID"),
  }),
});

export const SubscriberValidation = {
  subscribe: subscribeSchema,
  delete: deleteSubscriberSchema,
};
