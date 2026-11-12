import { Request, Response, CookieOptions } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { UserService } from "./user.service";
import { AuthRequest } from "../../middleware/auth";
import config from "../../config";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  path: "/",
};

const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await UserService.login(req.body);
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: { user },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
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
  login,
  logout,
  getProfile,
  updateProfile,
};
