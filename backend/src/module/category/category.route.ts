import { Router } from "express";
import { CategoryController } from "./category.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";
const router = Router();
router.get("/", CategoryController.getAll);
router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validateRequest(CategoryValidation.create),
  CategoryController.create
);
router.patch(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(CategoryValidation.update),
  CategoryController.update
);
router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(CategoryValidation.delete),
  CategoryController.deleteCategory
);
export default router;
