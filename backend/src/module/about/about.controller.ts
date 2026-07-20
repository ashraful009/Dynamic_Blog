import { Request, Response } from "express";
import { AboutService } from "./about.service";
import sendResponse from "../../response/sendResponse";

const getAboutPage = async (req: Request, res: Response) => {
  const data = await AboutService.getAboutPage();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About page data retrieved successfully",
    data,
  });
};

const updateAboutPage = async (req: Request, res: Response) => {
  const data = await AboutService.updateAboutPage(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "About page updated successfully",
    data,
  });
};

export const AboutController = {
  getAboutPage,
  updateAboutPage,
};
