import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../response/sendResponse";
import { SiteSettingsService } from "./site-settings.service";
const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteSettingsService.getSettings();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site settings retrieved successfully",
    data: result,
  });
});
const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteSettingsService.updateSettings(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site settings updated successfully",
    data: result,
  });
});
export const SiteSettingsController = {
  getSettings,
  updateSettings,
};
