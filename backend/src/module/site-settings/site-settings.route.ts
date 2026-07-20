import { Router } from "express";
import { SiteSettingsController } from "./site-settings.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SiteSettingsValidation } from "./site-settings.validation";
const router = Router();
router.get("/", SiteSettingsController.getSettings);
router.patch(
  "/",
  auth,
  validateRequest(SiteSettingsValidation.update),
  SiteSettingsController.updateSettings
);
export default router;
