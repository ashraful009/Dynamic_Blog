import prisma from "../../db";
import { ApiError } from "../../middleware/globalErrorHandler";
const subscribe = async (email: string) => {
  const existingSubscriber = await prisma.subscriber.findUnique({
    where: { email },
  });
  if (existingSubscriber) {
    return existingSubscriber;
  }
  const subscriber = await prisma.subscriber.create({
    data: { email },
  });
  return subscriber;
};
const getAll = async (options: { page?: number; limit?: number }) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const [total, subscribers] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);
  return {
    data: subscribers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const deleteSubscriber = async (id: string) => {
  const subscriber = await prisma.subscriber.findUnique({ where: { id } });
  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }
  await prisma.subscriber.delete({ where: { id } });
  return { id };
};
export const SubscriberService = {
  subscribe,
  getAll,
  deleteSubscriber,
};
