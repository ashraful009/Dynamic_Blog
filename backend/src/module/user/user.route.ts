import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
const router = Router();
router.post(
  "/register",
  validateRequest(UserValidation.register),
  UserController.register
);
router.post(
  "/login",
  validateRequest(UserValidation.login),
  UserController.login
);
router.post("/logout", UserController.logout);
export const authRoutes = router;
const userRouter = Router();
userRouter.get("/profile", auth, UserController.getProfile);
userRouter.patch(
  "/profile",
  auth,
  validateRequest(UserValidation.updateProfile),
  UserController.updateProfile
);
export default userRouter;
