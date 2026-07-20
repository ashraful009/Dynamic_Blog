import { Request, Response } from "express";
import * as CommentService from "./comment.service";
import { createCommentSchema } from "./comment.validation";
import sendResponse from "../../response/sendResponse";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // postId
    const validatedData = createCommentSchema.parse(req.body);

    const comment = await CommentService.createComment(id as string, validatedData);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // postId

    const comments = await CommentService.getCommentsByPost(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
