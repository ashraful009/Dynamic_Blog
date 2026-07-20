import { Router } from "express";
import { SubscriberController } from "./subscriber.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SubscriberValidation } from "./subscriber.validation";
const router = Router();
router.post(
  "/",
  validateRequest(SubscriberValidation.subscribe),
  SubscriberController.subscribe
);
router.get("/", auth, SubscriberController.getAll);
router.delete("/:id", auth, SubscriberController.deleteSubscriber);
export default router;
