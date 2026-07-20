import { Router } from "express";
import * as CommentController from "./comment.controller";

const router = Router({ mergeParams: true });

router.post("/:id/comments", CommentController.createComment);
router.get("/:id/comments", CommentController.getComments);

export default router;
