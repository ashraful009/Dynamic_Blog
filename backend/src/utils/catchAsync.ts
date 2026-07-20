import { Request, Response, NextFunction, RequestHandler } from "express";
const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
export default catchAsync;
