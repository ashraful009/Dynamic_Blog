import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { ApiError } from "./globalErrorHandler";
import prisma from "../db";
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
const auth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new ApiError(401, "Access denied. No token provided.");
    }
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists.");
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid token."));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Token expired. Please login again."));
    } else {
      next(error);
    }
  }
};
const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action.")
      );
    }
    next();
  };
};
export { auth, authorize };
