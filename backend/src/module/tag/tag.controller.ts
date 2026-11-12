import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { TagService } from "./tag.service";

const getAll = catchAsync(async (_req: Request, res: Response) => {
  const result = await TagService.getAll();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tags retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await TagService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tag created successfully",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TagService.update(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tag updated successfully",
    data: result,
  });
});

const deleteTag = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TagService.deleteTag(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tag deleted successfully",
    data: result,
  });
});

export const TagController = {
  getAll,
  create,
  update,
  deleteTag,
};

