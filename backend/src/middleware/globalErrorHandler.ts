import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages: { path: string; message: string }[];
  stack?: string;
}
const globalErrorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorMessages: { path: string; message: string }[] = [];
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = [{ path: "", message: err.message }];
  }
  else if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;
    if (prismaError.code === "P2002") {
      statusCode = 409;
      const target = prismaError.meta?.target as string[];
      message = `Duplicate entry for: ${target?.join(", ") || "unknown field"}`;
      errorMessages = [{ path: target?.[0] || "", message }];
    } else if (prismaError.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      errorMessages = [{ path: "", message }];
    } else {
      message = "Database error";
      errorMessages = [{ path: "", message: prismaError.message }];
    }
  }
  else if (err.name === "PrismaClientValidationError") {
    statusCode = 400;
    message = "Invalid data provided";
    errorMessages = [{ path: "", message: err.message }];
  }
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorMessages = [{ path: "", message: "Token is not valid" }];
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorMessages = [{ path: "", message: "Token has expired, please login again" }];
  }
  else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation error";
    const zodError = err as any;
    errorMessages = zodError.issues?.map((issue: any) => ({
      path: issue.path?.join(".") || "",
      message: issue.message,
    })) || [];
  }
  else {
    message = err.message || message;
    errorMessages = [{ path: "", message }];
  }
  const errorResponse: ErrorResponse = {
    success: false,
    statusCode,
    message,
    errorMessages,
  };
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Error:", {
      statusCode,
      message,
      stack: err.stack,
    });
  }
  res.status(statusCode).json(errorResponse);
};
export default globalErrorHandler;
