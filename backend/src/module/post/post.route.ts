import { Router } from "express";
import { PostController } from "./post.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { PostValidation } from "./post.validation";
const router = Router();
router.get("/admin/list", auth, PostController.getAllForAdmin);
router.get(
  "/admin/:id",
  auth,
  validateRequest(PostValidation.getById),
  PostController.getById
);
router.get("/featured", PostController.getFeatured);
router.get("/recent-index", PostController.getRecentIndex);
router.get("/", PostController.getAllPublished);
router.get(
  "/:slug",
  validateRequest(PostValidation.getBySlug),
  PostController.getBySlug
);
router.post(
  "/",
  auth,
  validateRequest(PostValidation.create),
  PostController.createPost
);
router.patch(
  "/:id",
  auth,
  validateRequest(PostValidation.update),
  PostController.updatePost
);
router.delete(
  "/:id",
  auth,
  validateRequest(PostValidation.getById),
  PostController.deletePost
);
export default router;
