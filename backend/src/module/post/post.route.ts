import { Router } from "express";
import { PostController } from "./post.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { PostValidation } from "./post.validation";
const router = Router();
router.get("/admin/list", auth, authorize("ADMIN"), PostController.getAllForAdmin);
router.get(
  "/admin/:id",
  auth,
  authorize("ADMIN"),
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
  authorize("ADMIN"),
  validateRequest(PostValidation.create),
  PostController.createPost
);
router.patch(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(PostValidation.update),
  PostController.updatePost
);
router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(PostValidation.getById),
  PostController.deletePost
);
export default router;
