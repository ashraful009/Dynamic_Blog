import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { SubscriberService } from "./subscriber.service";
const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await SubscriberService.subscribe(email);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscribed successfully",
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await SubscriberService.getAll({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscribers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const deleteSubscriber = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await SubscriberService.deleteSubscriber(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscriber deleted successfully",
    data: result,
  });
});
export const SubscriberController = {
  subscribe,
  getAll,
  deleteSubscriber,
};
