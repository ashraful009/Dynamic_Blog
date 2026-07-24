import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { UserService } from "./user.service";
import { AuthRequest } from "../../middleware/auth";
import config from "../../config";
const register = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await UserService.register(req.body);
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: { user },
  });
});
const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await UserService.login(req.body);
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: { user },
  });
});
const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("token");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successful",
    data: null,
  });
});
const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await UserService.getProfile(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});
const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await UserService.updateProfile(userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});
export const UserController = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};
