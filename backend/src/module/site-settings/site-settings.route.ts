import { Router } from "express";
import { SiteSettingsController } from "./site-settings.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SiteSettingsValidation } from "./site-settings.validation";
const router = Router();
router.get("/", SiteSettingsController.getSettings);
router.patch(
  "/",
  auth,
  authorize("ADMIN"),
  validateRequest(SiteSettingsValidation.update),
  SiteSettingsController.updateSettings
);
export default router;
