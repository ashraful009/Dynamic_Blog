import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { PostService } from "./post.service";
import { AuthRequest } from "../../middleware/auth";
const createPost = catchAsync(async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.id;
  const result = await PostService.createPost(authorId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});
const getAllPublished = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, categorySlug } = req.query;
  const result = await PostService.getAllPublished({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    search: search as string | undefined,
    categorySlug: categorySlug as string | undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getFeatured = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getFeatured();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Featured post retrieved successfully",
    data: result,
  });
});
const getRecentIndex = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const result = await PostService.getRecentIndex({
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Recent index posts retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getAllForAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.id;
  const { page, limit, status } = req.query;
  const result = await PostService.getAllForAdmin(authorId, {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    status: status as any,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  try {
    const result = await PostService.getBySlug(slug);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(`Error in getBySlug for slug: "${slug}"`, error);
    throw error;
  }
});
const getById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const authorId = req.user!.id;
  const result = await PostService.getById(id, authorId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});
const updatePost = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const authorId = req.user!.id;
  const result = await PostService.updatePost(id, authorId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});
const deletePost = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const authorId = req.user!.id;
  const result = await PostService.deletePost(id, authorId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});
export const PostController = {
  createPost,
  getAllPublished,
  getAllForAdmin,
  getFeatured,
  getRecentIndex,
  getBySlug,
  getById,
  updatePost,
  deletePost,
};
