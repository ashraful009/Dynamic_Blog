import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as CommentController from "./comment.controller";

const router = Router({ mergeParams: true });

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
});
Object.defineProperty(commentLimiter, "name", { value: "rateLimit" });

router.post("/:id/comments", commentLimiter, CommentController.createComment);
router.get("/:id/comments", CommentController.getComments);

export default router;
