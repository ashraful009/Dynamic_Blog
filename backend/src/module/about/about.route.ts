import { Router } from "express";
import { AboutController } from "./about.controller";
import { auth, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", AboutController.getAboutPage);
router.put("/", auth, authorize("ADMIN"), AboutController.updateAboutPage);

export default router;
