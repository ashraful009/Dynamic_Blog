import { Router } from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";
const router = Router();
router.get("/", CategoryController.getAll);
router.post(
  "/",
  auth,
  validateRequest(CategoryValidation.create),
  CategoryController.create
);
router.patch(
  "/:id",
  auth,
  validateRequest(CategoryValidation.update),
  CategoryController.update
);
router.delete("/:id", auth, CategoryController.deleteCategory);
export default router;
