import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { MediaService } from "./media.service";
import { ApiError } from "../../middleware/globalErrorHandler";
const upload = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded. Please attach a file.");
  }
  const result = await MediaService.upload(req.file, {
    alt: req.body.alt,
    postId: req.body.postId,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "File uploaded successfully",
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, type } = req.query;
  const result = await MediaService.getAll({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    type: type as any,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Media retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await MediaService.deleteMedia(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Media deleted successfully",
    data: result,
  });
});
const linkToPost = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { postId } = req.body;
  const result = await MediaService.linkToPost(id, postId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Media linked to post successfully",
    data: result,
  });
});
export const MediaController = {
  upload,
  getAll,
  deleteMedia,
  linkToPost,
};
