import { Response } from "express";
type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T | null;
};
const sendResponse = <T>(res: Response, data: ApiResponse<T>): void => {
  const responseData: ApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data ?? null,
  };
  res.status(data.statusCode).json(responseData);
};
export default sendResponse;
