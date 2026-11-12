import { Request, Response } from "express";
import * as CommentService from "./comment.service";
import { createCommentSchema } from "./comment.validation";
import sendResponse from "../../response/sendResponse";
import catchAsync from "../../utils/catchAsync";

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // postId
  const validatedData = createCommentSchema.parse(req.body);

  const comment = await CommentService.createComment(id as string, validatedData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // postId

  const comments = await CommentService.getCommentsByPost(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comments retrieved successfully",
    data: comments,
  });
});
