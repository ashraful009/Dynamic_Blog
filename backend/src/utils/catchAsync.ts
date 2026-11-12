import { Request, Response, NextFunction, RequestHandler } from "express";
const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
    const handler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
    if (fn.name) {
      Object.defineProperty(handler, "name", { value: fn.name, configurable: true });
    }
    return handler;
  };
export default catchAsync;
