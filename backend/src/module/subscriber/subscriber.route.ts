import { Router } from "express";
import rateLimit from "express-rate-limit";
import { SubscriberController } from "./subscriber.controller";
import { auth, authorize } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SubscriberValidation } from "./subscriber.validation";

const router = Router();

const subscriberLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many subscription attempts, please try again later.",
  },
});
Object.defineProperty(subscriberLimiter, "name", { value: "rateLimit" });

router.post(
  "/",
  subscriberLimiter,
  validateRequest(SubscriberValidation.subscribe),
  SubscriberController.subscribe
);
router.get("/", auth, authorize("ADMIN"), SubscriberController.getAll);
router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  validateRequest(SubscriberValidation.delete),
  SubscriberController.deleteSubscriber
);
export default router;
