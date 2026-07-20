import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { HomepageService } from "./homepage.service";
const getHomepageData = catchAsync(async (req: Request, res: Response) => {
  const result = await HomepageService.getHomepageData();
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
