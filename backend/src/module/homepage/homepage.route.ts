import { Router } from "express";
import { HomepageController } from "./homepage.controller";
const router = Router();
router.get("/", HomepageController.getHomepageData);
export default router;
