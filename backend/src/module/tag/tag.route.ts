import { Router } from "express";
import { TagController } from "./tag.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { TagValidation } from "./tag.validation";

const router = Router();

router.get("/", TagController.getAll);
router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validateRequest(TagValidation.create),
  TagController.create
);
router.patch(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(TagValidation.update),
  TagController.update
);
router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(TagValidation.delete),
  TagController.deleteTag
);

export default router;

