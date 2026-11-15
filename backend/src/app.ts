import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRoutes, { authRoutes } from "./module/user/user.route";
import postRoutes from "./module/post/post.route";
import mediaRoutes from "./module/media/media.route";
import siteSettingsRoutes from "./module/site-settings/site-settings.route";
import categoryRoutes from "./module/category/category.route";
import tagRoutes from "./module/tag/tag.route";
import subscriberRoutes from "./module/subscriber/subscriber.route";
import homepageRoutes from "./module/homepage/homepage.route";
import aboutRoutes from "./module/about/about.route";
import commentRoutes from "./module/comment/comment.route";

const app: Application = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-src": [
          "'self'",
          "https://res.cloudinary.com",
          "https://www.youtube-nocookie.com",
          "https://www.youtube.com",
        ],
        "child-src": [
          "'self'",
          "https://res.cloudinary.com",
          "https://www.youtube-nocookie.com",
          "https://www.youtube.com",
        ],
        "img-src": ["'self'", "data:", "https://i.ytimg.com", "https://res.cloudinary.com"],
        "connect-src": ["'self'", "https://res.cloudinary.com"],
      },
    },
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// CSRF Defense middleware for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin && !config.cors.allowedOrigins.includes(origin)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Forbidden: Invalid request origin",
      });
      return;
    }
  }
  next();
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api/v1/", limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many authentication attempts, please try again later.",
  },
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", commentRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/site-settings", siteSettingsRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/subscribers", subscriberRoutes);
app.use("/api/v1/homepage", homepageRoutes);
app.use("/api/v1/about", aboutRoutes);
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "🟢 Zibon-Vlog API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Zibon-Vlog API",
  });
});
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "API route not found",
  });
});
app.use(globalErrorHandler);
export default app;
