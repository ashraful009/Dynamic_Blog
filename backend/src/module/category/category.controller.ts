import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { CategoryService } from "./category.service";
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAll();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});
const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});
const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CategoryService.update(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CategoryService.deleteCategory(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});
export const CategoryController = {
  getAll,
  create,
  update,
  deleteCategory,
};
