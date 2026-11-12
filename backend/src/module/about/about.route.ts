import { Router } from "express";
import { AboutController } from "./about.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { AboutValidation } from "./about.validation";

const router = Router();

router.get("/", AboutController.getAboutPage);
router.put(
  "/",
  auth,
  authorize("ADMIN"),
  validateRequest(AboutValidation.update),
  AboutController.updateAboutPage
);

export default router;
