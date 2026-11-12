import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { HomepageService } from "./homepage.service";

const getHomepageData = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await HomepageService.getHomepageData({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Homepage data retrieved successfully",
    data: result,
  });
});

export const HomepageController = {
  getHomepageData,
};
